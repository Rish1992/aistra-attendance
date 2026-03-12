import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  loginAttempts: number
  lockedUntil: number | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      loginAttempts: 0,
      lockedUntil: null,
      login: async (email: string, password: string) => {
        const { loginAttempts, lockedUntil } = get()
        if (lockedUntil && Date.now() < lockedUntil) {
          set({ error: 'Account locked. Please try again later.' })
          return
        }
        set({ isLoading: true, error: null })
        try {
          const { login } = await import('@/mock/handlers')
          const session = await login(email, password)
          set({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            isLoading: false,
            loginAttempts: 0,
            lockedUntil: null,
          })
        } catch (err) {
          const attempts = loginAttempts + 1
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Login failed',
            loginAttempts: attempts,
            lockedUntil: attempts >= 5 ? Date.now() + 15 * 60 * 1000 : null,
          })
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'aistra-hrms-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
