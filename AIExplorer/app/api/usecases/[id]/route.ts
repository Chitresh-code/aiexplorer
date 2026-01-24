import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

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
    const result = await pool.request().execute("dbo.GetGalleryUseCases");
    const items = (result.recordset ?? []) as Array<{ id?: number | null }>;
    const useCase = items.find((item) => Number(item.id) === id);
    if (!useCase) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(useCase, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    logErrorTrace("Usecase detail failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to load use case.") },
      { status: 500 },
    );
  }
};
