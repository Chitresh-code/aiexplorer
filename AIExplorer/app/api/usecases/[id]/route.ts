import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import type { IProcedureResult, IRecordSet } from "mssql";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) => {
  const params = await Promise.resolve(context.params);
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const pool = await getSqlPool();
    const result = (await pool
      .request()
      .input("UseCaseId", id)
      .execute("dbo.GetUseCaseDetails")) as IProcedureResult<any>;

    const recordsets: IRecordSet<any>[] = Array.isArray(result.recordsets)
      ? result.recordsets
      : [];

    const [
      useCaseRows = [],
      agentLibraryRows = [],
      personaRows = [],
      themeRows = [],
    ] = recordsets;

    const useCase = useCaseRows[0] as Record<string, unknown> | undefined;
    if (!useCase) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        useCase,
        agentLibrary: agentLibraryRows,
        personas: personaRows,
        themes: themeRows,
      },
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
