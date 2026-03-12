import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Clock,
  MapPin,
  LogIn,
  LogOut,
  CheckCircle2,
  CalendarDays,
  Timer,
  TrendingUp,
  AlertCircle,
  FileText,
  Coffee,
  Monitor,
  CalendarX2,
  Send,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ATTENDANCE_STATUS_CONFIG } from '@/lib/constants'
import { formatHours } from '@/lib/formatters'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { AttendanceStatus, WorkLocation } from '@/types/attendance'

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

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const

function getWeekDates(): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function formatTimeFromString(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export function MarkAttendancePage() {
  const user = useAuthStore((s) => s.user)
  const {
    todayRecord,
    records,
    isLoading,
    fetchMyAttendance,
    checkIn,
    checkOut,
    bulkMarkAttendance,
  } = useAttendanceStore()

  const [location, setLocation] = useState<WorkLocation>('Office')
  const [notes, setNotes] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [selectedMissedDates, setSelectedMissedDates] = useState<Set<string>>(new Set())
  const [bulkReason, setBulkReason] = useState('')
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

  useEffect(() => {
    if (user?.employeeId) {
      fetchMyAttendance(user.employeeId)
    }
  }, [user?.employeeId, fetchMyAttendance])

  // Running timer
  useEffect(() => {
    if (!todayRecord?.checkInTime || todayRecord?.checkOutTime) return

    const [h, m] = todayRecord.checkInTime.split(':').map(Number)
    const checkInDate = new Date()
    checkInDate.setHours(h, m, 0, 0)

    const tick = () => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - checkInDate.getTime()) / 1000)
      setElapsedSeconds(Math.max(0, diff))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [todayRecord?.checkInTime, todayRecord?.checkOutTime])

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleCheckIn = async () => {
    if (!user?.employeeId) return
    await checkIn(user.employeeId, location)
  }

  const handleCheckOut = async () => {
    if (!todayRecord?.id) return
    await checkOut(todayRecord.id)
  }

  const today = new Date()
  const dateString = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Week summary
  const weekDates = getWeekDates()
  const weekSummary = weekDates.map((date) => {
    const dateStr = date.toISOString().split('T')[0]
    const record = records.find((r) => r.date === dateStr)
    const isToday = dateStr === today.toISOString().split('T')[0]
    return { date, dateStr, record, isToday }
  })

  // Month stats
  const monthStats = useMemo(() => {
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const monthRecords = records.filter((r) => {
      const d = new Date(r.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const present = monthRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'WFH' || r.status === 'LATE' || r.status === 'HALF_DAY'
    ).length
    const late = monthRecords.filter((r) => r.status === 'LATE').length
    const wfh = monthRecords.filter((r) => r.status === 'WFH').length
    const withHours = monthRecords.filter((r) => r.totalHours != null)
    const avgHours =
      withHours.length > 0
        ? withHours.reduce((sum, r) => sum + (r.totalHours ?? 0), 0) / withHours.length
        : 0

    return { present, late, wfh, avgHours }
  }, [records, today])

  const isCheckedIn = !!todayRecord?.checkInTime && !todayRecord?.checkOutTime
  const isCheckedOut = !!todayRecord?.checkOutTime

  // Missed days: weekdays in the current month (before today) with no attendance record
  const missedDays = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0]
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const recordedDates = new Set(records.map((r) => r.date))

    const missed: string[] = []
    const cursor = new Date(firstOfMonth)
    while (cursor < today) {
      const dayOfWeek = cursor.getDay()
      const dateStr = cursor.toISOString().split('T')[0]
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && dateStr !== todayStr && !recordedDates.has(dateStr)) {
        missed.push(dateStr)
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    return missed
  }, [records, today])

  const toggleMissedDate = useCallback((dateStr: string) => {
    setSelectedMissedDates((prev) => {
      const next = new Set(prev)
      if (next.has(dateStr)) next.delete(dateStr)
      else next.add(dateStr)
      return next
    })
  }, [])

  const toggleAllMissedDates = useCallback(() => {
    setSelectedMissedDates((prev) => {
      if (prev.size === missedDays.length) return new Set()
      return new Set(missedDays)
    })
  }, [missedDays])

  const handleBulkSubmit = async () => {
    if (!user?.employeeId) return
    if (selectedMissedDates.size === 0) {
      toast.error('Please select at least one missed day')
      return
    }
    if (!bulkReason.trim()) {
      toast.error('Please provide a reason for the missed attendance')
      return
    }

    setIsBulkSubmitting(true)
    try {
      const entries = Array.from(selectedMissedDates).map((date) => ({
        date,
        reason: bulkReason.trim(),
      }))
      await bulkMarkAttendance(user.employeeId, entries)
      toast.success(`Attendance marked for ${entries.length} day${entries.length > 1 ? 's' : ''}`)
      setSelectedMissedDates(new Set())
      setBulkReason('')
    } catch {
      toast.error('Failed to mark bulk attendance')
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  const statusDotColor = (status?: AttendanceStatus) => {
    if (!status) return 'bg-slate-300'
    switch (status) {
      case 'PRESENT': return 'bg-emerald-500'
      case 'LATE': return 'bg-amber-500'
      case 'WFH': return 'bg-blue-500'
      case 'ABSENT': return 'bg-red-500'
      case 'HALF_DAY': return 'bg-orange-500'
      case 'ON_LEAVE': return 'bg-violet-500'
      default: return 'bg-slate-300'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Mark Attendance"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Mark' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Attendance Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 animate-fade-up">
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-800">
                  Today's Attendance
                </h2>
                <p className="text-sm text-slate-500">{dateString}</p>
              </div>
              {todayRecord && (
                <div className="ml-auto">
                  <StatusBadge
                    variant={STATUS_BADGE_MAP[todayRecord.status]}
                    dot
                    size="lg"
                  >
                    {ATTENDANCE_STATUS_CONFIG[todayRecord.status].label}
                  </StatusBadge>
                </div>
              )}
            </div>

            {/* Not Checked In */}
            {!todayRecord?.checkInTime && (
              <div className="flex flex-col items-center py-8">
                <div className="relative mb-6">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-b from-teal-500 to-teal-600 flex items-center justify-center shadow-lg animate-ring cursor-pointer hover:scale-105 transition-transform"
                    onClick={handleCheckIn}
                  >
                    <Clock className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-3 rounded-full border-2 border-teal-300/40 animate-ping pointer-events-none" />
                </div>

                <p className="text-slate-600 font-medium mb-1">
                  Mark your attendance for today
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  Click the button above or fill in details below
                </p>

                <div className="w-full max-w-md space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                      Work Location
                    </label>
                    <Select value={location} onValueChange={(v) => setLocation(v as WorkLocation)}>
                      <SelectTrigger className="w-full h-10 bg-white border-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Office">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            Office
                          </div>
                        </SelectItem>
                        <SelectItem value="WFH">
                          <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4" />
                            Work From Home
                          </div>
                        </SelectItem>
                        <SelectItem value="Client Site">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Client Site
                          </div>
                        </SelectItem>
                        <SelectItem value="Remote">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Remote
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                      Notes (Optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes for today..."
                      className="resize-none bg-white border-slate-300 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
                      rows={2}
                    />
                  </div>

                  <button
                    onClick={handleCheckIn}
                    disabled={isLoading}
                    className="w-full h-11 rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 text-white font-medium shadow-sm hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    {isLoading ? 'Checking in...' : 'Check In Now'}
                  </button>
                </div>
              </div>
            )}

            {/* Checked In - Running Timer */}
            {isCheckedIn && (
              <div className="flex flex-col items-center py-8">
                <div className="w-28 h-28 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mb-4">
                  <Timer className="w-12 h-12 text-emerald-600" />
                </div>

                <p className="text-sm text-slate-500 mb-1">Checked in at</p>
                <p className="font-display text-xl font-bold text-slate-800 mb-4">
                  {formatTimeFromString(todayRecord.checkInTime!)}
                </p>

                <div className="bg-slate-50 rounded-xl px-8 py-4 mb-4">
                  <p className="text-xs text-slate-400 uppercase tracking-widest text-center mb-1">
                    Time Elapsed
                  </p>
                  <p className="font-display text-4xl font-bold text-teal-600 tabular-nums tracking-wide">
                    {formatElapsed(elapsedSeconds)}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
                  <MapPin className="w-4 h-4" />
                  <span>{todayRecord.workLocation}</span>
                </div>

                <button
                  onClick={handleCheckOut}
                  disabled={isLoading}
                  className="h-11 px-8 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoading ? 'Checking out...' : 'Check Out'}
                </button>
              </div>
            )}

            {/* Checked Out - Summary */}
            {isCheckedOut && (
              <div className="flex flex-col items-center py-8">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>

                <p className="font-display text-lg font-semibold text-slate-800 mb-6">
                  Attendance Recorded
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-lg">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <LogIn className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-400 mb-0.5">Check In</p>
                    <p className="font-display font-bold text-slate-800">
                      {formatTimeFromString(todayRecord!.checkInTime!)}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <LogOut className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-400 mb-0.5">Check Out</p>
                    <p className="font-display font-bold text-slate-800">
                      {formatTimeFromString(todayRecord!.checkOutTime!)}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <Clock className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-400 mb-0.5">Total Hours</p>
                    <p className="font-display font-bold text-slate-800">
                      {todayRecord!.totalHours != null
                        ? formatHours(todayRecord!.totalHours)
                        : '--'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <MapPin className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-400 mb-0.5">Location</p>
                    <p className="font-display font-bold text-slate-800 text-sm">
                      {todayRecord!.workLocation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Mark Attendance — Missed Days */}
          {missedDays.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <CalendarX2 className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-slate-800 text-sm">
                    Bulk Mark Attendance
                  </h3>
                  <p className="text-xs text-slate-400">
                    {missedDays.length} missed day{missedDays.length > 1 ? 's' : ''} this month
                  </p>
                </div>
                {missedDays.length > 1 && (
                  <button
                    onClick={toggleAllMissedDates}
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    {selectedMissedDates.size === missedDays.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Missed days grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                {missedDays.map((dateStr) => {
                  const d = new Date(dateStr + 'T00:00:00')
                  const isSelected = selectedMissedDates.has(dateStr)
                  return (
                    <button
                      key={dateStr}
                      onClick={() => toggleMissedDate(dateStr)}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-all',
                        isSelected
                          ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      )}
                    >
                      <p className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-teal-700' : 'text-slate-700'
                      )}>
                        {d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
                      </p>
                      <p className={cn(
                        'text-xs',
                        isSelected ? 'text-teal-500' : 'text-slate-400'
                      )}>
                        {d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </p>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-teal-500 mt-1" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Reason input + submit */}
              {selectedMissedDates.size > 0 && (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">
                      {selectedMissedDates.size} day{selectedMissedDates.size > 1 ? 's' : ''} selected
                    </p>
                    <button
                      onClick={() => setSelectedMissedDates(new Set())}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                      Reason <span className="text-red-400">*</span>
                    </label>
                    <Textarea
                      value={bulkReason}
                      onChange={(e) => setBulkReason(e.target.value)}
                      placeholder="Explain why attendance was missed (e.g., forgot to mark, system issue, travel)..."
                      className="resize-none bg-white border-slate-300 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
                      rows={2}
                    />
                  </div>

                  <button
                    onClick={handleBulkSubmit}
                    disabled={isBulkSubmitting || !bulkReason.trim()}
                    className="w-full h-11 rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 text-white font-medium shadow-sm hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isBulkSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Mark Attendance for {selectedMissedDates.size} Day{selectedMissedDates.size > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status Classification Rules */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-1">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <h3 className="font-display font-semibold text-slate-800 text-sm">
                Auto-Classification Rules
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { status: 'PRESENT', rule: 'Check-in before 10:00 AM, 9+ hours worked', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                { status: 'LATE', rule: 'Check-in after 10:00 AM', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                { status: 'HALF_DAY', rule: 'Less than 4.5 hours worked', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                { status: 'WFH', rule: 'Checked in from WFH location', color: 'bg-blue-50 border-blue-200 text-blue-700' },
              ].map((item) => (
                <div
                  key={item.status}
                  className={cn(
                    'rounded-lg border p-3 flex items-start gap-3',
                    item.color
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full mt-1.5 shrink-0',
                      ATTENDANCE_STATUS_CONFIG[item.status as AttendanceStatus].dotColor
                    )}
                  />
                  <div>
                    <p className="text-xs font-semibold">
                      {ATTENDANCE_STATUS_CONFIG[item.status as AttendanceStatus].label}
                    </p>
                    <p className="text-xs opacity-75 mt-0.5">{item.rule}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* This Week Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-1">
            <h3 className="font-display font-semibold text-slate-800 text-sm mb-4">
              This Week
            </h3>
            <div className="space-y-2">
              {weekSummary.map((day, idx) => (
                <div
                  key={day.dateStr}
                  className={cn(
                    'flex items-center justify-between py-2 px-3 rounded-lg transition-colors',
                    day.isToday ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-2.5 h-2.5 rounded-full shrink-0',
                        day.record ? statusDotColor(day.record.status) : 'bg-slate-200'
                      )}
                    />
                    <div>
                      <p className={cn(
                        'text-sm font-medium',
                        day.isToday ? 'text-teal-700' : 'text-slate-700'
                      )}>
                        {WEEK_DAYS[idx]}
                      </p>
                      <p className="text-xs text-slate-400">
                        {day.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {day.record ? (
                      <StatusBadge
                        variant={STATUS_BADGE_MAP[day.record.status]}
                        size="xs"
                      >
                        {ATTENDANCE_STATUS_CONFIG[day.record.status].label}
                      </StatusBadge>
                    ) : (
                      <span className="text-xs text-slate-300">--</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Month Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Present"
              value={monthStats.present}
              icon={CheckCircle2}
              color="teal"
              index={0}
            />
            <StatCard
              label="Late"
              value={monthStats.late}
              icon={AlertCircle}
              color="amber"
              index={1}
            />
            <StatCard
              label="WFH Days"
              value={monthStats.wfh}
              icon={Coffee}
              color="blue"
              index={2}
            />
            <StatCard
              label="Avg Hours"
              value={monthStats.avgHours > 0 ? formatHours(monthStats.avgHours) : '--'}
              icon={TrendingUp}
              color="violet"
              index={3}
            />
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-3">
            <h3 className="font-display font-semibold text-slate-800 text-sm mb-3">
              Quick Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Standard work hours: <strong>9 hours</strong></span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Work start time: <strong>9:30 AM</strong></span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Late threshold: <strong>10:00 AM</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
