"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GallerySearchProps = {
  activeTab: "search" | "similar";
  value: string;
  onChange: (value: string) => void;
  onTabChange: (tab: "search" | "similar") => void;
  onSearch?: () => void;
};

export const GallerySearch = ({
  activeTab,
  value,
  onChange,
  onTabChange,
  onSearch,
}: GallerySearchProps) => (
  <div className="flex w-full py-4">
    <div className="w-full">
      <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
        <div className="flex items-center gap-2 p-3">
          <Input
            placeholder={
              activeTab === "similar"
                ? "Describe your use case to find similar ones..."
                : "Search use cases..."
            }
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (activeTab !== "similar") return;
              if (event.key === "Enter") {
                event.preventDefault();
                onSearch?.();
              }
            }}
            className="h-12 text-sm border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Search use cases"
          />
          {activeTab === "similar" ? (
            <Button
              className="h-10 px-4 bg-teal-600 text-white hover:bg-teal-700"
              onClick={onSearch}
              disabled={!value.trim()}
            >
              Search
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  </div>
);
