import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

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

type StakeholderPayload = {
  id?: number;
  roleId: number;
  stakeholderEmail: string;
  editorEmail?: string;
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

    const pool = await getSqlPool();
    const result = await pool
      .request()
      .input("UseCaseId", id)
      .input("RoleId", roleId)
      .input("StakeholderEmail", stakeholderEmail)
      .input("EditorEmail", editorEmail)
      .execute("dbo.CreateUseCaseStakeholder");

    const item = result.recordset?.[0] ?? null;
    if (!item) {
      return NextResponse.json(
        { message: "Failed to add stakeholder." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { item },
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

    const pool = await getSqlPool();
    const result = await pool
      .request()
      .input("Id", stakeholderId)
      .input("UseCaseId", id)
      .input("RoleId", roleId)
      .input("StakeholderEmail", stakeholderEmail)
      .input("EditorEmail", editorEmail)
      .execute("dbo.UpdateUseCaseStakeholder");

    const item = result.recordset?.[0] ?? null;
    if (!item) {
      return NextResponse.json(
        { message: "Stakeholder not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        item,
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
