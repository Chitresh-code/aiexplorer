import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

type UpdatePayload = {
  meaningfulUpdate: string;
  editorEmail: string;
};

export const POST = async (
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
    const payload = (await request.json()) as UpdatePayload;
    const meaningfulUpdate = payload.meaningfulUpdate?.trim();
    const editorEmail = payload.editorEmail?.trim();

    if (!meaningfulUpdate || !editorEmail) {
      return NextResponse.json(
        { message: "meaningfulUpdate and editorEmail are required." },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();
    const result = await pool
      .request()
      .input("UseCaseId", id)
      .input("MeaningfulUpdate", meaningfulUpdate)
      .input("EditorEmail", editorEmail)
      .execute("dbo.CreateUseCaseUpdate");

    const item = result.recordset?.[0] ?? null;
    if (!item) {
      return NextResponse.json(
        { message: "Failed to add update." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { item },
      { status: 201, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Use case update create failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to add update.") },
      { status: 500 },
    );
  }
};
