import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, eachDayOfInterval, isWeekend, differenceInCalendarDays } from 'date-fns'
import {
  CalendarDays,
  ChevronRight,
  Upload,
  Clock,
  FileText,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useLeaveStore } from '@/stores/leaveStore'
import { useHolidayStore } from '@/stores/holidayStore'
import { useAuthStore } from '@/stores/authStore'
import { LEAVE_TYPE_CONFIG } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { LeaveType, HalfDayPeriod } from '@/types/leave'

const leaveSchema = z
  .object({
    leaveType: z.enum(['EL', 'PL', 'WFH', 'OH'] as const, {
      required_error: 'Please select a leave type',
    }),
    startDate: z.date({ required_error: 'Start date is required' }),
    endDate: z.date({ required_error: 'End date is required' }),
    isHalfDay: z.boolean(),
    halfDayPeriod: z.enum(['FIRST_HALF', 'SECOND_HALF'] as const).optional(),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    attachment: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.isHalfDay && !data.halfDayPeriod) return false
      return true
    },
    { message: 'Select half-day period', path: ['halfDayPeriod'] }
  )

type LeaveFormData = z.infer<typeof leaveSchema>

const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  EL: 'teal',
  PL: 'blue',
  WFH: 'violet',
  OH: 'amber',
}

export function ApplyLeavePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { balances, isLoading, applyLeave, fetchBalances } = useLeaveStore()
  const { holidays, fetchHolidays } = useHolidayStore()
  const [submitting, setSubmitting] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  useEffect(() => {
    if (user?.employeeId) {
      fetchBalances(user.employeeId)
      fetchHolidays(new Date().getFullYear())
    }
  }, [user?.employeeId, fetchBalances, fetchHolidays])

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      isHalfDay: false,
    },
  })

  const watchedType = watch('leaveType')
  const watchedStart = watch('startDate')
  const watchedEnd = watch('endDate')
  const watchedHalfDay = watch('isHalfDay')
  const watchedHalfDayPeriod = watch('halfDayPeriod')

  const holidayDates = useMemo(
    () => new Set(holidays.map((h) => h.date)),
    [holidays]
  )

  const calculatedDuration = useMemo(() => {
    if (watchedHalfDay) return 0.5
    if (!watchedStart || !watchedEnd) return 0
    if (watchedEnd < watchedStart) return 0
    const days = eachDayOfInterval({ start: watchedStart, end: watchedEnd })
    return days.filter(
      (d) => !isWeekend(d) && !holidayDates.has(format(d, 'yyyy-MM-dd'))
    ).length
  }, [watchedStart, watchedEnd, watchedHalfDay, holidayDates])

  const selectedBalance = useMemo(
    () => balances.find((b) => b.type === watchedType),
    [balances, watchedType]
  )

  const requiresAttachment =
    watchedType === 'PL' && calculatedDuration > 3

  const onSubmit = async (data: LeaveFormData) => {
    if (!user) return
    setSubmitting(true)
    try {
      await applyLeave({
        employeeId: user.employeeId,
        employeeName: user.fullName,
        leaveType: data.leaveType,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        durationDays: calculatedDuration,
        isHalfDay: data.isHalfDay,
        halfDayPeriod: data.isHalfDay ? data.halfDayPeriod : undefined,
        reason: data.reason,
        attachment: data.attachment,
        approverId: user.managerId ?? user.id,
        approverName: user.managerId ? 'Manager' : user.fullName,
      })
      toast.success('Leave application submitted successfully')
      navigate('/leave/status')
    } catch {
      toast.error('Failed to submit leave application')
    } finally {
      setSubmitting(false)
    }
  }

  const balanceAfter =
    selectedBalance && calculatedDuration > 0
      ? selectedBalance.remaining - calculatedDuration
      : null

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Apply for Leave"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Leave', href: '/leave/status' },
          { label: 'Apply' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        {/* Main Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 animate-fade-up">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Leave Type
            </Label>
            <Controller
              name="leaveType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-10 bg-white border-slate-300">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(LEAVE_TYPE_CONFIG) as LeaveType[]).map(
                      (type) => {
                        const config = LEAVE_TYPE_CONFIG[type]
                        const balance = balances.find(
                          (b) => b.type === type
                        )
                        const remaining = balance?.remaining ?? 0
                        return (
                          <SelectItem
                            key={type}
                            value={type}
                            disabled={remaining === 0}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  type === 'EL' && 'bg-teal-500',
                                  type === 'PL' && 'bg-blue-500',
                                  type === 'WFH' && 'bg-violet-500',
                                  type === 'OH' && 'bg-amber-500'
                                )}
                              />
                              <span>{config.label}</span>
                              <span className="text-slate-400 ml-1">
                                — {remaining} remaining
                              </span>
                            </div>
                          </SelectItem>
                        )
                      }
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.leaveType && (
              <p className="text-xs text-red-500">
                {errors.leaveType.message}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Start Date
              </Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full h-10 justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4 text-slate-400" />
                        {field.value
                          ? formatDate(field.value)
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          const end = watch('endDate')
                          if (date && (!end || end < date)) {
                            setValue('endDate', date)
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.startDate && (
                <p className="text-xs text-red-500">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                End Date
              </Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full h-10 justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4 text-slate-400" />
                        {field.value
                          ? formatDate(field.value)
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date <
                          (watchedStart ??
                            new Date(new Date().setHours(0, 0, 0, 0)))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.endDate && (
                <p className="text-xs text-red-500">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {calculatedDuration > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Duration:</span>
              <span className="text-sm font-semibold text-slate-800">
                {calculatedDuration} {calculatedDuration === 1 ? 'day' : 'days'}
              </span>
              <span className="text-xs text-slate-400">
                (excluding weekends & holidays)
              </span>
            </div>
          )}

          {/* Half-Day Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-700">
                Half Day
              </Label>
              <Controller
                name="isHalfDay"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      if (checked && watchedStart) {
                        setValue('endDate', watchedStart)
                      }
                    }}
                  />
                )}
              />
            </div>

            {watchedHalfDay && (
              <Controller
                name="halfDayPeriod"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="FIRST_HALF" id="first-half" />
                      <Label
                        htmlFor="first-half"
                        className="text-sm text-slate-600 cursor-pointer"
                      >
                        First Half (Morning)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="SECOND_HALF" id="second-half" />
                      <Label
                        htmlFor="second-half"
                        className="text-sm text-slate-600 cursor-pointer"
                      >
                        Second Half (Afternoon)
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            )}
            {errors.halfDayPeriod && (
              <p className="text-xs text-red-500">
                {errors.halfDayPeriod.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Reason
            </Label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Please provide a reason for your leave request (minimum 10 characters)..."
                  className="min-h-[100px] bg-white border-slate-300 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500"
                />
              )}
            />
            {errors.reason && (
              <p className="text-xs text-red-500">{errors.reason.message}</p>
            )}
          </div>

          {/* Attachment Upload Zone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Attachment
              {requiresAttachment && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-teal-400 hover:bg-teal-50/30',
                fileName ? 'border-teal-300 bg-teal-50/20' : 'border-slate-300'
              )}
              onClick={() => {
                setFileName('medical_certificate.pdf')
                setValue('attachment', 'medical_certificate.pdf')
              }}
            >
              {fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium text-teal-700">
                    {fileName}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:text-red-500 ml-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFileName(null)
                      setValue('attachment', undefined)
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF, PNG, JPG up to 5MB
                  </p>
                </>
              )}
            </div>
            {requiresAttachment && (
              <p className="text-xs text-amber-600">
                Attachment is required for Paid Leave exceeding 3 days
              </p>
            )}
          </div>
        </div>

        {/* Review Summary */}
        {watchedType && watchedStart && watchedEnd && calculatedDuration > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 animate-fade-up stagger-1">
            <h3 className="font-display font-semibold text-slate-800 mb-4">
              Review Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Leave Type
                </p>
                <StatusBadge
                  variant={
                    LEAVE_TYPE_COLORS[watchedType] as
                      | 'teal'
                      | 'blue'
                      | 'violet'
                  }
                  dot
                >
                  {LEAVE_TYPE_CONFIG[watchedType].label}
                </StatusBadge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Duration
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {calculatedDuration} {calculatedDuration === 1 ? 'day' : 'days'}
                  {watchedHalfDay &&
                    watchedHalfDayPeriod &&
                    ` (${watchedHalfDayPeriod === 'FIRST_HALF' ? 'First Half' : 'Second Half'})`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Dates
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(watchedStart)}
                  {watchedStart.getTime() !== watchedEnd.getTime() && (
                    <>
                      <ArrowRight className="inline w-3 h-3 mx-1 text-slate-400" />
                      {formatDate(watchedEnd)}
                    </>
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Balance
                </p>
                {selectedBalance && (
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">
                      {selectedBalance.remaining}
                    </span>
                    <ArrowRight className="inline w-3 h-3 mx-1 text-slate-400" />
                    <span
                      className={cn(
                        'font-semibold',
                        balanceAfter !== null && balanceAfter < 0
                          ? 'text-red-500'
                          : 'text-emerald-600'
                      )}
                    >
                      {balanceAfter}
                    </span>
                    <span className="text-slate-400 ml-1">remaining</span>
                  </p>
                )}
              </div>
            </div>
            {balanceAfter !== null && balanceAfter < 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-red-600 font-medium">
                  Insufficient leave balance. You are exceeding your available
                  balance by {Math.abs(balanceAfter)} days.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="bg-white text-slate-700 border border-slate-300 shadow-sm"
            onClick={() => navigate('/leave/status')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              submitting ||
              isLoading ||
              (balanceAfter !== null && balanceAfter < 0)
            }
            className="bg-gradient-to-b from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
