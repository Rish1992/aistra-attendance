import { create } from 'zustand'
import type { Holiday } from '@/types/holiday'

interface HolidayState {
  holidays: Holiday[]
  isLoading: boolean
  yearFilter: number
  fetchHolidays: (year?: number) => Promise<void>
  setYearFilter: (year: number) => void
}

export const useHolidayStore = create<HolidayState>()((set, get) => ({
  holidays: [],
  isLoading: false,
  yearFilter: new Date().getFullYear(),
  fetchHolidays: async (year?: number) => {
    set({ isLoading: true })
    const { getHolidays } = await import('@/mock/handlers')
    const targetYear = year ?? get().yearFilter
    const holidays = await getHolidays(targetYear)
    set({ holidays, isLoading: false, yearFilter: targetYear })
  },
  setYearFilter: (yearFilter) => set({ yearFilter }),
}))
