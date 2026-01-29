import axios from "axios";

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  // Validate envUrl is a proper URL starting with http/https
  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
    try {
      new URL(envUrl); // rigorous check
      return envUrl;
    } catch {
      console.warn("Invalid NEXT_PUBLIC_API_URL, falling back to auto-detection");
    }
  }

  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:8000";
  }
  return "https://eai-aihub-backend-dev.happywave-248a4bd8.eastus2.azurecontainerapps.io";
};

const API_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export const fetchUseCases = async () => {
  const response = await apiClient.get("/api/usecases?view=list");
  const data = response.data;
  return Array.isArray(data?.items) ? data.items : data;
};

export const fetchUseCase = async (id: string | number) => {
  const response = await apiClient.get(`/api/usecases/${id}`);
  return response.data;
};

export const createUseCase = async (payload: unknown) => {
  const response = await apiClient.post("/api/usecases", payload);
  return response.data;
};

export const updateUseCase = async (id: string | number, payload: unknown) => {
  const response = await apiClient.put(`/api/usecases/${id}`, payload);
  return response.data;
};

export const updateUseCaseInfo = async (
  id: string | number,
  payload: {
    title?: string;
    headlines?: string;
    opportunity?: string;
    businessValue?: string;
    editorEmail?: string;
  },
) => {
  const response = await fetch(`/api/usecases/${id}/info`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Failed to update use case info.");
  }
  return response.json();
};

export const updateUseCaseMetrics = async (
  id: string | number,
  payload: {
    newMetrics?: Array<{
      metricTypeId: number | null;
      unitOfMeasureId: number | null;
      primarySuccessMetricName: string;
      baselineValue?: string | number | null;
      baselineDate?: string | null;
      targetValue?: string | number | null;
      targetDate?: string | null;
    }>;
    updateMetrics?: Array<{
      id: number;
      metricTypeId?: number | null;
      unitOfMeasureId?: number | null;
      primarySuccessMetricName?: string | null;
      baselineValue?: string | number | null;
      baselineDate?: string | null;
      targetValue?: string | number | null;
      targetDate?: string | null;
    }>;
    deleteMetricIds?: number[];
    newReportedMetrics?: Array<{
      metricId: number;
      reportedValue?: string | number | null;
      reportedDate?: string | null;
    }>;
    updateReportedMetrics?: Array<{
      id: number;
      reportedValue?: string | number | null;
      reportedDate?: string | null;
    }>;
    deleteReportedMetricIds?: number[];
    editorEmail?: string;
  },
) => {
  const response = await fetch(`/api/usecases/${id}/metrics`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Failed to update use case metrics.");
  }
  return response.json();
};

export const deleteUseCase = async (id: string | number) => {
  await apiClient.delete(`/api/usecases/${id}`);
};

export const fetchMetrics = async (useCaseId: string | number) => {
  const response = await apiClient.get(`/api/metrics/${useCaseId}`);
  return response.data;
};

export const createMetric = async (payload: unknown) => {
  const response = await apiClient.post("/api/metrics", payload);
  return response.data;
};

export const fetchUpdates = async (useCaseId: string | number) => {
  const response = await apiClient.get(`/api/updates/${useCaseId}`);
  return response.data;
};

export const createUpdate = async (payload: unknown) => {
  const response = await apiClient.post("/api/updates", payload);
  return response.data;
};

export const fetchDecisions = async (useCaseId: string | number) => {
  const response = await apiClient.get(`/api/decisions/${useCaseId}`);
  return response.data;
};

export const createDecision = async (payload: unknown) => {
  const response = await apiClient.post("/api/decisions", payload);
  return response.data;
};

export const fetchStatusMappings = async () => {
  const response = await apiClient.get("/api/status-mappings");
  return response.data;
};

export const fetchBusinessUnits = async () => {
  const response = await apiClient.get("/api/business-units");
  return response.data;
};

// Additional use case endpoints
export const fetchUseCasesWithFilters = async (params?: {
  skip?: number;
  limit?: number;
  status?: string;
  phase?: string;
  business_unit?: string;
}) => {
  const response = await apiClient.get("/api/usecases?view=list");
  const data = response.data;
  return Array.isArray(data?.items) ? data.items : data;
};

export const fetchPreviousWeekUseCases = async () => {
  const response = await apiClient.get("/api/usecases/kpi/previous-week");
  return response.data;
};

export const fetchImplementedUseCases = async () => {
  const response = await apiClient.get("/api/usecases/kpi/implemented");
  return response.data;
};

export const fetchSubmissionTimeline = async () => {
  const response = await apiClient.get("/api/usecases/timeline/submissions");
  return response.data;
};

export const fetchRecentUseCases = async (limit?: number) => {
  const queryParams = limit ? `?limit=${limit}` : '';
  const response = await apiClient.get(`/api/usecases/recent${queryParams}`);
  return response.data;
};

export const createStakeholder = async (usecaseId: string | number, payload: unknown) => {
  const response = await apiClient.post(`/api/usecases/${usecaseId}/stakeholders`, payload);
  return response.data;
};

export const createPlan = async (usecaseId: string | number, payload: unknown) => {
  const response = await apiClient.post(`/api/usecases/${usecaseId}/plan`, payload);
  return response.data;
};

// Additional lookup endpoints
export const fetchAIThemes = async () => {
  const response = await apiClient.get("/api/ai-themes");
  return response.data;
};

export const fetchPersonas = async () => {
  const response = await apiClient.get("/api/personas");
  return response.data;
};

export const fetchVendors = async () => {
  const response = await apiClient.get("/api/vendors");
  return response.data;
};

export const fetchAIModelsHierarchy = async () => {
  const response = await apiClient.get("/api/aimodels");
  return response.data;
};

export const fetchBusinessStructureHierarchy = async () => {
  const response = await apiClient.get("/api/business-structure");
  return response.data;
};

export const fetchRolesHierarchy = async () => {
  const response = await apiClient.get("/api/roles");
  return response.data;
};

export const fetchDropdownData = async () => {
  const response = await apiClient.get("/api/dropdown-data");
  return response.data;
};

export const fetchChampionsForBusinessUnit = async (businessUnit: string) => {
  const response = await apiClient.get(`/api/business-units/stakeholder/${encodeURIComponent(businessUnit)}`);
  return response.data;
};

export const fetchAllChampionNames = async () => {
  const response = await apiClient.get("/api/champions");
  return response.data;
};

// Health check endpoint
export const fetchHealthCheck = async () => {
  const response = await apiClient.get("/health");
  return response.data;
};
