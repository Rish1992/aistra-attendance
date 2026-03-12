export type EmployeeStatus = 'ACTIVE' | 'ON_NOTICE' | 'INACTIVE' | 'TERMINATED'
export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern'
export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'
export type LeaveEligibility = 'Eligible' | 'Probation' | 'Not Eligible'

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface BankDetails {
  accountNumber: string
  ifscCode: string
  bankName: string
}

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  department: string
  designation: string
  reportingManagerId: string
  reportingManagerName: string
  dateOfJoining: string
  dateOfBirth?: string
  gender?: Gender
  bloodGroup?: string
  emergencyContact?: EmergencyContact
  bankDetails?: BankDetails
  panNumber?: string
  aadhaarNumber?: string
  pfNumber?: string
  esiNumber?: string
  employmentType: EmploymentType
  workLocation: string
  shiftType: string
  leaveEligibility: LeaveEligibility
  status: EmployeeStatus
  avatar?: string
  createdAt: string
  updatedAt: string
}
