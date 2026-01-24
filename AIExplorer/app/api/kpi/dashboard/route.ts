import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const normalizePhase = (value: string) => value.trim().toLowerCase();

export const GET = async () => {
  try {
    const pool = await getSqlPool();
    const totalsResult = await pool.request().query(`
      SELECT COUNT(*) AS total FROM usecases;
    `);
    const totalUseCases = Number(totalsResult.recordset?.[0]?.total ?? 0);

    const implementedResult = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM usecases AS u
      LEFT JOIN phasemapping AS pm ON pm.id = u.phaseid
      WHERE LOWER(LTRIM(RTRIM(COALESCE(pm.Phase, '')))) = 'implemented';
    `);
    const implemented = Number(implementedResult.recordset?.[0]?.total ?? 0);

    const recentResult = await pool.request().query(`
      SELECT TOP 5
        u.id AS ID,
        u.title AS Title,
        sm.StatusName AS Status,
        u.created AS Created
      FROM usecases AS u
      LEFT JOIN statusmapping AS sm ON sm.id = u.statusid
      ORDER BY u.created DESC;
    `);

    const recent_submissions = (recentResult.recordset ?? []).map((row) => ({
      ID: String(row.ID ?? ""),
      UseCase: String(row.Title ?? ""),
      AITheme: "",
      Status: String(row.Status ?? ""),
      Created: row.Created ? formatDate(new Date(row.Created)) : "",
    }));

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 34);

    const timelineRequest = pool.request();
    timelineRequest.input("startDate", startDate);
    const timelineResult = await timelineRequest.query(`
      SELECT
        u.created AS Created,
        pm.Phase AS Phase
      FROM usecases AS u
      LEFT JOIN phasemapping AS pm ON pm.id = u.phaseid
      WHERE u.created >= @startDate;
    `);

    const buckets: Array<{
      date: string;
      idea: number;
      diagnose: number;
      design: number;
      implemented: number;
    }> = [];

    const bucketStart = new Date(startDate);
    bucketStart.setHours(0, 0, 0, 0);
    for (let i = 0; i < 5; i += 1) {
      const date = new Date(bucketStart);
      date.setDate(date.getDate() + i * 7);
      buckets.push({
        date: formatDate(date),
        idea: 0,
        diagnose: 0,
        design: 0,
        implemented: 0,
      });
    }

    const toBucketIndex = (created: Date) => {
      const diffMs = created.getTime() - bucketStart.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const index = Math.floor(diffDays / 7);
      return index >= 0 && index < buckets.length ? index : -1;
    };

    (timelineResult.recordset ?? []).forEach((row) => {
      if (!row?.Created) return;
      const created = new Date(row.Created);
      const bucketIndex = toBucketIndex(created);
      if (bucketIndex < 0) return;
      const phase = normalizePhase(String(row.Phase ?? ""));
      const bucket = buckets[bucketIndex];
      if (phase === "idea") bucket.idea += 1;
      else if (phase === "diagnose") bucket.diagnose += 1;
      else if (phase === "design") bucket.design += 1;
      else if (phase === "implemented") bucket.implemented += 1;
    });

    const last30Result = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM usecases
      WHERE created >= DATEADD(day, -30, SYSUTCDATETIME());
    `);
    const prev30Result = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM usecases
      WHERE created >= DATEADD(day, -60, SYSUTCDATETIME())
        AND created < DATEADD(day, -30, SYSUTCDATETIME());
    `);

    const last30 = Number(last30Result.recordset?.[0]?.total ?? 0);
    const prev30 = Number(prev30Result.recordset?.[0]?.total ?? 0);
    const trending = prev30 === 0 ? (last30 > 0 ? 100 : 0) : Math.round(((last30 - prev30) / prev30) * 100);
    const completionRate = totalUseCases > 0 ? Math.round((implemented / totalUseCases) * 100) : 0;

    return NextResponse.json({
      kpis: {
        totalUseCases,
        implemented,
        trending,
        completionRate,
      },
      recent_submissions,
      timeline: buckets,
    });
  } catch (error) {
    logErrorTrace("KPI dashboard failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to load KPI data.") },
      { status: 500 },
    );
  }
};
