import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { MarkAttendancePage } from '@/pages/attendance/MarkAttendancePage'
import { AttendanceHistoryPage } from '@/pages/attendance/AttendanceHistoryPage'
import { TeamAttendancePage } from '@/pages/attendance/TeamAttendancePage'
import { ApplyLeavePage } from '@/pages/leave/ApplyLeavePage'
import { LeaveStatusPage } from '@/pages/leave/LeaveStatusPage'
import { LeaveBalancePage } from '@/pages/leave/LeaveBalancePage'
import { LeaveApprovalsPage } from '@/pages/leave/LeaveApprovalsPage'
import { LeaveCalendarPage } from '@/pages/leave/LeaveCalendarPage'
import { HolidayListPage } from '@/pages/holiday/HolidayListPage'
import { ProfilePage } from '@/pages/employee/ProfilePage'
import { DirectoryPage } from '@/pages/employee/DirectoryPage'
import { EmployeeListPage } from '@/pages/employee/EmployeeListPage'
import { MyDocumentsPage } from '@/pages/document/MyDocumentsPage'
import { ManageDocumentsPage } from '@/pages/document/ManageDocumentsPage'
import { GoalsPage } from '@/pages/performance/GoalsPage'
import { ReviewsPage } from '@/pages/performance/ReviewsPage'
import { TeamGoalsPage } from '@/pages/performance/TeamGoalsPage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { AuditTrailPage } from '@/pages/audit/AuditTrailPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          // Redirect root to dashboard
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },

          // All roles
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'attendance/mark', element: <MarkAttendancePage /> },
          { path: 'attendance/history', element: <AttendanceHistoryPage /> },
          { path: 'leave/apply', element: <ApplyLeavePage /> },
          { path: 'leave/status', element: <LeaveStatusPage /> },
          { path: 'leave/balance', element: <LeaveBalancePage /> },
          { path: 'holidays', element: <HolidayListPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'directory', element: <DirectoryPage /> },
          { path: 'documents', element: <MyDocumentsPage /> },
          { path: 'performance/goals', element: <GoalsPage /> },
          { path: 'performance/reviews', element: <ReviewsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },

          // Manager + HR_ADMIN + SUPER_ADMIN
          {
            element: <RoleGuard allowedRoles={['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']} />,
            children: [
              { path: 'attendance/team', element: <TeamAttendancePage /> },
              { path: 'leave/approvals', element: <LeaveApprovalsPage /> },
              { path: 'leave/calendar', element: <LeaveCalendarPage /> },
              { path: 'performance/team-goals', element: <TeamGoalsPage /> },
            ],
          },

          // HR_ADMIN + SUPER_ADMIN only
          {
            element: <RoleGuard allowedRoles={['HR_ADMIN', 'SUPER_ADMIN']} />,
            children: [
              { path: 'employees', element: <EmployeeListPage /> },
              { path: 'documents/manage', element: <ManageDocumentsPage /> },
              { path: 'onboarding', element: <OnboardingPage /> },
              { path: 'reports', element: <ReportsPage /> },
              { path: 'audit-trail', element: <AuditTrailPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  // Catch-all
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
