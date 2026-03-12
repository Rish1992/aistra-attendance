export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'WFH' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKEND'
export type WorkLocation = 'Office' | 'WFH' | 'Client Site' | 'Remote'
export type AttendanceSource = 'Manual' | 'System' | 'Admin'

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  totalHours?: number
  status: AttendanceStatus
  workLocation: WorkLocation
  notes?: string
  isEdited: boolean
  editedBy?: string
  editReason?: string
  source: AttendanceSource
}

export interface AttendanceRules {
  standardWorkHours: number
  halfDayThreshold: number
  lateThresholdMinutes: number
  workStartTime: string
  autoAbsentTime: string
  missingCheckoutReminderMinutes: number
}
