import { NextResponse } from "next/server";
import { isProd } from "@/lib/app-env";
import { logErrorTrace } from "@/lib/error-utils";
import { getSqlPool } from "@/lib/azure-sql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (): Promise<NextResponse> => {
  try {
    const pool = await getSqlPool();
    if (isProd) {
      return NextResponse.json(
        { ok: true, db: "up" },
        { headers: { "cache-control": "no-store" } },
      );
    }

    const result = await pool
      .request()
      .query(
        "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_SCHEMA, TABLE_NAME",
      );
    const tables = (result.recordset ?? []).map(
      (row: { TABLE_SCHEMA?: string; TABLE_NAME?: string }) => ({
        schema: row.TABLE_SCHEMA,
        name: row.TABLE_NAME,
      }),
    );
    return NextResponse.json(
      { ok: true, db: "up", tables },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Health check failed", error);
    const message = isProd
      ? "Service unavailable"
      : error instanceof Error
        ? error.message
        : String(error);
    return NextResponse.json(
      { ok: false, db: "down", message },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
};
