import { useEffect, useState, useMemo } from 'react'
import {
  Star,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Send,
  User,
  Users,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { EmptyState } from '@/components/shared/EmptyState'
import { usePerformanceStore } from '@/stores/performanceStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDate } from '@/lib/formatters'
import { PERFORMANCE_RATINGS } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface MockReview {
  id: string
  employeeId: string
  employeeName: string
  reviewPeriod: string
  reviewType: 'QUARTERLY' | 'ANNUAL' | 'PROBATION'
  selfAssessment: {
    rating: number
    strengths: string
    improvements: string
    goals: string
  }
  managerAssessment: {
    rating: number
    strengths: string
    improvements: string
    goals: string
    overallComments: string
  } | null
  status: 'SELF_REVIEW' | 'MANAGER_REVIEW' | 'COMPLETED'
  managerId: string
  managerName: string
  submittedAt: string
  completedAt?: string
}

const reviewStatusConfig: Record<string, { label: string; variant: 'pending' | 'info' | 'success'; icon: typeof Clock }> = {
  SELF_REVIEW: { label: 'Self Review', variant: 'pending', icon: Clock },
  MANAGER_REVIEW: { label: 'Manager Review', variant: 'info', icon: User },
  COMPLETED: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
}

const reviewTypeLabels: Record<string, string> = {
  QUARTERLY: 'Quarterly',
  ANNUAL: 'Annual',
  PROBATION: 'Probation',
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-200 fill-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hover || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-200'
            } transition-colors`}
          />
        </button>
      ))}
      {(hover || value) > 0 && (
        <span className="ml-2 text-sm text-slate-600 font-medium">
          {PERFORMANCE_RATINGS.find((r) => r.value === (hover || value))?.label ?? ''}
        </span>
      )}
    </div>
  )
}

function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

export function ReviewsPage() {
  const user = useAuthStore((s) => s.user)
  const { reviews: rawReviews, isLoading, fetchReviews } = usePerformanceStore()
  const reviews = rawReviews as unknown as MockReview[]

  const [allReviews, setAllReviews] = useState<MockReview[]>([])
  const [pendingReviews, setPendingReviews] = useState<MockReview[]>([])
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null)
  const [selfAssessmentOpen, setSelfAssessmentOpen] = useState(false)
  const [managerReviewOpen, setManagerReviewOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<MockReview | null>(null)

  // Self assessment form state
  const [selfRating, setSelfRating] = useState(0)
  const [selfStrengths, setSelfStrengths] = useState('')
  const [selfImprovements, setSelfImprovements] = useState('')
  const [selfGoals, setSelfGoals] = useState('')

  // Manager assessment form state
  const [mgrRating, setMgrRating] = useState(0)
  const [mgrStrengths, setMgrStrengths] = useState('')
  const [mgrImprovements, setMgrImprovements] = useState('')
  const [mgrGoals, setMgrGoals] = useState('')
  const [mgrComments, setMgrComments] = useState('')

  const isManager = user?.role === 'MANAGER' || user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (user?.employeeId) {
      fetchReviews(user.employeeId)
    }
  }, [user?.employeeId, fetchReviews])

  // Load all reviews for manager's pending tab
  useEffect(() => {
    const loadAllReviews = async () => {
      if (!isManager) return
      try {
        const { mockReviews } = await import('@/mock/performance')
        setAllReviews(mockReviews as MockReview[])
        // Pending: reviews where status is MANAGER_REVIEW or SELF_REVIEW and user is manager
        const pending = (mockReviews as MockReview[]).filter(
          (r) =>
            (r.status === 'MANAGER_REVIEW' || r.status === 'SELF_REVIEW') &&
            r.employeeId !== user?.employeeId
        )
        setPendingReviews(pending)
      } catch {
        setAllReviews([])
        setPendingReviews([])
      }
    }
    loadAllReviews()
  }, [isManager, user?.employeeId])

  const myReviews = reviews
  const completedCount = myReviews.filter((r) => r.status === 'COMPLETED').length
  const pendingCount = pendingReviews.length

  // Current review cycle info
  const currentCycle = {
    name: 'Q4 2025 Performance Review',
    timeline: 'Jan 1 - Jan 31, 2026',
    phase: isManager ? 'Manager Review Phase' : 'Self Assessment Phase',
  }

  const handleSelfAssessmentOpen = (review: MockReview) => {
    setSelectedReview(review)
    setSelfRating(review.selfAssessment?.rating ?? 0)
    setSelfStrengths(review.selfAssessment?.strengths ?? '')
    setSelfImprovements(review.selfAssessment?.improvements ?? '')
    setSelfGoals(review.selfAssessment?.goals ?? '')
    setSelfAssessmentOpen(true)
  }

  const handleSelfAssessmentSubmit = () => {
    if (selfRating === 0) {
      toast.error('Please select a rating')
      return
    }
    if (!selfStrengths.trim() || !selfImprovements.trim() || !selfGoals.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    toast.success('Self assessment submitted', {
      description: 'Your self assessment has been submitted for manager review.',
    })
    setSelfAssessmentOpen(false)
    setSelectedReview(null)
  }

  const handleManagerReviewOpen = (review: MockReview) => {
    setSelectedReview(review)
    setMgrRating(review.managerAssessment?.rating ?? 0)
    setMgrStrengths(review.managerAssessment?.strengths ?? '')
    setMgrImprovements(review.managerAssessment?.improvements ?? '')
    setMgrGoals(review.managerAssessment?.goals ?? '')
    setMgrComments(review.managerAssessment?.overallComments ?? '')
    setManagerReviewOpen(true)
  }

  const handleManagerReviewSubmit = () => {
    if (mgrRating === 0) {
      toast.error('Please select a rating')
      return
    }
    if (!mgrStrengths.trim() || !mgrComments.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Manager review submitted', {
      description: `Review for ${selectedReview?.employeeName} has been completed.`,
    })
    setManagerReviewOpen(false)
    setSelectedReview(null)
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Performance Reviews"
        subtitle="Track and complete performance review cycles"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Performance', href: '/performance/goals' },
          { label: 'Reviews' },
        ]}
      />

      {/* Current Cycle Info Card */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white animate-fade-up">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">
              Current Review Cycle
            </p>
            <h2 className="font-display text-xl font-bold">{currentCycle.name}</h2>
            <p className="text-teal-100 text-sm mt-1">{currentCycle.timeline}</p>
          </div>
          <div className="bg-white/15 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <p className="text-sm font-medium">{currentCycle.phase}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4">
          <div>
            <p className="font-display text-2xl font-bold">{completedCount}</p>
            <p className="text-teal-100 text-xs">Completed</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <p className="font-display text-2xl font-bold">{myReviews.length}</p>
            <p className="text-teal-100 text-xs">My Reviews</p>
          </div>
          {isManager && (
            <>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="font-display text-2xl font-bold">{pendingCount}</p>
                <p className="text-teal-100 text-xs">Pending Actions</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-reviews">
        <TabsList variant="line" className="border-b border-slate-200 w-full justify-start">
          <TabsTrigger value="my-reviews" className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            My Reviews
          </TabsTrigger>
          {isManager && (
            <TabsTrigger value="pending" className="flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4" />
              Pending Actions
              {pendingCount > 0 && (
                <span className="ml-1 bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* My Reviews Tab */}
        <TabsContent value="my-reviews" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          ) : myReviews.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No reviews yet"
              description="You don't have any performance reviews yet. Reviews will appear here when a review cycle begins."
            />
          ) : (
            <div className="space-y-4">
              {myReviews.map((review, idx) => {
                const statusCfg = reviewStatusConfig[review.status]
                const isExpanded = expandedReviewId === review.id

                return (
                  <div
                    key={review.id}
                    className={`bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all animate-fade-up stagger-${Math.min(idx + 1, 5)}`}
                  >
                    {/* Review Header */}
                    <button
                      onClick={() => setExpandedReviewId(isExpanded ? null : review.id)}
                      className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <ClipboardCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold text-slate-800">
                            {review.reviewPeriod}
                          </h3>
                          <StatusBadge variant={statusCfg.variant} dot size="sm">
                            {statusCfg.label}
                          </StatusBadge>
                          <StatusBadge variant="outline" size="xs">
                            {reviewTypeLabels[review.reviewType]}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Reviewer: {review.managerName}
                          {review.completedAt && ` | Completed ${formatDate(review.completedAt)}`}
                        </p>
                      </div>

                      {review.status === 'COMPLETED' && review.managerAssessment && (
                        <div className="text-right mr-2">
                          <StarRating rating={review.managerAssessment.rating} size="sm" />
                          <p className="text-xs text-slate-400 mt-0.5">
                            {PERFORMANCE_RATINGS.find((r) => r.value === review.managerAssessment!.rating)?.label}
                          </p>
                        </div>
                      )}

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </button>

                    {/* Expanded Review Detail */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 animate-fade-in">
                        {/* Self Assessment */}
                        <div className="p-5 border-b border-slate-100">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-slate-400" />
                            <h4 className="font-display font-semibold text-slate-700 text-sm">
                              Self Assessment
                            </h4>
                            {review.selfAssessment && (
                              <StarRating rating={review.selfAssessment.rating} size="sm" />
                            )}
                          </div>

                          {review.selfAssessment ? (
                            <div className="grid gap-3">
                              <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                                  Strengths
                                </p>
                                <p className="text-sm text-slate-700">{review.selfAssessment.strengths}</p>
                              </div>
                              <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
                                  Areas for Improvement
                                </p>
                                <p className="text-sm text-slate-700">{review.selfAssessment.improvements}</p>
                              </div>
                              <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                                  Goals for Next Period
                                </p>
                                <p className="text-sm text-slate-700">{review.selfAssessment.goals}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 rounded-lg p-4 text-center">
                              <p className="text-sm text-slate-500">Self assessment not yet submitted.</p>
                            </div>
                          )}

                          {review.status === 'SELF_REVIEW' && (
                            <Button
                              onClick={() => handleSelfAssessmentOpen(review)}
                              className="mt-3 bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                              size="sm"
                            >
                              <Send className="w-3.5 h-3.5 mr-1.5" />
                              Complete Self Assessment
                            </Button>
                          )}
                        </div>

                        {/* Manager Assessment */}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-slate-400" />
                            <h4 className="font-display font-semibold text-slate-700 text-sm">
                              Manager Assessment
                            </h4>
                            {review.managerAssessment && (
                              <StarRating rating={review.managerAssessment.rating} size="sm" />
                            )}
                          </div>

                          {review.managerAssessment ? (
                            <div className="grid gap-3">
                              <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                                  Strengths
                                </p>
                                <p className="text-sm text-slate-700">{review.managerAssessment.strengths}</p>
                              </div>
                              <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
                                  Areas for Improvement
                                </p>
                                <p className="text-sm text-slate-700">{review.managerAssessment.improvements}</p>
                              </div>
                              <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                                  Goals for Next Period
                                </p>
                                <p className="text-sm text-slate-700">{review.managerAssessment.goals}</p>
                              </div>
                              <div className="bg-violet-50/50 rounded-lg p-3 border border-violet-100">
                                <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">
                                  Overall Comments
                                </p>
                                <p className="text-sm text-slate-700">{review.managerAssessment.overallComments}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 rounded-lg p-4 text-center">
                              <p className="text-sm text-slate-500">
                                {review.status === 'MANAGER_REVIEW'
                                  ? 'Pending manager review.'
                                  : 'Manager assessment will be available after self review.'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Pending Actions Tab (Manager) */}
        {isManager && (
          <TabsContent value="pending" className="mt-4">
            {pendingReviews.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="All caught up!"
                description="You don't have any pending review actions at the moment."
              />
            ) : (
              <div className="space-y-4">
                {pendingReviews.map((review, idx) => {
                  const statusCfg = reviewStatusConfig[review.status]
                  const canReview = review.status === 'MANAGER_REVIEW'

                  return (
                    <div
                      key={review.id}
                      className={`bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all animate-fade-up stagger-${Math.min(idx + 1, 5)}`}
                    >
                      <div className="flex items-center gap-4">
                        <EmployeeAvatar name={review.employeeName} size="md" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-semibold text-slate-800">
                              {review.employeeName}
                            </h3>
                            <StatusBadge variant={statusCfg.variant} dot size="sm">
                              {statusCfg.label}
                            </StatusBadge>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {review.reviewPeriod} &middot; {reviewTypeLabels[review.reviewType]}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Submitted {formatDate(review.submittedAt)}
                          </p>
                        </div>

                        {/* Self rating preview */}
                        {review.selfAssessment && (
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-slate-400 mb-0.5">Self Rating</p>
                            <StarRating rating={review.selfAssessment.rating} size="sm" />
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {canReview ? (
                            <Button
                              onClick={() => handleManagerReviewOpen(review)}
                              size="sm"
                              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
                              Review
                            </Button>
                          ) : (
                            <StatusBadge variant="pending" size="sm">
                              <Clock className="w-3 h-3" />
                              Awaiting Self Review
                            </StatusBadge>
                          )}
                        </div>
                      </div>

                      {/* Quick peek at self assessment for MANAGER_REVIEW */}
                      {canReview && review.selfAssessment && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Employee's Self Assessment
                          </p>
                          <div className="grid sm:grid-cols-3 gap-2">
                            <div className="bg-emerald-50/50 rounded-lg p-2.5 border border-emerald-100">
                              <p className="text-xs font-bold text-emerald-600 mb-0.5">Strengths</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{review.selfAssessment.strengths}</p>
                            </div>
                            <div className="bg-amber-50/50 rounded-lg p-2.5 border border-amber-100">
                              <p className="text-xs font-bold text-amber-600 mb-0.5">Improvements</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{review.selfAssessment.improvements}</p>
                            </div>
                            <div className="bg-blue-50/50 rounded-lg p-2.5 border border-blue-100">
                              <p className="text-xs font-bold text-blue-600 mb-0.5">Goals</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{review.selfAssessment.goals}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Self Assessment Dialog */}
      <Dialog open={selfAssessmentOpen} onOpenChange={setSelfAssessmentOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Complete Self Assessment</DialogTitle>
            <DialogDescription>
              {selectedReview?.reviewPeriod} - Rate your performance and provide comments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <StarRatingInput value={selfRating} onChange={setSelfRating} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="self-strengths">Strengths</Label>
              <Textarea
                id="self-strengths"
                value={selfStrengths}
                onChange={(e) => setSelfStrengths(e.target.value)}
                placeholder="What did you do well this period?"
                rows={3}
                className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="self-improvements">Areas for Improvement</Label>
              <Textarea
                id="self-improvements"
                value={selfImprovements}
                onChange={(e) => setSelfImprovements(e.target.value)}
                placeholder="What could you improve on?"
                rows={3}
                className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="self-goals">Goals for Next Period</Label>
              <Textarea
                id="self-goals"
                value={selfGoals}
                onChange={(e) => setSelfGoals(e.target.value)}
                placeholder="What do you plan to achieve next?"
                rows={3}
                className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelfAssessmentOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSelfAssessmentSubmit}
              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
            >
              <Send className="w-4 h-4 mr-1.5" />
              Submit Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager Review Dialog */}
      <Dialog open={managerReviewOpen} onOpenChange={setManagerReviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Review: {selectedReview?.employeeName}
            </DialogTitle>
            <DialogDescription>
              {selectedReview?.reviewPeriod} &middot; {selectedReview ? reviewTypeLabels[selectedReview.reviewType] : ''}
            </DialogDescription>
          </DialogHeader>

          {/* Employee's Self Assessment Preview */}
          {selectedReview?.selfAssessment && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-700">Employee's Self Assessment</h4>
                <StarRating rating={selectedReview.selfAssessment.rating} size="sm" />
              </div>
              <div className="grid gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-0.5">Strengths</p>
                  <p className="text-sm text-slate-700">{selectedReview.selfAssessment.strengths}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-0.5">Areas for Improvement</p>
                  <p className="text-sm text-slate-700">{selectedReview.selfAssessment.improvements}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-0.5">Goals</p>
                  <p className="text-sm text-slate-700">{selectedReview.selfAssessment.goals}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Your Manager Assessment
            </p>

            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <StarRatingInput value={mgrRating} onChange={setMgrRating} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mgr-strengths">Strengths</Label>
              <Textarea
                id="mgr-strengths"
                value={mgrStrengths}
                onChange={(e) => setMgrStrengths(e.target.value)}
                placeholder="What did this employee do well?"
                rows={3}
                className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mgr-improvements">Areas for Improvement</Label>
              <Textarea
                id="mgr-improvements"
                value={mgrImprovements}
                onChange={(e) => setMgrImprovements(e.target.value)}
                placeholder="Where can this employee improve?"
                rows={3}
                className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mgr-goals">Goals for Next Period</Label>
              <Textarea
                id="mgr-goals"
                value={mgrGoals}
                onChange={(e) => setMgrGoals(e.target.value)}
                placeholder="What should this employee focus on?"
                rows={3}
                className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mgr-comments">Overall Comments</Label>
              <Textarea
                id="mgr-comments"
                value={mgrComments}
                onChange={(e) => setMgrComments(e.target.value)}
                placeholder="Summarize your overall assessment..."
                rows={3}
                className="focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManagerReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleManagerReviewSubmit}
              className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
