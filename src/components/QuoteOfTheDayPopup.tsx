import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, X, Calendar, Star } from "lucide-react";
import { useQuoteOfTheDay } from "@/hooks/useQuoteOfTheDay";
import { Badge } from "@/components/ui/badge";

export function QuoteOfTheDayPopup() {
  const { currentQuote, showPopup, dismissPopup } = useQuoteOfTheDay();
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      dismissPopup();
      setIsAnimatingOut(false);
    }, 300);
  };

  if (!currentQuote || !showPopup) return null;

  return (
    <Dialog open={showPopup} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-md p-0 bg-gradient-primary border-primary/30 shadow-glow overflow-hidden"
        aria-describedby="quote-description"
      >
        <div className="relative">
          {/* Header */}
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Quote of the Day
                </DialogTitle>
                <DialogDescription className="text-white/70 text-xs">
                  Daily inspiration to start your day
                </DialogDescription>
                <div className="flex items-center space-x-1 mt-1">
                  <Calendar className="h-3 w-3 text-white/70" />
                  <span className="text-white/70 text-xs">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Quote content */}
          <div 
            id="quote-description"
            className={`p-4 transition-all duration-300 ${
              isAnimatingOut ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
            }`}
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-300 mt-1 flex-shrink-0" />
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                    Daily Inspiration
                  </Badge>
                </div>
                
                <blockquote className="text-sm font-medium leading-relaxed text-white mb-4">
                  <span className="text-lg text-white/60 font-serif">"</span>
                  {currentQuote.quote}
                  <span className="text-lg text-white/60 font-serif">"</span>
                </blockquote>
                
                <cite className="text-sm font-medium text-white/80 not-italic">
                  — {currentQuote.author}
                </cite>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="glass"
                    size="sm"
                    className="flex-1 hover:bg-white/30"
                    onClick={handleClose}
                  >
                    Start My Day
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/20"
                    onClick={() => {
                      navigator.share?.({
                        title: 'Quote of the Day - MAITRI',
                        text: `"${currentQuote.quote}" - ${currentQuote.author}`,
                      }).catch(() => {
                        // Fallback for browsers that don't support Web Share API
                        navigator.clipboard?.writeText(`"${currentQuote.quote}" - ${currentQuote.author}`);
                      });
                    }}
                  >
                    Share Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        </div>
      </DialogContent>
    </Dialog>
  );
}