import { NextResponse } from "next/server";
import { getUseCaseFilters } from "@/features/gallery/server/usecases";

export const GET = async () => {
  const filters = getUseCaseFilters();
  return NextResponse.json(filters);
};
