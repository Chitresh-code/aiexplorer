import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT * FROM subteammapping");
    const items = (result.recordset ?? [])
      .filter(isRowActive)
      .map((row) => ({
        id: toNumberValue(pickValue(row, ["Id", "ID", "SubTeamId", "SubTeamID"])),
        businessUnitId: toNumberValue(
          pickValue(row, ["Businesssunitid", "BusinessUnitId", "BusinessUnitID"]),
        ),
        businessUnitName: toStringValue(
          pickValue(row, ["Business Unit Name", "BusinessUnitName", "BusinessUnit"]),
        ).trim(),
        teamName: toStringValue(pickValue(row, ["Team Name", "TeamName"])).trim(),
        subTeamName: toStringValue(
          pickValue(row, ["Sub Team Name", "SubTeamName", "SubteamName"]),
        ).trim(),
      }))
      .filter((item) => item.id !== null && item.businessUnitId !== null);

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Mappings subteams failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to load subteam mappings.",
        ),
      },
      { status: 500 },
    );
  }
};
