'use client';

import { useRouter } from 'next/navigation';

import { setRouteState } from '@/lib/navigation-state';

type NavigateOptions = {
  state?: unknown;
};

export function useNavigate() {
  const router = useRouter();

  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      if (to < 0) {
        router.back();
      } else {
        router.forward();
      }
      return;
    }

    if (options?.state) {
      setRouteState(to, options.state);
    }

    router.push(to);
  };
}
