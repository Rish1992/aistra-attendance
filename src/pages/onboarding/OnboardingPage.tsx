import { useEffect, useState, useMemo } from 'react'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2,
  Briefcase,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { EmptyState } from '@/components/shared/EmptyState'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/formatters'
import { ONBOARDING_TASK_GROUPS } from '@/lib/constants'
import type {
  OnboardingChecklist,
  OnboardingTask,
  OnboardingTaskGroup,
  OnboardingTaskStatus,
} from '@/types/onboarding'

const priorityVariantMap: Record<string, 'danger' | 'warning' | 'info'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'info',
}

const statusVariantMap: Record<OnboardingTaskStatus, 'pending' | 'warning' | 'success'> = {
  PENDING: 'pending',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
}

const statusLabelMap: Record<OnboardingTaskStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
}

const groupIcons: Record<OnboardingTaskGroup, typeof Users> = {
  HR: Users,
  'IT/Admin': Building2,
  Manager: Briefcase,
  'New Hire': UserPlus,
}

const groupColors: Record<OnboardingTaskGroup, string> = {
  HR: 'bg-teal-50 text-teal-700 border-teal-200',
  'IT/Admin': 'bg-blue-50 text-blue-700 border-blue-200',
  Manager: 'bg-violet-50 text-violet-700 border-violet-200',
  'New Hire': 'bg-amber-50 text-amber-700 border-amber-200',
}

function isOverdue(dueDate: string, status: OnboardingTaskStatus): boolean {
  if (status === 'COMPLETED') return false
  return new Date(dueDate) < new Date()
}

export function OnboardingPage() {
  const { checklists, isLoading, fetchChecklists, updateTaskStatus } = useOnboardingStore()
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchChecklists()
  }, [fetchChecklists])

  // Auto-expand first employee
  useEffect(() => {
    if (checklists.length > 0 && expandedEmployees.size === 0) {
      setExpandedEmployees(new Set([checklists[0].employeeId]))
    }
  }, [checklists]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = (employeeId: string) => {
    setExpandedEmployees((prev) => {
      const next = new Set(prev)
      if (next.has(employeeId)) {
        next.delete(employeeId)
      } else {
        next.add(employeeId)
      }
      return next
    })
  }

  const handleTaskToggle = async (
    employeeId: string,
    taskId: string,
    currentStatus: OnboardingTaskStatus
  ) => {
    const newStatus: OnboardingTaskStatus =
      currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    await updateTaskStatus(employeeId, taskId, newStatus)
  }

  // Overview stats
  const stats = useMemo(() => {
    const activeCount = checklists.length
    const avgCompletion =
      activeCount > 0
        ? Math.round(
            checklists.reduce((sum, c) => sum + c.overallProgress, 0) / activeCount
          )
        : 0
    const overdueTasks = checklists.reduce(
      (sum, c) =>
        sum + c.tasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
      0
    )
    return { activeCount, avgCompletion, overdueTasks }
  }, [checklists])

  const statCards = [
    {
      label: 'Active Onboardings',
      value: stats.activeCount,
      icon: Users,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      ringColor: 'ring-teal-100',
    },
    {
      label: 'Avg. Completion',
      value: `${stats.avgCompletion}%`,
      icon: TrendingUp,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      ringColor: 'ring-blue-100',
    },
    {
      label: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      iconBg: stats.overdueTasks > 0 ? 'bg-red-50' : 'bg-slate-50',
      iconColor: stats.overdueTasks > 0 ? 'text-red-600' : 'text-slate-600',
      ringColor: stats.overdueTasks > 0 ? 'ring-red-100' : 'ring-slate-100',
    },
  ]

  function groupTasksByAssignee(tasks: OnboardingTask[]) {
    const groups: Record<OnboardingTaskGroup, OnboardingTask[]> = {
      HR: [],
      'IT/Admin': [],
      Manager: [],
      'New Hire': [],
    }
    for (const task of tasks) {
      groups[task.assignedTo].push(task)
    }
    return groups
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Onboarding Tracker"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Admin', href: '/dashboard' },
          { label: 'Onboarding' },
        ]}
        subtitle="Track and manage new employee onboarding progress"
      />

      {/* Overview Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all animate-fade-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center ring-4',
                      card.iconBg,
                      card.iconColor,
                      card.ringColor
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-display text-3xl font-bold text-slate-900 animate-count">
                      {card.value}
                    </p>
                    <p className="text-sm text-slate-500">{card.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Onboarding Checklists */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : checklists.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No active onboardings"
          description="There are currently no employees being onboarded. New hires will appear here once their onboarding process begins."
        />
      ) : (
        <div className="space-y-4">
          {checklists.map((checklist, checkIdx) => (
            <EmployeeOnboardingCard
              key={checklist.employeeId}
              checklist={checklist}
              isExpanded={expandedEmployees.has(checklist.employeeId)}
              onToggle={() => toggleExpand(checklist.employeeId)}
              onTaskToggle={handleTaskToggle}
              groupTasksByAssignee={groupTasksByAssignee}
              index={checkIdx}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface EmployeeOnboardingCardProps {
  checklist: OnboardingChecklist
  isExpanded: boolean
  onToggle: () => void
  onTaskToggle: (
    employeeId: string,
    taskId: string,
    currentStatus: OnboardingTaskStatus
  ) => void
  groupTasksByAssignee: (
    tasks: OnboardingTask[]
  ) => Record<OnboardingTaskGroup, OnboardingTask[]>
  index: number
}

function EmployeeOnboardingCard({
  checklist,
  isExpanded,
  onToggle,
  onTaskToggle,
  groupTasksByAssignee,
  index,
}: EmployeeOnboardingCardProps) {
  const overdueTasks = checklist.tasks.filter((t) => isOverdue(t.dueDate, t.status))
  const completedCount = checklist.tasks.filter((t) => t.status === 'COMPLETED').length
  const totalCount = checklist.tasks.length
  const taskGroups = groupTasksByAssignee(checklist.tasks)

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all animate-fade-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Header - always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
      >
        <EmployeeAvatar name={checklist.employeeName} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-lg text-slate-800">
              {checklist.employeeName}
            </h3>
            {overdueTasks.length > 0 && (
              <StatusBadge variant="danger" size="xs">
                {overdueTasks.length} overdue
              </StatusBadge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {checklist.employeeDesignation}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {checklist.department}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {formatDate(checklist.dateOfJoining)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {completedCount} of {totalCount} tasks completed
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <ProgressRing
            value={checklist.overallProgress}
            size="sm"
            color={
              checklist.overallProgress >= 80
                ? 'teal'
                : checklist.overallProgress >= 50
                  ? 'blue'
                  : 'amber'
            }
            label="%"
          />
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded task list */}
      {isExpanded && (
        <div className="border-t border-slate-200 px-5 pb-5">
          {ONBOARDING_TASK_GROUPS.map((group) => {
            const tasks = taskGroups[group]
            if (tasks.length === 0) return null
            const GroupIcon = groupIcons[group]
            return (
              <div key={group} className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center',
                      groupColors[group].split(' ')[0]
                    )}
                  >
                    <GroupIcon className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {group}
                  </h4>
                  <span className="text-xs text-slate-400">
                    ({tasks.filter((t) => t.status === 'COMPLETED').length}/{tasks.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => {
                    const overdue = isOverdue(task.dueDate, task.status)
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors',
                          overdue
                            ? 'bg-red-50/60 border border-red-100'
                            : task.status === 'COMPLETED'
                              ? 'bg-slate-50/60'
                              : 'bg-white border border-slate-100'
                        )}
                      >
                        <Checkbox
                          checked={task.status === 'COMPLETED'}
                          onCheckedChange={() =>
                            onTaskToggle(checklist.employeeId, task.id, task.status)
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  'text-sm font-medium',
                                  task.status === 'COMPLETED'
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-800'
                                )}
                              >
                                {task.title}
                              </p>
                              <p
                                className={cn(
                                  'text-xs mt-0.5',
                                  task.status === 'COMPLETED'
                                    ? 'text-slate-300'
                                    : 'text-slate-500'
                                )}
                              >
                                {task.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <StatusBadge
                                variant={priorityVariantMap[task.priority]}
                                size="xs"
                              >
                                {task.priority}
                              </StatusBadge>
                              <StatusBadge
                                variant={statusVariantMap[task.status]}
                                size="xs"
                                dot
                              >
                                {statusLabelMap[task.status]}
                              </StatusBadge>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span
                              className={cn(
                                'flex items-center gap-1',
                                overdue && 'text-red-600 font-medium'
                              )}
                            >
                              <Calendar className="w-3 h-3" />
                              {overdue ? 'Overdue: ' : 'Due: '}
                              {formatDate(task.dueDate)}
                            </span>
                            {task.assigneeName && (
                              <span>Assignee: {task.assigneeName}</span>
                            )}
                            {task.completedAt && (
                              <span className="text-emerald-600">
                                Completed {formatDate(task.completedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
