
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Receipt, Bot, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DepreciationCalculator } from '@/components/DepreciationCalculator';
import { LoanCalculator } from '@/components/LoanCalculator';
import { TaxCalculator } from '@/components/TaxCalculator';
import { AIChat } from '@/components/AIChat';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [summary, setSummary] = useState({
    totalAssets: 0,
    totalLoans: 0,
    totalEMI: 0,
    taxLiability: 0
  });

  const loadFinancialSummary = async () => {
    if (!user) return;
    
    try {
      // Get assets summary
      const { data: assets } = await supabase
        .from('assets')
        .select('purchase_value')
        .eq('user_id', user.id);
      
      const totalAssets = assets?.reduce((sum, asset) => sum + Number(asset.purchase_value), 0) || 0;
      
      // Get loans summary
      const { data: loans } = await supabase
        .from('loans')
        .select('principal_amount, emi_amount')
        .eq('user_id', user.id);
      
      const totalLoans = loans?.reduce((sum, loan) => sum + Number(loan.principal_amount), 0) || 0;
      const totalEMI = loans?.reduce((sum, loan) => sum + Number(loan.emi_amount || 0), 0) || 0;
      
      // Get tax summary
      const { data: taxRecords } = await supabase
        .from('tax_records')
        .select('calculated_tax')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const taxLiability = taxRecords?.[0]?.calculated_tax || 0;
      
      setSummary({
        totalAssets,
        totalLoans,
        totalEMI,
        taxLiability
      });
    } catch (error) {
      console.error('Error loading financial summary:', error);
    }
  };

  useEffect(() => {
    loadFinancialSummary();

    // Listen for data updates from other components
    const handleDataUpdate = () => {
      loadFinancialSummary();
    };

    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Layout showAuth={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">₹{summary.totalAssets.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">₹{summary.totalLoans.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly EMI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{summary.totalEMI.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tax Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">₹{summary.taxLiability.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="depreciation">
              <Calculator className="h-4 w-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="loans">
              <TrendingUp className="h-4 w-4 mr-2" />
              Loans
            </TabsTrigger>
            <TabsTrigger value="tax">
              <Receipt className="h-4 w-4 mr-2" />
              Tax
            </TabsTrigger>
            <TabsTrigger value="chat">
              <Bot className="h-4 w-4 mr-2" />
              AI Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Access your financial tools quickly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Asset Depreciation
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Plan Loan EMI Schedule
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Receipt className="h-4 w-4 mr-2" />
                    Estimate Tax Provision
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>AI Financial Insights</CardTitle>
                  <CardDescription>
                    Get personalized financial advice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">💡 Based on your portfolio, consider diversifying your 80C investments for better tax optimization.</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">📈 Your current EMI-to-income ratio is healthy. You can consider additional investments.</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">💰 Review your asset depreciation methods to maximize tax benefits.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="depreciation">
            <DepreciationCalculator />
          </TabsContent>

          <TabsContent value="loans">
            <LoanCalculator />
          </TabsContent>

          <TabsContent value="tax">
            <TaxCalculator />
          </TabsContent>

          <TabsContent value="chat">
            <AIChat />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
