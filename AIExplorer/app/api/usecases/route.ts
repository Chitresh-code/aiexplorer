import { NextResponse } from "next/server";
import { listUseCases } from "@/features/gallery/server/usecases";
import type { UseCaseQuery } from "@/features/gallery/types";

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

  const response = listUseCases(query);
  return NextResponse.json(response);
};
