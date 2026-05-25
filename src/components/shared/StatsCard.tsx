import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: { value: number; label: string }
  color?: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose'
  index?: number
}

const colorMap = {
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/40', icon: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200/50 dark:border-violet-800/50' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', icon: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200/50 dark:border-blue-800/50' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200/50 dark:border-emerald-800/50' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', icon: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200/50 dark:border-amber-800/50' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/40', icon: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200/50 dark:border-rose-800/50' },
}

export function StatsCard({ title, value, icon: Icon, description, trend, color = 'violet', index = 0 }: StatsCardProps) {
  const colors = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className={`${colors.border} transition-shadow hover:shadow-lg`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            </div>
            <div className={`rounded-xl p-2.5 ${colors.bg}`}>
              <Icon className={`h-5 w-5 ${colors.icon}`} />
            </div>
          </div>
          {(description || trend) && (
            <div className="mt-3 flex items-center gap-2">
              {trend && (
                <span className={`text-xs font-semibold ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
              {description && <span className="text-xs text-muted-foreground">{description}</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
