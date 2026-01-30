import { pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";
import type {
  ChecklistItem,
  MetricItem,
  PlanItem,
  ReportedMetricItem,
  StakeholderItem,
  UpdateItem,
} from "@/lib/types/usecase-details";

const normalizeRowArray = (rows?: Record<string, unknown>[]) =>
  Array.isArray(rows) ? rows : [];

export const normalizePlanItems = (rows?: Record<string, unknown>[]): PlanItem[] =>
  normalizeRowArray(rows)
    .map((row) => ({
      id: toNumberValue(pickValue(row, ["id", "ID"])),
      useCaseId: toNumberValue(pickValue(row, ["usecaseid", "useCaseId", "UseCaseId"])),
      useCasePhaseId: toNumberValue(
        pickValue(row, ["usecasephaseid", "useCasePhaseId", "phaseId", "PhaseId"]),
      ),
      phaseName: toStringValue(pickValue(row, ["phasename", "phaseName", "phase", "Phase"])),
      startDate: toStringValue(pickValue(row, ["startdate", "startDate", "StartDate"])) || null,
      endDate: toStringValue(pickValue(row, ["enddate", "endDate", "EndDate"])) || null,
      modified: toStringValue(pickValue(row, ["modified", "Modified"])) || null,
      created: toStringValue(pickValue(row, ["created", "Created"])) || null,
      editorEmail: toStringValue(pickValue(row, ["editor_email", "editorEmail", "EditorEmail"])) || null,
    }))
    .filter((row) => row.id !== null || row.useCasePhaseId !== null);

export const normalizeStakeholderItems = (rows?: Record<string, unknown>[]): StakeholderItem[] =>
  normalizeRowArray(rows)
    .map((row) => ({
      id: toNumberValue(pickValue(row, ["id", "ID"])),
      useCaseId: toNumberValue(pickValue(row, ["usecaseid", "useCaseId", "UseCaseId"])),
      roleId: toNumberValue(pickValue(row, ["roleid", "roleId", "RoleId"])),
      roleName: toStringValue(pickValue(row, ["role_name", "roleName", "role", "Role"])) || null,
      stakeholderEmail:
        toStringValue(pickValue(row, ["stakeholder_email", "stakeholderEmail"])) || null,
      modified: toStringValue(pickValue(row, ["modified", "Modified"])) || null,
      created: toStringValue(pickValue(row, ["created", "Created"])) || null,
      editorEmail: toStringValue(pickValue(row, ["editor_email", "editorEmail", "EditorEmail"])) || null,
    }))
    .filter((row) => row.id !== null || row.roleId !== null || row.stakeholderEmail);

export const normalizeUpdateItems = (rows?: Record<string, unknown>[]): UpdateItem[] =>
  normalizeRowArray(rows)
    .map((row) => ({
      id: toNumberValue(pickValue(row, ["id", "ID"])),
      useCaseId: toNumberValue(pickValue(row, ["usecaseid", "useCaseId", "UseCaseId"])),
      meaningfulUpdate:
        toStringValue(pickValue(row, ["meaningfulupdate", "meaningfulUpdate"])) || null,
      roleId: toNumberValue(pickValue(row, ["roleid", "roleId", "RoleId"])),
      roleName: toStringValue(pickValue(row, ["role_name", "roleName", "role", "Role"])) || null,
      useCasePhaseId: toNumberValue(
        pickValue(row, ["usecasephaseid", "useCasePhaseId", "phaseId", "PhaseId"]),
      ),
      phaseName: toStringValue(pickValue(row, ["phase_name", "phaseName", "phase"])) || null,
      useCaseStatusId: toNumberValue(
        pickValue(row, ["usecasestatusid", "useCaseStatusId", "statusId", "StatusId"]),
      ),
      statusName: toStringValue(pickValue(row, ["status_name", "statusName", "status"])) || null,
      statusColor: toStringValue(pickValue(row, ["status_color", "statusColor"])) || null,
      modified: toStringValue(pickValue(row, ["modified", "Modified"])) || null,
      created: toStringValue(pickValue(row, ["created", "Created"])) || null,
      editorEmail: toStringValue(pickValue(row, ["editor_email", "editorEmail", "EditorEmail"])) || null,
    }))
    .filter((row) => row.id !== null || row.meaningfulUpdate);

export const normalizeMetricItems = (rows?: Record<string, unknown>[]): MetricItem[] =>
  normalizeRowArray(rows)
    .map((row) => ({
      id: toNumberValue(pickValue(row, ["id", "ID"])),
      useCaseId: toNumberValue(pickValue(row, ["usecaseid", "useCaseId", "UseCaseId"])),
      metricTypeId: toNumberValue(pickValue(row, ["metrictypeid", "metricTypeId"])),
      unitOfMeasureId: toNumberValue(pickValue(row, ["unitofmeasureid", "unitOfMeasureId"])),
      primarySuccessMetricName:
        toStringValue(
          pickValue(row, ["primarysuccessmetricname", "primarySuccessMetricName"]),
        ) || null,
      baselineValue: toStringValue(pickValue(row, ["baselinevalue", "baselineValue"])) || null,
      baselineDate: toStringValue(pickValue(row, ["baselinedate", "baselineDate"])) || null,
      targetValue: toStringValue(pickValue(row, ["targetvalue", "targetValue"])) || null,
      targetDate: toStringValue(pickValue(row, ["targetdate", "targetDate"])) || null,
      modified: toStringValue(pickValue(row, ["modified", "Modified"])) || null,
      created: toStringValue(pickValue(row, ["created", "Created"])) || null,
      editorEmail: toStringValue(pickValue(row, ["editor_email", "editorEmail", "EditorEmail"])) || null,
    }))
    .filter((row) => row.id !== null || row.primarySuccessMetricName);

export const normalizeReportedMetricItems = (
  rows?: Record<string, unknown>[],
): ReportedMetricItem[] =>
  normalizeRowArray(rows)
    .map((row) => ({
      id: toNumberValue(pickValue(row, ["id", "ID"])),
      useCaseId: toNumberValue(pickValue(row, ["usecaseid", "useCaseId", "UseCaseId"])),
      metricId: toNumberValue(pickValue(row, ["metricid", "metricId", "MetricId"])),
      reportedValue: toStringValue(pickValue(row, ["reportedvalue", "reportedValue"])) || null,
      reportedDate: toStringValue(pickValue(row, ["reporteddate", "reportedDate"])) || null,
      modified: toStringValue(pickValue(row, ["modified", "Modified"])) || null,
      created: toStringValue(pickValue(row, ["created", "Created"])) || null,
      editorEmail: toStringValue(pickValue(row, ["editor_email", "editorEmail", "EditorEmail"])) || null,
    }))
    .filter((row) => row.id !== null || row.metricId !== null);

export const normalizeChecklistItems = (rows?: Record<string, unknown>[]): ChecklistItem[] =>
  normalizeRowArray(rows)
    .map((row) => ({
      questionId: toNumberValue(pickValue(row, ["questionid", "questionId"])),
      response: toStringValue(pickValue(row, ["response", "Response"])) || null,
    }))
    .filter((row) => row.questionId !== null || row.response);
