import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const togglePanel = useNotificationStore((s) => s.togglePanel)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E293B] px-6">
      {/* Left - empty, page header handles content */}
      <div />

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-[#243B53] pl-9 pr-3 text-sm text-slate-700 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 focus:bg-white dark:focus:bg-[#1E293B] focus:ring-4 focus:ring-teal-500/20"
          />
        </div>

        {/* Notification Bell */}
        <button
          onClick={togglePanel}
          className="relative flex size-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#243B53] text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-[#334E68] hover:text-slate-700 dark:hover:text-slate-200"
        >
          <Bell className="size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex size-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#243B53] text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-[#334E68] hover:text-slate-700 dark:hover:text-slate-200"
        >
          {theme === 'light' ? (
            <Moon className="size-[18px]" />
          ) : (
            <Sun className="size-[18px]" />
          )}
        </button>

        {/* User Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                <Avatar size="default">
                  {user.avatar && (
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                  )}
                  <AvatarFallback className="bg-teal-100 text-xs font-semibold text-teal-700">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {user.fullName}
                  </p>
                </div>
                <ChevronDown className="hidden size-4 text-slate-400 md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer"
                >
                  <User />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/settings')}
                  className="cursor-pointer"
                >
                  <Settings />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                variant="destructive"
                className="cursor-pointer"
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
