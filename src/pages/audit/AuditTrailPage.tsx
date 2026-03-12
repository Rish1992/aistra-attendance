import { useEffect, useState, useMemo } from 'react'
import {
  Shield,
  Download,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
} from 'lucide-react'
import { useAuditTrailStore } from '@/stores/auditTrailStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/formatters'
import type { AuditEntry as AuditEntryMock } from '@/mock/audit-trail'

const entityTypeOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Attendance', value: 'ATTENDANCE' },
  { label: 'Leave', value: 'LEAVE' },
  { label: 'Employee', value: 'EMPLOYEE' },
  { label: 'Document', value: 'DOCUMENT' },
  { label: 'Onboarding', value: 'ONBOARDING' },
  { label: 'Performance', value: 'PERFORMANCE' },
]

const actionOptions = [
  { label: 'All Actions', value: 'all' },
  { label: 'Created', value: 'CREATED' },
  { label: 'Updated', value: 'UPDATED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Deleted', value: 'DELETED' },
]

const actionColorMap: Record<string, { variant: 'teal' | 'info' | 'danger' | 'success' | 'default' | 'warning'; label: string }> = {
  EMPLOYEE_CREATED: { variant: 'teal', label: 'Created' },
  PROFILE_UPDATE: { variant: 'info', label: 'Updated' },
  ATTENDANCE_EDIT: { variant: 'info', label: 'Edited' },
  LEAVE_APPROVED: { variant: 'success', label: 'Approved' },
  LEAVE_REJECTED: { variant: 'danger', label: 'Rejected' },
  LEAVE_CANCELLED: { variant: 'default', label: 'Cancelled' },
  DOCUMENT_VERIFIED: { variant: 'success', label: 'Verified' },
  DOCUMENT_REJECTED: { variant: 'danger', label: 'Rejected' },
  ONBOARDING_TASK_COMPLETED: { variant: 'teal', label: 'Completed' },
  REVIEW_SUBMITTED: { variant: 'info', label: 'Submitted' },
  CREATED: { variant: 'teal', label: 'Created' },
  UPDATED: { variant: 'info', label: 'Updated' },
  DELETED: { variant: 'danger', label: 'Deleted' },
  APPROVED: { variant: 'success', label: 'Approved' },
  REJECTED: { variant: 'danger', label: 'Rejected' },
  CANCELLED: { variant: 'default', label: 'Cancelled' },
}

const entityTypeBadge: Record<string, 'teal' | 'info' | 'violet' | 'warning' | 'danger' | 'default'> = {
  ATTENDANCE: 'teal',
  LEAVE: 'info',
  EMPLOYEE: 'violet',
  DOCUMENT: 'warning',
  ONBOARDING: 'default',
  PERFORMANCE: 'danger',
  Employee: 'violet',
  Attendance: 'teal',
  Leave: 'info',
  Document: 'warning',
  Goal: 'danger',
  Review: 'danger',
  Holiday: 'default',
  Policy: 'default',
}

export function AuditTrailPage() {
  const { entries, isLoading, fetchAuditTrail } = useAuditTrailStore()
  const [entityFilter, setEntityFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  useEffect(() => {
    fetchAuditTrail()
  }, [])

  const filteredEntries = useMemo(() => {
    return (entries as AuditEntryMock[])
      .filter((entry) => {
        if (entityFilter !== 'all' && entry.entityType !== entityFilter) return false
        if (actionFilter !== 'all' && !entry.action.includes(actionFilter)) return false
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          return (
            entry.performedByName.toLowerCase().includes(q) ||
            entry.details.toLowerCase().includes(q) ||
            entry.entityId.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
  }, [entries, entityFilter, actionFilter, searchQuery])

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Entity Type', 'Entity ID', 'Action', 'Details', 'IP Address']
    const rows = filteredEntries.map((e) => [
      formatDateTime(e.performedAt),
      e.performedByName,
      e.entityType,
      e.entityId,
      e.action,
      e.details,
      e.ipAddress,
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Admin' },
          { label: 'Audit Trail' },
        ]}
        actions={
          <button
            onClick={handleExportCSV}
            className="h-9 px-4 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        }
      />

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search by user, details, or entity ID..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            key: 'entityType',
            label: 'Entity Type',
            options: entityTypeOptions,
            value: entityFilter,
            onChange: setEntityFilter,
          },
          {
            key: 'action',
            label: 'Action',
            options: actionOptions,
            value: actionFilter,
            onChange: setActionFilter,
          },
        ]}
      />

      {/* Results count */}
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{filteredEntries.length}</span> audit entries
      </p>

      {/* Table */}
      {filteredEntries.length === 0 && !isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <EmptyState
            icon={Shield}
            title="No audit entries"
            description="No audit trail entries match your current filters"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="w-8 px-4 py-3" />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-slate-100 rounded animate-pulse w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : filteredEntries.map((entry) => {
                      const isExpanded = expandedRow === entry.id
                      const actionConfig = actionColorMap[entry.action] ?? { variant: 'default' as const, label: entry.action }
                      const hasPrevNext = entry.previousValue || entry.newValue

                      return (
                        <>
                          <tr
                            key={entry.id}
                            onClick={() => hasPrevNext ? setExpandedRow(isExpanded ? null : entry.id) : undefined}
                            className={cn(
                              'border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/50',
                              hasPrevNext && 'cursor-pointer'
                            )}
                          >
                            <td className="px-4 py-3 text-slate-400">
                              {hasPrevNext && (
                                isExpanded
                                  ? <ChevronDown className="w-4 h-4" />
                                  : <ChevronRight className="w-4 h-4" />
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                              {formatDateTime(entry.performedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <EmployeeAvatar name={entry.performedByName} size="xs" />
                                <span className="text-sm text-slate-700 font-medium">{entry.performedByName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge variant={entityTypeBadge[entry.entityType] ?? 'default'} size="sm">
                                {entry.entityType}
                              </StatusBadge>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 font-mono text-xs">
                              {entry.entityId}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge variant={actionConfig.variant} size="sm">
                                {actionConfig.label}
                              </StatusBadge>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                              {entry.details}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${entry.id}-detail`} className="border-b border-slate-100 bg-slate-50/50">
                              <td colSpan={7} className="px-12 py-4">
                                <div className="space-y-3">
                                  {entry.previousValue && entry.newValue && (
                                    <div className="flex items-center gap-4">
                                      <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Previous Value</p>
                                        <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-mono border border-red-100">
                                          {entry.previousValue}
                                        </div>
                                      </div>
                                      <div className="text-slate-300 text-lg">&rarr;</div>
                                      <div className="flex-1">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">New Value</p>
                                        <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-mono border border-emerald-100">
                                          {entry.newValue}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-6 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      Performed by: {entry.performedByName} ({entry.performedBy})
                                    </span>
                                    <span>IP: {entry.ipAddress}</span>
                                  </div>
                                  <p className="text-sm text-slate-600">{entry.details}</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
