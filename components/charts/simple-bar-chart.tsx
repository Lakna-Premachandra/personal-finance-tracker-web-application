"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface SimpleBarChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  title?: string
  dataKey?: string
  color?: string
}

export function SimpleBarChart({ data, title, dataKey = "value", color = "#2563eb" }: SimpleBarChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg min-w-[160px]">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color || color }}>
            LKR {payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  const maxValue = Math.max(...data.map((item) => item.value))
  const yAxisMax = Math.ceil((maxValue * 1.2) / 100) * 100

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#64748b" }}
            stroke="#94a3b8"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#64748b" }}
            stroke="#94a3b8"
            tickFormatter={(value) => `LKR ${value}`}
            domain={[0, yAxisMax]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} stroke="#fff" strokeWidth={1}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
