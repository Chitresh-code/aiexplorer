import { NextResponse } from "next/server";
import type { UseCaseQuery } from "@/features/gallery/types";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

const splitValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const readValues = (params: URLSearchParams, key: string) =>
  params
    .getAll(key)
    .flatMap((value) => splitValues(value))
    .filter(Boolean);

const readNumber = (params: URLSearchParams, key: string) => {
  const raw = params.get(key);
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
};

const readSortBy = (params: URLSearchParams): UseCaseQuery["sortBy"] => {
  const sortBy = params.get("sortBy");
  const allowed = new Set<UseCaseQuery["sortBy"]>([
    "id",
    "title",
    "phase",
    "status",
    "businessUnit",
    "team",
    "subTeam",
    "vendorName",
    "aiModel",
    "aiThemes",
    "personas",
    "bgColor",
  ]);
  if (!sortBy) return undefined;
  return allowed.has(sortBy as UseCaseQuery["sortBy"])
    ? (sortBy as UseCaseQuery["sortBy"])
    : undefined;
};

const normalize = (value: string) => value.trim().toLowerCase();

const matchesFilter = (value: string, filters: string[]) => {
  if (!filters.length) return true;
  const hay = normalize(value);
  return filters.some((entry) => hay.includes(normalize(entry)));
};

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const query: UseCaseQuery = {
    search: searchParams.get("search") ?? undefined,
    status: readValues(searchParams, "status"),
    phase: readValues(searchParams, "phase"),
    businessUnit: readValues(searchParams, "business_unit"),
    team: readValues(searchParams, "team"),
    subTeam: readValues(searchParams, "sub_team"),
    vendor: readValues(searchParams, "vendor"),
    persona: readValues(searchParams, "persona"),
    aiTheme: readValues(searchParams, "ai_theme"),
    aiModel: readValues(searchParams, "ai_model"),
    sortBy: readSortBy(searchParams),
    sortDir: searchParams.get("sortDir") === "desc" ? "desc" : "asc",
    skip: readNumber(searchParams, "skip"),
    limit: readNumber(searchParams, "limit"),
    filterKey: readValues(searchParams, "filterKey"),
    filterValue: readValues(searchParams, "filterValue"),
  };

  try {
    const pool = await getSqlPool();
    const result = await pool.request().query(`
      SELECT
        u.id AS ID,
        u.title AS Title,
        pm.Phase AS Phase,
        sm.StatusName AS Status,
        bu.teamname AS TeamName,
        u.subteamname AS SubTeamName,
        bu.businessunitname AS BusinessUnitName
      FROM usecases AS u
      LEFT JOIN phasemapping AS pm ON pm.id = u.phaseid
      LEFT JOIN statusmapping AS sm ON sm.id = u.statusid
      LEFT JOIN businessunitmapping AS bu ON bu.id = u.businessunitid
    `);

    const rows = (result.recordset ?? []).map((row) => ({
      ID: row.ID,
      Title: row.Title,
      Phase: row.Phase,
      Status: row.Status,
      TeamName: row.TeamName,
      SubTeamName: row.SubTeamName,
      BusinessUnitName: row.BusinessUnitName,
    }));

    const filtered = rows.filter((row) => {
      if (query.search && !matchesFilter(String(row.Title ?? ""), [query.search])) {
        return false;
      }
      if (!matchesFilter(String(row.Status ?? ""), query.status ?? [])) return false;
      if (!matchesFilter(String(row.Phase ?? ""), query.phase ?? [])) return false;
      if (!matchesFilter(String(row.BusinessUnitName ?? ""), query.businessUnit ?? [])) return false;
      if (!matchesFilter(String(row.TeamName ?? ""), query.team ?? [])) return false;
      if (!matchesFilter(String(row.SubTeamName ?? ""), query.subTeam ?? [])) return false;
      return true;
    });

    return NextResponse.json(filtered);
  } catch (error) {
    logErrorTrace("Usecases failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to load use cases.") },
      { status: 500 },
    );
  }
};

type UseCaseChecklistItem = {
  questionId: number;
  response: string;
};

type UseCaseStakeholder = {
  roleId: number;
  role: string;
  stakeholderEmail: string;
};

type UseCasePlanItem = {
  usecasephaseid: number;
  startdate: string;
  enddate: string;
};

type UseCaseMetricItem = {
  metrictypeid: number;
  unitofmeasureid: number;
  primarysuccessmetricname: string;
  baselinevalue: string;
  baselinedate: string;
  targetvalue: string;
  targetdate: string;
};

type CreateUseCasePayload = {
  businessUnitId?: number | null;
  phaseId?: number | null;
  statusId?: number | null;
  title: string;
  headlines?: string;
  opportunity?: string;
  businessValue?: string;
  subTeamName?: string;
  informationUrl?: string;
  eseDependency?: string;
  primaryContact: string;
  editorEmail: string;
  checklist?: UseCaseChecklistItem[];
  stakeholders?: UseCaseStakeholder[];
  plan?: UseCasePlanItem[];
  metrics?: UseCaseMetricItem[];
};

const APPROVAL_FLOW_URL =
  process.env.POWER_AUTOMATE_APPROVAL_FLOW_URL?.trim() ?? "";

const toTitleCase = (value: string) => {
  if (!value) return "";
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const buildStakeholderName = (email?: string | null) => {
  if (!email) return "";
  const localPart = email.split("@")[0] ?? email;
  const rawParts = localPart.split(".").filter(Boolean);
  if (!rawParts.length) return "";
  const alphaParts = rawParts.filter((part) => /[a-zA-Z]/.test(part));
  const firstPart = alphaParts[0] ?? rawParts[0];
  const lastPart =
    alphaParts.length > 1 ? alphaParts[alphaParts.length - 1] : rawParts.length > 1 ? rawParts[rawParts.length - 1] : "";
  const nameParts = [firstPart, lastPart].filter(Boolean).map((part) => toTitleCase(part));
  return nameParts.join(" ").trim();
};

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const payload = (await request.json()) as CreateUseCasePayload;
    const title = payload.title?.trim();
    const primaryContact = payload.primaryContact?.trim();
    const editorEmail = payload.editorEmail?.trim();

    if (!title || !primaryContact || !editorEmail) {
      return NextResponse.json(
        {
          message: "title, primaryContact, and editorEmail are required.",
        },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();

    const result = await pool
      .request()
      .input("BusinessUnitId", payload.businessUnitId ?? null)
      .input("PhaseId", payload.phaseId ?? null)
      .input("StatusId", payload.statusId ?? null)
      .input("Title", title)
      .input("Headlines", payload.headlines ?? null)
      .input("Opportunity", payload.opportunity ?? null)
      .input("BusinessValue", payload.businessValue ?? null)
      .input("SubTeamName", payload.subTeamName ?? null)
      .input("InformationUrl", payload.informationUrl ?? null)
      .input("EseDependency", payload.eseDependency ?? null)
      .input("PrimaryContact", primaryContact)
      .input("EditorEmail", editorEmail)
      .input(
        "ChecklistJson",
        payload.checklist?.length ? JSON.stringify(payload.checklist) : null,
      )
      .input(
        "StakeholdersJson",
        payload.stakeholders?.length ? JSON.stringify(payload.stakeholders) : null,
      )
      .input("PlanJson", payload.plan?.length ? JSON.stringify(payload.plan) : null)
      .input(
        "MetricsJson",
        payload.metrics?.length ? JSON.stringify(payload.metrics) : null,
      )
      .execute("dbo.CreateUseCase");
    const useCaseRecord = result.recordset?.[0] ?? {};
    const useCaseId =
      useCaseRecord?.UseCaseId ??
      useCaseRecord?.useCaseId ??
      useCaseRecord?.id ??
      null;
    let approvals = false;

    if (useCaseId) {
      let phaseName = String(useCaseRecord?.Phase ?? useCaseRecord?.phase ?? "").trim();
      const phaseId =
        Number(useCaseRecord?.Phaseid ?? useCaseRecord?.phaseId ?? payload.phaseId ?? 0) || 0;
      if (!phaseName && phaseId) {
        try {
          const phaseResult = await pool
            .request()
            .input("PhaseId", phaseId)
            .query("SELECT Phase FROM phasemapping WHERE id = @PhaseId");
          phaseName = String(phaseResult.recordset?.[0]?.Phase ?? "").trim();
        } catch (error) {
          logErrorTrace("Phase lookup failed", error);
        }
      }

      let stakeholderRows: Array<{
        StakeholderID?: number;
        StakeholderRoleID?: number;
        StakeholderRole?: string;
        StakeholderEmail?: string;
        ReviewFlag?: string | number | null;
        ReviewerType?: string;
      }> = [];

      const recordsets = Array.isArray(result.recordsets) ? result.recordsets : [];
      if (recordsets.length > 1) {
        stakeholderRows = (recordsets[1] ?? []).map((row: any) => ({
          StakeholderID: row.StakeholderID ?? row.id,
          StakeholderRoleID: row.StakeholderRoleID ?? row.roleid,
          StakeholderRole: row.StakeholderRole ?? row.role,
          StakeholderEmail: row.StakeholderEmail ?? row.stakeholder_email,
          ReviewFlag: row.ReviewFlag ?? row.reviewflag,
          ReviewerType: row.ReviewerType ?? row.role,
        }));
      } else {
        try {
          const stakeholderResult = await pool
            .request()
            .input("UseCaseId", useCaseId)
            .query(`
              SELECT
                s.id AS StakeholderID,
                s.roleid AS StakeholderRoleID,
                s.role AS StakeholderRole,
                s.stakeholder_email AS StakeholderEmail,
                rm.reviewflag AS ReviewFlag
              FROM dbo.stakeholder s
              LEFT JOIN dbo.rolemapping rm ON rm.id = s.roleid
              WHERE s.usecaseid = @UseCaseId
            `);
          stakeholderRows = (stakeholderResult.recordset ?? []).map((row: any) => ({
            StakeholderID: row.StakeholderID,
            StakeholderRoleID: row.StakeholderRoleID,
            StakeholderRole: row.StakeholderRole,
            StakeholderEmail: row.StakeholderEmail,
            ReviewFlag: row.ReviewFlag,
            ReviewerType: row.StakeholderRole,
          }));
        } catch (error) {
          logErrorTrace("Stakeholder lookup failed", error);
          stakeholderRows = [];
        }
      }

      const stakeholderDetails = stakeholderRows
        .filter((row) => String(row.ReviewFlag ?? "").trim() === "1")
        .map((row) => {
          const email = String(row.StakeholderEmail ?? "").trim();
          return {
            ReviewerType: String(row.ReviewFlag ?? "").trim(),
            StakeholderEmail: email,
            StakeholderName: buildStakeholderName(email),
            StakeholderRole: row.StakeholderRole ?? "",
            StakeholderRoleID: Number.isFinite(Number(row.StakeholderRoleID))
              ? Number(row.StakeholderRoleID)
              : 0,
            StakeholderID: Number.isFinite(Number(row.StakeholderID))
              ? Number(row.StakeholderID)
              : 0,
          };
        });
      try {
        if (!APPROVAL_FLOW_URL) {
          approvals = false;
          return NextResponse.json(
            { id: useCaseId, approvals },
            { status: 201, headers: { "cache-control": "no-store" } },
          );
        }
        const approvalResponse = await fetch(APPROVAL_FLOW_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            StakeholderDetails: stakeholderDetails,
            UseCaseId: Number(useCaseId),
            Phase: phaseName || String(phaseId || ""),
            Phaseid: Number(phaseId ?? 0),
          }),
        });
        approvals = approvalResponse.ok;
      } catch (error) {
        approvals = false;
        logErrorTrace("Approval flow failed", error);
      }
    }

    return NextResponse.json(
      { id: useCaseId, approvals },
      { status: 201, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Create usecase failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(error, "Failed to create use case."),
      },
      { status: 500 },
    );
  }
};
