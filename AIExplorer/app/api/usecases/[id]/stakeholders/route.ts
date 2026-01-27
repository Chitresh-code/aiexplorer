import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

type StakeholderRow = {
  id: unknown;
  roleid: unknown;
  usecaseid: unknown;
  role?: unknown;
  role_name?: unknown;
  stakeholder_email?: unknown;
  modified?: unknown;
  created?: unknown;
  editor_email?: unknown;
};

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
    const result = await pool
      .request()
      .input("UseCaseId", id)
      .query(
        `
        SELECT
          s.id,
          s.roleid,
          s.usecaseid,
          COALESCE(s.role, rm.rolename) AS role_name,
          s.stakeholder_email,
          s.modified,
          s.created,
          s.editor_email
        FROM dbo.stakeholder AS s
        LEFT JOIN dbo.rolemapping AS rm
          ON rm.id = s.roleid
        WHERE s.usecaseid = @UseCaseId
        ORDER BY s.roleid, s.stakeholder_email;
        `,
      );

    const items = (result.recordset ?? []).map((row: StakeholderRow) => ({
      id: row.id ?? null,
      roleid: row.roleid ?? null,
      usecaseid: row.usecaseid ?? null,
      role: row.role_name ?? row.role ?? null,
      stakeholder_email: row.stakeholder_email ?? null,
      modified: row.modified ?? null,
      created: row.created ?? null,
      editor_email: row.editor_email ?? null,
    }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Use case stakeholders failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to load stakeholders.") },
      { status: 500 },
    );
  }
};

type StakeholderPayload = {
  id?: number;
  roleId: number;
  stakeholderEmail: string;
  editorEmail?: string;
};

const normalizeRoleName = (value: string) => value.trim().toLowerCase();

const isOwnerRole = (value: string) => normalizeRoleName(value) === "owner";

const resolveRole = async (roleId: number) => {
  const pool = await getSqlPool();
  const result = await pool
    .request()
    .input("RoleId", roleId)
    .query(
      `
      SELECT TOP 1
        id,
        rolename,
        roletype,
        isactive
      FROM dbo.rolemapping
      WHERE id = @RoleId;
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
    const payload = (await request.json()) as StakeholderPayload;
    const roleId = Number(payload.roleId);
    const stakeholderEmail = payload.stakeholderEmail?.trim();
    const editorEmail = payload.editorEmail?.trim() || stakeholderEmail || null;

    if (!Number.isFinite(roleId) || !stakeholderEmail) {
      return NextResponse.json(
        { message: "roleId and stakeholderEmail are required." },
        { status: 400 },
      );
    }

    const roleRow = await resolveRole(roleId);
    const roleName = String(roleRow?.rolename ?? "").trim();
    const roleType = String(roleRow?.roletype ?? "").trim();
    const isActive = String(roleRow?.isactive ?? "1").trim();

    if (!roleName || roleType !== "2" || isActive !== "1" || isOwnerRole(roleName)) {
      return NextResponse.json(
        { message: "Role is not eligible for stakeholder updates." },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();
    const identityResult = await pool
      .request()
      .query(
        "SELECT COLUMNPROPERTY(OBJECT_ID('dbo.stakeholder'), 'id', 'IsIdentity') AS isIdentity",
      );
    const isIdentity = identityResult.recordset?.[0]?.isIdentity === 1;
    const now = new Date().toISOString();

    let insertedId: number | null = null;

    if (isIdentity) {
      const result = await pool
        .request()
        .input("UseCaseId", id)
        .input("RoleId", roleId)
        .input("RoleName", roleName)
        .input("StakeholderEmail", stakeholderEmail)
        .input("Now", now)
        .input("EditorEmail", editorEmail)
        .query(
          `
          INSERT INTO dbo.stakeholder (
            roleid,
            usecaseid,
            role,
            stakeholder_email,
            modified,
            created,
            editor_email
          )
          VALUES (
            @RoleId,
            @UseCaseId,
            @RoleName,
            @StakeholderEmail,
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
        .input("RoleName", roleName)
        .input("StakeholderEmail", stakeholderEmail)
        .input("Now", now)
        .input("EditorEmail", editorEmail)
        .query(
          `
          DECLARE @NextId BIGINT = (
            SELECT ISNULL(MAX(id), 0) + 1
            FROM dbo.stakeholder WITH (UPDLOCK, HOLDLOCK)
          );
          INSERT INTO dbo.stakeholder (
            id,
            roleid,
            usecaseid,
            role,
            stakeholder_email,
            modified,
            created,
            editor_email
          )
          VALUES (
            @NextId,
            @RoleId,
            @UseCaseId,
            @RoleName,
            @StakeholderEmail,
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
          roleid: roleId,
          usecaseid: id,
          role: roleName,
          stakeholder_email: stakeholderEmail,
          modified: now,
          created: now,
          editor_email: editorEmail,
        },
      },
      { status: 201, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Use case stakeholder create failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to add stakeholder.") },
      { status: 500 },
    );
  }
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
    const payload = (await request.json()) as StakeholderPayload;
    const stakeholderId = Number(payload.id);
    const roleId = Number(payload.roleId);
    const stakeholderEmail = payload.stakeholderEmail?.trim();
    const editorEmail = payload.editorEmail?.trim() || stakeholderEmail || null;

    if (!Number.isFinite(stakeholderId) || !Number.isFinite(roleId) || !stakeholderEmail) {
      return NextResponse.json(
        { message: "id, roleId and stakeholderEmail are required." },
        { status: 400 },
      );
    }

    const roleRow = await resolveRole(roleId);
    const roleName = String(roleRow?.rolename ?? "").trim();
    const roleType = String(roleRow?.roletype ?? "").trim();
    const isActive = String(roleRow?.isactive ?? "1").trim();

    if (!roleName || roleType !== "2" || isActive !== "1" || isOwnerRole(roleName)) {
      return NextResponse.json(
        { message: "Role is not eligible for stakeholder updates." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const pool = await getSqlPool();
    const result = await pool
      .request()
      .input("Id", stakeholderId)
      .input("UseCaseId", id)
      .input("RoleId", roleId)
      .input("RoleName", roleName)
      .input("StakeholderEmail", stakeholderEmail)
      .input("Now", now)
      .input("EditorEmail", editorEmail)
      .query(
        `
        UPDATE dbo.stakeholder
        SET roleid = @RoleId,
            role = @RoleName,
            stakeholder_email = @StakeholderEmail,
            modified = @Now,
            editor_email = @EditorEmail
        WHERE id = @Id AND usecaseid = @UseCaseId;
        `,
      );

    if ((result.rowsAffected?.[0] ?? 0) === 0) {
      return NextResponse.json(
        { message: "Stakeholder not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        item: {
          id: stakeholderId,
          roleid: roleId,
          usecaseid: id,
          role: roleName,
          stakeholder_email: stakeholderEmail,
          modified: now,
          created: null,
          editor_email: editorEmail,
        },
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Use case stakeholder update failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to update stakeholder.") },
      { status: 500 },
    );
  }
};
