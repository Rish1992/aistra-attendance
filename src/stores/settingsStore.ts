import { create } from 'zustand'
import type { AttendanceRules } from '@/types/attendance'
import type { LeavePolicy } from '@/types/leave'

interface SettingsState {
  attendanceRules: AttendanceRules
  leavePolicies: LeavePolicy[]
  isLoading: boolean
  fetchSettings: () => Promise<void>
  updateAttendanceRules: (rules: AttendanceRules) => Promise<void>
  updateLeavePolicy: (policy: LeavePolicy) => Promise<void>
}

const defaultAttendanceRules: AttendanceRules = {
  standardWorkHours: 9,
  halfDayThreshold: 4.5,
  lateThresholdMinutes: 15,
  workStartTime: '09:30',
  autoAbsentTime: '12:00',
  missingCheckoutReminderMinutes: 30,
}

const defaultLeavePolicies: LeavePolicy[] = [
  { type: 'EL', label: 'Earned Leave', annualQuota: 18, carryForwardLimit: 10, minDaysPerRequest: 1, maxDaysPerRequest: 15, requiresAttachment: false },
  { type: 'PL', label: 'Paid Leave', annualQuota: 12, carryForwardLimit: 0, minDaysPerRequest: 1, maxDaysPerRequest: 5, requiresAttachment: true, attachmentThreshold: 3 },
  { type: 'WFH', label: 'Work From Home', annualQuota: 24, carryForwardLimit: 0, minDaysPerRequest: 1, maxDaysPerRequest: 5, requiresAttachment: false },
  { type: 'OH', label: 'Optional Holiday', annualQuota: 2, carryForwardLimit: 0, minDaysPerRequest: 1, maxDaysPerRequest: 1, requiresAttachment: false },
]

export const useSettingsStore = create<SettingsState>()((set) => ({
  attendanceRules: defaultAttendanceRules,
  leavePolicies: defaultLeavePolicies,
  isLoading: false,
  fetchSettings: async () => {
    set({ isLoading: true })
    const { getSettings } = await import('@/mock/handlers')
    const settings = await getSettings()
    set({
      attendanceRules: settings.attendanceRules,
      leavePolicies: settings.leavePolicies,
      isLoading: false,
    })
  },
  updateAttendanceRules: async (rules: AttendanceRules) => {
    set({ isLoading: true })
    const { updateAttendanceRules } = await import('@/mock/handlers')
    const updated = await updateAttendanceRules(rules)
    set({ attendanceRules: updated, isLoading: false })
  },
  updateLeavePolicy: async (policy: LeavePolicy) => {
    set({ isLoading: true })
    const { updateLeavePolicy } = await import('@/mock/handlers')
    const updated = await updateLeavePolicy(policy)
    set((state) => ({
      leavePolicies: state.leavePolicies.map((p) => (p.type === updated.type ? updated : p)),
      isLoading: false,
    }))
  },
}))
