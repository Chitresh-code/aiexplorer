// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from '@/lib/router';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import { useUseCases } from '@/hooks/use-usecases';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { SectionCards } from "@/features/dashboard/components/SectionCards";
import { Skeleton } from '@/components/ui/skeleton';

const MetricSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-64" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
        <div className="rounded-md border p-4 space-y-4">
            <div className="grid grid-cols-7 gap-4 border-b pb-2">
                {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                ))}
            </div>
            {[...Array(3)].map((_, i) => (
                <div key={i} className="grid grid-cols-7 gap-4">
                    {[...Array(7)].map((_, j) => (
                        <Skeleton key={j} className="h-8 w-full" />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const MetricReporting = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { submittedMetrics, useCaseTitle, useCaseId } = location.state || {};
    const { useCases: backendUseCases, loading } = useUseCases();
    const useCases = backendUseCases.map(uc => ({
        id: uc.ID,
        title: uc.Title || uc.UseCase || 'Untitled'
    }));

    const [metrics, setMetrics] = useState([]);
    const [isReporting, setIsReporting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedUseCase, setSelectedUseCase] = useState(useCaseTitle || (useCases.length > 0 ? useCases[0].title : ''));

    // Update selectedUseCase if useCaseTitle changes or when useCases load
    useEffect(() => {
        if (useCaseTitle) {
            setSelectedUseCase(useCaseTitle);
        } else if (!selectedUseCase && useCases.length > 0) {
            setSelectedUseCase(useCases[0].title);
        }
    }, [useCaseTitle, useCases, selectedUseCase]);

    useEffect(() => {
        if (submittedMetrics) {
            // Initialize metrics with reported fields if not present
            const initializedMetrics = submittedMetrics.map(m => ({
                ...m,
                reportedValue: m.reportedValue || '',
                reportedDate: m.reportedDate || ''
            }));
            setMetrics(initializedMetrics);
        }
    }, [submittedMetrics]);

    const handleCreateMetric = () => {
        navigate(`/metrics/${useCaseId || ''}`, { state: { useCaseTitle, useCaseId } });
    };

    const handleReportMetric = () => {
        if (metrics.length > 0) {
            setIsReporting(true);
        }
    };

    const handleInputChange = (id, field, value) => {
        setMetrics(metrics.map(metric =>
            metric.id === id ? { ...metric, [field]: value } : metric
        ));
    };

    const isSubmitEnabled = isReporting && metrics.length > 0 && metrics.every(m => m.reportedValue && m.reportedDate);

    const handleSubmit = () => {
        if (isSubmitEnabled) {
            setShowSuccessModal(true);
        }
    };

    const handleModalOk = () => {
        setShowSuccessModal(false);
        setIsReporting(false);
        // Here you would typically save the reported values to a backend
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            {/* KPI Dashboard Section */}
            <div className="w-full">
                <SectionCards />
            </div>

            {/* Use Case Selector Card */}
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-64" />
                            <div className="flex items-center gap-2 ml-auto">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                    Use Case
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-64 justify-between">
                                            <span className="truncate">{selectedUseCase || "Select a use case"}</span>
                                            <ChevronDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64">
                                        {useCases.map((useCase) => (
                                            <DropdownMenuItem
                                                key={useCase.id}
                                                onClick={() => setSelectedUseCase(useCase.title)}
                                            >
                                                {useCase.title}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                                <Button variant="outline" onClick={handleCreateMetric}>
                                    Create Metric
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleReportMetric}
                                    disabled={metrics.length === 0}
                                >
                                    Report Metric
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!isSubmitEnabled}
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Metrics Table Card */}
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                            .number-input-no-spinner::-webkit-outer-spin-button,
                            .number-input-no-spinner::-webkit-inner-spin-button {
                                -webkit-appearance: none;
                                margin: 0;
                            }
                            .number-input-no-spinner[type=number] {
                                -moz-appearance: textfield;
                            }
                        `
                    }} />

                    {metrics.length > 0 ? (
                        <div className="rounded-md border overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">Primary Success Value</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">Baseline Value</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">Baseline Date</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">Target Value</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">Target Date</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">Reported Value</th>
                                        <th className="text-left p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">Reported Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map((metric) => (
                                        <tr key={metric.id} className="border-t">
                                            <td className="p-4">{metric.primarySuccessValue}</td>
                                            <td className="p-4">{metric.baselineValue}</td>
                                            <td className="p-4">{metric.baselineDate}</td>
                                            <td className="p-4">{metric.targetValue}</td>
                                            <td className="p-4">{metric.targetDate}</td>
                                            <td className="p-4">
                                                {isReporting ? (
                                                    <input
                                                        type="number"
                                                        className="w-full px-3 py-2 border rounded-md number-input-no-spinner"
                                                        value={metric.reportedValue}
                                                        onChange={(e) => handleInputChange(metric.id, 'reportedValue', e.target.value)}
                                                    />
                                                ) : (
                                                    metric.reportedValue || '-'
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {isReporting ? (
                                                    <input
                                                        type="date"
                                                        className="w-full px-3 py-2 border rounded-md"
                                                        value={metric.reportedDate}
                                                        onChange={(e) => handleInputChange(metric.id, 'reportedDate', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span>{metric.reportedDate || '-'}</span>
                                                        {metric.reportedDate && <Calendar size={16} className="text-muted-foreground" />}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Empty className="border border-dashed border-gray-200 bg-white/70">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Calendar className="size-5 text-gray-600" />
                                </EmptyMedia>
                                <EmptyTitle>No metrics to report</EmptyTitle>
                                <EmptyDescription>
                                    Create a metric for this use case before submitting values.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={handleCreateMetric}>
                                    Create Metric
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/')}
                                >
                                    Back to Home
                                </Button>
                            </EmptyContent>
                        </Empty>
                    )}
                </CardContent>
            </Card>

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <button className="absolute top-4 right-4" onClick={() => setShowSuccessModal(false)}>×</button>
                        <div className="flex items-center justify-center mb-4">
                            <Check size={48} className="text-green-600" />
                        </div>
                        <p className="text-center mb-4">
                            Reported metrics submitted successfully!
                        </p>
                        <Button onClick={handleModalOk} className="w-full">
                            OK
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetricReporting;
