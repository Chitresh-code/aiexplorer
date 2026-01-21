"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { FilterComboboxProps } from "@/components/gallery/filters/filter-combobox";
import { FilterCombobox } from "@/components/gallery/filters/filter-combobox";

export type GalleryFilterConfig = FilterComboboxProps & { id: string };

type GalleryFiltersProps = {
  filters: GalleryFilterConfig[];
  onReset: () => void;
  showReset: boolean;
};

export const GalleryFilters = ({
  filters,
  onReset,
  showReset,
}: GalleryFiltersProps) => (
  <Card className="shadow-sm">
    <CardContent className="py-4">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {filters.map((filter) => (
          <FilterCombobox key={filter.id} {...filter} />
        ))}
      </div>

      {showReset && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" onClick={onReset} className="h-8 px-3 text-sm">
            Reset
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);
