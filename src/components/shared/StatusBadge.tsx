import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'default'
  | 'success'
  | 'present'
  | 'approved'
  | 'warning'
  | 'pending'
  | 'late'
  | 'danger'
  | 'absent'
  | 'rejected'
  | 'info'
  | 'wfh'
  | 'violet'
  | 'teal'
  | 'outline'
  | 'halfday'

type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  present: 'bg-emerald-500 text-white',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  late: 'bg-amber-500 text-white',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  absent: 'bg-red-500 text-white',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  wfh: 'bg-blue-100 text-blue-700',
  violet: 'bg-violet-50 text-violet-700 border border-violet-200',
  teal: 'bg-teal-50 text-teal-700 border border-teal-200',
  outline: 'bg-transparent text-slate-700 border border-slate-300',
  halfday: 'bg-orange-100 text-orange-700',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-500',
  present: 'bg-white',
  approved: 'bg-emerald-500',
  warning: 'bg-amber-500',
  pending: 'bg-yellow-500',
  late: 'bg-white',
  danger: 'bg-red-500',
  absent: 'bg-white',
  rejected: 'bg-red-500',
  info: 'bg-blue-500',
  wfh: 'bg-blue-500',
  violet: 'bg-violet-500',
  teal: 'bg-teal-500',
  outline: 'bg-slate-400',
  halfday: 'bg-orange-500',
}

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] leading-tight',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

const dotSizeStyles: Record<BadgeSize, string> = {
  xs: 'w-1 h-1',
  sm: 'w-1.5 h-1.5',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
}

interface StatusBadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  dot?: boolean
  size?: BadgeSize
  className?: string
}

export function StatusBadge({
  variant = 'default',
  children,
  dot = false,
  size = 'md',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full shrink-0',
            dotColors[variant],
            dotSizeStyles[size]
          )}
        />
      )}
      {children}
    </span>
  )
}
