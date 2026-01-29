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
    const now = new Date().toISOString();

    const pool = await getSqlPool();
    const identityMetricResult = await pool
      .request()
      .query(
        "SELECT COLUMNPROPERTY(OBJECT_ID('dbo.metric'), 'id', 'IsIdentity') AS isIdentity",
      );
    const identityReportedResult = await pool
      .request()
      .query(
        "SELECT COLUMNPROPERTY(OBJECT_ID('dbo.metricreported'), 'id', 'IsIdentity') AS isIdentity",
      );

    const metricIsIdentity =
      identityMetricResult.recordset?.[0]?.isIdentity === 1;
    const reportedIsIdentity =
      identityReportedResult.recordset?.[0]?.isIdentity === 1;

    if (updateMetricIdsNeedingDates.size > 0) {
      const ids = Array.from(updateMetricIdsNeedingDates);
      const request = pool.request();
      request.input("UseCaseId", id);
      const placeholders = ids.map((_, idx) => `@MetricId${idx}`);
      ids.forEach((value, idx) => request.input(`MetricId${idx}`, value));
      const existingRows = await request.query(
        `SELECT id, baselinedate, targetdate FROM dbo.metric WHERE usecaseid = @UseCaseId AND id IN (${placeholders.join(
          ", ",
        )});`,
      );
      const existingMap = new Map<number, { baseline: Date | null; target: Date | null }>();
      (existingRows.recordset ?? []).forEach((row: any) => {
        const rowId = Number(row.id);
        const baseline = parseDateValue(
          row.baselinedate ? new Date(row.baselinedate).toISOString().slice(0, 10) : null,
        );
        const target = parseDateValue(
          row.targetdate ? new Date(row.targetdate).toISOString().slice(0, 10) : null,
        );
        if (Number.isFinite(rowId)) {
          existingMap.set(rowId, { baseline, target });
        }
      });

      updateMetrics.forEach((item, index) => {
        const metricId = Number(item.id);
        if (!updateMetricIdsNeedingDates.has(metricId)) return;
        const existing = existingMap.get(metricId);
        if (!existing) {
          validationErrors.push(`updateMetrics[${index}].id not found`);
          return;
        }
        const baselineDate = Object.prototype.hasOwnProperty.call(item, "baselineDate")
          ? parseDateValue(item.baselineDate ?? null)
          : existing.baseline;
        const targetDate = Object.prototype.hasOwnProperty.call(item, "targetDate")
          ? parseDateValue(item.targetDate ?? null)
          : existing.target;
        if (!baselineDate || !targetDate) {
          validationErrors.push(
            `updateMetrics[${index}] baselineDate and targetDate are required`,
          );
          return;
        }
        if (!(targetDate > baselineDate)) {
          validationErrors.push(
            `updateMetrics[${index}].targetDate must be after baselineDate`,
          );
        }
        if (!(targetDate > today)) {
          validationErrors.push(
            `updateMetrics[${index}].targetDate must be after today`,
          );
        }
      });

      if (validationErrors.length) {
        return NextResponse.json(
          { message: "Validation failed", details: validationErrors },
          { status: 400 },
        );
      }
    }

    const requestSql = pool.request();
    requestSql.input("UseCaseId", id);
    requestSql.input("Now", now);
    requestSql.input("EditorEmail", editorEmail);

    const statements: string[] = [];
    statements.push("BEGIN TRY");
    statements.push("BEGIN TRAN;");

    if (!metricIsIdentity) {
      statements.push(
        "DECLARE @NextMetricId BIGINT = (SELECT ISNULL(MAX(id), 0) FROM dbo.metric WITH (UPDLOCK, HOLDLOCK));",
      );
    }
    if (!reportedIsIdentity) {
      statements.push(
        "DECLARE @NextReportedId BIGINT = (SELECT ISNULL(MAX(id), 0) FROM dbo.metricreported WITH (UPDLOCK, HOLDLOCK));",
      );
    }

    const metricDeleteIds = deleteMetricIds
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    if (metricDeleteIds.length > 0) {
      const placeholders = metricDeleteIds.map((_, index) => `@DeleteMetricId${index}`);
      metricDeleteIds.forEach((value, index) => {
        requestSql.input(`DeleteMetricId${index}`, value);
      });
      statements.push(
        `DELETE FROM dbo.metricreported WHERE usecaseid = @UseCaseId AND metricid IN (${placeholders.join(", ")});`,
      );
      statements.push(
        `DELETE FROM dbo.metric WHERE usecaseid = @UseCaseId AND id IN (${placeholders.join(", ")});`,
      );
    }

    const reportedDeleteIds = deleteReportedIds
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    if (reportedDeleteIds.length > 0) {
      const placeholders = reportedDeleteIds.map((_, index) => `@DeleteReportedId${index}`);
      reportedDeleteIds.forEach((value, index) => {
        requestSql.input(`DeleteReportedId${index}`, value);
      });
      statements.push(
        `DELETE FROM dbo.metricreported WHERE usecaseid = @UseCaseId AND id IN (${placeholders.join(", ")});`,
      );
    }

    updateMetrics.forEach((item, index) => {
      const metricId = Number(item.id);
      if (!Number.isFinite(metricId)) return;
      const sets: string[] = [];
      const metricIdKey = `MetricId${index}`;
      requestSql.input(metricIdKey, metricId);

      if (Object.prototype.hasOwnProperty.call(item, "metricTypeId")) {
        const key = `MetricTypeId${index}`;
        requestSql.input(key, item.metricTypeId ?? null);
        sets.push(`metrictypeid = @${key}`);
      }
      if (Object.prototype.hasOwnProperty.call(item, "unitOfMeasureId")) {
        const key = `UnitOfMeasureId${index}`;
        requestSql.input(key, item.unitOfMeasureId ?? null);
        sets.push(`unitofmeasureid = @${key}`);
      }
      if (Object.prototype.hasOwnProperty.call(item, "primarySuccessMetricName")) {
        const key = `PrimarySuccessMetricName${index}`;
        requestSql.input(key, item.primarySuccessMetricName ?? null);
        sets.push(`primarysuccessmetricname = @${key}`);
      }
      if (Object.prototype.hasOwnProperty.call(item, "baselineValue")) {
        const key = `BaselineValue${index}`;
        requestSql.input(key, item.baselineValue ?? null);
        sets.push(`baselinevalue = @${key}`);
      }
      if (Object.prototype.hasOwnProperty.call(item, "baselineDate")) {
        const key = `BaselineDate${index}`;
        requestSql.input(key, item.baselineDate ?? null);
        sets.push(`baselinedate = @${key}`);
      }
      if (Object.prototype.hasOwnProperty.call(item, "targetValue")) {
        const key = `TargetValue${index}`;
        requestSql.input(key, item.targetValue ?? null);
        sets.push(`targetvalue = @${key}`);
      }
      if (Object.prototype.hasOwnProperty.call(item, "targetDate")) {
        const key = `TargetDate${index}`;
        requestSql.input(key, item.targetDate ?? null);
        sets.push(`targetdate = @${key}`);
      }

      if (sets.length === 0) return;

      sets.push("modified = @Now");
      sets.push("editor_email = COALESCE(@EditorEmail, editor_email)");

      statements.push(`
        UPDATE dbo.metric
        SET ${sets.join(", ")}
        WHERE usecaseid = @UseCaseId AND id = @${metricIdKey};
      `);
    });

    newMetrics.forEach((item, index) => {
      const metricTypeId = Number(item.metricTypeId);
      const unitOfMeasureId = Number(item.unitOfMeasureId);
      if (!Number.isFinite(metricTypeId) || !Number.isFinite(unitOfMeasureId)) return;

      const metricTypeKey = `NewMetricTypeId${index}`;
      const unitKey = `NewUnitOfMeasureId${index}`;
      const nameKey = `NewPrimarySuccessMetricName${index}`;
      const baselineValueKey = `NewBaselineValue${index}`;
      const baselineDateKey = `NewBaselineDate${index}`;
      const targetValueKey = `NewTargetValue${index}`;
      const targetDateKey = `NewTargetDate${index}`;

      requestSql.input(metricTypeKey, metricTypeId);
      requestSql.input(unitKey, unitOfMeasureId);
      requestSql.input(nameKey, item.primarySuccessMetricName ?? null);
      requestSql.input(baselineValueKey, item.baselineValue ?? null);
      requestSql.input(baselineDateKey, item.baselineDate ?? null);
      requestSql.input(targetValueKey, item.targetValue ?? null);
      requestSql.input(targetDateKey, item.targetDate ?? null);

      if (metricIsIdentity) {
        statements.push(`
          INSERT INTO dbo.metric (
            usecaseid,
            metrictypeid,
            unitofmeasureid,
            primarysuccessmetricname,
            baselinevalue,
            baselinedate,
            targetvalue,
            targetdate,
            modified,
            created,
            editor_email
          )
          VALUES (
            @UseCaseId,
            @${metricTypeKey},
            @${unitKey},
            @${nameKey},
            @${baselineValueKey},
            @${baselineDateKey},
            @${targetValueKey},
            @${targetDateKey},
            @Now,
            @Now,
            @EditorEmail
          );
        `);
      } else {
        statements.push(`
          SET @NextMetricId = @NextMetricId + 1;
          INSERT INTO dbo.metric (
            id,
            usecaseid,
            metrictypeid,
            unitofmeasureid,
            primarysuccessmetricname,
            baselinevalue,
            baselinedate,
            targetvalue,
            targetdate,
            modified,
            created,
            editor_email
          )
          VALUES (
            @NextMetricId,
            @UseCaseId,
            @${metricTypeKey},
            @${unitKey},
            @${nameKey},
            @${baselineValueKey},
            @${baselineDateKey},
            @${targetValueKey},
            @${targetDateKey},
            @Now,
            @Now,
            @EditorEmail
          );
        `);
      }
    });

    updateReported.forEach((item, index) => {
      const reportId = Number(item.id);
      if (!Number.isFinite(reportId)) return;
      const sets: string[] = [];
      const reportIdKey = `ReportedId${index}`;
      requestSql.input(reportIdKey, reportId);

      if (Object.prototype.hasOwnProperty.call(item, "reportedValue")) {
        const key = `ReportedValue${index}`;
        requestSql.input(key, item.reportedValue ?? null);
        sets.push(`reportedvalue = @${key}`);
      }
      if (Object.prototype.hasOwnProperty.call(item, "reportedDate")) {
        const key = `ReportedDate${index}`;
        requestSql.input(key, item.reportedDate ?? null);
        sets.push(`reporteddate = @${key}`);
      }

      if (sets.length === 0) return;

      sets.push("modified = @Now");
      sets.push("editor_email = COALESCE(@EditorEmail, editor_email)");

      statements.push(`
        UPDATE dbo.metricreported
        SET ${sets.join(", ")}
        WHERE usecaseid = @UseCaseId AND id = @${reportIdKey};
      `);
    });

    newReported.forEach((item, index) => {
      const metricId = Number(item.metricId);
      if (!Number.isFinite(metricId)) return;
      const metricIdKey = `NewReportedMetricId${index}`;
      const valueKey = `NewReportedValue${index}`;
      const dateKey = `NewReportedDate${index}`;

      requestSql.input(metricIdKey, metricId);
      requestSql.input(valueKey, item.reportedValue ?? null);
      requestSql.input(dateKey, item.reportedDate ?? null);

      if (reportedIsIdentity) {
        statements.push(`
          INSERT INTO dbo.metricreported (
            usecaseid,
            metricid,
            reportedvalue,
            reporteddate,
            modified,
            created,
            editor_email
          )
          VALUES (
            @UseCaseId,
            @${metricIdKey},
            @${valueKey},
            @${dateKey},
            @Now,
            @Now,
            @EditorEmail
          );
        `);
      } else {
        statements.push(`
          SET @NextReportedId = @NextReportedId + 1;
          INSERT INTO dbo.metricreported (
            id,
            usecaseid,
            metricid,
            reportedvalue,
            reporteddate,
            modified,
            created,
            editor_email
          )
          VALUES (
            @NextReportedId,
            @UseCaseId,
            @${metricIdKey},
            @${valueKey},
            @${dateKey},
            @Now,
            @Now,
            @EditorEmail
          );
        `);
      }
    });

    statements.push("COMMIT TRAN;");
    statements.push("END TRY");
    statements.push("BEGIN CATCH");
    statements.push("IF @@TRANCOUNT > 0 ROLLBACK TRAN;");
    statements.push("THROW;");
    statements.push("END CATCH");

    await requestSql.query(statements.join("\n"));

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
