"use client";

import { Bot } from "lucide-react";
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

export const GalleryResults = ({
  isLoading,
  useCases,
  onReset,
  onExplore,
  onSubmitNew,
}: GalleryResultsProps) => (
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
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase) => (
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
                    • {useCase.phase}
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
      )}
    </CardContent>
  </Card>
);
