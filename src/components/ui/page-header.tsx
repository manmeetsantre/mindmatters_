import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
  actions?: React.ReactNode
}

export function PageHeader({ 
  icon: Icon, 
  title, 
  description, 
  className,
  actions 
}: PageHeaderProps) {
  return (
    <div className={cn("text-center mb-8", className)}>
      <div className="flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        {description}
      </p>
      {actions && (
        <div className="flex justify-center mt-6">
          {actions}
        </div>
      )}
    </div>
  )
}