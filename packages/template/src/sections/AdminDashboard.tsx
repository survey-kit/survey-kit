import { useEffect, useMemo, useState } from 'react'
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
  SimpleDropdown,
} from '@survey-kit/registry'
import dashboardConfig from '../dashboards/dashboard.config.json'
import surveyConfig from '../surveys/survey-1.json'
import chatSurveyConfig from '../surveys/chat-survey.json'
import { fetchAdminAnalytics } from '../services/analytics'
import { removeAuthToken } from '../services/auth'

const chartComponents = {
  Heading,
  Card,
  TrendLineChart,
  DropoffBarChart,
  SimpleDropdown,
}

/**
 * Component responsible for rendering the administration dashboard.
 * Fetches and displays analytics data using the configured charts.
 */
export function AdminDashboard() {
  const [surveyFilter, setSurveyFilter] = useState('')
  const filterSourceConfig = useMemo(() => {
    if (surveyFilter === 'chat-demo') {
      return chatSurveyConfig
    }
    return surveyConfig
  }, [surveyFilter])
  const dynamicFilters = extractFilterableQuestions(filterSourceConfig as any)
  const questionLabels = useMemo(() => {
    const showcase = getQuestionLabelMap(surveyConfig as any)
    const chat = getQuestionLabelMap(chatSurveyConfig as any)
    if (surveyFilter === 'chat-demo') {
      return chat
    }
    if (surveyFilter === '') {
      return { ...chat, ...showcase }
    }
    return showcase
  }, [surveyFilter])
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<DashboardFilter[]>([])
  const navigate = useNavigate()

  const handleSurveyFilterChange = (value: string) => {
    setFilters([])
    setSurveyFilter(value)
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await fetchAdminAnalytics(
        filters,
        surveyFilter || undefined
      )

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
  }, [navigate, filters, surveyFilter])

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
    <div className="flex-1 w-full p-6 flex flex-col md:flex-row gap-6 relative">
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
            surveyFilterValue={surveyFilter}
            onSurveyFilterChange={handleSurveyFilterChange}
          />
        )}
        {data?.responses && (
          <section className="flex flex-col gap-4">
            <Heading level="h2" className="text-xl">
              All Responses
            </Heading>
            <ResponseList
              responses={data.responses}
              questionLabels={questionLabels}
            />
          </section>
        )}
      </div>
    </div>
  )
}
