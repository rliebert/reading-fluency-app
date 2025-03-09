import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

interface ProgressChartProps {
  data: Array<{
    day: string
    score: number
  }>
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <ChartContainer>
      <Chart>
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <ChartTooltip>
            <ChartTooltipContent />
          </ChartTooltip>
          <Bar
            dataKey="score"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            label={{ position: "top", fill: "var(--muted-foreground)", fontSize: 12 }}
          />
        </BarChart>
      </Chart>
    </ChartContainer>
  )
}

