import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Target,
  Users,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Search,
  Calendar,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { EmptyState } from '@/components/shared/EmptyState'
import { FilterBar } from '@/components/shared/FilterBar'
import { useAuthStore } from '@/stores/authStore'
import { formatDate } from '@/lib/formatters'
import { Skeleton } from '@/components/ui/skeleton'

interface MockKeyResult {
  id: string
  title: string
  targetValue: number
  currentValue: number
  unit: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK'
}

interface MockGoal {
  id: string
  employeeId: string
  employeeName: string
  title: string
  description: string
  category: 'Business' | 'Technical' | 'Growth' | 'Team'
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK'
  progress: number
  startDate: string
  endDate: string
  keyResults: MockKeyResult[]
  createdAt: string
  updatedAt: string
}

interface TeamMemberSummary {
  employeeId: string
  employeeName: string
  goals: MockGoal[]
  totalGoals: number
  avgProgress: number
  onTrack: number
  atRisk: number
  completed: number
  notStarted: number
}

const goalStatusConfig: Record<string, { label: string; variant: 'teal' | 'warning' | 'danger' | 'success' | 'default' }> = {
  IN_PROGRESS: { label: 'On Track', variant: 'teal' },
  AT_RISK: { label: 'At Risk', variant: 'warning' },
  NOT_STARTED: { label: 'Not Started', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'success' },
}

const krStatusColors: Record<string, string> = {
  NOT_STARTED: 'bg-slate-200',
  IN_PROGRESS: 'bg-teal-500',
  COMPLETED: 'bg-emerald-500',
  AT_RISK: 'bg-amber-500',
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'IN_PROGRESS', label: 'On Track' },
  { value: 'AT_RISK', label: 'At Risk' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'NOT_STARTED', label: 'Not Started' },
]

function TeamMemberSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  )
}

export function TeamGoalsPage() {
  const user = useAuthStore((s) => s.user)
  const [allGoals, setAllGoals] = useState<MockGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set())
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadTeamGoals = async () => {
      setIsLoading(true)
      try {
        const { mockGoals } = await import('@/mock/performance')
        // For managers, show all goals (in production, filter by direct reports)
        // Exclude the current user's own goals
        const teamGoals = mockGoals.filter((g) => g.employeeId !== user?.employeeId)
        setAllGoals(teamGoals as MockGoal[])
      } catch {
        setAllGoals([])
      } finally {
        setIsLoading(false)
      }
    }
    loadTeamGoals()
  }, [user?.employeeId])

  const teamMembers = useMemo(() => {
    const memberMap = new Map<string, TeamMemberSummary>()

    for (const goal of allGoals) {
      if (!memberMap.has(goal.employeeId)) {
        memberMap.set(goal.employeeId, {
          employeeId: goal.employeeId,
          employeeName: goal.employeeName,
          goals: [],
          totalGoals: 0,
          avgProgress: 0,
          onTrack: 0,
          atRisk: 0,
          completed: 0,
          notStarted: 0,
        })
      }
      const member = memberMap.get(goal.employeeId)!
      member.goals.push(goal)
      member.totalGoals++
      if (goal.status === 'IN_PROGRESS') member.onTrack++
      else if (goal.status === 'AT_RISK') member.atRisk++
      else if (goal.status === 'COMPLETED') member.completed++
      else if (goal.status === 'NOT_STARTED') member.notStarted++
    }

    for (const member of memberMap.values()) {
      member.avgProgress = member.totalGoals > 0
        ? Math.round(member.goals.reduce((sum, g) => sum + g.progress, 0) / member.totalGoals)
        : 0
    }

    return Array.from(memberMap.values())
  }, [allGoals])

  const filteredMembers = useMemo(() => {
    let results = teamMembers

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      results = results.filter((m) => m.employeeName.toLowerCase().includes(q))
    }

    if (statusFilter !== 'all') {
      results = results.filter((m) =>
        m.goals.some((g) => g.status === statusFilter)
      )
    }

    return results
  }, [teamMembers, searchQuery, statusFilter])

  const teamStats = useMemo(() => {
    const totalMembers = filteredMembers.length
    const avgProgress = totalMembers > 0
      ? Math.round(filteredMembers.reduce((sum, m) => sum + m.avgProgress, 0) / totalMembers)
      : 0
    const totalOnTrack = filteredMembers.reduce((sum, m) => sum + m.onTrack, 0)
    const totalAtRisk = filteredMembers.reduce((sum, m) => sum + m.atRisk, 0)
    const totalGoals = filteredMembers.reduce((sum, m) => sum + m.totalGoals, 0)
    const onTrackPct = totalGoals > 0 ? Math.round(((totalOnTrack + filteredMembers.reduce((s, m) => s + m.completed, 0)) / totalGoals) * 100) : 0
    return { totalMembers, avgProgress, totalOnTrack, totalAtRisk, onTrackPct }
  }, [filteredMembers])

  const toggleMember = useCallback((employeeId: string) => {
    setExpandedMembers((prev) => {
      const next = new Set(prev)
      if (next.has(employeeId)) next.delete(employeeId)
      else next.add(employeeId)
      return next
    })
  }, [])

  const toggleGoal = useCallback((goalId: string) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev)
      if (next.has(goalId)) next.delete(goalId)
      else next.add(goalId)
      return next
    })
  }, [])

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Team Goals"
        subtitle="Monitor your team's objectives and progress"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Performance', href: '/performance/goals' },
          { label: 'Team Goals' },
        ]}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Team Members', value: teamStats.totalMembers, icon: Users, color: 'bg-teal-50 text-teal-600 ring-teal-500/20' },
          { label: 'Avg. Progress', value: `${teamStats.avgProgress}%`, icon: TrendingUp, color: 'bg-blue-50 text-blue-600 ring-blue-500/20' },
          { label: 'On Track', value: `${teamStats.onTrackPct}%`, icon: Target, color: 'bg-emerald-50 text-emerald-600 ring-emerald-500/20' },
          { label: 'At Risk', value: teamStats.totalAtRisk, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600 ring-amber-500/20' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 animate-fade-up"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900">
                {isLoading ? '-' : stat.value}
              </p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search team members..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: STATUS_FILTER_OPTIONS,
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Team Member Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <TeamMemberSkeleton key={i} />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members found"
          description="No team members match your current filters, or your team doesn't have any goals yet."
        />
      ) : (
        <div className="space-y-4">
          {filteredMembers.map((member, idx) => {
            const isMemberExpanded = expandedMembers.has(member.employeeId)

            return (
              <div
                key={member.employeeId}
                className={`bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all animate-fade-up stagger-${Math.min(idx + 1, 5)}`}
              >
                {/* Member Header */}
                <button
                  onClick={() => toggleMember(member.employeeId)}
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <EmployeeAvatar name={member.employeeName} size="md" />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-slate-800">
                      {member.employeeName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">
                        {member.totalGoals} goal{member.totalGoals !== 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-200">|</span>
                      <div className="flex items-center gap-1.5">
                        {member.onTrack > 0 && (
                          <StatusBadge variant="teal" size="xs">{member.onTrack} On Track</StatusBadge>
                        )}
                        {member.atRisk > 0 && (
                          <StatusBadge variant="warning" size="xs">{member.atRisk} At Risk</StatusBadge>
                        )}
                        {member.completed > 0 && (
                          <StatusBadge variant="success" size="xs">{member.completed} Done</StatusBadge>
                        )}
                        {member.notStarted > 0 && (
                          <StatusBadge variant="default" size="xs">{member.notStarted} Not Started</StatusBadge>
                        )}
                      </div>
                    </div>
                  </div>

                  <ProgressRing
                    value={member.avgProgress}
                    size="sm"
                    color={member.avgProgress >= 60 ? 'teal' : member.avgProgress >= 30 ? 'amber' : 'red'}
                    label="%"
                  />

                  <div className="text-slate-400 ml-2">
                    {isMemberExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Expanded Goals */}
                {isMemberExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/30 animate-fade-in">
                    <div className="p-4 space-y-3">
                      {member.goals
                        .filter((g) => statusFilter === 'all' || g.status === statusFilter)
                        .map((goal) => {
                          const statusCfg = goalStatusConfig[goal.status] ?? goalStatusConfig.NOT_STARTED
                          const isGoalExpanded = expandedGoals.has(goal.id)

                          return (
                            <div
                              key={goal.id}
                              className="bg-white rounded-lg border border-slate-200 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <StatusBadge variant={statusCfg.variant} dot size="xs">
                                      {statusCfg.label}
                                    </StatusBadge>
                                    <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                                      {goal.category}
                                    </span>
                                  </div>
                                  <h4 className="font-display font-semibold text-slate-800 text-sm">
                                    {goal.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                    {goal.description}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="font-display font-bold text-sm text-slate-800">
                                      {goal.progress}%
                                    </p>
                                    <p className="text-xs text-slate-400">progress</p>
                                  </div>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    goal.status === 'AT_RISK'
                                      ? 'bg-amber-500'
                                      : goal.status === 'COMPLETED'
                                      ? 'bg-emerald-500'
                                      : 'bg-teal-500'
                                  }`}
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due {formatDate(goal.endDate)}
                                </span>
                                <button
                                  onClick={() => toggleGoal(goal.id)}
                                  className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                                >
                                  {isGoalExpanded ? 'Hide KRs' : `${goal.keyResults.length} Key Results`}
                                </button>
                              </div>

                              {/* Key Results */}
                              {isGoalExpanded && (
                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-fade-in">
                                  {goal.keyResults.map((kr) => {
                                    const krPct = kr.targetValue > 0
                                      ? Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100))
                                      : 0
                                    return (
                                      <div key={kr.id} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-slate-700 font-medium">
                                            {kr.title}
                                          </span>
                                          <span className="text-xs text-slate-500 tabular-nums">
                                            {kr.currentValue}/{kr.targetValue} {kr.unit}
                                          </span>
                                        </div>
                                        <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                                          <div
                                            className={`h-full rounded-full transition-all duration-500 ${krStatusColors[kr.status] ?? 'bg-slate-300'}`}
                                            style={{ width: `${krPct}%` }}
                                          />
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
