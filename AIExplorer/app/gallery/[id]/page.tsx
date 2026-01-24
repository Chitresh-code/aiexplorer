"use client";

import { useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getRouteState } from "@/lib/navigation-state";
import { useGalleryDetail } from "@/features/gallery/hooks/useGalleryDetail";
import type {
  GalleryUseCase,
  GalleryUseCaseListItem,
} from "@/features/gallery/types";

const AIGalleryDetail = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const routeState = getRouteState<{
    useCase?: GalleryUseCase | GalleryUseCaseListItem;
  }>(pathname);
  const paramId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(paramId);

  const { useCase, isLoading } = useGalleryDetail(
    Number.isFinite(id) ? id : null,
    routeState?.useCase ?? null,
  );

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      router.push("/gallery");
    }
  }, [id, router]);

  useEffect(() => {
    if (!isLoading && !useCase) {
      router.push("/gallery");
    }
  }, [isLoading, router, useCase]);

  const hasDetails = (
    value: GalleryUseCase | GalleryUseCaseListItem,
  ): value is GalleryUseCase =>
    "headline" in value && "opportunity" in value && "evidence" in value;

  if (isLoading) {
    return (
      <div className="main-content min-h-[calc(100vh-3.5rem)] justify-center overflow-hidden">
        <div className="w-full">
          <div className="w-[95%] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(80vh-150px)]">
              <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col">
                <CardContent className="p-8 flex-1 space-y-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-2/3" />
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col">
                <CardHeader className="relative" />
                <CardContent className="pt-6 flex-1 space-y-6">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!useCase || !hasDetails(useCase)) return null;

  return (
    <div className="main-content min-h-[calc(100vh-3.5rem)] justify-center overflow-hidden">
      <div className="w-full">
        <div className="w-[95%] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(80vh-150px)]">
            <div className="lg:col-span-1">
              <Card
                className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col"
                style={{ backgroundColor: useCase.bgColor }}
              >
                <CardContent className="p-8 flex-1">
                  <div className="space-y-6 h-full">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Use Case:
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Input
                          value={useCase.title}
                          readOnly
                          className="text-[#13352C] font-medium bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                        />
                        <Badge
                          variant="secondary"
                          className="bg-white/80 text-[#13352C] border-none shadow-sm hover:bg-white font-semibold flex-shrink-0"
                        >
                          {useCase.phase}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-white/80 text-[#13352C] border-none shadow-sm hover:bg-white font-semibold flex-shrink-0"
                        >
                          {useCase.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Department:
                      </h3>
                      <Input
                        value={useCase.businessUnit}
                        readOnly
                        className="text-[#13352C] font-medium bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        AI Theme:
                      </h3>
                      <div className="text-[#13352C] font-medium text-base whitespace-normal break-words">
                        {useCase.aiThemes.join(", ")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col">
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => router.push("/gallery")}
                  >
                    <X size={20} />
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 flex-1">
                  <div className="space-y-8 h-full">
                    <div>
                      <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Headline - One line Executive Headline
                      </CardTitle>
                      <Textarea
                        value={useCase.headline}
                        readOnly
                        className="text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden"
                      />
                    </div>

                    <div>
                      <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Opportunity - What is the idea for which AI is being used?
                      </CardTitle>
                      <Textarea
                        value={useCase.opportunity}
                        readOnly
                        className="text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden"
                      />
                    </div>

                    <div>
                      <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Evidence - Why it is needed?
                      </CardTitle>
                      <Textarea
                        value={useCase.evidence}
                        readOnly
                        className="text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden"
                      />
                    </div>

                    <div>
                      <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Primary Contact Person
                      </CardTitle>
                      <Textarea
                        value={useCase.primaryContact}
                        readOnly
                        className="text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGalleryDetail;
