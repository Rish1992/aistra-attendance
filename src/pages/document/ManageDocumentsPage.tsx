import { useEffect, useState, useMemo } from 'react'
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDocumentStore } from '@/stores/documentStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable } from '@/components/shared/DataTable'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatFileSize } from '@/lib/formatters'
import { DOCUMENT_CATEGORIES } from '@/lib/constants'
import type { DocumentCategory, DocumentStatus, EmployeeDocument } from '@/types/document'

const statusVariantMap: Record<DocumentStatus, 'pending' | 'success' | 'rejected' | 'danger'> = {
  PENDING: 'pending',
  VERIFIED: 'success',
  REJECTED: 'rejected',
  EXPIRED: 'danger',
}

const statusLabelMap: Record<DocumentStatus, string> = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
}

const categoryBadgeColors: Record<DocumentCategory, string> = {
  Identity: 'bg-blue-50 text-blue-700 border border-blue-200',
  Education: 'bg-violet-50 text-violet-700 border border-violet-200',
  Employment: 'bg-teal-50 text-teal-700 border border-teal-200',
  Compliance: 'bg-amber-50 text-amber-700 border border-amber-200',
  Other: 'bg-slate-100 text-slate-600',
}

function isExpiringSoon(expiryDate?: string): boolean {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays > 0 && diffDays <= 30
}

function isExpired(expiryDate?: string): boolean {
  if (!expiryDate) return false
  return new Date(expiryDate) < new Date()
}

export function ManageDocumentsPage() {
  const { documents, isLoading, fetchAllDocuments } = useDocumentStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<EmployeeDocument | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [verifyNote, setVerifyNote] = useState('')

  useEffect(() => {
    fetchAllDocuments()
  }, [fetchAllDocuments])

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !search ||
        doc.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        doc.documentName.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [documents, search, categoryFilter, statusFilter])

  // Summary stats
  const stats = useMemo(() => {
    const total = documents.length
    const pending = documents.filter((d) => d.status === 'PENDING').length
    const verified = documents.filter((d) => d.status === 'VERIFIED').length
    const expiredOrExpiring = documents.filter(
      (d) => d.status === 'EXPIRED' || isExpiringSoon(d.expiryDate)
    ).length
    return { total, pending, verified, expiredOrExpiring }
  }, [documents])

  const handleVerify = (doc: EmployeeDocument) => {
    setSelectedDoc(doc)
    setVerifyNote('')
    setVerifyDialogOpen(true)
  }

  const handleReject = (doc: EmployeeDocument) => {
    setSelectedDoc(doc)
    setRejectReason('')
    setRejectDialogOpen(true)
  }

  const handleView = (doc: EmployeeDocument) => {
    setSelectedDoc(doc)
    setViewDialogOpen(true)
  }

  const confirmVerify = () => {
    // In real app, call store action
    setVerifyDialogOpen(false)
    setSelectedDoc(null)
  }

  const confirmReject = () => {
    // In real app, call store action
    setRejectDialogOpen(false)
    setSelectedDoc(null)
    setRejectReason('')
  }

  const statCards = [
    {
      label: 'Total Documents',
      value: stats.total,
      icon: FileText,
      iconBg: 'bg-slate-50',
      iconColor: 'text-slate-600',
      ringColor: 'ring-slate-100',
    },
    {
      label: 'Pending Verification',
      value: stats.pending,
      icon: Clock,
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      ringColor: 'ring-yellow-100',
    },
    {
      label: 'Verified',
      value: stats.verified,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      ringColor: 'ring-emerald-100',
    },
    {
      label: 'Expired / Expiring',
      value: stats.expiredOrExpiring,
      icon: AlertTriangle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      ringColor: 'ring-red-100',
    },
  ]

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      sortable: true,
      render: (item: EmployeeDocument) => (
        <div className="flex items-center gap-2.5">
          <EmployeeAvatar name={item.employeeName} size="sm" />
          <div>
            <p className="font-medium text-slate-800 text-sm">{item.employeeName}</p>
            <p className="text-xs text-slate-400">{item.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'documentName',
      label: 'Document',
      sortable: true,
      render: (item: EmployeeDocument) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{item.documentName}</p>
          <p className="text-xs text-slate-400">
            {item.fileName} ({formatFileSize(item.fileSize)})
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (item: EmployeeDocument) => (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            categoryBadgeColors[item.category]
          )}
        >
          {item.category}
        </span>
      ),
    },
    {
      key: 'uploadedAt',
      label: 'Upload Date',
      sortable: true,
      render: (item: EmployeeDocument) => (
        <span className="text-sm text-slate-600">{formatDate(item.uploadedAt)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: EmployeeDocument) => (
        <StatusBadge variant={statusVariantMap[item.status]} size="sm" dot>
          {statusLabelMap[item.status]}
        </StatusBadge>
      ),
    },
    {
      key: 'expiryDate',
      label: 'Expiry',
      sortable: true,
      render: (item: EmployeeDocument) => {
        if (!item.expiryDate) return <span className="text-slate-400 text-sm">-</span>
        const expired = isExpired(item.expiryDate)
        const expiring = isExpiringSoon(item.expiryDate)
        return (
          <span
            className={cn(
              'text-sm font-medium',
              expired ? 'text-red-600' : expiring ? 'text-amber-600' : 'text-slate-600'
            )}
          >
            {expired && <AlertTriangle className="w-3 h-3 inline mr-1" />}
            {expiring && <Clock className="w-3 h-3 inline mr-1" />}
            {formatDate(item.expiryDate)}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      render: (item: EmployeeDocument) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation()
              handleView(item)
            }}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          {item.status === 'PENDING' && (
            <>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={(e) => {
                  e.stopPropagation()
                  handleVerify(item)
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReject(item)
                }}
              >
                <ShieldX className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  // Cast filtered to make DataTable happy with Record<string, unknown>
  const tableData = filtered as unknown as (EmployeeDocument & Record<string, unknown>)[]

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Document Management"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Admin', href: '/dashboard' },
          { label: 'Documents' },
        ]}
      />

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all animate-fade-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center ring-4',
                      card.iconBg,
                      card.iconColor,
                      card.ringColor
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-display text-3xl font-bold text-slate-900 animate-count">
                      {card.value}
                    </p>
                    <p className="text-sm text-slate-500">{card.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search by employee or document name..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'all' },
              ...DOCUMENT_CATEGORIES.map((c) => ({ label: c, value: c })),
            ],
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Verified', value: 'VERIFIED' },
              { label: 'Rejected', value: 'REJECTED' },
              { label: 'Expired', value: 'EXPIRED' },
            ],
          },
        ]}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        emptyMessage="No documents match your filters."
      />

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Document Details</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Employee
                  </p>
                  <div className="flex items-center gap-2">
                    <EmployeeAvatar name={selectedDoc.employeeName} size="xs" />
                    <span className="text-slate-800 font-medium">{selectedDoc.employeeName}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Employee ID
                  </p>
                  <p className="text-slate-700">{selectedDoc.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Document
                  </p>
                  <p className="text-slate-700 font-medium">{selectedDoc.documentName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Category
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      categoryBadgeColors[selectedDoc.category]
                    )}
                  >
                    {selectedDoc.category}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    File
                  </p>
                  <p className="text-slate-700">
                    {selectedDoc.fileName} ({formatFileSize(selectedDoc.fileSize)})
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Uploaded
                  </p>
                  <p className="text-slate-700">{formatDate(selectedDoc.uploadedAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <StatusBadge variant={statusVariantMap[selectedDoc.status]} size="sm" dot>
                    {statusLabelMap[selectedDoc.status]}
                  </StatusBadge>
                </div>
                {selectedDoc.expiryDate && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Expiry
                    </p>
                    <p
                      className={cn(
                        'font-medium',
                        isExpired(selectedDoc.expiryDate) ? 'text-red-600' : 'text-slate-700'
                      )}
                    >
                      {formatDate(selectedDoc.expiryDate)}
                    </p>
                  </div>
                )}
                {selectedDoc.verifiedAt && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Verified
                    </p>
                    <p className="text-emerald-600 font-medium">
                      {formatDate(selectedDoc.verifiedAt)}
                    </p>
                  </div>
                )}
              </div>
              {selectedDoc.notes && (
                <div className="bg-slate-50 rounded-lg px-3 py-2.5 text-sm text-slate-700 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Notes
                  </span>
                  {selectedDoc.notes}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Verify Document
            </DialogTitle>
            <DialogDescription>
              Confirm verification of{' '}
              <span className="font-medium text-slate-700">
                {selectedDoc?.documentName}
              </span>{' '}
              for{' '}
              <span className="font-medium text-slate-700">{selectedDoc?.employeeName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Note (optional)</label>
              <textarea
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
              onClick={confirmVerify}
            >
              <ShieldCheck className="w-4 h-4" />
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Reject Document
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting{' '}
              <span className="font-medium text-slate-700">
                {selectedDoc?.documentName}
              </span>{' '}
              for{' '}
              <span className="font-medium text-slate-700">{selectedDoc?.employeeName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why the document is being rejected..."
                rows={3}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={confirmReject}
            >
              <ShieldX className="w-4 h-4" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
