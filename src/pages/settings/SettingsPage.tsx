import { useEffect, useState } from 'react'
import {
  Clock,
  CalendarDays,
  Building2,
  Save,
  Loader2,
  Bell,
  Palette,
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import type { AttendanceRules } from '@/types/attendance'
import type { LeavePolicy } from '@/types/leave'

export function SettingsPage() {
  const { attendanceRules, leavePolicies, isLoading, fetchSettings, updateAttendanceRules, updateLeavePolicy } = useSettingsStore()
  const user = useAuthStore((s) => s.user)

  const [localRules, setLocalRules] = useState<AttendanceRules>(attendanceRules)
  const [localPolicies, setLocalPolicies] = useState<LeavePolicy[]>(leavePolicies)
  const [savingRules, setSavingRules] = useState(false)
  const [savingPolicy, setSavingPolicy] = useState<string | null>(null)
  const [notifications, setNotifications] = useState({
    leaveApproval: true,
    leaveRejection: true,
    attendanceReminder: true,
    documentExpiry: true,
    onboardingTask: true,
    performanceReview: true,
    monthlyReport: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    setLocalRules(attendanceRules)
  }, [attendanceRules])

  useEffect(() => {
    setLocalPolicies(leavePolicies)
  }, [leavePolicies])

  const handleRulesChange = (field: keyof AttendanceRules, value: string | number) => {
    setLocalRules((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveRules = async () => {
    setSavingRules(true)
    try {
      await updateAttendanceRules(localRules)
      toast.success('Attendance rules updated successfully')
    } catch {
      toast.error('Failed to update attendance rules')
    } finally {
      setSavingRules(false)
    }
  }

  const handlePolicyChange = (type: string, field: keyof LeavePolicy, value: unknown) => {
    setLocalPolicies((prev) =>
      prev.map((p) => (p.type === type ? { ...p, [field]: value } : p))
    )
  }

  const handleSavePolicy = async (type: string) => {
    setSavingPolicy(type)
    const policy = localPolicies.find((p) => p.type === type)
    if (!policy) return
    try {
      await updateLeavePolicy(policy)
      toast.success(`${policy.label} policy updated successfully`)
    } catch {
      toast.error('Failed to update leave policy')
    } finally {
      setSavingPolicy(null)
    }
  }

  const policyColors: Record<string, { bg: string; border: string; accent: string }> = {
    EL: { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'text-teal-700' },
    PL: { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'text-blue-700' },
    WFH: { bg: 'bg-violet-50', border: 'border-violet-200', accent: 'text-violet-700' },
    OH: { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'text-amber-700' },
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Admin' },
          { label: 'Settings' },
        ]}
      />

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg w-fit">
          <TabsTrigger value="attendance" className="flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4" /> Attendance Rules
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-1.5 text-sm">
            <CalendarDays className="w-4 h-4" /> Leave Policies
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-1.5 text-sm">
            <Building2 className="w-4 h-4" /> General
          </TabsTrigger>
        </TabsList>

        {/* ─── ATTENDANCE RULES ────────────────────────────────────────── */}
        <TabsContent value="attendance" className="mt-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
            <h3 className="font-display font-semibold text-slate-800 mb-1">Attendance Rules</h3>
            <p className="text-sm text-slate-500 mb-6">Configure the attendance policies for your organization</p>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Start Time</label>
                  <input
                    type="time"
                    value={localRules.workStartTime}
                    onChange={(e) => handleRulesChange('workStartTime', e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Auto-Absent Time</label>
                  <input
                    type="time"
                    value={localRules.autoAbsentTime}
                    onChange={(e) => handleRulesChange('autoAbsentTime', e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Late Threshold (minutes)</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={localRules.lateThresholdMinutes}
                    onChange={(e) => handleRulesChange('lateThresholdMinutes', parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">Minutes after work start time to mark as late</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Half-Day Threshold (hours)</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    step={0.5}
                    value={localRules.halfDayThreshold}
                    onChange={(e) => handleRulesChange('halfDayThreshold', parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">Minimum hours to count as half day</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Standard Work Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    step={0.5}
                    value={localRules.standardWorkHours}
                    onChange={(e) => handleRulesChange('standardWorkHours', parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Missing Checkout Reminder (min)</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={localRules.missingCheckoutReminderMinutes}
                    onChange={(e) => handleRulesChange('missingCheckoutReminderMinutes', parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">Minutes after expected checkout to send reminder</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleSaveRules}
                  disabled={savingRules}
                  className="h-10 px-6 bg-gradient-to-b from-teal-500 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {savingRules ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Attendance Rules
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ─── LEAVE POLICIES ─────────────────────────────────────────── */}
        <TabsContent value="leave" className="mt-6">
          <div className="space-y-4">
            <div className="mb-2">
              <h3 className="font-display font-semibold text-slate-800">Leave Policies</h3>
              <p className="text-sm text-slate-500">Configure leave quotas and rules for each leave type</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {localPolicies.map((policy) => {
                const colors = policyColors[policy.type] ?? { bg: 'bg-slate-50', border: 'border-slate-200', accent: 'text-slate-700' }
                return (
                  <div
                    key={policy.type}
                    className={cn('rounded-xl border p-5 space-y-4', colors.bg, colors.border)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={cn('font-display font-semibold', colors.accent)}>{policy.label}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Type: {policy.type}</p>
                      </div>
                      <StatusBadge variant="teal" size="sm">{policy.type}</StatusBadge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Annual Quota</label>
                        <input
                          type="number"
                          min={0}
                          value={policy.annualQuota}
                          onChange={(e) => handlePolicyChange(policy.type, 'annualQuota', parseInt(e.target.value) || 0)}
                          className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Carry-Forward Limit</label>
                        <input
                          type="number"
                          min={0}
                          value={policy.carryForwardLimit}
                          onChange={(e) => handlePolicyChange(policy.type, 'carryForwardLimit', parseInt(e.target.value) || 0)}
                          className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Min Days/Request</label>
                        <input
                          type="number"
                          min={1}
                          value={policy.minDaysPerRequest}
                          onChange={(e) => handlePolicyChange(policy.type, 'minDaysPerRequest', parseInt(e.target.value) || 1)}
                          className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Max Days/Request</label>
                        <input
                          type="number"
                          min={1}
                          value={policy.maxDaysPerRequest}
                          onChange={(e) => handlePolicyChange(policy.type, 'maxDaysPerRequest', parseInt(e.target.value) || 1)}
                          className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/60">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={policy.requiresAttachment}
                          onCheckedChange={(checked) => handlePolicyChange(policy.type, 'requiresAttachment', checked)}
                        />
                        <Label className="text-sm text-slate-600">Requires Attachment</Label>
                      </div>
                      <button
                        onClick={() => handleSavePolicy(policy.type)}
                        disabled={savingPolicy === policy.type}
                        className="h-8 px-4 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {savingPolicy === policy.type ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* ─── GENERAL ────────────────────────────────────────────────── */}
        <TabsContent value="general" className="mt-6 space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-800">Company Information</h3>
                <p className="text-xs text-slate-500">Organization details (read-only)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Company Name', value: 'Aistra Technologies Pvt. Ltd.' },
                { label: 'Industry', value: 'Technology / IT Services' },
                { label: 'Headquarters', value: 'Bangalore, Karnataka' },
                { label: 'Total Employees', value: '30-40' },
                { label: 'Fiscal Year', value: 'April - March' },
                { label: 'Work Week', value: 'Monday - Friday' },
              ].map((item) => (
                <div key={item.label}>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{item.label}</label>
                  <p className="text-sm text-slate-700 font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-800">Notification Preferences</h3>
                <p className="text-xs text-slate-500">Choose which email notifications to receive</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { key: 'leaveApproval' as const, label: 'Leave Approval/Rejection', desc: 'When a leave request is approved or rejected' },
                { key: 'leaveRejection' as const, label: 'New Leave Requests', desc: 'When a team member applies for leave' },
                { key: 'attendanceReminder' as const, label: 'Attendance Reminders', desc: 'Daily check-in reminders and missing checkout alerts' },
                { key: 'documentExpiry' as const, label: 'Document Expiry Alerts', desc: 'When employee documents are about to expire' },
                { key: 'onboardingTask' as const, label: 'Onboarding Task Updates', desc: 'When onboarding tasks are assigned or overdue' },
                { key: 'performanceReview' as const, label: 'Performance Review Alerts', desc: 'When reviews are due or submitted' },
                { key: 'monthlyReport' as const, label: 'Monthly Summary Report', desc: 'Monthly attendance and leave summary digest' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [item.key]: checked }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Palette className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-800">Theme Settings</h3>
                <p className="text-xs text-slate-500">Customize the appearance of the application</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color Theme</label>
                <div className="flex gap-3">
                  {[
                    { name: 'Teal (Default)', color: 'bg-teal-500', active: true },
                    { name: 'Blue', color: 'bg-blue-500', active: false },
                    { name: 'Violet', color: 'bg-violet-500', active: false },
                    { name: 'Rose', color: 'bg-rose-500', active: false },
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                        theme.active
                          ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span className={cn('w-4 h-4 rounded-full', theme.color)} />
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sidebar Mode</label>
                <div className="flex gap-3">
                  {['Expanded', 'Collapsed', 'Auto'].map((mode) => (
                    <button
                      key={mode}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm transition-all',
                        mode === 'Expanded'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
