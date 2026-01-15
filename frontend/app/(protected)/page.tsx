'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Award,
  BarChart2,
  ChevronDown,
  ChevronUp,
  FilePlus,
  FileText,
  TrendingUp,
  Layers,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { ActionCard } from '@/components/shared/cards/ActionCard';
import { ChartAreaInteractive } from '@/features/dashboard/components/charts/ChartAreaInteractive';
import { RecentSubmissionsCarousel } from '@/features/dashboard/components/RecentSubmissionsCarousel';
import { SectionCards } from '@/features/dashboard/components/SectionCards';
import { useKPIData } from '@/features/dashboard/hooks/useKPIData';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();
  const mainContentRef = useRef<HTMLDivElement | null>(null);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const { recentSubmissions, loading } = useKPIData();

  useEffect(() => {
    const onScroll = () => {
      const scrollContainer = document.querySelector('.flex-1.overflow-auto') as HTMLElement;
      if (!scrollContainer) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 50);
    };

    setTimeout(onScroll, 100);
    const scrollContainer = document.querySelector('.flex-1.overflow-auto');
    scrollContainer?.addEventListener('scroll', onScroll);

    return () => scrollContainer?.removeEventListener('scroll', onScroll);
  }, []);

  const handleMyUseCasesClick = () => {
    if (recentSubmissions.length < 1 && !loading) {
      setShowAlertModal(true);
    } else {
      router.push('/my-use-cases');
    }
  };

  const handleAlertOk = () => {
    toast.info('Redirecting to submit use case...');
    router.push('/submit-use-case');
  };

  const actionCards = [
    {
      icon: FilePlus,
      title: 'Submit New Use Case',
      description: 'Create a new use case for quick and responsible prioritization',

      onClick: () => router.push('/submit-use-case'),
    },
    {
      icon: FileText,
      title: 'My Use Cases',
      description: 'View and manage your existing use cases',

      onClick: handleMyUseCasesClick,
    },
    {
      icon: BarChart2,
      title: 'Report Metrics',
      description:
        'Track and report outcomes via primary success metrics based on the PARC framework',

      onClick: () => router.push('/metric-reporting'),
    },
    {
      icon: Award,
      title: 'Champion Use Cases',
      description:
        'Configure AI insight byte – leadership suite reporting preferences',

      onClick: () => router.push('/champion'),
    },
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full">
      {/* Section Cards - KPI Metrics - Temporarily removed */}
      {/* <SectionCards /> */}

      {/* Chart Section - Temporarily removed */}
      {/* <div className="w-full">
        <ChartAreaInteractive />
      </div> */}

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {actionCards.map((card) => (
          <ActionCard key={card.title} {...card} className="min-h-[160px]" />
        ))}
      </div>

      {/* Recent Submissions Carousel */}
      <RecentSubmissionsCarousel
        loading={loading}
        useCases={recentSubmissions.map(item => ({
          ...item,
          ID: parseInt(item.ID)
        }))}
      />
    </div>
  );
}
