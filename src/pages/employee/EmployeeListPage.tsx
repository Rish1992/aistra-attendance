import { useEffect, useState, useMemo } from 'react'
import {
  UserPlus,
  Eye,
  Pencil,
  UserX,
  Users,
  MapPin,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEmployeeStore } from '@/stores/employeeStore'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { DataTable } from '@/components/shared/DataTable'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEPARTMENTS, EMPLOYEE_STATUS_CONFIG, EMPLOYMENT_TYPES, WORK_LOCATIONS, SHIFT_TYPES } from '@/lib/constants'
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

const DESIGNATIONS = [
  'CEO & Founder',
  'HR Manager',
  'HR Executive',
  'Engineering Lead',
  'Senior Developer',
  'Backend Developer',
  'Frontend Developer',
  'DevOps Engineer',
  'QA Engineer',
  'Product Lead',
  'Product Manager',
  'Product Analyst',
  'Product Designer',
  'UI/UX Designer',
  'Junior Designer',
  'Sales Manager',
  'Account Executive',
  'Business Development Executive',
  'Finance Manager',
  'Marketing Executive',
] as const

const addEmployeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  workLocation: z.string().min(1, 'Work location is required'),
  shiftType: z.string().min(1, 'Shift type is required'),
  reportingManagerId: z.string().min(1, 'Reporting manager is required'),
  panNumber: z.string().optional(),
  aadhaarNumber: z.string().optional(),
})

type AddEmployeeForm = z.infer<typeof addEmployeeSchema>

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function EmployeeListPage() {
  const {
    employees,
    isLoading,
    searchQuery,
    filters,
    fetchEmployees,
    setSearchQuery,
    setFilters,
    getFilteredEmployees,
  } = useEmployeeStore()

  const user = useAuthStore((s) => s.user)

  const [activeTab, setActiveTab] = useState('all')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const filteredEmployees = getFilteredEmployees()

  const tabFilteredEmployees = useMemo(() => {
    if (activeTab === 'all') return filteredEmployees
    const statusMap: Record<string, EmployeeStatus> = {
      active: 'ACTIVE',
      on_notice: 'ON_NOTICE',
      inactive: 'INACTIVE',
    }
    const status = statusMap[activeTab]
    return filteredEmployees.filter((e) => e.status === status)
  }, [filteredEmployees, activeTab])

  const statusCounts = useMemo(() => {
    return {
      all: filteredEmployees.length,
      active: filteredEmployees.filter((e) => e.status === 'ACTIVE').length,
      on_notice: filteredEmployees.filter((e) => e.status === 'ON_NOTICE').length,
      inactive: filteredEmployees.filter((e) => e.status === 'INACTIVE').length,
    }
  }, [filteredEmployees])

  const activeManagers = useMemo(() => {
    return employees.filter((e) => e.status === 'ACTIVE')
  }, [employees])

  const departmentOptions = [
    { label: 'All Departments', value: 'all' },
    ...DEPARTMENTS.map((d) => ({ label: d, value: d })),
  ]

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddEmployeeForm>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      employmentType: '',
      workLocation: '',
      shiftType: '',
      reportingManagerId: '',
      panNumber: '',
      aadhaarNumber: '',
    },
  })

  const watchedDept = watch('department')
  const watchedDesignation = watch('designation')
  const watchedEmploymentType = watch('employmentType')
  const watchedLocation = watch('workLocation')
  const watchedShift = watch('shiftType')
  const watchedManager = watch('reportingManagerId')

  const onAddEmployee = async (data: AddEmployeeForm) => {
    // Mock adding employee
    const newId = `usr-${String(employees.length + 1).padStart(3, '0')}`
    const newEmpId = `AST-${String(employees.length + 1).padStart(4, '0')}`
    const manager = employees.find((e) => e.id === data.reportingManagerId)

    const _newEmployee: Employee = {
      id: newId,
      employeeId: newEmpId,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      department: data.department,
      designation: data.designation,
      reportingManagerId: data.reportingManagerId,
      reportingManagerName: manager?.fullName || '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      employmentType: data.employmentType as Employee['employmentType'],
      workLocation: data.workLocation,
      shiftType: data.shiftType,
      leaveEligibility: 'Probation',
      status: 'ACTIVE',
      panNumber: data.panNumber,
      aadhaarNumber: data.aadhaarNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In real app, this would call an API. For now, refetch
    await new Promise((r) => setTimeout(r, 500))
    setAddDialogOpen(false)
    reset()
    fetchEmployees()
  }

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditDialogOpen(true)
  }

  const handleDeactivate = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeactivateDialogOpen(true)
  }

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setViewDialogOpen(true)
  }

  const confirmDeactivate = async () => {
    // Mock deactivation
    await new Promise((r) => setTimeout(r, 300))
    setDeactivateDialogOpen(false)
    setSelectedEmployee(null)
    fetchEmployees()
  }

  const tableColumns = [
    {
      key: 'employee',
      label: 'Employee',
      width: '280px',
      render: (item: Employee) => (
        <div className="flex items-center gap-3">
          <EmployeeAvatar
            name={item.fullName}
            src={item.avatar}
            size="sm"
            status={item.status === 'ACTIVE' ? 'online' : 'offline'}
          />
          <div>
            <p className="font-medium text-slate-800">{item.fullName}</p>
            <p className="text-xs text-slate-400">{item.employeeId} &middot; {item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (item: Employee) => (
        <StatusBadge variant="teal" size="sm">
          {item.department}
        </StatusBadge>
      ),
    },
    {
      key: 'designation',
      label: 'Designation',
      render: (item: Employee) => (
        <span className="text-slate-600">{item.designation}</span>
      ),
    },
    {
      key: 'reportingManagerName',
      label: 'Manager',
      sortable: true,
      render: (item: Employee) => (
        <span className="text-slate-600">{item.reportingManagerName || '-'}</span>
      ),
    },
    {
      key: 'dateOfJoining',
      label: 'Join Date',
      sortable: true,
      render: (item: Employee) => (
        <span className="text-slate-600">{formatDate(item.dateOfJoining)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: Employee) => (
        <StatusBadge variant={getStatusVariant(item.status)} dot size="sm">
          {EMPLOYEE_STATUS_CONFIG[item.status].label}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '120px',
      render: (item: Employee) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleView(item)
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(item)
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {item.status === 'ACTIVE' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeactivate(item)
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Deactivate"
            >
              <UserX className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  const inputClassName =
    'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all'

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Employee Management"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Admin', href: '/admin/employees' },
          { label: 'Employees' },
        ]}
        actions={
          <button
            onClick={() => {
              reset()
              setAddDialogOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-teal-600 hover:to-teal-700 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </button>
        }
      />

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="all" className="gap-1.5">
            All
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-600">
              {statusCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-1.5">
            Active
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-50 px-1.5 text-[10px] font-semibold text-emerald-700">
              {statusCounts.active}
            </span>
          </TabsTrigger>
          <TabsTrigger value="on_notice" className="gap-1.5">
            On Notice
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-50 px-1.5 text-[10px] font-semibold text-amber-700">
              {statusCounts.on_notice}
            </span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="gap-1.5">
            Inactive
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-500">
              {statusCounts.inactive}
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <FilterBar
            searchPlaceholder="Search employees..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={[
              {
                key: 'department',
                label: 'Department',
                options: departmentOptions,
                value: filters.department || 'all',
                onChange: (val) => setFilters({ ...filters, department: val === 'all' ? undefined : val }),
              },
            ]}
          />
        </div>

        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{tabFilteredEmployees.length}</span> of{' '}
              <span className="font-medium text-slate-700">{employees.length}</span> employees
            </p>
          </div>

          {!isLoading && tabFilteredEmployees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No employees found"
              description="No employees match the current filters."
              action={
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilters({})
                    setActiveTab('all')
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Clear Filters
                </button>
              }
            />
          ) : (
            <TabsContent value={activeTab} className="mt-0">
              <DataTable
                columns={tableColumns}
                data={tabFilteredEmployees as unknown as Record<string, unknown>[]}
                isLoading={isLoading}
                emptyMessage="No employees found."
              />
            </TabsContent>
          )}
        </div>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-slate-800">
              Add New Employee
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new employee to the system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddEmployee)} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="First Name" error={errors.firstName?.message} required>
                  <input {...register('firstName')} className={inputClassName} placeholder="Enter first name" />
                </FormField>
                <FormField label="Last Name" error={errors.lastName?.message} required>
                  <input {...register('lastName')} className={inputClassName} placeholder="Enter last name" />
                </FormField>
                <FormField label="Email" error={errors.email?.message} required>
                  <input {...register('email')} type="email" className={inputClassName} placeholder="email@aistra.com" />
                </FormField>
                <FormField label="Phone" error={errors.phone?.message} required>
                  <input {...register('phone')} className={inputClassName} placeholder="+91-XXXXX-XXXXX" />
                </FormField>
                <FormField label="Department" error={errors.department?.message} required>
                  <Select value={watchedDept} onValueChange={(val) => setValue('department', val, { shouldValidate: true })}>
                    <SelectTrigger className="h-10 w-full border-slate-300 text-sm">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Designation" error={errors.designation?.message} required>
                  <Select value={watchedDesignation} onValueChange={(val) => setValue('designation', val, { shouldValidate: true })}>
                    <SelectTrigger className="h-10 w-full border-slate-300 text-sm">
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGNATIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            {/* Employment */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Employment Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Employment Type" error={errors.employmentType?.message} required>
                  <Select value={watchedEmploymentType} onValueChange={(val) => setValue('employmentType', val, { shouldValidate: true })}>
                    <SelectTrigger className="h-10 w-full border-slate-300 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Work Location" error={errors.workLocation?.message} required>
                  <Select value={watchedLocation} onValueChange={(val) => setValue('workLocation', val, { shouldValidate: true })}>
                    <SelectTrigger className="h-10 w-full border-slate-300 text-sm">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_LOCATIONS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Shift Type" error={errors.shiftType?.message} required>
                  <Select value={watchedShift} onValueChange={(val) => setValue('shiftType', val, { shouldValidate: true })}>
                    <SelectTrigger className="h-10 w-full border-slate-300 text-sm">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIFT_TYPES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Reporting Manager" error={errors.reportingManagerId?.message} required>
                  <Select value={watchedManager} onValueChange={(val) => setValue('reportingManagerId', val, { shouldValidate: true })}>
                    <SelectTrigger className="h-10 w-full border-slate-300 text-sm">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeManagers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.fullName} ({m.designation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            {/* Identity */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Identity (Optional)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="PAN Number" error={errors.panNumber?.message}>
                  <input {...register('panNumber')} className={inputClassName} placeholder="ABCDE1234F" />
                </FormField>
                <FormField label="Aadhaar Number" error={errors.aadhaarNumber?.message}>
                  <input {...register('aadhaarNumber')} className={inputClassName} placeholder="XXXX-XXXX-XXXX" />
                </FormField>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => {
                  setAddDialogOpen(false)
                  reset()
                }}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Add Employee
                  </>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-slate-800">
              Edit Employee
            </DialogTitle>
            <DialogDescription>
              Update details for {selectedEmployee?.fullName}.
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <EmployeeAvatar name={selectedEmployee.fullName} size="md" />
                <div>
                  <p className="font-medium text-slate-800">{selectedEmployee.fullName}</p>
                  <p className="text-xs text-slate-500">{selectedEmployee.employeeId} &middot; {selectedEmployee.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Department">
                  <Select defaultValue={selectedEmployee.department}>
                    <SelectTrigger className="h-10 w-full border-slate-300 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Designation">
                  <Select defaultValue={selectedEmployee.designation}>
                    <SelectTrigger className="h-10 w-full border-slate-300 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGNATIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Work Location">
                  <Select defaultValue={selectedEmployee.workLocation}>
                    <SelectTrigger className="h-10 w-full border-slate-300 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_LOCATIONS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Reporting Manager">
                  <Select defaultValue={selectedEmployee.reportingManagerId || undefined}>
                    <SelectTrigger className="h-10 w-full border-slate-300 text-sm">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeManagers
                        .filter((m) => m.id !== selectedEmployee.id)
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setEditDialogOpen(false)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setEditDialogOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-teal-600 hover:to-teal-700 transition-all"
            >
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold text-slate-800">
              Employee Details
            </DialogTitle>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <EmployeeAvatar
                  name={selectedEmployee.fullName}
                  src={selectedEmployee.avatar}
                  size="lg"
                  status={selectedEmployee.status === 'ACTIVE' ? 'online' : 'offline'}
                />
                <div>
                  <h3 className="font-display font-semibold text-slate-800">{selectedEmployee.fullName}</h3>
                  <p className="text-sm text-slate-500">{selectedEmployee.designation}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <StatusBadge variant="teal" size="xs">{selectedEmployee.department}</StatusBadge>
                    <StatusBadge variant="outline" size="xs">{selectedEmployee.employeeId}</StatusBadge>
                    <StatusBadge variant={getStatusVariant(selectedEmployee.status)} dot size="xs">
                      {EMPLOYEE_STATUS_CONFIG[selectedEmployee.status].label}
                    </StatusBadge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="mt-0.5 text-sm text-slate-700">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="mt-0.5 text-sm text-slate-700">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Manager</p>
                  <p className="mt-0.5 text-sm text-slate-700">{selectedEmployee.reportingManagerName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Join Date</p>
                  <p className="mt-0.5 text-sm text-slate-700">{formatDate(selectedEmployee.dateOfJoining)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Location</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {selectedEmployee.workLocation}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Employment Type</p>
                  <p className="mt-0.5 text-sm text-slate-700">{selectedEmployee.employmentType}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirm Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <span className="font-medium text-slate-700">{selectedEmployee?.fullName}</span>?
              This will revoke their access to the system. This action can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEmployee(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeactivate}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
