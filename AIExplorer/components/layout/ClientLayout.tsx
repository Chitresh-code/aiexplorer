'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

const publicRoutes = new Set(['/login']);

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (publicRoutes.has(pathname)) {
    return <>{children}</>;
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
}
