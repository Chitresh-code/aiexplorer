import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

type PlanPatchItem = {
  usecasephaseid: number;
  startdate: string;
  enddate: string;
};

export const PATCH = async (
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) => {
  const params = await Promise.resolve(context.params);
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const payload = (await request.json()) as {
      items?: PlanPatchItem[];
      editorEmail?: string;
    };
    const items = payload.items ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "items is required." },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();
    await pool
      .request()
      .input("UseCaseId", id)
      .input("PlanJson", JSON.stringify(items))
      .input("EditorEmail", payload.editorEmail?.trim() || null)
      .execute("dbo.UpdateUseCasePlan");

    return NextResponse.json(
      { ok: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Use case plan update failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to update plan.") },
      { status: 500 },
    );
  }
};
