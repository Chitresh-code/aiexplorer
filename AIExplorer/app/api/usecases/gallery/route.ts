import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { pickValue, toNumberValue, toStringValue, type SqlRow } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toGalleryItem = (row: SqlRow) => ({
  id: toNumberValue(pickValue(row, ["id", "Id"])),
  businessUnitId: toNumberValue(pickValue(row, ["businessUnitId", "BusinessUnitId", "businessunitid"])),
  phaseId: toNumberValue(pickValue(row, ["phaseId", "PhaseId", "phaseid"])),
  statusId: toNumberValue(pickValue(row, ["statusId", "StatusId", "statusid"])),
  title: toStringValue(pickValue(row, ["title", "Title"])).trim(),
  headlines: toStringValue(pickValue(row, ["headlines", "Headlines"])).trim(),
  opportunity: toStringValue(pickValue(row, ["opportunity", "Opportunity"])).trim(),
  businessValue: toStringValue(
    pickValue(row, ["businessValue", "BusinessValue", "business_value"]),
  ).trim(),
  informationUrl: toStringValue(
    pickValue(row, ["informationUrl", "InformationUrl", "informationurl"]),
  ).trim(),
  primaryContact: toStringValue(
    pickValue(row, ["primaryContact", "PrimaryContact", "primarycontact"]),
  ).trim(),
  productChecklist: toStringValue(
    pickValue(row, ["productChecklist", "ProductChecklist", "productchecklist"]),
  ).trim(),
  eseDependency: toStringValue(
    pickValue(row, ["eseDependency", "ESEDependency", "esedependency"]),
  ).trim(),
  businessUnitName: toStringValue(
    pickValue(row, ["businessUnitName", "BusinessUnitName", "businessunitname"]),
  ).trim(),
  teamName: toStringValue(pickValue(row, ["teamName", "TeamName", "teamname"])).trim(),
  phase: toStringValue(pickValue(row, ["phase", "Phase"])).trim(),
  statusName: toStringValue(pickValue(row, ["statusName", "StatusName"])).trim(),
  statusColor: toStringValue(pickValue(row, ["statusColor", "StatusColor"])).trim(),
});

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().execute("dbo.GetGalleryUseCases");
    const items = (result.recordset ?? [])
      .map(toGalleryItem)
      .filter((item) => item.id !== null);

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Gallery usecases failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(error, "Failed to load gallery use cases."),
      },
      { status: 500 },
    );
  }
};
