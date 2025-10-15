import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, Calendar, Target } from "lucide-react";
import { JournalEntryData } from "./JournalEntry";
import { moodOptions, MoodValue } from "@/components/ui/mood-selector";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface JournalStatsProps {
  entries: JournalEntryData[];
  className?: string;
}

export function JournalStats({ entries, className }: JournalStatsProps) {
  const { t } = useLanguage();
  
  // Calculate stats
  const totalEntries = entries.length;
  const thisWeekEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  const todaysEntries = entries.filter(
    entry => entry.date === new Date().toISOString().split('T')[0]
  );

  // Mood distribution
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<MoodValue, number>);

  const mostCommonMood = Object.entries(moodCounts).reduce(
    (a, b) => moodCounts[a[0] as MoodValue] > moodCounts[b[0] as MoodValue] ? a : b,
    ['neutral', 0]
  )[0] as MoodValue;

  // Streak calculation
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    const sortedDates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (sortedDates[i] === expectedDateStr) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();
  const mostCommonMoodOption = moodOptions.find(m => m.value === mostCommonMood);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Today's Summary */}
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-primary" />
            {t('journal.summary.today')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysEntries.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('journal.summary.entries').replace('{count}', todaysEntries.length.toString()).replace('{entries}', todaysEntries.length === 1 ? t('journal.summary.entry') : t('journal.summary.entriesPlural'))}
              </p>
              <div className="space-y-2">
                {todaysEntries.map(entry => {
                  const moodOption = moodOptions.find(m => m.value === entry.mood);
                  const MoodIcon = moodOption?.icon;
                  return (
                    <div key={entry.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                      {MoodIcon && (
                        <div className={cn("p-1 rounded-full", moodOption?.bgColor)}>
                          <MoodIcon className={cn("h-3 w-3", moodOption?.color)} />
                        </div>
                      )}
                      <span className="text-sm font-medium">{moodOption?.label}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {entry.content.slice(0, 30)}...
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('journal.summary.noEntries')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-success" />
            {t('journal.progress.weekly')}
          </CardTitle>
          <CardDescription>
            {t('journal.progress.entriesWeek').replace('{count}', thisWeekEntries.toString())}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={(thisWeekEntries / 7) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('journal.progress.goal')}</span>
              <span>{t('journal.progress.complete').replace('{percent}', Math.round((thisWeekEntries / 7) * 100).toString())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mood Insights */}
      {totalEntries > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-warning" />
              {t('journal.insights.mood')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{t('journal.insights.mostCommon')}</span>
              {mostCommonMoodOption && (
                <Badge className={cn("flex items-center gap-1", mostCommonMoodOption.bgColor)}>
                  <mostCommonMoodOption.icon className={cn("h-3 w-3", mostCommonMoodOption.color)} />
                  {mostCommonMoodOption.label}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              {moodOptions.map(mood => {
                const count = moodCounts[mood.value] || 0;
                const percentage = totalEntries > 0 ? (count / totalEntries) * 100 : 0;
                
                return (
                  <div key={mood.value} className="flex items-center gap-3">
                    <div className={cn("p-1 rounded-full", mood.bgColor)}>
                      <mood.icon className={cn("h-3 w-3", mood.color)} />
                    </div>
                    <span className="text-xs font-medium w-16">{mood.label}</span>
                    <Progress value={percentage} className="flex-1 h-1" />
                    <span className="text-xs text-muted-foreground w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journaling Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            {t('journal.streak.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">{currentStreak}</div>
            <p className="text-sm text-muted-foreground">
              {currentStreak === 1 ? t('journal.streak.day') : t('journal.streak.days')} {t('journal.streak.inRow')}
            </p>
            {currentStreak > 0 && (
              <p className="text-xs text-success">
                {t('journal.streak.keepUp')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}