import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface IssueCardProps {
  title: string;
  icon: LucideIcon;
  bulletPoints: string[];
  actionLabel: string;
  onAction: () => void;
  gradient?: "primary" | "wellness" | "calm";
}

export function IssueCard({ 
  title, 
  icon: Icon, 
  bulletPoints, 
  actionLabel, 
  onAction,
  gradient = "primary"
}: IssueCardProps) {
  const gradients = {
    primary: "bg-gradient-primary",
    wellness: "bg-gradient-wellness",
    calm: "bg-gradient-calm"
  };

  return (
    <Card className="hover:shadow-glow transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <CardHeader>
        <div className={`${gradients[gradient]} p-3 rounded-full w-fit mb-3`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {bulletPoints.map((point, index) => (
            <li key={index} className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span className="text-sm text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>
        <Button 
          onClick={onAction} 
          className="w-full border border-border relative btn-sweep-lavender"
          variant="secondary"
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}