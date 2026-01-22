import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const tableName = "aithememapping";
    const result = await pool.request().query(`SELECT * FROM ${tableName}`);
    const items = (result.recordset ?? [])
      .filter(isRowActive)
      .map((row: Record<string, unknown>) => ({
        id: toNumberValue(pickValue(row, ["Id", "ID"])),
        name: toStringValue(pickValue(row, ["ThemeName", "Theme Name"])).trim(),
        definition: toStringValue(
          pickValue(row, ["ThemeDefinition", "Theme Definition"]),
        ).trim(),
        example: toStringValue(
          pickValue(row, ["ThemeExample", "Theme Example"]),
        ).trim(),
      }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Mappings themes failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(error, "Failed to load theme mappings."),
      },
      { status: 500 },
    );
  }
};
