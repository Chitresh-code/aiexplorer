import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes = [
  "businessUnits",
  "themes",
  "personas",
  "vendorModels",
  "aiProductQuestions",
  "status",
  "phases",
  "roles",
  "reportingFrequency",
  "rice",
  "implementationTimespans",
  "metricCategories",
  "knowledgeSources",
  "unitOfMeasure",
] as const;

type MappingType = (typeof allowedTypes)[number];

const normalizeTypes = (value: string | null) =>
  value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];

const isValidType = (value: string): value is MappingType =>
  (allowedTypes as readonly string[]).includes(value);

const normalizeBusinessUnitRows = (
  rows: Array<Record<string, unknown>>,
): Array<{ id: number | null; businessUnitName: string; teamName: string }> =>
  rows
    .map((row) => {
      const rawId = row.id ?? row.teamId ?? row.businessUnitId;
      return {
        id: Number.isFinite(Number(rawId)) ? Number(rawId) : null,
      businessUnitName: String(row.businessUnitName ?? row.businessunitname ?? "").trim(),
      teamName: String(row.teamName ?? row.teamname ?? "").trim(),
      };
    })
    .filter((row) => row.businessUnitName.length > 0 && row.teamName.length > 0);

const typeOrder: MappingType[] = [
  "businessUnits",
  "themes",
  "personas",
  "vendorModels",
  "aiProductQuestions",
  "status",
  "phases",
  "roles",
  "reportingFrequency",
  "rice",
  "implementationTimespans",
  "metricCategories",
  "knowledgeSources",
  "unitOfMeasure",
];

export const GET = async (request: Request): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const types = normalizeTypes(searchParams.get("types"));
    const normalizedTypes = all ? [...allowedTypes] : types;

    const invalid = normalizedTypes.filter((value) => !isValidType(value));
    if (!all && normalizedTypes.length === 0) {
      return NextResponse.json(
        { message: "types is required unless all=true." },
        { status: 400 },
      );
    }
    if (invalid.length > 0) {
      return NextResponse.json(
        { message: `Invalid types: ${invalid.join(", ")}` },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();
    const result = await pool
      .request()
      .input("Types", all ? null : normalizedTypes.join(","))
      .input("All", all ? 1 : 0)
      .execute("dbo.GetMappings");

    const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
    let recordsetIndex = 0;

    const response: Record<string, { items: Array<Record<string, unknown>> }> = {};

    typeOrder.forEach((type) => {
      if (!all && !normalizedTypes.includes(type)) return;
      const rows = (recordsets[recordsetIndex] ?? []) as Array<Record<string, unknown>>;
      recordsetIndex += 1;

      if (type === "businessUnits") {
        response[type] = { items: normalizeBusinessUnitRows(rows) };
        return;
      }

      response[type] = { items: rows };
    });

    return NextResponse.json(response, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    logErrorTrace("Mappings consolidated failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to load mappings.") },
      { status: 500 },
    );
  }
};
