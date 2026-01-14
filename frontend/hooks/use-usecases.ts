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

export const useUseCases = (): UseCasesHookState => {
  const [useCases, setUseCases] = useState<UseCaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUseCases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUseCases();
      setUseCases(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to load use cases', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUseCases();
  }, [loadUseCases]);

  return { useCases, loading, error, refetch: loadUseCases };
};
