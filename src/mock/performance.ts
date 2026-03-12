export interface PerformanceGoal {
  id: string
  employeeId: string
  employeeName: string
  title: string
  description: string
  category: 'Business' | 'Technical' | 'Growth' | 'Team'
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK'
  progress: number
  startDate: string
  endDate: string
  keyResults: KeyResult[]
  createdAt: string
  updatedAt: string
}

export interface KeyResult {
  id: string
  title: string
  targetValue: number
  currentValue: number
  unit: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK'
}

export interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  reviewPeriod: string
  reviewType: 'QUARTERLY' | 'ANNUAL' | 'PROBATION'
  selfAssessment: {
    rating: number
    strengths: string
    improvements: string
    goals: string
  }
  managerAssessment: {
    rating: number
    strengths: string
    improvements: string
    goals: string
    overallComments: string
  } | null
  status: 'SELF_REVIEW' | 'MANAGER_REVIEW' | 'COMPLETED'
  managerId: string
  managerName: string
  submittedAt: string
  completedAt?: string
}

export const mockGoals: PerformanceGoal[] = [
  {
    id: 'goal-001',
    employeeId: 'AST-0005',
    employeeName: 'Ananya Sharma',
    title: 'Deliver HRMS Attendance Module',
    description: 'Build and ship the complete attendance module with check-in, calendar, and admin views',
    category: 'Technical',
    status: 'IN_PROGRESS',
    progress: 65,
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    keyResults: [
      { id: 'kr-001-1', title: 'Complete check-in/check-out flow with location', targetValue: 100, currentValue: 100, unit: '%', status: 'COMPLETED' },
      { id: 'kr-001-2', title: 'Build attendance calendar view', targetValue: 100, currentValue: 80, unit: '%', status: 'IN_PROGRESS' },
      { id: 'kr-001-3', title: 'Implement admin attendance management', targetValue: 100, currentValue: 40, unit: '%', status: 'IN_PROGRESS' },
      { id: 'kr-001-4', title: 'Achieve 95% test coverage', targetValue: 95, currentValue: 60, unit: '%', status: 'IN_PROGRESS' },
    ],
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-03-08T15:00:00Z',
  },
  {
    id: 'goal-002',
    employeeId: 'AST-0005',
    employeeName: 'Ananya Sharma',
    title: 'Improve code review turnaround',
    description: 'Reduce average PR review time and improve review quality',
    category: 'Team',
    status: 'IN_PROGRESS',
    progress: 50,
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    keyResults: [
      { id: 'kr-002-1', title: 'Average PR review time under 4 hours', targetValue: 4, currentValue: 6, unit: 'hours', status: 'AT_RISK' },
      { id: 'kr-002-2', title: 'Review at least 15 PRs per sprint', targetValue: 15, currentValue: 12, unit: 'PRs', status: 'IN_PROGRESS' },
      { id: 'kr-002-3', title: 'Zero critical bugs in reviewed PRs', targetValue: 0, currentValue: 1, unit: 'bugs', status: 'AT_RISK' },
    ],
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-03-05T14:00:00Z',
  },
  {
    id: 'goal-003',
    employeeId: 'AST-0003',
    employeeName: 'Deepak Gupta',
    title: 'Scale engineering team to 10 members',
    description: 'Hire and onboard new engineers to support product growth',
    category: 'Team',
    status: 'IN_PROGRESS',
    progress: 40,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    keyResults: [
      { id: 'kr-003-1', title: 'Hire 3 new engineers', targetValue: 3, currentValue: 1, unit: 'hires', status: 'IN_PROGRESS' },
      { id: 'kr-003-2', title: 'Onboard all hires within 2 weeks', targetValue: 100, currentValue: 100, unit: '%', status: 'COMPLETED' },
      { id: 'kr-003-3', title: 'Reduce onboarding time to under 30 days', targetValue: 30, currentValue: 35, unit: 'days', status: 'IN_PROGRESS' },
      { id: 'kr-003-4', title: 'Maintain team satisfaction score above 4.0', targetValue: 4, currentValue: 4.2, unit: 'rating', status: 'COMPLETED' },
    ],
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'goal-004',
    employeeId: 'AST-0003',
    employeeName: 'Deepak Gupta',
    title: 'Achieve 99.9% platform uptime',
    description: 'Improve infrastructure reliability and monitoring',
    category: 'Technical',
    status: 'COMPLETED',
    progress: 100,
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    keyResults: [
      { id: 'kr-004-1', title: 'Set up automated monitoring with alerts', targetValue: 100, currentValue: 100, unit: '%', status: 'COMPLETED' },
      { id: 'kr-004-2', title: 'Reduce MTTR to under 15 minutes', targetValue: 15, currentValue: 12, unit: 'minutes', status: 'COMPLETED' },
      { id: 'kr-004-3', title: 'Achieve 99.9% uptime for Q4', targetValue: 99.9, currentValue: 99.95, unit: '%', status: 'COMPLETED' },
    ],
    createdAt: '2025-09-20T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'goal-005',
    employeeId: 'AST-0006',
    employeeName: 'Vikram Patel',
    title: 'Establish design system v2.0',
    description: 'Create comprehensive design system with tokens, components, and documentation',
    category: 'Technical',
    status: 'IN_PROGRESS',
    progress: 55,
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    keyResults: [
      { id: 'kr-005-1', title: 'Define all design tokens (colors, typography, spacing)', targetValue: 100, currentValue: 90, unit: '%', status: 'IN_PROGRESS' },
      { id: 'kr-005-2', title: 'Create 40 reusable Figma components', targetValue: 40, currentValue: 28, unit: 'components', status: 'IN_PROGRESS' },
      { id: 'kr-005-3', title: 'Write documentation for all components', targetValue: 40, currentValue: 15, unit: 'docs', status: 'AT_RISK' },
      { id: 'kr-005-4', title: 'Get sign-off from product and engineering leads', targetValue: 2, currentValue: 0, unit: 'approvals', status: 'NOT_STARTED' },
    ],
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-03-07T16:00:00Z',
  },
  {
    id: 'goal-006',
    employeeId: 'AST-0004',
    employeeName: 'Priya Nair',
    title: 'Launch HRMS product to all employees',
    description: 'Coordinate cross-functional efforts to ship HRMS V1 and drive adoption',
    category: 'Business',
    status: 'IN_PROGRESS',
    progress: 45,
    startDate: '2026-01-01',
    endDate: '2026-04-30',
    keyResults: [
      { id: 'kr-006-1', title: 'Complete all 10 modules for V1', targetValue: 10, currentValue: 4, unit: 'modules', status: 'IN_PROGRESS' },
      { id: 'kr-006-2', title: 'Achieve 80% employee adoption in first month', targetValue: 80, currentValue: 0, unit: '%', status: 'NOT_STARTED' },
      { id: 'kr-006-3', title: 'Zero critical bugs in production', targetValue: 0, currentValue: 0, unit: 'bugs', status: 'IN_PROGRESS' },
      { id: 'kr-006-4', title: 'Complete user acceptance testing with 10 pilot users', targetValue: 10, currentValue: 5, unit: 'users', status: 'IN_PROGRESS' },
      { id: 'kr-006-5', title: 'Create training material for all roles', targetValue: 4, currentValue: 1, unit: 'guides', status: 'IN_PROGRESS' },
    ],
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-03-09T11:00:00Z',
  },
  {
    id: 'goal-007',
    employeeId: 'AST-0007',
    employeeName: 'Rahul Mehra',
    title: 'Achieve Q1 sales target',
    description: 'Close new enterprise deals and expand existing accounts',
    category: 'Business',
    status: 'AT_RISK',
    progress: 35,
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    keyResults: [
      { id: 'kr-007-1', title: 'Close 5 new enterprise deals', targetValue: 5, currentValue: 2, unit: 'deals', status: 'AT_RISK' },
      { id: 'kr-007-2', title: 'Generate INR 50L in new revenue', targetValue: 50, currentValue: 18, unit: 'lakhs', status: 'AT_RISK' },
      { id: 'kr-007-3', title: 'Maintain pipeline of 20+ qualified leads', targetValue: 20, currentValue: 15, unit: 'leads', status: 'IN_PROGRESS' },
    ],
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'goal-008',
    employeeId: 'AST-0002',
    employeeName: 'Sneha Iyer',
    title: 'Implement HRMS for internal use',
    description: 'Drive adoption of HRMS platform replacing manual HR processes',
    category: 'Business',
    status: 'IN_PROGRESS',
    progress: 50,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    keyResults: [
      { id: 'kr-008-1', title: 'Migrate all employee records to HRMS', targetValue: 100, currentValue: 60, unit: '%', status: 'IN_PROGRESS' },
      { id: 'kr-008-2', title: 'Train all managers on leave approval workflow', targetValue: 100, currentValue: 40, unit: '%', status: 'IN_PROGRESS' },
      { id: 'kr-008-3', title: 'Reduce manual HR processes by 70%', targetValue: 70, currentValue: 30, unit: '%', status: 'IN_PROGRESS' },
      { id: 'kr-008-4', title: 'Achieve employee satisfaction score of 4+', targetValue: 4, currentValue: 3.8, unit: 'rating', status: 'IN_PROGRESS' },
    ],
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-03-08T14:00:00Z',
  },
  {
    id: 'goal-009',
    employeeId: 'AST-0006',
    employeeName: 'Vikram Patel',
    title: 'Complete UX research for HRMS',
    description: 'Conduct user research to inform HRMS design decisions',
    category: 'Growth',
    status: 'COMPLETED',
    progress: 100,
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    keyResults: [
      { id: 'kr-009-1', title: 'Conduct 15 user interviews', targetValue: 15, currentValue: 15, unit: 'interviews', status: 'COMPLETED' },
      { id: 'kr-009-2', title: 'Create 4 user personas', targetValue: 4, currentValue: 4, unit: 'personas', status: 'COMPLETED' },
      { id: 'kr-009-3', title: 'Deliver UX audit report', targetValue: 1, currentValue: 1, unit: 'report', status: 'COMPLETED' },
    ],
    createdAt: '2025-10-25T10:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
  },
  {
    id: 'goal-010',
    employeeId: 'AST-0004',
    employeeName: 'Priya Nair',
    title: 'Upskill in data-driven product management',
    description: 'Complete certifications and apply learnings to HRMS analytics',
    category: 'Growth',
    status: 'NOT_STARTED',
    progress: 0,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    keyResults: [
      { id: 'kr-010-1', title: 'Complete product analytics certification', targetValue: 1, currentValue: 0, unit: 'cert', status: 'NOT_STARTED' },
      { id: 'kr-010-2', title: 'Set up 5 product dashboards with key metrics', targetValue: 5, currentValue: 0, unit: 'dashboards', status: 'NOT_STARTED' },
      { id: 'kr-010-3', title: 'Present data insights to leadership monthly', targetValue: 3, currentValue: 0, unit: 'presentations', status: 'NOT_STARTED' },
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
]

export const mockReviews: PerformanceReview[] = [
  {
    id: 'rev-001',
    employeeId: 'AST-0005',
    employeeName: 'Ananya Sharma',
    reviewPeriod: 'Q4 2025',
    reviewType: 'QUARTERLY',
    selfAssessment: {
      rating: 4,
      strengths: 'Strong problem-solving skills. Consistently delivered features ahead of schedule. Good at breaking down complex tasks into manageable pieces.',
      improvements: 'Need to improve documentation habits. Could be more proactive in design discussions.',
      goals: 'Lead the HRMS attendance module. Mentor junior developers joining the team.',
    },
    managerAssessment: {
      rating: 4,
      strengths: 'Ananya is a reliable engineer who consistently delivers high-quality code. Her technical skills are excellent and she is a great team player.',
      improvements: 'Should work on communication during sprint planning. Needs to speak up more in cross-functional meetings.',
      goals: 'Take ownership of HRMS attendance module end-to-end. Start conducting technical interviews.',
      overallComments: 'Excellent quarter. Ready for more leadership responsibilities.',
    },
    status: 'COMPLETED',
    managerId: 'usr-003',
    managerName: 'Deepak Gupta',
    submittedAt: '2026-01-05T10:00:00Z',
    completedAt: '2026-01-10T14:00:00Z',
  },
  {
    id: 'rev-002',
    employeeId: 'AST-0006',
    employeeName: 'Vikram Patel',
    reviewPeriod: 'Q4 2025',
    reviewType: 'QUARTERLY',
    selfAssessment: {
      rating: 4,
      strengths: 'Strong visual design skills. Successfully completed UX research project. Good collaboration with engineering team.',
      improvements: 'Need to improve speed of iteration. Should learn more about accessibility standards.',
      goals: 'Build HRMS design system v2.0. Conduct accessibility audit of all products.',
    },
    managerAssessment: {
      rating: 3,
      strengths: 'Vikram produces beautiful designs and his UX research was very insightful. Good attention to detail.',
      improvements: 'Needs to improve delivery speed. Sometimes spends too long on pixel-perfection at the cost of shipping. Should focus more on systematic design thinking.',
      goals: 'Complete design system v2 by end of Q1. Improve handoff documentation for engineering.',
      overallComments: 'Good quarter but needs to balance quality with speed. Has potential for growth.',
    },
    status: 'COMPLETED',
    managerId: 'usr-004',
    managerName: 'Priya Nair',
    submittedAt: '2026-01-04T11:00:00Z',
    completedAt: '2026-01-12T15:00:00Z',
  },
  {
    id: 'rev-003',
    employeeId: 'AST-0007',
    employeeName: 'Rahul Mehra',
    reviewPeriod: 'Q4 2025',
    reviewType: 'QUARTERLY',
    selfAssessment: {
      rating: 3,
      strengths: 'Good relationship building with clients. Strong product knowledge. Improved demo skills significantly.',
      improvements: 'Need to improve pipeline management. Should follow up more consistently with prospects.',
      goals: 'Close 5 enterprise deals in Q1. Build structured follow-up process.',
    },
    managerAssessment: {
      rating: 3,
      strengths: 'Rahul has good client rapport and product understanding. His demo skills have improved noticeably.',
      improvements: 'Pipeline management needs significant improvement. Missed follow-ups have cost us 2 deals this quarter. Needs to be more organized.',
      goals: 'Implement CRM discipline. Achieve Q1 sales target of 50L.',
      overallComments: 'Meets expectations but has room to grow. Needs to be more systematic in approach.',
    },
    status: 'COMPLETED',
    managerId: 'usr-001',
    managerName: 'Rishabh Jain',
    submittedAt: '2026-01-06T09:00:00Z',
    completedAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'rev-004',
    employeeId: 'AST-0003',
    employeeName: 'Deepak Gupta',
    reviewPeriod: 'Q4 2025',
    reviewType: 'QUARTERLY',
    selfAssessment: {
      rating: 4,
      strengths: 'Successfully achieved 99.9% uptime. Built strong engineering processes. Good at mentoring team members.',
      improvements: 'Need to delegate more effectively. Should invest more time in strategic planning vs firefighting.',
      goals: 'Scale team to 10. Establish engineering excellence program. Reduce tech debt by 30%.',
    },
    managerAssessment: null,
    status: 'MANAGER_REVIEW',
    managerId: 'usr-001',
    managerName: 'Rishabh Jain',
    submittedAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'rev-005',
    employeeId: 'AST-0018',
    employeeName: 'Divya Krishnan',
    reviewPeriod: 'Probation Review (60 days)',
    reviewType: 'PROBATION',
    selfAssessment: {
      rating: 4,
      strengths: 'Quick learner, adapted to team processes fast. Found and reported 15 critical bugs in first month. Good at writing detailed test cases.',
      improvements: 'Need to learn more about the product domain. Should improve automation testing skills.',
      goals: 'Complete automation framework setup. Achieve 80% test coverage for HRMS modules.',
    },
    managerAssessment: null,
    status: 'SELF_REVIEW',
    managerId: 'usr-003',
    managerName: 'Deepak Gupta',
    submittedAt: '2026-01-20T10:00:00Z',
  },
]
