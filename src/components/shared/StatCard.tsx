import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const colorMap = {
  teal: {
    bg: 'bg-teal-50',
    icon: 'bg-teal-100 text-teal-600',
    ring: 'ring-teal-500/10',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    ring: 'ring-blue-500/10',
  },
  violet: {
    bg: 'bg-violet-50',
    icon: 'bg-violet-100 text-violet-600',
    ring: 'ring-violet-500/10',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    ring: 'ring-amber-500/10',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'bg-rose-100 text-rose-600',
    ring: 'ring-rose-500/10',
  },
} as const

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: 'up' | 'down'
  trendValue?: string
  color?: 'teal' | 'blue' | 'violet' | 'amber' | 'rose'
  index?: number
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'teal',
  index = 0,
}: StatCardProps) {
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        'bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 p-5 hover:shadow-md transition-all animate-fade-up',
        index === 1 && 'stagger-1',
        index === 2 && 'stagger-2',
        index === 3 && 'stagger-3',
        index === 4 && 'stagger-4',
        index === 5 && 'stagger-5'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100 animate-count">
            {value}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</span>
        </div>
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center ring-4',
            colors.icon,
            colors.ring
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && trendValue && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              trend === 'up' ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {trendValue}
          </span>
        </div>
      )}
    </div>
  )
}
