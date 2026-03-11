# Aistra HRMS Platform - Implementation Plan

## Context

Aistra needs an internal HRMS platform for their India-based team of 30-40 employees. The PRD (`Aistra_HRMS_PRD_v1.docx`) defines 10 modules, 24 screens, 4 user roles, and a 10-week phased rollout. The platform covers: Employee Database, Attendance, Leave, Holidays, Onboarding, Documents, Performance, Reports, Notifications, and Audit Trail.

We will mirror the exact architecture and patterns of the existing **aistra-audit-platform** (`/Users/Rishabh/Desktop/Claude Master/Internal Audit/aistra-audit-platform/`) — same tech stack, same project structure, same component/store/routing patterns. Frontend-first with mock data (no backend yet).

---

## Tech Stack (matching audit platform)

- React 19 + TypeScript + Vite 7
- TailwindCSS 4 + shadcn/ui (28+ components)
- Zustand (state) + React Hook Form + Zod (forms)
- React Router 7 (ProtectedRoute + RoleGuard)
- Recharts (charts), Lucide React (icons), sonner (toasts), date-fns

---

## Project Structure

```
aistra-attendance/
  src/
    App.tsx, main.tsx, index.css
    components/
      ui/              # shadcn components (32 total)
      layout/          # AppShell, Sidebar, Header, PageHeader
      shared/          # StatCard, StatusBadge, FilterBar, EmptyState,
                       # FileUploadZone, EmployeeAvatar, CalendarGrid,
                       # ApprovalFlow, ProgressRing, DataTable,
                       # ConfirmDialog, TimeDisplay
    pages/
      auth/            # LoginPage
      dashboard/       # DashboardPage (role-adaptive)
      attendance/      # MarkAttendancePage, AttendanceHistoryPage, TeamAttendancePage
      leave/           # ApplyLeavePage, LeaveStatusPage, LeaveBalancePage,
                       # LeaveApprovalsPage, LeaveCalendarPage
      holiday/         # HolidayCalendarPage
      employee/        # MyProfilePage, EmployeeDirectoryPage, EmployeeManagementPage
      document/        # MyDocumentsPage, DocumentManagementPage
      onboarding/      # OnboardingTrackerPage
      performance/     # MyGoalsPage, TeamGoalsPage, PerformanceReviewsPage
      reports/         # ReportsPage
      audit/           # AuditTrailPage
      settings/        # SettingsPage
      notifications/   # NotificationsPage
    stores/            # authStore, uiStore, employeeStore, attendanceStore,
                       # leaveStore, holidayStore, documentStore, onboardingStore,
                       # performanceStore, notificationStore, auditTrailStore, settingsStore
    types/             # user, employee, attendance, leave, holiday, document,
                       # onboarding, performance, notification, audit-trail + index barrel
    mock/              # handlers + domain data files (users, employees, attendance,
                       # leaves, holidays, documents, onboarding, performance, etc.)
    lib/               # utils (cn), constants (status/role configs), formatters
    router/            # index, ProtectedRoute, RoleGuard
```

---

## Roles & Routing

**4 Roles:** Employee, Manager, HR Admin, Super Admin

| Route Group | Roles | Screens |
|---|---|---|
| All authenticated | All 4 | Dashboard, Mark Attendance, Attendance History, Apply Leave, Leave Status/Balance, Holidays, Profile, Directory, My Documents, My Goals, Reviews, Notifications |
| Manager+ | Manager, HR Admin, Super Admin | Team Attendance, Leave Approvals, Leave Calendar, Team Goals |
| Admin only | HR Admin, Super Admin | Employee Management, Document Management, Onboarding, Reports, Audit Trail, Settings |

---

## Data Models

### Employee (M1)
| Field | Type | Required | Notes |
|---|---|---|---|
| employee_id | String (auto) | Yes | Format: AST-XXXX |
| full_name | String | Yes | Legal name |
| email | Email | Yes | Login + notifications |
| phone | String | Yes | With country code |
| department | Enum | Yes | Engineering, Product, Design, Sales, Operations, HR, Finance |
| designation | String | Yes | Job title |
| reporting_manager | FK → Employee | Yes | Drives leave approval |
| date_of_joining | Date | Yes | Leave eligibility calc |
| employment_type | Enum | Yes | Full-time, Part-time, Contract, Intern |
| work_location | Enum | Yes | Office, Remote, Hybrid |
| shift_type | Enum | Yes | General (9:30-18:30), Flexible, Night, Custom |
| leave_eligibility | Enum | Yes | Eligible, Probation, Not Eligible |
| bank_details | JSON (encrypted) | No | Account, IFSC, bank name |
| pan_number | String (encrypted) | No | Tax compliance |
| aadhaar_number | String (encrypted) | No | Identity verification |
| status | Enum | Yes | Active, On Notice, Inactive, Terminated |

### Attendance (M2)
| Field | Type | Required | Notes |
|---|---|---|---|
| attendance_id | UUID | Yes | Auto-generated |
| employee_id | FK → Employee | Yes | |
| date | Date | Yes | Calendar date |
| check_in_time | Timestamp | No | |
| check_out_time | Timestamp | No | |
| total_hours | Decimal | No | Auto-calculated |
| status | Enum | Yes | Present, Absent, Late, Half-Day, WFH |
| work_location | Enum | Yes | Office, Remote, Client Site, WFH |
| is_edited | Boolean | Yes | Admin edit flag |
| edit_reason | Text | No | Mandatory on admin edit |

**Attendance Rules (configurable):**
- Standard work hours: 9 hours/day
- Half-day threshold: 4.5 hours
- Late threshold: 15 min after shift start
- Auto-absent: end of day if no check-in
- Missing checkout reminder: 30 min after shift end

### Leave (M3)
**4 Leave Types:**
| Type | Annual | Carry Forward | Min/Max Days | Special Rules |
|---|---|---|---|---|
| Earned Leave (EL) | 18 | Up to 10 | 0.5–15 | Accrual 1.5/month, after probation, encashable |
| Sick/Paid Leave (PL) | 12 | None | 0.5–7 | Medical cert for 3+ days, credited at year start |
| Work From Home (WFH) | 24 | None | 1–5 | Must mark attendance, auto-links to attendance |
| Optional Holiday (OH) | 2 | None | 1 | Selected from HR-defined optional holiday list |

**Leave Application fields:** leave_id, employee_id, leave_type, start_date, end_date, duration_days (auto-calc excluding weekends/holidays), is_half_day, half_day_period, reason (min 10 chars), attachment (PDF/JPG/PNG, 5MB max), status (Pending/Approved/Rejected/Cancelled), approver_id (auto = reporting_manager), approver_comment

### Holiday (M4)
Fields: holiday_id, name, date, type (National/Regional/Optional), location scope, year, is_optional

### Document (M6)
Fields: document_id, employee_id, category (Identity/Education/Employment/Compliance/Other), document_name, file_url, file_type, uploaded_by, verified (boolean), verified_by, expiry_date, notes

### Onboarding (M5)
15 default tasks across 4 groups: HR, IT/Admin, Manager, New Hire — from Pre-Day 1 through Day 90

### Performance (M7)
- Goals: OKR-style with key results (target/current/unit), weight %, quarterly status
- Reviews: Self-assessment + manager assessment per goal, optional peer feedback, 5-point overall rating (Exceptional → Unsatisfactory)
- Cycle: April–March (Indian FY), quarterly check-ins

### Audit Trail (M10)
Immutable append-only log: entity_type, entity_id, action, changed_by, changed_at, field_name, old_value, new_value, ip_address, reason

---

## API Endpoints (for future backend, mock handlers for now)

### Employee: 7 endpoints
- `GET /api/v1/employees` — List all (paginated, filterable) [Admin]
- `GET /api/v1/employees/:id` — Get profile [All, scoped]
- `POST /api/v1/employees` — Create [Admin]
- `PUT /api/v1/employees/:id` — Update [Admin/Self]
- `PATCH /api/v1/employees/:id/status` — Change status [Admin]
- `GET /api/v1/employees/directory` — Directory search [All]
- `GET /api/v1/employees/org-chart` — Org chart [All]

### Attendance: 8 endpoints
- `POST /api/v1/attendance/check-in` — Check in [Employee]
- `POST /api/v1/attendance/check-out` — Check out [Employee]
- `GET /api/v1/attendance/me` — Own history [Employee]
- `GET /api/v1/attendance/me/today` — Today's status [Employee]
- `GET /api/v1/attendance/team` — Team view [Manager]
- `GET /api/v1/attendance/all` — All records [Admin]
- `PATCH /api/v1/attendance/:id` — Edit record [Admin]
- `GET /api/v1/attendance/report/monthly` — Monthly report [Admin]

### Leave: 11 endpoints
- `POST /api/v1/leaves` — Submit request [Employee]
- `GET /api/v1/leaves/me` — Own history [Employee]
- `GET /api/v1/leaves/balance` — Own balance [Employee]
- `GET /api/v1/leaves/pending` — Pending approvals [Manager]
- `PATCH /api/v1/leaves/:id/approve` — Approve [Manager]
- `PATCH /api/v1/leaves/:id/reject` — Reject [Manager]
- `DELETE /api/v1/leaves/:id` — Cancel pending [Employee]
- `GET /api/v1/leaves/calendar` — Team calendar [Manager/Admin]
- `GET /api/v1/leaves/report` — Utilization report [Admin]
- `GET /api/v1/leave-policies` — List policies [Admin]
- `PUT /api/v1/leave-policies/:type` — Update policy [Admin]

---

## Implementation Phases

### Phase 0: Foundation (~1 session)
1. Scaffold Vite + React + TS project, install dependencies (mirror audit platform's package.json)
2. Copy config files (vite.config, tsconfig, components.json, eslint, index.css with Aistra design tokens)
3. Install all shadcn/ui components (32: existing 28 + calendar, command, radio-group, date-picker)
4. Create `lib/` — utils.ts (cn), constants.ts (HRMS role/status configs), formatters.ts
5. Create `types/user.ts` — UserRole, User, Session
6. Create `mock/users.ts` — 8 demo users across 4 roles
7. Create `stores/authStore.ts` + `stores/uiStore.ts` (persist middleware, copy pattern from audit)
8. Create layout components — AppShell, Sidebar (role-adaptive nav), Header (notifications, theme, user menu), PageHeader
9. Create router — ProtectedRoute, RoleGuard, full route tree (24 screens as stubs)
10. Create LoginPage — branded login with demo account selector
11. Create shared components — StatCard, FilterBar, EmptyState, FileUploadZone, StatusBadge, ConfirmDialog

**Files to copy/adapt from audit platform:**
- `src/index.css` (design tokens) → copy verbatim
- `src/App.tsx` → adapt (same wrapper pattern)
- `src/stores/authStore.ts` → adapt roles to EMPLOYEE/MANAGER/HR_ADMIN/SUPER_ADMIN
- `src/router/index.tsx`, `ProtectedRoute.tsx`, `RoleGuard.tsx` → adapt routes
- `src/components/layout/*` → adapt sidebar nav items
- `src/components/shared/StatCard.tsx`, `FilterBar.tsx`, `EmptyState.tsx`, `FileUploadZone.tsx` → copy

**Deliverables:** Working login, AppShell with sidebar navigation, routing to all 24 placeholder pages, dark mode toggle.

---

### Phase 1: Employee Database (~1 session)
1. Create `types/employee.ts` — Employee interface (20+ fields incl encrypted PAN/Aadhaar/bank)
2. Create `mock/employees.ts` — 15-20 employees with realistic Indian data, AST-0001 to AST-0020
3. Add employee handlers to `mock/handlers.ts` — getEmployees, getEmployeeById, createEmployee, updateEmployee
4. Create `stores/employeeStore.ts` — CRUD, search, filters
5. Create `EmployeeAvatar.tsx` shared component
6. Create `DataTable.tsx` shared component (sortable/filterable)
7. Build **MyProfilePage** — tabbed profile view (Personal, Bank, Documents, Emergency Contact)
8. Build **EmployeeDirectoryPage** — searchable card grid + list toggle, FilterBar (department, location, status)
9. Build **EmployeeManagementPage** — DataTable with CRUD, Add Employee dialog (multi-step form with Zod validation), status management

**Deliverables:** 3 screens functional with full CRUD. Employee directory with search/filter.

---

### Phase 2: Attendance (~1 session)
1. Create `types/attendance.ts` — AttendanceStatus, AttendanceRecord, AttendanceRules
2. Create `mock/attendance.ts` — 30 days of records per employee
3. Add attendance handlers — checkIn, checkOut, fetchAttendance, fetchTeamAttendance, adminEdit
4. Create `stores/attendanceStore.ts`
5. Create `CalendarGrid.tsx` + `TimeDisplay.tsx` shared components
6. Create `lib/attendance-utils.ts` — auto-status classification logic
7. Build **MarkAttendancePage** — prominent check-in/out button, location selector, today's status, weekly summary
8. Build **AttendanceHistoryPage** — CalendarGrid (color-coded) + table view, monthly summary StatCards
9. Build **TeamAttendancePage** — daily roll-call DataTable, date picker, admin edit with reason

**Deliverables:** 3 screens. Real-time check-in/out with auto-status classification.

---

### Phase 3: Leave & Holiday Management (~1-2 sessions)
1. Create `types/leave.ts` + `types/holiday.ts`
2. Create `mock/leaves.ts` + `mock/holidays.ts` (Indian holidays 2026)
3. Add leave/holiday handlers
4. Create `stores/leaveStore.ts` + `stores/holidayStore.ts`
5. Create `lib/leave-utils.ts` — balance calculation, holiday exclusion
6. Create `ApprovalFlow.tsx` + `ProgressRing.tsx` shared components
7. Build **ApplyLeavePage** — type selector w/ balance display, date picker, half-day toggle, Zod validation
8. Build **LeaveStatusPage** — leave applications table with status badges, cancel option
9. Build **LeaveBalancePage** — visual cards per type with ProgressRing, yearly chart
10. Build **LeaveApprovalsPage** — pending approval cards, approve/reject with comments
11. Build **LeaveCalendarPage** — team CalendarGrid color-coded by leave type
12. Build **HolidayCalendarPage** — calendar + list view, admin CRUD, location scoping

**Deliverables:** 6 screens. Complete leave lifecycle from application to approval.

---

### Phase 4: Documents & Onboarding (~1 session)
1. Create `types/document.ts` + `types/onboarding.ts`
2. Create mock data + handlers for both
3. Create `stores/documentStore.ts` + `stores/onboardingStore.ts`
4. Build **MyDocumentsPage** — cards by category, FileUploadZone, status badges, mandatory checklist
5. Build **DocumentManagementPage** — admin DataTable, verify/reject, expiry alerts
6. Build **OnboardingTrackerPage** — employee list with ProgressRing, expandable task checklists (HR/IT/Manager/Employee groups)

**Deliverables:** 3 screens. Document lifecycle and onboarding tracking.

---

### Phase 5: Performance (~1 session)
1. Create `types/performance.ts` — Goal, KeyResult, CheckIn, PerformanceReview
2. Create mock data + handlers
3. Create `stores/performanceStore.ts`
4. Build **MyGoalsPage** — OKR-style goal cards, key results with progress bars, create/edit dialog
5. Build **TeamGoalsPage** — team DataTable with goal summary, drill-down
6. Build **PerformanceReviewsPage** — review cycles, self-assessment form, manager assessment, peer feedback, 5-point rating

**Deliverables:** 3 screens. Goal management and review cycle.

---

### Phase 6: Reports, Dashboard, Notifications, Audit Trail (~1-2 sessions)
1. Create `stores/notificationStore.ts` + `stores/auditTrailStore.ts` + `stores/settingsStore.ts`
2. Create mock data for notifications + audit trail
3. Build **DashboardPage** — role-adaptive:
   - Employee: attendance status, leave balance StatCards, upcoming holidays, recent notifications, quick actions
   - Manager: team attendance summary (pie chart), pending approvals, team calendar preview, team goals
   - Admin: org stats, attendance chart, leave utilization chart, document compliance %, onboarding progress
4. Build **NotificationsPage** — full notification list + header panel (bell icon with count)
5. Build **AuditTrailPage** — immutable log DataTable, expandable rows (old→new values), FilterBar, CSV export
6. Build **ReportsPage** — 6 report tabs (Attendance, Leave, Headcount, Documents, Onboarding, Performance), each with filters + Recharts visualization + DataTable + CSV/Excel export
7. Build **SettingsPage** — tabs: Attendance Rules, Leave Policies, Holidays, Locations, Onboarding Templates, Notification Toggles

**Deliverables:** 5 screens. Role-based dashboards, reports with export, full audit trail, notification system, admin settings.

---

## Notification Triggers (13 events)

| Event | Recipient | Channel |
|---|---|---|
| Leave request submitted | Reporting Manager | Email + In-app |
| Leave approved | Employee | Email + In-app |
| Leave rejected | Employee | Email + In-app |
| Leave cancelled | Reporting Manager | Email + In-app |
| Missing checkout | Employee | Email |
| Missing attendance | Employee | Email |
| Document expiry (30/15/7 days) | Employee + HR | Email |
| Onboarding task overdue | Assignee + Manager | Email |
| Self-assessment due | Employee | Email |
| Review ready for manager | Manager | Email + In-app |
| New employee added | New Hire + Manager + IT | Email |
| Sensitive profile update | Employee + HR | Email |
| Monthly report ready | HR Admin | Email |

---

## Key Technical Decisions

1. **Frontend-only with mocks** — same pattern as audit platform. Stores call async mock handlers with simulated delay
2. **Employee IDs** — AST-XXXX format, auto-incremented in mock createEmployee handler
3. **Sensitive fields** — PAN/Aadhaar/bank shown as masked (`XXXX-1234`), reveal toggle for HR Admin+
4. **Auto-status classification** — utility function in `lib/attendance-utils.ts` applies configurable rules
5. **Leave balance** — computed from policy config + approved applications via `lib/leave-utils.ts`
6. **CalendarGrid** — single shared component reused across Attendance, Leave Calendar, and Holiday Calendar
7. **Audit trail** — helper `addAuditEntry()` called in every store mutation that modifies data
8. **State persistence** — only authStore + uiStore use Zustand persist (matching audit pattern)
9. **Export** — `xlsx` library for Excel export in Reports page

---

## Verification Plan

After each phase:
1. **Run dev server** — `npm run dev`, verify no console errors
2. **Login with each role** — test role-based sidebar visibility and route guards
3. **Test CRUD flows** — create/edit/delete operations per module
4. **Test responsive layout** — sidebar collapse, mobile-friendly
5. **Test dark/light mode** — all screens render correctly in both themes

End-to-end walkthrough:
1. Login as Employee → mark attendance → apply leave → check balance → upload documents → set goals → view dashboard
2. Login as Manager → view team attendance → approve/reject leave → review team goals → view team calendar
3. Login as HR Admin → add employee → verify documents → configure policies → run reports → view audit trail
4. Login as Super Admin → all admin features + settings management

---

## Summary

| Metric | Count |
|---|---|
| Modules | 10 |
| Screens/Pages | 24 |
| User Roles | 4 |
| Zustand Stores | 12 |
| Type Files | 10 |
| Mock Data Files | 10 |
| Shared Components | 12 |
| API Endpoints (mocked) | 26+ |
| Implementation Phases | 7 (Phase 0-6) |
