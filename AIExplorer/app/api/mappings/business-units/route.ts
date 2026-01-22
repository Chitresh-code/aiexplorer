import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MappingRow = Record<string, unknown>;

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const businessUnitResult = await pool
      .request()
      .query("SELECT * FROM businessunitmapping");

    const rawBusinessUnitRows = (businessUnitResult.recordset ??
      []) as MappingRow[];
    const activeBusinessUnitRows = rawBusinessUnitRows.filter(isRowActive);
    const businessUnitRows =
      activeBusinessUnitRows.length > 0 ? activeBusinessUnitRows : rawBusinessUnitRows;
    const businessUnitMap = new Map<
      string,
      {
        businessUnitId: number | null;
        businessUnitName: string;
        teams: Set<string>;
      }
    >();

    businessUnitRows.forEach((row) => {
      const businessUnitName = toStringValue(
        pickValue(row, [
          "Business Unit Name",
          "BusinessUnitName",
          "BusinessUnit",
          "businessunitname",
          "business_unit_name",
        ]),
      ).trim();
      const teamName = toStringValue(
        pickValue(row, ["Team Name", "TeamName", "teamname", "team_name"]),
      ).trim();
      const businessUnitId = toNumberValue(
        pickValue(row, [
          "Businesssunitid",
          "BusinessUnitId",
          "BusinessUnitID",
          "businessunitid",
          "business_unit_id",
          "id",
          "ID",
        ]),
      );

      if (!businessUnitName || !teamName) return;
      if (!businessUnitMap.has(businessUnitName)) {
        businessUnitMap.set(businessUnitName, {
          businessUnitId,
          businessUnitName,
          teams: new Set(),
        });
      }

      const unitEntry = businessUnitMap.get(businessUnitName);
      if (!unitEntry) return;
      if (businessUnitId !== null) {
        if (unitEntry.businessUnitId === null) {
          unitEntry.businessUnitId = businessUnitId;
        } else if (businessUnitId < unitEntry.businessUnitId) {
          unitEntry.businessUnitId = businessUnitId;
        }
      }
      unitEntry.teams.add(teamName);
    });

    const items = Array.from(businessUnitMap.values()).map((unit) => ({
      businessUnitId: unit.businessUnitId,
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
