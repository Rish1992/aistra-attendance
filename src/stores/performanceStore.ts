import { create } from 'zustand'
import type { Goal, PerformanceReview } from '@/types/performance'

interface PerformanceState {
  goals: Goal[]
  reviews: PerformanceReview[]
  isLoading: boolean
  fetchGoals: (employeeId: string) => Promise<void>
  fetchReviews: (employeeId: string) => Promise<void>
}

export const usePerformanceStore = create<PerformanceState>()((set) => ({
  goals: [],
  reviews: [],
  isLoading: false,
  fetchGoals: async (employeeId: string) => {
    set({ isLoading: true })
    const { getGoals } = await import('@/mock/handlers')
    const goals = await getGoals(employeeId)
    set({ goals, isLoading: false })
  },
  fetchReviews: async (employeeId: string) => {
    set({ isLoading: true })
    const { getReviews } = await import('@/mock/handlers')
    const reviews = await getReviews(employeeId)
    set({ reviews, isLoading: false })
  },
}))
