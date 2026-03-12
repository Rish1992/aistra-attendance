import { useEffect, useState, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { FilterBar } from '@/components/shared/FilterBar'
import { usePerformanceStore } from '@/stores/performanceStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDate } from '@/lib/formatters'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// The store types don't match mock data exactly — use the mock shape
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

const goalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['Business', 'Technical', 'Growth', 'Team']),
  weight: z.coerce.number().min(5, 'Minimum weight is 5%').max(100, 'Maximum weight is 100%'),
  endDate: z.string().min(1, 'Due date is required'),
  keyResults: z.array(
    z.object({
      title: z.string().min(3, 'Key result title is required'),
      target: z.coerce.number().min(1, 'Target must be at least 1'),
      unit: z.string().min(1, 'Unit is required'),
    })
  ).min(1, 'Add at least one key result'),
})

type GoalFormData = z.infer<typeof goalSchema>

const REVIEW_CYCLES = [
  { value: 'all', label: 'All Cycles' },
  { value: 'FY 2025-26', label: 'FY 2025-26' },
  { value: 'FY 2024-25', label: 'FY 2024-25' },
]

function GoalCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  )
}

export function GoalsPage() {
  const user = useAuthStore((s) => s.user)
  const { goals: rawGoals, isLoading, fetchGoals } = usePerformanceStore()
  const goals = rawGoals as unknown as MockGoal[]

  const [cycleFilter, setCycleFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Technical',
      weight: 20,
      endDate: '',
      keyResults: [{ title: '', target: 100, unit: '%' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'keyResults',
  })

  useEffect(() => {
    if (user?.employeeId) {
      fetchGoals(user.employeeId)
    }
  }, [user?.employeeId, fetchGoals])

  const filteredGoals = useMemo(() => {
    if (cycleFilter === 'all') return goals
    return goals.filter((g) => {
      const year = new Date(g.startDate).getFullYear()
      if (cycleFilter === 'FY 2025-26') return year >= 2025
      if (cycleFilter === 'FY 2024-25') return year >= 2024 && year < 2025
      return true
    })
  }, [goals, cycleFilter])

  const stats = useMemo(() => {
    const total = filteredGoals.length
    const onTrack = filteredGoals.filter((g) => g.status === 'IN_PROGRESS').length
    const completed = filteredGoals.filter((g) => g.status === 'COMPLETED').length
    const avgProgress = total > 0
      ? Math.round(filteredGoals.reduce((sum, g) => sum + g.progress, 0) / total)
      : 0
    return { total, onTrack, completed, avgProgress }
  }, [filteredGoals])

  const toggleExpand = (goalId: string) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev)
      if (next.has(goalId)) next.delete(goalId)
      else next.add(goalId)
      return next
    })
  }

  const onSubmit = (data: GoalFormData) => {
    toast.success('Goal created successfully', {
      description: `"${data.title}" has been added to your goals.`,
    })
    setDialogOpen(false)
    form.reset()
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Goals"
        subtitle="Track your objectives and key results"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Performance', href: '/performance/goals' },
          { label: 'Goals' },
        ]}
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Goal
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Goals', value: stats.total, icon: Target, color: 'bg-teal-50 text-teal-600 ring-teal-500/20' },
          { label: 'On Track', value: stats.onTrack, icon: TrendingUp, color: 'bg-blue-50 text-blue-600 ring-blue-500/20' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 ring-emerald-500/20' },
          { label: 'Avg. Progress', value: `${stats.avgProgress}%`, icon: Target, color: 'bg-violet-50 text-violet-600 ring-violet-500/20' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 animate-fade-up"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900">{isLoading ? '-' : stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cycle Filter */}
      <FilterBar
        filters={[
          {
            key: 'cycle',
            label: 'Review Cycle',
            options: REVIEW_CYCLES,
            value: cycleFilter,
            onChange: setCycleFilter,
          },
        ]}
      />

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <GoalCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals found"
          description="You don't have any goals yet. Create your first goal to start tracking your progress."
          action={
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredGoals.map((goal, idx) => {
            const statusCfg = goalStatusConfig[goal.status] ?? goalStatusConfig.NOT_STARTED
            const isExpanded = expandedGoals.has(goal.id)

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all animate-fade-up stagger-${Math.min(idx + 1, 5)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge variant={statusCfg.variant} dot size="sm">
                        {statusCfg.label}
                      </StatusBadge>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                        {goal.category}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-slate-800 text-base leading-snug">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {goal.description}
                    </p>
                  </div>
                  <ProgressRing
                    value={goal.progress}
                    size="sm"
                    color={
                      goal.status === 'AT_RISK'
                        ? 'amber'
                        : goal.status === 'COMPLETED'
                        ? 'teal'
                        : 'teal'
                    }
                    label="%"
                  />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Due {formatDate(goal.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {goal.keyResults.length} Key Result{goal.keyResults.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpand(goal.id)}
                  className="flex items-center gap-1 mt-3 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Hide Key Results
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show Key Results
                    </>
                  )}
                </button>

                {/* Key Results */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-fade-in">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Key Results
                    </p>
                    {goal.keyResults.map((kr) => {
                      const krProgress =
                        kr.targetValue > 0
                          ? Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100))
                          : 0
                      return (
                        <div key={kr.id} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-700 font-medium">
                              {kr.title}
                            </span>
                            <span className="text-xs text-slate-500 tabular-nums">
                              {kr.currentValue} / {kr.targetValue} {kr.unit}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${krStatusColors[kr.status] ?? 'bg-slate-300'}`}
                              style={{ width: `${krProgress}%` }}
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
      )}

      {/* Create Goal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Create New Goal</DialogTitle>
            <DialogDescription>
              Define your objective and add measurable key results.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                placeholder="e.g., Improve customer satisfaction"
                {...form.register('title')}
                className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
              {form.formState.errors.title && (
                <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the objective and expected outcome..."
                rows={3}
                {...form.register('description')}
                className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(val) => form.setValue('category', val as GoalFormData['category'])}
                >
                  <SelectTrigger className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Business', 'Technical', 'Growth', 'Team'].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight %</Label>
                <Input
                  id="weight"
                  type="number"
                  min={5}
                  max={100}
                  {...form.register('weight')}
                  className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
                />
                {form.formState.errors.weight && (
                  <p className="text-xs text-red-500">{form.formState.errors.weight.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Due Date</Label>
              <Input
                id="endDate"
                type="date"
                {...form.register('endDate')}
                className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
              {form.formState.errors.endDate && (
                <p className="text-xs text-red-500">{form.formState.errors.endDate.message}</p>
              )}
            </div>

            {/* Key Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Key Results</Label>
                <p className="text-xs text-slate-400">
                  All goal weights should ideally sum to 100%
                </p>
              </div>
              {form.formState.errors.keyResults?.root && (
                <p className="text-xs text-red-500">{form.formState.errors.keyResults.root.message}</p>
              )}
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      KR {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Key result title"
                    {...form.register(`keyResults.${index}.title`)}
                    className="bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  {form.formState.errors.keyResults?.[index]?.title && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.keyResults[index].title?.message}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Target value"
                      {...form.register(`keyResults.${index}.target`)}
                      className="bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <Input
                      placeholder="Unit (e.g., %, hours, count)"
                      {...form.register(`keyResults.${index}.unit`)}
                      className="bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ title: '', target: 100, unit: '%' })}
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Key Result
              </Button>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  form.reset()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
              >
                Create Goal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
