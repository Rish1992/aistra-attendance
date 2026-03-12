export type DocumentCategory = 'Identity' | 'Education' | 'Employment' | 'Compliance' | 'Other'
export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'

export interface EmployeeDocument {
  id: string
  employeeId: string
  employeeName: string
  category: DocumentCategory
  documentName: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedBy: string
  uploadedAt: string
  status: DocumentStatus
  verifiedBy?: string
  verifiedAt?: string
  expiryDate?: string
  notes?: string
  isMandatory: boolean
}
