import React from 'react'
import { DashboardConfig } from '../types/dashboard'

export interface DashboardRendererProps {
  config: DashboardConfig
  components: Record<string, React.ElementType>
  data: Record<string, any> // The analytics data from the API
  surveyFilterValue?: string
  onSurveyFilterChange?: (value: string) => void
}

export function DashboardRenderer({
  config,
  components,
  data,
  surveyFilterValue = '',
  onSurveyFilterChange,
}: DashboardRendererProps) {
  const { title, groups, surveyFilter } = config
  const Heading =
    components.Heading || (({ children }: any) => <h2>{children}</h2>)
  const Card = components.Card || (({ children }: any) => <div>{children}</div>)
  const SimpleDropdown =
    components.SimpleDropdown ||
    ((props: {
      value?: string
      onChange?: (v: string) => void
      options?: { label: string; value: string }[]
      'aria-label'?: string
      className?: string
    }) => (
      <select
        value={props.value ?? ''}
        onChange={(e) => props.onChange?.(e.target.value)}
        aria-label={props['aria-label']}
        className={props.className}
      >
        {(props.options || []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ))

  return (
    <div className="flex flex-col w-full">
      <Heading level="h1" className="mb-4">
        {title}
      </Heading>

      {surveyFilter &&
        onSurveyFilterChange &&
        surveyFilter.options.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-6">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {surveyFilter.label}
            </span>
            <SimpleDropdown
              value={surveyFilterValue}
              onChange={onSurveyFilterChange}
              options={surveyFilter.options.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              placeholder=""
              aria-label={surveyFilter.label}
              className="sm:max-w-xs"
            />
          </div>
        )}

      {groups.map((group) => (
        <section key={group.id} className="flex flex-col gap-4">
          <Heading level="h2" className="text-xl">
            {group.title}
          </Heading>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
            {group.charts.map((chart) => {
              const ChartComponent = components[chart.type]

              if (!ChartComponent) {
                console.warn(`Chart component not found: ${chart.type}`)
                return null
              }

              const chartData = data[chart.dataKey]

              if (!chartData) {
                return (
                  <Card key={chart.id} className="p-4 flex flex-col gap-2">
                    <Heading level="h3" className="text-lg font-medium">
                      {chart.title}
                    </Heading>
                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded text-gray-500">
                      No data available
                    </div>
                  </Card>
                )
              }

              return (
                <Card
                  key={chart.id}
                  className="p-4 flex flex-col gap-2 border rounded-md relative overflow-hidden h-[400px]"
                >
                  <Heading level="h3" className="text-lg font-medium">
                    {chart.title}
                  </Heading>
                  <div className="flex-1 w-full relative">
                    <ChartComponent data={chartData} height={320} />
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
