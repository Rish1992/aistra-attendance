import { useEffect, useMemo, useState, Fragment } from 'react'
import { useNavigate } from 'react-router'
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  User,
  MessageSquare,
  Paperclip,
  Undo2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

import { useLeaveStore } from '@/stores/leaveStore'
import { useAuthStore } from '@/stores/authStore'
import { LEAVE_TYPE_CONFIG, LEAVE_STATUS_CONFIG } from '@/lib/constants'
import { formatDate, formatRelativeTime, formatDateTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { LeaveApplication, LeaveStatus, LeaveType } from '@/types/leave'

const statusVariantMap: Record<LeaveStatus, string> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'default',
}

const typeVariantMap: Record<LeaveType, string> = {
  EL: 'teal',
  PL: 'info',
  WFH: 'violet',
  OH: 'warning',
}

interface TableColumn {
  key: string
  label: string
  width?: string
  sortable?: boolean
  render: (item: LeaveApplication) => React.ReactNode
}

export function LeaveStatusPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { applications, isLoading, fetchMyLeaves, cancelLeave, withdrawLeave } =
    useLeaveStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null)
  const [withdrawReason, setWithdrawReason] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    if (user?.employeeId) {
      fetchMyLeaves(user.employeeId)
    }
  }, [user?.employeeId, fetchMyLeaves])

  const filteredApplications = useMemo(() => {
    let filtered = [...applications]

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((a) => a.status === statusFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          LEAVE_TYPE_CONFIG[a.leaveType].label.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q)
      )
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    )
  }, [applications, statusFilter, searchQuery])

  const sortedApplications = useMemo(() => {
    if (!sortKey) return filteredApplications
    return [...filteredApplications].sort((a, b) => {
      const aVal = a[sortKey as keyof LeaveApplication]
      const bVal = b[sortKey as keyof LeaveApplication]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredApplications, sortKey, sortDirection])

  const stats = useMemo(() => {
    const total = applications.length
    const pending = applications.filter((a) => a.status === 'PENDING').length
    const approved = applications.filter((a) => a.status === 'APPROVED').length
    const rejected = applications.filter((a) => a.status === 'REJECTED').length
    return { total, pending, approved, rejected }
  }, [applications])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelLoading(true)
    try {
      await cancelLeave(cancelTarget)
      toast.success('Leave application cancelled')
    } catch {
      toast.error('Failed to cancel leave')
    } finally {
      setCancelLoading(false)
      setCancelTarget(null)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawTarget || !withdrawReason.trim()) return
    setWithdrawLoading(true)
    try {
      await withdrawLeave(withdrawTarget, withdrawReason.trim())
      toast.success('Leave application withdrawn successfully')
    } catch {
      toast.error('Failed to withdraw leave')
    } finally {
      setWithdrawLoading(false)
      setWithdrawTarget(null)
      setWithdrawReason('')
    }
  }

  const columns: TableColumn[] = [
    {
      key: 'leaveType',
      label: 'Type',
      width: '140px',
      render: (item) => (
        <StatusBadge
          variant={typeVariantMap[item.leaveType] as 'teal' | 'info' | 'violet' | 'warning'}
          dot
          size="sm"
        >
          {LEAVE_TYPE_CONFIG[item.leaveType].label}
        </StatusBadge>
      ),
    },
    {
      key: 'startDate',
      label: 'Dates',
      sortable: true,
      render: (item) => (
        <div className="text-sm">
          <span className="text-slate-700">{formatDate(item.startDate)}</span>
          {item.startDate !== item.endDate && (
            <>
              <span className="text-slate-400 mx-1">&rarr;</span>
              <span className="text-slate-700">{formatDate(item.endDate)}</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'durationDays',
      label: 'Duration',
      width: '100px',
      render: (item) => (
        <span className="text-sm font-medium text-slate-700">
          {item.durationDays} {item.durationDays === 1 ? 'day' : 'days'}
          {item.isHalfDay && (
            <span className="text-xs text-slate-400 block">
              {item.halfDayPeriod === 'FIRST_HALF' ? '1st Half' : '2nd Half'}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (item) => (
        <StatusBadge
          variant={statusVariantMap[item.status] as 'pending' | 'approved' | 'rejected' | 'default'}
          dot
          size="sm"
        >
          {LEAVE_STATUS_CONFIG[item.status].label}
        </StatusBadge>
      ),
    },
    {
      key: 'appliedAt',
      label: 'Applied On',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-slate-500">
          {formatRelativeTime(item.appliedAt)}
        </span>
      ),
    },
    {
      key: 'approverName',
      label: 'Approver',
      render: (item) => (
        <span className="text-sm text-slate-600">{item.approverName}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '200px',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            className="text-slate-500 hover:text-slate-700"
            onClick={(e) => {
              e.stopPropagation()
              setExpandedRow(expandedRow === item.id ? null : item.id)
            }}
          >
            {expandedRow === item.id ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            Details
          </Button>
          {item.status === 'PENDING' && (
            <Button
              variant="ghost"
              size="xs"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation()
                setCancelTarget(item.id)
              }}
            >
              <Ban className="w-3.5 h-3.5" />
              Cancel
            </Button>
          )}
          {item.status === 'APPROVED' && (
            <Button
              variant="ghost"
              size="xs"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={(e) => {
                e.stopPropagation()
                setWithdrawTarget(item.id)
              }}
            >
              <Undo2 className="w-3.5 h-3.5" />
              Withdraw
            </Button>
          )}
        </div>
      ),
    },
  ]

  const renderExpandedDetail = (item: LeaveApplication) => {
    const timelineEvents: {
      label: string
      date: string
      icon: React.ReactNode
      color: string
    }[] = []

    timelineEvents.push({
      label: 'Application submitted',
      date: item.appliedAt,
      icon: <FileText className="w-3.5 h-3.5" />,
      color: 'bg-blue-500',
    })

    if (item.status === 'APPROVED' && item.approvedAt) {
      timelineEvents.push({
        label: `Approved by ${item.approverName}`,
        date: item.approvedAt,
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        color: 'bg-emerald-500',
      })
    }

    if (item.status === 'REJECTED' && item.approvedAt) {
      timelineEvents.push({
        label: `Rejected by ${item.approverName}`,
        date: item.approvedAt,
        icon: <XCircle className="w-3.5 h-3.5" />,
        color: 'bg-red-500',
      })
    }

    if (item.status === 'CANCELLED' && item.cancelledAt) {
      timelineEvents.push({
        label: 'Cancelled / Withdrawn',
        date: item.cancelledAt,
        icon: <Ban className="w-3.5 h-3.5" />,
        color: 'bg-slate-500',
      })
    }

    return (
      <tr>
        <td
          colSpan={columns.length}
          className="p-0"
        >
          <div className="bg-slate-50/80 border-t border-slate-100 animate-fade-in">
            <div className="p-5 space-y-5">
              {/* Top section - Key details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Leave Type & Dates */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Leave Details
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Type</span>
                      <StatusBadge
                        variant={typeVariantMap[item.leaveType] as 'teal' | 'info' | 'violet' | 'warning'}
                        dot
                        size="xs"
                      >
                        {LEAVE_TYPE_CONFIG[item.leaveType].label}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">From</span>
                      <span className="text-sm font-medium text-slate-700">
                        {formatDate(item.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">To</span>
                      <span className="text-sm font-medium text-slate-700">
                        {formatDate(item.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Duration</span>
                      <span className="text-sm font-medium text-slate-700">
                        {item.durationDays} {item.durationDays === 1 ? 'day' : 'days'}
                        {item.isHalfDay &&
                          ` (${item.halfDayPeriod === 'FIRST_HALF' ? '1st Half' : '2nd Half'})`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Applied */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Status
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Current Status</span>
                      <StatusBadge
                        variant={
                          statusVariantMap[item.status] as
                            | 'pending'
                            | 'approved'
                            | 'rejected'
                            | 'default'
                        }
                        dot
                        size="xs"
                      >
                        {LEAVE_STATUS_CONFIG[item.status].label}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Applied On</span>
                      <span className="text-sm text-slate-700">
                        {formatDateTime(item.appliedAt)}
                      </span>
                    </div>
                    {item.approvedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Action Date</span>
                        <span className="text-sm text-slate-700">
                          {formatDateTime(item.approvedAt)}
                        </span>
                      </div>
                    )}
                    {item.cancelledAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Cancelled On</span>
                        <span className="text-sm text-slate-700">
                          {formatDateTime(item.cancelledAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approver Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-violet-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Approver
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Name</span>
                      <span className="text-sm font-medium text-slate-700">
                        {item.approverName}
                      </span>
                    </div>
                    {item.approverComment && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-500 block mb-1">
                          Remarks
                        </span>
                        <p className="text-sm text-slate-700 italic">
                          &ldquo;{item.approverComment}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason & Attachment */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Reason
                    </p>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {item.reason}
                  </p>
                  {item.attachment && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm text-teal-600 hover:underline cursor-pointer">
                        {item.attachment}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Timeline */}
              {timelineEvents.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="font-display font-semibold text-slate-800 text-sm mb-3">
                    Approval Timeline
                  </p>
                  <div className="flex items-start gap-0">
                    {timelineEvents.map((event, idx) => (
                      <div key={idx} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0',
                              event.color
                            )}
                          >
                            {event.icon}
                          </div>
                          <p className="text-xs font-medium text-slate-700 mt-1.5 text-center max-w-[120px]">
                            {event.label}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 text-center">
                            {formatDateTime(event.date)}
                          </p>
                        </div>
                        {idx < timelineEvents.length - 1 && (
                          <div className="flex-1 h-0.5 bg-slate-200 mx-2 mt-3.5 self-start" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Leave Status"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Leave', href: '/leave/status' },
          { label: 'Status' },
        ]}
        actions={
          <Button
            className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
            onClick={() => navigate('/leave/apply')}
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </Button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          icon={FileText}
          color="blue"
          index={0}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="amber"
          index={1}
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={CheckCircle2}
          color="teal"
          index={2}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="rose"
          index={3}
        />
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search by leave type or reason..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Rejected', value: 'REJECTED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ],
          },
        ]}
      />

      {/* Custom Inline-Expandable Table */}
      {filteredApplications.length === 0 && !isLoading ? (
        <EmptyState
          icon={FileText}
          title="No leave requests"
          description="You haven't applied for any leaves yet. Click the button above to apply."
          action={
            <Button
              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              onClick={() => navigate('/leave/apply')}
            >
              <Plus className="w-4 h-4" />
              Apply Leave
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={col.width ? { width: col.width } : undefined}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider',
                        col.sortable &&
                          'cursor-pointer select-none hover:text-slate-700 transition-colors'
                      )}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && (
                          <div className="flex flex-col -space-y-1">
                            <ChevronUp
                              className={cn(
                                'w-3 h-3',
                                sortKey === col.key && sortDirection === 'asc'
                                  ? 'text-teal-600'
                                  : 'text-slate-300'
                              )}
                            />
                            <ChevronDown
                              className={cn(
                                'w-3 h-3',
                                sortKey === col.key && sortDirection === 'desc'
                                  ? 'text-teal-600'
                                  : 'text-slate-300'
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-slate-100">
                        {columns.map((col) => (
                          <td key={col.key} className="px-4 py-3">
                            <Skeleton className="h-4 w-full max-w-[120px]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : sortedApplications.map((item) => (
                      <Fragment key={item.id}>
                        <tr
                          className={cn(
                            'border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/50 cursor-pointer',
                            expandedRow === item.id && 'bg-slate-50/50'
                          )}
                          onClick={() =>
                            setExpandedRow(expandedRow === item.id ? null : item.id)
                          }
                        >
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className="px-4 py-3 text-sm text-slate-700"
                            >
                              {col.render(item)}
                            </td>
                          ))}
                        </tr>
                        {expandedRow === item.id && renderExpandedDetail(item)}
                      </Fragment>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel Leave Application"
        description="Are you sure you want to cancel this leave application? This action cannot be undone."
        confirmLabel="Yes, Cancel Leave"
        variant="destructive"
        onConfirm={handleCancel}
        isLoading={cancelLoading}
      />

      {/* Withdraw Dialog with Reason */}
      <Dialog
        open={!!withdrawTarget}
        onOpenChange={(open) => {
          if (!open) {
            setWithdrawTarget(null)
            setWithdrawReason('')
          }
        }}
      >
        <DialogContent className="animate-scale-in sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-semibold text-slate-800">
              Withdraw Approved Leave
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              This leave has already been approved. Please provide a reason for
              withdrawing it. Your manager will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Reason for Withdrawal
            </label>
            <Textarea
              placeholder="e.g., Plans changed, no longer need leave on these dates..."
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              rows={3}
              className="resize-none border-slate-300 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setWithdrawTarget(null)
                setWithdrawReason('')
              }}
              disabled={withdrawLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleWithdraw}
              disabled={!withdrawReason.trim() || withdrawLoading}
            >
              {withdrawLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Withdraw Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
