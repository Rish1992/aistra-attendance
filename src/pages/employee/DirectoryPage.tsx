import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  LayoutGrid,
  List,
  Mail,
  Phone,
  Eye,
  Download,
  UserPlus,
  Users,
  MapPin,
} from 'lucide-react'
import { useEmployeeStore } from '@/stores/employeeStore'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterBar } from '@/components/shared/FilterBar'
import { DataTable } from '@/components/shared/DataTable'
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { DEPARTMENTS, EMPLOYEE_STATUS_CONFIG } from '@/lib/constants'
import type { Employee, EmployeeStatus } from '@/types/employee'

type ViewMode = 'grid' | 'list'

function getStatusVariant(status: EmployeeStatus) {
  const map: Record<EmployeeStatus, 'success' | 'warning' | 'default' | 'danger'> = {
    ACTIVE: 'success',
    ON_NOTICE: 'warning',
    INACTIVE: 'default',
    TERMINATED: 'danger',
  }
  return map[status]
}

function EmployeeCard({ employee, index, onClick }: { employee: Employee; index: number; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="animate-fade-up bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all cursor-pointer group"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex flex-col items-center text-center">
        <EmployeeAvatar
          name={employee.fullName}
          src={employee.avatar}
          size="lg"
          status={employee.status === 'ACTIVE' ? 'online' : 'offline'}
        />
        <h3 className="mt-3 font-display font-medium text-slate-800 group-hover:text-teal-700 transition-colors">
          {employee.fullName}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{employee.designation}</p>
        <StatusBadge variant="teal" size="xs" className="mt-2">
          {employee.department}
        </StatusBadge>
      </div>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{employee.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{employee.workLocation}</span>
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        <StatusBadge variant={getStatusVariant(employee.status)} dot size="sm">
          {EMPLOYEE_STATUS_CONFIG[employee.status].label}
        </StatusBadge>
      </div>
    </div>
  )
}

export function DirectoryPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
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

  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const filteredEmployees = getFilteredEmployees()

  const locations = useMemo(() => {
    const locs = [...new Set(employees.map((e) => e.workLocation))].sort()
    return locs
  }, [employees])

  const isAdmin = user?.role === 'HR_ADMIN' || user?.role === 'SUPER_ADMIN'

  const departmentOptions = [
    { label: 'All Departments', value: 'all' },
    ...DEPARTMENTS.map((d) => ({ label: d, value: d })),
  ]

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    ...Object.entries(EMPLOYEE_STATUS_CONFIG).map(([key, val]) => ({
      label: val.label,
      value: key,
    })),
  ]

  const locationOptions = [
    { label: 'All Locations', value: 'all' },
    ...locations.map((l) => ({ label: l, value: l })),
  ]

  const handleViewProfile = (employee: Employee) => {
    navigate(`/profile`)
  }

  const tableColumns = [
    {
      key: 'employee',
      label: 'Employee',
      width: '260px',
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
            <p className="text-xs text-slate-400">{item.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (item: Employee) => (
        <span className="text-slate-600">{item.email}</span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
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
      key: 'workLocation',
      label: 'Location',
      sortable: true,
      render: (item: Employee) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {item.workLocation}
        </div>
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
      width: '60px',
      render: (item: Employee) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleViewProfile(item)
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Employee Directory"
        subtitle={`${filteredEmployees.length} of ${employees.length} employees`}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'People', href: '/directory' },
          { label: 'Directory' },
        ]}
        actions={
          isAdmin ? (
            <button
              onClick={() => navigate('/admin/employees')}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-teal-600 hover:to-teal-700 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </button>
          ) : undefined
        }
      />

      <FilterBar
        searchPlaceholder="Search by name, email, or ID..."
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
          {
            key: 'status',
            label: 'Status',
            options: statusOptions,
            value: filters.status || 'all',
            onChange: (val) => setFilters({ ...filters, status: val === 'all' ? undefined : val }),
          },
          {
            key: 'location',
            label: 'Location',
            options: locationOptions,
            value: filters.location || 'all',
            onChange: (val) => setFilters({ ...filters, location: val === 'all' ? undefined : val }),
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="flex items-center rounded-lg border border-slate-300 bg-white p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        }
      />

      {!isLoading && filteredEmployees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description="No employees match your current filters. Try adjusting your search or filter criteria."
          action={
            <button
              onClick={() => {
                setSearchQuery('')
                setFilters({})
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Clear Filters
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 animate-pulse" />
                    <div className="mt-3 h-4 w-24 rounded bg-slate-100 animate-pulse" />
                    <div className="mt-1 h-3 w-20 rounded bg-slate-100 animate-pulse" />
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ))
            : filteredEmployees.map((emp, idx) => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  index={idx}
                  onClick={() => handleViewProfile(emp)}
                />
              ))}
        </div>
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredEmployees as unknown as Record<string, unknown>[]}
          isLoading={isLoading}
          onRowClick={(item) => handleViewProfile(item as unknown as Employee)}
          emptyMessage="No employees found matching your filters."
        />
      )}
    </div>
  )
}
