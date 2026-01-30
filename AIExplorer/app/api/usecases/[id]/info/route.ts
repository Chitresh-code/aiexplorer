import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

type UpdateInfoPayload = {
  title?: string;
  headlines?: string;
  opportunity?: string;
  businessValue?: string;
  editorEmail?: string;
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
    const payload = (await request.json()) as UpdateInfoPayload;
    const editorEmail = payload.editorEmail?.trim() ?? null;
    const diffPayload: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(payload, "title")) {
      diffPayload.title = payload.title;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "headlines")) {
      diffPayload.headlines = payload.headlines;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "opportunity")) {
      diffPayload.opportunity = payload.opportunity;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "businessValue")) {
      diffPayload.businessValue = payload.businessValue;
    }

    if (Object.keys(diffPayload).length === 0) {
      return NextResponse.json(
        { message: "At least one field is required." },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();

    await pool
      .request()
      .input("UseCaseId", id)
      .input("PayloadJson", JSON.stringify(diffPayload))
      .input("EditorEmail", editorEmail)
      .execute("dbo.UpdateUseCaseInfo");

    return NextResponse.json(
      { ok: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Usecase info update failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to update use case info.",
        ),
      },
      { status: 500 },
    );
  }
};
