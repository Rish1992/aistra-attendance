import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import { format } from 'date-fns'
import {
  Clock,
  CalendarDays,
  FileText,
  Users,
  UserPlus,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Timer,
  Palmtree,
  Building2,
  Laptop,
  AlertCircle,
  ArrowRight,
  LogIn,
  LogOut,
  Send,
  Eye,
  FolderOpen,
  Loader2,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useAuthStore } from '@/stores/authStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useLeaveStore } from '@/stores/leaveStore'
import { useEmployeeStore } from '@/stores/employeeStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import { formatDate, formatRelativeTime } from '@/lib/formatters'
import { LEAVE_TYPE_CONFIG, LEAVE_STATUS_CONFIG } from '@/lib/constants'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { todayRecord, fetchMyAttendance, checkIn, checkOut, isLoading: attLoading } = useAttendanceStore()
  const { applications, balances, pendingApprovals, fetchMyLeaves, fetchBalances, fetchPendingApprovals } = useLeaveStore()
  const { employees, fetchEmployees } = useEmployeeStore()
  const { checklists, fetchChecklists } = useOnboardingStore()
  const { teamRecords, fetchTeamAttendance } = useAttendanceStore()

  const [holidays, setHolidays] = useState<{ id: string; name: string; date: string; type: string }[]>([])
  const [checkInLocation, setCheckInLocation] = useState('Office')
  const [elapsedTime, setElapsedTime] = useState('')

  const role = user?.role ?? 'EMPLOYEE'
  const isManager = role === 'MANAGER' || role === 'HR_ADMIN' || role === 'SUPER_ADMIN'
  const isAdmin = role === 'HR_ADMIN' || role === 'SUPER_ADMIN'

  useEffect(() => {
    if (!user) return
    fetchMyAttendance(user.employeeId)
    fetchMyLeaves(user.employeeId)
    fetchBalances(user.employeeId)
    loadHolidays()
    if (isManager) {
      fetchPendingApprovals(user.id)
      fetchTeamAttendance(user.id, new Date().toISOString().split('T')[0])
    }
    if (isAdmin) {
      fetchEmployees()
      fetchChecklists()
    }
  }, [user])

  useEffect(() => {
    if (!todayRecord?.checkInTime || todayRecord?.checkOutTime) return
    const interval = setInterval(() => {
      const [h, m] = todayRecord.checkInTime!.split(':').map(Number)
      const checkInDate = new Date()
      checkInDate.setHours(h, m, 0, 0)
      const diff = Date.now() - checkInDate.getTime()
      if (diff < 0) return
      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setElapsedTime(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [todayRecord])

  const loadHolidays = async () => {
    const { getHolidays } = await import('@/mock/handlers')
    const hols = await getHolidays(2026)
    setHolidays(hols)
  }

  const handleCheckIn = async () => {
    if (!user) return
    await checkIn(user.employeeId, checkInLocation)
  }

  const handleCheckOut = async () => {
    if (!todayRecord?.id) return
    await checkOut(todayRecord.id)
  }

  const upcomingHolidays = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return holidays
      .filter((h) => h.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3)
  }, [holidays])

  const recentLeaves = useMemo(
    () =>
      [...applications]
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 5),
    [applications]
  )

  const totalLeaveBalance = useMemo(
    () => balances.reduce((sum, b) => sum + b.remaining, 0),
    [balances]
  )

  const pendingCount = useMemo(
    () => applications.filter((a) => a.status === 'PENDING').length,
    [applications]
  )

  const teamSummary = useMemo(() => {
    const summary = { present: 0, wfh: 0, leave: 0, late: 0, absent: 0 }
    teamRecords.forEach((r) => {
      if (r.status === 'PRESENT') summary.present++
      else if (r.status === 'WFH') summary.wfh++
      else if (r.status === 'ON_LEAVE') summary.leave++
      else if (r.status === 'LATE') summary.late++
      else if (r.status === 'ABSENT') summary.absent++
    })
    return summary
  }, [teamRecords])

  const teamPieData = useMemo(() => {
    return [
      { name: 'Present', value: teamSummary.present, color: '#10B981' },
      { name: 'WFH', value: teamSummary.wfh, color: '#3B82F6' },
      { name: 'On Leave', value: teamSummary.leave, color: '#8B5CF6' },
      { name: 'Late', value: teamSummary.late, color: '#F59E0B' },
      { name: 'Absent', value: teamSummary.absent, color: '#EF4444' },
    ].filter((d) => d.value > 0)
  }, [teamSummary])

  const attendanceTrend = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayLabel = format(d, 'EEE')
      const total = employees.length || 20
      const present = Math.round(total * (0.7 + Math.random() * 0.2))
      const absent = Math.max(0, Math.round((total - present) * 0.3))
      const wfh = Math.max(0, total - present - absent)
      days.push({ day: dayLabel, Present: present, Absent: absent, WFH: wfh })
    }
    return days
  }, [employees])

  const orgStats = useMemo(() => {
    const total = employees.length
    const thisMonth = new Date().toISOString().slice(0, 7)
    const newJoiners = employees.filter((e) => e.dateOfJoining.startsWith(thisMonth)).length
    const activeOnboardings = checklists.filter((c) => c.overallProgress < 100).length
    return { total, newJoiners, activeOnboardings }
  }, [employees, checklists])

  const leaveStatusVariant = (status: string) => {
    const map: Record<string, 'pending' | 'approved' | 'rejected' | 'default'> = {
      PENDING: 'pending',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      CANCELLED: 'default',
    }
    return map[status] ?? 'default'
  }

  const holidayTypeBadge = (type: string) => {
    const map: Record<string, 'danger' | 'info' | 'violet'> = {
      National: 'danger',
      Regional: 'info',
      Optional: 'violet',
    }
    return map[type] ?? 'info'
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 rounded-2xl p-6 sm:p-8 text-white animate-fade-up">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTEydjRoMTJ6TTI0IDI0aDEydi0ySDI0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Welcome back, {user.firstName}
            </h1>
            <p className="text-teal-100 mt-1 text-sm sm:text-base">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} &middot; {user.designation}, {user.department}
            </p>
          </div>
          <StatusBadge variant="teal" size="lg" className="bg-white/20 text-white border-white/30 self-start">
            {role.replace('_', ' ')}
          </StatusBadge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up stagger-1">
        {[
          { label: 'Mark Attendance', icon: LogIn, href: '/attendance/mark', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
          { label: 'Apply Leave', icon: Send, href: '/leave/apply', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
          { label: 'View Balance', icon: Eye, href: '/leave/balance', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
          { label: 'My Documents', icon: FolderOpen, href: '/documents', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
        ].map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', action.color)}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-700">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Status" value={todayRecord?.checkInTime ?? 'Not Checked In'} icon={Clock} color="teal" index={0} />
        <StatCard label="Leave Balance" value={totalLeaveBalance} icon={CalendarDays} color="blue" index={1} />
        <StatCard label="Pending Requests" value={pendingCount} icon={FileText} color="violet" index={2} />
        <StatCard label="Documents" value="Up to date" icon={FolderOpen} color="amber" index={3} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-2">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Today's Attendance</h3>
          {todayRecord?.checkInTime ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Checked In</p>
                    <p className="text-xs text-slate-500">{todayRecord.checkInTime} &middot; {todayRecord.workLocation}</p>
                  </div>
                </div>
                <StatusBadge
                  variant={todayRecord.status === 'PRESENT' ? 'present' : todayRecord.status === 'LATE' ? 'late' : todayRecord.status === 'WFH' ? 'wfh' : 'default'}
                  size="sm"
                >
                  {todayRecord.status}
                </StatusBadge>
              </div>
              {!todayRecord.checkOutTime && (
                <>
                  <div className="text-center py-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Time Elapsed</p>
                    <p className="font-display text-3xl font-bold text-slate-900 tabular-nums">{elapsedTime || '00:00:00'}</p>
                  </div>
                  <button
                    onClick={handleCheckOut}
                    disabled={attLoading}
                    className="w-full h-10 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    {attLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    Check Out
                  </button>
                </>
              )}
              {todayRecord.checkOutTime && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Checked out at {todayRecord.checkOutTime}</span>
                  </div>
                  {todayRecord.totalHours && (
                    <span className="text-sm font-medium text-slate-700">{todayRecord.totalHours.toFixed(1)}h</span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3 animate-ring">
                    <LogIn className="w-7 h-7 text-teal-600" />
                  </div>
                  <p className="text-sm text-slate-500">You haven't checked in today</p>
                </div>
              </div>
              <select
                value={checkInLocation}
                onChange={(e) => setCheckInLocation(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="Office">Office</option>
                <option value="WFH">Work From Home</option>
                <option value="Client Site">Client Site</option>
                <option value="Remote">Remote</option>
              </select>
              <button
                onClick={handleCheckIn}
                disabled={attLoading}
                className="w-full h-10 bg-gradient-to-b from-teal-500 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {attLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Check In
              </button>
            </div>
          )}
        </div>

        {/* Leave Balance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-slate-800">Leave Balance</h3>
            <Link to="/leave/balance" className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['EL', 'PL', 'WFH', 'OH'] as const).map((type) => {
              const balance = balances.find((b) => b.type === type)
              const config = LEAVE_TYPE_CONFIG[type]
              const bgMap: Record<string, string> = { teal: 'bg-teal-50 border-teal-100', blue: 'bg-blue-50 border-blue-100', violet: 'bg-violet-50 border-violet-100', amber: 'bg-amber-50 border-amber-100' }
              const txtMap: Record<string, string> = { teal: 'text-teal-700', blue: 'text-blue-700', violet: 'text-violet-700', amber: 'text-amber-700' }
              const barMap: Record<string, string> = { teal: 'bg-teal-500', blue: 'bg-blue-500', violet: 'bg-violet-500', amber: 'bg-amber-500' }
              return (
                <div key={type} className={cn('rounded-xl border p-3', bgMap[config.color])}>
                  <p className="text-xs font-medium text-slate-500 mb-1">{config.shortLabel}</p>
                  <p className={cn('font-display text-2xl font-bold', txtMap[config.color])}>{balance?.remaining ?? 0}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/60 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', barMap[config.color])}
                      style={{ width: `${balance ? (balance.remaining / balance.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{balance?.remaining ?? 0} / {balance?.total ?? config.annual} remaining</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-slate-800">Upcoming Holidays</h3>
            <Link to="/holidays" className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingHolidays.length === 0 ? (
            <EmptyState icon={Palmtree} title="No upcoming holidays" description="Check back later for holiday announcements" />
          ) : (
            <div className="space-y-3">
              {upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">{format(new Date(holiday.date), 'MMM')}</span>
                    <span className="font-display text-lg font-bold text-slate-800 leading-none">{format(new Date(holiday.date), 'd')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{holiday.name}</p>
                    <p className="text-xs text-slate-400">{format(new Date(holiday.date), 'EEEE')}</p>
                  </div>
                  <StatusBadge variant={holidayTypeBadge(holiday.type)} size="xs">{holiday.type}</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-slate-800">Recent Leave Requests</h3>
          <Link to="/leave/status" className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentLeaves.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No leave requests" description="You haven't applied for any leaves yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Type', 'Dates', 'Days', 'Status', 'Applied'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map((leave) => (
                  <tr key={leave.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 pr-4 text-sm font-medium text-slate-700">
                      {LEAVE_TYPE_CONFIG[leave.leaveType as keyof typeof LEAVE_TYPE_CONFIG]?.shortLabel ?? leave.leaveType}
                    </td>
                    <td className="py-2.5 pr-4 text-sm text-slate-600">
                      {formatDate(leave.startDate)}{leave.startDate !== leave.endDate ? ` - ${formatDate(leave.endDate)}` : ''}
                    </td>
                    <td className="py-2.5 pr-4 text-sm text-slate-600">{leave.durationDays}</td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge variant={leaveStatusVariant(leave.status)} size="sm">
                        {LEAVE_STATUS_CONFIG[leave.status as keyof typeof LEAVE_STATUS_CONFIG]?.label ?? leave.status}
                      </StatusBadge>
                    </td>
                    <td className="py-2.5 text-xs text-slate-400">{formatRelativeTime(leave.appliedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manager Section */}
      {isManager && (
        <>
          <div className="border-t border-slate-200 pt-6">
            <h2 className="font-display text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Team Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Attendance Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up">
              <h3 className="font-display font-semibold text-slate-800 mb-4">Team Attendance Today</h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                  { label: 'Present', value: teamSummary.present, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'WFH', value: teamSummary.wfh, icon: Laptop, color: 'text-blue-600 bg-blue-50' },
                  { label: 'On Leave', value: teamSummary.leave, icon: Palmtree, color: 'text-violet-600 bg-violet-50' },
                  { label: 'Late', value: teamSummary.late, icon: Timer, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Absent', value: teamSummary.absent, icon: XCircle, color: 'text-red-600 bg-red-50' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1.5', item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <p className="font-display text-xl font-bold text-slate-900">{item.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
              {teamPieData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={teamPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {teamPieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                      <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No attendance data for today</p>
              )}
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-slate-800">
                  Pending Approvals
                  {pendingApprovals.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {pendingApprovals.length}
                    </span>
                  )}
                </h3>
                <Link to="/leave/approvals" className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {pendingApprovals.length === 0 ? (
                <EmptyState icon={CheckCircle2} title="All caught up" description="No pending leave requests to review" />
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.slice(0, 4).map((leave) => (
                    <div key={leave.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                      <EmployeeAvatar name={leave.employeeName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{leave.employeeName}</p>
                        <p className="text-xs text-slate-500">
                          {LEAVE_TYPE_CONFIG[leave.leaveType as keyof typeof LEAVE_TYPE_CONFIG]?.label ?? leave.leaveType} &middot;{' '}
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)} ({leave.durationDays}d)
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={async () => { const { approveLeave } = useLeaveStore.getState(); await approveLeave(leave.id) }}
                          className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => { const { rejectLeave } = useLeaveStore.getState(); await rejectLeave(leave.id, 'Declined from dashboard') }}
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Admin Section */}
      {isAdmin && (
        <>
          <div className="border-t border-slate-200 pt-6">
            <h2 className="font-display text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              Organization Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Employees" value={orgStats.total} icon={Users} color="teal" trend="up" trendValue="+2 this quarter" index={0} />
            <StatCard label="New Joiners (Month)" value={orgStats.newJoiners} icon={UserPlus} color="blue" index={1} />
            <StatCard label="Attrition Rate" value="2.4%" icon={TrendingDown} color="amber" trend="down" trendValue="-0.3% from last quarter" index={2} />
            <StatCard label="Active Onboardings" value={orgStats.activeOnboardings} icon={AlertCircle} color="violet" index={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up">
              <h3 className="font-display font-semibold text-slate-800 mb-4">Attendance Trend (Last 7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceTrend} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                    <Bar dataKey="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="WFH" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-slate-800">Onboarding Progress</h3>
                <Link to="/onboarding" className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {checklists.filter((c) => c.overallProgress < 100).length === 0 ? (
                <EmptyState icon={CheckCircle2} title="All complete" description="No active onboardings at the moment" />
              ) : (
                <div className="space-y-3">
                  {checklists
                    .filter((c) => c.overallProgress < 100)
                    .slice(0, 4)
                    .map((checklist) => (
                      <div key={checklist.employeeId} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <EmployeeAvatar name={checklist.employeeName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{checklist.employeeName}</p>
                          <p className="text-xs text-slate-400">{checklist.employeeDesignation} &middot; {checklist.department}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${checklist.overallProgress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600 w-8 text-right">{checklist.overallProgress}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
