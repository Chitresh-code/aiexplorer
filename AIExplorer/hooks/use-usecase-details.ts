'use client';

import { useCallback, useEffect, useState } from "react";

export type UseCaseDetail = {
  id?: number;
  title?: string;
  headlines?: string;
  opportunity?: string;
  businessValue?: string;
  subteamname?: string;
  informationurl?: string;
  modified?: string;
  created?: string;
  primarycontact?: string;
  editor_email?: string;
  businessunitid?: number;
  businessUnitName?: string;
  teamName?: string;
  phaseid?: number;
  phase?: string;
  phaseStage?: string;
  statusid?: number;
  statusName?: string;
  statusColor?: string;
};

export type AgentLibraryItem = {
  id?: number;
  usecaseid?: number;
  vendormodelid?: number;
  vendorName?: string;
  productName?: string;
  aiThemeIds?: number[];
  personaIds?: number[];
  knowledgeSourceIds?: number[];
  agentid?: string | null;
  agentlink?: string | null;
  prompt?: string | null;
  modified?: string | null;
  created?: string | null;
  editor_email?: string | null;
};

export type PersonaItem = {
  usecaseid?: number;
  personaid?: number;
  personaName?: string;
};

export type ThemeItem = {
  usecaseid?: number;
  aithemeid?: number;
  themeName?: string;
};

type UseCaseDetailsResponse = {
  useCase?: UseCaseDetail;
  agentLibrary?: AgentLibraryItem[];
  personas?: PersonaItem[];
  themes?: ThemeItem[];
  plan?: Record<string, unknown>[];
  prioritize?: Record<string, unknown> | null;
  metrics?: { items?: Record<string, unknown>[]; reported?: Record<string, unknown>[] };
  stakeholders?: Record<string, unknown>[];
  updates?: Record<string, unknown>[];
  checklist?: Record<string, unknown>[];
};

type UseCaseDetailsOptions = {
  type?: "gallery" | "owner" | "champion";
  include?: string[];
  all?: boolean;
  email?: string;
};

interface UseCaseDetailsState {
  data: UseCaseDetailsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUseCaseDetails = (
  id?: string,
  options?: UseCaseDetailsOptions,
): UseCaseDetailsState => {
  const [data, setData] = useState<UseCaseDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    if (!id) {
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (options?.type) params.set("type", options.type);
      if (options?.email) params.set("email", options.email);
      if (options?.all) params.set("all", "true");
      if (options?.include?.length) {
        params.set("include", options.include.join(","));
      }
      const query = params.toString();
      const response = await fetch(`/api/usecases/${id}${query ? `?${query}` : ""}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        const details = await response.text().catch(() => "");
        throw new Error(details || "Failed to load use case details.");
      }
      const payload = (await response.json()) as UseCaseDetailsResponse;
      setData(payload ?? null);
      setError(null);
    } catch (err) {
      console.error("Failed to load use case details", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id, options?.all, options?.email, options?.include, options?.type]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  return { data, loading, error, refetch: loadDetails };
};
