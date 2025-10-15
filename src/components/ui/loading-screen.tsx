import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ 
  message = "Loading your wellness journey...", 
  className 
}: LoadingScreenProps) {
  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20",
      className
    )}>
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">MAITRI</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}