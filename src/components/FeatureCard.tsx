import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: string;
  gradient?: "primary" | "wellness" | "calm";
  onAction?: () => void;
}

export function FeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  action, 
  gradient = "primary", 
  onAction 
}: FeatureCardProps) {
  const gradientClass = {
    primary: "bg-gradient-primary",
    wellness: "bg-gradient-wellness", 
    calm: "bg-gradient-calm"
  }[gradient];

  return (
    <Card className={cn(
      "group hover:shadow-card transition-all duration-300 hover:scale-[1.02] overflow-hidden",
      "animate-fade-in border-l-4 border-l-transparent hover:border-l-primary",
      "floaty-card"
    )}>
      <div className={`h-1 ${gradientClass}`} />
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "p-3 rounded-xl shadow-soft transition-all duration-300 group-hover:scale-110",
            gradientClass,
            "text-white"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>
        {action && onAction && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAction}
            className={cn(
              "w-full transition-all duration-300 hover:shadow-soft",
              "group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
            )}
            aria-label={`${action} for ${title}`}
          >
            {action}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}