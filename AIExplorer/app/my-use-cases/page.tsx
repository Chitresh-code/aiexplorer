'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@/lib/router';
import { useMsal } from '@azure/msal-react';
import { Plus, PlusCircle, LayoutGrid, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUseCases } from '@/hooks/use-usecases';
import { DataTable } from '@/features/my-use-cases/components/data-table';
import { createColumns } from '@/features/my-use-cases/components/columns';
import KanbanView from '@/features/champion/components/kanban-view';
import {
    getMappings,
} from '@/lib/submit-use-case';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterCombobox } from "@/components/shared/filter-combobox";
import type { UseCaseSummary } from "@/lib/types/usecase";

const UseCaseSkeleton = () => (
    <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-2">
                <Skeleton className="h-12 w-full rounded-md" />
            </div>
        ))}
    </div>
);

type BusinessUnitMapping = {
    id?: number | string | null;
    businessUnitName?: string;
    teamName?: string;
};

type PhaseMapping = {
    id?: number | string;
    name?: string;
    stage?: string;
};

type StatusMapping = {
    id?: number | string;
    name?: string;
    color?: string;
};

type TimespanMapping = {
    id?: number | string;
    timespan?: string;
    name?: string;
};

type NormalizedUseCase = {
    id: string;
    title: string;
    delivery: string;
    priority: number | null;
    status: string;
    statusColor: string;
    teamName: string;
    businessUnit: string;
    phase: string;
    phaseId: number | null;
    currentPhaseDisplay: string;
    [key: string]: string | number | null;
};

const MyUseCases = () => {
    const { accounts } = useMsal();
    const userEmail = accounts[0]?.username ?? "";
    const { useCases: backendUseCases, loading, error } = useUseCases({ email: userEmail });
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
    const [searchUseCase, setSearchUseCase] = useState('');
    const [searchPhase, setSearchPhase] = useState<string[]>([]);
    const [searchBusinessUnit, setSearchBusinessUnit] = useState<string[]>([]);
    const [searchStatus, setSearchStatus] = useState<string[]>([]);
    const [businessUnitsData, setBusinessUnitsData] = useState<{ items?: BusinessUnitMapping[] } | null>(null);
    const [phasesData, setPhasesData] = useState<PhaseMapping[]>([]);
    const [statusData, setStatusData] = useState<StatusMapping[]>([]);
    const [timespansData, setTimespansData] = useState<TimespanMapping[]>([]);

    // Fetch mappings on mount
    useEffect(() => {
        const fetchMappings = async () => {
            try {
                const mappings = await getMappings([
                    "businessUnits",
                    "phases",
                    "status",
                    "implementationTimespans",
                ]);
                setBusinessUnitsData(mappings.businessUnits ?? null);
                setPhasesData(mappings.phases?.items ?? []);
                setStatusData(mappings.status?.items ?? []);
                setTimespansData(mappings.implementationTimespans?.items ?? []);
            } catch (error) {
                console.error('Error fetching mappings:', error);
            }
        };
        fetchMappings();
    }, []);

    const businessUnits = useMemo(() => {
        const items = businessUnitsData?.items ?? [];
        const unique = new Set(
            items.map((unit) => String(unit.businessUnitName ?? "").trim()).filter(Boolean),
        );
        return Array.from(unique).sort((a: string, b: string) => a.localeCompare(b));
    }, [businessUnitsData]);

    const phaseOptions = useMemo(() => {
        return phasesData
            .map((item) => String(item.name ?? "").trim())
            .filter(Boolean)
            .sort((a: string, b: string) => a.localeCompare(b))
            .map((name: string) => ({ label: name, value: name }));
    }, [phasesData]);

    const statusOptions = useMemo(() => {
        return statusData
            .map((item) => String(item.name ?? "").trim())
            .filter(Boolean)
            .sort((a: string, b: string) => a.localeCompare(b))
            .map((name: string) => ({ label: name, value: name }));
    }, [statusData]);

    const phaseColumns = useMemo(() => {
        return phasesData
            .map((item) => ({
                id: Number(item.id),
                name: String(item.name ?? "").trim(),
                stage: String(item.stage ?? "").trim(),
            }))
            .filter((item) => item.name && Number.isFinite(item.id))
            .sort((a, b) => {
                if (a.id !== b.id) return a.id - b.id;
                return a.name.localeCompare(b.name);
            });
    }, [phasesData]);

    const deliveryOptions = useMemo(() => {
        return timespansData
            .map((item) => String(item.timespan ?? item.name ?? "").trim())
            .filter(Boolean)
            .sort((a: string, b: string) => a.localeCompare(b))
            .map((name: string) => ({ label: name, value: name }));
    }, [timespansData]);

    const businessUnitOptions = useMemo(() => [
        { label: "All Units", value: "all" },
        ...businessUnits.map((unit) => ({ label: unit, value: unit })),
    ], [businessUnits]);

    const normalizedUseCases = useMemo<NormalizedUseCase[]>(() => {
        if (!backendUseCases || backendUseCases.length === 0) return [];

        const formatDate = (value: string): string => {
            if (!value) return "";
            const parsed = new Date(value);
            if (Number.isNaN(parsed.getTime())) return "";
            const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
            const day = String(parsed.getUTCDate()).padStart(2, "0");
            const year = String(parsed.getUTCFullYear());
            return `${month}-${day}-${year}`;
        };

        return backendUseCases.flatMap((uc: UseCaseSummary) => {
            const phaseName = String(uc.phase ?? '').trim();
            const phaseId = Number(uc.phaseId ?? NaN);
            const status = String(uc.statusName ?? 'In Progress').trim();
            const parsedPlan = Array.isArray(uc.phasePlan) ? uc.phasePlan : [];
            const phaseEntry = parsedPlan.find(
                (entry) => Number(entry?.phaseId) === phaseId,
            );
            const startRaw = String(
                phaseEntry?.startDate ??
                "",
            );
            const endRaw = String(
                phaseEntry?.endDate ??
                "",
            );
            const start = formatDate(startRaw);
            const end = formatDate(endRaw);
            const currentPhaseDisplay = start && end ? `${start} - ${end}` : status;

            const phaseValues: Record<string, string> = {};
            phaseColumns.forEach((phase) => {
                const key = `phase_${phase.id}`;
                if (!Number.isFinite(phaseId)) {
                    phaseValues[key] = "Not Set";
                    return;
                }
                if (phase.id < phaseId) {
                    phaseValues[key] = "completed";
                    return;
                }
                if (phase.id > phaseId) {
                    phaseValues[key] = "Not Started";
                    return;
                }
                phaseValues[key] = currentPhaseDisplay;
            });

            const rawId = uc.id;
            if (rawId == null) return [];

            return [{
                id: String(rawId),
                title: uc.title || 'Untitled',
                delivery: uc.deliveryTimespan || '',
                priority: Number(uc.priority) || null,
                status,
                statusColor: uc.statusColor || '',
                teamName: uc.teamName || '',
                businessUnit: uc.businessUnitName || '',
                phase: phaseName,
                phaseId: Number.isFinite(phaseId) ? phaseId : null,
                currentPhaseDisplay,
                ...phaseValues,
            }];
        });
    }, [backendUseCases, phaseColumns]);

    const idOptions = useMemo(() => {
        const uniqueIds = new Set<string>();
        normalizedUseCases.forEach((useCase) => {
            const value = String(useCase.id ?? "").trim();
            if (value) uniqueIds.add(value);
        });
        return Array.from(uniqueIds)
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .map((value) => ({ label: value, value }));
    }, [normalizedUseCases]);

    const displayUseCases = useMemo(() => {
        if (!normalizedUseCases.length) return [];

        let mapped = normalizedUseCases.slice();

        // Filter Logic
        mapped = mapped.filter(uc => {
            if (searchUseCase && !uc.title.toLowerCase().includes(searchUseCase.toLowerCase())) return false;

            if (searchPhase.length > 0 && !searchPhase.includes('all')) {
                const phaseValue = String(uc.phase || '').toLowerCase();
                if (!searchPhase.some((phase) => phase.toLowerCase() === phaseValue)) return false;
            }

            if (searchStatus.length > 0 && !searchStatus.includes('all')) {
                const statusValue = (uc.status || '').toLowerCase();
                if (!searchStatus.some((status) => status.toLowerCase() === statusValue)) return false;
            }

            if (searchBusinessUnit.length > 0 && !searchBusinessUnit.includes('all')) {
                const unitValue = (uc.businessUnit || '').toLowerCase();
                if (!searchBusinessUnit.some((unit) => unit.toLowerCase() === unitValue)) return false;
            }

            return true;
        });

        return mapped;

    }, [
        normalizedUseCases,
        searchUseCase,
        searchPhase,
        searchStatus,
        searchBusinessUnit,
    ]);

    const columns = useMemo(
        () => createColumns(navigate, phaseColumns, deliveryOptions, idOptions),
        [navigate, phaseColumns, deliveryOptions, idOptions],
    );

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            {/* Filters Card */}
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    <div className="w-full overflow-x-auto">
                        <div className="grid min-w-[940px] grid-cols-[auto_minmax(220px,1fr)_repeat(3,minmax(180px,1fr))_auto] items-center gap-4">
                            <Tabs value={viewMode} onValueChange={(val: any) => setViewMode(val)}>
                                <TabsList className="bg-gray-100/80 p-1 rounded-lg border border-gray-200 h-10">
                                    <TabsTrigger
                                        value="table"
                                        className="h-8 w-8 p-0 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#13352C] text-gray-500"
                                        title="Table View"
                                    >
                                        <List className="size-4" />
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="kanban"
                                        className="h-8 w-8 p-0 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#13352C] text-gray-500"
                                        title="Board View"
                                    >
                                        <LayoutGrid className="size-4" />
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="relative min-w-[200px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter use cases..."
                                    value={searchUseCase}
                                    onChange={(e) => setSearchUseCase(e.target.value)}
                                    className="h-8 w-full pl-9 bg-white text-sm"
                                />
                            </div>

                            <FilterCombobox
                                multiple
                                placeholder="Phase"
                                options={[{ label: "All Phases", value: "all" }, ...phaseOptions]}
                                value={searchPhase}
                                onChange={setSearchPhase}
                                icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
                                className="w-full"
                                buttonClassName="h-8 px-3 border-dashed bg-white"
                            />

                            <FilterCombobox
                                multiple
                                placeholder="Status"
                                options={[{ label: "All Statuses", value: "all" }, ...statusOptions]}
                                value={searchStatus}
                                onChange={setSearchStatus}
                                icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
                                className="w-full"
                                buttonClassName="h-8 px-3 border-dashed bg-white"
                            />

                            <FilterCombobox
                                multiple
                                placeholder="Business Unit"
                                options={businessUnitOptions}
                                value={searchBusinessUnit}
                                onChange={setSearchBusinessUnit}
                                icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
                                className="w-full"
                                buttonClassName="h-8 px-3 border-dashed bg-white"
                            />

                            {(searchUseCase || searchPhase.length > 0 || searchStatus.length > 0 || searchBusinessUnit.length > 0) && (
                                <Button
                                    variant="ghost"
                                    className="h-8 px-3 text-sm justify-self-end"
                                    onClick={() => {
                                        setSearchUseCase('');
                                        setSearchPhase([]);
                                        setSearchStatus([]);
                                        setSearchBusinessUnit([]);
                                    }}
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Card */}
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    {loading && <UseCaseSkeleton />}
                    {error && <div className="text-center py-8 text-red-600">Error loading use cases: {error}</div>}
                    {!loading && !error && displayUseCases.length === 0 && (
                        <Empty className="mt-8 border border-dashed border-gray-200 bg-white/70">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Plus className="size-5 text-gray-600" />
                                </EmptyMedia>
                                <EmptyTitle>No use cases yet</EmptyTitle>
                                <EmptyDescription>
                                    Start by submitting a new use case to populate this list.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <button
                                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                                    onClick={() => navigate('/submit-use-case')}
                                >
                                    Submit a Use Case
                                </button>
                            </EmptyContent>
                        </Empty>
                    )}

                    {!loading && !error && displayUseCases.length > 0 && (
                        viewMode === 'table' ? (
                            <DataTable columns={columns} data={displayUseCases} />
                        ) : (
                            // @ts-ignore
                            <KanbanView
                                data={displayUseCases}
                                navigate={navigate}
                                sourceScreen="my-use-cases"
                                phases={phaseColumns}
                            />
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MyUseCases;
