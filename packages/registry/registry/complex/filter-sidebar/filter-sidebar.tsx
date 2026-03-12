import { DashboardFilter, DashboardFilterConfig } from '@survey-kit/core'
import { Card, Heading, Button } from '@survey-kit/registry'
import { SimpleDropdown } from '../../layout/dropdown/simple-dropdown'

export interface FilterSidebarProps {
  filters: DashboardFilterConfig[]
  activeFilters: DashboardFilter[]
  onFilterChange: (filters: DashboardFilter[]) => void
}

export function FilterSidebar({
  filters,
  activeFilters,
  onFilterChange,
}: FilterSidebarProps) {
  if (!filters || filters.length === 0) return null

  const handleFilterChange = (questionId: string, value: string) => {
    let newFilters = [...activeFilters]

    if (!value || value === 'all') {
      newFilters = newFilters.filter((f) => f.questionId !== questionId)
    } else {
      const existingIndex = newFilters.findIndex(
        (f) => f.questionId === questionId
      )
      if (existingIndex >= 0) {
        newFilters[existingIndex] = { questionId, value }
      } else {
        newFilters.push({ questionId, value })
      }
    }

    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    onFilterChange([])
  }

  return (
    <Card className="w-64 flex-shrink-0 p-4 sticky top-6 self-start border rounded-md h-auto">
      <div className="flex items-center justify-between mb-2">
        <Heading level="h3" className="text-lg">
          Filters
        </Heading>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-red-500 h-auto p-1"
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6 p-2 max-h-[700px] overflow-y-scroll">
        {filters.map((filter) => {
          const active = activeFilters.find((f) => f.questionId === filter.id)
          const options = [
            { label: 'All Responses', value: 'all' },
            ...filter.options,
          ]

          return (
            <div key={filter.id} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {filter.label}
              </label>
              <SimpleDropdown
                options={options}
                value={active ? (active.value as string) : 'all'}
                onChange={(val) => handleFilterChange(filter.id, val)}
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
