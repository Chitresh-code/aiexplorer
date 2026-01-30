import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

type ChecklistItem = {
  questionId: number;
  response?: string | null;
};

type ChecklistPatchPayload = {
  items?: ChecklistItem[];
  editorEmail?: string;
};

const normalizeResponse = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  return String(value);
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
    const payload = (await request.json()) as ChecklistPatchPayload;
    const editorEmail = payload.editorEmail?.trim() ?? null;
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (items.length === 0) {
      return NextResponse.json(
        { message: "At least one checklist item is required." },
        { status: 400 },
      );
    }

    const normalizedItems: ChecklistItem[] = [];
    const validationErrors: string[] = [];

    items.forEach((item, index) => {
      const questionId = Number(item?.questionId);
      if (!Number.isFinite(questionId)) {
        validationErrors.push(`items[${index}].questionId is required`);
        return;
      }
      normalizedItems.push({
        questionId,
        response: normalizeResponse(item?.response),
      });
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { message: validationErrors.join(", ") },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();
    await pool
      .request()
      .input("UseCaseId", id)
      .input("ChecklistJson", JSON.stringify(normalizedItems))
      .input("EditorEmail", editorEmail)
      .execute("dbo.UpdateUseCaseChecklist");

    return NextResponse.json(
      { ok: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Usecase checklist update failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to update use case checklist.",
        ),
      },
      { status: 500 },
    );
  }
};
