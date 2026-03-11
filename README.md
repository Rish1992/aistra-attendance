# Aistra HRMS

Internal Human Resource Management System for Aistra's India-based team.

## Overview

Aistra HRMS is a web-based platform serving as the single source of truth for employee data, attendance tracking, leave management, onboarding workflows, document lifecycle management, and performance reviews for a team of 30–40 employees.

## Modules

| # | Module | Description |
|---|---|---|
| M1 | Employee Database | Centralized employee records, profiles, org hierarchy, and reporting |
| M2 | Attendance Management | Daily check-in/check-out, work hours tracking, status classification, admin edits |
| M3 | Leave Management | Leave types, application flow, approval/rejection, balance tracking, calendar view |
| M4 | Holiday Management | Company and regional holiday calendar, auto-exclusion from leave calculations |
| M5 | Onboarding | New-hire task checklists, document collection, IT provisioning, buddy assignment |
| M6 | Document Tracking | Employee document lifecycle: upload, verify, track expiry, categorize |
| M7 | Performance Management | Goal setting, continuous feedback, quarterly check-ins, annual reviews |
| M8 | Reports & Dashboards | Role-based dashboards, attendance reports, leave utilisation, CSV/Excel export |
| M9 | Notifications | Email alerts for leave events, attendance reminders, onboarding tasks, review cycles |
| M10 | Audit Trail | Immutable log of all edits to attendance, leave decisions, and profile changes |

## User Roles

| Role | Description |
|---|---|
| Employee | Mark attendance, apply for leave, view own history/balance, manage profile, upload documents |
| Manager | Approve/reject leave, view team attendance, team leave calendar, review team performance |
| HR Admin | Add/remove employees, configure leave policies, edit attendance, manage holidays, run reports, view audit trail |
| Super Admin | All HR Admin capabilities plus system settings, role management, and integrations |

## Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** TailwindCSS 4 + shadcn/ui
- **State Management:** Zustand (with persistence middleware)
- **Forms:** React Hook Form + Zod
- **Routing:** React Router 7 (with role-based guards)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** sonner (toasts)
- **Dates:** date-fns

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # AppShell, Sidebar, Header, PageHeader
│   └── shared/          # Reusable feature components
├── pages/
│   ├── auth/            # Login
│   ├── dashboard/       # Role-adaptive dashboard
│   ├── attendance/      # Mark, History, Team views
│   ├── leave/           # Apply, Status, Balance, Approvals, Calendar
│   ├── holiday/         # Holiday calendar
│   ├── employee/        # Profile, Directory, Management
│   ├── document/        # My Documents, Admin management
│   ├── onboarding/      # Onboarding tracker
│   ├── performance/     # Goals, Team Goals, Reviews
│   ├── reports/         # Reports with export
│   ├── audit/           # Audit trail viewer
│   ├── settings/        # Admin settings
│   └── notifications/   # Notification history
├── stores/              # Zustand state stores
├── types/               # TypeScript type definitions
├── mock/                # Mock API handlers and data
├── lib/                 # Utilities, constants, formatters
└── router/              # Route config, auth guards
```

## Screens (24 total)

1. Login / Authentication
2. Dashboard (role-adaptive)
3. Mark Attendance
4. Attendance History
5. Team Attendance (Manager+)
6. Apply Leave
7. Leave Status
8. Leave Balance
9. Leave Approvals (Manager+)
10. Leave Calendar (Manager+)
11. Holiday Calendar
12. My Profile
13. Employee Directory
14. Employee Management (Admin)
15. My Documents
16. Document Management (Admin)
17. My Goals
18. Team Goals (Manager+)
19. Performance Reviews
20. Onboarding Tracker
21. Reports (Admin)
22. Audit Trail (Admin)
23. Settings (Admin)
24. Notifications

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Employee | employee@aistra.com | password |
| Manager | manager@aistra.com | password |
| HR Admin | hr@aistra.com | password |
| Super Admin | admin@aistra.com | password |

## Compliance

- Indian labor regulations (Shops and Establishments Act)
- Employee data retained minimum 5 years post-termination
- Audit logs retained 7 years
- Sensitive fields (PAN, Aadhaar, bank details) encrypted at rest
- RBAC enforced at route and API level

## License

Internal use only — Aistra.
