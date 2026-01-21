'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { getRouteState } from '@/lib/navigation-state';

export interface LocationState<T = Record<string, unknown>> {
  pathname: string;
  search: string;
  state: T | null;
}

export function useLocation<T = Record<string, unknown>>(): LocationState<T> {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<T | null>(null);

  useEffect(() => {
    setState(getRouteState<T>(pathname));
  }, [pathname]);

  return useMemo(
    () => ({
      pathname,
      search: searchParams.toString()
        ? `?${searchParams.toString()}`
        : '',
      state,
    }),
    [pathname, searchParams, state],
  );
}
