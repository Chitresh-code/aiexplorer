"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from '@/lib/router';
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/features/champion/components/data-table";
import { createColumns, UseCase } from "@/features/champion/components/columns";
import KanbanView from "@/features/champion/components/kanban-view";
import { getDropdownData } from '@/lib/submit-use-case';
import { SectionCards } from "@/features/dashboard/components/SectionCards";
import { Skeleton } from "@/components/ui/skeleton";
import { ChampionPhaseCombobox } from "./phase-combobox";
import { ChampionBusinessUnitCombobox } from "./business-unit-combobox";
import { ChampionTargetPersonasCombobox } from "./target-personas-combobox";
import { ChampionAIThemesCombobox } from "./ai-themes-combobox";

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

const ChampionUseCaseScreen = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
    const [sortOption, setSortOption] = useState<string[]>([]);
    const [searchUseCase, setSearchUseCase] = useState('');
    const [searchPhase, setSearchPhase] = useState<string[]>([]);
    const [searchTargetPersonas, setSearchTargetPersonas] = useState<string[]>([]);
    const [searchAiThemes, setSearchAiThemes] = useState<string[]>([]);
    const [dropdownData, setDropdownData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch dropdown data on mount
    useEffect(() => {
        const fetchDropdownData = async () => {
            setIsLoading(true);
            try {
                const data = await getDropdownData();
                setDropdownData(data);
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDropdownData();
    }, []);

    // Computed personas options
    const personas = useMemo(() => {
        if (!dropdownData?.personas) return [];
        const seen = new Set();
        return dropdownData.personas.filter((item: any) => {
            const label = item.label.trim().toLowerCase();
            if (seen.has(label)) return false;
            seen.add(label);
            return true;
        });
    }, [dropdownData]);

    // Computed AI themes options
    const aiThemes = useMemo(() => {
        if (!dropdownData?.ai_themes) return [];
        const seen = new Set();
        return dropdownData.ai_themes.filter((item: any) => {
            const label = item.label.trim().toLowerCase();
            if (seen.has(label)) return false;
            seen.add(label);
            return true;
        });
    }, [dropdownData]);

    const useCases: UseCase[] = [
        { id: 1, title: 'AchmanTest', idea: 'completed', diagnose: '11/21/25 - 11/26/25', design: 'Not Set', implemented: 'Not Set', delivery: 'FY25Q04', priority: 1, status: 'On-Track' },
        { id: 2, title: 'AchmanTest1', idea: '10/04/25 - 10/31/25', diagnose: 'Not Set', design: 'Not Set', implemented: 'Not Set', delivery: 'FY26Q01', priority: 2, status: 'At Risk' },
        { id: 3, title: 'AchmanTest3', idea: '10/03/25 - 10/31/25', diagnose: 'Not Set', design: 'Not Set', implemented: 'Not Set', delivery: 'FY25Q04', priority: 2, status: 'Completed' },
        { id: 4, title: 'AchmanTest4', idea: '10/03/25 - 10/31/25', diagnose: 'Not Set', design: 'Not Set', implemented: 'Not Set', delivery: '', priority: null, status: 'Help Needed' },
        { id: 5, title: 'AchmanTest5', idea: '10/07/25 - 10/31/25', diagnose: 'Not Set', design: 'Not Set', implemented: 'Not Set', delivery: '', priority: null, status: 'No Updates' },
        { id: 6, title: 'Test Uc123', idea: '10/23/25 - 10/28/25', diagnose: 'Not Set', design: 'Not Set', implemented: 'Not Set', delivery: '', priority: null, status: 'Not Started' },
        { id: 7, title: 'Test UC Stakeholder Error', idea: '10/23/25 - 10/23/25', diagnose: 'Not Set', design: 'Not Set', implemented: 'Not Set', delivery: '', priority: null, status: 'Parked' },
        { id: 8, title: 'Test UC Stakeholder Error 2', idea: '10/25/25 - 10/27/25', diagnose: 'Not Set', design: 'Not Set', implemented: 'Not Set', delivery: '', priority: null, status: 'Rejected' },
        { id: 9, title: 'Actest', idea: '10/17/25 - 10/31/25', diagnose: 'Not Set', design: 'Not Set', implemented: 'Not Set', delivery: 'FY25Q04', priority: 2, status: 'On-Track' },
        { id: 10, title: 'test', idea: '10/22/25 - 10/31/25', diagnose: 'Not Set', design: 'Not Set', implemented: 'Not Set', delivery: '', priority: null, status: 'At Risk' },
    ];

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

    const finalPersonas = useMemo(() => [
        { label: "All Personas", value: "all" },
        ...personas
    ], [personas]);

    const finalAiThemes = useMemo(() => [
        { label: "All Themes", value: "all" },
        ...aiThemes
    ], [aiThemes]);

    // Basic filtering logic (Client-side for this demo)
    const filteredData = useCases.filter(uc => {
        if (searchUseCase && !uc.title.toLowerCase().includes(searchUseCase.toLowerCase())) return false;

        if (searchPhase.length > 0 && !searchPhase.includes('all')) {
            const phase = uc.idea !== 'Not Set' && uc.idea !== 'completed' ? 'Idea' :
                uc.diagnose !== 'Not Set' ? 'Diagnose' :
                    uc.design !== 'Not Set' ? 'Design' :
                        uc.implemented !== 'Not Set' ? 'Implemented' : '';
            if (!searchPhase.includes(phase)) return false;
        }
        return true;
    });

    // Sorting logic can be handled by DataTable, but "Sort By Business Unit" is specific.
    // Since Business Unit is not in the data model shown, we will just keep the dropdown for UI fidelity
    // but it won't functionally sort unless we add that field.

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            {/* KPI Dashboard Section */}
            <div className="w-full">
                <SectionCards />
            </div>

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
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter use cases..."
                                    value={searchUseCase}
                                    onChange={(e) => setSearchUseCase(e.target.value)}
                                    className="h-10 w-full pl-10 bg-white text-sm"
                                />
                            </div>

                            <ChampionPhaseCombobox
                                options={phaseOptions}
                                value={searchPhase}
                                onChange={setSearchPhase}
                            />

                            <ChampionBusinessUnitCombobox
                                options={businessUnitOptions}
                                value={sortOption}
                                onChange={setSortOption}
                            />

                            <ChampionTargetPersonasCombobox
                                options={finalPersonas}
                                value={searchTargetPersonas}
                                onChange={setSearchTargetPersonas}
                            />

                            <ChampionAIThemesCombobox
                                options={finalAiThemes}
                                value={searchAiThemes}
                                onChange={setSearchAiThemes}
                            />

                            {(searchUseCase || searchPhase.length > 0 || sortOption.length > 0 || searchTargetPersonas.length > 0 || searchAiThemes.length > 0) && (
                                <Button
                                    variant="ghost"
                                    className="h-10 px-3 text-sm justify-self-end"
                                    onClick={() => {
                                        setSearchUseCase('');
                                        setSearchPhase([]);
                                        setSortOption([]);
                                        setSearchTargetPersonas([]);
                                        setSearchAiThemes([]);
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
                    {isLoading ? (
                        <UseCaseSkeleton />
                    ) : (
                        viewMode === 'table' ? (
                            <DataTable columns={createColumns(navigate)} data={filteredData} />
                        ) : (
                            <KanbanView data={filteredData} navigate={navigate} />
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ChampionUseCaseScreen;
