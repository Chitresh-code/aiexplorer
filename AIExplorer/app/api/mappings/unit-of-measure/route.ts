import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT * FROM unitofmeasure");
    const items = (result.recordset ?? [])
      .filter(isRowActive)
      .map((row: Record<string, unknown>) => ({
        id: toNumberValue(pickValue(row, ["Id", "ID"])),
        name: toStringValue(
          pickValue(row, ["UnitOfMeasure", "Unit Of Measure", "UnitOfMeasurement"]),
        ).trim(),
        measureType: toStringValue(
          pickValue(row, ["measuretype", "MeasureType", "Measure Type"]),
        ).trim(),
        defaultValue: toStringValue(
          pickValue(row, ["Defaultvalue", "DefaultValue", "Default Value"]),
        ).trim(),
        options: toStringValue(pickValue(row, ["Options"])).trim(),
      }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Mappings unit of measure failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to load unit of measure mappings.",
        ),
      },
      { status: 500 },
    );
  }
};
