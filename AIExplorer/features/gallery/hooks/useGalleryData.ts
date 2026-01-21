import { useEffect, useMemo, useState } from "react";

import type {
  GalleryFiltersResponse,
  GalleryListResponse,
  GalleryUseCaseListItem,
  SortDir,
} from "@/features/gallery/types";
import {
  fetchFilters,
  fetchSimilarUseCases,
  fetchUseCases,
} from "@/features/gallery/api/client";

type GalleryFilterState = {
  phase: string;
  vendor: string[];
  personas: string[];
  aiThemes: string[];
  businessUnits: string[];
  teams: string[];
  subTeams: string[];
  status: string[];
  aiModels: string[];
};

type UseGalleryDataParams = {
  activeTab: "search" | "similar";
  searchText: string;
  filters: GalleryFilterState;
  sortBy?: keyof GalleryUseCaseListItem;
  sortDir?: SortDir;
};

export const useGalleryData = ({
  activeTab,
  searchText,
  filters,
  sortBy,
  sortDir,
}: UseGalleryDataParams) => {
  const [useCases, setUseCases] = useState<GalleryListResponse>({
    items: [],
    total: 0,
  });
  const [filtersData, setFiltersData] = useState<GalleryFiltersResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      search: searchText,
      phase: filters.phase ? [filters.phase] : [],
      vendor: filters.vendor,
      persona: filters.personas,
      aiTheme: filters.aiThemes,
      businessUnit: filters.businessUnits,
      team: filters.teams,
      subTeam: filters.subTeams,
      status: filters.status,
      aiModel: filters.aiModels,
      sortBy,
      sortDir,
    }),
    [
      filters.aiModels,
      filters.aiThemes,
      filters.businessUnits,
      filters.personas,
      filters.phase,
      filters.status,
      filters.subTeams,
      filters.teams,
      filters.vendor,
      searchText,
      sortBy,
      sortDir,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    setIsFiltersLoading(true);
    fetchFilters(controller.signal)
      .then(setFiltersData)
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to load filters", err);
        setError("Unable to load filters.");
      })
      .finally(() => setIsFiltersLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    const load =
      activeTab === "similar"
        ? fetchSimilarUseCases(searchText, controller.signal)
        : fetchUseCases(query, controller.signal);

    load
      .then(setUseCases)
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to load use cases", err);
        setError("Unable to load use cases.");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [activeTab, query, searchText]);

  return {
    useCases,
    filtersData,
    isLoading,
    isFiltersLoading,
    error,
  };
};

export type { GalleryFilterState };
