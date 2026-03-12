import { create } from 'zustand'
import type { AuditEntry, AuditEntityType, AuditAction } from '@/types/audit-trail'

interface AuditTrailFilters {
  entityType?: AuditEntityType
  action?: AuditAction
  performedBy?: string
  startDate?: string
  endDate?: string
}

interface AuditTrailState {
  entries: AuditEntry[]
  isLoading: boolean
  filters: AuditTrailFilters
  fetchAuditTrail: () => Promise<void>
  setFilters: (filters: AuditTrailFilters) => void
}

export const useAuditTrailStore = create<AuditTrailState>()((set, get) => ({
  entries: [],
  isLoading: false,
  filters: {},
  fetchAuditTrail: async () => {
    set({ isLoading: true })
    const { getAuditTrail } = await import('@/mock/handlers')
    const filters = get().filters
    const entries = await getAuditTrail(filters)
    set({ entries, isLoading: false })
  },
  setFilters: (filters) => set({ filters }),
}))
