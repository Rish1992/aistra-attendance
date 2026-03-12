import { useEffect, useState, useMemo } from 'react'
import {
  CalendarDays,
  List,
  CheckCircle2,
  AlertCircle,
  Coffee,
  TrendingUp,
  Clock,
  MapPin,
  FileText,
  CalendarRange,
  ChevronDown,
} from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  isWithinInterval,
  parseISO,
} from 'date-fns'
import { cn } from '@/lib/utils'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CalendarGrid } from '@/components/shared/CalendarGrid'
import { DataTable } from '@/components/shared/DataTable'
import { ATTENDANCE_STATUS_CONFIG } from '@/lib/constants'
import { formatHours } from '@/lib/formatters'
import type { AttendanceRecord, AttendanceStatus } from '@/types/attendance'

const STATUS_BADGE_MAP: Record<AttendanceStatus, 'present' | 'absent' | 'late' | 'wfh' | 'halfday' | 'violet' | 'default'> = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  WFH: 'wfh',
  HALF_DAY: 'halfday',
  ON_LEAVE: 'violet',
  HOLIDAY: 'default',
  WEEKEND: 'default',
}

const STATUS_DAY_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-emerald-500 text-white',
  ABSENT: 'bg-red-500 text-white',
  LATE: 'bg-amber-500 text-white',
  WFH: 'bg-blue-500 text-white',
  HALF_DAY: 'bg-orange-500 text-white',
  ON_LEAVE: 'bg-violet-500 text-white',
  HOLIDAY: 'bg-slate-200 text-slate-500',
  WEEKEND: 'bg-slate-100 text-slate-400',
}

const CALENDAR_LEGENDS = [
  { color: 'bg-emerald-500', label: 'Present' },
  { color: 'bg-amber-500', label: 'Late' },
  { color: 'bg-blue-500', label: 'WFH' },
  { color: 'bg-red-500', label: 'Absent' },
  { color: 'bg-orange-500', label: 'Half-Day' },
  { color: 'bg-violet-500', label: 'On Leave' },
  { color: 'bg-slate-200', label: 'Weekend / Holiday' },
]

type QuickRange = 'this_month' | 'last_month' | 'last_3_months' | 'custom'

const QUICK_RANGE_OPTIONS: { value: QuickRange; label: string }[] = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'custom', label: 'Custom Range' },
]

function getQuickRangeDates(range: QuickRange): { from: Date; to: Date } {
  const today = new Date()
  switch (range) {
    case 'this_month':
      return { from: startOfMonth(today), to: endOfMonth(today) }
    case 'last_month': {
      const lastMonth = subMonths(today, 1)
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
    }
    case 'last_3_months': {
      const threeMonthsAgo = subMonths(today, 2)
      return { from: startOfMonth(threeMonthsAgo), to: endOfMonth(today) }
    }
    case 'custom':
      return { from: startOfMonth(today), to: endOfMonth(today) }
  }
}

function formatTimeFromString(time?: string): string {
  if (!time) return '--'
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function getDayName(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })
}

function formatDateDisplay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function AttendanceHistoryPage() {
  const user = useAuthStore((s) => s.user)
  const { records, isLoading, fetchMyAttendance } = useAttendanceStore()

  const today = new Date()
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar')
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Date range state
  const [quickRange, setQuickRange] = useState<QuickRange>('this_month')
  const [fromDate, setFromDate] = useState<string>(toDateString(startOfMonth(today)))
  const [toDate, setToDate] = useState<string>(toDateString(endOfMonth(today)))
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  useEffect(() => {
    if (user?.employeeId) {
      fetchMyAttendance(user.employeeId)
    }
  }, [user?.employeeId, fetchMyAttendance])

  // When quick range changes (not custom), update from/to dates
  const handleQuickRangeChange = (range: QuickRange) => {
    setQuickRange(range)
    setShowQuickMenu(false)
    if (range !== 'custom') {
      const { from, to } = getQuickRangeDates(range)
      setFromDate(toDateString(from))
      setToDate(toDateString(to))
      // Sync calendar month to the start of the range
      setMonth(from.getMonth())
      setYear(from.getFullYear())
    }
    setSelectedDate(null)
  }

  // When custom dates change, switch to custom mode
  const handleFromDateChange = (value: string) => {
    setFromDate(value)
    setQuickRange('custom')
    setSelectedDate(null)
    if (value) {
      const d = parseISO(value)
      setMonth(d.getMonth())
      setYear(d.getFullYear())
    }
  }

  const handleToDateChange = (value: string) => {
    setToDate(value)
    setQuickRange('custom')
    setSelectedDate(null)
  }

  // Filter records by date range
  const rangeRecords = useMemo(() => {
    if (!fromDate || !toDate) return records
    const from = parseISO(fromDate)
    const to = parseISO(toDate)
    return records.filter((r) => {
      const d = parseISO(r.date)
      return isWithinInterval(d, { start: from, end: to })
    })
  }, [records, fromDate, toDate])

  // Filter records for current calendar view month (for calendar rendering)
  const monthRecords = useMemo(() => {
    return records.filter((r) => {
      const d = new Date(r.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
  }, [records, month, year])

  // Build a date -> record map
  const recordMap = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {}
    for (const r of records) {
      map[r.date] = r
    }
    return map
  }, [records])

  // Stats based on date range filtered records
  const stats = useMemo(() => {
    const present = rangeRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'WFH' || r.status === 'LATE' || r.status === 'HALF_DAY'
    ).length
    const late = rangeRecords.filter((r) => r.status === 'LATE').length
    const wfh = rangeRecords.filter((r) => r.status === 'WFH').length
    const withHours = rangeRecords.filter((r) => r.totalHours != null)
    const avgHours =
      withHours.length > 0
        ? withHours.reduce((sum, r) => sum + (r.totalHours ?? 0), 0) / withHours.length
        : 0
    return { present, late, wfh, avgHours }
  }, [rangeRecords])

  // Selected date record
  const selectedRecord = selectedDate ? recordMap[selectedDate] : null

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth)
    setYear(newYear)
    setSelectedDate(null)
  }

  const hoursColor = (hours?: number) => {
    if (hours == null) return 'text-slate-400'
    if (hours >= 9) return 'text-emerald-600'
    if (hours >= 4.5) return 'text-amber-600'
    return 'text-red-600'
  }

  // Table columns
  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (item: AttendanceRecord) => (
        <span className="font-medium text-slate-800">
          {formatDateDisplay(item.date)}
        </span>
      ),
    },
    {
      key: 'day',
      label: 'Day',
      render: (item: AttendanceRecord) => (
        <span className="text-slate-500">{getDayName(item.date)}</span>
      ),
    },
    {
      key: 'checkInTime',
      label: 'Check In',
      sortable: true,
      render: (item: AttendanceRecord) => (
        <span className="text-slate-700">
          {formatTimeFromString(item.checkInTime)}
        </span>
      ),
    },
    {
      key: 'checkOutTime',
      label: 'Check Out',
      sortable: true,
      render: (item: AttendanceRecord) => (
        <span className="text-slate-700">
          {formatTimeFromString(item.checkOutTime)}
        </span>
      ),
    },
    {
      key: 'totalHours',
      label: 'Total Hours',
      sortable: true,
      render: (item: AttendanceRecord) => (
        <span className={cn('font-medium', hoursColor(item.totalHours))}>
          {item.totalHours != null ? formatHours(item.totalHours) : '--'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: AttendanceRecord) => (
        <StatusBadge variant={STATUS_BADGE_MAP[item.status]} dot size="sm">
          {ATTENDANCE_STATUS_CONFIG[item.status].label}
        </StatusBadge>
      ),
    },
    {
      key: 'workLocation',
      label: 'Location',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>{item.workLocation}</span>
        </div>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (item: AttendanceRecord) => (
        <span className="text-slate-400 text-xs max-w-[150px] truncate block">
          {item.notes || '--'}
        </span>
      ),
    },
  ]

  // Sort records descending for table — use rangeRecords
  const sortedRangeRecords = useMemo(() => {
    return [...rangeRecords].sort((a, b) => b.date.localeCompare(a.date))
  }, [rangeRecords])

  // Formatted range label for display
  const rangeDateLabel = useMemo(() => {
    if (!fromDate || !toDate) return ''
    return `${format(parseISO(fromDate), 'MMM d, yyyy')} — ${format(parseISO(toDate), 'MMM d, yyyy')}`
  }, [fromDate, toDate])

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Attendance History"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'History' },
        ]}
        actions={
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'calendar'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <CalendarDays className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'table'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <List className="w-4 h-4" />
              Table
            </button>
          </div>
        }
      />

      {/* Date Range Picker */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Quick Select Dropdown */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              Period
            </label>
            <button
              type="button"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className={cn(
                'h-10 px-3 bg-white border border-slate-300 rounded-lg flex items-center gap-2 text-sm font-medium text-slate-700',
                'hover:border-slate-400 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all',
                'min-w-[160px] justify-between'
              )}
            >
              <div className="flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-teal-500" />
                {QUICK_RANGE_OPTIONS.find((o) => o.value === quickRange)?.label}
              </div>
              <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', showQuickMenu && 'rotate-180')} />
            </button>
            {showQuickMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowQuickMenu(false)} />
                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[160px] animate-fade-in">
                  {QUICK_RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleQuickRangeChange(option.value)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm transition-colors',
                        quickRange === option.value
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* From Date */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFromDateChange(e.target.value)}
              className={cn(
                'h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700',
                'focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all'
              )}
            />
          </div>

          {/* To Date */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
              To
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => handleToDateChange(e.target.value)}
              className={cn(
                'h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700',
                'focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all'
              )}
            />
          </div>

          {/* Range summary */}
          <div className="flex-1 flex items-center justify-end">
            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{rangeRecords.length}</span>{' '}
              records in range
              {rangeDateLabel && (
                <span className="hidden lg:inline text-slate-400 ml-2">
                  ({rangeDateLabel})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Days Present"
          value={stats.present}
          icon={CheckCircle2}
          color="teal"
          index={0}
        />
        <StatCard
          label="Days Late"
          value={stats.late}
          icon={AlertCircle}
          color="amber"
          index={1}
        />
        <StatCard
          label="WFH Days"
          value={stats.wfh}
          icon={Coffee}
          color="blue"
          index={2}
        />
        <StatCard
          label="Average Hours"
          value={stats.avgHours > 0 ? formatHours(stats.avgHours) : '--'}
          icon={TrendingUp}
          color="violet"
          index={3}
        />
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarGrid
              month={month}
              year={year}
              onMonthChange={handleMonthChange}
              legends={CALENDAR_LEGENDS}
              renderDay={(date) => {
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                const record = recordMap[dateStr]
                const dayOfWeek = date.getDay()
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                const isToday = dateStr === today.toISOString().split('T')[0]
                const isSelected = dateStr === selectedDate
                const isInRange =
                  fromDate && toDate && dateStr >= fromDate && dateStr <= toDate

                let cellClass = 'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all'

                if (isSelected) {
                  cellClass += ' ring-2 ring-teal-500 ring-offset-2'
                }

                if (!isInRange) {
                  cellClass += ' opacity-30'
                }

                if (isToday && !record) {
                  cellClass += ' bg-teal-500 text-white font-bold shadow-sm'
                } else if (record) {
                  cellClass += ` ${STATUS_DAY_COLORS[record.status]}`
                } else if (isWeekend) {
                  cellClass += ' bg-slate-50 text-slate-300'
                } else {
                  cellClass += ' text-slate-600 hover:bg-slate-100'
                }

                return (
                  <button
                    type="button"
                    className={cellClass}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    {date.getDate()}
                  </button>
                )
              }}
            />
          </div>

          {/* Day Detail Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-in">
            {selectedDate && selectedRecord ? (
              <div>
                <h3 className="font-display font-semibold text-slate-800 mb-1">
                  {formatDateDisplay(selectedDate)}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {getDayName(selectedDate)}
                </p>

                <div className="mb-4">
                  <StatusBadge
                    variant={STATUS_BADGE_MAP[selectedRecord.status]}
                    dot
                    size="lg"
                  >
                    {ATTENDANCE_STATUS_CONFIG[selectedRecord.status].label}
                  </StatusBadge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Check In</p>
                      <p className="text-sm font-medium text-slate-700">
                        {formatTimeFromString(selectedRecord.checkInTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-4 h-4 text-red-500 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Check Out</p>
                      <p className="text-sm font-medium text-slate-700">
                        {formatTimeFromString(selectedRecord.checkOutTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-teal-500 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Total Hours</p>
                      <p className={cn('text-sm font-medium', hoursColor(selectedRecord.totalHours))}>
                        {selectedRecord.totalHours != null
                          ? formatHours(selectedRecord.totalHours)
                          : '--'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="text-sm font-medium text-slate-700">
                        {selectedRecord.workLocation}
                      </p>
                    </div>
                  </div>

                  {selectedRecord.notes && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400">Notes</p>
                        <p className="text-sm text-slate-600">
                          {selectedRecord.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedRecord.isEdited && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs font-medium text-amber-700">
                        Edited by admin
                      </p>
                      {selectedRecord.editReason && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          {selectedRecord.editReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : selectedDate ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="font-display font-semibold text-slate-800 mb-1">
                  {formatDateDisplay(selectedDate)}
                </h3>
                <p className="text-sm text-slate-400">
                  No attendance record for this date
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">
                  Select a day to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          columns={columns}
          data={sortedRangeRecords as unknown as Record<string, unknown>[]}
          isLoading={isLoading}
          emptyMessage="No attendance records found for the selected date range"
        />
      )}
    </div>
  )
}
