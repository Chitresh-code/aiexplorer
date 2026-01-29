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

    const now = new Date().toISOString();
    const editorEmail = payload.editorEmail?.trim() || null;

    const pool = await getSqlPool();
    const identityResult = await pool
      .request()
      .query(
        "SELECT COLUMNPROPERTY(OBJECT_ID('dbo.[plan]'), 'id', 'IsIdentity') AS isIdentity",
      );
    const isIdentity = identityResult.recordset?.[0]?.isIdentity === 1;

    const requestSql = pool.request();
    requestSql.input("UseCaseId", id);
    requestSql.input("EditorEmail", editorEmail);
    requestSql.input("Now", now);

    const statements: string[] = [];
    statements.push("BEGIN TRAN;");
    if (!isIdentity) {
      statements.push(
        "DECLARE @NextId BIGINT = (SELECT ISNULL(MAX(id), 0) FROM dbo.[plan] WITH (UPDLOCK, HOLDLOCK));",
      );
    }

    items.forEach((item, index) => {
      const phaseId = Number(item.usecasephaseid);
      if (!Number.isFinite(phaseId)) {
        return;
      }
      const startDate = item.startdate?.trim();
      const endDate = item.enddate?.trim();
      const phaseKey = `PhaseId${index}`;
      const startKey = `StartDate${index}`;
      const endKey = `EndDate${index}`;

      requestSql.input(phaseKey, phaseId);
      requestSql.input(startKey, startDate);
      requestSql.input(endKey, endDate);

      statements.push(`
        IF EXISTS (
          SELECT 1
          FROM dbo.[plan]
          WHERE usecaseid = @UseCaseId AND usecasephaseid = @${phaseKey}
        )
        BEGIN
          UPDATE dbo.[plan]
          SET startdate = @${startKey},
              enddate = @${endKey},
              modified = @Now,
              editor_email = COALESCE(@EditorEmail, editor_email)
          WHERE usecaseid = @UseCaseId AND usecasephaseid = @${phaseKey};
        END
        ELSE
        BEGIN
          ${
            isIdentity
              ? `INSERT INTO dbo.[plan] (
                  usecaseid,
                  usecasephaseid,
                  startdate,
                  enddate,
                  modified,
                  created,
                  editor_email
                )
                VALUES (
                  @UseCaseId,
                  @${phaseKey},
                  @${startKey},
                  @${endKey},
                  @Now,
                  @Now,
                  @EditorEmail
                );`
              : `SET @NextId = @NextId + 1;
                INSERT INTO dbo.[plan] (
                  id,
                  usecaseid,
                  usecasephaseid,
                  startdate,
                  enddate,
                  modified,
                  created,
                  editor_email
                )
                VALUES (
                  @NextId,
                  @UseCaseId,
                  @${phaseKey},
                  @${startKey},
                  @${endKey},
                  @Now,
                  @Now,
                  @EditorEmail
                );`
          }
        END
      `);
    });

    statements.push("COMMIT TRAN;");

    await requestSql.query(statements.join("\n"));

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
