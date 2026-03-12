import React from 'react'
import { DashboardConfig } from '../types/dashboard'

export interface DashboardRendererProps {
  config: DashboardConfig
  components: Record<string, React.ElementType>
  data: Record<string, any> // The analytics data from the API
}

export function DashboardRenderer({
  config,
  components,
  data,
}: DashboardRendererProps) {
  const { title, groups } = config
  const Heading =
    components.Heading || (({ children }: any) => <h2>{children}</h2>)
  const Card = components.Card || (({ children }: any) => <div>{children}</div>)

  return (
    <div className="flex flex-col gap-8 w-full">
      <Heading level="h1" className="mb-4">
        {title}
      </Heading>

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
                  className="p-4 flex flex-col gap-2 border relative overflow-hidden h-[400px]"
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
