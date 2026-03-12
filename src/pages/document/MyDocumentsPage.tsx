import { useEffect, useState, useMemo } from 'react'
import {
  FileText,
  Upload,
  Shield,
  GraduationCap,
  Briefcase,
  ClipboardCheck,
  FolderOpen,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  File,
  Pencil,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useDocumentStore } from '@/stores/documentStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileUploadZone } from '@/components/shared/FileUploadZone'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatFileSize } from '@/lib/formatters'
import { DOCUMENT_CATEGORIES } from '@/lib/constants'
import type { DocumentCategory, DocumentStatus, EmployeeDocument } from '@/types/document'

const categoryIcons: Record<DocumentCategory, typeof FileText> = {
  Identity: Shield,
  Education: GraduationCap,
  Employment: Briefcase,
  Compliance: ClipboardCheck,
  Other: FolderOpen,
}

const categoryColors: Record<DocumentCategory, string> = {
  Identity: 'bg-blue-50 text-blue-600 ring-blue-100',
  Education: 'bg-violet-50 text-violet-600 ring-violet-100',
  Employment: 'bg-teal-50 text-teal-600 ring-teal-100',
  Compliance: 'bg-amber-50 text-amber-600 ring-amber-100',
  Other: 'bg-slate-50 text-slate-600 ring-slate-100',
}

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

export function MyDocumentsPage() {
  const user = useAuthStore((s) => s.user)
  const { documents, isLoading, fetchMyDocuments, updateDocument, deleteDocument } =
    useDocumentStore()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadCategory, setUploadCategory] = useState<string>('')
  const [uploadDocName, setUploadDocName] = useState('')

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<EmployeeDocument | null>(null)
  const [editDocName, setEditDocName] = useState('')
  const [editCategory, setEditCategory] = useState<string>('')
  const [isEditSaving, setIsEditSaving] = useState(false)

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingDoc, setDeletingDoc] = useState<EmployeeDocument | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (user?.employeeId) {
      fetchMyDocuments(user.employeeId)
    }
  }, [user?.employeeId, fetchMyDocuments])

  const mandatoryDocs = useMemo(() => documents.filter((d) => d.isMandatory), [documents])
  const uploadedMandatory = useMemo(
    () => mandatoryDocs.filter((d) => d.status === 'VERIFIED' || d.status === 'PENDING').length,
    [mandatoryDocs]
  )
  const mandatoryTotal = mandatoryDocs.length || 1
  const progressPct = Math.round((uploadedMandatory / mandatoryTotal) * 100)

  const grouped = useMemo(() => {
    const groups: Record<DocumentCategory, EmployeeDocument[]> = {
      Identity: [],
      Education: [],
      Employment: [],
      Compliance: [],
      Other: [],
    }
    for (const doc of documents) {
      groups[doc.category].push(doc)
    }
    return groups
  }, [documents])

  const warningCount = useMemo(
    () =>
      documents.filter(
        (d) => d.status === 'EXPIRED' || isExpiringSoon(d.expiryDate) || d.status === 'REJECTED'
      ).length,
    [documents]
  )

  const handleUpload = (_files: File[]) => {
    // Mock upload — in real app this would call an API
  }

  const handleUploadSubmit = () => {
    setUploadDialogOpen(false)
    setUploadCategory('')
    setUploadDocName('')
  }

  const handleEditOpen = (doc: EmployeeDocument) => {
    setEditingDoc(doc)
    setEditDocName(doc.documentName)
    setEditCategory(doc.category)
    setEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setEditDialogOpen(false)
    setEditingDoc(null)
    setEditDocName('')
    setEditCategory('')
  }

  const handleEditSubmit = async () => {
    if (!editingDoc || !editDocName || !editCategory) return
    setIsEditSaving(true)
    try {
      await updateDocument(editingDoc.id, {
        documentName: editDocName,
        category: editCategory as DocumentCategory,
      })
      toast.success('Document updated successfully')
      handleEditClose()
    } catch {
      toast.error('Failed to update document')
    } finally {
      setIsEditSaving(false)
    }
  }

  const handleDeleteOpen = (doc: EmployeeDocument) => {
    setDeletingDoc(doc)
    setDeleteDialogOpen(true)
  }

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false)
    setDeletingDoc(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingDoc) return
    setIsDeleting(true)
    try {
      await deleteDocument(deletingDoc.id)
      toast.success('Document removed successfully')
      handleDeleteClose()
    } catch {
      toast.error('Failed to remove document')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Documents"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Documents' },
        ]}
        actions={
          <Button
            className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-sm"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        }
      />

      {/* Checklist Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center ring-4 ring-teal-50">
              <ClipboardCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-800">Document Checklist</h3>
              <p className="text-sm text-slate-500">
                {uploadedMandatory} of {mandatoryDocs.length} mandatory documents uploaded
              </p>
            </div>
          </div>
          {warningCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {warningCount} {warningCount === 1 ? 'issue' : 'issues'} need attention
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Progress
            value={progressPct}
            className="h-2.5 flex-1 bg-teal-100 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-teal-500 [&_[data-slot=progress-indicator]]:to-teal-400"
          />
          <span className="text-sm font-semibold text-teal-700 tabular-nums">{progressPct}%</span>
        </div>
      </div>

      {/* Documents by Category */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-28 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your first document to get started with the document checklist."
          action={
            <Button
              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </Button>
          }
        />
      ) : (
        <Tabs defaultValue="Identity" className="space-y-4">
          <TabsList className="bg-white border border-slate-200 rounded-lg p-1 h-auto flex-wrap">
            {DOCUMENT_CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat]
              const count = grouped[cat].length
              return (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="gap-1.5 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 rounded-md px-3 py-1.5 text-sm"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat}
                  {count > 0 && (
                    <span className="ml-1 bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {DOCUMENT_CATEGORIES.map((cat) => (
            <TabsContent key={cat} value={cat}>
              {grouped[cat].length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <FolderOpen className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">
                    No {cat.toLowerCase()} documents uploaded yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped[cat].map((doc, idx) => {
                    const expired = isExpired(doc.expiryDate)
                    const expiringSoon = isExpiringSoon(doc.expiryDate)
                    return (
                      <div
                        key={doc.id}
                        className={cn(
                          'bg-white rounded-xl border p-4 transition-all hover:shadow-md animate-fade-up group',
                          expired
                            ? 'border-red-200 bg-red-50/30'
                            : expiringSoon
                              ? 'border-amber-200 bg-amber-50/20'
                              : doc.status === 'REJECTED'
                                ? 'border-red-200 bg-red-50/20'
                                : 'border-slate-200'
                        )}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center ring-4 shrink-0',
                              categoryColors[doc.category]
                            )}
                          >
                            <File className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="font-display font-semibold text-sm text-slate-800 truncate">
                                  {doc.documentName}
                                </h4>
                                <p className="text-xs text-slate-400 truncate mt-0.5">
                                  {doc.fileName}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <StatusBadge
                                  variant={statusVariantMap[doc.status]}
                                  size="xs"
                                  dot
                                >
                                  {statusLabelMap[doc.status]}
                                </StatusBadge>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(doc.uploadedAt)}
                              </span>
                              <span>{formatFileSize(doc.fileSize)}</span>
                            </div>

                            {doc.expiryDate && (
                              <div
                                className={cn(
                                  'flex items-center gap-1 mt-2 text-xs font-medium',
                                  expired
                                    ? 'text-red-600'
                                    : expiringSoon
                                      ? 'text-amber-600'
                                      : 'text-slate-400'
                                )}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                {expired
                                  ? `Expired on ${formatDate(doc.expiryDate)}`
                                  : expiringSoon
                                    ? `Expires on ${formatDate(doc.expiryDate)}`
                                    : `Expires ${formatDate(doc.expiryDate)}`}
                              </div>
                            )}

                            {doc.status === 'REJECTED' && doc.notes && (
                              <div className="mt-2 bg-red-50 rounded-md px-2.5 py-1.5 text-xs text-red-700 border border-red-100">
                                <XCircle className="w-3 h-3 inline mr-1" />
                                {doc.notes}
                              </div>
                            )}

                            {doc.status === 'VERIFIED' && doc.verifiedAt && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified on {formatDate(doc.verifiedAt)}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3">
                              {doc.isMandatory ? (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                  Mandatory
                                </span>
                              ) : (
                                <span />
                              )}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleEditOpen(doc)}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white text-slate-500 border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition-colors"
                                  title="Edit document"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOpen(doc)}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white text-red-500 border border-red-200 shadow-sm hover:bg-red-50 hover:text-red-700 transition-colors"
                                  title="Remove document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Upload Document</DialogTitle>
            <DialogDescription>
              Select a category and upload your document file.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="w-full h-10 bg-white border-slate-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Document Name</label>
              <input
                type="text"
                value={uploadDocName}
                onChange={(e) => setUploadDocName(e.target.value)}
                placeholder="e.g. PAN Card, Degree Certificate"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">File</label>
              <FileUploadZone
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={10 * 1024 * 1024}
                onUpload={handleUpload}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              disabled={!uploadCategory || !uploadDocName}
              onClick={handleUploadSubmit}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => !open && handleEditClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Document</DialogTitle>
            <DialogDescription>
              Update the document name, category, or re-upload the file.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="w-full h-10 bg-white border-slate-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Document Name</label>
              <input
                type="text"
                value={editDocName}
                onChange={(e) => setEditDocName(e.target.value)}
                placeholder="e.g. PAN Card, Degree Certificate"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Re-upload File (optional)</label>
              <FileUploadZone
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={10 * 1024 * 1024}
                onUpload={handleUpload}
              />
              {editingDoc && (
                <p className="text-xs text-slate-400">
                  Current file: {editingDoc.fileName} ({formatFileSize(editingDoc.fileSize)})
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleEditClose}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              disabled={!editCategory || !editDocName || isEditSaving}
              onClick={handleEditSubmit}
            >
              {isEditSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && handleDeleteClose()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-red-600">Remove Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold text-slate-700">
                {deletingDoc?.documentName}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
            >
              {isDeleting ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
