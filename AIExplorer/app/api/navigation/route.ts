import { NextResponse } from "next/server";
import { access } from "fs/promises";
import path from "path";
import { NAV_ITEMS } from "@/features/navigation/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pageExtensions = ["ts", "tsx", "js", "jsx"];

const hasPage = async (routePath: string): Promise<boolean> => {
  const trimmed = routePath.replace(/^\/+/, "");
  if (!trimmed) return true;

  const routeDir = path.join(process.cwd(), "app", trimmed);
  for (const ext of pageExtensions) {
    try {
      await access(path.join(routeDir, `page.${ext}`));
      return true;
    } catch {
      // continue
    }
  }
  return false;
};

export const GET = async (): Promise<NextResponse> => {
  const results = await Promise.all(
    NAV_ITEMS.map(async (item) => ({
      item,
      exists: await hasPage(item.path),
    })),
  );
  const filtered = results.filter((entry) => entry.exists).map((entry) => entry.item);
  return NextResponse.json(filtered, {
    headers: { "cache-control": "no-store" },
  });
};
