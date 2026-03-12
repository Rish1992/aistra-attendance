import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Inbox,
} from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { useLeaveStore } from '@/stores/leaveStore'
import { useAuthStore } from '@/stores/authStore'
import { LEAVE_TYPE_CONFIG } from '@/lib/constants'
import { formatDate, formatRelativeTime } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { LeaveApplication, LeaveType } from '@/types/leave'

const typeVariantMap: Record<LeaveType, string> = {
  EL: 'teal',
  PL: 'info',
  WFH: 'violet',
  OH: 'warning',
}

export function LeaveApprovalsPage() {
  const user = useAuthStore((s) => s.user)
  const {
    pendingApprovals,
    applications,
    isLoading,
    fetchPendingApprovals,
    fetchMyLeaves,
    approveLeave,
    rejectLeave,
  } = useLeaveStore()

  const [activeTab, setActiveTab] = useState('pending')
  const [approveTarget, setApproveTarget] = useState<string | null>(null)
  const [approveComment, setApproveComment] = useState('')
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchPendingApprovals(user.id)
      fetchMyLeaves(user.employeeId)
    }
  }, [user?.id, user?.employeeId, fetchPendingApprovals, fetchMyLeaves])

  const historicalApproved = useMemo(
    () =>
      applications.filter(
        (a) => a.approverId === user?.id && a.status === 'APPROVED'
      ),
    [applications, user?.id]
  )

  const historicalRejected = useMemo(
    () =>
      applications.filter(
        (a) => a.approverId === user?.id && a.status === 'REJECTED'
      ),
    [applications, user?.id]
  )

  const handleApprove = async () => {
    if (!approveTarget) return
    setActionLoading(approveTarget)
    try {
      await approveLeave(approveTarget, approveComment.trim() || 'Approved')
      toast.success('Leave approved successfully')
      setApproveTarget(null)
      setApproveComment('')
    } catch {
      toast.error('Failed to approve leave')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setActionLoading(rejectTarget)
    try {
      await rejectLeave(rejectTarget, rejectReason)
      toast.success('Leave rejected')
      setRejectTarget(null)
      setRejectReason('')
    } catch {
      toast.error('Failed to reject leave')
    } finally {
      setActionLoading(null)
    }
  }

  const historyColumns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (item: LeaveApplication) => (
        <div className="flex items-center gap-2">
          <EmployeeAvatar name={item.employeeName} size="sm" />
          <span className="text-sm font-medium text-slate-700">
            {item.employeeName}
          </span>
        </div>
      ),
    },
    {
      key: 'leaveType',
      label: 'Type',
      render: (item: LeaveApplication) => (
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
      render: (item: LeaveApplication) => (
        <span className="text-sm text-slate-600">
          {formatDate(item.startDate)}
          {item.startDate !== item.endDate && ` \u2192 ${formatDate(item.endDate)}`}
        </span>
      ),
    },
    {
      key: 'durationDays',
      label: 'Duration',
      render: (item: LeaveApplication) => (
        <span className="text-sm text-slate-600">
          {item.durationDays} {item.durationDays === 1 ? 'day' : 'days'}
        </span>
      ),
    },
    {
      key: 'approverComment',
      label: 'Comment',
      render: (item: LeaveApplication) => (
        <span className="text-sm text-slate-500">
          {item.approverComment || '-'}
        </span>
      ),
    },
    {
      key: 'appliedAt',
      label: 'Applied',
      render: (item: LeaveApplication) => (
        <span className="text-xs text-slate-400">
          {formatRelativeTime(item.appliedAt)}
        </span>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Leave Approvals"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Leave', href: '/leave/status' },
          { label: 'Approvals' },
        ]}
        actions={
          pendingApprovals.length > 0 ? (
            <StatusBadge variant="pending" size="lg">
              <Clock className="w-3.5 h-3.5" />
              {pendingApprovals.length} pending
            </StatusBadge>
          ) : null
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending
            {pendingApprovals.length > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center">
                {pendingApprovals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
            <span className="ml-1 text-xs text-slate-400">
              ({historicalApproved.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
            <span className="ml-1 text-xs text-slate-400">
              ({historicalRejected.length})
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
            </div>
          ) : pendingApprovals.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="All caught up!"
              description="There are no pending leave requests to review."
            />
          ) : (
            <div className="grid gap-4">
              {pendingApprovals.map((leave, idx) => (
                <div
                  key={leave.id}
                  className={cn(
                    'bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all animate-fade-up',
                    idx === 1 && 'stagger-1',
                    idx === 2 && 'stagger-2',
                    idx === 3 && 'stagger-3'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <EmployeeAvatar name={leave.employeeName} size="lg" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-display font-semibold text-slate-800">
                          {leave.employeeName}
                        </h4>
                        <StatusBadge
                          variant={
                            typeVariantMap[leave.leaveType] as
                              | 'teal'
                              | 'info'
                              | 'violet'
                              | 'warning'
                          }
                          dot
                          size="sm"
                        >
                          {LEAVE_TYPE_CONFIG[leave.leaveType].label}
                        </StatusBadge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                        <span>
                          {formatDate(leave.startDate)}
                          {leave.startDate !== leave.endDate &&
                            ` \u2192 ${formatDate(leave.endDate)}`}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="font-medium text-slate-600">
                          {leave.durationDays}{' '}
                          {leave.durationDays === 1 ? 'day' : 'days'}
                          {leave.isHalfDay && (
                            <span className="text-slate-400 ml-1">
                              (
                              {leave.halfDayPeriod === 'FIRST_HALF'
                                ? '1st Half'
                                : '2nd Half'}
                              )
                            </span>
                          )}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 line-clamp-2">
                        {leave.reason}
                      </p>

                      <p className="text-xs text-slate-400 mt-2">
                        Applied {formatRelativeTime(leave.appliedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        disabled={actionLoading === leave.id}
                        onClick={() => setApproveTarget(leave.id)}
                      >
                        {actionLoading === leave.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        disabled={actionLoading === leave.id}
                        onClick={() => setRejectTarget(leave.id)}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved">
          <DataTable
            columns={historyColumns}
            data={historicalApproved as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
            emptyMessage="No approved leave requests yet"
          />
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected">
          <DataTable
            columns={historyColumns}
            data={historicalRejected as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
            emptyMessage="No rejected leave requests yet"
          />
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog
        open={!!approveTarget}
        onOpenChange={(open) => {
          if (!open) {
            setApproveTarget(null)
            setApproveComment('')
          }
        }}
      >
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle className="font-display font-semibold text-slate-800">
              Approve Leave Request
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {(() => {
                const target = pendingApprovals.find((l) => l.id === approveTarget)
                if (!target) return 'Confirm approval for this leave request.'
                return `${target.employeeName} requested ${LEAVE_TYPE_CONFIG[target.leaveType].label} for ${target.durationDays} ${target.durationDays === 1 ? 'day' : 'days'}.`
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Comment <span className="text-slate-400">(optional)</span>
            </Label>
            <Textarea
              placeholder="Add an optional comment..."
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              className="min-h-[100px] bg-white border-slate-300 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveTarget(null)
                setApproveComment('')
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleApprove}
              disabled={!!actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Approve Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null)
            setRejectReason('')
          }
        }}
      >
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle className="font-display font-semibold text-slate-800">
              Reject Leave Request
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Please provide a reason for rejecting this leave request. The
              employee will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Enter the reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px] bg-white border-slate-300 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null)
                setRejectReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleReject}
              disabled={!rejectReason.trim() || !!actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Reject Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
