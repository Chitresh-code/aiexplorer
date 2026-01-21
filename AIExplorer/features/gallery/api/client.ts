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
  type MappingResponse<T> = { items: T[] };
  type BusinessUnitMapping = {
    businessUnitName: string;
    teams: {
      teamName: string;
      subteams: { subTeamId: number | null; subTeamName: string }[];
    }[];
  };
  type VendorModelMapping = {
    id: number | null;
    vendorName: string;
    productName: string;
    roleId: number | null;
  };
  type NameMapping = { id: number | null; name?: string; frequency?: string };
  type StatusMapping = { id: number | null; name: string };

  const fetchJson = async <T>(
    url: string,
  ): Promise<MappingResponse<T>> => {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`Failed to load mappings from ${url}.`);
    }
    return response.json();
  };

  const [
    statusResponse,
    phaseResponse,
    personaResponse,
    themeResponse,
    vendorModelResponse,
    businessUnitResponse,
  ] = await Promise.all([
    fetchJson<StatusMapping>("/api/mappings/status"),
    fetchJson<NameMapping>("/api/mappings/phases"),
    fetchJson<NameMapping>("/api/mappings/personas"),
    fetchJson<NameMapping>("/api/mappings/themes"),
    fetchJson<VendorModelMapping>("/api/mappings/vendor-models"),
    fetchJson<BusinessUnitMapping>("/api/mappings/business-units"),
  ]);

  const statuses = statusResponse.items
    .map((item) => item.name?.trim())
    .filter(Boolean)
    .sort() as string[];

  const phases = phaseResponse.items
    .map((item) => item.name?.trim())
    .filter(Boolean)
    .sort() as string[];

  const personas = personaResponse.items
    .map((item) => item.name?.trim())
    .filter(Boolean)
    .sort() as string[];

  const aiThemes = themeResponse.items
    .map((item) => item.name?.trim())
    .filter(Boolean)
    .sort() as string[];

  const vendorMap = new Map<string, Set<string>>();
  vendorModelResponse.items.forEach((item) => {
    const vendorName = item.vendorName?.trim();
    const productName = item.productName?.trim();
    if (!vendorName) return;
    if (!vendorMap.has(vendorName)) {
      vendorMap.set(vendorName, new Set());
    }
    if (productName) {
      vendorMap.get(vendorName)?.add(productName);
    }
  });
  const vendors = Array.from(vendorMap.entries())
    .map(([name, models]) => ({
      name,
      models: Array.from(models).sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const businessUnits = businessUnitResponse.items
    .map((unit) => ({
      name: unit.businessUnitName?.trim(),
      teams: (unit.teams ?? [])
        .map((team) => ({
          name: team.teamName?.trim(),
          subTeams: (team.subteams ?? [])
            .map((subteam) => subteam.subTeamName?.trim())
            .filter(Boolean)
            .sort() as string[],
        }))
        .filter((team) => team.name)
        .sort((a, b) => a.name!.localeCompare(b.name!)),
    }))
    .filter((unit) => unit.name)
    .sort((a, b) => a.name!.localeCompare(b.name!)) as GalleryFiltersResponse["businessUnits"];

  return {
    statuses,
    phases,
    personas,
    aiThemes,
    vendors,
    businessUnits,
  };
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
