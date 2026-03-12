import { create } from 'zustand'
import type { OnboardingChecklist, OnboardingTaskStatus } from '@/types/onboarding'

interface OnboardingState {
  checklists: OnboardingChecklist[]
  isLoading: boolean
  fetchChecklists: () => Promise<void>
  updateTaskStatus: (employeeId: string, taskId: string, status: OnboardingTaskStatus) => Promise<void>
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  checklists: [],
  isLoading: false,
  fetchChecklists: async () => {
    set({ isLoading: true })
    const { getOnboardingChecklists } = await import('@/mock/handlers')
    const checklists = await getOnboardingChecklists()
    set({ checklists, isLoading: false })
  },
  updateTaskStatus: async (employeeId: string, taskId: string, status: OnboardingTaskStatus) => {
    set({ isLoading: true })
    const { updateOnboardingTaskStatus } = await import('@/mock/handlers')
    const updatedChecklist = await updateOnboardingTaskStatus(employeeId, taskId, status)
    set((state) => ({
      checklists: state.checklists.map((c) =>
        c.employeeId === employeeId ? updatedChecklist : c
      ),
      isLoading: false,
    }))
  },
}))
