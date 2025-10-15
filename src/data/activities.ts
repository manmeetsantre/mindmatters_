import {
  Heart,
  Zap,
  Palette,
  Music,
  Dumbbell,
  Camera,
  BookOpen,
  Brain,
  Users,
  Gamepad2,
  Sunrise,
  Moon,
  Waves,
  TreePine,
  Coffee,
  Headphones
} from "lucide-react";
import { Activity } from "@/components/activities/ActivityCard";

export const activityCategories = {
  all: 'All Activities',
  mindfulness: 'Mindfulness & Meditation',
  creative: 'Creative Expression',
  physical: 'Physical Wellness',
  cognitive: 'Cognitive Training',
  social: 'Social Connection',
  relaxation: 'Rest & Relaxation'
} as const;

export const activities: Activity[] = [
  // Mindfulness & Meditation
  {
    id: 'breath-work',
    title: 'Astronaut Breathing Techniques',
    description: 'Specialized 4-7-8 breathing technique adapted for space conditions to reduce anxiety and promote instant calmness.',
    category: 'mindfulness',
    duration: '5-10 min',
    difficulty: 'Easy',
    benefits: ['Reduces anxiety', 'Improves focus', 'Promotes relaxation', 'Lowers heart rate'],
    icon: Heart,
    color: 'text-pink-500',
    videoUrl: 'https://youtu.be/I77hh5I69gA?si=wrV-MNiglXpPP_Bw',
    recommendedFor: ['Anxiety relief', 'Before spacewalks', 'Sleep preparation']
  },
  {
    id: 'body-scan',
    title: 'Zero-Gravity Body Scan',
    description: 'Progressive muscle relaxation adapted for microgravity environments to release tension.',
    category: 'mindfulness',
    duration: '15-25 min',
    difficulty: 'Medium',
    benefits: ['Reduces tension', 'Improves sleep', 'Increases awareness', 'Stress relief'],
    icon: Zap,
    color: 'text-purple-500',
    videoUrl: 'https://youtu.be/5mOZMxVKmiY?si=67NMCQ6llE_xBQ6U',
    recommendedFor: ['Pre-sleep routine', 'Chronic stress', 'Physical tension']
  },
  {
    id: 'morning-mindfulness',
    title: 'Mission Start Mindfulness',
    description: 'Start your mission day with intention through guided meditation and gratitude for space exploration.',
    category: 'mindfulness',
    duration: '10-15 min',
    difficulty: 'Easy',
    benefits: ['Positive mindset', 'Mental clarity', 'Emotional balance', 'Daily structure'],
    icon: Sunrise,
    color: 'text-amber-500',
    videoUrl: 'https://www.youtube.com/watch?v=2pZvHiGZHQQ',
    recommendedFor: ['Mission start routine', 'Goal setting', 'Productivity boost']
  },

  // Creative Expression
  {
    id: 'art-therapy',
    title: 'Space Art Therapy',
    description: 'Express emotions through free-form drawing, painting, or digital art creation inspired by cosmic themes.',
    category: 'creative',
    duration: '20-45 min',
    difficulty: 'Easy',
    benefits: ['Emotional expression', 'Stress relief', 'Self-discovery', 'Creative outlet'],
    icon: Palette,
    color: 'text-orange-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Emotional processing', 'Creative blocks', 'Self-expression']
  },
  {
    id: 'music-therapy',
    title: 'Cosmic Sound Healing',
    description: 'Listen to or create music inspired by space sounds to improve mood and emotional well-being.',
    category: 'creative',
    duration: '15-45 min',
    difficulty: 'Easy',
    benefits: ['Mood enhancement', 'Emotional regulation', 'Creativity boost', 'Stress reduction'],
    icon: Music,
    color: 'text-blue-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Mood regulation', 'Creative inspiration', 'Relaxation']
  },
  {
    id: 'creative-writing',
    title: 'Mission Log Writing',
    description: 'Explore thoughts and feelings through mission log entries, poetry, or space-themed storytelling.',
    category: 'creative',
    duration: '20-30 min',
    difficulty: 'Medium',
    benefits: ['Self-reflection', 'Emotional processing', 'Communication skills', 'Mental clarity'],
    icon: BookOpen,
    color: 'text-indigo-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Processing emotions', 'Self-discovery', 'Communication']
  },

  // Physical Wellness
  {
    id: 'yoga-flow',
    title: 'Zero-G Yoga Flow',
    description: 'Gentle yoga sequence adapted for microgravity combining movement with mindful breathing for flexibility and calm.',
    category: 'physical',
    duration: '20-45 min',
    difficulty: 'Medium',
    benefits: ['Flexibility', 'Stress reduction', 'Mind-body connection', 'Physical strength'],
    icon: Dumbbell,
    color: 'text-green-500',
    videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
    recommendedFor: ['Physical wellness', 'Stress relief', 'Morning energy']
  },
  {
    id: 'nature-walk',
    title: 'Virtual Earth Walk',
    description: 'Mindful virtual reality experience walking on Earth to connect with home and reduce stress through movement.',
    category: 'physical',
    duration: '15-60 min',
    difficulty: 'Easy',
    benefits: ['Vitamin D simulation', 'Mood boost', 'Physical activity', 'Home connection'],
    icon: TreePine,
    color: 'text-emerald-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Fresh air simulation', 'Exercise', 'Mood enhancement']
  },
  {
    id: 'desk-stretches',
    title: 'Console Yoga & Stretches',
    description: 'Simple stretches and movements you can do at your console station to release tension during long missions.',
    category: 'physical',
    duration: '5-15 min',
    difficulty: 'Easy',
    benefits: ['Posture improvement', 'Tension relief', 'Energy boost', 'Focus enhancement'],
    icon: Zap,
    color: 'text-green-500',
    videoUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw',
    recommendedFor: ['Mission breaks', 'Console work', 'Physical tension']
  },

  // Cognitive Training
  {
    id: 'gratitude-journal',
    title: 'Mission Gratitude Practice',
    description: 'Daily gratitude journaling to cultivate positive thinking and appreciation for the wonders of space exploration.',
    category: 'cognitive',
    duration: '10-15 min',
    difficulty: 'Easy',
    benefits: ['Positive mindset', 'Self-reflection', 'Emotional balance', 'Life satisfaction'],
    icon: BookOpen,
    color: 'text-amber-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Mission start routine', 'Positive thinking', 'Mental wellness']
  },
  {
    id: 'brain-training',
    title: 'Mission Brain Training',
    description: 'Engage in memory games, puzzles, or logic challenges to boost cognitive function for complex mission tasks.',
    category: 'cognitive',
    duration: '15-30 min',
    difficulty: 'Medium',
    benefits: ['Cognitive function', 'Problem-solving', 'Mental agility', 'Focus improvement'],
    icon: Brain,
    color: 'text-indigo-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Mission prep', 'Mental sharpness', 'Problem-solving']
  },
  {
    id: 'mindful-reading',
    title: 'Astronaut Reading Practice',
    description: 'Slow, intentional reading practice of mission manuals and scientific literature to improve focus and comprehension.',
    category: 'cognitive',
    duration: '20-40 min',
    difficulty: 'Easy',
    benefits: ['Focus improvement', 'Knowledge gain', 'Mental stimulation', 'Relaxation'],
    icon: BookOpen,
    color: 'text-blue-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Learning', 'Focus training', 'Relaxation']
  },

  // Social Connection
  {
    id: 'peer-support',
    title: 'Astronaut Support Network',
    description: 'Join online peer support discussions and share experiences with fellow astronauts across missions.',
    category: 'social',
    duration: '30-60 min',
    difficulty: 'Medium',
    benefits: ['Social connection', 'Peer support', 'Reduced isolation', 'Shared experiences'],
    icon: Users,
    color: 'text-cyan-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Social support', 'Shared experiences', 'Community']
  },
  {
    id: 'mindful-gaming',
    title: 'Mission Team Gaming',
    description: 'Play cooperative or mindfulness-based games with crew members for social connection and team building.',
    category: 'social',
    duration: '20-45 min',
    difficulty: 'Easy',
    benefits: ['Social interaction', 'Fun & enjoyment', 'Stress relief', 'Team building'],
    icon: Gamepad2,
    color: 'text-violet-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Social fun', 'Stress relief', 'Team building']
  },
  {
    id: 'study-buddy',
    title: 'Mission Buddy Session',
    description: 'Connect with crew members for collaborative mission planning and mutual support.',
    category: 'social',
    duration: '45-90 min',
    difficulty: 'Easy',
    benefits: ['Mission support', 'Social connection', 'Motivation', 'Accountability'],
    icon: Users,
    color: 'text-blue-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Mission support', 'Motivation', 'Social learning']
  },

  // Rest & Relaxation
  {
    id: 'tea-meditation',
    title: 'Zero-G Tea Ceremony',
    description: 'Slow, intentional tea drinking in microgravity as a form of meditation and self-care.',
    category: 'relaxation',
    duration: '15-25 min',
    difficulty: 'Easy',
    benefits: ['Mindfulness', 'Relaxation', 'Self-care', 'Present moment awareness'],
    icon: Coffee,
    color: 'text-amber-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Self-care', 'Mission break', 'Mindfulness']
  },
  {
    id: 'sound-bath',
    title: 'Cosmic Sound Bath',
    description: 'Immersive sound experience with healing frequencies and space-inspired sounds.',
    category: 'relaxation',
    duration: '20-45 min',
    difficulty: 'Easy',
    benefits: ['Deep relaxation', 'Stress relief', 'Mental clarity', 'Emotional healing'],
    icon: Headphones,
    color: 'text-purple-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Stress relief', 'Relaxation', 'Sleep preparation']
  },
  {
    id: 'evening-routine',
    title: 'Mission Wind-Down',
    description: 'Gentle evening routine combining relaxation techniques for better sleep during long space missions.',
    category: 'relaxation',
    duration: '25-40 min',
    difficulty: 'Easy',
    benefits: ['Better sleep', 'Stress relief', 'Relaxation', 'Daily closure'],
    icon: Moon,
    color: 'text-indigo-500',
    videoUrl: 'https://www.youtube.com/watch?v=8nTJBLP8TqE',
    recommendedFor: ['Sleep improvement', 'Pre-sleep routine', 'Stress relief']
  }
];

export const getActivitiesByCategory = (category: keyof typeof activityCategories) => {
  if (category === 'all') return activities;
  return activities.filter(activity => activity.category === category);
};

export const getRecommendedActivities = (mood?: string, timeAvailable?: number) => {
  let recommended = activities;

  // Filter by mood
  if (mood) {
    switch (mood) {
      case 'stressed':
        recommended = activities.filter(a =>
          a.category === 'mindfulness' ||
          a.category === 'relaxation' ||
          a.benefits.some(b => b.toLowerCase().includes('stress'))
        );
        break;
      case 'anxious':
        recommended = activities.filter(a =>
          a.benefits.some(b => b.toLowerCase().includes('anxiety')) ||
          a.category === 'mindfulness'
        );
        break;
      case 'low-energy':
        recommended = activities.filter(a =>
          a.category === 'physical' ||
          a.benefits.some(b => b.toLowerCase().includes('energy'))
        );
        break;
      case 'creative':
        recommended = activities.filter(a => a.category === 'creative');
        break;
    }
  }

  // Filter by available time
  if (timeAvailable) {
    recommended = recommended.filter(activity => {
      const maxTime = parseInt(activity.duration.split('-')[1] || activity.duration);
      return maxTime <= timeAvailable;
    });
  }

  return recommended.slice(0, 6); // Return top 6 recommendations
};
