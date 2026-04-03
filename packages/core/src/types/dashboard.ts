export interface ChartConfig {
  id: string
  type: 'TrendLineChart' | 'DropoffBarChart'
  title: string
  dataKey: string
  height?: number
}

export interface DashboardGroup {
  id: string
  title: string
  charts: ChartConfig[]
}
export interface DashboardSurveyFilterOption {
  value: string
  label: string
}

export interface DashboardSurveyFilterConfig {
  label: string
  options: DashboardSurveyFilterOption[]
}

export interface DashboardFilter {
  questionId: string
  value: string | string[]
}

export interface DashboardFilterConfig {
  id: string
  label: string
  type: 'select' | 'multiselect'
  options: { label: string; value: string }[]
}

export interface DashboardConfig {
  id: string
  title: string
  allowedRoles: string[]
  groups: DashboardGroup[]
  filters?: DashboardFilterConfig[]
  surveyFilter?: DashboardSurveyFilterConfig
}
