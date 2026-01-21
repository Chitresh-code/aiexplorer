import type {
  GalleryFiltersResponse,
  GalleryListResponse,
  GalleryUseCase,
  GalleryUseCaseListItem,
  SortDir,
  UseCaseQuery,
} from "@/features/gallery/types";
import { galleryUseCases } from "@/features/gallery/server/data";

const normalize = (value: string) => value.trim().toLowerCase();

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

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
  items: GalleryUseCase[],
  query: UseCaseQuery,
): GalleryUseCase[] => {
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

const applyFilterKeyValuePairs = (
  items: GalleryUseCase[],
  query: UseCaseQuery,
): GalleryUseCase[] => {
  const keys = query.filterKey ?? [];
  const values = query.filterValue ?? [];
  if (!keys.length || !values.length) return items;
  return keys.reduce((acc, key, index) => {
    const value = values[index];
    if (!value) return acc;
    switch (key) {
      case "phase":
        return applyFilters(acc, { phase: [value] });
      case "status":
        return applyFilters(acc, { status: [value] });
      case "business_unit":
        return applyFilters(acc, { businessUnit: [value] });
      case "team":
        return applyFilters(acc, { team: [value] });
      case "sub_team":
        return applyFilters(acc, { subTeam: [value] });
      case "vendor":
        return applyFilters(acc, { vendor: [value] });
      case "persona":
        return applyFilters(acc, { persona: [value] });
      case "ai_theme":
        return applyFilters(acc, { aiTheme: [value] });
      case "ai_model":
        return applyFilters(acc, { aiModel: [value] });
      default:
        return acc;
    }
  }, items);
};

const sortItems = (
  items: GalleryUseCase[],
  sortBy?: keyof GalleryUseCaseListItem,
  sortDir: SortDir = "asc",
) => {
  if (!sortBy) return items;
  const direction = sortDir === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const left = String(a[sortBy] ?? "");
    const right = String(b[sortBy] ?? "");
    return left.localeCompare(right) * direction;
  });
};

const toListItem = (useCase: GalleryUseCase): GalleryUseCaseListItem => ({
  id: useCase.id,
  title: useCase.title,
  phase: useCase.phase,
  status: useCase.status,
  businessUnit: useCase.businessUnit,
  team: useCase.team,
  subTeam: useCase.subTeam,
  vendorName: useCase.vendorName,
  aiModel: useCase.aiModel,
  aiThemes: useCase.aiThemes,
  personas: useCase.personas,
  bgColor: useCase.bgColor,
});

export const listUseCases = (query: UseCaseQuery): GalleryListResponse => {
  const filtered = applyFilters(
    applyFilterKeyValuePairs(galleryUseCases, query),
    query,
  );
  const sorted = sortItems(filtered, query.sortBy, query.sortDir);
  const skip = query.skip ?? 0;
  const limit = query.limit ?? sorted.length;
  const items = sorted.slice(skip, skip + limit).map(toListItem);
  return {
    items,
    total: filtered.length,
  };
};

export const getUseCaseById = (id: number): GalleryUseCase | null =>
  galleryUseCases.find((useCase) => useCase.id === id) ?? null;

export const getUseCaseFilters = (): GalleryFiltersResponse => {
  const statuses = uniqueSorted(galleryUseCases.map((item) => item.status));
  const phases = uniqueSorted(galleryUseCases.map((item) => item.phase));
  const personas = uniqueSorted(galleryUseCases.flatMap((item) => item.personas));
  const aiThemes = uniqueSorted(galleryUseCases.flatMap((item) => item.aiThemes));

  const vendorsMap = new Map<string, Set<string>>();
  const businessUnitMap = new Map<string, Map<string, Set<string>>>();

  galleryUseCases.forEach((item) => {
    if (!vendorsMap.has(item.vendorName)) {
      vendorsMap.set(item.vendorName, new Set());
    }
    vendorsMap.get(item.vendorName)?.add(item.aiModel);

    if (!businessUnitMap.has(item.businessUnit)) {
      businessUnitMap.set(item.businessUnit, new Map());
    }
    const teams = businessUnitMap.get(item.businessUnit);
    if (!teams?.has(item.team)) {
      teams?.set(item.team, new Set());
    }
    teams?.get(item.team)?.add(item.subTeam);
  });

  return {
    statuses,
    phases,
    personas,
    aiThemes,
    vendors: Array.from(vendorsMap.entries()).map(([name, models]) => ({
      name,
      models: uniqueSorted(Array.from(models)),
    })),
    businessUnits: Array.from(businessUnitMap.entries()).map(
      ([name, teams]) => ({
        name,
        teams: Array.from(teams.entries()).map(([teamName, subTeams]) => ({
          name: teamName,
          subTeams: uniqueSorted(Array.from(subTeams)),
        })),
      }),
    ),
  };
};

export const findSimilarUseCases = (query: string): GalleryUseCaseListItem[] => {
  if (!query.trim()) {
    return galleryUseCases.map(toListItem);
  }
  const term = normalize(query);
  const scored = galleryUseCases
    .map((item) => {
      const haystack = [
        item.title,
        item.businessUnit,
        item.team,
        item.subTeam,
        item.vendorName,
        item.aiModel,
        ...item.aiThemes,
        ...item.personas,
      ]
        .join(" ")
        .toLowerCase();
      const score = haystack.includes(term) ? 1 : 0;
      return { item, score };
    })
    .filter((entry) => entry.score > 0);

  return scored.length
    ? scored.map((entry) => toListItem(entry.item))
    : galleryUseCases.map(toListItem);
};
