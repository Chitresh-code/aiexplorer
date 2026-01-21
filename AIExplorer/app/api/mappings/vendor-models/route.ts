import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toNumberValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT * FROM vendormodelmapping");
    const items = (result.recordset ?? [])
      .filter(isRowActive)
      .map((row) => ({
        id: toNumberValue(pickValue(row, ["Id", "ID"])),
        vendorName: toStringValue(
          pickValue(row, ["VendorName", "Vendor Name"]),
        ).trim(),
        productName: toStringValue(
          pickValue(row, ["ProductName", "Product Name", "ModelName", "Model Name"]),
        ).trim(),
        roleId: toNumberValue(pickValue(row, ["RoleId", "RoleID", "RoleIdId"])),
      }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Mappings vendor models failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to load vendor model mappings.",
        ),
      },
      { status: 500 },
    );
  }
};
