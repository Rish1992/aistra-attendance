import { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  BarChart3,
  Download,
  Users,
  CalendarDays,
  FileText,
  ClipboardCheck,
  Target,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useLeaveStore } from '@/stores/leaveStore'
import { useEmployeeStore } from '@/stores/employeeStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { usePerformanceStore } from '@/stores/performanceStore'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import { DEPARTMENTS, LEAVE_TYPE_CONFIG } from '@/lib/constants'

const PIE_COLORS = ['#14B8A6', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#64748B', '#10B981']

const chartTooltipStyle = {
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  fontSize: '12px',
}

export function ReportsPage() {
  const user = useAuthStore((s) => s.user)
  const { employees, fetchEmployees } = useEmployeeStore()
  const { checklists, fetchChecklists } = useOnboardingStore()
  const { goals, reviews, fetchGoals, fetchReviews } = usePerformanceStore()

  useEffect(() => {
    fetchEmployees()
    fetchChecklists()
    if (user) {
      fetchGoals(user.employeeId)
      fetchReviews(user.employeeId)
    }
  }, [user])

  // ─── Attendance Report Data ─────────────────────────────────────────────────
  const attendanceByDay = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const total = employees.length || 20
      const present = Math.round(total * (0.65 + Math.random() * 0.2))
      const late = Math.round(total * (0.05 + Math.random() * 0.05))
      const wfh = Math.round(total * (0.1 + Math.random() * 0.1))
      const absent = Math.max(0, total - present - late - wfh)
      days.push({
        day: format(d, 'MMM d'),
        Present: present,
        Late: late,
        WFH: wfh,
        Absent: absent,
      })
    }
    return days
  }, [employees])

  const attendanceSummaryTable = useMemo(() => {
    return employees.slice(0, 10).map((emp) => {
      const total = 22
      const present = Math.round(total * (0.7 + Math.random() * 0.25))
      const late = Math.round(total * (0.02 + Math.random() * 0.05))
      const wfh = Math.round(total * (0.05 + Math.random() * 0.1))
      const absent = Math.max(0, total - present - late - wfh)
      const avgHours = (7 + Math.random() * 2.5).toFixed(1)
      return { name: emp.fullName, dept: emp.department, present, absent, late, wfh, avgHours }
    })
  }, [employees])

  // ─── Leave Report Data ──────────────────────────────────────────────────────
  const leaveByMonth = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((m) => ({
      month: m,
      EL: Math.round(5 + Math.random() * 15),
      PL: Math.round(3 + Math.random() * 10),
      WFH: Math.round(8 + Math.random() * 20),
      OH: Math.round(0 + Math.random() * 3),
    }))
  }, [])

  const leaveByDeptData = useMemo(() => {
    return DEPARTMENTS.slice(0, 6).map((dept) => ({
      name: dept,
      value: Math.round(10 + Math.random() * 30),
    }))
  }, [])

  const leaveSummary = useMemo(() => ({
    total: leaveByMonth.reduce((s, m) => s + m.EL + m.PL + m.WFH + m.OH, 0),
    el: leaveByMonth.reduce((s, m) => s + m.EL, 0),
    pl: leaveByMonth.reduce((s, m) => s + m.PL, 0),
    wfh: leaveByMonth.reduce((s, m) => s + m.WFH, 0),
    oh: leaveByMonth.reduce((s, m) => s + m.OH, 0),
  }), [leaveByMonth])

  // ─── Employee Report Data ───────────────────────────────────────────────────
  const deptDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    employees.forEach((e) => { counts[e.department] = (counts[e.department] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [employees])

  const locationDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    employees.forEach((e) => { counts[e.workLocation] = (counts[e.workLocation] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [employees])

  const joinersTrend = useMemo(() => {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
    return months.map((m) => ({ month: m, Joiners: Math.round(Math.random() * 4) }))
  }, [])

  const statusDistribution = useMemo(() => {
    const counts = { ACTIVE: 0, ON_NOTICE: 0, INACTIVE: 0, TERMINATED: 0 }
    employees.forEach((e) => { if (e.status in counts) counts[e.status as keyof typeof counts]++ })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [employees])

  // ─── Document Report Data ──────────────────────────────────────────────────
  const docCompliance = useMemo(() => {
    const total = employees.length || 1
    const compliant = Math.round(total * 0.82)
    return Math.round((compliant / total) * 100)
  }, [employees])

  // ─── Onboarding Report Data ────────────────────────────────────────────────
  const activeOnboardings = useMemo(() => checklists.filter((c) => c.overallProgress < 100), [checklists])
  const avgCompletion = useMemo(() => {
    if (checklists.length === 0) return 0
    return Math.round(checklists.reduce((s, c) => s + c.overallProgress, 0) / checklists.length)
  }, [checklists])
  const overdueTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return checklists.reduce((count, c) =>
      count + c.tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate < today).length, 0)
  }, [checklists])

  // ─── Performance Report Data ───────────────────────────────────────────────
  const ratingDistribution = useMemo(() => {
    return [
      { rating: '5 - Exceptional', count: Math.round(2 + Math.random() * 3) },
      { rating: '4 - Exceeds', count: Math.round(5 + Math.random() * 5) },
      { rating: '3 - Meets', count: Math.round(8 + Math.random() * 5) },
      { rating: '2 - Needs Imp.', count: Math.round(1 + Math.random() * 3) },
      { rating: '1 - Unsatisfactory', count: Math.round(Math.random() * 2) },
    ]
  }, [])

  const goalStatusData = useMemo(() => {
    return [
      { name: 'On Track', value: Math.round(10 + Math.random() * 10), color: '#10B981' },
      { name: 'At Risk', value: Math.round(3 + Math.random() * 5), color: '#F59E0B' },
      { name: 'Completed', value: Math.round(5 + Math.random() * 5), color: '#3B82F6' },
      { name: 'Off Track', value: Math.round(1 + Math.random() * 3), color: '#EF4444' },
    ]
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Reports' },
        ]}
      />

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg w-fit">
          {[
            { value: 'attendance', label: 'Attendance', icon: BarChart3 },
            { value: 'leave', label: 'Leave', icon: CalendarDays },
            { value: 'employees', label: 'Employees', icon: Users },
            { value: 'documents', label: 'Documents', icon: FileText },
            { value: 'onboarding', label: 'Onboarding', icon: ClipboardCheck },
            { value: 'performance', label: 'Performance', icon: Target },
          ].map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-sm">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─── ATTENDANCE TAB ─────────────────────────────────────────── */}
        <TabsContent value="attendance" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-800">Attendance by Status (Last 7 Days)</h3>
            <button
              onClick={() => exportCSV('attendance', attendanceSummaryTable)}
              className="h-9 px-4 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceByDay} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                  <Bar dataKey="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Late" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="WFH" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700">Employee Attendance Summary</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Employee', 'Department', 'Present', 'Absent', 'Late', 'WFH', 'Avg Hours'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendanceSummaryTable.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">{row.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{row.dept}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 font-medium">{row.present}</td>
                      <td className="px-4 py-3 text-sm text-red-600 font-medium">{row.absent}</td>
                      <td className="px-4 py-3 text-sm text-amber-600 font-medium">{row.late}</td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-medium">{row.wfh}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{row.avgHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ─── LEAVE TAB ──────────────────────────────────────────────── */}
        <TabsContent value="leave" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Total Leaves" value={leaveSummary.total} icon={CalendarDays} color="teal" index={0} />
            <StatCard label="Earned Leave" value={leaveSummary.el} icon={CalendarDays} color="teal" index={1} />
            <StatCard label="Paid Leave" value={leaveSummary.pl} icon={CalendarDays} color="blue" index={2} />
            <StatCard label="WFH" value={leaveSummary.wfh} icon={CalendarDays} color="violet" index={3} />
            <StatCard label="Optional Holiday" value={leaveSummary.oh} icon={CalendarDays} color="amber" index={4} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-display font-semibold text-slate-800 mb-4">Leave Utilization by Type (Monthly)</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaveByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                    <Bar dataKey="EL" stackId="a" fill="#14B8A6" />
                    <Bar dataKey="PL" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="WFH" stackId="a" fill="#8B5CF6" />
                    <Bar dataKey="OH" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-display font-semibold text-slate-800 mb-4">Leave by Department</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leaveByDeptData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {leaveByDeptData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ─── EMPLOYEES TAB ──────────────────────────────────────────── */}
        <TabsContent value="employees" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Headcount" value={employees.length} icon={Users} color="teal" index={0} />
            <StatCard label="Active" value={employees.filter((e) => e.status === 'ACTIVE').length} icon={Users} color="blue" index={1} />
            <StatCard label="On Notice" value={employees.filter((e) => e.status === 'ON_NOTICE').length} icon={Users} color="amber" index={2} />
            <StatCard label="Departments" value={new Set(employees.map((e) => e.department)).size} icon={Users} color="violet" index={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-display font-semibold text-slate-800 mb-4">By Department</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {deptDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#64748B' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-display font-semibold text-slate-800 mb-4">By Location</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={locationDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {locationDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#64748B' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-display font-semibold text-slate-800 mb-4">New Joiners Trend</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={joinersTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="Joiners" stroke="#14B8A6" strokeWidth={2} dot={{ fill: '#14B8A6', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="font-display font-semibold text-slate-800 mb-4">Status Distribution</h4>
            <div className="flex gap-4 flex-wrap">
              {statusDistribution.map((item) => {
                const colorMap: Record<string, string> = { ACTIVE: 'bg-emerald-50 text-emerald-700', ON_NOTICE: 'bg-amber-50 text-amber-700', INACTIVE: 'bg-slate-100 text-slate-600', TERMINATED: 'bg-red-50 text-red-700' }
                return (
                  <div key={item.name} className={cn('rounded-xl px-5 py-3 flex items-center gap-3', colorMap[item.name] ?? 'bg-slate-50 text-slate-600')}>
                    <span className="font-display text-2xl font-bold">{item.value}</span>
                    <span className="text-sm">{item.name.replace('_', ' ')}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* ─── DOCUMENTS TAB ──────────────────────────────────────────── */}
        <TabsContent value="documents" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center">
              <h4 className="font-display font-semibold text-slate-800 mb-4">Document Compliance</h4>
              <ProgressRing value={docCompliance} size="lg" color={docCompliance >= 80 ? 'teal' : docCompliance >= 60 ? 'amber' : 'red'} label="%" />
              <p className="text-sm text-slate-500 mt-3">{docCompliance}% of employees have all mandatory documents</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
              <h4 className="font-display font-semibold text-slate-800 mb-4">Missing Mandatory Documents</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {['Employee', 'Department', 'Missing Document', 'Status'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.slice(0, 5).map((emp, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{emp.fullName}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{emp.department}</td>
                        <td className="px-4 py-2.5 text-sm text-slate-600">{['Aadhaar Card', 'PAN Card', 'Address Proof', 'Degree Certificate', 'Experience Letter'][i % 5]}</td>
                        <td className="px-4 py-2.5">
                          <StatusBadge variant={i % 2 === 0 ? 'pending' : 'danger'} size="sm">
                            {i % 2 === 0 ? 'Pending Upload' : 'Expired'}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="font-display font-semibold text-slate-800 mb-4">Documents Expiring Soon</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Employee', 'Document', 'Expiry Date', 'Days Left'].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Meghna Das', doc: 'Background Verification', expiry: '2026-03-31', days: 20 },
                    { name: 'Arun Kumar', doc: 'Police Verification', expiry: '2026-04-15', days: 35 },
                    { name: 'Rahul Mehra', doc: 'Driving License', expiry: '2026-05-01', days: 51 },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-700">{row.name}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{row.doc}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-600">{format(new Date(row.expiry), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge variant={row.days <= 30 ? 'warning' : 'info'} size="sm">{row.days} days</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ─── ONBOARDING TAB ─────────────────────────────────────────── */}
        <TabsContent value="onboarding" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Active Onboardings" value={activeOnboardings.length} icon={ClipboardCheck} color="teal" index={0} />
            <StatCard label="Avg Completion" value={`${avgCompletion}%`} icon={ClipboardCheck} color="blue" index={1} />
            <StatCard label="Overdue Tasks" value={overdueTasks} icon={ClipboardCheck} color="rose" index={2} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="font-display font-semibold text-slate-800 mb-4">Active Onboarding Progress</h4>
            {activeOnboardings.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No active onboardings</p>
            ) : (
              <div className="space-y-4">
                {activeOnboardings.map((checklist) => {
                  const completed = checklist.tasks.filter((t) => t.status === 'COMPLETED').length
                  const total = checklist.tasks.length
                  return (
                    <div key={checklist.employeeId} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{checklist.employeeName}</p>
                        <p className="text-xs text-slate-500">{checklist.employeeDesignation} &middot; {checklist.department} &middot; Joined {format(new Date(checklist.dateOfJoining), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-500">{completed}/{total} tasks</span>
                        <div className="w-32 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${checklist.overallProgress}%` }} />
                        </div>
                        <span className="text-sm font-medium text-slate-700 w-10 text-right">{checklist.overallProgress}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── PERFORMANCE TAB ────────────────────────────────────────── */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-display font-semibold text-slate-800 mb-4">Rating Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="rating" type="category" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" fill="#14B8A6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-display font-semibold text-slate-800 mb-4">Goal Status Overview</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={goalStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {goalStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="font-display font-semibold text-slate-800 mb-4">Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Avg Rating', value: '3.8', color: 'text-teal-600 bg-teal-50' },
                { label: 'Goals Completed', value: `${goalStatusData.find((d) => d.name === 'Completed')?.value ?? 0}`, color: 'text-blue-600 bg-blue-50' },
                { label: 'Reviews Completed', value: `${Math.round(employees.length * 0.6)}`, color: 'text-violet-600 bg-violet-50' },
                { label: 'At Risk Goals', value: `${goalStatusData.find((d) => d.name === 'At Risk')?.value ?? 0}`, color: 'text-amber-600 bg-amber-50' },
              ].map((item) => (
                <div key={item.label} className={cn('rounded-xl p-4 text-center', item.color)}>
                  <p className="font-display text-2xl font-bold">{item.value}</p>
                  <p className="text-xs mt-1 opacity-80">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function exportCSV(name: string, data: Record<string, unknown>[]) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map((row) => headers.map((h) => `"${row[h]}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}-report-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
