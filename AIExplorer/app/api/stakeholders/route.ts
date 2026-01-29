import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StakeholderRow = Record<string, unknown>;

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
    const result = await pool
      .request()
      .input("BusinessUnitId", businessUnitId)
      .execute("dbo.GetUseCaseStakeholders");

    const items = (result.recordset ?? [])
      .map((row: StakeholderRow) => ({
        id: toNumberValue(pickValue(row, ["id", "Id", "ID"])),
        businessunitid: toNumberValue(
          pickValue(row, ["buisnessunitid", "BusinessUnitId", "businessunitid"]),
        ),
        businessunit: toStringValue(
          pickValue(row, ["businessunit", "BusinessUnit", "Business Unit"]),
        ).trim(),
        team: toStringValue(pickValue(row, ["team", "Team"])).trim(),
        roleid: toNumberValue(pickValue(row, ["roleid", "RoleId", "RoleID"])),
        role: toStringValue(pickValue(row, ["role", "Role"])).trim(),
        u_krewer_email: toStringValue(
          pickValue(row, ["u_krewer_email", "U_Krewer_Email", "ukrewer_email"]),
        ).trim(),
      }))
      .filter((item) => item.id !== null && item.u_krewer_email);

    return NextResponse.json(
      {
        items,
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
