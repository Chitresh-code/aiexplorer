import { NextResponse } from "next/server";
import { getUseCaseById } from "@/features/gallery/server/usecases";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) => {
  const params = await Promise.resolve(context.params);
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const useCase = getUseCaseById(id);
  if (!useCase) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(useCase);
};
