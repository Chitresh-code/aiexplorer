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
};

interface UseCaseDetailsState {
  data: UseCaseDetailsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUseCaseDetails = (id?: string): UseCaseDetailsState => {
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
      const response = await fetch(`/api/usecases/${id}`, {
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
  }, [id]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  return { data, loading, error, refetch: loadDetails };
};
