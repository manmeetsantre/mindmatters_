import { useState, useEffect } from "react";

interface DailyQuote {
  quote: string;
  author: string;
  date: string;
}

const inspirationalQuotes: Omit<DailyQuote, 'date'>[] = [
  {
    quote: "You are stronger than you think and more capable than you imagine.",
    author: "Anonymous"
  },
  {
    quote: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
    author: "Noam Shpancer"
  },
  {
    quote: "Your current situation is not your final destination. The best is yet to come.",
    author: "Anonymous"
  },
  {
    quote: "Healing takes time, and asking for help is a courageous step.",
    author: "Mariska Hargitay"
  },
  {
    quote: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious. Having feelings doesn't make you a negative person.",
    author: "Lori Deschene"
  },
  {
    quote: "Progress, not perfection, is the goal.",
    author: "Anonymous"
  },
  {
    quote: "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.",
    author: "Anonymous"
  },
  {
    quote: "You are not your illness. You have an individual story to tell. You have a name, a history, a personality. Staying yourself is part of the battle.",
    author: "Julian Seifter"
  },
  {
    quote: "Sometimes the people around you won't understand your journey. They don't need to, it's not for them.",
    author: "Joubert Botha"
  },
  {
    quote: "Self-care is not selfish. You cannot serve from an empty vessel.",
    author: "Eleanor Brown"
  }
];

export function useQuoteOfTheDay() {
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastShownDate = localStorage.getItem('lastQuoteDate');
    
    // Check if we already showed quote today
    if (lastShownDate === today) {
      // Get stored quote for today
      const storedQuote = localStorage.getItem('todayQuote');
      if (storedQuote) {
        setCurrentQuote(JSON.parse(storedQuote));
      }
      return;
    }

    // Generate new quote for today
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % inspirationalQuotes.length;
    const todayQuote: DailyQuote = {
      ...inspirationalQuotes[quoteIndex],
      date: today
    };

    setCurrentQuote(todayQuote);
    setShowPopup(true);
    
    // Store in localStorage
    localStorage.setItem('lastQuoteDate', today);
    localStorage.setItem('todayQuote', JSON.stringify(todayQuote));
  }, []);

  const dismissPopup = () => {
    setShowPopup(false);
  };

  const showQuoteAgain = () => {
    setShowPopup(true);
  };

  return {
    currentQuote,
    showPopup,
    dismissPopup,
    showQuoteAgain
  };
}