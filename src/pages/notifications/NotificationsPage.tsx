import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  Bell,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  CheckCheck,
  Inbox,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/formatters'

type FilterTab = 'ALL' | 'UNREAD' | 'ACTION_REQUIRED'

const typeConfig: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
  GENERAL: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ATTENDANCE_REMINDER: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ACTION_REQUIRED: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  LEAVE_APPLIED: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  COMPLETED: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  LEAVE_APPROVAL: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  REMINDER: { icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50' },
  DOCUMENT_EXPIRY: { icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50' },
  ONBOARDING_TASK: { icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50' },
  LEAVE_REJECTED: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  PERFORMANCE_REVIEW: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
}

const actionRequiredTypes = ['ACTION_REQUIRED', 'LEAVE_APPLIED', 'ONBOARDING_TASK', 'DOCUMENT_EXPIRY', 'PERFORMANCE_REVIEW']

export function NotificationsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore()
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')

  useEffect(() => {
    if (user) fetchNotifications(user.id)
  }, [user])

  const filteredNotifications = useMemo(() => {
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    switch (activeTab) {
      case 'UNREAD':
        return sorted.filter((n) => !n.isRead)
      case 'ACTION_REQUIRED':
        return sorted.filter((n) => actionRequiredTypes.includes(n.type) && !n.isRead)
      default:
        return sorted
    }
  }, [notifications, activeTab])

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const actionCount = notifications.filter((n) => actionRequiredTypes.includes(n.type) && !n.isRead).length

  const handleNotificationClick = async (notification: (typeof notifications)[0]) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
    const link = (notification as Record<string, unknown>).actionUrl as string | undefined
    if (link) navigate(link)
  }

  const handleMarkAllRead = async () => {
    if (user) await markAllAsRead(user.id)
  }

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'ALL', label: 'All', count: notifications.length },
    { key: 'UNREAD', label: 'Unread', count: unreadCount },
    { key: 'ACTION_REQUIRED', label: 'Action Required', count: actionCount },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="h-9 px-4 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All as Read
            </button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold',
                  activeTab === tab.key
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-slate-200 text-slate-500'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <EmptyState
            icon={activeTab === 'UNREAD' ? CheckCircle2 : Inbox}
            title={
              activeTab === 'UNREAD'
                ? 'All caught up'
                : activeTab === 'ACTION_REQUIRED'
                  ? 'No action needed'
                  : 'No notifications'
            }
            description={
              activeTab === 'UNREAD'
                ? "You've read all your notifications"
                : activeTab === 'ACTION_REQUIRED'
                  ? 'No notifications require your action right now'
                  : 'You have no notifications yet'
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const config = typeConfig[notification.type] ?? typeConfig.INFO
            const IconComponent = config.icon
            return (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all animate-fade-up flex items-start gap-4',
                  !notification.isRead && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                )}
              >
                {/* Icon */}
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
                  <IconComponent className={cn('w-5 h-5', config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn('text-sm text-slate-800 truncate', !notification.isRead && 'font-medium')}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
