"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { FilterComboboxProps } from "@/components/shared/filter-combobox";
import { FilterCombobox } from "@/components/shared/filter-combobox";

export type GalleryFilterConfig = FilterComboboxProps & { id: string };

type GalleryFiltersProps = {
  filters: GalleryFilterConfig[];
  onReset: () => void;
  showReset: boolean;
  isLoading?: boolean;
};

export const GalleryFilters = ({
  filters,
  onReset,
  showReset,
  isLoading = false,
}: GalleryFiltersProps) => (
  <Card className="shadow-sm">
    <CardContent className="py-4">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: Math.max(filters.length, 8) }, (_, index) => (
            <Skeleton key={`filter-skeleton-${index}`} className="h-9 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {filters.map((filter) => (
              <FilterCombobox key={filter.id} {...filter} />
            ))}
          </div>

          {showReset && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                onClick={onReset}
                className="h-8 px-3 text-sm"
              >
                Reset
              </Button>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);
