export type NotificationType = 'INFO' | 'WARNING' | 'ACTION_REQUIRED' | 'COMPLETED' | 'REMINDER'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  isRead: boolean
  recipientId: string
  createdAt: string
}
