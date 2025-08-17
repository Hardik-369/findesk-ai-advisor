
import { Layout } from "@/components/Layout";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calculator, TrendingUp, Receipt, Bot, BarChart3, FileText, Shield, Zap } from "lucide-react";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <Layout>
      <main className="container mx-auto px-4 lg:px-8 py-16">
        {/* Hero Section */}
        <section className="text-center space-y-8 mb-20">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              Accounting Solutions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Smart financial tools that leverage artificial intelligence to simplify depreciation calculations, 
              loan management, and tax planning for modern businesses.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={handleGetStarted} variant="hero" size="xl" className="min-w-48">
              {user ? 'Go to Dashboard' : 'Get Started Free'}
            </Button>
            <Button variant="outline" size="xl" className="min-w-48">
              Watch Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground pt-8">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-success" />
              <span>Bank-grade Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-warning" />
              <span>AI-Powered Insights</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Export Ready Reports</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Complete Financial Toolkit
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three powerful tools designed to streamline your accounting workflow and provide intelligent insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Calculator}
              title="Depreciation Calculator"
              description="Intelligent asset depreciation with AI-optimized methods"
              features={[
                "AI suggests optimal depreciation method",
                "5-year depreciation forecast",
                "Multiple asset category support",
                "Professional PDF reports"
              ]}
            />
            
            <FeatureCard
              icon={TrendingUp}
              title="Loan EMI Scheduler"
              description="Smart loan management and amortization planning"
              features={[
                "EMI calculation with payment schedule",
                "AI suggests better loan terms",
                "Interest savings analysis",
                "Export to PDF and Excel"
              ]}
            />
            
            <FeatureCard
              icon={Receipt}
              title="Tax Provision Estimator"
              description="Intelligent tax planning and deduction optimization"
              features={[
                "Form 16 auto-import and parsing",
                "AI-powered deduction suggestions",
                "Tax liability calculations",
                "Comprehensive tax summary reports"
              ]}
            />
          </div>
        </section>

        {/* AI Dashboard Teaser */}
        <section className="bg-gradient-hero rounded-2xl p-8 md:p-12 text-white text-center space-y-6 mt-20">
          <div className="flex justify-center">
            <div className="p-4 bg-white/20 rounded-full">
              <Bot className="h-12 w-12" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold">
            AI Financial Assistant
          </h3>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Get instant answers to questions like "How much EMI next month?" or "How to reduce tax this quarter?" 
            Your personal AI advisor understands your financial data.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm opacity-80">
            <BarChart3 className="h-4 w-4" />
            <span>Financial snapshot • AI-powered insights • Smart recommendations</span>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold">
              Ready to modernize your accounting?
            </h3>
            <p className="text-lg text-muted-foreground">
              Join thousands of businesses using AI to streamline their financial operations.
            </p>
            <Button onClick={handleGetStarted} variant="hero" size="xl">
              {user ? 'Go to Dashboard' : 'Start Your Free Trial'}
            </Button>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default HomePage;
