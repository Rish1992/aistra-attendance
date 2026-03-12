export type LeaveType = 'EL' | 'PL' | 'WFH' | 'OH'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type HalfDayPeriod = 'FIRST_HALF' | 'SECOND_HALF'

export interface LeaveApplication {
  id: string
  employeeId: string
  employeeName: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  durationDays: number
  isHalfDay: boolean
  halfDayPeriod?: HalfDayPeriod
  reason: string
  attachment?: string
  status: LeaveStatus
  approverId: string
  approverName: string
  approverComment?: string
  approvedAt?: string
  appliedAt: string
  cancelledAt?: string
}

export interface LeaveBalance {
  employeeId: string
  type: LeaveType
  total: number
  used: number
  remaining: number
  carryForward: number
}

export interface LeavePolicy {
  type: LeaveType
  label: string
  annualQuota: number
  carryForwardLimit: number
  minDaysPerRequest: number
  maxDaysPerRequest: number
  requiresAttachment: boolean
  attachmentThreshold?: number
}
