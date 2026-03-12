import { cn } from '@/lib/utils'

type RingColor = 'teal' | 'blue' | 'violet' | 'amber' | 'red'
type RingSize = 'sm' | 'md' | 'lg'

const colorMap: Record<RingColor, { stroke: string; track: string; text: string }> = {
  teal: { stroke: 'stroke-teal-500', track: 'stroke-teal-100', text: 'text-teal-600' },
  blue: { stroke: 'stroke-blue-500', track: 'stroke-blue-100', text: 'text-blue-600' },
  violet: { stroke: 'stroke-violet-500', track: 'stroke-violet-100', text: 'text-violet-600' },
  amber: { stroke: 'stroke-amber-500', track: 'stroke-amber-100', text: 'text-amber-600' },
  red: { stroke: 'stroke-red-500', track: 'stroke-red-100', text: 'text-red-600' },
}

const sizeMap: Record<RingSize, { size: number; strokeWidth: number; fontSize: string; labelSize: string }> = {
  sm: { size: 60, strokeWidth: 5, fontSize: 'text-sm', labelSize: 'text-[9px]' },
  md: { size: 80, strokeWidth: 6, fontSize: 'text-lg', labelSize: 'text-[10px]' },
  lg: { size: 120, strokeWidth: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
}

interface ProgressRingProps {
  value: number
  size?: RingSize
  color?: RingColor
  label?: string
  showValue?: boolean
  className?: string
}

export function ProgressRing({
  value,
  size = 'md',
  color = 'teal',
  label,
  showValue = true,
  className,
}: ProgressRingProps) {
  const clampedValue = Math.max(0, Math.min(100, value))
  const { size: svgSize, strokeWidth, fontSize, labelSize } = sizeMap[size]
  const colors = colorMap[color]

  const radius = (svgSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="-rotate-90"
        >
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={colors.track}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(colors.stroke, 'transition-all duration-500 ease-out')}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-display font-bold', fontSize, colors.text)}>
              {Math.round(clampedValue)}
            </span>
            {label && size === 'lg' && (
              <span className={cn('text-slate-400 mt-0.5', labelSize)}>
                {label}
              </span>
            )}
          </div>
        )}
      </div>
      {label && size !== 'lg' && (
        <span className={cn('text-slate-500', labelSize)}>{label}</span>
      )}
    </div>
  )
}
