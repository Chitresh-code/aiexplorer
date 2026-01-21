import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT * FROM personamapping");
    const items = (result.recordset ?? [])
      .filter(isRowActive)
      .map((row) => ({
        id: toNumberValue(pickValue(row, ["Id", "ID"])),
        name: toStringValue(pickValue(row, ["PersonaName", "Persona Name"])).trim(),
        definition: toStringValue(
          pickValue(row, ["RoleDefinition", "Role Definition"]),
        ).trim(),
        exampleRoles: toStringValue(
          pickValue(row, ["ExampleRoles", "Example Roles"]),
        ).trim(),
      }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Mappings personas failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(error, "Failed to load persona mappings."),
      },
      { status: 500 },
    );
  }
};
