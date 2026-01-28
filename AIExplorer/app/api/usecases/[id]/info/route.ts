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
    const title = payload.title?.trim() ?? null;
    const headlines = payload.headlines?.trim() ?? null;
    const opportunity = payload.opportunity?.trim() ?? null;
    const businessValue = payload.businessValue?.trim() ?? null;
    const editorEmail = payload.editorEmail?.trim() ?? null;

    if (!title && !headlines && !opportunity && !businessValue) {
      return NextResponse.json(
        { message: "At least one field is required." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const pool = await getSqlPool();

    await pool
      .request()
      .input("UseCaseId", id)
      .input("Title", title)
      .input("Headlines", headlines)
      .input("Opportunity", opportunity)
      .input("BusinessValue", businessValue)
      .input("Now", now)
      .input("EditorEmail", editorEmail)
      .query(
        `
        UPDATE dbo.usecases
        SET title = COALESCE(@Title, title),
            headlines = COALESCE(@Headlines, headlines),
            opportunity = COALESCE(@Opportunity, opportunity),
            business_value = COALESCE(@BusinessValue, business_value),
            modified = @Now,
            editor_email = COALESCE(@EditorEmail, editor_email)
        WHERE TRY_CONVERT(BIGINT, id) = @UseCaseId;
        `,
      );

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
