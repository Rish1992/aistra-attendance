export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'SUPER_ADMIN'

export interface User {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: UserRole
  department: string
  designation: string
  avatar?: string
  managerId?: string
}

export interface Session {
  token: string
  user: User
  expiresAt: string
}
