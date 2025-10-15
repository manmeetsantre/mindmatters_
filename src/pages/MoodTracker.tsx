import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  Calendar,
  BarChart3,
  BookOpen,
  Mic,
  Trash2
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const getMoodOptions = (t: any) => [
  { emoji: "😠", label: "Angry", value: 1, color: "bg-red-500", icon: Frown },
  { emoji: "🤢", label: "Disgust", value: 2, color: "bg-purple-500", icon: Frown },
  { emoji: "😨", label: "Fear", value: 3, color: "bg-gray-500", icon: Meh },
  { emoji: "😊", label: "Happy", value: 4, color: "bg-green-500", icon: Smile },
  { emoji: "😐", label: "Neutral", value: 5, color: "bg-yellow-500", icon: Meh },
  { emoji: "😢", label: "Sad", value: 6, color: "bg-blue-500", icon: Frown },
  { emoji: "😲", label: "Surprise", value: 7, color: "bg-orange-500", icon: Smile },
];

const getWeeklyData = (t: any) => [
  { day: t('moodTracker.days.mon'), mood: 4, activities: [t('moodTracker.activities.study'), t('moodTracker.activities.exercise')] },
  { day: t('moodTracker.days.tue'), mood: 3, activities: [t('moodTracker.activities.study'), t('moodTracker.activities.social')] },
  { day: t('moodTracker.days.wed'), mood: 5, activities: [t('moodTracker.activities.rest'), t('moodTracker.activities.meditation')] },
  { day: t('moodTracker.days.thu'), mood: 2, activities: [t('moodTracker.activities.exam'), t('moodTracker.activities.stress')] },
  { day: t('moodTracker.days.fri'), mood: 4, activities: [t('moodTracker.activities.friends'), t('moodTracker.activities.relax')] },
  { day: t('moodTracker.days.sat'), mood: 5, activities: [t('moodTracker.activities.family'), t('moodTracker.activities.fun')] },
  { day: t('moodTracker.days.sun'), mood: 4, activities: [t('moodTracker.activities.study'), t('moodTracker.activities.plan')] },
];

const getMoodBorderColor = (moodValue: number) => {
  const positiveMoods = [4, 7]; // Happy, Surprise
  const neutralMoods = [5]; // Neutral
  const negativeMoods = [1, 2, 3, 6]; // Angry, Disgust, Fear, Sad

  if (positiveMoods.includes(moodValue)) return 'border-l-green-500';
  if (neutralMoods.includes(moodValue)) return 'border-l-yellow-500';
  if (negativeMoods.includes(moodValue)) return 'border-l-red-500';
  return 'border-l-gray-500';
};

export default function MoodTracker() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Array<{
    id: string;
    date: string;
    time: string;
    mood: number;
    emoji: string;
    label: string;
    note: string;
  }>>([]);
  const [searchParams] = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const emotionParam = searchParams.get("emotion");
    if (emotionParam) {
      const moodMap: Record<string, number> = {
        angry: 1,
        disgust: 2,
        fear: 3,
        happy: 4,
        neutral: 5,
        sad: 6,
        surprise: 7,
      };
      const moodValue = moodMap[emotionParam.toLowerCase()];
      if (moodValue) {
        setSelectedMood(moodValue);
      }
    }
  }, [searchParams]);

  const handleMoodSubmit = () => {
    if (selectedMood) {
      // In a real app, this would save to database
      // Add new mood entry to moodHistory state
      const now = new Date();
      const newEntry = {
        id: now.toISOString(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: selectedMood,
        emoji: moodOptions.find(m => m.value === selectedMood)?.emoji || '',
        label: moodOptions.find(m => m.value === selectedMood)?.label || '',
        note: note.trim(),
      };
      setMoodHistory([newEntry, ...moodHistory]);

      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setSelectedMood(null);
      setNote("");
    }
  };

  const handleDeleteEntry = (id: string) => {
    setMoodHistory(moodHistory.filter(entry => entry.id !== id));
    toast({
      title: "Entry deleted",
      description: "The mood entry has been removed from your history.",
    });
  };

  const handleMicClick = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition not supported in this browser.');
        return;
      }
      // @ts-ignore
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setNote(() => transcript);
      };
      recognition.onend = () => {
        setIsRecording(false);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    }
  };

  const moodOptions = getMoodOptions(t);
  const weeklyData = getWeeklyData(t);
  const averageMood = weeklyData.reduce((sum, day) => sum + day.mood, 0) / weeklyData.length;

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            {t('moodTracker.title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('moodTracker.subtitle')}
          </p>
        </div>

        <div className="flex justify-end mb-6">
          <Button onClick={() => { window.location.href = 'http://127.0.0.1:5000/'; }}>
            Advanced Voice Analysis 
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Mood Entry */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('moodTracker.dailyEntry')}
                </CardTitle>
                <CardDescription>
                  {t('moodTracker.dailyDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mood Selection */}
                <div className="grid grid-cols-7 gap-4">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                        selectedMood === mood.value
                          ? "border-primary bg-primary/10 shadow-soft"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-3xl mb-2">{mood.emoji}</div>
                      <div className="text-sm font-medium">{mood.label}</div>
                    </button>
                  ))}
                </div>

                {/* Optional Note */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('moodTracker.whatsOnMind')}
                  </label>
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      placeholder={t('moodTracker.placeholder')}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[100px] pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`absolute bottom-2 right-2 h-8 w-8 ${isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={handleMicClick}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  variant={isSubmitted ? "success" : "default"}
                  onClick={handleMoodSubmit}
                  disabled={!selectedMood || isSubmitted}
                  className="w-full"
                >
                  {isSubmitted ? t('moodTracker.recorded') : t('moodTracker.recordMood')}
                </Button>
              </CardContent>
            </Card>

            {/* Mood History */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Mood History
                </CardTitle>
                <CardDescription>
                  Your past mood entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {moodHistory.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No mood entries yet. Start tracking your mood!
                      </div>
                    ) : (
                      moodHistory.map((entry) => (
                        <Card
                          key={entry.id}
                          className={`border-l-4 ${getMoodBorderColor(entry.mood)} bg-muted/20 rounded-lg shadow-sm relative`}
                        >
                          <CardContent className="p-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="text-xs text-muted-foreground mb-2 pr-8">
                              {entry.date} at {entry.time}
                            </div>
                            <div className="text-2xl mb-1">{entry.emoji}</div>
                            <div className="font-bold text-lg mb-2">{entry.label}</div>
                            {entry.note && (
                              <div className="text-sm text-muted-foreground italic pr-8">
                                "{entry.note}"
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Weekly Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('moodTracker.weekOverview')}
                </CardTitle>
                <CardDescription>
                  {t('moodTracker.weekDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {weeklyData.map((day, index) => {
                    const moodData = moodOptions.find(m => m.value === day.mood);
                    return (
                      <div key={index} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                        <div className={`w-12 h-12 mx-auto rounded-lg ${moodData?.color} flex items-center justify-center text-white font-bold`}>
                          {day.mood}
                        </div>
                        <div className="text-xs mt-1">
                          {day.activities.map((activity, i) => (
                            <Badge key={i} variant="secondary" className="text-xs mr-1 mb-1">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>{t('moodTracker.averageMood')}</span>
                  <Badge variant="outline" className="text-lg">
                    {averageMood.toFixed(1)}/5
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('moodTracker.progress')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">7</div>
                  <div className="text-sm text-muted-foreground">{t('moodTracker.daysTracked')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">3</div>
                  <div className="text-sm text-muted-foreground">{t('moodTracker.wellnessStreak')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">85%</div>
                  <div className="text-sm text-muted-foreground">{t('moodTracker.aboveAverage')}</div>
                </div>
              </CardContent>
            </Card>

            {/* Mood Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t('moodTracker.insights')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-sm font-medium text-primary mb-1">
                    {t('moodTracker.patternDetected')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('moodTracker.patternMessage')}
                  </div>
                </div>
                
                <div className="p-3 bg-success/10 rounded-lg">
                  <div className="text-sm font-medium text-success mb-1">
                    {t('moodTracker.positiveTrigger')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('moodTracker.triggerMessage')}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t('moodTracker.viewResources')}
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="border-muted">
              <CardContent className="pt-6">
                <div className="text-center text-sm text-muted-foreground">
                  {t('moodTracker.privacyNotice')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
