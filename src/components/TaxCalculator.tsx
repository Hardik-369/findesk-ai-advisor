import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAI } from '@/hooks/useAI';
import { useToast } from '@/hooks/use-toast';
import { Receipt, Download, Sparkles, Upload } from 'lucide-react';
import jsPDF from 'jspdf';

interface TaxRecord {
  financial_year: string;
  taxable_income: number;
  standard_deduction: number;
  section_80c_investments: number;
  house_rent_allowance: number;
  leave_travel_allowance: number;
  section_80d_medical: number;
  other_deductions: number;
  calculated_tax?: number;
  tax_payable?: number;
}

export const TaxCalculator = () => {
  const { user } = useAuth();
  const { getAIResponse, loading: aiLoading } = useAI();
  const { toast } = useToast();
  const [taxData, setTaxData] = useState<TaxRecord>({
    financial_year: '2024-25',
    taxable_income: 0,
    standard_deduction: 50000,
    section_80c_investments: 0,
    house_rent_allowance: 0,
    leave_travel_allowance: 0,
    section_80d_medical: 0,
    other_deductions: 0
  });
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTax = () => {
    if (!taxData.taxable_income) {
      toast({
        title: "Missing Information",
        description: "Please enter taxable income.",
        variant: "destructive"
      });
      return;
    }

    const totalDeductions = taxData.standard_deduction + taxData.section_80c_investments + 
                           taxData.house_rent_allowance + taxData.leave_travel_allowance + 
                           taxData.section_80d_medical + taxData.other_deductions;
    
    const taxableIncome = Math.max(0, taxData.taxable_income - totalDeductions);
    let tax = 0;
    
    // New tax regime calculation (simplified)
    if (taxableIncome > 300000) {
      if (taxableIncome <= 600000) {
        tax = (taxableIncome - 300000) * 0.05;
      } else if (taxableIncome <= 900000) {
        tax = 15000 + (taxableIncome - 600000) * 0.10;
      } else if (taxableIncome <= 1200000) {
        tax = 45000 + (taxableIncome - 900000) * 0.15;
      } else if (taxableIncome <= 1500000) {
        tax = 90000 + (taxableIncome - 1200000) * 0.20;
      } else {
        tax = 150000 + (taxableIncome - 1500000) * 0.30;
      }
    }
    
    // Add cess
    const cess = tax * 0.04;
    const totalTax = tax + cess;
    
    setTaxData({
      ...taxData,
      calculated_tax: totalTax,
      tax_payable: totalTax
    });
  };

  const saveTaxRecord = async () => {
    if (!user || !taxData.taxable_income || taxData.calculated_tax === undefined) {
      toast({
        title: "Missing Information",
        description: "Please calculate tax first and fill in required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tax_records')
        .insert([{
          ...taxData,
          user_id: user.id,
          ai_suggestions: { suggestion: aiSuggestion }
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Tax Record Saved",
        description: "Tax calculation has been saved successfully.",
      });

      // Reset form
      setTaxData({
        financial_year: '2024-25',
        taxable_income: 0,
        standard_deduction: 50000,
        section_80c_investments: 0,
        house_rent_allowance: 0,
        leave_travel_allowance: 0,
        section_80d_medical: 0,
        other_deductions: 0
      });
      setAiSuggestion('');

      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    } catch (error) {
      console.error('Error saving tax record:', error);
      toast({
        title: "Error",
        description: "Failed to save tax record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestion = async () => {
    const context = `Income: ₹${taxData.taxable_income}, 80C: ₹${taxData.section_80c_investments}, HRA: ₹${taxData.house_rent_allowance}, Medical: ₹${taxData.section_80d_medical}`;
    const prompt = "Suggest tax-saving strategies and deductions to minimize tax liability legally. Include specific investment options under 80C, 80D, and other sections.";
    
    const response = await getAIResponse(prompt, context, 'tax');
    if (response) {
      setAiSuggestion(response);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Tax Provision Report', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Financial Year: ${taxData.financial_year}`, 20, 50);
    doc.text(`Taxable Income: ₹${taxData.taxable_income}`, 20, 60);
    doc.text(`Standard Deduction: ₹${taxData.standard_deduction}`, 20, 70);
    doc.text(`Section 80C: ₹${taxData.section_80c_investments}`, 20, 80);
    doc.text(`HRA: ₹${taxData.house_rent_allowance}`, 20, 90);
    doc.text(`Medical (80D): ₹${taxData.section_80d_medical}`, 20, 100);
    doc.text(`Other Deductions: ₹${taxData.other_deductions}`, 20, 110);
    
    doc.setFontSize(14);
    doc.text(`Calculated Tax: ₹${taxData.calculated_tax?.toFixed(2)}`, 20, 130);
    doc.text(`Tax Payable: ₹${taxData.tax_payable?.toFixed(2)}`, 20, 140);
    
    if (aiSuggestion) {
      let yPos = 160;
      doc.setFontSize(12);
      doc.text('AI Tax Optimization Suggestions:', 20, yPos);
      yPos += 10;
      const splitText = doc.splitTextToSize(aiSuggestion, 170);
      doc.text(splitText, 20, yPos);
    }
    
    doc.save(`tax-provision-${taxData.financial_year}.pdf`);
  };

  const handleForm16Upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Form 16 Upload",
        description: "Form 16 processing will be implemented soon.",
        variant: "default"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Tax Provision Estimator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Financial Year</Label>
              <Input
                id="year"
                value={taxData.financial_year}
                onChange={(e) => setTaxData({ ...taxData, financial_year: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="income">Taxable Income (₹) *</Label>
              <Input
                id="income"
                type="number"
                value={taxData.taxable_income || ''}
                onChange={(e) => setTaxData({ ...taxData, taxable_income: Number(e.target.value) })}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="standard">Standard Deduction (₹)</Label>
              <Input
                id="standard"
                type="number"
                value={taxData.standard_deduction}
                onChange={(e) => setTaxData({ ...taxData, standard_deduction: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="sec80c">Section 80C Investments (₹)</Label>
              <Input
                id="sec80c"
                type="number"
                value={taxData.section_80c_investments || ''}
                onChange={(e) => setTaxData({ ...taxData, section_80c_investments: Number(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="hra">House Rent Allowance (₹)</Label>
              <Input
                id="hra"
                type="number"
                value={taxData.house_rent_allowance || ''}
                onChange={(e) => setTaxData({ ...taxData, house_rent_allowance: Number(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="lta">Leave Travel Allowance (₹)</Label>
              <Input
                id="lta"
                type="number"
                value={taxData.leave_travel_allowance || ''}
                onChange={(e) => setTaxData({ ...taxData, leave_travel_allowance: Number(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="medical">Medical Insurance 80D (₹)</Label>
              <Input
                id="medical"
                type="number"
                value={taxData.section_80d_medical || ''}
                onChange={(e) => setTaxData({ ...taxData, section_80d_medical: Number(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="other">Other Deductions (₹)</Label>
              <Input
                id="other"
                type="number"
                value={taxData.other_deductions || ''}
                onChange={(e) => setTaxData({ ...taxData, other_deductions: Number(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <Label htmlFor="form16" className="cursor-pointer flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Form 16 (Optional)
            </Label>
            <Input
              id="form16"
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleForm16Upload}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">Upload your Form 16 to auto-fill tax details</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={calculateTax}>Calculate Tax</Button>
            <Button onClick={getAISuggestion} disabled={aiLoading} variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Suggestions
            </Button>
            <Button onClick={saveTaxRecord} disabled={loading} variant="success">
              {loading ? 'Saving...' : 'Save Record'}
            </Button>
          </div>

          {taxData.calculated_tax !== undefined && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Calculated Tax</p>
                <p className="text-2xl font-bold text-primary">₹{taxData.calculated_tax.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax Payable</p>
                <p className="text-xl font-semibold text-warning">₹{taxData.tax_payable?.toFixed(2)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {aiSuggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Tax Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{aiSuggestion}</p>
          </CardContent>
        </Card>
      )}

      {taxData.calculated_tax !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Export Tax Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={exportPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF Summary
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
