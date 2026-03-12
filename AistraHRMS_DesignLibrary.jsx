import { useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, ChevronRight, ChevronLeft, LayoutDashboard, Users, Calendar, FileText, ClipboardList, BarChart3, Settings, LogOut, Clock, MapPin, Plus, Filter, Download, Check, X, AlertCircle, Eye, Edit3, Trash2, Upload, Star, TrendingUp, TrendingDown, Sun, Moon, Home, Briefcase, UserCheck, UserX, Coffee, Paperclip, MessageSquare, Award, Target, Zap, ArrowRight, MoreVertical, ExternalLink, CheckCircle2, XCircle, MinusCircle, RefreshCw } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   AISTRA HRMS — DESIGN LIBRARY v1.0
   
   A comprehensive component library for building the Aistra HRMS.
   Covers: tokens, typography, layout, navigation, cards, tables,
   forms, charts, badges, modals, calendars, and all page patterns.
   
   Tech: React 18 + Tailwind CSS + Lucide Icons
   Font: DM Sans (body) + Outfit (headings/display)
   ═══════════════════════════════════════════════════════════════ */

// ─── DESIGN TOKENS ────────────────────────────────────────────
const tokens = {
  colors: {
    // Primary palette — warm navy + teal accent
    navy: { 50: "#F0F4F8", 100: "#D9E2EC", 200: "#BCCCDC", 300: "#9FB3C8", 400: "#829AB1", 500: "#627D98", 600: "#486581", 700: "#334E68", 800: "#243B53", 900: "#102A43" },
    teal: { 50: "#EFFCF6", 100: "#C6F7E2", 200: "#8EEDC7", 300: "#65D6AD", 400: "#3EBD93", 500: "#27AB83", 600: "#199473", 700: "#147D64", 800: "#0C6B58", 900: "#014D40" },
    // Semantic
    success: { light: "#ECFDF5", base: "#10B981", dark: "#065F46" },
    warning: { light: "#FFFBEB", base: "#F59E0B", dark: "#92400E" },
    danger:  { light: "#FEF2F2", base: "#EF4444", dark: "#991B1B" },
    info:    { light: "#EFF6FF", base: "#3B82F6", dark: "#1E40AF" },
    // Neutrals
    surface: { bg: "#F8FAFC", card: "#FFFFFF", elevated: "#FFFFFF", border: "#E2E8F0", divider: "#F1F5F9" },
    text:    { primary: "#0F172A", secondary: "#475569", tertiary: "#94A3B8", inverse: "#FFFFFF", link: "#1A6BB5" },
    // Accent spots
    violet:  { light: "#F5F3FF", base: "#8B5CF6", dark: "#5B21B6" },
    amber:   { light: "#FFFBEB", base: "#F59E0B", dark: "#B45309" },
    rose:    { light: "#FFF1F2", base: "#F43F5E", dark: "#BE123C" },
  },
  radius: { sm: "6px", md: "10px", lg: "14px", xl: "18px", full: "9999px" },
  shadow: {
    sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
    md: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
    xl: "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
    glow: "0 0 20px rgba(39,171,131,0.15)",
  },
};

// ─── GLOBAL STYLES (injected once) ────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@300;400;500;600;700;800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --font-body: 'DM Sans', sans-serif;
      --font-display: 'Outfit', sans-serif;
      --navy-900: #102A43; --navy-800: #243B53; --navy-700: #334E68;
      --navy-600: #486581; --navy-500: #627D98; --navy-400: #829AB1;
      --navy-300: #9FB3C8; --navy-200: #BCCCDC; --navy-100: #D9E2EC;
      --navy-50: #F0F4F8;
      --teal-500: #27AB83; --teal-400: #3EBD93; --teal-300: #65D6AD;
      --teal-200: #8EEDC7; --teal-100: #C6F7E2; --teal-50: #EFFCF6;
      --teal-600: #199473; --teal-700: #147D64;
      --surface-bg: #F8FAFC; --surface-card: #FFFFFF;
      --text-primary: #0F172A; --text-secondary: #475569; --text-tertiary: #94A3B8;
      --border: #E2E8F0; --divider: #F1F5F9;
      --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-xl: 18px;
      --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);
    }

    body { font-family: var(--font-body); background: var(--surface-bg); color: var(--text-primary); -webkit-font-smoothing: antialiased; }

    .font-display { font-family: var(--font-display); }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--navy-200); border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--navy-300); }

    /* Animations */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideInLeft { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
    @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
    @keyframes countUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ringPulse { 0% { box-shadow: 0 0 0 0 rgba(39,171,131,0.3); } 70% { box-shadow: 0 0 0 8px rgba(39,171,131,0); } 100% { box-shadow: 0 0 0 0 rgba(39,171,131,0); } }

    .animate-fade-up { animation: fadeUp 0.4s ease-out both; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out both; }
    .animate-slide-left { animation: slideInLeft 0.35s ease-out both; }
    .animate-scale-in { animation: scaleIn 0.25s ease-out both; }
    .animate-count { animation: countUp 0.5s ease-out both; }
    .animate-ring { animation: ringPulse 2s infinite; }

    .stagger-1 { animation-delay: 0.05s; }
    .stagger-2 { animation-delay: 0.1s; }
    .stagger-3 { animation-delay: 0.15s; }
    .stagger-4 { animation-delay: 0.2s; }
    .stagger-5 { animation-delay: 0.25s; }

    /* Skeleton loading */
    .skeleton {
      background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
      background-size: 800px 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: var(--radius-md);
    }

    /* Glass effect */
    .glass { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); background: rgba(255,255,255,0.8); }

    /* Focus ring */
    .focus-ring:focus-visible { outline: 2px solid var(--teal-500); outline-offset: 2px; border-radius: var(--radius-sm); }
  `}</style>
);


// ═══════════════════════════════════════════════════════════════
// SECTION 1: ATOMIC COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── BADGE ────────────────────────────────────────────────────
const Badge = ({ children, variant = "default", size = "sm", dot = false }) => {
  const variants = {
    default:  "bg-slate-100 text-slate-700",
    success:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning:  "bg-amber-50 text-amber-700 border border-amber-200",
    danger:   "bg-red-50 text-red-700 border border-red-200",
    info:     "bg-blue-50 text-blue-700 border border-blue-200",
    violet:   "bg-violet-50 text-violet-700 border border-violet-200",
    teal:     "bg-teal-50 text-teal-700 border border-teal-200",
    outline:  "bg-transparent text-slate-600 border border-slate-300",
    present:  "bg-emerald-500 text-white",
    absent:   "bg-red-500 text-white",
    late:     "bg-amber-500 text-white",
    halfday:  "bg-orange-100 text-orange-700 border border-orange-200",
    wfh:      "bg-blue-100 text-blue-700 border border-blue-200",
    pending:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
    approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    rejected: "bg-red-50 text-red-700 border border-red-200",
  };
  const sizes = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1",
  };
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap ${variants[variant]} ${sizes[size]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === "success" || variant === "present" || variant === "approved" ? "bg-emerald-500" : variant === "danger" || variant === "absent" || variant === "rejected" ? "bg-red-500" : variant === "warning" || variant === "pending" || variant === "late" ? "bg-amber-500" : "bg-slate-400"}`} />}
      {children}
    </span>
  );
};

// ─── AVATAR ───────────────────────────────────────────────────
const Avatar = ({ name, src, size = "md", status }) => {
  const sizes = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-lg" };
  const statusColors = { online: "bg-emerald-500", away: "bg-amber-500", busy: "bg-red-500", offline: "bg-slate-300" };
  const initials = name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const bgColors = ["bg-teal-500", "bg-blue-500", "bg-violet-500", "bg-rose-500", "bg-amber-500", "bg-indigo-500"];
  const bg = bgColors[name?.charCodeAt(0) % bgColors.length || 0];

  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`} />
      ) : (
        <div className={`${sizes[size]} ${bg} rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white`}>{initials}</div>
      )}
      {status && (
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColors[status]} rounded-full border-2 border-white`} />
      )}
    </div>
  );
};

// ─── AVATAR GROUP ─────────────────────────────────────────────
const AvatarGroup = ({ users, max = 4 }) => {
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => <Avatar key={i} name={u.name} src={u.src} size="sm" />)}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 ring-2 ring-white">+{remaining}</div>
      )}
    </div>
  );
};

// ─── BUTTON ───────────────────────────────────────────────────
const Button = ({ children, variant = "primary", size = "md", icon: Icon, iconRight: IconRight, loading, disabled, fullWidth, onClick }) => {
  const base = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-ring rounded-lg whitespace-nowrap";
  const variants = {
    primary:   "bg-gradient-to-b from-teal-500 to-teal-600 text-white shadow-sm hover:from-teal-400 hover:to-teal-500 active:from-teal-600 active:to-teal-700",
    secondary: "bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 active:bg-slate-100",
    ghost:     "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200",
    danger:    "bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700",
    success:   "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 active:bg-emerald-700",
    outline_teal: "bg-transparent text-teal-600 border border-teal-300 hover:bg-teal-50 active:bg-teal-100",
  };
  const sizes = {
    xs: "text-xs px-2.5 py-1.5 h-7",
    sm: "text-sm px-3 py-1.5 h-8",
    md: "text-sm px-4 py-2 h-9",
    lg: "text-base px-5 py-2.5 h-11",
  };

  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      {loading ? <RefreshCw size={16} className="animate-spin" /> : Icon && <Icon size={size === "xs" ? 14 : 16} />}
      {children}
      {IconRight && <IconRight size={16} />}
    </button>
  );
};

// ─── INPUT ────────────────────────────────────────────────────
const Input = ({ label, placeholder, type = "text", icon: Icon, error, hint, value, onChange, required, disabled }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
    <div className="relative">
      {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled}
        className={`w-full h-10 ${Icon ? "pl-10" : "pl-3"} pr-3 text-sm bg-white border ${error ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300 focus:ring-teal-500/20 focus:border-teal-500"} rounded-lg outline-none transition-all focus:ring-4 ${disabled ? "opacity-50 bg-slate-50" : ""}`}
        style={{ fontFamily: "var(--font-body)" }} />
    </div>
    {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

// ─── SELECT ───────────────────────────────────────────────────
const Select = ({ label, options, value, onChange, placeholder, required }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
    <div className="relative">
      <select value={value} onChange={onChange}
        className="w-full h-10 pl-3 pr-10 text-sm bg-white border border-slate-300 rounded-lg outline-none appearance-none transition-all focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
        style={{ fontFamily: "var(--font-body)" }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

// ─── TEXTAREA ─────────────────────────────────────────────────
const Textarea = ({ label, placeholder, rows = 3, value, onChange, required, error }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
    <textarea placeholder={placeholder} rows={rows} value={value} onChange={onChange}
      className={`w-full px-3 py-2.5 text-sm bg-white border ${error ? "border-red-300" : "border-slate-300"} rounded-lg outline-none transition-all focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 resize-none`}
      style={{ fontFamily: "var(--font-body)" }} />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

// ─── TOGGLE ───────────────────────────────────────────────────
const Toggle = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
    <div className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${checked ? "bg-teal-500" : "bg-slate-300"}`} onClick={() => onChange(!checked)}>
      <div className={`absolute top-[3px] ${checked ? "left-[21px]" : "left-[3px]"} w-4 h-4 bg-white rounded-full shadow transition-all duration-200`} />
    </div>
    {label && <span className="text-sm text-slate-700">{label}</span>}
  </label>
);

// ─── TAB GROUP ────────────────────────────────────────────────
const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${active === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
        {t.label}{t.count !== undefined && <span className={`ml-1.5 text-xs ${active === t.id ? "text-teal-600" : "text-slate-400"}`}>{t.count}</span>}
      </button>
    ))}
  </div>
);

// ─── PROGRESS BAR ─────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "teal", size = "md", label }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = { teal: "bg-teal-500", blue: "bg-blue-500", amber: "bg-amber-500", red: "bg-red-500", violet: "bg-violet-500" };
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  return (
    <div className="flex flex-col gap-1">
      {label && <div className="flex justify-between text-xs"><span className="text-slate-600">{label}</span><span className="font-medium text-slate-700">{pct}%</span></div>}
      <div className={`w-full ${heights[size]} bg-slate-100 rounded-full overflow-hidden`}>
        <div className={`${heights[size]} ${colors[color]} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── EMPTY STATE ──────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4"><Icon size={28} className="text-slate-400" /></div>
    <h3 className="font-display text-lg font-semibold text-slate-800 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 mb-5 max-w-sm">{description}</p>
    {action}
  </div>
);


// ═══════════════════════════════════════════════════════════════
// SECTION 2: LAYOUT COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── SIDEBAR NAV ──────────────────────────────────────────────
const Sidebar = ({ activeItem, onNavigate, collapsed = false }) => {
  const navSections = [
    { label: "MAIN", items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "attendance", label: "Attendance", icon: Clock },
      { id: "employees", label: "Employees", icon: Users },
      { id: "leave", label: "Leave", icon: Calendar },
      { id: "holidays", label: "Holidays", icon: Sun },
    ]},
    { label: "MANAGE", items: [
      { id: "performance", label: "Performance", icon: Target },
      { id: "documents", label: "Documents", icon: FileText },
      { id: "onboarding", label: "Onboarding", icon: ClipboardList },
      { id: "reports", label: "Reports", icon: BarChart3 },
    ]},
    { label: "SYSTEM", items: [
      { id: "settings", label: "Settings", icon: Settings },
    ]},
  ];

  return (
    <aside className={`${collapsed ? "w-[72px]" : "w-[248px]"} h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0`}>
      {/* Logo */}
      <div className={`h-16 flex items-center ${collapsed ? "justify-center" : "px-5"} border-b border-slate-100`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Zap size={18} className="text-white" />
          </div>
          {!collapsed && <span className="font-display text-xl font-bold tracking-tight" style={{ color: tokens.colors.navy[900] }}>Aistra<span className="text-teal-500">HR</span></span>}
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-6" : ""}>
            {!collapsed && <p className="px-3 mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">{section.label}</p>}
            <div className="flex flex-col gap-0.5">
              {section.items.map(item => {
                const active = activeItem === item.id;
                return (
                  <button key={item.id} onClick={() => onNavigate?.(item.id)}
                    className={`flex items-center gap-3 ${collapsed ? "justify-center px-0" : "px-3"} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                      ${active
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                    <item.icon size={20} className={`shrink-0 ${active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                    {!collapsed && <span>{item.label}</span>}
                    {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className={`border-t border-slate-100 p-3 ${collapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "" : "px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"}`}>
          <Avatar name="Rishabh Jain" size="sm" status="online" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">Rishabh Jain</p>
              <p className="text-xs text-slate-400 truncate">Product Manager</p>
            </div>
          )}
          {!collapsed && <LogOut size={16} className="text-slate-400 shrink-0 hover:text-red-500 transition-colors cursor-pointer" />}
        </div>
      </div>
    </aside>
  );
};

// ─── TOP BAR ──────────────────────────────────────────────────
const TopBar = ({ title, subtitle, breadcrumb, actions }) => (
  <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
    <div className="flex flex-col">
      {breadcrumb && <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">{breadcrumb.map((b, i) => (
        <span key={i} className="flex items-center gap-1.5">{i > 0 && <ChevronRight size={12} />}<span className={i === breadcrumb.length - 1 ? "text-slate-600 font-medium" : "hover:text-slate-600 cursor-pointer"}>{b}</span></span>
      ))}</div>}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <span className="text-sm text-slate-400 hidden sm:block">{subtitle}</span>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {actions}
      <div className="relative">
        <button className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors relative">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">3</span>
        </button>
      </div>
      <div className="w-px h-8 bg-slate-200 mx-1" />
      <div className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors">
        <Avatar name="Rishabh Jain" size="sm" />
        <div className="hidden lg:block"><p className="text-sm font-semibold text-slate-800">Rishabh</p></div>
        <ChevronDown size={14} className="text-slate-400" />
      </div>
    </div>
  </header>
);


// ═══════════════════════════════════════════════════════════════
// SECTION 3: DASHBOARD COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── STAT CARD ────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, trend, trendValue, color = "teal", index = 0 }) => {
  const colorMap = {
    teal:   { bg: "bg-teal-50", icon: "bg-teal-100 text-teal-600", ring: "ring-teal-500/10" },
    blue:   { bg: "bg-blue-50", icon: "bg-blue-100 text-blue-600", ring: "ring-blue-500/10" },
    violet: { bg: "bg-violet-50", icon: "bg-violet-100 text-violet-600", ring: "ring-violet-500/10" },
    amber:  { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", ring: "ring-amber-500/10" },
    rose:   { bg: "bg-rose-50", icon: "bg-rose-100 text-rose-600", ring: "ring-rose-500/10" },
  };
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300 animate-fade-up stagger-${index + 1}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center ring-4 ${c.ring}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
            {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{trendValue}
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-bold text-slate-900 animate-count">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
};

// ─── ATTENDANCE CHECK-IN CARD ─────────────────────────────────
const CheckInCard = ({ status, time, totalHours }) => {
  const isCheckedIn = status === "checked-in";
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-slate-800">Today's Attendance</h3>
        <Badge variant={isCheckedIn ? "success" : "default"} dot>{isCheckedIn ? "Checked In" : "Not Checked In"}</Badge>
      </div>
      {isCheckedIn ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Check-in Time</span>
            <span className="text-sm font-semibold text-slate-800">{time}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Hours Logged</span>
            <span className="text-sm font-semibold text-teal-600">{totalHours}</span>
          </div>
          <Button variant="danger" fullWidth size="md" icon={Clock}>Check Out</Button>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3 animate-ring">
            <Clock size={24} className="text-teal-600" />
          </div>
          <p className="text-sm text-slate-500 mb-4">Mark your attendance for today</p>
          <Button variant="primary" fullWidth size="lg" icon={Check}>Check In Now</Button>
        </div>
      )}
    </div>
  );
};

// ─── LEAVE BALANCE CARD ───────────────────────────────────────
const LeaveBalanceCard = ({ balances }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-display font-semibold text-slate-800">Leave Balance</h3>
      <Button variant="outline_teal" size="xs">Apply Leave</Button>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {balances.map((b, i) => (
        <div key={i} className={`rounded-lg p-3 ${b.color === "teal" ? "bg-teal-50" : b.color === "blue" ? "bg-blue-50" : b.color === "violet" ? "bg-violet-50" : "bg-amber-50"}`}>
          <p className="text-xs text-slate-500 mb-1">{b.type}</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold text-slate-900">{b.remaining}</span>
            <span className="text-xs text-slate-400">/ {b.total}</span>
          </div>
          <ProgressBar value={b.remaining} max={b.total} color={b.color} size="sm" />
        </div>
      ))}
    </div>
  </div>
);

// ─── UPCOMING HOLIDAYS CARD ───────────────────────────────────
const UpcomingHolidaysCard = ({ holidays }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-display font-semibold text-slate-800">Upcoming Holidays</h3>
      <button className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">View All <ChevronRight size={14} /></button>
    </div>
    <div className="space-y-3">
      {holidays.map((h, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-teal-600 uppercase">{h.month}</span>
            <span className="text-lg font-bold text-teal-700 -mt-0.5 font-display">{h.day}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{h.name}</p>
            <p className="text-xs text-slate-400">{h.dayOfWeek} &middot; {h.type}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── PENDING APPROVALS CARD (Manager) ─────────────────────────
const PendingApprovalsCard = ({ requests }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h3 className="font-display font-semibold text-slate-800">Pending Approvals</h3>
        <Badge variant="warning" size="xs">{requests.length}</Badge>
      </div>
      <button className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">View All <ChevronRight size={14} /></button>
    </div>
    <div className="space-y-3">
      {requests.map((r, i) => (
        <div key={i} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
          <div className="flex items-center gap-3 mb-2.5">
            <Avatar name={r.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{r.name}</p>
              <p className="text-xs text-slate-400">{r.type} &middot; {r.dates} &middot; {r.days} day{r.days > 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="success" size="xs" icon={Check} fullWidth>Approve</Button>
            <Button variant="secondary" size="xs" icon={X} fullWidth>Reject</Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── TEAM ATTENDANCE SUMMARY ──────────────────────────────────
const TeamAttendanceCard = ({ summary }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5">
    <h3 className="font-display font-semibold text-slate-800 mb-4">Team Attendance Today</h3>
    <div className="grid grid-cols-5 gap-2">
      {[
        { label: "Present", count: summary.present, color: "bg-emerald-500", bg: "bg-emerald-50" },
        { label: "WFH", count: summary.wfh, color: "bg-blue-500", bg: "bg-blue-50" },
        { label: "On Leave", count: summary.onLeave, color: "bg-violet-500", bg: "bg-violet-50" },
        { label: "Late", count: summary.late, color: "bg-amber-500", bg: "bg-amber-50" },
        { label: "Absent", count: summary.absent, color: "bg-red-500", bg: "bg-red-50" },
      ].map((s, i) => (
        <div key={i} className={`${s.bg} rounded-lg p-3 text-center`}>
          <div className={`w-2 h-2 ${s.color} rounded-full mx-auto mb-2`} />
          <p className="font-display text-xl font-bold text-slate-900">{s.count}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── DONUT CHART ──────────────────────────────────────────────
const DonutChart = ({ data, size = 120, label }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;

  const arcs = data.map(d => {
    const start = (cumulative / total) * 360;
    cumulative += d.value;
    const end = (cumulative / total) * 360;
    const startRad = ((start - 90) * Math.PI) / 180;
    const endRad = ((end - 90) * Math.PI) / 180;
    const largeArc = end - start > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    return { ...d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}` };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth={size * 0.18} strokeLinecap="round" />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" className="font-display" style={{ fontSize: size * 0.22, fontWeight: 700, fill: tokens.colors.text.primary }}>{total}</text>
        {label && <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 10, fill: tokens.colors.text.tertiary }}>{label}</text>}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 justify-center">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />{d.label} <span className="font-semibold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
// SECTION 4: TABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── DATA TABLE ───────────────────────────────────────────────
const DataTable = ({ columns, data, onRowClick }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col, i) => (
              <th key={i} className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.width || ""}`}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => onRowClick?.(row)}>
              {columns.map((col, ci) => (
                <td key={ci} className="px-4 py-3 text-sm text-slate-700">{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


// ═══════════════════════════════════════════════════════════════
// SECTION 5: LEAVE CALENDAR COMPONENT
// ═══════════════════════════════════════════════════════════════

const MiniCalendar = ({ month = "March", year = 2026 }) => {
  const days = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const today = 11;
  const holidays = [14, 25];
  const leaves = { 17: "teal", 18: "teal", 5: "blue", 6: "blue", 22: "violet" };
  const startDay = 0; // March 2026 starts on Sunday

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <button className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center"><ChevronLeft size={16} className="text-slate-500" /></button>
        <span className="font-display font-semibold text-sm text-slate-800">{month} {year}</span>
        <button className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center"><ChevronRight size={16} className="text-slate-500" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(d => <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>)}
        {Array.from({ length: startDay }, (_, i) => <div key={`pad-${i}`} />)}
        {dates.map(d => {
          const isToday = d === today;
          const isHoliday = holidays.includes(d);
          const leaveColor = leaves[d];
          return (
            <button key={d} className={`w-full aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all
              ${isToday ? "bg-teal-500 text-white font-bold shadow-sm" : isHoliday ? "bg-red-50 text-red-500" : leaveColor ? `${leaveColor === "teal" ? "bg-teal-100 text-teal-700" : leaveColor === "blue" ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}` : "text-slate-700 hover:bg-slate-100"}`}>
              {d}
            </button>
          );
        })}
      </div>
      <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
        <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-teal-500" />Today</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-red-400" />Holiday</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-teal-200" />EL</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-blue-200" />WFH</span>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════
// MAIN SHOWCASE — ALL COMPONENTS RENDERED
// ═══════════════════════════════════════════════════════════════

export default function DesignLibrary() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("all");
  const [toggleVal, setToggleVal] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sampleBalances = [
    { type: "Earned Leave", total: 18, remaining: 12, color: "teal" },
    { type: "Paid Leave", total: 12, remaining: 9, color: "blue" },
    { type: "Work From Home", total: 24, remaining: 14, color: "violet" },
    { type: "Optional Holiday", total: 2, remaining: 1, color: "amber" },
  ];

  const sampleHolidays = [
    { name: "Holi", month: "Mar", day: "14", dayOfWeek: "Saturday", type: "National" },
    { name: "Good Friday", month: "Mar", day: "25", dayOfWeek: "Wednesday", type: "Optional" },
    { name: "Eid al-Fitr", month: "Mar", day: "31", dayOfWeek: "Tuesday", type: "National" },
  ];

  const sampleRequests = [
    { name: "Ananya Sharma", type: "Earned Leave", dates: "Mar 17–18", days: 2 },
    { name: "Vikram Patel", type: "WFH", dates: "Mar 14", days: 1 },
    { name: "Priya Nair", type: "Sick Leave", dates: "Mar 12–13", days: 2 },
  ];

  const sampleEmployees = [
    { id: "AST-0012", name: "Ananya Sharma", email: "ananya@aistra.com", dept: "Engineering", role: "Senior Developer", manager: "Rishabh Jain", status: "Active", doj: "2024-01-15" },
    { id: "AST-0015", name: "Vikram Patel", email: "vikram@aistra.com", dept: "Product", role: "Product Designer", manager: "Rishabh Jain", status: "Active", doj: "2024-03-01" },
    { id: "AST-0018", name: "Priya Nair", email: "priya@aistra.com", dept: "Engineering", role: "QA Engineer", manager: "Ananya Sharma", status: "On Notice", doj: "2023-07-20" },
    { id: "AST-0022", name: "Rahul Mehra", email: "rahul@aistra.com", dept: "Sales", role: "Account Executive", manager: "Deepak Gupta", status: "Active", doj: "2024-06-10" },
    { id: "AST-0025", name: "Sneha Iyer", email: "sneha@aistra.com", dept: "HR", role: "HR Manager", manager: "Rishabh Jain", status: "Active", doj: "2023-01-05" },
  ];

  const empColumns = [
    { label: "Employee", key: "name", render: (r) => (
      <div className="flex items-center gap-3">
        <Avatar name={r.name} size="sm" status="online" />
        <div><p className="font-medium text-slate-800">{r.name}</p><p className="text-xs text-slate-400">{r.id}</p></div>
      </div>
    )},
    { label: "Email", key: "email", render: (r) => <span className="text-slate-500">{r.email}</span> },
    { label: "Department", key: "dept", render: (r) => <Badge variant="default" size="sm">{r.dept}</Badge> },
    { label: "Role", key: "role" },
    { label: "Manager", key: "manager" },
    { label: "Status", key: "status", render: (r) => <Badge variant={r.status === "Active" ? "success" : r.status === "On Notice" ? "warning" : "danger"} dot size="sm">{r.status}</Badge> },
    { label: "", key: "actions", render: () => (
      <div className="flex gap-1">
        <button className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center"><Eye size={14} className="text-slate-400" /></button>
        <button className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center"><Edit3 size={14} className="text-slate-400" /></button>
        <button className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center"><Trash2 size={14} className="text-slate-400 hover:text-red-500" /></button>
      </div>
    )},
  ];

  const attendanceData = [
    { name: "Ananya Sharma", status: "Present", checkIn: "09:15 AM", checkOut: "06:30 PM", hours: "9h 15m", location: "Office" },
    { name: "Vikram Patel", status: "WFH", checkIn: "09:45 AM", checkOut: "—", hours: "6h 20m", location: "Remote" },
    { name: "Priya Nair", status: "On Leave", checkIn: "—", checkOut: "—", hours: "—", location: "—" },
    { name: "Rahul Mehra", status: "Late", checkIn: "10:20 AM", checkOut: "—", hours: "5h 45m", location: "Office" },
    { name: "Sneha Iyer", status: "Half-Day", checkIn: "09:30 AM", checkOut: "01:30 PM", hours: "4h 00m", location: "Office" },
  ];

  const attColumns = [
    { label: "Employee", render: (r) => <div className="flex items-center gap-2.5"><Avatar name={r.name} size="sm" /><span className="font-medium">{r.name}</span></div> },
    { label: "Status", render: (r) => <Badge variant={r.status === "Present" ? "present" : r.status === "Late" ? "late" : r.status === "WFH" ? "wfh" : r.status === "Half-Day" ? "halfday" : "absent"} size="sm">{r.status}</Badge> },
    { label: "Check In", render: (r) => <span className={r.checkIn === "—" ? "text-slate-300" : ""}>{r.checkIn}</span> },
    { label: "Check Out", render: (r) => <span className={r.checkOut === "—" ? "text-slate-300" : ""}>{r.checkOut}</span> },
    { label: "Hours", render: (r) => <span className={`font-medium ${r.hours === "—" ? "text-slate-300" : parseFloat(r.hours) >= 9 ? "text-emerald-600" : "text-amber-600"}`}>{r.hours}</span> },
    { label: "Location", render: (r) => <span className="text-slate-500">{r.location}</span> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <GlobalStyles />

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeItem={activeNav} onNavigate={setActiveNav} collapsed={sidebarCollapsed} />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <TopBar
            title="Dashboard"
            subtitle="Welcome back, Rishabh"
            breadcrumb={["Home", "Dashboard"]}
            actions={
              <div className="flex items-center gap-2">
                <div className="relative hidden md:block">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input placeholder="Search employees, actions..." className="w-64 h-9 pl-9 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" style={{ fontFamily: "var(--font-body)" }} />
                </div>
                <Button variant="primary" size="sm" icon={Plus}>Quick Action</Button>
              </div>
            }
          />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ═══ SECTION: Stat Cards ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Stat Cards</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Employees" value="36" icon={Users} trend="up" trendValue="+3" color="teal" index={0} />
                <StatCard label="Present Today" value="28" icon={UserCheck} trend="up" trendValue="78%" color="blue" index={1} />
                <StatCard label="On Leave" value="5" icon={Calendar} color="violet" index={2} />
                <StatCard label="Pending Requests" value="8" icon={ClipboardList} color="amber" index={3} />
              </div>
            </section>

            {/* ═══ SECTION: Dashboard Widgets ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dashboard Widgets</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <CheckInCard status="checked-in" time="09:32 AM" totalHours="6h 28m" />
                <LeaveBalanceCard balances={sampleBalances} />
                <UpcomingHolidaysCard holidays={sampleHolidays} />
                <PendingApprovalsCard requests={sampleRequests} />
                <TeamAttendanceCard summary={{ present: 22, wfh: 6, onLeave: 5, late: 2, absent: 1 }} />
                <MiniCalendar />
              </div>
            </section>

            {/* ═══ SECTION: Donut Charts ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Data Visualizations</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center">
                  <h4 className="font-display font-semibold text-sm text-slate-800 mb-3 self-start">By Department</h4>
                  <DonutChart size={140} label="Employees" data={[
                    { label: "Engineering", value: 14, color: "#27AB83" },
                    { label: "Product", value: 6, color: "#3B82F6" },
                    { label: "Sales", value: 5, color: "#F59E0B" },
                    { label: "HR & Ops", value: 8, color: "#8B5CF6" },
                    { label: "Design", value: 3, color: "#F43F5E" },
                  ]} />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center">
                  <h4 className="font-display font-semibold text-sm text-slate-800 mb-3 self-start">Attendance Today</h4>
                  <DonutChart size={140} label="Total" data={[
                    { label: "Present", value: 22, color: "#10B981" },
                    { label: "WFH", value: 6, color: "#3B82F6" },
                    { label: "Leave", value: 5, color: "#8B5CF6" },
                    { label: "Late", value: 2, color: "#F59E0B" },
                    { label: "Absent", value: 1, color: "#EF4444" },
                  ]} />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center">
                  <h4 className="font-display font-semibold text-sm text-slate-800 mb-3 self-start">Leave Utilisation</h4>
                  <DonutChart size={140} label="Days Used" data={[
                    { label: "Earned", value: 45, color: "#27AB83" },
                    { label: "Paid", value: 22, color: "#3B82F6" },
                    { label: "WFH", value: 68, color: "#8B5CF6" },
                    { label: "Optional", value: 8, color: "#F59E0B" },
                  ]} />
                </div>
              </div>
            </section>

            {/* ═══ SECTION: Badges Showcase ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Badge System</p>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <p className="w-full text-xs font-semibold text-slate-600 mb-1">Attendance Status</p>
                  <Badge variant="present">Present</Badge>
                  <Badge variant="absent">Absent</Badge>
                  <Badge variant="late">Late</Badge>
                  <Badge variant="halfday">Half-Day</Badge>
                  <Badge variant="wfh">WFH</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <p className="w-full text-xs font-semibold text-slate-600 mb-1">Leave Status</p>
                  <Badge variant="pending" dot>Pending</Badge>
                  <Badge variant="approved" dot>Approved</Badge>
                  <Badge variant="rejected" dot>Rejected</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <p className="w-full text-xs font-semibold text-slate-600 mb-1">General</p>
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success" dot>Active</Badge>
                  <Badge variant="warning" dot>Probation</Badge>
                  <Badge variant="danger" dot>Terminated</Badge>
                  <Badge variant="info">Full-Time</Badge>
                  <Badge variant="violet">Engineering</Badge>
                  <Badge variant="teal">Remote</Badge>
                  <Badge variant="outline">Contract</Badge>
                </div>
              </div>
            </section>

            {/* ═══ SECTION: Employee Table ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Employee Directory Table</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Tabs tabs={[{ id: "all", label: "All", count: 36 }, { id: "active", label: "Active", count: 33 }, { id: "notice", label: "On Notice", count: 2 }, { id: "inactive", label: "Inactive", count: 1 }]} active={activeTab} onChange={setActiveTab} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input placeholder="Search employees..." className="w-52 h-8 pl-8 pr-3 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" style={{ fontFamily: "var(--font-body)" }} />
                    </div>
                    <Button variant="secondary" size="sm" icon={Filter}>Filter</Button>
                    <Button variant="secondary" size="sm" icon={Download}>Export</Button>
                    <Button variant="primary" size="sm" icon={Plus}>Add Employee</Button>
                  </div>
                </div>
                <DataTable columns={empColumns} data={sampleEmployees} />
              </div>
            </section>

            {/* ═══ SECTION: Attendance Table ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Team Attendance Table</p>
              <DataTable columns={attColumns} data={attendanceData} />
            </section>

            {/* ═══ SECTION: Form Components ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Form Components</p>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-display text-lg font-bold text-slate-800 mb-1">Apply for Leave</h3>
                <p className="text-sm text-slate-400 mb-5">Submit a new leave request to your reporting manager.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Leave Type" required options={[
                    { value: "el", label: "Earned Leave (12 remaining)" },
                    { value: "pl", label: "Paid Leave (9 remaining)" },
                    { value: "wfh", label: "Work From Home (14 remaining)" },
                    { value: "oh", label: "Optional Holiday (1 remaining)" },
                  ]} placeholder="Select leave type" />
                  <div></div>
                  <Input label="Start Date" type="date" required />
                  <Input label="End Date" type="date" required />
                  <div className="md:col-span-2">
                    <Textarea label="Reason" required placeholder="Please provide a reason for your leave request (min 10 characters)" rows={3} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Attachment <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer">
                      <Upload size={24} className="text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Click to upload or drag & drop</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <Toggle label="Half-day leave" checked={toggleVal} onChange={setToggleVal} />
                  </div>
                  <Input label="Field with Error" error="This field is required" placeholder="Enter value..." />
                  <Input label="Disabled Field" disabled value="Cannot edit this" />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="primary" icon={Check}>Submit Request</Button>
                </div>
              </div>
            </section>

            {/* ═══ SECTION: Button Showcase ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Button Variants</p>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <Button variant="primary" size="lg" icon={Plus}>Primary Large</Button>
                  <Button variant="primary">Primary</Button>
                  <Button variant="primary" size="sm">Primary Small</Button>
                  <Button variant="primary" size="xs">XS</Button>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button variant="secondary" icon={Filter}>Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="outline_teal" icon={Download}>Outline</Button>
                  <Button variant="danger" icon={Trash2}>Danger</Button>
                  <Button variant="success" icon={Check}>Approve</Button>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button variant="primary" loading>Loading...</Button>
                  <Button variant="secondary" disabled>Disabled</Button>
                </div>
              </div>
            </section>

            {/* ═══ SECTION: Progress Bars ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Progress Bars & Onboarding Tracker</p>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h4 className="font-display font-semibold text-slate-800">Onboarding Progress — Ananya Sharma</h4>
                <ProgressBar value={8} max={15} color="teal" label="Overall Completion" size="lg" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ProgressBar value={4} max={4} color="teal" label="Pre-Day 1" />
                  <ProgressBar value={3} max={5} color="blue" label="Day 1 & Week 1" />
                  <ProgressBar value={1} max={6} color="amber" label="30/60/90 Day Reviews" />
                </div>
              </div>
            </section>

            {/* ═══ SECTION: Empty State ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Empty State</p>
              <div className="bg-white rounded-xl border border-slate-200">
                <EmptyState icon={Calendar} title="No leave requests yet" description="You haven't submitted any leave requests. Click below to apply for your first leave." action={<Button variant="primary" icon={Plus}>Apply for Leave</Button>} />
              </div>
            </section>

            {/* ═══ SECTION: Skeleton Loading ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Skeleton Loading States</p>
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <div className="flex justify-between"><div className="skeleton w-10 h-10 rounded-xl" /><div className="skeleton w-12 h-5 rounded-full" /></div>
                    <div className="skeleton w-20 h-8 rounded-lg" />
                    <div className="skeleton w-28 h-4 rounded" />
                  </div>
                ))}
              </div>
            </section>

            {/* ═══ SECTION: Design Tokens Reference ═══ */}
            <section>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Color Palette</p>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Primary — Navy</p>
                  <div className="flex gap-1">{Object.entries(tokens.colors.navy).map(([k, v]) => <div key={k} className="flex-1 h-10 rounded-lg flex items-end p-1" style={{ background: v }}><span className="text-[8px] font-bold" style={{ color: parseInt(k) > 400 ? "white" : "#334E68" }}>{k}</span></div>)}</div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Accent — Teal</p>
                  <div className="flex gap-1">{Object.entries(tokens.colors.teal).map(([k, v]) => <div key={k} className="flex-1 h-10 rounded-lg flex items-end p-1" style={{ background: v }}><span className="text-[8px] font-bold" style={{ color: parseInt(k) > 400 ? "white" : "#0C6B58" }}>{k}</span></div>)}</div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Semantic</p>
                  <div className="flex gap-2">
                    {[["Success", "#10B981"], ["Warning", "#F59E0B"], ["Danger", "#EF4444"], ["Info", "#3B82F6"], ["Violet", "#8B5CF6"]].map(([l, c]) => (
                      <div key={l} className="flex items-center gap-2"><div className="w-6 h-6 rounded-md" style={{ background: c }} /><span className="text-xs text-slate-600">{l}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="h-8" />
          </main>
        </div>
      </div>
    </div>
  );
}
