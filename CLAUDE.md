# Aistra HRMS — Project Instructions

## Project Overview
Internal HRMS platform for Aistra's India-based team (30-40 employees). Covers 10 modules, 24 screens, 4 user roles. Frontend-first with mock data — no backend yet.

## Tech Stack
- React 19 + TypeScript + Vite 7
- TailwindCSS 4 + shadcn/ui (new-york style, lucide icons, neutral base)
- Zustand for state management (persist middleware for auth + UI stores only)
- React Hook Form + Zod for forms/validation
- React Router 7 with ProtectedRoute + RoleGuard
- Recharts for charts, Lucide React for icons, sonner for toasts, date-fns for dates

## Design Library — ALWAYS FOLLOW
The design library is defined in `AistraHRMS_DesignLibrary.jsx`. All UI must follow its patterns:

### Color System
- **Primary palette:** Navy (#102A43 → #F0F4F8) + Teal (#014D40 → #EFFCF6)
- **Semantic:** Success (#10B981), Warning (#F59E0B), Danger (#EF4444), Info (#3B82F6)
- **Accents:** Violet (#8B5CF6), Amber (#F59E0B), Rose (#F43F5E)
- **Surfaces:** bg (#F8FAFC), card (#FFFFFF), border (#E2E8F0), divider (#F1F5F9)
- **Text:** primary (#0F172A), secondary (#475569), tertiary (#94A3B8), link (#1A6BB5)

### Typography
- **Body font:** DM Sans (var(--font-body))
- **Display/headings font:** Outfit (var(--font-display)) — use `font-display` class
- **Headings:** Use Outfit font-display class with font-semibold or font-bold
- **Body text:** DM Sans, use text-sm for most content, text-xs for captions

### Component Patterns
- **Cards:** `bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all`
- **Section headings:** `font-display font-semibold text-slate-800`
- **Section labels:** `text-xs font-bold text-slate-400 uppercase tracking-widest`
- **Buttons primary:** gradient `bg-gradient-to-b from-teal-500 to-teal-600 text-white` with hover states
- **Buttons secondary:** `bg-white text-slate-700 border border-slate-300 shadow-sm`
- **Inputs:** `h-10 bg-white border border-slate-300 rounded-lg focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500`
- **Tables:** `bg-white rounded-xl border border-slate-200 overflow-hidden` with `bg-slate-50` header
- **Badges:** rounded-full with variant-specific colors (present=emerald, absent=red, late=amber, wfh=blue, pending=yellow, approved=emerald, rejected=red)

### Badge Variants (from design library)
- Attendance: `present` (emerald-500 bg), `absent` (red-500), `late` (amber-500), `halfday` (orange-100), `wfh` (blue-100)
- Leave: `pending` (yellow-50), `approved` (emerald-50), `rejected` (red-50)
- General: `success`, `warning`, `danger`, `info`, `violet`, `teal`, `outline`

### Layout
- Sidebar: white bg, 248px wide (72px collapsed), teal active state (`bg-teal-50 text-teal-700`)
- Top bar: h-16, white bg, border-b, breadcrumbs + title + actions + notifications + user
- Logo: Teal gradient icon + "Aistra" in navy-900 + "HR" in teal-500, Outfit font
- Content: `p-6 space-y-6` on `bg-slate-50`

### Animations
- `animate-fade-up`: fadeUp 0.4s — for cards entering view
- `animate-fade-in`: fadeIn 0.3s — for general appearance
- `animate-scale-in`: scaleIn 0.25s — for modals/dialogs
- `animate-count`: countUp 0.5s — for stat numbers
- `animate-ring`: ringPulse 2s infinite — for check-in button
- Stagger classes: `.stagger-1` through `.stagger-5` (0.05s increments)

### StatCard Pattern
```
bg-white rounded-xl border border-slate-200 p-5
Icon in w-11 h-11 rounded-xl with ring-4
font-display text-3xl font-bold for value
text-sm text-slate-500 for label
Trend indicator with TrendingUp/Down icons
```

### Check-In Card Pattern
```
Prominent check-in button with animate-ring
Location selector dropdown
Time display with status badge
Check-out variant with danger button
```

### Leave Balance Card Pattern
```
2x2 grid of colored backgrounds (teal-50, blue-50, violet-50, amber-50)
font-display text-2xl font-bold for remaining count
ProgressBar showing remaining/total
```

### Calendar Pattern
```
7-column grid, colored day cells
Today: bg-teal-500 text-white font-bold shadow-sm
Holiday: bg-red-50 text-red-500
Leave: type-specific background colors
Legend at bottom with colored dots
```

## Architecture Patterns

### File Organization
```
src/types/       — one file per domain entity, barrel export from index.ts
src/stores/      — Zustand stores, one per domain
src/mock/        — handlers.ts (central) + domain data files
src/pages/       — grouped by domain: pages/<domain>/<PageName>Page.tsx
src/components/  — ui/ (shadcn), layout/ (shell), shared/ (reusable)
src/lib/         — utils.ts (cn), constants.ts, formatters.ts
src/router/      — index.tsx, ProtectedRoute.tsx, RoleGuard.tsx
```

### Store Pattern (Zustand)
```typescript
export const useStore = create<State>()((set, get) => ({
  items: [],
  isLoading: false,
  fetchItems: async () => {
    set({ isLoading: true });
    const { getItems } = await import('@/mock/handlers');
    const items = await getItems();
    set({ items, isLoading: false });
  },
}));
```
- Lazy import mock handlers inside actions
- Only authStore + uiStore use persist middleware
- Use selectors for granular subscriptions

### Mock Handler Pattern
```typescript
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));
export const getItems = async () => {
  await delay();
  const { items } = await import('./items');
  return items;
};
```

### Routing
- ProtectedRoute checks auth, redirects to /login
- RoleGuard checks user.role against allowedRoles array
- Nested: ProtectedRoute > AppShell > RoleGuard > Page

### Roles
- EMPLOYEE, MANAGER, HR_ADMIN, SUPER_ADMIN
- Each inherits capabilities of lower roles

## Security Rules
- Never store passwords in plain text (bcrypt in mock data)
- Sensitive fields (PAN, Aadhaar, bank) shown masked by default, reveal for HR_ADMIN+
- All attendance edits require mandatory reason
- Audit trail for all data mutations — append-only, never deletable
- RBAC enforced at route level AND component level
- Validate all form inputs with Zod schemas
- No XSS — sanitize user inputs, use React's built-in escaping
- No hardcoded secrets or API keys

## Code Style
- TypeScript strict mode
- Functional components only
- Use `cn()` from lib/utils for conditional classNames
- Use `@/` path alias for imports
- Named exports for pages, default export for App
- Consistent file naming: PascalCase for components, camelCase for utilities
- No unnecessary comments — code should be self-documenting
- Use shadcn/ui components as base, style with Tailwind following design library patterns

## Reference Project
The aistra-audit-platform at `/Users/Rishabh/Desktop/Claude Master/Internal Audit/aistra-audit-platform/` is the reference implementation. Follow its exact patterns for: stores, routing, layout, mock data, component structure.
