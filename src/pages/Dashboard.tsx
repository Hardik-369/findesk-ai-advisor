
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Receipt, Bot } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();

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

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calculator className="h-6 w-6 text-primary" />
                <CardTitle>Depreciation Calculator</CardTitle>
              </div>
              <CardDescription>
                Calculate asset depreciation with AI optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <CardTitle>Loan EMI Scheduler</CardTitle>
              </div>
              <CardDescription>
                Smart loan management and planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Receipt className="h-6 w-6 text-primary" />
                <CardTitle>Tax Provision Estimator</CardTitle>
              </div>
              <CardDescription>
                Intelligent tax planning and optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-hero text-white">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6" />
              <CardTitle>AI Financial Assistant</CardTitle>
            </div>
            <CardDescription className="text-white/80">
              Ask questions about your finances and get intelligent insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full">
              Coming Soon - AI Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
