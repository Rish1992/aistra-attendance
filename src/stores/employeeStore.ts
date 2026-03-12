import { create } from 'zustand'
import type { Employee } from '@/types/employee'

interface EmployeeState {
  employees: Employee[]
  selectedEmployee: Employee | null
  isLoading: boolean
  searchQuery: string
  filters: { department?: string; status?: string; location?: string }
  fetchEmployees: () => Promise<void>
  fetchEmployeeById: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setFilters: (filters: { department?: string; status?: string; location?: string }) => void
  getFilteredEmployees: () => Employee[]
}

export const useEmployeeStore = create<EmployeeState>()((set, get) => ({
  employees: [],
  selectedEmployee: null,
  isLoading: false,
  searchQuery: '',
  filters: {},
  fetchEmployees: async () => {
    set({ isLoading: true })
    const { getEmployees } = await import('@/mock/handlers')
    const employees = await getEmployees()
    set({ employees, isLoading: false })
  },
  fetchEmployeeById: async (id: string) => {
    set({ isLoading: true })
    const { getEmployeeById } = await import('@/mock/handlers')
    const employee = await getEmployeeById(id)
    set({ selectedEmployee: employee, isLoading: false })
  },
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilters: (filters) => set({ filters }),
  getFilteredEmployees: () => {
    const { employees, searchQuery, filters } = get()
    return employees.filter((e) => {
      const matchesSearch =
        !searchQuery ||
        e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept = !filters.department || e.department === filters.department
      const matchesStatus = !filters.status || e.status === filters.status
      const matchesLocation = !filters.location || e.workLocation === filters.location
      return matchesSearch && matchesDept && matchesStatus && matchesLocation
    })
  },
}))
