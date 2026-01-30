import { useEffect, useMemo, useRef, useState } from "react";

import type {
  GalleryFiltersResponse,
  GalleryListResponse,
  GalleryUseCaseListItem,
  SortDir,
} from "@/features/gallery/types";
import {
  applyGalleryFilters,
  fetchFilters,
  fetchSimilarUseCases,
  fetchUseCases,
  sortGalleryItems,
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
  similarSearchKey?: number;
  filters: GalleryFilterState;
  sortBy?: keyof GalleryUseCaseListItem;
  sortDir?: SortDir;
};

export const useGalleryData = ({
  activeTab,
  searchText,
  similarSearchKey,
  filters,
  sortBy,
  sortDir,
}: UseGalleryDataParams) => {
  const [baseUseCases, setBaseUseCases] = useState<GalleryListResponse>({
    items: [],
    total: 0,
  });
  const [similarUseCases, setSimilarUseCases] = useState<GalleryListResponse | null>(null);
  const [filtersData, setFiltersData] = useState<GalleryFiltersResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRequestId = useRef(0);
  const lastSimilarSearchKey = useRef<number | null>(null);

  const filterQuery = useMemo(
    () => ({
      search: activeTab === "search" ? searchText : "",
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
      activeTab,
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
    const shouldLoadBase =
      activeTab === "search" || searchText.trim().length === 0;

    if (!shouldLoadBase) {
      return () => controller.abort();
    }

    const requestId = ++activeRequestId.current;
    setIsLoading(true);
    setHasLoaded(false);
    fetchUseCases(filterQuery, controller.signal)
      .then((results) => {
        if (requestId !== activeRequestId.current) return;
        setBaseUseCases(results);
      })
      .catch((err) => {
        if (requestId !== activeRequestId.current) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to load use cases", err);
        setError("Unable to load use cases.");
      })
      .finally(() => {
        if (requestId !== activeRequestId.current) return;
        setIsLoading(false);
        setHasLoaded(true);
      });

    return () => controller.abort();
  }, [activeTab, filterQuery, searchText]);

  useEffect(() => {
    const controller = new AbortController();
    if (activeTab !== "similar") {
      return () => controller.abort();
    }
    if (searchText.trim().length === 0) {
      setSimilarUseCases(null);
      return () => controller.abort();
    }
    if (similarSearchKey === lastSimilarSearchKey.current) {
      return () => controller.abort();
    }

    lastSimilarSearchKey.current = similarSearchKey ?? null;

    const requestId = ++activeRequestId.current;
    setIsLoading(true);
    setHasLoaded(false);
    fetchSimilarUseCases(searchText, controller.signal)
      .then((results) => {
        if (requestId !== activeRequestId.current) return;
        setSimilarUseCases(results);
      })
      .catch((err) => {
        if (requestId !== activeRequestId.current) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to load similar use cases", err);
        setError("Unable to load similar use cases.");
      })
      .finally(() => {
        if (requestId !== activeRequestId.current) return;
        setIsLoading(false);
        setHasLoaded(true);
      });

    return () => controller.abort();
  }, [activeTab, searchText, similarSearchKey]);

  const filteredSimilar = useMemo(() => {
    if (!similarUseCases) {
      return { items: [], total: 0 };
    }
    const filtered = applyGalleryFilters(similarUseCases.items, filterQuery);
    const sorted = sortGalleryItems(filtered, filterQuery.sortBy, filterQuery.sortDir);
    return { items: sorted, total: filtered.length };
  }, [similarUseCases, filterQuery]);

  const useCases =
    activeTab === "similar" && searchText.trim().length > 0
      ? filteredSimilar
      : baseUseCases;

  return {
    useCases,
    filtersData,
    isLoading,
    hasLoaded,
    isFiltersLoading,
    error,
  };
};

export type { GalleryFilterState };
