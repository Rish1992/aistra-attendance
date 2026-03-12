import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  Plus,
  TreePalm,
  Stethoscope,
  Home,
  CalendarHeart,
  ChevronDown,
  Info,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { PageHeader } from '@/components/layout/PageHeader'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { Button } from '@/components/ui/button'

import { useLeaveStore } from '@/stores/leaveStore'
import { useAuthStore } from '@/stores/authStore'
import { LEAVE_TYPE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { LeaveType } from '@/types/leave'

const CARD_CONFIG: Record<
  LeaveType,
  {
    bg: string
    iconBg: string
    icon: typeof TreePalm
    ringColor: 'teal' | 'blue' | 'violet' | 'amber'
    progressBg: string
    progressFill: string
  }
> = {
  EL: {
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-100 text-teal-600',
    icon: TreePalm,
    ringColor: 'teal',
    progressBg: 'bg-teal-100',
    progressFill: 'bg-teal-500',
  },
  PL: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100 text-blue-600',
    icon: Stethoscope,
    ringColor: 'blue',
    progressBg: 'bg-blue-100',
    progressFill: 'bg-blue-500',
  },
  WFH: {
    bg: 'bg-violet-50',
    iconBg: 'bg-violet-100 text-violet-600',
    icon: Home,
    ringColor: 'violet',
    progressBg: 'bg-violet-100',
    progressFill: 'bg-violet-500',
  },
  OH: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100 text-amber-600',
    icon: CalendarHeart,
    ringColor: 'amber',
    progressBg: 'bg-amber-100',
    progressFill: 'bg-amber-500',
  },
}

const LEAVE_POLICIES = [
  {
    type: 'EL' as LeaveType,
    rules: [
      'Annual quota: 18 days',
      'Carry forward limit: up to 10 days',
      'Minimum 1 day per request',
      'Maximum 10 days per request',
      'No attachment required',
    ],
  },
  {
    type: 'PL' as LeaveType,
    rules: [
      'Annual quota: 12 days',
      'No carry forward',
      'Minimum 0.5 day (half-day)',
      'Maximum 5 days per request',
      'Attachment required for leaves > 3 days',
    ],
  },
  {
    type: 'WFH' as LeaveType,
    rules: [
      'Annual quota: 24 days',
      'No carry forward',
      'Minimum 1 day per request',
      'Maximum 5 days per request',
      'Must remain available on communication channels',
    ],
  },
  {
    type: 'OH' as LeaveType,
    rules: [
      'Annual quota: 2 days (from optional holiday list)',
      'No carry forward',
      'Can only be taken on designated optional holidays',
      'Apply at least 2 days in advance',
    ],
  },
]

export function LeaveBalancePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { balances, applications, isLoading, fetchBalances, fetchMyLeaves } =
    useLeaveStore()

  useEffect(() => {
    if (user?.employeeId) {
      fetchBalances(user.employeeId)
      fetchMyLeaves(user.employeeId)
    }
  }, [user?.employeeId, fetchBalances, fetchMyLeaves])

  const monthlyData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    const currentYear = new Date().getFullYear()

    return months.map((month, idx) => {
      const monthLeaves = applications.filter((a) => {
        if (a.status !== 'APPROVED' && a.status !== 'PENDING') return false
        const startDate = new Date(a.startDate)
        return (
          startDate.getFullYear() === currentYear &&
          startDate.getMonth() === idx
        )
      })

      const el = monthLeaves
        .filter((a) => a.leaveType === 'EL')
        .reduce((sum, a) => sum + a.durationDays, 0)
      const pl = monthLeaves
        .filter((a) => a.leaveType === 'PL')
        .reduce((sum, a) => sum + a.durationDays, 0)
      const wfh = monthLeaves
        .filter((a) => a.leaveType === 'WFH')
        .reduce((sum, a) => sum + a.durationDays, 0)
      const oh = monthLeaves
        .filter((a) => a.leaveType === 'OH')
        .reduce((sum, a) => sum + a.durationDays, 0)

      return { month, EL: el, PL: pl, WFH: wfh, OH: oh }
    })
  }, [applications])

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Leave Balance"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Leave', href: '/leave/status' },
          { label: 'Balance' },
        ]}
        actions={
          <Button
            className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
            onClick={() => navigate('/leave/apply')}
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </Button>
        }
      />

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(LEAVE_TYPE_CONFIG) as LeaveType[]).map((type, idx) => {
          const config = LEAVE_TYPE_CONFIG[type]
          const cardConfig = CARD_CONFIG[type]
          const balance = balances.find((b) => b.type === type)
          const remaining = balance?.remaining ?? 0
          const total = balance?.total ?? config.annual
          const used = balance?.used ?? 0
          const carryForward = balance?.carryForward ?? 0
          const usagePercent = total > 0 ? ((total - used) / total) * 100 : 0
          const Icon = cardConfig.icon

          return (
            <div
              key={type}
              className={cn(
                'rounded-xl border border-slate-200 p-5 transition-all hover:shadow-md animate-fade-up',
                cardConfig.bg,
                idx === 1 && 'stagger-1',
                idx === 2 && 'stagger-2',
                idx === 3 && 'stagger-3'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                      cardConfig.iconBg
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    {config.label}
                  </p>
                </div>
                <ProgressRing
                  value={usagePercent}
                  size="sm"
                  color={cardConfig.ringColor}
                  showValue={false}
                />
              </div>

              <div className="mb-3">
                <span className="font-display text-2xl font-bold text-slate-900">
                  {remaining}
                </span>
                <span className="text-sm text-slate-400 ml-1">/ {total}</span>
              </div>

              {/* Progress bar */}
              <div className={cn('w-full h-2 rounded-full', cardConfig.progressBg)}>
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-500',
                    cardConfig.progressFill
                  )}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Used {used} of {total}
                </p>
                {carryForward > 0 && (
                  <p className="text-xs text-slate-400">
                    +{carryForward} carried
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Monthly Usage Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-1">
        <h3 className="font-display font-semibold text-slate-800 mb-4">
          Monthly Leave Usage &mdash; {new Date().getFullYear()}
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#94A3B8' }}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94A3B8' }}
                axisLine={{ stroke: '#E2E8F0' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="EL"
                name="Earned Leave"
                fill="#14B8A6"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="PL"
                name="Paid Leave"
                fill="#3B82F6"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="WFH"
                name="Work From Home"
                fill="#8B5CF6"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="OH"
                name="Optional Holiday"
                fill="#F59E0B"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leave Policy Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 animate-fade-up stagger-2">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-slate-400" />
          <h3 className="font-display font-semibold text-slate-800">
            Leave Policy
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEAVE_POLICIES.map((policy) => {
            const config = LEAVE_TYPE_CONFIG[policy.type]
            const cardConfig = CARD_CONFIG[policy.type]

            return (
              <details
                key={policy.type}
                className="group bg-slate-50 rounded-lg border border-slate-200"
              >
                <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      cardConfig.iconBg
                    )}
                  >
                    <cardConfig.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 flex-1">
                    {config.label} ({config.shortLabel})
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 pt-0">
                  <ul className="space-y-1.5">
                    {policy.rules.map((rule, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-500 flex items-start gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </div>
  )
}
