import { create } from 'zustand'
import type { LeaveApplication, LeaveBalance } from '@/types/leave'

interface LeaveState {
  applications: LeaveApplication[]
  balances: LeaveBalance[]
  pendingApprovals: LeaveApplication[]
  isLoading: boolean
  fetchMyLeaves: (employeeId: string) => Promise<void>
  applyLeave: (application: Omit<LeaveApplication, 'id' | 'status' | 'appliedAt'>) => Promise<void>
  cancelLeave: (leaveId: string) => Promise<void>
  withdrawLeave: (leaveId: string, reason: string) => Promise<void>
  fetchBalances: (employeeId: string) => Promise<void>
  fetchPendingApprovals: (managerId: string) => Promise<void>
  approveLeave: (leaveId: string, comment?: string) => Promise<void>
  rejectLeave: (leaveId: string, comment: string) => Promise<void>
}

export const useLeaveStore = create<LeaveState>()((set, get) => ({
  applications: [],
  balances: [],
  pendingApprovals: [],
  isLoading: false,
  fetchMyLeaves: async (employeeId: string) => {
    set({ isLoading: true })
    const { getMyLeaves } = await import('@/mock/handlers')
    const applications = await getMyLeaves(employeeId)
    set({ applications, isLoading: false })
  },
  applyLeave: async (application) => {
    set({ isLoading: true })
    const { applyLeave } = await import('@/mock/handlers')
    const newApplication = await applyLeave(application)
    set((state) => ({
      applications: [newApplication, ...state.applications],
      isLoading: false,
    }))
  },
  cancelLeave: async (leaveId: string) => {
    set({ isLoading: true })
    const { cancelLeave } = await import('@/mock/handlers')
    const updated = await cancelLeave(leaveId)
    set((state) => ({
      applications: state.applications.map((a) => (a.id === leaveId ? updated : a)),
      isLoading: false,
    }))
  },
  withdrawLeave: async (leaveId: string, reason: string) => {
    set({ isLoading: true })
    const { withdrawLeave } = await import('@/mock/handlers')
    const updated = await withdrawLeave(leaveId, reason)
    set((state) => ({
      applications: state.applications.map((a) => (a.id === leaveId ? updated : a)),
      isLoading: false,
    }))
  },
  fetchBalances: async (employeeId: string) => {
    set({ isLoading: true })
    const { getLeaveBalances } = await import('@/mock/handlers')
    const balances = await getLeaveBalances(employeeId)
    set({ balances, isLoading: false })
  },
  fetchPendingApprovals: async (managerId: string) => {
    set({ isLoading: true })
    const { getPendingApprovals } = await import('@/mock/handlers')
    const pendingApprovals = await getPendingApprovals(managerId)
    set({ pendingApprovals, isLoading: false })
  },
  approveLeave: async (leaveId: string, comment?: string) => {
    set({ isLoading: true })
    const { approveLeave } = await import('@/mock/handlers')
    const updated = await approveLeave(leaveId, comment)
    set((state) => ({
      pendingApprovals: state.pendingApprovals.filter((a) => a.id !== leaveId),
      applications: state.applications.map((a) => (a.id === leaveId ? updated : a)),
      isLoading: false,
    }))
  },
  rejectLeave: async (leaveId: string, comment: string) => {
    set({ isLoading: true })
    const { rejectLeave } = await import('@/mock/handlers')
    const updated = await rejectLeave(leaveId, comment)
    set((state) => ({
      pendingApprovals: state.pendingApprovals.filter((a) => a.id !== leaveId),
      applications: state.applications.map((a) => (a.id === leaveId ? updated : a)),
      isLoading: false,
    }))
  },
}))
