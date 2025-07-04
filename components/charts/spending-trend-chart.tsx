"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface SpendingTrendChartProps {
  data: Array<{
    month: string
    income: number
    expenses: number
    savings: number
  }>
  title?: string
}

export function SpendingTrendChart({ data, title }: SpendingTrendChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg min-w-[200px]">
          <p className="font-semibold text-gray-800 mb-3">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="text-sm font-bold" style={{ color: entry.color }}>
                LKR {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-medium text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-xl font-bold mb-6 text-center text-gray-800">{title}</h3>}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} stroke="#94a3b8" tickFormatter={(value) => `LKR ${value}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#059669"
            strokeWidth={3}
            dot={{ fill: "#059669", strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: "#059669", strokeWidth: 2 }}
            name="Income"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ fill: "#dc2626", strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: "#dc2626", strokeWidth: 2 }}
            name="Expenses"
          />
          <Line
            type="monotone"
            dataKey="savings"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ fill: "#2563eb", strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: "#2563eb", strokeWidth: 2 }}
            name="Savings"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
