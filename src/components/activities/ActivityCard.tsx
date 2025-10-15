import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, CheckCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  benefits: string[];
  icon: LucideIcon;
  color: string;
  recommendedFor?: string[];
  videoUrl?: string;
}

interface ActivityCardProps {
  activity: Activity;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
  onStartActivity?: (activity: Activity) => void;
  className?: string;
}

export function ActivityCard({ 
  activity, 
  isCompleted, 
  onToggleComplete, 
  onStartActivity,
  className 
}: ActivityCardProps) {
  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': 
        return "bg-success/10 text-success border-success/20";
      case 'Medium': 
        return "bg-warning/10 text-warning border-warning/20";
      case 'Hard': 
        return "bg-destructive/10 text-destructive border-destructive/20";
      default: 
        return "bg-muted text-muted-foreground";
    }
  };

  const Icon = activity.icon;

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300",
      "hover:scale-[1.02] animate-fade-in",
      isCompleted && "ring-2 ring-success bg-success/5",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={cn(
              "p-3 rounded-xl shadow-soft transition-all duration-300",
              "group-hover:scale-110 bg-gradient-to-br",
              activity.color === 'text-pink-500' && "from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800",
              activity.color === 'text-purple-500' && "from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
              activity.color === 'text-orange-500' && "from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800",
              activity.color === 'text-blue-500' && "from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
              activity.color === 'text-green-500' && "from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
              activity.color === 'text-emerald-500' && "from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800",
              activity.color === 'text-amber-500' && "from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800",
              activity.color === 'text-indigo-500' && "from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800",
              activity.color === 'text-cyan-500' && "from-cyan-100 to-cyan-200 dark:from-cyan-900 dark:to-cyan-800",
              activity.color === 'text-violet-500' && "from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800"
            )}>
              <Icon className={cn("h-6 w-6", activity.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                {activity.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge 
                  variant="outline"
                  className={getDifficultyStyle(activity.difficulty)}
                >
                  {activity.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {activity.duration}
                </div>
              </div>
            </div>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1 text-success">
              <CheckCircle className="h-5 w-5 fill-current" />
              <Star className="h-4 w-4 fill-current" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        <CardDescription className="text-sm leading-relaxed">
          {activity.description}
        </CardDescription>
        
        <div>
          <h4 className="text-sm font-semibold mb-2 text-foreground">Benefits:</h4>
          <div className="flex flex-wrap gap-1">
            {activity.benefits.slice(0, 3).map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {benefit}
              </Badge>
            ))}
            {activity.benefits.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{activity.benefits.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {activity.recommendedFor && activity.recommendedFor.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-foreground">Best for:</h4>
            <div className="flex flex-wrap gap-1">
              {activity.recommendedFor.map((rec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {rec}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onToggleComplete(activity.id)}
            variant={isCompleted ? "secondary" : "default"}
            className="flex-1"
            size="sm"
          >
            {isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed!
              </>
            ) : (
              "Mark Complete"
            )}
          </Button>
          
          {onStartActivity && (
            <Button 
              onClick={() => onStartActivity(activity)}
              variant="outline"
              size="sm"
              className="hover:bg-primary hover:text-primary-foreground"
            >
              Start
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}