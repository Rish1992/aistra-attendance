import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface Legend {
  color: string
  label: string
}

interface CalendarGridProps {
  month: number
  year: number
  onMonthChange: (month: number, year: number) => void
  renderDay: (date: Date) => ReactNode
  legends?: Legend[]
  className?: string
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(month: number, year: number): number {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function CalendarGrid({
  month,
  year,
  onMonthChange,
  renderDay,
  legends,
  className,
}: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)

  const handlePrev = () => {
    if (month === 0) {
      onMonthChange(11, year - 1)
    } else {
      onMonthChange(month - 1, year)
    }
  }

  const handleNext = () => {
    if (month === 11) {
      onMonthChange(0, year + 1)
    } else {
      onMonthChange(month + 1, year)
    }
  }

  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d))
  }
  const remainingCells = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7)
  for (let i = 0; i < remainingCells; i++) {
    cells.push(null)
  }

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrev}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-display font-semibold text-slate-800">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button
          type="button"
          onClick={handleNext}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-2"
          >
            {day}
          </div>
        ))}

        {cells.map((date, idx) => (
          <div
            key={idx}
            className="min-h-[40px] flex items-center justify-center"
          >
            {date ? renderDay(date) : null}
          </div>
        ))}
      </div>

      {legends && legends.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          {legends.map((legend) => (
            <div key={legend.label} className="flex items-center gap-1.5">
              <span
                className={cn('w-2.5 h-2.5 rounded-full', legend.color)}
              />
              <span className="text-xs text-slate-500">{legend.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
