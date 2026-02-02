import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

const toNumberValue = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseIdList = (value: unknown): number[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => Number(entry))
      .filter((num) => Number.isFinite(num));
  }
  const text = String(value).trim();
  if (!text) return [];
  return text
    .split(",")
    .map((segment) => Number(segment.trim()))
    .filter((segment) => Number.isFinite(segment));
};

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role")?.trim().toLowerCase() ?? "";
  const email = searchParams.get("email")?.trim() ?? "";
  const view = searchParams.get("view")?.trim().toLowerCase() || "full";

  if ((role === "owner" || role === "champion") && !email) {
    return NextResponse.json(
      { message: "email is required when role is provided." },
      { status: 400 },
    );
  }

  try {
    const pool = await getSqlPool();
    const result = await pool
      .request()
      .input("Role", role || null)
      .input("Email", email || null)
      .input("View", view || null)
      .execute("dbo.GetUseCases");

    const recordsets = Array.isArray(result.recordsets)
      ? result.recordsets
      : [];
    const rows = (recordsets[0] ?? []) as Array<Record<string, unknown>>;
    const planRows = (recordsets[1] ?? []) as Array<Record<string, unknown>>;

    const planMap = new Map<number, Array<Record<string, unknown>>>();
    planRows.forEach((row) => {
      const useCaseId = Number(row.useCaseId ?? row.usecaseid ?? row.UseCaseId);
      if (!Number.isFinite(useCaseId)) return;
      const entry = {
        phaseId: Number(row.phaseId ?? row.usecasephaseid ?? row.PhaseId),
        phaseName: String(row.phaseName ?? row.phase ?? row.Phase ?? "").trim(),
        startDate: row.startDate ?? row.startdate ?? null,
        endDate: row.endDate ?? row.enddate ?? null,
      };
      if (!planMap.has(useCaseId)) {
        planMap.set(useCaseId, []);
      }
      planMap.get(useCaseId)?.push(entry);
    });

    const normalized = rows.map((row) => {
      const id = Number(row.id ?? row.ID);
      const vendorModelId = toNumberValue(
        row.vendorModelId ?? row.vendormodelid ?? row.vendorModel ?? null,
      );
      const aiThemeIds = parseIdList(
        row.aiThemeIds ?? row.aithemeids ?? row.aiThemes ?? null,
      );
      const personaIds = parseIdList(
        row.personaIds ?? row.personaids ?? row.personas ?? null,
      );
      const approvalStatusInt = toNumberValue(
        row.approvalStatusInt ?? row.approvalstatusint ?? null,
      );
      const item = {
        id: Number.isFinite(id) ? id : row.id ?? row.ID ?? null,
        businessUnitId: row.businessUnitId ?? row.businessunitid ?? row.BusinessUnitId ?? null,
        phaseId: row.phaseId ?? row.phaseid ?? row.PhaseId ?? null,
        statusId: row.statusId ?? row.statusid ?? row.StatusId ?? null,
        title: String(row.title ?? row.Title ?? "").trim(),
        headlines: String(row.headlines ?? row.Headlines ?? "").trim(),
        opportunity: String(row.opportunity ?? row.Opportunity ?? "").trim(),
        businessValue: String(row.businessValue ?? row.business_value ?? "").trim(),
        informationUrl: String(row.informationUrl ?? row.informationurl ?? "").trim(),
        primaryContact: String(row.primaryContact ?? row.primarycontact ?? "").trim(),
        productChecklist: String(row.productChecklist ?? row.productchecklist ?? "").trim(),
        eseDependency: String(row.eseDependency ?? row.esedependency ?? "").trim(),
        businessUnitName: String(row.businessUnitName ?? row.businessunitname ?? "").trim(),
        teamName: String(row.teamName ?? row.teamname ?? "").trim(),
        phase: String(row.phase ?? row.Phase ?? "").trim(),
        statusName: String(row.statusName ?? row.StatusName ?? row.Status ?? "").trim(),
        statusColor: String(row.statusColor ?? row.StatusColor ?? "").trim(),
        priority: row.priority ?? row.Priority ?? null,
        deliveryTimespan: row.deliveryTimespan ?? row.DeliveryTimespan ?? null,
        vendorModelId,
        aiThemeIds,
        personaIds,
        useCasePhaseApprovalId:
          row.useCasePhaseApprovalId ?? row.usecasephaseapprovalid ?? null,
        approvalUseCaseId:
          row.approvalUseCaseId ?? row.approvalusecaseid ?? null,
        approvalPhaseId:
          row.approvalPhaseId ?? row.approvalphaseid ?? null,
        approvalStatus:
          String(row.approvalStatus ?? row.approvalstatus ?? "").trim(),
        approvalStatusInt,
      };

      if (view === "full") {
        const embeddedPlan = parsePhasePlanValue(row.phasePlan ?? row.PhasePlan);
        return {
          ...item,
          phasePlan: embeddedPlan.length
            ? embeddedPlan
            : planMap.get(Number(item.id)) ?? [],
        };
      }

      if (view === "list") {
        return {
          id: item.id,
          title: item.title,
          phase: item.phase,
          status: item.statusName,
          teamName: item.teamName,
          businessUnitName: item.businessUnitName,
          vendorModelId: item.vendorModelId,
          aiThemeIds: item.aiThemeIds,
          personaIds: item.personaIds,
          approvalStatus: item.approvalStatus,
          approvalStatusInt: item.approvalStatusInt,
        };
      }

      // gallery view
      return {
        id: item.id,
        businessUnitId: item.businessUnitId,
        phaseId: item.phaseId,
        statusId: item.statusId,
        title: item.title,
        headlines: item.headlines,
        opportunity: item.opportunity,
        businessValue: item.businessValue,
        informationUrl: item.informationUrl,
        primaryContact: item.primaryContact,
        productChecklist: item.productChecklist,
        eseDependency: item.eseDependency,
        businessUnitName: item.businessUnitName,
        teamName: item.teamName,
        phase: item.phase,
        statusName: item.statusName,
        statusColor: item.statusColor,
        vendorModelId: item.vendorModelId,
        aiThemeIds: item.aiThemeIds,
        personaIds: item.personaIds,
        approvalStatus: item.approvalStatus,
        approvalStatusInt: item.approvalStatusInt,
      };
    });

    return NextResponse.json(
      { items: normalized },
      { headers: { "cache-control": "no-store" } },
    );
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
  businessUnitId: number;
  phaseId: number;
  statusId: number;
  title: string;
  headlines: string;
  opportunity: string;
  businessValue: string;
  subTeamName?: string;
  informationUrl?: string;
  eseDependency: string;
  primaryContact: string;
  editorEmail: string;
  checklist?: UseCaseChecklistItem[];
  stakeholders: UseCaseStakeholder[];
  plan: UseCasePlanItem[];
  metrics: UseCaseMetricItem[];
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

const parsePhasePlanValue = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const payload = (await request.json()) as CreateUseCasePayload;
    const title = payload.title?.trim();
    const headlines = payload.headlines?.trim();
    const opportunity = payload.opportunity?.trim();
    const businessValue = payload.businessValue?.trim();
    const eseDependency = payload.eseDependency?.trim();
    const primaryContact = payload.primaryContact?.trim();
    const editorEmail = payload.editorEmail?.trim();
    const businessUnitId = Number(payload.businessUnitId);
    const phaseId = Number(payload.phaseId);
    const statusId = Number(payload.statusId);
    const stakeholders = Array.isArray(payload.stakeholders) ? payload.stakeholders : [];
    const plan = Array.isArray(payload.plan) ? payload.plan : [];
    const metrics = Array.isArray(payload.metrics) ? payload.metrics : [];

    if (
      !title ||
      !primaryContact ||
      !editorEmail ||
      !headlines ||
      !opportunity ||
      !businessValue ||
      !eseDependency ||
      !Number.isFinite(businessUnitId) ||
      !Number.isFinite(phaseId) ||
      !Number.isFinite(statusId)
    ) {
      return NextResponse.json(
        {
          message:
            "title, primaryContact, editorEmail, businessUnitId, phaseId, statusId, headlines, opportunity, businessValue, and eseDependency are required.",
        },
        { status: 400 },
      );
    }

    if (!stakeholders.length || !plan.length || !metrics.length) {
      return NextResponse.json(
        {
          message: "stakeholders, plan, and metrics are required and must be non-empty arrays.",
        },
        { status: 400 },
      );
    }

    const pool = await getSqlPool();

    const result = await pool
      .request()
      .input("BusinessUnitId", businessUnitId)
      .input("PhaseId", phaseId)
      .input("StatusId", statusId)
      .input("Title", title)
      .input("Headlines", headlines)
      .input("Opportunity", opportunity)
      .input("BusinessValue", businessValue)
      .input("SubTeamName", payload.subTeamName ?? null)
      .input("InformationUrl", payload.informationUrl ?? null)
      .input("EseDependency", eseDependency)
      .input("PrimaryContact", primaryContact)
      .input("EditorEmail", editorEmail)
      .input(
        "ChecklistJson",
        Array.isArray(payload.checklist) ? JSON.stringify(payload.checklist) : null,
      )
      .input("StakeholdersJson", JSON.stringify(stakeholders))
      .input("PlanJson", JSON.stringify(plan))
      .input("MetricsJson", JSON.stringify(metrics))
      .execute("dbo.CreateUseCase");
    const useCaseRecord = result.recordset?.[0] ?? {};
    const useCaseId =
      useCaseRecord?.UseCaseId ??
      useCaseRecord?.useCaseId ??
      useCaseRecord?.id ??
      null;
    let approvals = false;

    // TODO: Remove this businessUnitId gating once testing is complete.
    const shouldTriggerApprovalFlow = businessUnitId === 38 || businessUnitId === 39;

    if (useCaseId && shouldTriggerApprovalFlow) {
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
