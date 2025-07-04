"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface AdvancedPieChartProps {
  data: Array<{
    name: string
    value: number
    color: string
    percentage?: number
  }>
  title?: string
  centerText?: {
    value: string
    label: string
  }
}

export function AdvancedPieChart({ data, title, centerText }: AdvancedPieChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const total = payload[0].payload.total
      const percentage = ((data.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg min-w-[220px]">
          <p className="font-semibold text-gray-800 mb-1">{data.name}</p>
          <p className="text-xl font-bold text-blue-600 mb-1">LKR {data.value.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{percentage}% of total</p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.06) return null

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="700"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithTotal = data.map((item) => ({ ...item, total }))

  const CustomLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="grid grid-cols-2 gap-3 mt-6">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-700 block truncate">{entry.value}</span>
              <span className="text-xs text-gray-500">LKR {dataWithTotal[index]?.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-xl font-bold mb-6 text-center text-gray-800">{title}</h3>}
      <div className="relative">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={110}
              innerRadius={65}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>

        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white rounded-full p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-800">{centerText.value}</div>
              <div className="text-sm text-gray-600 font-medium">{centerText.label}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
