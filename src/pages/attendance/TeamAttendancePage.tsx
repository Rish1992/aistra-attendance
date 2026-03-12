import { useEffect, useState, useMemo } from 'react'
import {
  Users,
  CheckCircle2,
  Coffee,
  AlertCircle,
  XCircle,
  Clock,
  MapPin,
  Pencil,
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { FilterBar } from '@/components/shared/FilterBar'
import { ATTENDANCE_STATUS_CONFIG, DEPARTMENTS } from '@/lib/constants'
import { formatHours } from '@/lib/formatters'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
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

interface SummaryCardProps {
  label: string
  count: number
  color: string
  dotColor: string
  icon: React.ElementType
}

function SummaryCard({ label, count, color, dotColor, icon: Icon }: SummaryCardProps) {
  return (
    <div className={cn('rounded-xl p-4 flex items-center justify-between', color)}>
      <div className="flex items-center gap-3">
        <div className={cn('w-2.5 h-2.5 rounded-full', dotColor)} />
        <div>
          <p className="font-display text-2xl font-bold">{count}</p>
          <p className="text-xs font-medium opacity-75">{label}</p>
        </div>
      </div>
      <Icon className="w-5 h-5 opacity-40" />
    </div>
  )
}

function formatTimeFromString(time?: string): string {
  if (!time) return '--'
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export function TeamAttendancePage() {
  const user = useAuthStore((s) => s.user)
  const {
    teamRecords,
    isLoading,
    fetchTeamAttendance,
    adminEditRecord,
  } = useAttendanceStore()

  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('PRESENT')
  const [editCheckIn, setEditCheckIn] = useState('')
  const [editCheckOut, setEditCheckOut] = useState('')
  const [editReason, setEditReason] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const isHRAdmin = user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (user?.id) {
      fetchTeamAttendance(user.id, selectedDate)
    }
  }, [user?.id, selectedDate, fetchTeamAttendance])

  // Summary counts
  const summary = useMemo(() => {
    const present = teamRecords.filter((r) => r.status === 'PRESENT').length
    const wfh = teamRecords.filter((r) => r.status === 'WFH').length
    const onLeave = teamRecords.filter((r) => r.status === 'ON_LEAVE').length
    const late = teamRecords.filter((r) => r.status === 'LATE').length
    const absent = teamRecords.filter((r) => r.status === 'ABSENT').length
    return { present, wfh, onLeave, late, absent }
  }, [teamRecords])

  // Filtered records
  const filteredRecords = useMemo(() => {
    let result = teamRecords
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((r) => r.employeeName.toLowerCase().includes(q))
    }
    // Department filter would be applied if we had department data on records
    return result
  }, [teamRecords, searchQuery, departmentFilter])

  const hoursColor = (hours?: number) => {
    if (hours == null) return 'text-slate-400'
    if (hours >= 9) return 'text-emerald-600'
    if (hours >= 4.5) return 'text-amber-600'
    return 'text-red-600'
  }

  const openEditDialog = (record: AttendanceRecord) => {
    setEditingRecord(record)
    setEditStatus(record.status)
    setEditCheckIn(record.checkInTime || '')
    setEditCheckOut(record.checkOutTime || '')
    setEditReason('')
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingRecord || !editReason.trim()) return
    setEditSaving(true)
    try {
      await adminEditRecord(
        editingRecord.id,
        {
          status: editStatus,
          checkInTime: editCheckIn || undefined,
          checkOutTime: editCheckOut || undefined,
        },
        editReason.trim()
      )
      setEditDialogOpen(false)
      setEditingRecord(null)
    } catch {
      // Error handling
    } finally {
      setEditSaving(false)
    }
  }

  // Row status background
  const rowStatusBg = (status: AttendanceStatus) => {
    switch (status) {
      case 'ABSENT': return 'bg-red-50/40'
      case 'LATE': return 'bg-amber-50/40'
      case 'ON_LEAVE': return 'bg-violet-50/40'
      default: return ''
    }
  }

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
      width: '220px',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-3">
          <EmployeeAvatar name={item.employeeName} size="sm" />
          <div>
            <p className="font-medium text-slate-800">{item.employeeName}</p>
            <p className="text-xs text-slate-400">{item.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-2">
          <StatusBadge variant={STATUS_BADGE_MAP[item.status]} dot size="sm">
            {ATTENDANCE_STATUS_CONFIG[item.status].label}
          </StatusBadge>
          {item.isEdited && (
            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-0.5 font-medium">
              Edited
            </span>
          )}
        </div>
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
      label: 'Hours',
      sortable: true,
      render: (item: AttendanceRecord) => (
        <span className={cn('font-medium', hoursColor(item.totalHours))}>
          {item.totalHours != null ? formatHours(item.totalHours) : '--'}
        </span>
      ),
    },
    {
      key: 'workLocation',
      label: 'Location',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <MapPin className="w-3.5 h-3.5" />
          <span>{item.workLocation}</span>
        </div>
      ),
    },
    ...(isHRAdmin
      ? [
          {
            key: 'actions',
            label: 'Actions',
            width: '80px',
            render: (item: AttendanceRecord) => (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openEditDialog(item)
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            ),
          },
        ]
      : []),
  ]

  const dateDisplay = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Team Attendance"
        subtitle="Today's roll-call"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Team' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              />
            </div>
          </div>
        }
      />

      {/* Date display */}
      <p className="text-sm text-slate-500">
        Showing attendance for <span className="font-medium text-slate-700">{dateDisplay}</span>
      </p>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-up">
        <SummaryCard
          label="Present"
          count={summary.present}
          color="bg-emerald-50 text-emerald-700"
          dotColor="bg-emerald-500"
          icon={CheckCircle2}
        />
        <SummaryCard
          label="WFH"
          count={summary.wfh}
          color="bg-blue-50 text-blue-700"
          dotColor="bg-blue-500"
          icon={Coffee}
        />
        <SummaryCard
          label="On Leave"
          count={summary.onLeave}
          color="bg-violet-50 text-violet-700"
          dotColor="bg-violet-500"
          icon={CalendarDays}
        />
        <SummaryCard
          label="Late"
          count={summary.late}
          color="bg-amber-50 text-amber-700"
          dotColor="bg-amber-500"
          icon={AlertCircle}
        />
        <SummaryCard
          label="Absent"
          count={summary.absent}
          color="bg-red-50 text-red-700"
          dotColor="bg-red-500"
          icon={XCircle}
        />
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search employee..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            key: 'department',
            label: 'Department',
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: [
              { label: 'All Departments', value: 'all' },
              ...DEPARTMENTS.map((d) => ({ label: d, value: d })),
            ],
          },
        ]}
      />

      {/* Team Table */}
      <DataTable
        columns={columns}
        data={filteredRecords as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No team attendance records found for this date"
      />

      {/* Edit Attendance Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Attendance</DialogTitle>
            <DialogDescription>
              {editingRecord && (
                <span>
                  Editing record for <strong>{editingRecord.employeeName}</strong> on{' '}
                  {new Date(editingRecord.date + 'T00:00:00').toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Status */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Status
              </label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as AttendanceStatus)}>
                <SelectTrigger className="w-full h-10 bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'WFH', 'ON_LEAVE'] as AttendanceStatus[]).map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              ATTENDANCE_STATUS_CONFIG[status].dotColor
                            )}
                          />
                          {ATTENDANCE_STATUS_CONFIG[status].label}
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Check-in Time */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Check-in Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  value={editCheckIn}
                  onChange={(e) => setEditCheckIn(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Check-out Time */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Check-out Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  value={editCheckOut}
                  onChange={(e) => setEditCheckOut(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Reason - mandatory */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                Reason for edit <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Provide a reason for this edit..."
                className="resize-none bg-white border-slate-300 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
                rows={3}
              />
              {editReason.trim() === '' && (
                <p className="text-xs text-red-500 mt-1">
                  Reason is required for all attendance edits
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-slate-300 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editSaving || !editReason.trim()}
              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
            >
              {editSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
