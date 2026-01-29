import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

type UpdatePrioritizePayload = {
  riceScore?: string | number | null;
  priority?: string | number | null;
  displayInGallery?: boolean | string | number | null;
  sltReporting?: boolean | string | number | null;
  totalUserBase?: string | number | null;
  reach?: string | number | null;
  impact?: string | number | null;
  confidence?: string | number | null;
  effort?: string | number | null;
  timespanId?: number | null;
  reportingFrequencyId?: number | null;
  editorEmail?: string | null;
};

const toDbString = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
};

const toDbNumber = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const PATCH = async (
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) => {
  const params = await Promise.resolve(context.params);
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const useCaseId = Number(rawId);
  if (!Number.isFinite(useCaseId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as UpdatePrioritizePayload;
    const editorEmail = toDbString(payload.editorEmail) ?? null;

    const updateFields: Array<{
      key: keyof UpdatePrioritizePayload;
      column: string;
      value: unknown;
    }> = [
      { key: "riceScore", column: "ricescore", value: toDbString(payload.riceScore) },
      { key: "priority", column: "priority", value: toDbString(payload.priority) },
      {
        key: "displayInGallery",
        column: "aigallerydisplay",
        value: toDbString(payload.displayInGallery),
      },
      { key: "sltReporting", column: "sltreporting", value: toDbString(payload.sltReporting) },
      { key: "totalUserBase", column: "totaluserbase", value: toDbString(payload.totalUserBase) },
      { key: "reach", column: "reach", value: toDbString(payload.reach) },
      { key: "impact", column: "impact", value: toDbString(payload.impact) },
      { key: "confidence", column: "confidence", value: toDbString(payload.confidence) },
      { key: "effort", column: "effort", value: toDbString(payload.effort) },
      { key: "timespanId", column: "timespanid", value: toDbNumber(payload.timespanId) },
      {
        key: "reportingFrequencyId",
        column: "reportingfrequencyid",
        value: toDbNumber(payload.reportingFrequencyId),
      },
    ];

    const hasField = (key: keyof UpdatePrioritizePayload) =>
      Object.prototype.hasOwnProperty.call(payload, key);

    const updates = updateFields.filter((field) => hasField(field.key));

    if (updates.length === 0 && !editorEmail) {
      return NextResponse.json(
        { message: "At least one field is required." },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();
    const existing = await pool
      .request()
      .input("UseCaseId", useCaseId)
      .query(
        `
        SELECT TOP 1 id
        FROM dbo.prioritization
        WHERE usecaseid = @UseCaseId
        ORDER BY id DESC;
        `,
      );

    const existingId = existing.recordset?.[0]?.id;
    const now = new Date().toISOString();

    if (existingId) {
      const setClauses = updates.map((field, index) => `${field.column} = @Value${index}`);
      setClauses.push("modified = @Now");
      if (editorEmail !== null) {
        setClauses.push("editor_email = @EditorEmail");
      }

      const requestBuilder = pool
        .request()
        .input("Id", existingId)
        .input("Now", now)
        .input("EditorEmail", editorEmail);

      updates.forEach((field, index) => {
        requestBuilder.input(`Value${index}`, field.value ?? null);
      });

      await requestBuilder.query(
        `
        UPDATE dbo.prioritization
        SET ${setClauses.join(", ")}
        WHERE id = @Id;
        `,
      );

      return NextResponse.json(
        { ok: true, id: existingId },
        { headers: { "cache-control": "no-store" } },
      );
    }

    const nextIdResult = await pool.request().query(
      `
      SELECT ISNULL(MAX(id), 0) + 1 AS NextId
      FROM dbo.prioritization WITH (UPDLOCK, HOLDLOCK);
      `,
    );
    const nextId = Number(nextIdResult.recordset?.[0]?.NextId);
    if (!Number.isFinite(nextId)) {
      return NextResponse.json(
        { message: "Failed to allocate prioritization id." },
        { status: 500 },
      );
    }

    const insertColumns = ["id", "usecaseid", "created", "modified", "editor_email"];
    const insertValues = ["@Id", "@UseCaseId", "@Now", "@Now", "@EditorEmail"];

    updates.forEach((field, index) => {
      insertColumns.push(field.column);
      insertValues.push(`@Value${index}`);
    });

    const insertRequest = pool
      .request()
      .input("Id", nextId)
      .input("UseCaseId", useCaseId)
      .input("Now", now)
      .input("EditorEmail", editorEmail);

    updates.forEach((field, index) => {
      insertRequest.input(`Value${index}`, field.value ?? null);
    });

    await insertRequest.query(
      `
      INSERT INTO dbo.prioritization (${insertColumns.join(", ")})
      VALUES (${insertValues.join(", ")});
      `,
    );

    return NextResponse.json(
      { ok: true, id: nextId },
      { status: 201, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Prioritize update failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to update prioritization.") },
      { status: 500 },
    );
  }
};
