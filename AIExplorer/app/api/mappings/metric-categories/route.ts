import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT * FROM outcomes");
    const items = (result.recordset ?? [])
      .filter(isRowActive)
      .map((row: Record<string, unknown>) => ({
        id: toNumberValue(pickValue(row, ["Id", "ID"])),
        category: toStringValue(
          pickValue(row, ["Outcome Category", "OutcomeCategory", "Category"]),
        ).trim(),
        description: toStringValue(
          pickValue(row, ["Outcome Description", "OutcomeDescription", "Description"]),
        ).trim(),
        defaultUnitOfMeasureId: toNumberValue(
          pickValue(row, ["default_unitofmeasure_id", "DefaultUnitOfMeasureId"]),
        ),
      }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Mappings metric categories failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to load metric category mappings.",
        ),
      },
      { status: 500 },
    );
  }
};
