import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 px-4">
      <Card className="w-full max-w-md text-center shadow-card hover:shadow-glow transition-all duration-300">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-4xl font-bold text-foreground">404</CardTitle>
          <CardDescription className="text-lg">
            Oops! This page seems to have wandered off...
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Don't worry, even the best explorers take wrong turns sometimes. 
            Let's get you back to a safe space.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-gradient-primary hover:opacity-90">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/resources">
                <Search className="mr-2 h-4 w-4" />
                Browse Resources
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="w-full"
              onClick={() => window.history.back()}
            >
              <span className="cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </span>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground pt-4 border-t border-border">
            If you believe this is an error, please contact our support team
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
