const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = async (email: string, _password: string) => {
  await delay(500)
  const { mockUsers } = await import('./users')
  const user = mockUsers.find(u => u.email === email)
  if (!user) throw new Error('Invalid email or password')
  // In real app, compare bcrypt hash. Here we accept any password.
  const { passwordHash: _, ...userData } = user
  return {
    token: `mock-jwt-${user.id}-${Date.now()}`,
    user: userData,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  }
}

// ─── Employees ───────────────────────────────────────────────────────────────

export const getEmployees = async () => {
  await delay()
  const { mockEmployees } = await import('./employees')
  return mockEmployees
}

export const getEmployeeById = async (id: string) => {
  await delay()
  const { mockEmployees } = await import('./employees')
  const employee = mockEmployees.find(e => e.id === id || e.employeeId === id)
  if (!employee) throw new Error(`Employee not found: ${id}`)
  return employee
}

// ─── Attendance ──────────────────────────────────────────────────────────────

export const checkIn = async (employeeId: string, location: string, notes?: string) => {
  await delay()
  const { mockEmployees } = await import('./employees')
  const employee = mockEmployees.find(e => e.employeeId === employeeId)
  if (!employee) throw new Error(`Employee not found: ${employeeId}`)

  const now = new Date()
  const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const isLate = now.getHours() >= 10

  return {
    id: `att-new-${Date.now()}`,
    employeeId,
    employeeName: employee.fullName,
    date: now.toISOString().split('T')[0],
    checkInTime,
    status: isLate ? 'LATE' : (location === 'WFH' ? 'WFH' : 'PRESENT'),
    workLocation: location as 'Office' | 'WFH' | 'Client Site' | 'Remote',
    notes,
    isEdited: false,
    source: 'System' as const,
  }
}

export const checkOut = async (employeeId: string) => {
  await delay()
  const now = new Date()
  const checkOutTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return {
    employeeId,
    checkOutTime,
    date: now.toISOString().split('T')[0],
  }
}

export const getMyAttendance = async (employeeId: string) => {
  await delay()
  const { mockAttendanceRecords } = await import('./attendance')
  return mockAttendanceRecords.filter(r => r.employeeId === employeeId)
}

export const getTeamAttendance = async (managerId: string, date: string) => {
  await delay()
  const { mockEmployees } = await import('./employees')
  const { mockAttendanceRecords } = await import('./attendance')

  const directReports = mockEmployees.filter(e => e.reportingManagerId === managerId)
  const directReportIds = directReports.map(e => e.employeeId)

  return mockAttendanceRecords.filter(
    r => directReportIds.includes(r.employeeId) && r.date === date
  )
}

export const adminEditAttendance = async (
  recordId: string,
  updates: Partial<import('@/types/attendance').AttendanceRecord>,
  reason: string
) => {
  await delay()
  const { mockAttendanceRecords } = await import('./attendance')
  const record = mockAttendanceRecords.find(r => r.id === recordId)
  if (!record) throw new Error(`Record not found: ${recordId}`)

  const edited = {
    ...record,
    ...updates,
    isEdited: true,
    editedBy: 'admin',
    editReason: reason,
    source: 'Admin' as const,
  }

  return edited
}

export const bulkMarkAttendance = async (
  employeeId: string,
  entries: Array<{ date: string; reason: string }>
) => {
  await delay(500)
  const { mockEmployees } = await import('./employees')
  const employee = mockEmployees.find(e => e.employeeId === employeeId)
  if (!employee) throw new Error(`Employee not found: ${employeeId}`)

  return entries.map((entry) => ({
    id: `att-bulk-${entry.date}-${Date.now()}`,
    employeeId,
    employeeName: employee.fullName,
    date: entry.date,
    checkInTime: '09:30',
    checkOutTime: '18:30',
    totalHours: 9,
    status: 'PRESENT' as const,
    workLocation: 'Office' as const,
    notes: entry.reason,
    isEdited: true,
    editedBy: employeeId,
    editReason: entry.reason,
    source: 'Manual' as const,
  }))
}

// ─── Leaves ──────────────────────────────────────────────────────────────────

export const getMyLeaves = async (employeeId: string) => {
  await delay()
  const { mockLeaveApplications } = await import('./leaves')
  return mockLeaveApplications.filter(l => l.employeeId === employeeId)
}

export const getLeaveBalance = async (employeeId: string) => {
  await delay()
  const { mockLeaveBalances } = await import('./leaves')
  return mockLeaveBalances.filter(b => b.employeeId === employeeId)
}

export const getLeaveBalances = getLeaveBalance

export const cancelLeave = async (leaveId: string) => {
  await delay()
  const { mockLeaveApplications } = await import('./leaves')
  const leave = mockLeaveApplications.find(l => l.id === leaveId)
  if (!leave) throw new Error(`Leave not found: ${leaveId}`)

  return {
    ...leave,
    status: 'CANCELLED' as const,
    cancelledAt: new Date().toISOString(),
  }
}

export const withdrawLeave = async (leaveId: string, reason: string) => {
  await delay()
  const { mockLeaveApplications } = await import('./leaves')
  const leave = mockLeaveApplications.find(l => l.id === leaveId)
  if (!leave) throw new Error(`Leave not found: ${leaveId}`)

  return {
    ...leave,
    status: 'CANCELLED' as const,
    cancelledAt: new Date().toISOString(),
    withdrawReason: reason,
  }
}

export const applyLeave = async (data: Omit<import('@/types/leave').LeaveApplication, 'id' | 'status' | 'appliedAt'>) => {
  await delay(500)
  return {
    id: `lv-new-${Date.now()}`,
    ...data,
    status: 'PENDING' as const,
    appliedAt: new Date().toISOString(),
  } satisfies import('@/types/leave').LeaveApplication
}

export const approveLeave = async (leaveId: string, comment?: string) => {
  await delay()
  const { mockLeaveApplications } = await import('./leaves')
  const leave = mockLeaveApplications.find(l => l.id === leaveId)
  if (!leave) throw new Error(`Leave not found: ${leaveId}`)

  return {
    ...leave,
    status: 'APPROVED' as const,
    approverComment: comment,
    approvedAt: new Date().toISOString(),
  }
}

export const rejectLeave = async (leaveId: string, reason: string) => {
  await delay()
  const { mockLeaveApplications } = await import('./leaves')
  const leave = mockLeaveApplications.find(l => l.id === leaveId)
  if (!leave) throw new Error(`Leave not found: ${leaveId}`)

  return {
    ...leave,
    status: 'REJECTED' as const,
    approverComment: reason,
  }
}

export const getPendingApprovals = async (managerId: string) => {
  await delay()
  const { mockLeaveApplications } = await import('./leaves')
  const { mockUsers } = await import('./users')

  const manager = mockUsers.find(u => u.id === managerId)
  if (!manager) throw new Error(`Manager not found: ${managerId}`)

  return mockLeaveApplications.filter(
    l => l.approverId === managerId && l.status === 'PENDING'
  )
}

// ─── Holidays ────────────────────────────────────────────────────────────────

export const getHolidays = async (year?: number) => {
  await delay()
  const { mockHolidays } = await import('./holidays')
  if (year) return mockHolidays.filter(h => h.year === year)
  return mockHolidays
}

// ─── Documents ───────────────────────────────────────────────────────────────

export const getMyDocuments = async (employeeId: string) => {
  await delay()
  const { mockDocuments } = await import('./documents')
  return mockDocuments.filter(d => d.employeeId === employeeId)
}

export const getAllDocuments = async () => {
  await delay()
  const { mockDocuments } = await import('./documents')
  return mockDocuments
}

export const updateDocument = async (
  documentId: string,
  updates: Partial<Pick<import('@/types/document').EmployeeDocument, 'documentName' | 'category'>>
) => {
  await delay()
  const { mockDocuments } = await import('./documents')
  const doc = mockDocuments.find(d => d.id === documentId)
  if (!doc) throw new Error(`Document not found: ${documentId}`)
  return { ...doc, ...updates }
}

export const deleteDocument = async (documentId: string) => {
  await delay()
  const { mockDocuments } = await import('./documents')
  const doc = mockDocuments.find(d => d.id === documentId)
  if (!doc) throw new Error(`Document not found: ${documentId}`)
  return { success: true, id: documentId }
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export const getOnboardingChecklists = async () => {
  await delay()
  const { mockOnboardingChecklists } = await import('./onboarding')
  return mockOnboardingChecklists
}

// ─── Performance ─────────────────────────────────────────────────────────────

export const getGoals = async (employeeId: string) => {
  await delay()
  const { mockGoals } = await import('./performance')
  return mockGoals.filter(g => g.employeeId === employeeId)
}

export const getReviews = async (employeeId: string) => {
  await delay()
  const { mockReviews } = await import('./performance')
  return mockReviews.filter(r => r.employeeId === employeeId)
}

// ─── Notifications ───────────────────────────────────────────────────────────

export const getNotifications = async (userId: string) => {
  await delay()
  const { mockNotifications } = await import('./notifications')
  return mockNotifications.filter(n => n.userId === userId)
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────

export const getAuditTrail = async (_filters?: Record<string, unknown>) => {
  await delay()
  const { mockAuditTrail } = await import('./audit-trail')
  return mockAuditTrail
}

// ─── Notifications (mutations) ──────────────────────────────────────────────

export const markNotificationAsRead = async (_notificationId: string) => {
  await delay(100)
}

export const markAllNotificationsAsRead = async (_recipientId: string) => {
  await delay(100)
}

// ─── Settings ───────────────────────────────────────────────────────────────

export const getSettings = async () => {
  await delay()
  return {
    attendanceRules: {
      standardWorkHours: 9,
      halfDayThreshold: 4.5,
      lateThresholdMinutes: 15,
      workStartTime: '09:30',
      autoAbsentTime: '12:00',
      missingCheckoutReminderMinutes: 30,
    },
    leavePolicies: [
      { type: 'EL' as const, label: 'Earned Leave', annualQuota: 18, carryForwardLimit: 10, minDaysPerRequest: 1, maxDaysPerRequest: 15, requiresAttachment: false },
      { type: 'PL' as const, label: 'Paid Leave', annualQuota: 12, carryForwardLimit: 0, minDaysPerRequest: 1, maxDaysPerRequest: 5, requiresAttachment: true, attachmentThreshold: 3 },
      { type: 'WFH' as const, label: 'Work From Home', annualQuota: 24, carryForwardLimit: 0, minDaysPerRequest: 1, maxDaysPerRequest: 5, requiresAttachment: false },
      { type: 'OH' as const, label: 'Optional Holiday', annualQuota: 2, carryForwardLimit: 0, minDaysPerRequest: 1, maxDaysPerRequest: 1, requiresAttachment: false },
    ],
  }
}

export const updateAttendanceRules = async (rules: import('@/types/attendance').AttendanceRules) => {
  await delay()
  return rules
}

export const updateLeavePolicy = async (policy: import('@/types/leave').LeavePolicy) => {
  await delay()
  return policy
}

// ─── Onboarding (mutations) ─────────────────────────────────────────────────

export const updateOnboardingTaskStatus = async (employeeId: string, taskId: string, status: string) => {
  await delay()
  const { mockOnboardingChecklists } = await import('./onboarding')
  const checklist = mockOnboardingChecklists.find(c => c.employeeId === employeeId)
  if (!checklist) throw new Error(`Checklist not found for: ${employeeId}`)

  const updatedTasks = checklist.tasks.map(t =>
    t.id === taskId ? { ...t, status: status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' } : t
  )
  const completed = updatedTasks.filter(t => t.status === 'COMPLETED').length
  return {
    ...checklist,
    tasks: updatedTasks,
    overallProgress: Math.round((completed / updatedTasks.length) * 100),
  }
}
