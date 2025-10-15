import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Smile, Meh, Frown, Heart } from "lucide-react"

export type MoodValue = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'

interface MoodOption {
  value: MoodValue
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  bgColor: string
}

const moodOptions: MoodOption[] = [
  { 
    value: 'great', 
    icon: Heart, 
    label: 'Great', 
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
  },
  { 
    value: 'good', 
    icon: Smile, 
    label: 'Good', 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
  },
  { 
    value: 'neutral', 
    icon: Meh, 
    label: 'Neutral', 
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
  },
  { 
    value: 'bad', 
    icon: Frown, 
    label: 'Bad', 
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
  },
  { 
    value: 'terrible', 
    icon: Frown, 
    label: 'Terrible', 
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
  }
]

interface MoodSelectorProps {
  value: MoodValue
  onChange: (mood: MoodValue) => void
  size?: "sm" | "md" | "lg"
  className?: string
}

export function MoodSelector({ value, onChange, size = "md", className }: MoodSelectorProps) {
  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm", 
    lg: "h-12 text-base"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <div className={cn("flex gap-2 flex-wrap", className)}>
      {moodOptions.map((mood) => {
        const Icon = mood.icon
        const isSelected = value === mood.value
        
        return (
          <Button
            key={mood.value}
            variant={isSelected ? "default" : "outline"}
            size="sm" 
            onClick={() => onChange(mood.value)}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              sizeClasses[size],
              isSelected 
                ? mood.bgColor 
                : "hover:scale-105 hover:shadow-soft"
            )}
            aria-label={`Select ${mood.label} mood`}
          >
            <Icon className={cn(
              iconSizes[size],
              isSelected ? "text-white" : mood.color
            )} />
            <span>{mood.label}</span>
          </Button>
        )
      })}
    </div>
  )
}

export { moodOptions }