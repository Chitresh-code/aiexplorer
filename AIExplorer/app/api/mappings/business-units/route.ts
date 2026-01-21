import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubteamRow = Record<string, unknown>;

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT * FROM subteammapping");
    const rows = (result.recordset ?? []).filter(isRowActive) as SubteamRow[];

    const businessUnitMap = new Map<
      string,
      {
        businessUnitName: string;
        teams: Map<
          string,
          {
            teamName: string;
            subteams: { subTeamId: number | null; subTeamName: string }[];
          }
        >;
      }
    >();

    rows.forEach((row) => {
      const businessUnitName = toStringValue(
        pickValue(row, ["Business Unit Name", "BusinessUnitName", "BusinessUnit"]),
      ).trim();
      const teamName = toStringValue(pickValue(row, ["Team Name", "TeamName"])).trim();
      const subTeamId = toNumberValue(
        pickValue(row, ["Id", "ID", "SubTeamId", "SubTeamID"]),
      );
      const subTeamName = toStringValue(
        pickValue(row, ["Sub Team Name", "SubTeamName", "SubteamName"]),
      ).trim();

      if (!businessUnitName || subTeamId === null) return;

      if (!businessUnitMap.has(businessUnitName)) {
        businessUnitMap.set(businessUnitName, {
          businessUnitName,
          teams: new Map(),
        });
      }

      const unitEntry = businessUnitMap.get(businessUnitName);
      if (!unitEntry) return;

      const teamKey = teamName || "Unassigned";
      if (!unitEntry.teams.has(teamKey)) {
        unitEntry.teams.set(teamKey, {
          teamName: teamKey,
          subteams: [],
        });
      }

      if (subTeamName) {
        unitEntry.teams.get(teamKey)?.subteams.push({
          subTeamId,
          subTeamName,
        });
      }
    });

    const items = Array.from(businessUnitMap.values()).map((unit) => ({
      businessUnitName: unit.businessUnitName,
      teams: Array.from(unit.teams.values()),
    }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Mappings business units failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to load business unit mappings.",
        ),
      },
      { status: 500 },
    );
  }
};
