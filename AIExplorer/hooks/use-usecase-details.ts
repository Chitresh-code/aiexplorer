'use client';

import { useCallback, useEffect, useState } from "react";
import { normalizeUseCaseDetail } from "@/lib/mappers/usecase";
import {
  normalizeChecklistItems,
  normalizeMetricItems,
  normalizePlanItems,
  normalizeReportedMetricItems,
  normalizeStakeholderItems,
  normalizeUpdateItems,
} from "@/lib/mappers/usecase-details";
import type { UseCaseDetail as NormalizedUseCaseDetail } from "@/lib/types/usecase";
import type {
  ChecklistItem,
  MetricItem,
  PlanItem,
  ReportedMetricItem,
  StakeholderItem,
  UpdateItem,
} from "@/lib/types/usecase-details";

export type UseCaseDetail = NormalizedUseCaseDetail;

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
  plan?: PlanItem[];
  prioritize?: Record<string, unknown> | null;
  metrics?: { items?: MetricItem[]; reported?: ReportedMetricItem[] };
  stakeholders?: StakeholderItem[];
  updates?: UpdateItem[];
  checklist?: ChecklistItem[];
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
      const normalizedUseCase = payload?.useCase
        ? normalizeUseCaseDetail(payload.useCase as Record<string, unknown>)
        : null;
      const normalizedPlan = normalizePlanItems(
        (payload?.plan ?? []) as Record<string, unknown>[],
      );
      const normalizedStakeholders = normalizeStakeholderItems(
        (payload?.stakeholders ?? []) as Record<string, unknown>[],
      );
      const normalizedUpdates = normalizeUpdateItems(
        (payload?.updates ?? []) as Record<string, unknown>[],
      );
      const normalizedChecklist = normalizeChecklistItems(
        (payload?.checklist ?? []) as Record<string, unknown>[],
      );
      const normalizedMetrics = payload?.metrics
        ? {
            items: normalizeMetricItems(
              (payload.metrics.items ?? []) as Record<string, unknown>[],
            ),
            reported: normalizeReportedMetricItems(
              (payload.metrics.reported ?? []) as Record<string, unknown>[],
            ),
          }
        : undefined;
      setData(
        payload
          ? {
              ...payload,
              useCase: normalizedUseCase ?? payload.useCase,
              plan: normalizedPlan,
              stakeholders: normalizedStakeholders,
              updates: normalizedUpdates,
              checklist: normalizedChecklist,
              metrics: normalizedMetrics,
            }
          : null,
      );
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
