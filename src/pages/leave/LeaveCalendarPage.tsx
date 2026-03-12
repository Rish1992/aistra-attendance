import { useEffect, useMemo, useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { Users, X } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { CalendarGrid } from '@/components/shared/CalendarGrid'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useLeaveStore } from '@/stores/leaveStore'
import { useHolidayStore } from '@/stores/holidayStore'
import { useAuthStore } from '@/stores/authStore'
import { LEAVE_TYPE_CONFIG, DEPARTMENTS } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { LeaveType, LeaveApplication } from '@/types/leave'

const TYPE_COLORS: Record<LeaveType, { bg: string; border: string; text: string; pill: string }> = {
  EL: {
    bg: 'bg-teal-100',
    border: 'border-teal-400',
    text: 'text-teal-700',
    pill: 'bg-teal-100 text-teal-700',
  },
  PL: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-700',
    pill: 'bg-blue-100 text-blue-700',
  },
  WFH: {
    bg: 'bg-violet-100',
    border: 'border-violet-400',
    text: 'text-violet-700',
    pill: 'bg-violet-100 text-violet-700',
  },
  OH: {
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-700',
    pill: 'bg-amber-100 text-amber-700',
  },
}

interface DayLeaveInfo {
  leave: LeaveApplication
  type: LeaveType
}

export function LeaveCalendarPage() {
  const user = useAuthStore((s) => s.user)
  const { applications, fetchMyLeaves } = useLeaveStore()
  const { holidays, fetchHolidays } = useHolidayStore()

  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (user?.employeeId) {
      fetchMyLeaves(user.employeeId)
    }
    fetchHolidays(year)
  }, [user?.employeeId, year, fetchMyLeaves, fetchHolidays])

  // Build a map of date string -> leave info array
  const leaveDateMap = useMemo(() => {
    const map = new Map<string, DayLeaveInfo[]>()

    const relevantLeaves = applications.filter(
      (a) => a.status === 'APPROVED' || a.status === 'PENDING'
    )

    for (const leave of relevantLeaves) {
      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      const current = new Date(start)

      while (current <= end) {
        const key = format(current, 'yyyy-MM-dd')
        const existing = map.get(key) || []
        existing.push({ leave, type: leave.leaveType })
        map.set(key, existing)
        current.setDate(current.getDate() + 1)
      }
    }

    return map
  }, [applications])

  const holidayMap = useMemo(() => {
    const map = new Map<string, string>()
    holidays.forEach((h) => map.set(h.date, h.name))
    return map
  }, [holidays])

  const selectedDayLeaves = useMemo(() => {
    if (!selectedDate) return []
    const key = format(selectedDate, 'yyyy-MM-dd')
    return leaveDateMap.get(key) || []
  }, [selectedDate, leaveDateMap])

  const selectedDayHoliday = useMemo(() => {
    if (!selectedDate) return null
    return holidayMap.get(format(selectedDate, 'yyyy-MM-dd')) || null
  }, [selectedDate, holidayMap])

  const renderDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isToday = isSameDay(date, new Date())
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const holiday = holidayMap.get(dateStr)
    const dayLeaves = leaveDateMap.get(dateStr) || []
    const isSelected = selectedDate && isSameDay(date, selectedDate)

    return (
      <button
        type="button"
        onClick={() => setSelectedDate(date)}
        className={cn(
          'w-full min-h-[70px] p-1 rounded-lg text-left transition-all flex flex-col items-start',
          isToday && 'ring-2 ring-teal-500 shadow-sm',
          isWeekend && 'bg-slate-50',
          holiday && 'bg-red-50',
          isSelected && 'ring-2 ring-teal-500 bg-teal-50/30',
          !isWeekend && !holiday && !isSelected && 'hover:bg-slate-50'
        )}
      >
        <span
          className={cn(
            'text-xs font-medium leading-none mb-0.5 px-0.5',
            isToday && 'bg-teal-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold',
            isWeekend && !isToday && 'text-slate-400',
            holiday && !isToday && 'text-red-500',
            !isToday && !isWeekend && !holiday && 'text-slate-700'
          )}
        >
          {date.getDate()}
        </span>

        {holiday && (
          <span className="text-[9px] text-red-500 truncate w-full leading-tight px-0.5">
            {holiday}
          </span>
        )}

        {dayLeaves.slice(0, 2).map((dl, idx) => {
          const colors = TYPE_COLORS[dl.type]
          return (
            <span
              key={idx}
              className={cn(
                'text-[9px] rounded px-1 truncate w-full leading-tight mt-0.5',
                colors.pill,
                dl.leave.status === 'PENDING' && 'border border-dashed',
                dl.leave.status === 'PENDING' && colors.border,
                dl.leave.status === 'APPROVED' && 'border border-solid',
                dl.leave.status === 'APPROVED' && colors.border
              )}
            >
              {dl.leave.employeeName.split(' ')[0]}
            </span>
          )
        })}
        {dayLeaves.length > 2 && (
          <span className="text-[9px] text-slate-400 px-0.5">
            +{dayLeaves.length - 2} more
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Leave Calendar"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Leave', href: '/leave/status' },
          { label: 'Calendar' },
        ]}
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="h-9 w-[180px] bg-white border-slate-300 text-sm">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <CalendarGrid
            month={month}
            year={year}
            onMonthChange={(m, y) => {
              setMonth(m)
              setYear(y)
            }}
            renderDay={renderDay}
            legends={[
              { color: 'bg-teal-500', label: 'Earned Leave' },
              { color: 'bg-blue-500', label: 'Paid Leave' },
              { color: 'bg-violet-500', label: 'Work From Home' },
              { color: 'bg-amber-500', label: 'Optional Holiday' },
              { color: 'bg-red-500', label: 'Holiday' },
            ]}
          />
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-6 h-3 rounded border border-solid border-teal-400 bg-teal-100" />
              Approved
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-6 h-3 rounded border border-dashed border-teal-400 bg-teal-100" />
              Pending
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit animate-fade-up stagger-1">
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-slate-800">
                  {formatDate(selectedDate)}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedDayHoliday && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700">
                    {selectedDayHoliday}
                  </p>
                  <p className="text-xs text-red-500">Holiday</p>
                </div>
              )}

              {selectedDayLeaves.length === 0 && !selectedDayHoliday && (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    No one on leave this day
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {selectedDayLeaves.map((dl, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border',
                      dl.leave.status === 'PENDING'
                        ? 'border-dashed border-slate-300 bg-slate-50'
                        : 'border-slate-200 bg-white'
                    )}
                  >
                    <EmployeeAvatar
                      name={dl.leave.employeeName}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {dl.leave.employeeName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge
                          variant={
                            dl.type === 'EL'
                              ? 'teal'
                              : dl.type === 'PL'
                                ? 'info'
                                : dl.type === 'WFH'
                                  ? 'violet'
                                  : 'warning'
                          }
                          size="xs"
                        >
                          {LEAVE_TYPE_CONFIG[dl.type].shortLabel}
                        </StatusBadge>
                        <StatusBadge
                          variant={
                            dl.leave.status === 'APPROVED'
                              ? 'approved'
                              : 'pending'
                          }
                          size="xs"
                          dot
                        >
                          {dl.leave.status === 'APPROVED'
                            ? 'Approved'
                            : 'Pending'}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-display font-semibold text-slate-700 mb-1">
                Select a Day
              </h3>
              <p className="text-sm text-slate-500">
                Click on any day in the calendar to see who is on leave
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
