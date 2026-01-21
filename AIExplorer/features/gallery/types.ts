export type SortDir = "asc" | "desc";

export type GalleryUseCase = {
  id: number;
  title: string;
  phase: string;
  status: string;
  businessUnit: string;
  team: string;
  subTeam: string;
  vendorName: string;
  aiModel: string;
  aiThemes: string[];
  personas: string[];
  bgColor: string;
  headline: string;
  opportunity: string;
  evidence: string;
  primaryContact: string;
};

export type GalleryUseCaseListItem = Pick<
  GalleryUseCase,
  | "id"
  | "title"
  | "phase"
  | "status"
  | "businessUnit"
  | "team"
  | "subTeam"
  | "vendorName"
  | "aiModel"
  | "aiThemes"
  | "personas"
  | "bgColor"
>;

export type GalleryListResponse = {
  items: GalleryUseCaseListItem[];
  total: number;
};

export type GalleryFiltersResponse = {
  statuses: string[];
  phases: string[];
  personas: string[];
  aiThemes: string[];
  vendors: { name: string; models: string[] }[];
  businessUnits: {
    name: string;
    teams: { name: string; subTeams: string[] }[];
  }[];
};

export type UseCaseQuery = {
  search?: string;
  status?: string[];
  phase?: string[];
  businessUnit?: string[];
  team?: string[];
  subTeam?: string[];
  vendor?: string[];
  persona?: string[];
  aiTheme?: string[];
  aiModel?: string[];
  sortBy?: keyof GalleryUseCaseListItem;
  sortDir?: SortDir;
  skip?: number;
  limit?: number;
  filterKey?: string[];
  filterValue?: string[];
};
