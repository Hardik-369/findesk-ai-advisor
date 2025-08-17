import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  comingSoon?: boolean;
}

export const FeatureCard = ({ icon: Icon, title, description, features, comingSoon }: FeatureCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-elegant group">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          variant={comingSoon ? "outline" : "default"} 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          disabled={comingSoon}
        >
          {comingSoon ? "Coming Soon" : "Learn More"}
        </Button>
      </CardContent>
      {comingSoon && (
        <div className="absolute top-4 right-4 bg-warning text-warning-foreground text-xs px-2 py-1 rounded-full font-medium">
          Soon
        </div>
      )}
    </Card>
  );
};