"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GallerySearchProps = {
  activeTab: "search" | "similar";
  value: string;
  onChange: (value: string) => void;
  onTabChange: (tab: "search" | "similar") => void;
};

export const GallerySearch = ({
  activeTab,
  value,
  onChange,
  onTabChange,
}: GallerySearchProps) => (
  <div className="flex justify-center py-4">
    <div className="w-full max-w-5xl">
      <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
        <div className="relative">
          <Input
            placeholder={
              activeTab === "similar"
                ? "Describe your use case to find similar ones..."
                : "Search use cases..."
            }
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-16 text-sm border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Search use cases"
          />
        </div>

        <div className="flex items-center gap-2 px-3 pb-2 pt-1 bg-white">
          <Button
            size="sm"
            variant={activeTab === "similar" ? "secondary" : "ghost"}
            onClick={() => onTabChange("similar")}
            className="h-8 text-xs px-3"
          >
            <PlusCircle className="h-3 w-3 mr-1" />
            Find Similar
          </Button>
          <Button
            size="sm"
            variant={activeTab === "search" ? "secondary" : "ghost"}
            onClick={() => onTabChange("search")}
            className="h-7 text-xs px-3"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  </div>
);
