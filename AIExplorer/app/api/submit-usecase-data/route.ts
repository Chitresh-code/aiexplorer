import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { isRowActive, pickValue, toStringValue } from "@/lib/mapping-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SqlRow = Record<string, unknown>;

const uniqueSorted = (values: string[]): string[] =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();

    const [
      themeResult,
      personaResult,
      vendorModelResult,
      roleResult,
      subteamResult,
      aiProductQuestionsResult,
      championResult,
      delegateResult,
    ] = await Promise.all([
      pool.request().query("SELECT * FROM aithememapping"),
      pool.request().query("SELECT * FROM personamapping"),
      pool.request().query("SELECT * FROM vendormodelmapping"),
      pool.request().query("SELECT * FROM rolemapping"),
      pool.request().query("SELECT * FROM subteammapping"),
      pool.request().query("SELECT * FROM aiproductquestions"),
      pool.request().query("SELECT * FROM ai_champions"),
      pool.request().query("SELECT * FROM aichampiondelegates"),
    ]);

    const themeItems = (themeResult.recordset ?? [])
      .filter(isRowActive)
      .map((row: SqlRow) => {
        const name = toStringValue(
          pickValue(row, ["ThemeName", "Theme Name"]),
        ).trim();
        return name ? { label: name, value: name } : null;
      })
      .filter(Boolean);

    const personaItems = (personaResult.recordset ?? [])
      .filter(isRowActive)
      .map((row: SqlRow) => {
        const name = toStringValue(
          pickValue(row, ["PersonaName", "Persona Name"]),
        ).trim();
        return name ? { label: name, value: name } : null;
      })
      .filter(Boolean);

    const vendorModels = new Map<string, Set<string>>();
    (vendorModelResult.recordset ?? []).filter(isRowActive).forEach((row: SqlRow) => {
      const vendorName = toStringValue(
        pickValue(row, ["VendorName", "Vendor Name"]),
      ).trim();
      const productName = toStringValue(
        pickValue(row, ["ProductName", "Product Name", "ModelName", "Model Name"]),
      ).trim();
      if (!vendorName) return;
      if (!vendorModels.has(vendorName)) {
        vendorModels.set(vendorName, new Set());
      }
      if (productName) {
        vendorModels.get(vendorName)?.add(productName);
      }
    });

    const ai_models = {
      vendors: Object.fromEntries(
        Array.from(vendorModels.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([vendor, models]) => [vendor, uniqueSorted(Array.from(models))]),
      ),
    };

    const vendors = Array.from(vendorModels.keys())
      .sort((a, b) => a.localeCompare(b))
      .map((vendor) => ({ VendorName: vendor }));

    const roles = {
      roles: uniqueSorted(
        (roleResult.recordset ?? [])
          .filter(isRowActive)
          .map((row: SqlRow) =>
            toStringValue(pickValue(row, ["RoleName", "Role Name"])).trim(),
          ),
      ),
    };

    const businessUnitMap = new Map<string, Map<string, Set<string>>>();
    (subteamResult.recordset ?? []).filter(isRowActive).forEach((row: SqlRow) => {
      const businessUnitName = toStringValue(
        pickValue(row, ["Business Unit Name", "BusinessUnitName", "BusinessUnit"]),
      ).trim();
      const teamName = toStringValue(pickValue(row, ["Team Name", "TeamName"])).trim();
      const subTeamName = toStringValue(
        pickValue(row, ["Sub Team Name", "SubTeamName", "SubteamName"]),
      ).trim();

      if (!businessUnitName || !teamName || !subTeamName) return;

      if (!businessUnitMap.has(businessUnitName)) {
        businessUnitMap.set(businessUnitName, new Map());
      }
      const teamMap = businessUnitMap.get(businessUnitName);
      if (!teamMap) return;
      if (!teamMap.has(teamName)) {
        teamMap.set(teamName, new Set());
      }
      teamMap.get(teamName)?.add(subTeamName);
    });

    const business_units: Record<string, Record<string, string[]>> = {};
    Array.from(businessUnitMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([unitName, teamMap]) => {
        const teams: Record<string, string[]> = {};
        Array.from(teamMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([teamName, subteams]) => {
            teams[teamName] = uniqueSorted(Array.from(subteams));
          });
        business_units[unitName] = teams;
      });

    const dropdown_data = {
      ai_themes: themeItems,
      personas: personaItems,
    };

    const ai_product_questions = (aiProductQuestionsResult.recordset ?? [])
      .filter(isRowActive)
      .map((row: SqlRow) => ({
        id: pickValue(row, ["Id", "ID"]),
        question: toStringValue(pickValue(row, ["Question"])).trim(),
        questionType: toStringValue(
          pickValue(row, ["QuestionType", "Question Type"]),
        ).trim(),
        responseValue: toStringValue(
          pickValue(row, ["ResponseValue", "Response Value"]),
        ).trim(),
      }))
      .filter((item) => item.question);

    const championEmails = new Set<string>();
    [championResult.recordset ?? [], delegateResult.recordset ?? []]
      .flat()
      .forEach((row: SqlRow) => {
        const email = toStringValue(
          pickValue(row, [
            "U Krewer.email",
            "U Krewer Email",
            "Ukrewer.EMail",
            "UkrewerEmail",
            "UKrewerEmail",
          ]),
        ).trim();
        if (email) {
          championEmails.add(email);
        }
      });

    const champion_names = {
      champions: Array.from(championEmails).sort((a, b) => a.localeCompare(b)),
    };

    return NextResponse.json(
      {
        ai_models,
        vendors,
        business_structure: { business_units },
        roles,
        dropdown_data,
        ai_product_questions,
        champion_names,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Submit use case data failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(
          error,
          "Failed to load submit use case data.",
        ),
      },
      { status: 500 },
    );
  }
};
