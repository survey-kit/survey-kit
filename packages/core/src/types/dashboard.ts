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

export interface DashboardConfig {
  id: string
  title: string
  allowedRoles: string[]
  groups: DashboardGroup[]
}
