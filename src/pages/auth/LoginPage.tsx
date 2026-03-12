import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserCog,
  Users,
  User,
} from 'lucide-react'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const DEMO_ACCOUNTS = [
  {
    label: 'Super Admin',
    email: 'admin@aistra.com',
    icon: ShieldCheck,
    color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
  },
  {
    label: 'HR Admin',
    email: 'hr@aistra.com',
    icon: UserCog,
    color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
  },
  {
    label: 'Manager',
    email: 'manager@aistra.com',
    icon: Users,
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  {
    label: 'Employee',
    email: 'employee@aistra.com',
    icon: User,
    color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    clearError()
    await login(data.email, data.password)
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }

  const fillDemoCredentials = (email: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', 'password', { shouldValidate: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-80 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 size-80 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
              <Zap className="size-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-navy-900">
              Aistra<span className="text-teal-500">HR</span>
            </h1>
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to your HRMS account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@aistra.com"
                  className={cn(
                    'h-10 rounded-lg border-slate-300 bg-white pl-10 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20',
                    errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  )}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={cn(
                    'h-10 rounded-lg border-slate-300 bg-white pl-10 pr-10 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20',
                    errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  )}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm text-slate-600"
                >
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 text-sm font-semibold text-white shadow-md shadow-teal-500/25 transition-all hover:from-teal-600 hover:to-teal-700 hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
            Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => fillDemoCredentials(account.email)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                  account.color
                )}
              >
                <account.icon className="size-4 shrink-0" />
                <span className="truncate">{account.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Password for all accounts:{' '}
            <span className="font-mono font-medium text-slate-500">password</span>
          </p>
        </div>
      </div>
    </div>
  )
}
