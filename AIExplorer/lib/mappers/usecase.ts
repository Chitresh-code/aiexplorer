import type { UseCaseDetail, UseCasePhasePlan, UseCaseSummary } from "@/lib/types/usecase";

const toNumber = (value: unknown): number | null => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const normalizePhasePlan = (raw: unknown): UseCasePhasePlan[] => {
  if (!raw) return [];
  const rows = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

  return rows
    .map((entry) => ({
      phaseId: toNumber((entry as any)?.phaseId ?? (entry as any)?.phaseid),
      phaseName: toStringValue((entry as any)?.phaseName ?? (entry as any)?.phasename),
      startDate: toStringValue((entry as any)?.startDate ?? (entry as any)?.startdate),
      endDate: toStringValue((entry as any)?.endDate ?? (entry as any)?.enddate),
    }))
    .filter((entry) => entry.phaseId !== null);
};

export const normalizeUseCaseSummary = (raw: Record<string, unknown>): UseCaseSummary | null => {
  const id = toNumber(raw.id ?? raw.ID);
  if (id === null) return null;

  return {
    id,
    title: toStringValue(raw.title ?? raw.Title ?? raw.UseCase ?? raw.useCase ?? ""),
    phase: toStringValue(raw.phase ?? raw.Phase ?? ""),
    phaseId: toNumber(raw.phaseId ?? raw.PhaseId ?? raw.phaseid),
    statusName: toStringValue(raw.statusName ?? raw.Status ?? raw.statusname),
    statusColor: toStringValue(raw.statusColor ?? raw.StatusColor ?? raw.statuscolor),
    businessUnitName: toStringValue(
      raw.businessUnitName ?? raw.BusinessUnitName ?? raw.BusinessUnit,
    ),
    teamName: toStringValue(raw.teamName ?? raw.TeamName ?? raw["Team Name"]),
    priority: toNumber(raw.priority ?? raw.Priority),
    deliveryTimespan: toStringValue(raw.deliveryTimespan ?? raw.Delivery ?? ""),
    primaryContact: toStringValue(raw.primaryContact ?? raw.primarycontact ?? ""),
    headlines: toStringValue(raw.headlines ?? raw.Headline ?? ""),
    opportunity: toStringValue(raw.opportunity ?? ""),
    businessValue: toStringValue(raw.businessValue ?? raw.business_value ?? ""),
    informationUrl: toStringValue(raw.informationUrl ?? raw.informationurl ?? ""),
    productChecklist: toStringValue(raw.productChecklist ?? raw.productchecklist ?? "") || null,
    eseDependency: toStringValue(raw.eseDependency ?? raw.esedependency ?? ""),
    phasePlan: normalizePhasePlan(raw.phasePlan ?? raw.phaseplan),
  };
};

export const normalizeUseCaseDetail = (
  raw: Record<string, unknown>,
): UseCaseDetail | null => {
  const summary = normalizeUseCaseSummary(raw);
  if (!summary) return null;
  return {
    ...summary,
    phaseStage: toStringValue(raw.phaseStage ?? raw.phasestage ?? ""),
    editorEmail: toStringValue(raw.editorEmail ?? raw.editor_email ?? ""),
  };
};
