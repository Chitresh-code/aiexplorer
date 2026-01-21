import { NextResponse } from "next/server";
import { findSimilarUseCases } from "@/features/gallery/server/usecases";

type SimilarRequest = {
  query?: string;
};

export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => ({}))) as SimilarRequest;
  const query = body.query ?? "";
  const items = findSimilarUseCases(query);
  return NextResponse.json({ items, total: items.length });
};
