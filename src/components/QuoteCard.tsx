import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote?: string;
  author?: string;
  className?: string;
}

// Default quotes for mental health and wellness
const defaultQuotes = [
  {
    quote: "You are stronger than you think and more capable than you imagine.",
    author: "Anonymous",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
    author: "Noam Shpancer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "Your current situation is not your final destination. The best is yet to come.",
    author: "Anonymous",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "Healing takes time, and asking for help is a courageous step.",
    author: "Mariska Hargitay",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious. Having feelings doesn't make you a negative person.",
    author: "Lori Deschene",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "Progress, not perfection, is the goal.",
    author: "Anonymous",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  }
];

export function QuoteCard({ quote, author, className }: QuoteCardProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use provided quote/author or fall back to default quotes
  const displayQuote = quote || defaultQuotes[currentQuoteIndex].quote;
  const displayAuthor = author || defaultQuotes[currentQuoteIndex].author;
  const displayAvatar = defaultQuotes[currentQuoteIndex]?.avatar;

  const handleNextQuote = () => {
    if (quote && author) return; // Don't rotate if specific quote is provided
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % defaultQuotes.length);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden bg-gradient-primary border-primary/30 shadow-glow hover:shadow-glow hover:scale-105 hover:-translate-y-1 transition-all duration-500 backdrop-blur-sm cursor-pointer hover-scale w-full",
        className
      )}
    >
      <CardContent className="p-8 min-h-[200px]">
        {/* Icon */}
        <div className="absolute top-6 right-6 opacity-70">
          <Lightbulb className="h-6 w-6 text-white/70 drop-shadow-sm" />
        </div>
        
        {/* Quote Content */}
        <div 
          className={cn(
            "space-y-4 transition-all duration-300",
            isAnimating ? "opacity-0 transform translate-y-2" : "opacity-100 transform translate-y-0"
          )}
        >
          <blockquote className="text-xl font-semibold leading-relaxed text-white tracking-wide">
            <span className="text-2xl text-white/60 font-serif">"</span>
            {displayQuote}
            <span className="text-2xl text-white/60 font-serif">"</span>
          </blockquote>
          
          <div className="flex items-center justify-between">
            <cite className="text-base font-medium text-white/80 not-italic tracking-wide">
              — {displayAuthor}
            </cite>
            
            {/* Author Avatar - LinkedIn style */}
            {displayAvatar && (
              <Avatar className="h-32 w-32 border-2 border-white/20 shadow-lg">
                <AvatarImage 
                  src={displayAvatar} 
                  alt={`${displayAuthor} profile`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-white/20 text-white font-semibold text-2xl">
                  {displayAuthor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
        
        {/* Next Quote Button - only show if using default quotes */}
        {!quote && !author && (
          <div className="mt-8 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextQuote}
              className="text-white/80 hover:text-white hover:bg-white/15 group rounded-full px-4 py-2 transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40"
              aria-label="Next quote"
            >
              Next Quote
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}