import { NextResponse } from "next/server";
import { getSqlPool } from "@/lib/azure-sql";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!email) {
    return NextResponse.json({ isChampion: false }, { status: 200 });
  }

  try {
    const pool = await getSqlPool();
    const result = await pool
      .request()
      .input("Email", email)
      .query(
        `
        SELECT TOP 1 id
        FROM dbo.ai_champions
        WHERE LOWER(LTRIM(RTRIM(COALESCE(u_krewer_email, '')))) = @Email;
        `,
      );

    const isChampion = (result.recordset?.length ?? 0) > 0;
    return NextResponse.json(
      { isChampion },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Champion check failed", error);
    return NextResponse.json(
      { message: getUiErrorMessage(error, "Failed to check champion status.") },
      { status: 500 },
    );
  }
};
