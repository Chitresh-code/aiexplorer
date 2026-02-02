import type { UseCaseDetail, UseCasePhasePlan, UseCaseSummary } from "@/lib/types/usecase";

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const parseIdList = (value: unknown): number[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => Number(entry))
      .filter((num) => Number.isFinite(num));
  }
  const text = String(value).trim();
  if (!text) return [];
  return text
    .split(",")
    .map((segment) => Number(segment.trim()))
    .filter((segment) => Number.isFinite(segment));
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
    vendorModelId: toNumber(
      raw.vendorModelId ?? raw.vendormodelid ?? raw.vendorModel ?? raw.vendor ?? null,
    ),
    aiThemeIds: parseIdList(raw.aiThemeIds ?? raw.aithemeids ?? raw.aiThemes ?? null),
    personaIds: parseIdList(raw.personaIds ?? raw.personaids ?? raw.personas ?? null),
    useCasePhaseApprovalId: toNumber(
      raw.useCasePhaseApprovalId ?? raw.usecasephaseapprovalid ?? raw.approvalId ?? null,
    ),
    approvalUseCaseId: toNumber(
      raw.approvalUseCaseId ?? raw.approvalusecaseid ?? null,
    ),
    approvalPhaseId: toNumber(
      raw.approvalPhaseId ?? raw.approvalphaseid ?? null,
    ),
    approvalStatus: toStringValue(raw.approvalStatus ?? raw.approvalstatus ?? ""),
    approvalStatusInt: toNumber(
      raw.approvalStatusInt ?? raw.approvalstatusint ?? null,
    ),
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
