export type AuditEntityType = 'Employee' | 'Attendance' | 'Leave' | 'Document' | 'Goal' | 'Review' | 'Holiday' | 'Policy'
export type AuditAction = 'CREATED' | 'UPDATED' | 'DELETED' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface AuditEntry {
  id: string
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  changedFields?: { field: string; oldValue: string; newValue: string }[]
  performedBy: string
  performedByName: string
  performedAt: string
  ipAddress?: string
  reason?: string
}
