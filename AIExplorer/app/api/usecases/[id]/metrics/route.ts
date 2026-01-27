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
      .execute("dbo.GetUseCaseMetricsDetails")) as IProcedureResult<any>;

    const recordsets: IRecordSet<any>[] = Array.isArray(result.recordsets)
      ? result.recordsets
      : [];

    const [metricRows = [], reportedRows = []] = recordsets;

    return NextResponse.json(
      { metrics: metricRows, reportedMetrics: reportedRows },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Use case metrics details failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to load use case metrics.",
        ),
      },
      { status: 500 },
    );
  }
};
