import { create } from 'zustand'
import type { Notification } from '@/types/notification'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isPanelOpen: boolean
  fetchNotifications: (recipientId: string) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: (recipientId: string) => Promise<void>
  togglePanel: () => void
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isPanelOpen: false,
  fetchNotifications: async (recipientId: string) => {
    const { getNotifications } = await import('@/mock/handlers')
    const notifications = await getNotifications(recipientId)
    const unreadCount = notifications.filter((n) => !n.isRead).length
    set({ notifications, unreadCount })
  },
  markAsRead: async (notificationId: string) => {
    const { markNotificationAsRead } = await import('@/mock/handlers')
    await markNotificationAsRead(notificationId)
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      }
    })
  },
  markAllAsRead: async (recipientId: string) => {
    const { markAllNotificationsAsRead } = await import('@/mock/handlers')
    await markAllNotificationsAsRead(recipientId)
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },
  togglePanel: () => set({ isPanelOpen: !get().isPanelOpen }),
}))
