export type GoalStatus = 'Not Started' | 'On Track' | 'At Risk' | 'Off Track' | 'Completed'
export type ReviewStatus = 'SELF_REVIEW' | 'MANAGER_REVIEW' | 'COMPLETED'

export interface KeyResult {
  id: string
  title: string
  target: number
  current: number
  unit: string
  progress: number
}

export interface Goal {
  id: string
  employeeId: string
  employeeName: string
  title: string
  description: string
  keyResults: KeyResult[]
  weight: number
  status: GoalStatus
  progress: number
  reviewCycle: string
  dueDate: string
  createdAt: string
}

export interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  reviewerId: string
  reviewerName: string
  cycle: string
  selfAssessment?: Record<string, { rating: number; comments: string }>
  managerAssessment?: Record<string, { rating: number; comments: string }>
  peerFeedback?: PeerFeedback[]
  overallRating?: number
  managerComments?: string
  employeeComments?: string
  status: ReviewStatus
  completedAt?: string
  createdAt: string
}

export interface PeerFeedback {
  id: string
  reviewerId: string
  reviewerName: string
  strengths: string
  areasForImprovement: string
}
