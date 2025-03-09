import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

interface ReadingChartProps {
  data: number[]
}

export function ReadingChart({ data }: ReadingChartProps) {
  // Format data for the chart
  const chartData = data.map((score, index) => ({
    attempt: `Attempt ${index + 1}`,
    score,
  }))

  return (
    <ChartContainer>
      <Chart>
        <LineChart data={chartData}>
          <XAxis dataKey="attempt" />
          <YAxis />
          <ChartTooltip>
            <ChartTooltipContent />
          </ChartTooltip>
          <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
        </LineChart>
      </Chart>
    </ChartContainer>
  )
}

