import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

type SimilarRequest = {
  query?: string;
};

type GalleryDbUseCase = {
  id: number | null;
  title: string;
  headlines: string;
  opportunity: string;
  businessValue: string;
  primaryContact: string;
  businessUnitName: string;
  teamName: string;
  phase: string;
  statusName: string;
  statusColor: string;
};

const statusColorMap: Record<string, string> = {
  green: "#E3F4E7",
  red: "#FCE8E6",
  orange: "#FFF4E5",
  gray: "#F3F4F6",
};

const resolveStatusColor = (value?: string) => {
  const key = value?.trim().toLowerCase() ?? "";
  return statusColorMap[key] ?? "#F5F5F5";
};

const normalize = (value: string) => value.trim().toLowerCase();

const toListItem = (item: GalleryDbUseCase) => ({
  id: item.id ?? 0,
  title: item.title ?? "",
  phase: item.phase ?? "",
  status: item.statusName ?? "",
  businessUnit: item.businessUnitName ?? "",
  team: item.teamName ?? "",
  subTeam: "",
  vendorName: "",
  aiModel: "",
  aiThemes: [],
  personas: [],
  bgColor: resolveStatusColor(item.statusColor),
});

export const POST = async (request: Request) => {
  try {
    const body = (await request.json().catch(() => ({}))) as SimilarRequest;
    const query = body.query?.trim() ?? "";

    const pool = await getSqlPool();
    const result = await pool.request().execute("dbo.GetGalleryUseCases");
    const rawItems = (result.recordset ?? []) as GalleryDbUseCase[];
    const listItems = rawItems.map(toListItem);

    if (!query) {
      return NextResponse.json({ items: listItems, total: listItems.length });
    }

    const term = normalize(query);
    const matched = rawItems
      .filter((item) => {
        const haystack = [
          item.title,
          item.headlines,
          item.opportunity,
          item.businessValue,
          item.primaryContact,
          item.businessUnitName,
          item.teamName,
          item.phase,
          item.statusName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      })
      .map(toListItem);

    return NextResponse.json({
      items: matched.length ? matched : listItems,
      total: matched.length ? matched.length : listItems.length,
    });
  } catch (error) {
    logErrorTrace("Similar usecases failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(error, "Failed to load similar use cases."),
      },
      { status: 500 },
    );
  }
};
