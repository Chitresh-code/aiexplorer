import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
type UpdateMetricItem = {
  id: number;
  metricTypeId?: number | null;
  unitOfMeasureId?: number | null;
  primarySuccessMetricName?: string | null;
  baselineValue?: string | number | null;
  baselineDate?: string | null;
  targetValue?: string | number | null;
  targetDate?: string | null;
};

type NewMetricItem = {
  metricTypeId: number | null;
  unitOfMeasureId: number | null;
  primarySuccessMetricName: string;
  baselineValue?: string | number | null;
  baselineDate?: string | null;
  targetValue?: string | number | null;
  targetDate?: string | null;
};

type UpdateReportedItem = {
  id: number;
  reportedValue?: string | number | null;
  reportedDate?: string | null;
};

type NewReportedItem = {
  metricId: number;
  reportedValue?: string | number | null;
  reportedDate?: string | null;
};

type MetricsPatchPayload = {
  newMetrics?: NewMetricItem[];
  updateMetrics?: UpdateMetricItem[];
  deleteMetricIds?: number[];
  newReportedMetrics?: NewReportedItem[];
  updateReportedMetrics?: UpdateReportedItem[];
  deleteReportedMetricIds?: number[];
  editorEmail?: string;
};

const isNonEmptyString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

const isPresentValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return false;
};

const parseDateValue = (value: string | null | undefined) => {
  if (!value || typeof value !== "string") return null;
  const parts = value.split("-");
  if (parts.length !== 3) return null;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

export const PATCH = async (
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) => {
  const params = await Promise.resolve(context.params);
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as MetricsPatchPayload;
    const newMetrics = Array.isArray(payload.newMetrics) ? payload.newMetrics : [];
    const updateMetrics = Array.isArray(payload.updateMetrics) ? payload.updateMetrics : [];
    const deleteMetricIds = Array.isArray(payload.deleteMetricIds)
      ? payload.deleteMetricIds
      : [];
    const newReported = Array.isArray(payload.newReportedMetrics)
      ? payload.newReportedMetrics
      : [];
    const updateReported = Array.isArray(payload.updateReportedMetrics)
      ? payload.updateReportedMetrics
      : [];
    const deleteReportedIds = Array.isArray(payload.deleteReportedMetricIds)
      ? payload.deleteReportedMetricIds
      : [];

    const validationErrors: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    newMetrics.forEach((item, index) => {
      if (!Number.isFinite(Number(item.metricTypeId))) {
        validationErrors.push(`newMetrics[${index}].metricTypeId is required`);
      }
      if (!Number.isFinite(Number(item.unitOfMeasureId))) {
        validationErrors.push(`newMetrics[${index}].unitOfMeasureId is required`);
      }
      if (!isNonEmptyString(item.primarySuccessMetricName)) {
        validationErrors.push(
          `newMetrics[${index}].primarySuccessMetricName is required`,
        );
      }
      if (!isPresentValue(item.baselineValue)) {
        validationErrors.push(`newMetrics[${index}].baselineValue is required`);
      }
      const baselineDate = parseDateValue(item.baselineDate ?? null);
      if (!baselineDate) {
        validationErrors.push(`newMetrics[${index}].baselineDate is required`);
      }
      if (!isPresentValue(item.targetValue)) {
        validationErrors.push(`newMetrics[${index}].targetValue is required`);
      }
      const targetDate = parseDateValue(item.targetDate ?? null);
      if (!targetDate) {
        validationErrors.push(`newMetrics[${index}].targetDate is required`);
      }
      if (baselineDate && targetDate) {
        if (!(targetDate > baselineDate)) {
          validationErrors.push(
            `newMetrics[${index}].targetDate must be after baselineDate`,
          );
        }
        if (!(targetDate > today)) {
          validationErrors.push(
            `newMetrics[${index}].targetDate must be after today`,
          );
        }
      }
    });

    const updateMetricIdsNeedingDates = new Set<number>();
    updateMetrics.forEach((item, index) => {
      const metricId = Number(item.id);
      if (!Number.isFinite(metricId)) {
        validationErrors.push(`updateMetrics[${index}].id is invalid`);
        return;
      }
      if (Object.prototype.hasOwnProperty.call(item, "metricTypeId")) {
        if (!Number.isFinite(Number(item.metricTypeId))) {
          validationErrors.push(`updateMetrics[${index}].metricTypeId is required`);
        }
      }
      if (Object.prototype.hasOwnProperty.call(item, "unitOfMeasureId")) {
        if (!Number.isFinite(Number(item.unitOfMeasureId))) {
          validationErrors.push(
            `updateMetrics[${index}].unitOfMeasureId is required`,
          );
        }
      }
      if (Object.prototype.hasOwnProperty.call(item, "primarySuccessMetricName")) {
        if (!isNonEmptyString(item.primarySuccessMetricName)) {
          validationErrors.push(
            `updateMetrics[${index}].primarySuccessMetricName is required`,
          );
        }
      }
      if (Object.prototype.hasOwnProperty.call(item, "baselineValue")) {
        if (!isPresentValue(item.baselineValue)) {
          validationErrors.push(
            `updateMetrics[${index}].baselineValue is required`,
          );
        }
      }
      if (Object.prototype.hasOwnProperty.call(item, "targetValue")) {
        if (!isPresentValue(item.targetValue)) {
          validationErrors.push(
            `updateMetrics[${index}].targetValue is required`,
          );
        }
      }
      if (Object.prototype.hasOwnProperty.call(item, "baselineDate")) {
        const baselineDate = parseDateValue(item.baselineDate ?? null);
        if (!baselineDate) {
          validationErrors.push(
            `updateMetrics[${index}].baselineDate is required`,
          );
        }
        updateMetricIdsNeedingDates.add(metricId);
      }
      if (Object.prototype.hasOwnProperty.call(item, "targetDate")) {
        const targetDate = parseDateValue(item.targetDate ?? null);
        if (!targetDate) {
          validationErrors.push(
            `updateMetrics[${index}].targetDate is required`,
          );
        }
        updateMetricIdsNeedingDates.add(metricId);
      }
    });

    newReported.forEach((item, index) => {
      const metricId = Number(item.metricId);
      if (!Number.isFinite(metricId)) {
        validationErrors.push(`newReportedMetrics[${index}].metricId is invalid`);
      }
      if (!isPresentValue(item.reportedValue)) {
        validationErrors.push(`newReportedMetrics[${index}].reportedValue is required`);
      }
      const reportedDate = parseDateValue(item.reportedDate ?? null);
      if (!reportedDate) {
        validationErrors.push(`newReportedMetrics[${index}].reportedDate is required`);
      }
    });

    updateReported.forEach((item, index) => {
      const reportId = Number(item.id);
      if (!Number.isFinite(reportId)) {
        validationErrors.push(`updateReportedMetrics[${index}].id is invalid`);
        return;
      }
      if (Object.prototype.hasOwnProperty.call(item, "reportedValue")) {
        if (!isPresentValue(item.reportedValue)) {
          validationErrors.push(
            `updateReportedMetrics[${index}].reportedValue is required`,
          );
        }
      }
      if (Object.prototype.hasOwnProperty.call(item, "reportedDate")) {
        const reportedDate = parseDateValue(item.reportedDate ?? null);
        if (!reportedDate) {
          validationErrors.push(
            `updateReportedMetrics[${index}].reportedDate is required`,
          );
        }
      }
    });

    const hasChanges =
      newMetrics.length ||
      updateMetrics.length ||
      deleteMetricIds.length ||
      newReported.length ||
      updateReported.length ||
      deleteReportedIds.length;

    if (!hasChanges) {
      return NextResponse.json(
        { message: "No changes provided." },
        { status: 400 },
      );
    }

    if (validationErrors.length) {
      return NextResponse.json(
        { message: "Validation failed", details: validationErrors },
        { status: 400 },
      );
    }

    const editorEmail = payload.editorEmail?.trim() || null;

    const pool = await getSqlPool();
    await pool
      .request()
      .input("UseCaseId", id)
      .input("PayloadJson", JSON.stringify(payload))
      .input("EditorEmail", editorEmail)
      .execute("dbo.UpdateUseCaseMetrics");

    return NextResponse.json(
      { ok: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Use case metrics update failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to update use case metrics.",
        ),
      },
      { status: 500 },
    );
  }
};
