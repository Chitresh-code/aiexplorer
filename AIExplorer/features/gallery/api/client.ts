import type {
  GalleryFiltersResponse,
  GalleryListResponse,
  GalleryUseCase,
  GalleryUseCaseListItem,
  UseCaseQuery,
} from "@/features/gallery/types";

type GalleryDbUseCase = {
  id: number | null;
  businessUnitId: number | null;
  phaseId: number | null;
  statusId: number | null;
  title: string;
  headlines: string;
  opportunity: string;
  businessValue: string;
  informationUrl: string;
  primaryContact: string;
  productChecklist: string;
  eseDependency: string;
  businessUnitName: string;
  teamName: string;
  phase: string;
  statusName: string;
  statusColor: string;
};

const statusColorMap: Record<string, string> = {
  green: "#E3F4E7",
  red: "#FCE8E6",
  orange: "#FFF4E5",
  gray: "#F3F4F6",
};

const resolveStatusColor = (value?: string) => {
  const key = value?.trim().toLowerCase() ?? "";
  return statusColorMap[key] ?? "#F5F5F5";
};

const normalize = (value: string) => value.trim().toLowerCase();

const arrayMatches = (haystack: string[], needles: string[]) => {
  if (needles.length === 0) return true;
  const hay = haystack.map(normalize);
  return needles.some((needle) => hay.includes(normalize(needle)));
};

const stringMatches = (haystack: string, needles: string[]) => {
  if (needles.length === 0) return true;
  const hay = normalize(haystack);
  return needles.some((needle) => hay.includes(normalize(needle)));
};

const applyFilters = (
  items: GalleryUseCaseListItem[],
  query: UseCaseQuery,
): GalleryUseCaseListItem[] => {
  const search = query.search?.trim() ?? "";
  const status = query.status ?? [];
  const phase = query.phase ?? [];
  const businessUnit = query.businessUnit ?? [];
  const team = query.team ?? [];
  const subTeam = query.subTeam ?? [];
  const vendor = query.vendor ?? [];
  const persona = query.persona ?? [];
  const aiTheme = query.aiTheme ?? [];
  const aiModel = query.aiModel ?? [];

  return items.filter((item) => {
    if (search && !stringMatches(item.title, [search])) return false;
    if (!arrayMatches([item.status], status)) return false;
    if (!arrayMatches([item.phase], phase)) return false;
    if (!arrayMatches([item.businessUnit], businessUnit)) return false;
    if (!arrayMatches([item.team], team)) return false;
    if (!arrayMatches([item.subTeam], subTeam)) return false;
    if (!arrayMatches([item.vendorName], vendor)) return false;
    if (!arrayMatches(item.personas, persona)) return false;
    if (!arrayMatches(item.aiThemes, aiTheme)) return false;
    if (!arrayMatches([item.aiModel], aiModel)) return false;
    return true;
  });
};

const sortItems = (
  items: GalleryUseCaseListItem[],
  sortBy?: keyof GalleryUseCaseListItem,
  sortDir: "asc" | "desc" = "asc",
) => {
  if (!sortBy) return items;
  const direction = sortDir === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const left = String(a[sortBy] ?? "");
    const right = String(b[sortBy] ?? "");
    return left.localeCompare(right) * direction;
  });
};

const toListItem = (item: GalleryDbUseCase): GalleryUseCaseListItem => ({
  id: item.id ?? 0,
  title: item.title ?? "",
  phase: item.phase ?? "",
  status: item.statusName ?? "",
  businessUnit: item.businessUnitName ?? "",
  team: item.teamName ?? "",
  subTeam: "",
  vendorName: "",
  aiModel: "",
  aiThemes: [],
  personas: [],
  bgColor: resolveStatusColor(item.statusColor),
});

const toDetailItem = (item: GalleryDbUseCase): GalleryUseCase => ({
  id: item.id ?? 0,
  title: item.title ?? "",
  phase: item.phase ?? "",
  status: item.statusName ?? "",
  businessUnit: item.businessUnitName ?? "",
  team: item.teamName ?? "",
  subTeam: "",
  vendorName: "",
  aiModel: "",
  aiThemes: [],
  personas: [],
  bgColor: resolveStatusColor(item.statusColor),
  headline: item.headlines ?? "",
  opportunity: item.opportunity ?? "",
  evidence: item.businessValue ?? "",
  primaryContact: item.primaryContact ?? "",
  businessValue: item.businessValue ?? "",
});

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
  const response = await fetch("/api/usecases?view=gallery", {
    signal,
  });
  if (!response.ok) {
    throw new Error("Failed to load use cases.");
  }
  const payload = (await response.json()) as { items?: GalleryDbUseCase[] } | GalleryDbUseCase[];
  const rawItems = Array.isArray(payload) ? payload : payload.items ?? [];
  const mappedItems = rawItems
    .filter((item) => item.id !== null)
    .map(toListItem);
  const filtered = applyFilters(mappedItems, query);
  const sorted = sortItems(filtered, query.sortBy, query.sortDir);
  const skip = query.skip ?? 0;
  const limit = query.limit ?? sorted.length;
  return {
    items: sorted.slice(skip, skip + limit),
    total: filtered.length,
  };
};

export const fetchUseCase = async (
  id: number,
  signal?: AbortSignal,
): Promise<GalleryUseCase> => {
  // 1. Fetch from the specific ID endpoint to get details
  const response = await fetch(
    `/api/usecases/${id}?type=gallery&include=usecase,themes`,
    { signal },
  );
  if (!response.ok) {
    throw new Error("Failed to load use case.");
  }
  
  const payload = await response.json();
  const item = payload.useCase; // Extract the core use case object
  
  // 2. Map everything including themes and personas when available
  return {
    ...item,
    id: Number(item.id),
    title: item.title || "",
    phase: item.phase || "",
    status: item.statusName || "",
    businessUnit: item.businessUnitName || "",
    team: item.teamName || "",
    subTeam: "",
    vendorName: "",
    aiModel: item.aiModel || "",
    // Map themes and personas from the specific arrays in the payload
    aiThemes: payload.themes?.map((t: any) => t.themeName) || [],
    personas: payload.personas?.map((p: any) => p.personaName) || [],
    bgColor: resolveStatusColor(item.statusColor),
    headline: item.headlines || "",
    opportunity: item.opportunity || "",
    evidence: item.businessValue || "",
    primaryContact: item.primarycontact || "", // Note: Use lowercase 'primarycontact' to match your API output
    businessValue: item.business_value || "", // Note: Use 'business_value' to match your API output
  };
};

export const fetchFilters = async (
  signal?: AbortSignal,
): Promise<GalleryFiltersResponse> => {
  type MappingResponse<T> = { items?: T[] };
  type BusinessUnitMapping = {
    id?: number | null;
    businessUnitName?: string | null;
    teamName?: string | null;
  };
  type VendorModelMapping = {
    id?: number | null;
    vendorName?: string | null;
    productName?: string | null;
  };
  type NameMapping = { id?: number | null; name?: string; frequency?: string };
  type StatusMapping = { id?: number | null; name?: string };
  type ConsolidatedMappings = {
    businessUnits?: MappingResponse<BusinessUnitMapping>;
    status?: MappingResponse<StatusMapping>;
    phases?: MappingResponse<NameMapping>;
    personas?: MappingResponse<NameMapping>;
    themes?: MappingResponse<NameMapping>;
    vendorModels?: MappingResponse<VendorModelMapping>;
  };

  const fetchJson = async <T>(
    url: string,
  ): Promise<MappingResponse<T>> => {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`Failed to load mappings from ${url}.`);
    }
    return response.json();
  };

  const mappings = await fetchJson<ConsolidatedMappings>(
    "/api/mappings?types=businessUnits,status,phases,personas,themes,vendorModels",
  );

  const statuses = (mappings.status?.items ?? [])
    .map((item) => item.name?.trim())
    .filter(Boolean)
    .sort() as string[];

  const phases = (mappings.phases?.items ?? [])
    .map((item) => item.name?.trim())
    .filter(Boolean)
    .sort() as string[];

  const personas = (mappings.personas?.items ?? [])
    .map((item) => item.name?.trim())
    .filter(Boolean)
    .sort() as string[];

  const aiThemes = (mappings.themes?.items ?? [])
    .map((item) => item.name?.trim())
    .filter(Boolean)
    .sort() as string[];

  const vendorMap = new Map<string, Set<string>>();
  (mappings.vendorModels?.items ?? []).forEach((item) => {
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

  const unitMap = new Map<string, Set<string>>();
  (mappings.businessUnits?.items ?? []).forEach((item) => {
    const unitName = String(item.businessUnitName ?? "").trim();
    const teamName = String(item.teamName ?? "").trim();
    if (!unitName) return;
    if (!unitMap.has(unitName)) {
      unitMap.set(unitName, new Set());
    }
    if (teamName) {
      unitMap.get(unitName)?.add(teamName);
    }
  });

  const businessUnits = Array.from(unitMap.entries())
    .map(([name, teams]) => ({
      name,
      teams: Array.from(teams).sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name)) as GalleryFiltersResponse["businessUnits"];

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
