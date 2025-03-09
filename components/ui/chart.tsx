import type React from "react"
import {
  ResponsiveContainer,
  ComposedChart as RechartsComposedChart,
  Line as RechartsLine,
  Bar as RechartsBar,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Tooltip as RechartsTooltip,
} from "recharts"

interface ChartProps {
  children: React.ReactNode
}

export function ChartContainer({ children }: { children: React.ReactNode }) {
  return <div className="w-full">{children}</div>
}

export function Chart({ children }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      {children}
    </ResponsiveContainer>
  )
}

export const LineChart = RechartsComposedChart
export const BarChart = RechartsComposedChart
export const Line = RechartsLine
export const Bar = RechartsBar
export const XAxis = RechartsXAxis
export const YAxis = RechartsYAxis

interface TooltipProps {
  children?: React.ReactNode
}

export function ChartTooltip({ children }: TooltipProps) {
  return (
    <RechartsTooltip
      contentStyle={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "0.5rem",
      }}
      labelStyle={{ color: "var(--foreground)" }}
      itemStyle={{ color: "var(--foreground)" }}
    />
  )
}

export function ChartTooltipContent() {
  return null
}

