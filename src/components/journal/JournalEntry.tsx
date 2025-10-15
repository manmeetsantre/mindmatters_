import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit3 } from "lucide-react";
import { MoodValue, moodOptions } from "@/components/ui/mood-selector";
import { cn } from "@/lib/utils";

export interface JournalEntryData {
  id: string;
  date: string;
  mood: MoodValue;
  content: string;
  tags?: string[];
}

interface JournalEntryProps {
  entry: JournalEntryData;
  onDelete: (id: string) => void;
  onEdit?: (entry: JournalEntryData) => void;
  className?: string;
}

export function JournalEntry({ entry, onDelete, onEdit, className }: JournalEntryProps) {
  const moodOption = moodOptions.find(m => m.value === entry.mood);
  const MoodIcon = moodOption?.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <Card className={cn(
      "group hover:shadow-card transition-all duration-300 hover:scale-[1.01]",
      "border-l-4 border-l-transparent hover:border-l-primary animate-fade-in",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {MoodIcon && (
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                moodOption?.bgColor
              )}>
                <MoodIcon className={cn("h-4 w-4", moodOption?.color)} />
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">{formatDate(entry.date)}</p>
              <Badge 
                variant="secondary" 
                className={cn("text-xs", moodOption?.color)}
              >
                {moodOption?.label}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry)}
                className="h-8 w-8 p-0 hover:bg-muted"
                aria-label="Edit entry"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              aria-label="Delete entry"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {entry.content}
        </p>
        
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}