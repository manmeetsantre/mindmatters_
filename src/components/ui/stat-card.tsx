import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  variant?: "default" | "success" | "warning" | "primary"
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  className,
  variant = "default" 
}: StatCardProps) {
  const variants = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning", 
    primary: "text-primary"
  }

  return (
    <Card className={cn("text-center hover:shadow-card transition-all duration-300", className)}>
      <CardHeader className="pb-2">
        {Icon && (
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-muted rounded-lg">
              <Icon className={cn("h-5 w-5", variants[variant])} />
            </div>
          </div>
        )}
        <CardTitle className={cn("text-2xl font-bold", variants[variant])}>
          {value}
          {trend && (
            <span className={cn(
              "text-sm ml-2",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
            </span>
          )}
        </CardTitle>
        <CardDescription className="font-medium">{title}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}