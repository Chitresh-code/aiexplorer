import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

/**
 * Raw row returned by dbo.GetUseCaseAgentLibraryDetails
 * Comma-separated ID columns are parsed in the API layer.
 */
type AgentLibraryRow = {
  usecaseid: unknown;
  aiThemeIds: unknown;
  personaIds: unknown;
  knowledgeSourceIds: unknown;
  id: unknown;
  vendormodelid: unknown;
  agentid: unknown;
  agentlink: unknown;
  prompt: unknown;
  modified: unknown;
  created: unknown;
  editor_email: unknown;
};

/**
 * Request body for PATCH updates.
 * Arrays are converted to comma-separated strings
 * before being passed to the stored procedure.
 */
type UpdateRequest = {
  aiThemeIds?: number[];
  personaIds?: number[];
  knowledgeSourceIds?: number[];
  agentLibraryId?: number | null;
  vendorModelId?: number | null;
  agentId?: string | null;
  agentLink?: string | null;
  prompt?: string | null;
  editorEmail?: string;
};

/**
 * Safely parses a comma-separated list of numbers into a number[].
 * Null, undefined, or empty values return an empty array.
 */
const parseCsvNumbers = (value: unknown): number[] => {
  if (value === null || value === undefined) return [];

  const str = String(value).trim();
  if (!str) return [];

  return str
    .split(",")
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
};

/**
 * GET: Retrieve agent library details for a use case.
 */
export const GET = async (
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) => {
  const params = await Promise.resolve(context.params);
  const rawId = Array.isArray((params as any).id)
    ? (params as any).id[0]
    : (params as any).id;

  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const pool = await getSqlPool();
    const result = await pool
      .request()
      .input("UseCaseId", id)
      .execute("dbo.GetUseCaseAgentLibraryDetails");

    const items = (result.recordset ?? []).map((row: AgentLibraryRow) => ({
      usecaseid: row.usecaseid ?? null,
      aiThemeIds: parseCsvNumbers(row.aiThemeIds),
      personaIds: parseCsvNumbers(row.personaIds),
      knowledgeSourceIds: parseCsvNumbers(row.knowledgeSourceIds),
      id: row.id ?? null,
      vendormodelid: row.vendormodelid ?? null,
      agentid: row.agentid ?? null,
      agentlink: row.agentlink ?? null,
      prompt: row.prompt ?? null,
      modified: row.modified ?? null,
      created: row.created ?? null,
      editor_email: row.editor_email ?? null,
    }));

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Use case agent library failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to load use case agent library.",
        ),
      },
      { status: 500 },
    );
  }
};

/**
 * PATCH: Update agent library details for a use case.
 * 
 * Note:
 * Passing NULL for theme/persona/knowledge IDs will trigger
 * deletion of existing rows in the stored procedure.
 */
export const PATCH = async (
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) => {
  const params = await Promise.resolve(context.params);
  const rawId = Array.isArray((params as any).id)
    ? (params as any).id[0]
    : (params as any).id;

  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const body: UpdateRequest = await request.json();

    // Ensure at least one field is provided for update
    if (
      body.aiThemeIds === undefined &&
      body.personaIds === undefined &&
      body.knowledgeSourceIds === undefined &&
      body.agentLibraryId === undefined &&
      body.vendorModelId === undefined &&
      body.agentId === undefined &&
      body.agentLink === undefined &&
      body.prompt === undefined &&
      body.editorEmail === undefined
    ) {
      return NextResponse.json(
        { message: "No update data provided" },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();

    // Convert ID arrays to comma-separated strings for SQL
    const aiThemeIdsStr =
      body.aiThemeIds !== undefined ? body.aiThemeIds.join(",") : null;

    const personaIdsStr =
      body.personaIds !== undefined ? body.personaIds.join(",") : null;

    const knowledgeSourceIdsStr =
      body.knowledgeSourceIds !== undefined
        ? body.knowledgeSourceIds.join(",")
        : null;

    const result = await pool
      .request()
      .input("UseCaseId", id)
      .input("AIThemeIds", aiThemeIdsStr)
      .input("PersonaIds", personaIdsStr)
      .input("KnowledgeSourceIds", knowledgeSourceIdsStr)
      .input("AgentLibraryId", body.agentLibraryId ?? null)
      .input("VendorModelId", body.vendorModelId ?? null)
      .input("AgentId", body.agentId ?? null)
      .input("AgentLink", body.agentLink ?? null)
      .input("Prompt", body.prompt ?? null)
      .input("EditorEmail", body.editorEmail ?? null)
      .execute("dbo.UpdateUseCaseAgentLibraryDetails");

    const response = result.recordset?.[0];

    if (!response || response.Success !== 1) {
      const errorMsg = response?.Message || "Unknown error occurred";
      logErrorTrace("Update agent library failed", new Error(errorMsg));
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Agent library updated successfully", success: true },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Update agent library failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to update agent library.",
        ),
      },
      { status: 500 },
    );
  }
};