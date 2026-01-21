// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@/lib/router';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
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
import { getBusinessStructure, getBusinessUnitsFromData, getSubTeamsForTeam, getTeamsForBusinessUnit } from '@/lib/submit-use-case';
import { Skeleton } from '@/components/ui/skeleton';
import { MyUseCasesPhaseCombobox } from "./phase-combobox";
import { MyUseCasesBusinessUnitCombobox } from "./business-unit-combobox";
import { MyUseCasesTeamCombobox } from "./team-combobox";
import { MyUseCasesSubTeamCombobox } from "./sub-team-combobox";

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

const MyUseCases = () => {
    const { useCases: backendUseCases, loading, error } = useUseCases();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
    const [searchUseCase, setSearchUseCase] = useState('');
    const [searchPhase, setSearchPhase] = useState<string[]>([]);
    const [searchBusinessUnit, setSearchBusinessUnit] = useState<string[]>([]);
    const [searchTeams, setSearchTeams] = useState<string[]>([]);
    const [searchSubTeams, setSearchSubTeams] = useState<string[]>([]);
    const [businessStructureData, setBusinessStructureData] = useState<any>(null);

    // Fetch business structure data on mount
    useEffect(() => {
        const fetchBusinessStructure = async () => {
            try {
                const data = await getBusinessStructure();
                setBusinessStructureData(data);
            } catch (error) {
                console.error('Error fetching business structure:', error);
            }
        };
        fetchBusinessStructure();
    }, []);

    const businessUnits = useMemo(() => {
        return getBusinessUnitsFromData(businessStructureData);
    }, [businessStructureData]);

    const selectedBusinessUnits = useMemo(() => {
        const filteredUnits = searchBusinessUnit.filter((unit) => unit !== "all");
        return filteredUnits.length ? filteredUnits : businessUnits;
    }, [searchBusinessUnit, businessUnits]);

    const teams = useMemo(() => {
        if (!businessStructureData) return [];
        const teamSet = new Set<string>();
        selectedBusinessUnits.forEach((unit) => {
            getTeamsForBusinessUnit(businessStructureData, unit).forEach((team) => teamSet.add(team));
        });
        return Array.from(teamSet).sort().map((name) => ({ label: name, value: name }));
    }, [businessStructureData, selectedBusinessUnits]);

    const subTeams = useMemo(() => {
        if (!businessStructureData) return [];
        const selectedTeams = searchTeams.filter((team) => team !== "all");
        const teamCandidates = selectedTeams.length ? selectedTeams : teams.map((team) => team.value);
        const subTeamSet = new Set<string>();
        selectedBusinessUnits.forEach((unit) => {
            const teamsForUnit = getTeamsForBusinessUnit(businessStructureData, unit);
            const teamsToUse = teamCandidates.length
                ? teamCandidates.filter((team) => teamsForUnit.includes(team))
                : teamsForUnit;
            teamsToUse.forEach((team) => {
                getSubTeamsForTeam(businessStructureData, unit, team).forEach((subTeam) => subTeamSet.add(subTeam));
            });
        });
        return Array.from(subTeamSet).sort().map((name) => ({ label: name, value: name }));
    }, [businessStructureData, selectedBusinessUnits, searchTeams, teams]);

    const phaseOptions = [
        { label: "Idea", value: "Idea" },
        { label: "Diagnose", value: "Diagnose" },
        { label: "Design", value: "Design" },
        { label: "Implemented", value: "Implemented" },
    ];

    const businessUnitOptions = [
        { label: "All Units", value: "all" },
        { label: "Communications", value: "Communications" },
        { label: "Customer Experience", value: "Customer Experience" },
        { label: "Engineering Product Innovation Cloud", value: "Engineering Product Innovation Cloud" },
        { label: "Global Business Operations", value: "Global Business Operations" },
        { label: "Go-to-Market", value: "Go-to-Market" },
        { label: "Legal", value: "Legal" },
        { label: "People", value: "People" },
    ];

    const finalTeams = useMemo(() => [
        { label: "All Teams", value: "all" },
        ...teams.map((team) => ({ label: team.label, value: team.value }))
    ], [teams]);

    const finalSubTeams = useMemo(() => [
        { label: "All Sub Teams", value: "all" },
        ...subTeams.map((subTeam) => ({ label: subTeam.label, value: subTeam.value }))
    ], [subTeams]);

    const displayUseCases = useMemo(() => {
        if (!backendUseCases) return [];
        if (backendUseCases.length === 0) return [];
        let mapped = backendUseCases.map(uc => ({
            id: uc.ID,
            title: uc.Title || uc.UseCase || 'Untitled',
            idea: uc.Phase === 'Idea' ? (uc.Status || 'In Progress') : (uc.Phase ? 'completed' : 'Not Set'),
            diagnose: uc.Phase === 'Diagnose' ? (uc.Status || 'In Progress') : 'Not Set',
            design: uc.Phase === 'Design' ? (uc.Status || 'In Progress') : 'Not Set',
            implemented: uc.Phase === 'Implemented' ? (uc.Status || 'In Progress') : 'Not Set',
            delivery: 'FY25Q04',
            priority: 1,
            status: uc.Status || 'In Progress',
            teamName: uc.TeamName || uc["Team Name"] || '',
            subTeamName: uc.SubTeamName || uc["Sub Team Name"] || ''
        }));

        // Filter Logic
        mapped = mapped.filter(uc => {
            if (searchUseCase && !uc.title.toLowerCase().includes(searchUseCase.toLowerCase())) return false;

            if (searchPhase.length > 0 && !searchPhase.includes('all')) {
                // Determine current phase for filtering
                const phase = uc.idea !== 'Not Set' && uc.idea !== 'completed' ? 'Idea' :
                    uc.diagnose !== 'Not Set' ? 'Diagnose' :
                        uc.design !== 'Not Set' ? 'Design' :
                            uc.implemented !== 'Not Set' ? 'Implemented' : '';
                if (!searchPhase.includes(phase)) return false;
            }

            if (searchTeams.length > 0 && !searchTeams.includes('all')) {
                const teamValue = (uc.teamName || '').toLowerCase();
                if (!searchTeams.some((team) => team.toLowerCase() === teamValue)) return false;
            }

            if (searchSubTeams.length > 0 && !searchSubTeams.includes('all')) {
                const subTeamValue = (uc.subTeamName || '').toLowerCase();
                if (!searchSubTeams.some((subTeam) => subTeam.toLowerCase() === subTeamValue)) return false;
            }
            // Business Unit filtering - assuming it would be available in the future, for now mostly UI
            // if (searchBusinessUnit && searchBusinessUnit !== 'all' && uc.businessUnit !== searchBusinessUnit) return false;

            return true;
        });

        return mapped;

    }, [backendUseCases, searchUseCase, searchPhase, searchBusinessUnit, searchTeams, searchSubTeams]);

    const columns = useMemo(() => createColumns(navigate), [navigate]);

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            {/* Filters Card */}
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    <div className="w-full overflow-x-auto">
                        <div className="grid min-w-[1120px] grid-cols-[auto_minmax(220px,1fr)_repeat(4,minmax(180px,1fr))_auto] items-center gap-4">
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

                            <MyUseCasesPhaseCombobox
                                options={[{ label: "All Phases", value: "all" }, ...phaseOptions]}
                                value={searchPhase}
                                onChange={setSearchPhase}
                            />

                            <MyUseCasesBusinessUnitCombobox
                                options={businessUnitOptions}
                                value={searchBusinessUnit}
                                onChange={setSearchBusinessUnit}
                            />

                            <MyUseCasesTeamCombobox
                                options={finalTeams}
                                value={searchTeams}
                                onChange={setSearchTeams}
                            />

                            <MyUseCasesSubTeamCombobox
                                options={finalSubTeams}
                                value={searchSubTeams}
                                onChange={setSearchSubTeams}
                            />

                            {(searchUseCase || searchPhase.length > 0 || searchBusinessUnit.length > 0 || searchTeams.length > 0 || searchSubTeams.length > 0) && (
                                <Button
                                    variant="ghost"
                                    className="h-8 px-3 text-sm justify-self-end"
                                    onClick={() => {
                                        setSearchUseCase('');
                                        setSearchPhase([]);
                                        setSearchBusinessUnit([]);
                                        setSearchTeams([]);
                                        setSearchSubTeams([]);
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
                            <KanbanView data={displayUseCases} navigate={navigate} sourceScreen="my-use-cases" />
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MyUseCases;
