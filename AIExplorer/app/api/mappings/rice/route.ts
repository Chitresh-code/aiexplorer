import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT * FROM rice");
    const items = (result.recordset ?? [])
      .filter(isRowActive)
      .map((row) => ({
        id: toNumberValue(pickValue(row, ["Id", "ID"])),
        categoryDisplay: toStringValue(
          pickValue(row, ["CategoryDisplay", "Category Display"]),
        ).trim(),
        categoryHeader: toStringValue(
          pickValue(row, ["CategoryHeader", "Category Header"]),
        ).trim(),
        categoryValue: toStringValue(
          pickValue(row, ["CategoryValue", "Category Value"]),
        ).trim(),
      }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Mappings RICE failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(error, "Failed to load RICE mappings."),
      },
      { status: 500 },
    );
  }
};
