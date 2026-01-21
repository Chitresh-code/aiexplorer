import { useEffect, useMemo, useState } from "react";

import type {
  GalleryUseCase,
  GalleryUseCaseListItem,
} from "@/features/gallery/types";
import { fetchUseCase } from "@/features/gallery/api/client";

type UseCaseSummary = GalleryUseCase | GalleryUseCaseListItem;

const hasDetails = (useCase: UseCaseSummary | null | undefined) =>
  Boolean(
    "headline" in (useCase ?? {}) &&
      "opportunity" in (useCase ?? {}) &&
      "evidence" in (useCase ?? {}),
  );

export const useGalleryDetail = (
  id: number | null,
  initial?: UseCaseSummary | null,
) => {
  const [useCase, setUseCase] = useState<UseCaseSummary | null>(
    initial ?? null,
  );
  const [isLoading, setIsLoading] = useState(!hasDetails(initial));
  const [error, setError] = useState<string | null>(null);

  const shouldFetch = useMemo(
    () => Boolean(id && !hasDetails(useCase)),
    [id, useCase],
  );

  useEffect(() => {
    if (!shouldFetch || id === null) return;
    const controller = new AbortController();
    setIsLoading(true);
    fetchUseCase(id, controller.signal)
      .then((response) => setUseCase(response))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to load use case", err);
        setError("Unable to load use case.");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [id, shouldFetch]);

  return { useCase, isLoading, error };
};
