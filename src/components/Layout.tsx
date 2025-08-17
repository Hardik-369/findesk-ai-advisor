import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface LayoutProps {
  children?: React.ReactNode;
  showAuth?: boolean;
}

export const Layout = ({ children, showAuth = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="FinAI Desk" className="h-8 w-8" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                FinAI Desk
              </span>
            </div>
            
            {showAuth && (
              <div className="flex items-center space-x-4">
                <Button variant="ghost">Sign In</Button>
                <Button variant="hero">Get Started</Button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
};