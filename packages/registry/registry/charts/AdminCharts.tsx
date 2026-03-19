import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

export interface TrendLineChartProps {
  data: Array<{ date: string; completions: number; dropoffs: number }>
  height?: number
}

export function TrendLineChart({ data, height = 300 }: TrendLineChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="completions"
            stroke="#00C49F"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="dropoffs" stroke="#FF8042" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export interface DropoffBarChartProps {
  data: Array<{ stage: string; counts: number }>
  height?: number
}

export function DropoffBarChart({ data, height = 300 }: DropoffBarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="counts" fill="#FF8042" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
