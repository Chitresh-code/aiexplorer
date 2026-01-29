"use client";

import { useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRouteState } from "@/lib/navigation-state";
import { useGalleryDetail } from "@/features/gallery/hooks/useGalleryDetail";
import type {
  GalleryUseCase,
  GalleryUseCaseListItem,
} from "@/features/gallery/types";
import { InfoSection } from "@/components/use-case-details/InfoSection";

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
    "headline" in value && "opportunity" in value && "evidence" in value && "businessValue" in value;

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

  const agentBadgeLabel = useCase.aiModel || useCase.vendorName || "";
  const noop = () => {};

  return (
    <div className="main-content min-h-[calc(100vh-3.5rem)] justify-center overflow-hidden relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-6 z-10"
        onClick={() => router.push("/gallery")}
      >
        <X size={20} />
      </Button>
      <InfoSection
        id={useCase.id}
        isEditing={false}
        editableTitle={useCase.title}
        onTitleChange={noop}
        useCasePhase={useCase.phase}
        agentBadgeLabel={agentBadgeLabel || undefined}
        businessUnitName={useCase.businessUnit}
        teamName={useCase.team}
        aiThemeNames={useCase.aiThemes ?? []}
        editableHeadline={useCase.headline}
        onHeadlineChange={noop}
        editableOpportunity={useCase.opportunity}
        onOpportunityChange={noop}
        editableEvidence={useCase.businessValue || useCase.evidence}
        onEvidenceChange={noop}
        editableContactPerson={useCase.primaryContact}
      />
    </div>
  );
};

export default AIGalleryDetail;
