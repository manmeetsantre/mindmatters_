import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { JournalEntry, JournalEntryData } from "@/components/journal/JournalEntry";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { JournalStats } from "@/components/journal/JournalStats";
import { MoodValue } from "@/components/ui/mood-selector";
import { 
  BookOpen, 
  Calendar as CalendarIcon,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { API_URL } from "@/lib/utils";
import { moodOptions } from "@/components/ui/mood-selector";

const STORAGE_KEY = 'mind-matters-journal-entries';

export default function Journal() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [entries, setEntries] = useState<JournalEntryData[]>([]);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<JournalEntryData | null>(null);

  // Load entries from backend
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      if (!token) { setIsLoading(false); return; }
      try {
        const res = await fetch(`${API_URL}/journal/`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load');
        setEntries(json.entries || []);
      } catch (error) {
        console.error('Failed to load journal entries:', error);
        toast({ title: t('journal.toast.errorLoading'), description: t('journal.toast.errorLoadingDesc'), variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast, t]);

  // Remove localStorage persistence

  const handleSaveEntry = async (entryData: {
    mood: MoodValue;
    content: string;
    tags?: string[];
  }) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (editingEntry) {
        // For brevity, treat edit as delete+create in UI or implement PUT route later
        // Here we just update locally to keep UI responsive
        const updatedEntry: JournalEntryData = { ...editingEntry, ...entryData };
        setEntries(prev => prev.map(e => e.id === editingEntry.id ? updatedEntry : e));
        setEditingEntry(null);
        toast({ title: t('journal.toast.entryUpdated'), description: t('journal.toast.entryUpdatedDesc') });
      } else {
        const res = await fetch(`${API_URL}/journal/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            date: selectedDate.toISOString().split('T')[0],
            mood: entryData.mood,
            content: entryData.content,
            tags: entryData.tags,
          })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to save');
        setEntries(prev => [json.entry, ...prev]);
        toast({ title: t('journal.toast.entrySaved'), description: t('journal.toast.entrySavedDesc') });
      }
    } catch (e) {
      toast({ title: t('journal.toast.errorSaving'), description: t('journal.toast.errorSavingDesc'), variant: 'destructive' });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API_URL}/journal/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setEntries(prev => prev.filter(e => e.id !== id));
      toast({ title: t('journal.toast.entryDeleted'), description: t('journal.toast.entryDeletedDesc') });
    } catch {
      toast({ title: t('journal.toast.errorSaving'), description: t('journal.toast.errorSavingDesc'), variant: 'destructive' });
    }
  };

  const handleEditEntry = (entry: JournalEntryData) => {
    setEditingEntry(entry);
    // Scroll to editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const selectedDateEntries = entries.filter(
    entry => entry.date === selectedDate.toISOString().split('T')[0]
  );

  const recentEntries = entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Calculate journaling streak (consecutive days up to today)
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    const uniqueDates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let streak = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (uniqueDates[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  const currentStreak = calculateStreak();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" className="py-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          icon={BookOpen}
          title={t('journal.title')}
          description={t('journal.subtitle')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Journal Editor */}
            <JournalEditor
              onSave={handleSaveEntry}
              isEditing={!!editingEntry}
              onCancel={editingEntry ? handleCancelEdit : undefined}
              initialData={editingEntry ? {
                mood: editingEntry.mood,
                content: editingEntry.content,
                tags: editingEntry.tags
              } : undefined}
            />

            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t('journal.recentEntries')}
                </CardTitle>
                <CardDescription>
                  {t('journal.recentEntries')} • {entries.length} {t('journal.totalEntries')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentEntries.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title={t('journal.noEntries')}
                    description={t('journal.noEntriesDescription')}
                    action={{
                      label: t('journal.writeFirst'),
                      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                ) : (
                  recentEntries.map((entry) => (
                    <JournalEntry
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDeleteEntry}
                      onEdit={handleEditEntry}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {t('journal.calendar')}
                </CardTitle>
                <CardDescription>
                  {t('journal.calendarDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    // Only allow selecting today
                    if (date && date.toDateString() === today.toDateString()) {
                      setSelectedDate(date);
                    } else {
                      setSelectedDate(today);
                    }
                  }}
                  className="rounded-md border w-full"
                  disabled={[
                    { before: today },
                    { after: today },
                  ]}
                  modifiers={{
                    hasEntry: entries.map(entry => new Date(entry.date))
                  }}
                  modifiersStyles={{
                    hasEntry: {
                      backgroundColor: 'hsl(var(--destructive))',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                />
                
                {/* Streak summary */}
                <div className="mt-3 text-sm">
                  <span className="font-medium">Streak:</span> {currentStreak} {currentStreak === 1 ? 'day' : 'days'} in a row
                </div>

                {/* Selected Date Entries */}
                {selectedDateEntries.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">
                      {t('journal.entriesFor')} {selectedDate.toLocaleDateString()}:
                    </h4>
                    {selectedDateEntries.map((entry) => {
                      const moodOption = moodOptions.find((m) => m.value === entry.mood);
                      return (
                        <div 
                          key={entry.id} 
                          className="text-xs p-2 bg-muted/30 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleEditEntry(entry)}
                        >
                          {moodOption?.label} • {entry.content.slice(0, 50)}...
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Journal Stats */}
            <JournalStats entries={entries} />

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>{t('journal.tips.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-primary">💡</span>
                  <span>{t('journal.tips.regular')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">🎯</span>
                  <span>{t('journal.tips.honest')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">🌱</span>
                  <span>{t('journal.tips.growth')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">📝</span>
                  <span>{t('journal.tips.grammar')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">🔒</span>
                  <span>{t('journal.tips.private')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}