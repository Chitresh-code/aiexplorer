import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StakeholderRow = Record<string, unknown>;

const normalizeRole = (value: string, fallback: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

export const GET = async (req: Request): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(req.url);
    const businessUnitId = toNumberValue(searchParams.get("businessUnitId"));

    if (businessUnitId === null) {
      return NextResponse.json(
        { items: [] },
        { headers: { "cache-control": "no-store" } },
      );
    }

    const pool = await getSqlPool();

    const businessUnitResult = await pool
      .request()
      .input("businessUnitId", businessUnitId)
      .query("SELECT businessunitname FROM businessunitmapping WHERE id = @businessUnitId");

    const businessUnitName = toStringValue(
      pickValue(
        businessUnitResult.recordset?.[0] ?? {},
        ["Business Unit Name", "BusinessUnitName", "businessunitname"],
      ),
    ).trim();

    const columnsResult = await pool.request().query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ai_champions' ORDER BY ORDINAL_POSITION",
    );

    const columnNames = (columnsResult.recordset ?? [])
      .map((row: Record<string, unknown>) =>
        String(row.COLUMN_NAME ?? "").toLowerCase(),
      )
      .filter(Boolean);

    const businessUnitIdColumn = columnNames.includes("buisnessunitid")
      ? "buisnessunitid"
      : columnNames.includes("businessunitid")
        ? "businessunitid"
        : null;
    const hasBusinessUnitName = columnNames.includes("businessunit");
    const hasRoleId = columnNames.includes("roleid");

    let championsQuery = "SELECT * FROM ai_champions";
    if (businessUnitIdColumn) {
      championsQuery += ` WHERE ${businessUnitIdColumn} = @businessUnitId`;
    } else if (hasBusinessUnitName && businessUnitName) {
      championsQuery += " WHERE LOWER(businessunit) = LOWER(@businessUnitName)";
    }

    const [championsResult, rolesResult] = await Promise.all([
      pool
        .request()
        .input("businessUnitId", businessUnitId)
        .input("businessUnitName", businessUnitName)
        .query(championsQuery),
      hasRoleId
        ? pool.request().query("SELECT * FROM rolemapping")
        : Promise.resolve({ recordset: [] }),
    ]);

    const roleIdMap = new Map<number, string>();
    (rolesResult.recordset ?? []).forEach((row: StakeholderRow) => {
      const id = toNumberValue(pickValue(row, ["Id", "ID"]));
      const name = toStringValue(pickValue(row, ["Name", "name"])).trim();
      if (id !== null && name) {
        roleIdMap.set(id, name);
      }
    });

    const champions = (championsResult.recordset ?? [])
      .filter(isRowActive)
      .map((row: StakeholderRow) => ({
        id: toNumberValue(pickValue(row, ["Id", "ID"])),
        businessUnitId: toNumberValue(
          pickValue(row, [
            "buisnessunitid",
            "businessunitid",
            "BusinessUnitId",
            "BusinessUnitID",
          ]),
        ),
        businessUnitName:
          toStringValue(
            pickValue(row, ["BusinessUnit", "businessunit", "Business Unit"]),
          ).trim() || businessUnitName,
        email: toStringValue(
          pickValue(row, ["u_krewer_email", "U_Krewer_Email", "ukrewer_email"]),
        ).trim(),
        roleId: toNumberValue(pickValue(row, ["RoleId", "roleid", "RoleID"])),
        role: normalizeRole(
          roleIdMap.get(
            toNumberValue(pickValue(row, ["RoleId", "roleid", "RoleID"])) ??
              -1,
          ) ?? toStringValue(pickValue(row, ["Role", "role"])),
          "Champion",
        ),
      }))
      .filter(
        (item: { id: number | null; email: string }) => item.id !== null && item.email,
      );

    return NextResponse.json(
      {
        items: champions,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Stakeholders lookup failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(error, "Failed to load stakeholders."),
      },
      { status: 500 },
    );
  }
};
