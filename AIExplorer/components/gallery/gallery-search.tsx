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
            className="h-12 text-sm border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Search use cases"
          />
          
        </div>
      </div>
    </div>
  </div>
);
