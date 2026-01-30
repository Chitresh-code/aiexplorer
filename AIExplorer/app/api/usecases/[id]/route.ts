import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import type { IProcedureResult, IRecordSet } from "mssql";

const allSections = [
  "usecase",
  "agentlibrary",
  "personas",
  "themes",
  "plan",
  "prioritize",
  "metrics",
  "stakeholders",
  "updates",
  "checklist",
] as const;

const normalizeList = (value: string | null) =>
  value
    ?.split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean) ?? [];

export const GET = async (
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) => {
  const params = await Promise.resolve(context.params);
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type")?.trim().toLowerCase() ?? "";
  const includeParam = searchParams.get("include");
  const all = searchParams.get("all") === "true";
  const email = searchParams.get("email")?.trim() ?? "";

  if ((type === "owner" || type === "champion") && !email) {
    return NextResponse.json(
      { message: "email is required when type is owner or champion." },
      { status: 400 },
    );
  }

  const includeList = all
    ? [...allSections]
    : includeParam
      ? normalizeList(includeParam)
      : type === "gallery"
        ? ["usecase"]
        : [...allSections];
  const includeSet = new Set(includeList);

  try {
    const pool = await getSqlPool();
    const result = (await pool
      .request()
      .input("UseCaseId", id)
      .input("RequestType", type || null)
      .input("IncludeList", includeParam ?? null)
      .input("All", all ? 1 : 0)
      .input("Email", email || null)
      .execute("dbo.GetUseCaseDetails")) as IProcedureResult<any>;

    const recordsets: IRecordSet<any>[] = Array.isArray(result.recordsets)
      ? result.recordsets
      : [];

    let recordsetIndex = 0;
    const next = () => (recordsets[recordsetIndex++] ?? []) as any[];

    const response: Record<string, unknown> = {};

    if (includeSet.has("usecase")) {
      const useCaseRows = next();
      const useCase = useCaseRows[0] as Record<string, unknown> | undefined;
      if (!useCase) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      response.useCase = useCase;
    }

    if (includeSet.has("agentlibrary")) {
      response.agentLibrary = next();
    }

    if (includeSet.has("personas")) {
      response.personas = next();
    }

    if (includeSet.has("themes")) {
      response.themes = next();
    }

    if (includeSet.has("plan")) {
      response.plan = next();
    }

    if (includeSet.has("prioritize")) {
      const rows = next();
      response.prioritize = rows[0] ?? null;
    }

    if (includeSet.has("metrics")) {
      const metricRows = next();
      const reportedRows = next();
      response.metrics = {
        items: metricRows,
        reported: reportedRows,
      };
    }

    if (includeSet.has("stakeholders")) {
      response.stakeholders = next();
    }

    if (includeSet.has("updates")) {
      response.updates = next();
    }

    if (includeSet.has("checklist")) {
      response.checklist = next();
    }

    return NextResponse.json(
      response,
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Usecase detail failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to load use case.") },
      { status: 500 },
    );
  }
};
