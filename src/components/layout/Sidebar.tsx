import { NavLink, useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import type { UserRole } from '@/types/user'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Clock,
  History,
  Users,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Sun,
  Target,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Zap,
  FolderOpen,
  UserCircle,
  ListChecks,
  UsersRound,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles?: UserRole[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  HR_ADMIN: 2,
  SUPER_ADMIN: 3,
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/attendance/mark', label: 'Mark Attendance', icon: Clock },
      { to: '/attendance/history', label: 'Attendance History', icon: History },
      { to: '/attendance/team', label: 'Team Attendance', icon: UsersRound, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
      { to: '/leave/apply', label: 'Apply Leave', icon: Calendar },
      { to: '/leave/status', label: 'Leave Status', icon: CalendarCheck },
      { to: '/leave/balance', label: 'Leave Balance', icon: CalendarDays },
      { to: '/leave/approvals', label: 'Leave Approvals', icon: ListChecks, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
      { to: '/leave/calendar', label: 'Leave Calendar', icon: CalendarDays, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
      { to: '/holidays', label: 'Holidays', icon: Sun },
    ],
  },
  {
    title: 'PEOPLE',
    items: [
      { to: '/directory', label: 'Directory', icon: Users },
      { to: '/employees', label: 'Employee Management', icon: UserCircle, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    ],
  },
  {
    title: 'MANAGE',
    items: [
      { to: '/performance/goals', label: 'My Goals', icon: Target },
      { to: '/performance/team-goals', label: 'Team Goals', icon: Target, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
      { to: '/performance/reviews', label: 'Reviews', icon: BarChart3 },
      { to: '/documents', label: 'My Documents', icon: FileText },
      { to: '/documents/manage', label: 'Document Mgmt', icon: FolderOpen, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
      { to: '/onboarding', label: 'Onboarding', icon: ClipboardList, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
      { to: '/audit-trail', label: 'Audit Trail', icon: Shield, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
      { to: '/settings', label: 'Settings', icon: Settings, roles: ['HR_ADMIN', 'SUPER_ADMIN'] },
    ],
  },
]

function hasAccess(userRole: UserRole, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles) return true
  const userLevel = ROLE_HIERARCHY[userRole]
  return allowedRoles.some((role) => userLevel >= ROLE_HIERARCHY[role])
}

function SidebarNavItem({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const linkContent = (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
          isActive
            ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn(
              'size-[18px] shrink-0 transition-colors',
              isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
            )}
          />
          {!collapsed && (
            <span className="flex-1 truncate">{item.label}</span>
          )}
          {!collapsed && isActive && (
            <span className="size-1.5 rounded-full bg-teal-500" />
          )}
        </>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  const filteredSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => hasAccess(user.role, item.roles)),
  })).filter((section) => section.items.length > 0)

  return (
    <aside
      className={cn(
        'hidden flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] transition-all duration-300 lg:flex',
        collapsed ? 'w-[72px]' : 'w-[248px]'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-slate-200 dark:border-white/10',
          collapsed ? 'justify-center px-3' : 'gap-3 px-5'
        )}
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 shadow-sm">
          <Zap className="size-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-bold text-navy-900 dark:text-slate-100">
            Aistra<span className="text-teal-500">HR</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className={cn('space-y-5', collapsed ? 'px-2' : 'px-3')}>
          {filteredSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {section.title}
                </p>
              )}
              {collapsed && (
                <div className="mb-2 border-t border-slate-100 dark:border-white/6" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarNavItem
                    key={item.to}
                    item={item}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="border-t border-slate-100 dark:border-white/6 px-3 py-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-300"
        >
          {collapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </button>
      </div>

      {/* User Footer */}
      <div
        className={cn(
          'shrink-0 border-t border-slate-200 dark:border-white/10 p-3',
          collapsed ? 'flex flex-col items-center gap-2' : ''
        )}
      >
        <div
          className={cn(
            'flex items-center',
            collapsed ? 'flex-col gap-2' : 'gap-3'
          )}
        >
          <Avatar size="default">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.fullName} />}
            <AvatarFallback className="bg-teal-100 text-xs font-semibold text-teal-700">
              {user.firstName[0]}
              {user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {user.designation}
              </p>
            </div>
          )}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <LogOut className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Log out
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
