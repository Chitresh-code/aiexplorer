import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT * FROM statusmapping");
    const items = (result.recordset ?? [])
      .filter(isRowActive)
      .map((row: Record<string, unknown>) => ({
        id: toNumberValue(pickValue(row, ["Id", "ID"])),
        name: toStringValue(pickValue(row, ["StatusName", "Status Name"])).trim(),
        color: toStringValue(pickValue(row, ["StatusColor", "Status Color"])).trim(),
        definition: toStringValue(
          pickValue(row, ["StatusDefinitions", "Status Definition", "StatusDefinitions"]),
        ).trim(),
      }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Mappings status failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(error, "Failed to load status mappings."),
      },
      { status: 500 },
    );
  }
};
