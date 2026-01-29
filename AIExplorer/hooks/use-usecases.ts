'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchUseCases } from '@/lib/api';

export interface UseCaseRecord {
  ID: number;
  UseCase?: string;
  Title?: string;
  Phase?: string;
  Status?: string;
  [key: string]: unknown;
}

interface UseCasesHookState {
  useCases: UseCaseRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUseCases = (options?: { email?: string }): UseCasesHookState => {
  const [useCases, setUseCases] = useState<UseCaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUseCases = useCallback(async () => {
    setLoading(true);
    try {
      if (options?.email !== undefined && !options.email.trim()) {
        setUseCases([]);
        setError(null);
        return;
      }
      if (options?.email) {
        const response = await fetch(
          `/api/usecases?role=owner&email=${encodeURIComponent(options.email)}&view=full`,
          { headers: { Accept: "application/json" } },
        );
        if (!response.ok) {
          const details = await response.text().catch(() => "");
          throw new Error(details || "Failed to load user use cases.");
        }
        const data = await response.json();
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setUseCases(items);
      } else {
        const data = await fetchUseCases();
        setUseCases(Array.isArray(data) ? data : []);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load use cases', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options?.email]);

  useEffect(() => {
    void loadUseCases();
  }, [loadUseCases]);

  return { useCases, loading, error, refetch: loadUseCases };
};
