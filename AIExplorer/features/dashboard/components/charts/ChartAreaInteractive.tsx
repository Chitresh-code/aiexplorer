"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useKPIData } from "@/features/dashboard/hooks/useKPIData"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  idea: {
    label: "Idea",
    color: "hsl(var(--chart-1))",
  },
  diagnose: {
    label: "Diagnose",
    color: "hsl(var(--chart-2))",
  },
  design: {
    label: "Design",
    color: "hsl(var(--chart-3))",
  },
  implemented: {
    label: "Implemented",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

const rangeOptions = {
  "90d": "Last 3 months",
  "30d": "Last 30 days",
  "7d": "Last 7 days",
} as const

export function ChartAreaInteractive() {
  const { timeline, loading } = useKPIData();
  const [timeRange, setTimeRange] = React.useState<keyof typeof rangeOptions>(
    "90d",
  )

  const filteredData = React.useMemo(() => {
    if (!timeline.length) return [];

    // Find the most recent date in the timeline
    const sortedTimeline = [...timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const referenceDate = new Date(sortedTimeline[0].date);

    const daysToSubtract =
      timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return timeline.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [timeline, timeRange])

  if (loading) {
    return (
      <Card className="pt-0 shadow-sm">
        <CardHeader className="flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-center">
          <div className="grid flex-1 gap-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full sm:w-[180px] rounded-lg" />
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-[260px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0 shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-center">
        <div className="grid flex-1 gap-1">
          <CardTitle>Use Case Flow</CardTitle>
          <CardDescription>
            Track how ideas progress through each delivery phase
          </CardDescription>
        </div>
        <select
          value={timeRange}
          onChange={(event) =>
            setTimeRange(event.currentTarget.value as keyof typeof rangeOptions)
          }
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:ml-auto sm:w-[180px]"
        >
          {Object.entries(rangeOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[260px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillIdea" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-idea)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-idea)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDiagnose" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-diagnose)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-diagnose)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDesign" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-design)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-design)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillImplemented" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-implemented)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-implemented)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Area
              dataKey="idea"
              type="natural"
              fill="url(#fillIdea)"
              stroke="var(--color-idea)"
              stackId="usecases"
            />
            <Area
              dataKey="diagnose"
              type="natural"
              fill="url(#fillDiagnose)"
              stroke="var(--color-diagnose)"
              stackId="usecases"
            />
            <Area
              dataKey="design"
              type="natural"
              fill="url(#fillDesign)"
              stroke="var(--color-design)"
              stackId="usecases"
            />
            <Area
              dataKey="implemented"
              type="natural"
              fill="url(#fillImplemented)"
              stroke="var(--color-implemented)"
              stackId="usecases"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
