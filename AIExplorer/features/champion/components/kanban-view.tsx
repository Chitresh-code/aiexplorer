"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const phaseTooltips: Record<string, string> = {
    Idea: "Pitch idea. It is submitted for AI Champions or Business Leaders prioritization and approvals.",
    Diagnose: "Play with Proof of Concepts. Run the experiments in development environment.",
    Design: "Pilot a solution in a non-production environment. Quantify outcomes metrics and finalize a launch plan.",
    Implemented: "Production Launch of the solution and celebrate success."
};

type PhaseColumn = {
    id?: number;
    name: string;
    stage?: string;
};

type KanbanUseCase = {
    id: string | number;
    title: string;
    phase?: string;
    phaseId?: number | null;
    status?: string;
    statusColor?: string;
    priority?: number | null;
    delivery?: string;
    currentPhaseDisplay?: string;
    idea?: string;
    diagnose?: string;
    design?: string;
    implemented?: string;
    [key: string]: any;
};

interface KanbanViewProps {
    data: KanbanUseCase[];
    navigate: (path: string, options?: any) => void;
    sourceScreen?: string;
    phases?: PhaseColumn[];
}

const defaultPhases: PhaseColumn[] = [
    { id: 1, name: "Idea", stage: phaseTooltips.Idea },
    { id: 2, name: "Diagnose", stage: phaseTooltips.Diagnose },
    { id: 3, name: "Design", stage: phaseTooltips.Design },
    { id: 4, name: "Implemented", stage: phaseTooltips.Implemented },
];

const phasePalette = [
    { accent: "bg-blue-400", border: "#60a5fa", hover: "hover:border-blue-300" },
    { accent: "bg-purple-400", border: "#c084fc", hover: "hover:border-purple-300" },
    { accent: "bg-amber-400", border: "#fbbf24", hover: "hover:border-amber-300" },
    { accent: "bg-emerald-400", border: "#34d399", hover: "hover:border-emerald-300" },
];

const KanbanView = ({ data: initialData, navigate, sourceScreen = 'champion', phases }: KanbanViewProps) => {
    const [boardData, setBoardData] = useState<KanbanUseCase[]>(initialData);
    const phaseList = (phases && phases.length > 0 ? phases : defaultPhases).slice().sort((a, b) => {
        const aId = Number(a.id ?? 0);
        const bId = Number(b.id ?? 0);
        if (Number.isFinite(aId) && Number.isFinite(bId) && aId !== bId) {
            return aId - bId;
        }
        return a.name.localeCompare(b.name);
    });

    // Sync with props if they change
    useEffect(() => {
        setBoardData(initialData);
    }, [initialData]);

    const getUseCasePhase = (useCase: KanbanUseCase) => {
        const explicitPhase = String(useCase.phase ?? "").trim();
        if (explicitPhase) return explicitPhase;
        const phaseId = Number(useCase.phaseId);
        if (Number.isFinite(phaseId)) {
            const match = phaseList.find((phase) => Number(phase.id) === phaseId);
            if (match?.name) return match.name;
        }
        if (useCase.implemented && useCase.implemented !== 'Not Set' && useCase.implemented !== '') return 'Implemented';
        if (useCase.design && useCase.design !== 'Not Set' && useCase.design !== '') return 'Design';
        if (useCase.diagnose && useCase.diagnose !== 'Not Set' && useCase.diagnose !== '') return 'Diagnose';
        return 'Idea';
    };

    const groupedData = phaseList.reduce((acc, phase) => {
        acc[phase.name] = boardData.filter((uc) => getUseCasePhase(uc) === phase.name);
        return acc;
    }, {} as Record<string, KanbanUseCase[]>);

    const getPriorityStyles = (priority: number | null) => {
        switch (priority) {
            case 1: return 'bg-red-50 text-red-600 border-red-100';
            case 2: return 'bg-orange-50 text-orange-600 border-orange-100';
            case 3: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 4: return 'bg-blue-50 text-blue-600 border-blue-100';
            case 5: return 'bg-gray-50 text-gray-600 border-gray-100';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    const getStatusStyles = (status: string, statusColor?: string) => {
        const colorKey = String(statusColor ?? "").toLowerCase();
        if (colorKey) {
            const colorMap: Record<string, string> = {
                green: "bg-green-50 text-green-600 border-green-100",
                orange: "bg-orange-50 text-orange-600 border-orange-100",
                red: "bg-red-50 text-red-600 border-red-100",
                gray: "bg-gray-50 text-gray-600 border-gray-100",
                grey: "bg-gray-50 text-gray-600 border-gray-100",
                blue: "bg-blue-50 text-blue-600 border-blue-100",
            };
            if (colorMap[colorKey]) return colorMap[colorKey];
        }
        switch (status) {
            case 'On-Track': return 'bg-green-50 text-green-600 border-green-100';
            case 'At Risk': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Completed': return 'bg-green-50 text-green-600 border-green-100';
            case 'Help Needed': return 'bg-red-50 text-red-600 border-red-100';
            case 'No Updates': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Not Started': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Parked': return 'bg-gray-50 text-gray-600 border-gray-100';
            case 'Rejected': return 'bg-gray-50 text-gray-600 border-gray-100';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    return (
        <div className="w-full rounded-md border bg-white p-1.5 shadow-sm">
            <div className="flex gap-2 overflow-x-auto items-start min-h-[70vh] pb-2">
                {phaseList.map((phase, index) => {
                    const phaseColor = phasePalette[index % phasePalette.length];

                    return (
                    <div
                        key={`${phase.name}-${index}`}
                        className={cn(
                            "flex-1 min-w-[170px] max-w-[400px] flex flex-col transition-colors rounded-md"
                        )}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-1.5 px-0.5 pb-1 border-b border-gray-100">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1.5 min-w-0 cursor-help">
                                            <div className={cn("w-1.5 h-4 rounded-full flex-shrink-0", phaseColor.accent)} />
                                            <h2 className="font-bold text-base text-gray-700 tracking-widest uppercase truncate">{phase.name}</h2>
                                            <span className="text-[13px] font-bold text-gray-500 bg-gray-50 border border-gray-200 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ml-1.5 shadow-sm">
                                                {groupedData[phase.name]?.length || 0}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p className="max-w-[200px] text-xs">{phase.stage || phaseTooltips[phase.name]}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Column Content */}
                        <div className="space-y-1.5 pr-0.5 min-h-[150px]">
                            {groupedData[phase.name]?.map((uc) => {
                                const phaseKey = Number.isFinite(Number(phase.id)) ? `phase_${phase.id}` : "";
                                const rawPhaseValue = phaseKey && phaseKey in uc ? uc[phaseKey] : uc[phase.name.toLowerCase()];
                                const phaseValue = String(rawPhaseValue ?? "");
                                const shouldShowPhaseValue =
                                    phaseValue &&
                                    phaseValue !== "completed" &&
                                    phaseValue !== "Not Set";
                                return (
                                <div
                                    key={uc.id}
                                    className={cn(
                                        "bg-white border border-gray-200/60 rounded-lg py-5 px-3 shadow-none transition-all duration-150 cursor-pointer group border-l-2 min-h-[96px] flex flex-col justify-between",
                                        phaseColor.hover
                                    )}
                                    style={{
                                        borderLeftColor: phaseColor.border
                                    }}
                                    onClick={() => navigate(`/use-case-details/${uc.id}`, { state: { useCaseTitle: uc.title, sourceScreen: sourceScreen } })}
                                >
                                    <div className="flex flex-col gap-2 pointer-events-none">
                                        {/* Line 1: Title */}
                                        <div className="flex items-center w-full">
                                            <span className="font-semibold text-sm text-gray-800 leading-tight group-hover:text-teal-900 transition-colors line-clamp-1">
                                                {uc.title}
                                            </span>
                                        </div>

                                        {/* Line 2: Status, Priority, Delivery */}
                                        <div className="flex items-center gap-1 flex-wrap w-full">
                                            {uc.status && (
                                                <div className={cn(
                                                    "px-1 py-0 rounded text-[8px] font-bold border whitespace-nowrap",
                                                    getStatusStyles(uc.status, uc.statusColor)
                                                )}>
                                                    {uc.status}
                                                </div>
                                            )}

                                            {uc.priority && (
                                                <div className={cn(
                                                    "px-0.5 py-0 rounded text-[8px] font-bold border whitespace-nowrap",
                                                    getPriorityStyles(uc.priority)
                                                )}>
                                                    P{uc.priority}
                                                </div>
                                            )}

                                            {uc.delivery && uc.delivery !== 'Not Set' && uc.delivery !== '' && (
                                                <div className="px-1 py-0 rounded text-[8px] font-bold border bg-gray-50 text-gray-400 border-gray-100 whitespace-nowrap">
                                                    {uc.delivery}
                                                </div>
                                            )}
                                        </div>

                                        {/* Line 3: Date info */}
                                        {shouldShowPhaseValue && (
                                            <div className="text-[11px] text-gray-400 font-medium truncate leading-none">
                                                {phaseValue}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                );
                            })}

                            {groupedData[phase.name]?.length === 0 && (
                                <div className="border border-dashed border-gray-100 rounded py-4 flex flex-col items-center justify-center text-gray-200">
                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">Empty</span>
                                </div>
                            )}
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KanbanView;
