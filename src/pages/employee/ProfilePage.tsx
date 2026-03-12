import { useEffect } from 'react'
import { Link } from 'react-router'
import {
  Building2,
  Users,
  MapPin,
  CalendarDays,
  Mail,
  Phone,
  Cake,
  User,
  Droplets,
  AlertCircle,
  Briefcase,
  Clock,
  CheckCircle,
  CreditCard,
  Landmark,
  Shield,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useEmployeeStore } from '@/stores/employeeStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EMPLOYEE_STATUS_CONFIG } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import type { Employee, EmployeeStatus } from '@/types/employee'

function getStatusVariant(status: EmployeeStatus) {
  const map: Record<EmployeeStatus, 'success' | 'warning' | 'default' | 'danger'> = {
    ACTIVE: 'success',
    ON_NOTICE: 'warning',
    INACTIVE: 'default',
    TERMINATED: 'danger',
  }
  return map[status]
}

function InfoField({ label, value, icon: Icon }: { label: string; value?: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-700">{value || '-'}</p>
      </div>
    </div>
  )
}

function QuickInfoCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
  delay: number
}) {
  return (
    <div
      className="animate-fade-up bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} ring-4 ring-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="mt-0.5 font-display text-sm font-semibold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

function PersonalInfoTab({ employee }: { employee: Employee }) {
  return (
    <div className="animate-fade-up bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-display font-semibold text-slate-800 mb-5">Personal Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField icon={Mail} label="Email Address" value={employee.email} />
        <InfoField icon={Phone} label="Phone Number" value={employee.phone} />
        <InfoField icon={Cake} label="Date of Birth" value={employee.dateOfBirth ? formatDate(employee.dateOfBirth) : undefined} />
        <InfoField icon={User} label="Gender" value={employee.gender} />
        <InfoField icon={Droplets} label="Blood Group" value={employee.bloodGroup} />
      </div>
      {employee.emergencyContact && (
        <>
          <div className="my-6 border-t border-slate-100" />
          <h3 className="font-display font-semibold text-slate-800 mb-5">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoField icon={AlertCircle} label="Contact Name" value={employee.emergencyContact.name} />
            <InfoField icon={Users} label="Relationship" value={employee.emergencyContact.relationship} />
            <InfoField icon={Phone} label="Phone" value={employee.emergencyContact.phone} />
          </div>
        </>
      )}
    </div>
  )
}

function EmploymentTab({ employee }: { employee: Employee }) {
  return (
    <div className="animate-fade-up bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-display font-semibold text-slate-800 mb-5">Employment Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField icon={Briefcase} label="Employment Type" value={employee.employmentType} />
        <InfoField icon={Clock} label="Shift Type" value={employee.shiftType} />
        <InfoField icon={CheckCircle} label="Leave Eligibility" value={employee.leaveEligibility} />
        <InfoField icon={MapPin} label="Work Location" value={employee.workLocation} />
        <InfoField icon={CalendarDays} label="Date of Joining" value={formatDate(employee.dateOfJoining)} />
        <InfoField icon={Users} label="Reporting Manager" value={employee.reportingManagerName || 'None'} />
      </div>
      {(employee.pfNumber || employee.esiNumber) && (
        <>
          <div className="my-6 border-t border-slate-100" />
          <h3 className="font-display font-semibold text-slate-800 mb-5">Statutory Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoField icon={Shield} label="PF Number" value={employee.pfNumber} />
            <InfoField icon={Shield} label="ESI Number" value={employee.esiNumber || 'N/A'} />
          </div>
        </>
      )}
    </div>
  )
}

function BankIdentityTab({ employee }: { employee: Employee }) {
  return (
    <div className="animate-fade-up bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-display font-semibold text-slate-800 mb-5">Bank Details</h3>
      {employee.bankDetails ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField icon={Landmark} label="Bank Name" value={employee.bankDetails.bankName} />
          <InfoField icon={CreditCard} label="Account Number" value={employee.bankDetails.accountNumber} />
          <InfoField icon={Landmark} label="IFSC Code" value={employee.bankDetails.ifscCode} />
        </div>
      ) : (
        <p className="text-sm text-slate-500">No bank details available.</p>
      )}

      <div className="my-6 border-t border-slate-100" />
      <h3 className="font-display font-semibold text-slate-800 mb-5">Identity Documents</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField icon={Shield} label="PAN Number" value={employee.panNumber || '-'} />
        <InfoField icon={Shield} label="Aadhaar Number" value={employee.aadhaarNumber || '-'} />
      </div>
    </div>
  )
}

function DocumentsTab({ employee }: { employee: Employee }) {
  return (
    <div className="animate-fade-up bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-slate-800">My Documents</h3>
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          View All <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="space-y-3">
        {[
          { name: 'PAN Card', status: 'VERIFIED' as const },
          { name: 'Aadhaar Card', status: 'VERIFIED' as const },
          { name: 'Offer Letter', status: 'VERIFIED' as const },
          { name: 'Educational Certificates', status: 'PENDING' as const },
        ].map((doc, idx) => (
          <div
            key={doc.name}
            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 animate-fade-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200">
                <FileText className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{doc.name}</p>
                <p className="text-xs text-slate-400">
                  {employee.employeeId}
                </p>
              </div>
            </div>
            <StatusBadge
              variant={doc.status === 'VERIFIED' ? 'success' : doc.status === 'PENDING' ? 'pending' : 'danger'}
              dot
              size="sm"
            >
              {doc.status === 'VERIFIED' ? 'Verified' : doc.status === 'PENDING' ? 'Pending' : 'Rejected'}
            </StatusBadge>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { selectedEmployee, isLoading, fetchEmployeeById } = useEmployeeStore()

  useEffect(() => {
    if (user?.id) {
      fetchEmployeeById(user.id)
    }
  }, [user?.id, fetchEmployeeById])

  const employee = selectedEmployee

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Profile"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'My Profile' },
        ]}
      />

      {isLoading || !employee ? (
        <ProfileSkeleton />
      ) : (
        <>
          {/* Profile Hero */}
          <div className="animate-fade-up bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <EmployeeAvatar name={employee.fullName} src={employee.avatar} size="xl" status="online" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-slate-900">{employee.fullName}</h2>
                  <StatusBadge variant={getStatusVariant(employee.status)} dot size="md">
                    {EMPLOYEE_STATUS_CONFIG[employee.status].label}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{employee.designation}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge variant="teal" size="sm">
                    {employee.department}
                  </StatusBadge>
                  <StatusBadge variant="outline" size="sm">
                    {employee.employeeId}
                  </StatusBadge>
                  <StatusBadge variant="info" size="sm">
                    {employee.employmentType}
                  </StatusBadge>
                </div>
              </div>
              <div className="hidden lg:flex flex-col items-end gap-1 text-right">
                <p className="text-xs text-slate-400">Member since</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(employee.dateOfJoining)}</p>
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickInfoCard
              icon={Building2}
              label="Department"
              value={employee.department}
              color="bg-teal-50 text-teal-600"
              delay={0}
            />
            <QuickInfoCard
              icon={Users}
              label="Reports To"
              value={employee.reportingManagerName || 'None'}
              color="bg-blue-50 text-blue-600"
              delay={50}
            />
            <QuickInfoCard
              icon={MapPin}
              label="Location"
              value={employee.workLocation}
              color="bg-violet-50 text-violet-600"
              delay={100}
            />
            <QuickInfoCard
              icon={CalendarDays}
              label="Join Date"
              value={formatDate(employee.dateOfJoining)}
              color="bg-amber-50 text-amber-600"
              delay={150}
            />
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="personal">
            <TabsList variant="line" className="mb-4">
              <TabsTrigger value="personal" className="gap-1.5">
                <User className="h-4 w-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="employment" className="gap-1.5">
                <Briefcase className="h-4 w-4" />
                Employment
              </TabsTrigger>
              <TabsTrigger value="bank" className="gap-1.5">
                <CreditCard className="h-4 w-4" />
                Bank & Identity
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-1.5">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoTab employee={employee} />
            </TabsContent>
            <TabsContent value="employment">
              <EmploymentTab employee={employee} />
            </TabsContent>
            <TabsContent value="bank">
              <BankIdentityTab employee={employee} />
            </TabsContent>
            <TabsContent value="documents">
              <DocumentsTab employee={employee} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
