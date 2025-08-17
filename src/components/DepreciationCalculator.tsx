
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
import { Calculator, Download, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';

interface Asset {
  name: string;
  category: string;
  purchase_value: number;
  purchase_date: string;
  salvage_value: number;
  useful_life_years: number;
  depreciation_method: string;
}

export const DepreciationCalculator = () => {
  const { user } = useAuth();
  const { getAIResponse, loading: aiLoading } = useAI();
  const { toast } = useToast();
  const [asset, setAsset] = useState<Asset>({
    name: '',
    category: '',
    purchase_value: 0,
    purchase_date: '',
    salvage_value: 0,
    useful_life_years: 5,
    depreciation_method: 'straight_line'
  });
  const [forecast, setForecast] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const calculateDepreciation = () => {
    const years = [];
    const depreciableAmount = asset.purchase_value - asset.salvage_value;
    
    for (let year = 1; year <= 5; year++) {
      let yearlyDepreciation = 0;
      let bookValue = asset.purchase_value;
      
      if (asset.depreciation_method === 'straight_line') {
        yearlyDepreciation = depreciableAmount / asset.useful_life_years;
        bookValue = asset.purchase_value - (yearlyDepreciation * year);
      } else if (asset.depreciation_method === 'declining_balance') {
        const rate = 2 / asset.useful_life_years;
        bookValue = asset.purchase_value * Math.pow(1 - rate, year);
        yearlyDepreciation = year === 1 ? asset.purchase_value * rate : 
          (asset.purchase_value * Math.pow(1 - rate, year - 1)) - bookValue;
      }
      
      years.push({
        year,
        depreciation: Math.max(0, yearlyDepreciation),
        bookValue: Math.max(asset.salvage_value, bookValue)
      });
    }
    
    setForecast(years);
  };

  const getAISuggestion = async () => {
    const context = `Asset: ${asset.name}, Category: ${asset.category}, Value: ₹${asset.purchase_value}, Life: ${asset.useful_life_years} years`;
    const prompt = "Suggest the optimal depreciation method for this asset and explain the tax benefits.";
    
    const response = await getAIResponse(prompt, context, 'depreciation');
    if (response) {
      setAiSuggestion(response);
    }
  };

  const saveAsset = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([{
          ...asset,
          user_id: user.id,
          ai_reasoning: aiSuggestion
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Asset Saved",
        description: "Asset has been saved successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Depreciation Report', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Asset: ${asset.name}`, 20, 50);
    doc.text(`Category: ${asset.category}`, 20, 60);
    doc.text(`Purchase Value: ₹${asset.purchase_value}`, 20, 70);
    doc.text(`Method: ${asset.depreciation_method}`, 20, 80);
    
    let yPos = 100;
    doc.text('5-Year Forecast:', 20, yPos);
    yPos += 20;
    
    forecast.forEach((year, index) => {
      doc.text(`Year ${year.year}: Depreciation ₹${year.depreciation.toFixed(2)}, Book Value ₹${year.bookValue.toFixed(2)}`, 20, yPos);
      yPos += 10;
    });
    
    if (aiSuggestion) {
      yPos += 10;
      doc.text('AI Suggestions:', 20, yPos);
      yPos += 10;
      const splitText = doc.splitTextToSize(aiSuggestion, 170);
      doc.text(splitText, 20, yPos);
    }
    
    doc.save(`${asset.name}-depreciation-report.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Depreciation Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                value={asset.name}
                onChange={(e) => setAsset({ ...asset, name: e.target.value })}
                placeholder="Enter asset name"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={asset.category} onValueChange={(value) => setAsset({ ...asset, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="machinery">Machinery</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Purchase Value (₹)</Label>
              <Input
                id="value"
                type="number"
                value={asset.purchase_value}
                onChange={(e) => setAsset({ ...asset, purchase_value: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="date">Purchase Date</Label>
              <Input
                id="date"
                type="date"
                value={asset.purchase_date}
                onChange={(e) => setAsset({ ...asset, purchase_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="salvage">Salvage Value (₹)</Label>
              <Input
                id="salvage"
                type="number"
                value={asset.salvage_value}
                onChange={(e) => setAsset({ ...asset, salvage_value: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="life">Useful Life (Years)</Label>
              <Input
                id="life"
                type="number"
                value={asset.useful_life_years}
                onChange={(e) => setAsset({ ...asset, useful_life_years: Number(e.target.value) })}
              />
            </div>
          </div>
          
          <div>
            <Label>Depreciation Method</Label>
            <Select value={asset.depreciation_method} onValueChange={(value) => setAsset({ ...asset, depreciation_method: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight_line">Straight Line</SelectItem>
                <SelectItem value="declining_balance">Declining Balance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={calculateDepreciation}>Calculate</Button>
            <Button onClick={getAISuggestion} disabled={aiLoading} variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Get AI Suggestion
            </Button>
            <Button onClick={saveAsset} variant="success">Save Asset</Button>
          </div>
        </CardContent>
      </Card>

      {aiSuggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{aiSuggestion}</p>
          </CardContent>
        </Card>
      )}

      {forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>5-Year Depreciation Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Year</th>
                    <th className="border border-border p-2 text-left">Depreciation (₹)</th>
                    <th className="border border-border p-2 text-left">Book Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((year) => (
                    <tr key={year.year}>
                      <td className="border border-border p-2">{year.year}</td>
                      <td className="border border-border p-2">₹{year.depreciation.toFixed(2)}</td>
                      <td className="border border-border p-2">₹{year.bookValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={exportPDF} className="mt-4" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
