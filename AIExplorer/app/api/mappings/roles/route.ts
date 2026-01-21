import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT * FROM rolemapping");
    const items = (result.recordset ?? [])
      .filter(isRowActive)
      .map((row) => ({
        id: toNumberValue(pickValue(row, ["Id", "ID"])),
        name: toStringValue(pickValue(row, ["RoleName", "Role Name"])).trim(),
        reviewFlag: toStringValue(pickValue(row, ["Reviewflag", "ReviewFlag"])).trim(),
        roleType: toStringValue(pickValue(row, ["Roletype", "RoleType"])).trim(),
      }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Mappings roles failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(error, "Failed to load role mappings."),
      },
      { status: 500 },
    );
  }
};
