import type { UserRole } from '@/types/user'

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; defaultPath: string }> = {
  EMPLOYEE: { label: 'Employee', color: 'bg-blue-100 text-blue-700', defaultPath: '/dashboard' },
  MANAGER: { label: 'Manager', color: 'bg-violet-100 text-violet-700', defaultPath: '/dashboard' },
  HR_ADMIN: { label: 'HR Admin', color: 'bg-teal-100 text-teal-700', defaultPath: '/dashboard' },
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-rose-100 text-rose-700', defaultPath: '/dashboard' },
}

export const ATTENDANCE_STATUS_CONFIG = {
  PRESENT: { label: 'Present', color: 'bg-emerald-500 text-white', dotColor: 'bg-emerald-500' },
  ABSENT: { label: 'Absent', color: 'bg-red-500 text-white', dotColor: 'bg-red-500' },
  LATE: { label: 'Late', color: 'bg-amber-500 text-white', dotColor: 'bg-amber-500' },
  HALF_DAY: { label: 'Half-Day', color: 'bg-orange-100 text-orange-700 border border-orange-200', dotColor: 'bg-orange-500' },
  WFH: { label: 'WFH', color: 'bg-blue-100 text-blue-700 border border-blue-200', dotColor: 'bg-blue-500' },
  ON_LEAVE: { label: 'On Leave', color: 'bg-violet-100 text-violet-700 border border-violet-200', dotColor: 'bg-violet-500' },
  HOLIDAY: { label: 'Holiday', color: 'bg-slate-100 text-slate-600', dotColor: 'bg-slate-400' },
  WEEKEND: { label: 'Weekend', color: 'bg-slate-50 text-slate-400', dotColor: 'bg-slate-300' },
} as const

export const LEAVE_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', dotColor: 'bg-yellow-500' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dotColor: 'bg-emerald-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border border-red-200', dotColor: 'bg-red-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-100 text-slate-600', dotColor: 'bg-slate-400' },
} as const

export const LEAVE_TYPE_CONFIG = {
  EL: { label: 'Earned Leave', shortLabel: 'EL', annual: 18, carryForward: 10, color: 'teal' },
  PL: { label: 'Paid Leave', shortLabel: 'PL', annual: 12, carryForward: 0, color: 'blue' },
  WFH: { label: 'Work From Home', shortLabel: 'WFH', annual: 24, carryForward: 0, color: 'violet' },
  OH: { label: 'Optional Holiday', shortLabel: 'OH', annual: 2, carryForward: 0, color: 'amber' },
} as const

export const DOCUMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  VERIFIED: { label: 'Verified', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border border-red-200' },
  EXPIRED: { label: 'Expired', color: 'bg-red-100 text-red-800 border border-red-300' },
} as const

export const EMPLOYEE_STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dotColor: 'bg-emerald-500' },
  ON_NOTICE: { label: 'On Notice', color: 'bg-amber-50 text-amber-700 border border-amber-200', dotColor: 'bg-amber-500' },
  INACTIVE: { label: 'Inactive', color: 'bg-slate-100 text-slate-600', dotColor: 'bg-slate-400' },
  TERMINATED: { label: 'Terminated', color: 'bg-red-50 text-red-700 border border-red-200', dotColor: 'bg-red-500' },
} as const

export const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Sales', 'Operations', 'HR', 'Finance', 'Marketing'] as const

export const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Intern'] as const

export const WORK_LOCATIONS = ['Office - Mumbai', 'Office - Bangalore', 'Office - Delhi', 'Remote', 'Hybrid', 'Client Site'] as const

export const SHIFT_TYPES = ['General (9:30-18:30)', 'Flexible', 'Night', 'Custom'] as const

export const DOCUMENT_CATEGORIES = ['Identity', 'Education', 'Employment', 'Compliance', 'Other'] as const

export const HOLIDAY_TYPES = ['National', 'Regional', 'Optional'] as const

export const PERFORMANCE_RATINGS = [
  { value: 5, label: 'Exceptional' },
  { value: 4, label: 'Exceeds Expectations' },
  { value: 3, label: 'Meets Expectations' },
  { value: 2, label: 'Needs Improvement' },
  { value: 1, label: 'Unsatisfactory' },
] as const

export const GOAL_STATUSES = ['Not Started', 'On Track', 'At Risk', 'Off Track', 'Completed'] as const

export const ONBOARDING_TASK_GROUPS = ['HR', 'IT/Admin', 'Manager', 'New Hire'] as const
