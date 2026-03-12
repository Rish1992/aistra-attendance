import { useEffect, useMemo, useState } from 'react'
import { format, differenceInCalendarDays, isSameDay } from 'date-fns'
import {
  CalendarDays,
  List,
  LayoutGrid,
  Plus,
  Clock,
  MapPin,
  Loader2,
  PartyPopper,
} from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/PageHeader'
import { CalendarGrid } from '@/components/shared/CalendarGrid'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useHolidayStore } from '@/stores/holidayStore'
import { useAuthStore } from '@/stores/authStore'
import { HOLIDAY_TYPES } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { Holiday, HolidayType } from '@/types/holiday'

const HOLIDAY_TYPE_STYLES: Record<
  HolidayType,
  { bg: string; calBg: string; border: string; variant: string }
> = {
  National: {
    bg: 'bg-red-50 text-red-700 border-red-200',
    calBg: 'bg-red-100',
    border: 'border-red-300',
    variant: 'danger',
  },
  Regional: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    calBg: 'bg-amber-100',
    border: 'border-amber-300',
    variant: 'warning',
  },
  Optional: {
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    calBg: 'bg-teal-100',
    border: 'border-teal-300',
    variant: 'teal',
  },
}

const YEARS = [2025, 2026, 2027]

export function HolidayListPage() {
  const user = useAuthStore((s) => s.user)
  const { holidays, isLoading, yearFilter, fetchHolidays, setYearFilter } =
    useHolidayStore()

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const isHrAdmin =
    user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    fetchHolidays(yearFilter)
  }, [yearFilter, fetchHolidays])

  const holidayMap = useMemo(() => {
    const map = new Map<string, Holiday>()
    holidays.forEach((h) => map.set(h.date, h))
    return map
  }, [holidays])

  // Group holidays by month for list view
  const holidaysByMonth = useMemo(() => {
    const grouped = new Map<number, Holiday[]>()
    const sorted = [...holidays].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    sorted.forEach((h) => {
      const month = new Date(h.date).getMonth()
      const existing = grouped.get(month) || []
      existing.push(h)
      grouped.set(month, existing)
    })
    return grouped
  }, [holidays])

  // Upcoming holidays
  const upcomingHolidays = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return holidays
      .filter((h) => new Date(h.date) >= today)
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .slice(0, 3)
  }, [holidays])

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const renderDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isToday = isSameDay(date, new Date())
    const holiday = holidayMap.get(dateStr)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    return (
      <div
        className={cn(
          'w-full min-h-[60px] p-1 rounded-lg flex flex-col items-start transition-colors',
          isToday && 'ring-2 ring-teal-500',
          isWeekend && !holiday && 'bg-slate-50',
          holiday && HOLIDAY_TYPE_STYLES[holiday.type].calBg,
          holiday?.isOptional && 'border border-dashed',
          holiday?.isOptional && HOLIDAY_TYPE_STYLES[holiday.type].border
        )}
      >
        <span
          className={cn(
            'text-xs font-medium leading-none px-0.5',
            isToday &&
              'bg-teal-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold',
            !isToday && isWeekend && 'text-slate-400',
            !isToday && holiday && holiday.type === 'National' && 'text-red-600',
            !isToday &&
              holiday &&
              holiday.type === 'Regional' &&
              'text-amber-600',
            !isToday && holiday && holiday.type === 'Optional' && 'text-teal-600',
            !isToday && !holiday && !isWeekend && 'text-slate-700'
          )}
        >
          {date.getDate()}
        </span>
        {holiday && (
          <span
            className={cn(
              'text-[9px] leading-tight mt-0.5 px-0.5 truncate w-full',
              holiday.type === 'National' && 'text-red-600 font-medium',
              holiday.type === 'Regional' && 'text-amber-600',
              holiday.type === 'Optional' && 'text-teal-600'
            )}
          >
            {holiday.name}
          </span>
        )}
      </div>
    )
  }

  const listColumns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (item: Holiday) => (
        <span className="text-sm font-medium text-slate-700">
          {formatDate(item.date)}
        </span>
      ),
    },
    {
      key: 'day',
      label: 'Day',
      render: (item: Holiday) => (
        <span className="text-sm text-slate-500">
          {format(new Date(item.date), 'EEEE')}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Holiday',
      render: (item: Holiday) => (
        <span className="text-sm font-medium text-slate-800">{item.name}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (item: Holiday) => (
        <StatusBadge
          variant={
            HOLIDAY_TYPE_STYLES[item.type].variant as
              | 'danger'
              | 'warning'
              | 'teal'
          }
          size="sm"
          dot
        >
          {item.type}
        </StatusBadge>
      ),
    },
    {
      key: 'locations',
      label: 'Locations',
      render: (item: Holiday) => (
        <div className="flex flex-wrap gap-1">
          {item.locations.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600"
            >
              <MapPin className="w-2.5 h-2.5" />
              {loc}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'isOptional',
      label: 'Optional?',
      render: (item: Holiday) =>
        item.isOptional ? (
          <StatusBadge variant="teal" size="xs">
            Optional
          </StatusBadge>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Holiday Calendar"
        subtitle={`Showing holidays for ${yearFilter}`}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Holidays' },
        ]}
        actions={
          isHrAdmin ? (
            <Button
              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Holiday
            </Button>
          ) : undefined
        }
      />

      {/* Year selector + View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {YEARS.map((y) => (
            <Button
              key={y}
              variant={yearFilter === y ? 'default' : 'outline'}
              size="sm"
              className={cn(
                yearFilter === y
                  ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white'
                  : 'bg-white text-slate-700 border-slate-300'
              )}
              onClick={() => {
                setYearFilter(y)
                setCalYear(y)
              }}
            >
              {y}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
              viewMode === 'calendar'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
              viewMode === 'list'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {upcomingHolidays.map((holiday, idx) => {
            const daysUntil = differenceInCalendarDays(
              new Date(holiday.date),
              new Date()
            )
            const style = HOLIDAY_TYPE_STYLES[holiday.type]

            return (
              <div
                key={holiday.id}
                className={cn(
                  'bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all animate-fade-up',
                  idx === 1 && 'stagger-1',
                  idx === 2 && 'stagger-2'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      holiday.type === 'National' && 'bg-red-100 text-red-600',
                      holiday.type === 'Regional' && 'bg-amber-100 text-amber-600',
                      holiday.type === 'Optional' && 'bg-teal-100 text-teal-600'
                    )}
                  >
                    <PartyPopper className="w-5 h-5" />
                  </div>
                  <StatusBadge
                    variant={style.variant as 'danger' | 'warning' | 'teal'}
                    size="xs"
                  >
                    {holiday.type}
                  </StatusBadge>
                </div>
                <h4 className="font-display font-semibold text-slate-800 mb-1">
                  {holiday.name}
                </h4>
                <p className="text-sm text-slate-500 mb-2">
                  {formatDate(holiday.date)} ({format(new Date(holiday.date), 'EEEE')})
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span
                    className={cn(
                      'font-medium',
                      daysUntil === 0
                        ? 'text-teal-600'
                        : daysUntil <= 7
                          ? 'text-amber-600'
                          : 'text-slate-500'
                    )}
                  >
                    {daysUntil === 0
                      ? 'Today!'
                      : daysUntil === 1
                        ? 'Tomorrow'
                        : `${daysUntil} days away`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <CalendarGrid
          month={calMonth}
          year={calYear}
          onMonthChange={(m, y) => {
            setCalMonth(m)
            setCalYear(y)
          }}
          renderDay={renderDay}
          legends={[
            { color: 'bg-red-500', label: 'National' },
            { color: 'bg-amber-500', label: 'Regional' },
            { color: 'bg-teal-500', label: 'Optional' },
          ]}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {Array.from(holidaysByMonth.entries()).map(([monthIdx, monthHolidays]) => (
            <div key={monthIdx}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                {MONTH_NAMES[monthIdx]} {yearFilter}
              </h3>
              <DataTable
                columns={listColumns}
                data={monthHolidays as unknown as Record<string, unknown>[]}
                isLoading={isLoading}
                emptyMessage="No holidays this month"
              />
            </div>
          ))}
          {holidays.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                No holidays found for {yearFilter}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Holiday Dialog (HR Admin only) */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle className="font-display font-semibold text-slate-800">
              Add Holiday
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Add a new holiday to the company calendar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Holiday Name
              </Label>
              <Input
                placeholder="e.g., Diwali"
                className="h-10 bg-white border-slate-300 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Date
                </Label>
                <Input
                  type="date"
                  className="h-10 bg-white border-slate-300 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Type
                </Label>
                <Select>
                  <SelectTrigger className="h-10 bg-white border-slate-300">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOLIDAY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Applicable Locations
              </Label>
              <Input
                placeholder="e.g., All, Maharashtra, Karnataka"
                className="h-10 bg-white border-slate-300 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              onClick={() => {
                toast.success('Holiday added successfully')
                setAddDialogOpen(false)
              }}
            >
              <Plus className="w-4 h-4" />
              Add Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
