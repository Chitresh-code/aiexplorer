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

    const useCaseId = result.recordset?.[0]?.id ?? null;

    return NextResponse.json(
      { id: useCaseId },
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
