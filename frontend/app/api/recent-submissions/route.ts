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

type RecentSubmission = {
  ID?: string | number;
  UseCase?: string;
  AITheme?: string;
  Status?: string;
  Created?: string;
};

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const baseUrl = resolveBackendBaseUrl(origin);
  const backendUrl = new URL("/api/usecases/recent", baseUrl);
  backendUrl.searchParams.set("limit", "10");

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    const data = (await response.json()) as RecentSubmission[];

    if (!response.ok) {
      return NextResponse.json([], { status: response.status });
    }

    const mapped = Array.isArray(data)
      ? data.map((item) => ({
          ID: String(item.ID ?? ""),
          UseCase: item.UseCase ?? "",
          AITheme: item.AITheme ?? "",
          Status: item.Status ?? "Unknown",
          Created: item.Created ?? "",
        }))
      : [];

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json([], { status: 502 });
  }
}
