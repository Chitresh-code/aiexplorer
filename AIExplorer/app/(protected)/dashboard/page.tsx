'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Award,
    BarChart2,
    FilePlus,
    FileText,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { ActionCard } from '@/components/shared/cards/ActionCard';
import { RecentSubmissionsCarousel } from '@/features/dashboard/components/RecentSubmissionsCarousel';
import { Button } from '@/components/ui/button';

interface RecentSubmission {
    ID: string;
    UseCase: string;
    AITheme: string;
    Status: string;
    Created: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const mainContentRef = useRef<HTMLDivElement | null>(null);

    const [showAlertModal, setShowAlertModal] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);

    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchRecentSubmissions = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/recent-submissions', {
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Failed to load KPI data (${response.status})`);
                }

                const data = (await response.json()) as RecentSubmission[];
                if (isMounted) {
                    setRecentSubmissions(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                const name = (error as { name?: string })?.name;
                if (name !== 'AbortError') {
                    console.error('Failed to fetch recent submissions:', error);
                    toast.error('Failed to load recent submissions');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchRecentSubmissions();

        return () => {
            isMounted = false;
            controller.abort();
        };
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

    const triggerPowerAutomate = async () => {
        try {
            const response = await fetch(
                "https://ad35491b5e07e8ee86b3dc7c9e5e52.05.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/96a0b0e4b274467cbf32e4066d5b42f7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=MuUwDFuoQ928DbrrenArGrEjpgp_b9MRXCkyQXDKwQ8",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: "John",
                        source: "ReactButton"
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log("Flow triggered successfully");
            toast.success("Flow triggered successfully!");
        } catch (error) {
            console.error("Error triggering flow:", error);
            toast.error("Failed to trigger flow");
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            <div className="flex justify-end">
                <Button 
                    onClick={triggerPowerAutomate}
                    variant="outline"
                    className="bg-primary/10 hover:bg-primary/20 border-primary/20"
                >
                    <Zap className="mr-2 h-4 w-4" />
                    Trigger Power Automate Flow (Test)
                </Button>
            </div>
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
