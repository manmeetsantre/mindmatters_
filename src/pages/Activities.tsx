import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ActivityCard, Activity } from "@/components/activities/ActivityCard";
import { activityCategories, activities } from "@/data/activities";
import { 
  Layers, 
  Search, 
  Filter,
  TrendingUp,
  Target,
  Clock,
  Brain,
  Sparkles,
  Heart,
  Zap,
  Palette,
  Music,
  Dumbbell,
  BookOpen,
  Users,
  Sunrise,
  Moon,
  TreePine,
  Coffee,
  Headphones,
  Video as VideoIcon,
  FileText as ArticleIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_URL, cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STORAGE_KEY = 'mind-matters-completed-activities';

const iconMap: Record<string, any> = {
  Heart,
  Zap,
  Palette,
  Music,
  Dumbbell,
  BookOpen,
  Brain,
  Users,
  Layers,
  Sunrise,
  Moon,
  TreePine,
  Coffee,
  Headphones,
};

export default function Activities() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<'all' | 'videos' | 'audio' | 'articles' | 'guides'>('all');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof activityCategories>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [recommendedMood, setRecommendedMood] = useState<string>('');
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recommended, setRecommended] = useState<Activity[]>([]);
  const [statsCompleted, setStatsCompleted] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string>("");

  // Initial load: activities and user data
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        // Use local activities data instead of API
        const mapped: Activity[] = activities.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          category: a.category,
          duration: a.duration,
          difficulty: a.difficulty,
          benefits: a.benefits || [],
          icon: a.icon,
          color: a.color || 'text-primary',
          videoUrl: a.videoUrl
        }));
        setActivitiesList(mapped);

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const compRes = await fetch(`${API_URL}/activities/me/completions`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (compRes.ok) {
              const comps = await compRes.json();
              const ids = (comps || []).map((c: any) => c.activity_id);
              setCompletedActivities(ids);
            }
            const statsRes = await fetch(`${API_URL}/activities/me/stats`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (statsRes.ok) {
              const s = await statsRes.json();
              setStatsCompleted(s?.totalCompleted || 0);
            }
          } catch {}
        } else {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) setCompletedActivities(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to initialize Activities:', error);
        toast({ title: 'Failed to load', description: 'Please try again later.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  // Save completed activities to localStorage for guests only
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) localStorage.setItem(STORAGE_KEY, JSON.stringify(completedActivities));
    } catch (error) {
      console.error('Failed to save completed activities:', error);
    }
  }, [completedActivities]);

  const filteredActivities = activitiesList.filter(activity => {
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.benefits.some(benefit => benefit.toLowerCase().includes(searchQuery.toLowerCase())) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const videoActivities = activitiesList.filter(a => !!a.videoUrl);

  const toggleCompleted = async (activityId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCompletedActivities(prev => {
        const newCompleted = prev.includes(activityId)
          ? prev.filter(id => id !== activityId)
          : [...prev, activityId];
        const activity = activitiesList.find(a => a.id === activityId);
        if (!prev.includes(activityId)) {
          toast({ title: "Activity completed! 🎉", description: `Great job completing "${activity?.title}".` });
        }
        return newCompleted;
      });
      return;
    }
    try {
      const alreadyCompleted = completedActivities.includes(activityId);
      const method = alreadyCompleted ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/activities/${activityId}/complete`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: alreadyCompleted ? undefined : JSON.stringify({})
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || (alreadyCompleted ? 'Failed to un-complete activity' : 'Failed to record completion'));
      }
      setCompletedActivities(prev => (
        alreadyCompleted ? prev.filter(id => id !== activityId) : (prev.includes(activityId) ? prev : [...prev, activityId])
      ));
      const activity = activitiesList.find(a => a.id === activityId);
      if (alreadyCompleted) {
        toast({ title: "Marked as not completed", description: `You can try "${activity?.title}" again later.` });
      } else {
      toast({ title: "Activity completed! 🎉", description: `Great job completing "${activity?.title}".` });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Could not complete activity', variant: 'destructive' });
    }
  };

  const handleStartActivity = (activity: Activity) => {
    if (activity.videoUrl) {
      setVideoUrl(activity.videoUrl);
      return;
    }
    toast({
      title: `Starting: ${activity.title}`,
      description: `Duration: ${activity.duration} • Difficulty: ${activity.difficulty}`,
    });
  };

  // Calculate stats
  const todayCompleted = statsCompleted || completedActivities.length;
  const weekStreak = Math.min(todayCompleted, 7); // Simplified streak calculation
  const totalCategories = Object.keys(activityCategories).length - 1; // Exclude 'all'

  useEffect(() => {
    (async () => {
      if (!recommendedMood) { setRecommended([]); return; }
      try {
        const res = await fetch(`${API_URL}/activities/recommendations?mood=${encodeURIComponent(recommendedMood)}`);
        const rec = await res.json();
        if (!res.ok) throw new Error(rec?.error || 'Failed to load recommendations');
        const mapped: Activity[] = (rec || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          category: a.category,
          duration: a.duration,
          difficulty: a.difficulty,
          benefits: a.benefits || [],
          icon: iconMap[a.icon as string] || Layers,
          color: a.color || 'text-primary',
          videoUrl: a.videoUrl
        }));
        setRecommended(mapped);
      } catch (e) {
        setRecommended([]);
      }
    })();
  }, [recommendedMood]);

  return (
    <>
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          icon={Layers}
          title={t('activities.title')}
          description={t('activities.description')}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={t('activities.available')}
            value={activitiesList.length}
            description={t('activities.available.desc')}
            icon={Target}
            variant="primary"
          />
          <StatCard
            title={t('activities.completed')}
            value={todayCompleted}
            description={t('activities.completed.desc')}
            icon={TrendingUp}
            variant="success"
            trend={todayCompleted > 0 ? { value: 12, isPositive: true } : undefined}
          />
          <StatCard
            title={t('activities.categories')}
            value={totalCategories}
            description={t('activities.categories.desc')}
            icon={Brain}
            variant="warning"
          />
          <StatCard
            title={t('activities.streak')}
            value={`${weekStreak}/7`}
            description={t('activities.streak.desc')}
            icon={Sparkles}
            variant="default"
          />
        </div>

        {/* Quick Recommendations */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t('activities.recommendations')}
            </CardTitle>
            <CardDescription>
              {t('activities.recommendations.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap mb-4">
              {['stressed', 'anxious', 'low-energy', 'creative'].map((mood) => (
                <Button
                  key={mood}
                  variant={recommendedMood === mood ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const next = recommendedMood === mood ? '' : mood;
                    setRecommendedMood(next);
                    setSelectedTab('videos');
                    if (next) setSearchQuery('');
                  }}
                  className="capitalize"
                >
                  {mood === 'low-energy' ? 'Low Energy' : mood}
                </Button>
              ))}
            </div>
            
            {recommended.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommended.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="p-3 bg-background/60 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <activity.icon className={cn("h-4 w-4", activity.color)} />
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <span className="text-xs text-muted-foreground ml-auto">{activity.duration}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{activity.description}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs"
                      onClick={() => {
                        setSelectedTab('videos');
                        setSearchQuery(activity.title);
                      }}
                    >
                      {t('activities.find.activity')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('activities.recommendations.desc')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Search */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('activities.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-primary transition-all duration-200"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Unified Resources & Activities Tabs */}
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="mb-10">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2"><Layers className="h-4 w-4" /> All</TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2"><VideoIcon className="h-4 w-4" /> Videos</TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2"><Headphones className="h-4 w-4" /> Audio</TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2"><ArticleIcon className="h-4 w-4" /> Articles</TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Videos (activities with videoUrl) */}
              {videoActivities
                .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((activity) => (
                  <ActivityCard
                    key={`video-${activity.id}`}
                    activity={activity}
                    isCompleted={completedActivities.includes(activity.id)}
                    onToggleComplete={toggleCompleted}
                    onStartActivity={handleStartActivity}
                  />
              ))}

              {/* Audio */}
              {[
                { id: 'audio-meditation', title: 'Guided Meditation for Astronauts', description: 'Daily 10-minute calm practice', duration: '10 min' },
                { id: 'audio-breathing', title: 'Breathing Exercises', description: 'Quick calm in under 5 minutes', duration: '8 min' },
                { id: 'audio-sleep', title: 'Sleep Stories', description: 'Wind down for restful sleep', duration: '25 min' },
                { id: 'audio-mission-calm', title: 'Pre-Mission Anxiety Relief', description: 'Calm your mind before important missions', duration: '12 min' },
                { id: 'audio-focus', title: 'Deep Focus Music', description: 'Background sounds for concentration', duration: '45 min' },
                { id: 'audio-morning-energy', title: 'Morning Motivation', description: 'Start your day with positive energy', duration: '15 min' }
              ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))
               .map((r) => (
                <Card key={`audio-${r.id}`} className="group hover:shadow-card transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><Headphones className="h-4 w-4" /> {r.title}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{r.duration}</span>
                    <Button size="sm" variant="outline">Listen</Button>
                  </CardContent>
                </Card>
              ))}

              {/* Articles */}
              {[
                { id: 'article-exam-anxiety', title: 'Why We Feel Anxious Before Spacewalks – Science + Tips', description: 'Understanding the science behind spacewalk anxiety and practical coping strategies', readTime: '7 min read' },
                { id: 'article-homesickness', title: 'Homesickness in Space Stations: Coping Like a Pro', description: 'Personal strategies for managing homesickness in space stations', readTime: '6 min read' },
                { id: 'article-friends-mental-health', title: 'The Role of Crew Members in Mental Health', description: 'How crew relationships impact your mental wellbeing and how to nurture them', readTime: '8 min read' },
                { id: 'article-burnout-signs', title: 'Signs of Burnout (Beyond Tiredness)', description: 'Recognizing mission and emotional burnout before it gets worse', readTime: '5 min read' },
                { id: 'article-parents-talk', title: 'How to Talk About Mental Health with Mission Control', description: 'Approaches to discussing mental health with mission control and family', readTime: '9 min read' },
                { id: 'article-meditation-myths', title: 'Breaking Myths: Meditation is Not Only for Adults', description: 'Debunking common misconceptions about meditation for astronauts', readTime: '6 min read' }
              ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))
               .map((r) => (
                <Card key={`article-${r.id}`} className="group hover:shadow-card transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><ArticleIcon className="h-4 w-4" /> {r.title}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{r.readTime}</span>
                    <Button size="sm" variant="outline">Read</Button>
                  </CardContent>
                </Card>
              ))}

              {/* Guides */}
              {[
                { id: 'guide-self-screening', title: 'Self-Screening Toolkit (PHQ-9, GAD-7)', description: 'Simple & interactive mental health assessments', pages: 'Interactive' },
                { id: 'guide-self-care-planner', title: 'Daily Self-Care Planner', description: 'Hydration, Journaling, Sleep tracking - printable sheet', pages: 'Printable' },
                { id: 'guide-peer-support', title: 'Peer Support Guide: Helping a Crew Member Without Judging', description: 'How to support crew members going through tough times', pages: '12 pages' },
                { id: 'guide-pomodoro-routine', title: 'Pomodoro + Micro-Break Routine for Astronauts', description: 'Mission planning technique adapted for space operations', pages: '8 pages' },
                { id: 'guide-emergency-helplines', title: 'Emergency Support Guide', description: 'Complete list of mental health crisis resources for space missions', pages: '4 pages' },
                { id: 'guide-counseling-booking', title: 'How to Book a Counseling Session Confidentially', description: 'Step-by-step guide to accessing professional help during missions', pages: '6 pages' }
              ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))
               .map((r) => (
                <Card key={`guide-${r.id}`} className="group hover:shadow-card transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-4 w-4" /> {r.title}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{r.pages}</span>
                    <Button size="sm" variant="outline">Download</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : videoActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoActivities
                  .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isCompleted={completedActivities.includes(activity.id)}
                  onToggleComplete={toggleCompleted}
                  onStartActivity={handleStartActivity}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Filter}
              title={t('activities.no.found')}
              description={t('activities.no.found.desc')}
              />
            )}
          </TabsContent>

          <TabsContent value="audio">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'audio-meditation', title: 'Guided Meditation for Astronauts', description: 'Daily 10-minute calm practice', duration: '10 min' },
                { id: 'audio-breathing', title: 'Breathing Exercises', description: 'Quick calm in under 5 minutes', duration: '8 min' },
                { id: 'audio-sleep', title: 'Sleep Stories', description: 'Wind down for restful sleep', duration: '25 min' },
                { id: 'audio-mission-calm', title: 'Pre-Mission Anxiety Relief', description: 'Calm your mind before important missions', duration: '12 min' },
                { id: 'audio-focus', title: 'Deep Focus Music', description: 'Background sounds for concentration', duration: '45 min' },
                { id: 'audio-morning-energy', title: 'Morning Motivation', description: 'Start your day with positive energy', duration: '15 min' }
              ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))
               .map((r) => (
                <Card key={r.id} className="group hover:shadow-card transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><Headphones className="h-4 w-4" /> {r.title}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{r.duration}</span>
                    <Button size="sm" variant="outline">Listen</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="articles">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'article-exam-anxiety', title: 'Why We Feel Anxious Before Spacewalks – Science + Tips', description: 'Understanding the science behind spacewalk anxiety and practical coping strategies', readTime: '7 min read' },
                { id: 'article-homesickness', title: 'Homesickness in Space Stations: Coping Like a Pro', description: 'Personal strategies for managing homesickness in space stations', readTime: '6 min read' },
                { id: 'article-friends-mental-health', title: 'The Role of Crew Members in Mental Health', description: 'How crew relationships impact your mental wellbeing and how to nurture them', readTime: '8 min read' },
                { id: 'article-burnout-signs', title: 'Signs of Burnout (Beyond Tiredness)', description: 'Recognizing mission and emotional burnout before it gets worse', readTime: '5 min read' },
                { id: 'article-parents-talk', title: 'How to Talk About Mental Health with Mission Control', description: 'Approaches to discussing mental health with mission control and family', readTime: '9 min read' },
                { id: 'article-meditation-myths', title: 'Breaking Myths: Meditation is Not Only for Adults', description: 'Debunking common misconceptions about meditation for astronauts', readTime: '6 min read' }
              ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))
               .map((r) => (
                <Card key={r.id} className="group hover:shadow-card transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><ArticleIcon className="h-4 w-4" /> {r.title}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{r.readTime}</span>
                    <Button size="sm" variant="outline">Read</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guides">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'guide-self-screening', title: 'Self-Screening Toolkit (PHQ-9, GAD-7)', description: 'Simple & interactive mental health assessments', pages: 'Interactive' },
                { id: 'guide-self-care-planner', title: 'Daily Self-Care Planner', description: 'Hydration, Journaling, Sleep tracking - printable sheet', pages: 'Printable' },
                { id: 'guide-peer-support', title: 'Peer Support Guide: Helping a Crew Member Without Judging', description: 'How to support crew members going through tough times', pages: '12 pages' },
                { id: 'guide-pomodoro-routine', title: 'Pomodoro + Micro-Break Routine for Astronauts', description: 'Mission planning technique adapted for space operations', pages: '8 pages' },
                { id: 'guide-emergency-helplines', title: 'Emergency Support Guide', description: 'Complete list of mental health crisis resources for space missions', pages: '4 pages' },
                { id: 'guide-counseling-booking', title: 'How to Book a Counseling Session Confidentially', description: 'Step-by-step guide to accessing professional help during missions', pages: '6 pages' }
              ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))
               .map((r) => (
                <Card key={r.id} className="group hover:shadow-card transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-4 w-4" /> {r.title}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{r.pages}</span>
                    <Button size="sm" variant="outline">Download</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips and Motivation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {t('activities.tips.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary">🎯</span>
                <span>Start with easy activities and gradually increase difficulty</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">⏰</span>
                <span>Consistency matters more than duration - even 5 minutes helps</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">🧠</span>
                <span>Mix different types of activities for holistic wellness</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">📱</span>
                <span>Set reminders to make activities part of your routine</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('activities.time.suggestions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-success mb-1">🌅 Morning (5-15 min)</h4>
                <p className="text-muted-foreground text-xs">Mindfulness, gratitude practice, gentle stretches</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-primary mb-1">🎯 Mission Breaks (5-10 min)</h4>
                <p className="text-muted-foreground text-xs">Deep breathing, console stretches, brain games</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-warning mb-1">🌆 Evening (15-30 min)</h4>
                <p className="text-muted-foreground text-xs">Creative activities, relaxation, wind-down routines</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    <Dialog open={!!videoUrl} onOpenChange={(open) => !open && setVideoUrl("") }>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Activity Video</DialogTitle>
        </DialogHeader>
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          {videoUrl && (
            <iframe
              src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
              title="Activity Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-md"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
