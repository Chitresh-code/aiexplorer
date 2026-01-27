import { useState, useEffect } from 'react';

export type AgentLibraryItem = {
  usecaseid: number | null;
  aiThemeIds?: number[] | null;
  personaIds?: number[] | null;
  knowledgeSourceIds?: number[] | null;
  aithemeid: number | null;
  personaid: number | null;
  id: number | null;
  vendormodelid: number | null;
  agentid: string | null;
  agentlink: string | null;
  prompt: string | null;
  modified: string | null;
  created: string | null;
  editor_email: string | null;
};

export const useAgentLibrary = (useCaseId: string | undefined) => {
  const [items, setItems] = useState<AgentLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!useCaseId) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchAgentLibrary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/usecases/${useCaseId}/agent-library`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch agent library: ${response.statusText}`);
        }

        const data = await response.json();
        if (isMounted) {
          setItems(data.items ?? []);
        }
      } catch (err) {
        if (isMounted && err instanceof Error && err.name !== 'AbortError') {
          setError(err);
          console.error('Error fetching agent library:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAgentLibrary();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [useCaseId]);

  return { items, loading, error };
};
