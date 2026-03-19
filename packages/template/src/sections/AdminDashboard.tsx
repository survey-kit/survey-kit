import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DashboardRenderer,
  DashboardFilter,
  extractFilterableQuestions,
  getQuestionLabelMap,
} from '@survey-kit/core'
import {
  Heading,
  Card,
  TrendLineChart,
  DropoffBarChart,
  Button,
  FilterSidebar,
  ResponseList,
} from '@survey-kit/registry'
import dashboardConfig from '../dashboards/dashboard.config.json'
import surveyConfig from '../surveys/survey-1.json'
import { fetchAdminAnalytics } from '../services/analytics'
import { removeAuthToken } from '../services/auth'

const chartComponents = {
  Heading,
  Card,
  TrendLineChart,
  DropoffBarChart,
}

/**
 * Component responsible for rendering the administration dashboard.
 * Fetches and displays analytics data using the configured charts.
 */
export function AdminDashboard() {
  const dynamicFilters = extractFilterableQuestions(surveyConfig as any)
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<DashboardFilter[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await fetchAdminAnalytics(filters)

      if (result.success) {
        setData(result.data)
      } else {
        if (
          result.error === 'Session expired' ||
          result.error === 'Not authenticated'
        ) {
          navigate('/admin/login')
        } else {
          setError(result.error || 'Failed to load analytics')
        }
      }
      setLoading(false)
    }

    loadData()
  }, [navigate, filters])

  const handleLogout = () => {
    removeAuthToken()
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleLogout} variant="outline">
          Back to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col md:flex-row gap-6 relative">
      <FilterSidebar
        filters={dynamicFilters}
        activeFilters={filters}
        onFilterChange={setFilters}
      />

      <div className="flex-1 w-full min-w-0 flex flex-col gap-8">
        {data && (
          <DashboardRenderer
            config={dashboardConfig as any}
            components={chartComponents}
            data={data}
          />
        )}
        {data?.responses && (
          <section className="flex flex-col gap-4">
            <Heading level="h2" className="text-xl">
              All Responses
            </Heading>
            <ResponseList
              responses={data.responses}
              questionLabels={getQuestionLabelMap(surveyConfig as any)}
            />
          </section>
        )}
      </div>
    </div>
  )
}
