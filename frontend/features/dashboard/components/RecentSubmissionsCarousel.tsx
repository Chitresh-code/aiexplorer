"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface UseCase {
  ID: number
  UseCase: string
  AITheme: string
  Status: string
  Created: string
}

interface RecentSubmissionsCarouselProps {
  useCases: UseCase[]
  loading?: boolean
}

export function RecentSubmissionsCarousel({ useCases, loading }: RecentSubmissionsCarouselProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'implemented':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'in progress':
      case 'testing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'planning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'on track':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className="pt-0 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-center">
        <div className="grid flex-1 gap-1">
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            Latest activity across AI Hub
          </CardDescription>
        </div>
        <span className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 border border-gray-300 shadow-sm">
          {useCases.length} total
        </span>
      </CardHeader>
      <CardContent className="px-6 py-6 sm:px-10">
        <div className="relative">
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-4">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <CarouselItem
                    key={i}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <Card className="h-full border border-gray-100 bg-white shadow-sm">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))
              ) : (
                useCases.map((useCase) => (
                  <CarouselItem
                    key={useCase.ID}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <Card className="group h-full border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="line-clamp-2 text-base font-bold text-gray-900 leading-tight flex-1">
                            {useCase.UseCase}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`font-medium text-xs shrink-0 ${getStatusColor(useCase.Status)}`}
                          >
                            {useCase.Status}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">AI Theme:</span>
                            <span className="font-semibold text-gray-800 truncate ml-2">
                              {useCase.AITheme}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Created:</span>
                            <span className="font-medium text-gray-700 ml-2">
                              {formatDate(useCase.Created)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious className="-left-4 h-10 w-10 shadow-md border border-gray-200 bg-white hover:bg-gray-50" />
            <CarouselNext className="-right-4 h-10 w-10 shadow-md border border-gray-200 bg-white hover:bg-gray-50" />
          </Carousel>
        </div>
      </CardContent>
    </Card>
  )
}
