export type OnboardingTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type OnboardingTaskGroup = 'HR' | 'IT/Admin' | 'Manager' | 'New Hire'

export interface OnboardingTask {
  id: string
  employeeId: string
  title: string
  description: string
  assignedTo: OnboardingTaskGroup
  assigneeName?: string
  status: OnboardingTaskStatus
  dueDate: string
  completedAt?: string
  completedBy?: string
  priority: 'High' | 'Medium' | 'Low'
}

export interface OnboardingChecklist {
  employeeId: string
  employeeName: string
  employeeDesignation: string
  department: string
  dateOfJoining: string
  tasks: OnboardingTask[]
  overallProgress: number
}
