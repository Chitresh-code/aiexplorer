"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import type { GalleryUseCaseListItem } from "@/features/gallery/types";

type GalleryResultsProps = {
  isLoading: boolean;
  useCases: GalleryUseCaseListItem[];
  onReset: () => void;
  onExplore: (useCase: GalleryUseCaseListItem) => void;
  onSubmitNew: () => void;
};

const PAGE_SIZE = 12;

export const GalleryResults = ({
  isLoading,
  useCases,
  onReset,
  onExplore,
  onSubmitNew,
}: GalleryResultsProps) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [useCases]);

  useEffect(() => {
    if (isLoading) return;
    if (!loadMoreRef.current) return;
    if (visibleCount >= useCases.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((prev) =>
            Math.min(prev + PAGE_SIZE, useCases.length),
          );
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isLoading, useCases.length, visibleCount]);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleUseCases = useMemo(
    () => useCases.slice(0, visibleCount),
    [useCases, visibleCount],
  );

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(6)].map((_, index) => (
              <Card
                key={index}
                className="border-0 shadow-none h-full"
                style={{ backgroundColor: "#f5f5f5" }}
              >
                <CardContent className="p-6 flex flex-col h-full gap-4 items-start">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-2 flex-grow w-full">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                  <Skeleton className="h-10 w-28 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : useCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <Bot size={40} className="text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium">No use cases found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to find what you're looking for.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Button variant="link" onClick={onReset}>
                Reset filters
              </Button>
              <Button
                onClick={onSubmitNew}
                className="bg-[#D3E12E] hover:bg-[#c0ce25] text-[#13352C] font-bold px-6"
              >
                Submit a new Use Case
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
              {visibleUseCases.map((useCase) => (
                <Card
                  key={useCase.id}
                  className="border-0 shadow-none h-full transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer"
                  style={{ backgroundColor: useCase.bgColor }}
                  onClick={() => onExplore(useCase)}
                >
                  <CardContent className="p-6 flex flex-col h-full gap-4 items-start">
                    <div className="mb-1">
                      <Bot size={40} className="text-[#13352C]" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2 flex-grow">
                      <h3 className="text-xl font-medium text-[#13352C] leading-snug">
                        {useCase.title}
                      </h3>
                      <p className="text-[#13352C] opacity-80 font-medium text-base">
                        • {useCase.phase} • {useCase.status}
                      </p>
                      <p className="text-[#13352C] opacity-70 text-sm">
                        {useCase.businessUnit}
                      </p>
                    </div>
                    <Button
                      className="bg-[#D3E12E] hover:bg-[#c0ce25] text-[#13352C] font-bold px-8 rounded-md mt-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        onExplore(useCase);
                      }}
                    >
                      Explore
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {visibleCount < useCases.length && (
              <div ref={loadMoreRef} className="flex justify-center py-6">
                <Skeleton className="h-10 w-40 rounded-md" />
              </div>
            )}
          </>
        )}
        {showBackToTop && !isLoading && useCases.length > 0 && (
          <Button
            className="fixed bottom-6 right-6 h-11 w-11 rounded-full bg-[#13352C] text-white hover:bg-[#0f2b24]"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
