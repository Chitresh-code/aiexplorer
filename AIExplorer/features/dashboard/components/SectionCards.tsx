import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useKPIData } from "@/features/dashboard/hooks/useKPIData"
import { Skeleton } from "@/components/ui/skeleton"

const TrendingIcon = ({ isPositive, className }: { isPositive: boolean; className?: string }) => {
  const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;
  return <Icon className={className} />;
};

export function SectionCards() {
  const { totalUseCases, implemented, trending, completionRate, loading, error } = useKPIData();

  if (loading) {
    return (
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm border-none ring-1 ring-gray-200">
            <CardHeader className="relative space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-16" />
              <div className="absolute right-4 top-4">
                <Skeleton className="h-5 w-12 rounded-lg" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading KPI Data</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const trendingIcon = trending >= 0 ? TrendingUpIcon : TrendingDownIcon;
  const trendingColor = trending >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="relative">
          <CardDescription>Total Use Cases</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {totalUseCases}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${trendingColor}`}>
              <TrendingIcon isPositive={trending >= 0} className="size-3" />
              {trending >= 0 ? '+' : ''}{trending}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending {trending >= 0 ? 'up' : 'down'} this month <TrendingIcon isPositive={trending >= 0} className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total AI use cases submitted
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>Implemented</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {implemented}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              {completionRate}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Completion rate <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Use cases successfully implemented
          </div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>Completion Rate</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {completionRate}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              Target: 100%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Progress tracking <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Percentage of completed use cases</div>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>Trending</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {trending >= 0 ? '+' : ''}{trending}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${trendingColor}`}>
              <TrendingIcon isPositive={trending >= 0} className="size-3" />
              Monthly change
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Growth indicator <TrendingIcon isPositive={trending >= 0} className="size-4" />
          </div>
          <div className="text-muted-foreground">Month-over-month implementation growth</div>
        </CardFooter>
      </Card>
    </div>
  )
}
