import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

type UpdatePayload = {
  meaningfulUpdate: string;
  editorEmail: string;
};

const resolveStakeholderRole = async (
  useCaseId: number,
  editorEmail: string,
) => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("UseCaseId", useCaseId)
    .input("Email", editorEmail)
    .query(
      `
      SELECT TOP 1
        roleid,
        stakeholder_email
      FROM dbo.stakeholder
      WHERE TRY_CONVERT(BIGINT, usecaseid) = @UseCaseId
        AND LOWER(LTRIM(RTRIM(COALESCE(stakeholder_email, '')))) =
            LOWER(LTRIM(RTRIM(@Email)));
      `,
    );
  return result.recordset?.[0] ?? null;
};

const resolveUseCasePhaseStatus = async (useCaseId: number) => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("UseCaseId", useCaseId)
    .query(
      `
      SELECT TOP 1
        phaseid,
        statusid
      FROM dbo.usecases
      WHERE TRY_CONVERT(BIGINT, id) = @UseCaseId;
      `,
    );
  return result.recordset?.[0] ?? null;
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

    const stakeholder = await resolveStakeholderRole(id, editorEmail);
    const roleId = Number(stakeholder?.roleid);
    if (!Number.isFinite(roleId)) {
      return NextResponse.json(
        { message: "User is not a stakeholder for this use case." },
        { status: 403 },
      );
    }

    const useCase = await resolveUseCasePhaseStatus(id);
    const phaseId = Number(useCase?.phaseid);
    const statusId = Number(useCase?.statusid);
    if (!Number.isFinite(phaseId) || !Number.isFinite(statusId)) {
      return NextResponse.json(
        { message: "Unable to resolve current phase or status." },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();
    const identityResult = await pool
      .request()
      .query(
        "SELECT COLUMNPROPERTY(OBJECT_ID('dbo.updates'), 'id', 'IsIdentity') AS isIdentity",
      );
    const isIdentity = identityResult.recordset?.[0]?.isIdentity === 1;
    const now = new Date().toISOString();

    let insertedId: number | null = null;

    if (isIdentity) {
      const result = await pool
        .request()
        .input("UseCaseId", id)
        .input("RoleId", roleId)
        .input("PhaseId", phaseId)
        .input("StatusId", statusId)
        .input("MeaningfulUpdate", meaningfulUpdate)
        .input("Now", now)
        .input("EditorEmail", editorEmail)
        .query(
          `
          INSERT INTO dbo.updates (
            meaningfulupdate,
            usecaseid,
            roleid,
            usecasephaseid,
            usecasestatusid,
            modified,
            created,
            editor_email
          )
          VALUES (
            @MeaningfulUpdate,
            TRY_CONVERT(BIGINT, @UseCaseId),
            TRY_CONVERT(BIGINT, @RoleId),
            TRY_CONVERT(BIGINT, @PhaseId),
            TRY_CONVERT(BIGINT, @StatusId),
            @Now,
            @Now,
            @EditorEmail
          );
          SELECT SCOPE_IDENTITY() AS id;
          `,
        );
      insertedId = Number(result.recordset?.[0]?.id ?? null);
    } else {
      const result = await pool
        .request()
        .input("UseCaseId", id)
        .input("RoleId", roleId)
        .input("PhaseId", phaseId)
        .input("StatusId", statusId)
        .input("MeaningfulUpdate", meaningfulUpdate)
        .input("Now", now)
        .input("EditorEmail", editorEmail)
        .query(
          `
          DECLARE @NextId BIGINT = (
            SELECT ISNULL(MAX(id), 0) + 1
            FROM dbo.updates WITH (UPDLOCK, HOLDLOCK)
          );
          INSERT INTO dbo.updates (
            id,
            meaningfulupdate,
            usecaseid,
            roleid,
            usecasephaseid,
            usecasestatusid,
            modified,
            created,
            editor_email
          )
          VALUES (
            @NextId,
            @MeaningfulUpdate,
            TRY_CONVERT(BIGINT, @UseCaseId),
            TRY_CONVERT(BIGINT, @RoleId),
            TRY_CONVERT(BIGINT, @PhaseId),
            TRY_CONVERT(BIGINT, @StatusId),
            @Now,
            @Now,
            @EditorEmail
          );
          SELECT @NextId AS id;
          `,
        );
      insertedId = Number(result.recordset?.[0]?.id ?? null);
    }

    return NextResponse.json(
      {
        item: {
          id: insertedId,
          meaningfulupdate: meaningfulUpdate,
          usecaseid: id,
          roleid: roleId,
          usecasephaseid: phaseId,
          usecasestatusid: statusId,
          modified: now,
          created: now,
          editor_email: editorEmail,
        },
      },
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
