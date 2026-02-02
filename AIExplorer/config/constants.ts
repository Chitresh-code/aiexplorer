/**
 * Application Constants
 * 
 * Centralized configuration for the entire application.
 * Update these constants to modify application-wide behavior.
 */

/**
 * API Configuration
 * All API endpoints and timeout settings
 */
export const API_CONFIG = {
  /** Base API timeout in milliseconds */
  TIMEOUT: 30000,
  
  /** API endpoints */
  ENDPOINTS: {
    USECASES: "/api/usecases",
    USECASES_DETAILS: (id: number | string): string => `/api/usecases/${id}`,
    USECASES_SIMILAR: "/api/usecases/similar",
    AI_SUGGESTIONS: {
      USECASE: "/api/ai/suggestions/usecase",
      METRIC: "/api/ai/suggestions/metric",
      PHASE: "/api/ai/suggestions/phase",
    },
    STAKEHOLDERS: "/api/stakeholders",
    METRICS: (id: number | string): string => `/api/usecases/${id}/metrics`,
    CHAMPION: "/api/champion",
    MAPPINGS: "/api/mappings",
    HEALTH: "/api/health",
  },
} as const;

/**
 * Route Configuration
 * Application routes and navigation paths
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  AUTH_POPUP: "/auth/popup",
  DASHBOARD: "/",
  GALLERY: "/gallery",
  GALLERY_DETAIL: (id: number | string): string => `/gallery/${id}`,
  SUBMIT_USE_CASE: "/submit-use-case",
  MY_USE_CASES: "/my-use-cases",
  USE_CASE_DETAILS: (id: number | string): string => `/use-case-details/${id}`,
  METRIC_REPORTING: "/metric-reporting",
  CHAMPION: "/champion",
} as const;

/**
 * Cache Configuration
 * Cache control and revalidation settings
 */
export const CACHE_CONFIG = {
  /** Default cache control header value */
  NO_CACHE: "no-store",
  
  /** Cache revalidation times (in seconds) */
  REVALIDATE: {
    USECASES: 300, // 5 minutes
    METRICS: 600, // 10 minutes
    GALLERY: 300, // 5 minutes
  },
} as const;

/**
 * Error Configuration
 * Error handling and user messaging
 */
export const ERROR_CONFIG = {
  /** Default error messages for user display */
  MESSAGES: {
    DEFAULT: "An unexpected error occurred. Please try again.",
    LOAD_USECASES: "Failed to load use cases.",
    LOAD_METRICS: "Failed to load metrics.",
    CREATE_USECASE: "Failed to create use case.",
    UPDATE_USECASE: "Failed to update use case.",
    LOAD_STAKEHOLDERS: "Failed to load stakeholders.",
    NETWORK_ERROR: "Network error. Please check your connection.",
  },
} as const;

/**
 * Validation Configuration
 * Input validation rules and constraints
 */
export const VALIDATION_CONFIG = {
  /** Field length constraints */
  LENGTHS: {
    MIN_TITLE: 3,
    MAX_TITLE: 255,
    MIN_DESCRIPTION: 10,
    MAX_DESCRIPTION: 5000,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  /** Pagination settings */
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
} as const;

/**
 * UI Configuration
 * User interface behavior and thresholds
 */
export const UI_CONFIG = {
  /** Loading state timeout in milliseconds */
  LOADING_DELAY: 200,
  
  /** Debounce delays for search and input (in milliseconds) */
  DEBOUNCE: {
    SEARCH: 300,
    INPUT: 500,
  },
  
  /** Animation durations (in milliseconds) */
  ANIMATION: {
    TRANSITION: 300,
    MODAL: 400,
  },
  
  /** Toast notification settings */
  TOAST: {
    DURATION: 3000,
    MAX_VISIBLE: 5,
  },
} as const;

/**
 * Database Configuration
 * Database-related settings
 */
export const DB_CONFIG = {
  /** Stored procedure names */
  PROCEDURES: {
    GET_USECASES: "dbo.GetUseCases",
    CREATE_USECASE: "dbo.CreateUseCase",
    UPDATE_USECASE: "dbo.UpdateUseCase",
  },
  
  /** Query parameter names */
  PARAMS: {
    ROLE: "Role",
    EMAIL: "Email",
    VIEW: "View",
    BUSINESS_UNIT_ID: "BusinessUnitId",
    PHASE_ID: "PhaseId",
    STATUS_ID: "StatusId",
  },
} as const;

/**
 * Feature Flags
 * Feature availability and experimental features
 */
export const FEATURE_FLAGS = {
  /** Enable approval flow for business unit 38 */
  APPROVAL_FLOW_GATED: true,
  APPROVAL_FLOW_BUSINESS_UNIT_ID: 38,
  
  /** Enable AI suggestions features */
  AI_SUGGESTIONS_ENABLED: true,
  
  /** Enable metric tracking */
  METRICS_ENABLED: true,
  
  /** Enable champion features */
  CHAMPION_FEATURES_ENABLED: true,
} as const;

/**
 * Azure MSAL Configuration
 * Azure authentication settings
 */
export const AUTH_CONFIG = {
  /** Logout redirect URIs */
  LOGOUT_REDIRECT: "/login",
  
  /** Post-logout redirect behavior */
  MAIN_WINDOW_REDIRECT: "/login",
} as const;

/**
 * Type-safe environment variable accessor
 * Use this to access environment variables with type safety
 */
export const getEnvConfig = (): {
  powerAutomateApprovalFlowUrl: string;
  nodeEnv: "development" | "production" | "test";
} => {
  return {
    powerAutomateApprovalFlowUrl:
      process.env.POWER_AUTOMATE_APPROVAL_FLOW_URL?.trim() ?? "",
    nodeEnv: (process.env.NODE_ENV as "development" | "production" | "test") ?? "development",
  };
};
