'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { getRouteState } from '@/lib/navigation-state';
import { fetchChampionStatus } from '@/lib/champion';

import { AppSidebar } from '@/features/navigation/components/AppSidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress, accounts } = useMsal();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChampionUser, setIsChampionUser] = useState(false);
  const [isChampionLoading, setIsChampionLoading] = useState(true);

  const breadcrumbItems = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return [{ href: '/', label: 'Home', isCurrent: true }];
    }
    const items = [{ href: '/', label: 'Home', isCurrent: false }];
    let accumulatedPath = '';
    const routeLabels: Record<string, string> = {
      'champion': 'AI Champion - Use Cases',
      'my-use-cases': 'My Use Cases',
      'gallery': 'AI Gallery',
      'submit-use-case': 'Submit a Use Case',
      'add-agent-library': 'Add Agent Library',
      'add-timeline': 'Add Timeline',
      'metrics': 'Add Metrics',
      'meaningful-update': 'Add Meaningful Update',
      'status': 'Status',
      'approval': 'Approvals',
      'metadata-reporting': 'Metadata Reporting',
      'metric-reporting': 'Metric Reporting',
      'use-case-details': 'Use Case Details',
      'dashboard': 'Dashboard',
    };

    // Check if we're on a page that should show parent context
    const routeState = getRouteState(pathname) as { sourceScreen?: string; useCaseTitle?: string } | null;
    const querySource = searchParams.get('source');
    const queryTitle = searchParams.get('title');

    // Use route state first, then fall back to query parameters
    const sourceScreen = routeState?.sourceScreen || querySource;
    const useCaseTitle = routeState?.useCaseTitle || queryTitle;



    // Pages that should show parent context in breadcrumbs
    const pagesWithParentContext = [
      'meaningful-update',
      'status',
      'add-agent-library',
      'add-timeline',
      'approval',
      'metadata-reporting',
      'metrics',
      'use-case-details'
    ];

    const shouldShowParentContext = segments.some(segment => pagesWithParentContext.includes(segment)) && (sourceScreen || segments.includes('approval'));

    if (shouldShowParentContext) {
      // Add the parent screen to breadcrumbs based on source
      const parentLabels = {
        'my-use-cases': { href: '/my-use-cases', label: 'My Use Cases' },
        'champion': { href: '/champion', label: 'AI Champion - Use Cases' }
      };

      // For approval, default to champion if no source specified
      const effectiveSource = segments.includes('approval') && !sourceScreen ? 'champion' : sourceScreen;

      const parentInfo = parentLabels[effectiveSource as keyof typeof parentLabels];
      if (parentInfo) {
        items.push({
          href: parentInfo.href,
          label: parentInfo.label,
          isCurrent: false,
        });
      }
    }

    segments.forEach((segment, index) => {
      accumulatedPath += `/${segment}`;
      const isLast = index === segments.length - 1 || (index === segments.length - 2 && /^\d+$/.test(segments[segments.length - 1]));

      // Skip numeric segments (IDs) in breadcrumbs
      if (/^\d+$/.test(segment)) {
        return;
      }

      // Special handling for metadata-reporting page - combine with use case name
      const isMetadataReportingPage = segment === 'metadata-reporting';
      const isUseCaseDetailsPage = segment === 'use-case-details';

      if (isMetadataReportingPage && isLast && useCaseTitle) {
        items.push({
          href: '', // Empty href since this is the current page
          label: `${routeLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} - (${useCaseTitle})`,
          isCurrent: true,
        });
      } else if (isUseCaseDetailsPage && isLast && useCaseTitle) {
        items.push({
          href: '', // Empty href since this is the current page
          label: useCaseTitle,
          isCurrent: true,
        });
      } else {
        items.push({
          href: accumulatedPath || '/',
          label: routeLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
          isCurrent: isLast,
        });
      }
    });
    return items;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isAuthenticated && inProgress === 'none') {
      router.replace('/login');
    }
  }, [isAuthenticated, inProgress, router]);

  useEffect(() => {
    let isMounted = true;
    const email = accounts[0]?.username ?? '';
    if (!email) {
      setIsChampionUser(false);
      setIsChampionLoading(false);
      return;
    }
    const loadChampion = async () => {
      try {
        const isChampion = await fetchChampionStatus(email);
        if (isMounted) {
          setIsChampionUser(isChampion);
        }
      } catch (error) {
        console.error('Champion check failed:', error);
        if (isMounted) {
          setIsChampionUser(false);
        }
      } finally {
        if (isMounted) {
          setIsChampionLoading(false);
        }
      }
    };
    loadChampion();
    return () => {
      isMounted = false;
    };
  }, [accounts]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
        Checking authentication...
      </div>
    );
  }

  if (isChampionLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 border-r border-gray-200 bg-white p-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={`nav-skel-${idx}`} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={`page-skel-${idx}`} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ '--sidebar-width-icon': '4rem' } as CSSProperties}>
      <AppSidebar isChampionUser={isChampionUser} isChampionLoading={isChampionLoading} />
      <SidebarInset className="min-w-0">
        <AppHeader breadcrumbItems={breadcrumbItems} isScrolled={isScrolled} />
        <div className="flex min-h-screen flex-col bg-gray-50">
          <div className="flex-1">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppHeader({
  breadcrumbItems,
  isScrolled,
}: {
  breadcrumbItems: {
    href: string;
    label: string;
    isCurrent: boolean;
  }[];
  isScrolled: boolean;
}) {
  const { state } = useSidebar();
  const showNavbarLogo = state === 'collapsed';

  return (
    <div
      className={`flex h-14 items-center gap-2 bg-white px-4 transition-shadow duration-200 ${isScrolled ? 'border-b border-gray-200 shadow-sm' : ''
        }`}
    >
      {showNavbarLogo && (
        <Link href="/" className="flex items-center">
          <Image
            src="/ukg-logo.png"
            alt="UKG Logo"
            width={96}
            height={24}
            className="h-6 w-auto"
            priority
          />
        </Link>
      )}
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {item.isCurrent ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
