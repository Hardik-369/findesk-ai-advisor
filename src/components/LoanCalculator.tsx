
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAI } from '@/hooks/useAI';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Download, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface Loan {
  loan_name: string;
  loan_type: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  start_date: string;
  emi_amount?: number;
  total_interest?: number;
  total_amount?: number;
}

export const LoanCalculator = () => {
  const { user } = useAuth();
  const { getAIResponse, loading: aiLoading } = useAI();
  const { toast } = useToast();
  const [loan, setLoan] = useState<Loan>({
    loan_name: '',
    loan_type: 'personal',
    principal_amount: 0,
    interest_rate: 0,
    tenure_months: 12,
    start_date: ''
  });
  const [schedule, setSchedule] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const calculateEMI = () => {
    const P = loan.principal_amount;
    const r = loan.interest_rate / 100 / 12;
    const n = loan.tenure_months;
    
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - P;
    
    setLoan({
      ...loan,
      emi_amount: emi,
      total_interest: totalInterest,
      total_amount: totalAmount
    });
    
    // Generate amortization schedule
    const amortizationSchedule = [];
    let remainingBalance = P;
    
    for (let month = 1; month <= Math.min(n, 12); month++) {
      const interestPayment = remainingBalance * r;
      const principalPayment = emi - interestPayment;
      remainingBalance -= principalPayment;
      
      amortizationSchedule.push({
        month,
        emi: emi,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
    }
    
    setSchedule(amortizationSchedule);
  };

  const getAISuggestion = async () => {
    const context = `Loan: ₹${loan.principal_amount}, Interest: ${loan.interest_rate}%, Tenure: ${loan.tenure_months} months, EMI: ₹${loan.emi_amount?.toFixed(2)}`;
    const prompt = "Suggest ways to reduce interest burden and optimize this loan. Include strategies for prepayment and refinancing.";
    
    const response = await getAIResponse(prompt, context, 'loan');
    if (response) {
      setAiSuggestion(response);
    }
  };

  const saveLoan = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert([{
          ...loan,
          user_id: user.id,
          ai_suggestions: { suggestion: aiSuggestion }
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Loan Saved",
        description: "Loan details have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving loan:', error);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Loan EMI Report', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Loan: ${loan.loan_name}`, 20, 50);
    doc.text(`Principal: ₹${loan.principal_amount}`, 20, 60);
    doc.text(`Interest Rate: ${loan.interest_rate}%`, 20, 70);
    doc.text(`Tenure: ${loan.tenure_months} months`, 20, 80);
    doc.text(`EMI: ₹${loan.emi_amount?.toFixed(2)}`, 20, 90);
    doc.text(`Total Interest: ₹${loan.total_interest?.toFixed(2)}`, 20, 100);
    
    let yPos = 120;
    doc.text('Amortization Schedule (First 12 months):', 20, yPos);
    yPos += 20;
    
    schedule.forEach((month) => {
      doc.text(`Month ${month.month}: EMI ₹${month.emi.toFixed(2)}, Principal ₹${month.principal.toFixed(2)}, Interest ₹${month.interest.toFixed(2)}`, 20, yPos);
      yPos += 10;
    });
    
    doc.save(`${loan.loan_name}-emi-report.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(schedule);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Amortization Schedule');
    XLSX.writeFile(wb, `${loan.loan_name}-amortization.xlsx`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Loan EMI Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loanName">Loan Name</Label>
              <Input
                id="loanName"
                value={loan.loan_name}
                onChange={(e) => setLoan({ ...loan, loan_name: e.target.value })}
                placeholder="Enter loan name"
              />
            </div>
            <div>
              <Label>Loan Type</Label>
              <Select value={loan.loan_type} onValueChange={(value) => setLoan({ ...loan, loan_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Loan</SelectItem>
                  <SelectItem value="home">Home Loan</SelectItem>
                  <SelectItem value="car">Car Loan</SelectItem>
                  <SelectItem value="business">Business Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="principal">Principal Amount (₹)</Label>
              <Input
                id="principal"
                type="number"
                value={loan.principal_amount}
                onChange={(e) => setLoan({ ...loan, principal_amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="rate">Interest Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={loan.interest_rate}
                onChange={(e) => setLoan({ ...loan, interest_rate: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="tenure">Tenure (Months)</Label>
              <Input
                id="tenure"
                type="number"
                value={loan.tenure_months}
                onChange={(e) => setLoan({ ...loan, tenure_months: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={loan.start_date}
                onChange={(e) => setLoan({ ...loan, start_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={calculateEMI}>Calculate EMI</Button>
            <Button onClick={getAISuggestion} disabled={aiLoading} variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Suggestion
            </Button>
            <Button onClick={saveLoan} variant="success">Save Loan</Button>
          </div>

          {loan.emi_amount && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Monthly EMI</p>
                <p className="text-2xl font-bold text-primary">₹{loan.emi_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-xl font-semibold text-warning">₹{loan.total_interest?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-xl font-semibold">₹{loan.total_amount?.toFixed(2)}</p>
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
              AI Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{aiSuggestion}</p>
          </CardContent>
        </Card>
      )}

      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Amortization Schedule (First 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Month</th>
                    <th className="border border-border p-2 text-left">EMI (₹)</th>
                    <th className="border border-border p-2 text-left">Principal (₹)</th>
                    <th className="border border-border p-2 text-left">Interest (₹)</th>
                    <th className="border border-border p-2 text-left">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((month) => (
                    <tr key={month.month}>
                      <td className="border border-border p-2">{month.month}</td>
                      <td className="border border-border p-2">₹{month.emi.toFixed(2)}</td>
                      <td className="border border-border p-2">₹{month.principal.toFixed(2)}</td>
                      <td className="border border-border p-2">₹{month.interest.toFixed(2)}</td>
                      <td className="border border-border p-2">₹{month.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={exportPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={exportExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
