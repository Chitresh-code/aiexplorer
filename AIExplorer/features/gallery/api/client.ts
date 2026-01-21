import type {
  GalleryFiltersResponse,
  GalleryListResponse,
  GalleryUseCase,
  UseCaseQuery,
} from "@/features/gallery/types";

const buildQuery = (query: UseCaseQuery) => {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDir) params.set("sortDir", query.sortDir);
  if (query.skip !== undefined) params.set("skip", String(query.skip));
  if (query.limit !== undefined) params.set("limit", String(query.limit));

  const appendValues = (key: string, values?: string[]) => {
    values?.forEach((value) => {
      if (value) params.append(key, value);
    });
  };

  appendValues("status", query.status);
  appendValues("phase", query.phase);
  appendValues("business_unit", query.businessUnit);
  appendValues("team", query.team);
  appendValues("sub_team", query.subTeam);
  appendValues("vendor", query.vendor);
  appendValues("persona", query.persona);
  appendValues("ai_theme", query.aiTheme);
  appendValues("ai_model", query.aiModel);
  appendValues("filterKey", query.filterKey);
  appendValues("filterValue", query.filterValue);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const fetchUseCases = async (
  query: UseCaseQuery,
  signal?: AbortSignal,
): Promise<GalleryListResponse> => {
  const response = await fetch(`/api/usecases${buildQuery(query)}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error("Failed to load use cases.");
  }
  return response.json();
};

export const fetchUseCase = async (
  id: number,
  signal?: AbortSignal,
): Promise<GalleryUseCase> => {
  const response = await fetch(`/api/usecases/${id}`, { signal });
  if (!response.ok) {
    throw new Error("Failed to load use case.");
  }
  return response.json();
};

export const fetchFilters = async (
  signal?: AbortSignal,
): Promise<GalleryFiltersResponse> => {
  const response = await fetch("/api/usecases/filters", { signal });
  if (!response.ok) {
    throw new Error("Failed to load filters.");
  }
  return response.json();
};

export const fetchSimilarUseCases = async (
  query: string,
  signal?: AbortSignal,
): Promise<GalleryListResponse> => {
  const response = await fetch("/api/usecases/similar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });
  if (!response.ok) {
    throw new Error("Failed to load similar use cases.");
  }
  return response.json();
};
