import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const resolveBackendBaseUrl = (origin: string) => {
  const envUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").trim();

  if (envUrl && (envUrl.startsWith("http://") || envUrl.startsWith("https://"))) {
    try {
      const envOrigin = new URL(envUrl).origin;
      if (envOrigin !== origin) {
        return envUrl;
      }
    } catch {
      // Fall through to default.
    }
  }

  return "http://localhost:8000";
};

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const baseUrl = resolveBackendBaseUrl(origin);
  const backendUrl = new URL("/api/kpi/dashboard", baseUrl);

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        kpis: {
          totalUseCases: 0,
          implemented: 0,
          trending: 0,
          completionRate: 0,
        },
        timeline: [],
        recent_submissions: [],
        error: "Failed to reach backend KPI endpoint",
      },
      { status: 502 }
    );
  }
}
