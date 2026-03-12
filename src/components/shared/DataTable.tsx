import { useState, type ReactNode } from 'react'
import { ChevronUp, ChevronDown, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'

interface Column<T> {
  key: string
  label: string
  render?: (item: T, index: number) => ReactNode
  width?: string
  sortable?: boolean
}

type SortDirection = 'asc' | 'desc'

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data found',
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1

        let comparison = 0
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal)
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal
        } else {
          comparison = String(aVal).localeCompare(String(bVal))
        }

        return sortDirection === 'asc' ? comparison : -comparison
      })
    : data

  if (!isLoading && data.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden', className)}>
        <EmptyState
          icon={Database}
          title="No data"
          description={emptyMessage}
        />
      </div>
    )
  }

  return (
    <div className={cn('bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#243B53] border-b border-slate-200 dark:border-white/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
                    col.sortable && 'cursor-pointer select-none hover:text-slate-700 transition-colors'
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <div className="flex flex-col -space-y-1">
                        <ChevronUp
                          className={cn(
                            'w-3 h-3',
                            sortKey === col.key && sortDirection === 'asc'
                              ? 'text-teal-600'
                              : 'text-slate-300'
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            'w-3 h-3',
                            sortKey === col.key && sortDirection === 'desc'
                              ? 'text-teal-600'
                              : 'text-slate-300'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-slate-100 dark:border-white/6">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              : sortedData.map((item, rowIdx) => (
                  <tr
                    key={rowIdx}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    className={cn(
                      'border-b border-slate-100 dark:border-white/6 last:border-0 transition-colors hover:bg-slate-50/50 dark:hover:bg-white/5',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                      >
                        {col.render
                          ? col.render(item, rowIdx)
                          : (item[col.key] as ReactNode) ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
