export const ruralQuotes = [
  {
    text: "Every small step forward is a victory, no matter how tough the journey from home feels.",
    author: "Dr. Anjali Sharma",
    category: "Resilience"
  },
  {
    text: "Your roots give you strength, even when you're far from the soil that nurtured you.",
    author: "Prof. Rajesh Kumar",
    category: "Identity"
  },
  {
    text: "The challenges of adapting to city life make you stronger and more capable than you realize.",
    author: "Dr. Priya Patel",
    category: "Growth"
  },
  {
    text: "Missing home is natural. It shows the depth of your connections and the love you carry.",
    author: "Counselor Amit Singh",
    category: "Homesickness"
  },
  {
    text: "Your unique perspective from rural India enriches the campus community in invaluable ways.",
    author: "Dr. Meera Reddy",
    category: "Self-worth"
  }
];

export const urbanQuotes = [
  {
    text: "Success isn't about being perfect; it's about learning to manage the pressure with grace.",
    author: "Dr. Vikram Mehta",
    category: "Performance"
  },
  {
    text: "In a world of constant connectivity, finding moments of solitude is an act of self-care.",
    author: "Prof. Neha Gupta",
    category: "Balance"
  },
  {
    text: "Competition can motivate, but collaboration creates lasting success and meaningful connections.",
    author: "Dr. Arjun Nair",
    category: "Relationships"
  },
  {
    text: "Your worth isn't measured by your achievements, but by your authenticity and kindness.",
    author: "Counselor Sanya Kapoor",
    category: "Self-worth"
  },
  {
    text: "Taking breaks isn't falling behind; it's ensuring you can go the distance.",
    author: "Dr. Rahul Verma",
    category: "Wellness"
  }
];

export function getDailyQuote(profile: 'rural' | 'urban') {
  const quotes = profile === 'rural' ? ruralQuotes : urbanQuotes;
  const today = new Date().toDateString();
  const index = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % quotes.length;
  return quotes[index];
}