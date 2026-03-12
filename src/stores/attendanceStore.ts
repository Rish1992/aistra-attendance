import { create } from 'zustand'
import type { AttendanceRecord } from '@/types/attendance'

interface AttendanceState {
  records: AttendanceRecord[]
  todayRecord: AttendanceRecord | null
  teamRecords: AttendanceRecord[]
  isLoading: boolean
  dateFilter: { startDate?: string; endDate?: string }
  fetchMyAttendance: (employeeId: string) => Promise<void>
  checkIn: (employeeId: string, workLocation: string) => Promise<void>
  checkOut: (recordId: string) => Promise<void>
  fetchTeamAttendance: (managerId: string, date?: string) => Promise<void>
  adminEditRecord: (recordId: string, updates: Partial<AttendanceRecord>, reason: string) => Promise<void>
  bulkMarkAttendance: (employeeId: string, entries: Array<{ date: string; reason: string }>) => Promise<void>
  setDateFilter: (filter: { startDate?: string; endDate?: string }) => void
}

export const useAttendanceStore = create<AttendanceState>()((set, get) => ({
  records: [],
  todayRecord: null,
  teamRecords: [],
  isLoading: false,
  dateFilter: {},
  fetchMyAttendance: async (employeeId: string) => {
    set({ isLoading: true })
    const { getMyAttendance } = await import('@/mock/handlers')
    const records = await getMyAttendance(employeeId)
    const today = new Date().toISOString().split('T')[0]
    const todayRecord = records.find((r) => r.date === today) ?? null
    set({ records, todayRecord, isLoading: false })
  },
  checkIn: async (employeeId: string, workLocation: string) => {
    set({ isLoading: true })
    const { checkIn } = await import('@/mock/handlers')
    const record = await checkIn(employeeId, workLocation)
    set((state) => ({
      todayRecord: record,
      records: [record, ...state.records],
      isLoading: false,
    }))
  },
  checkOut: async (recordId: string) => {
    set({ isLoading: true })
    const { checkOut } = await import('@/mock/handlers')
    const record = await checkOut(recordId)
    set((state) => ({
      todayRecord: record,
      records: state.records.map((r) => (r.id === recordId ? record : r)),
      isLoading: false,
    }))
  },
  fetchTeamAttendance: async (managerId: string, date?: string) => {
    set({ isLoading: true })
    const { getTeamAttendance } = await import('@/mock/handlers')
    const teamRecords = await getTeamAttendance(managerId, date)
    set({ teamRecords, isLoading: false })
  },
  adminEditRecord: async (recordId: string, updates: Partial<AttendanceRecord>, reason: string) => {
    set({ isLoading: true })
    const { adminEditAttendance } = await import('@/mock/handlers')
    const record = await adminEditAttendance(recordId, updates, reason)
    set((state) => ({
      records: state.records.map((r) => (r.id === recordId ? record : r)),
      teamRecords: state.teamRecords.map((r) => (r.id === recordId ? record : r)),
      isLoading: false,
    }))
  },
  bulkMarkAttendance: async (employeeId: string, entries: Array<{ date: string; reason: string }>) => {
    set({ isLoading: true })
    const { bulkMarkAttendance } = await import('@/mock/handlers')
    const newRecords = await bulkMarkAttendance(employeeId, entries)
    set((state) => ({
      records: [...newRecords, ...state.records],
      isLoading: false,
    }))
  },
  setDateFilter: (dateFilter) => set({ dateFilter }),
}))
