"use client";

import { useState, useEffect } from "react";
import { UseCase } from "./columns";
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

interface KanbanViewProps {
    data: UseCase[];
    navigate: (path: string, options?: any) => void;
    sourceScreen?: string;
}

const phases = ["Idea", "Diagnose", "Design", "Implemented"];

const KanbanView = ({ data: initialData, navigate, sourceScreen = 'champion' }: KanbanViewProps) => {
    const [boardData, setBoardData] = useState<UseCase[]>(initialData);

    // Sync with props if they change
    useEffect(() => {
        setBoardData(initialData);
    }, [initialData]);

    const getUseCasePhase = (useCase: UseCase) => {
        if (useCase.implemented !== 'Not Set' && useCase.implemented !== '') return 'Implemented';
        if (useCase.design !== 'Not Set' && useCase.design !== '') return 'Design';
        if (useCase.diagnose !== 'Not Set' && useCase.diagnose !== '') return 'Diagnose';
        return 'Idea';
    };

    const groupedData = phases.reduce((acc, phase) => {
        acc[phase] = boardData.filter(uc => getUseCasePhase(uc) === phase);
        return acc;
    }, {} as Record<string, UseCase[]>);

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

    const getStatusStyles = (status: string) => {
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
                {phases.map((phase) => (
                    <div
                        key={phase}
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
                                            <div className={cn("w-1.5 h-4 rounded-full flex-shrink-0",
                                                phase === 'Idea' ? "bg-blue-400" :
                                                    phase === 'Diagnose' ? "bg-purple-400" :
                                                        phase === 'Design' ? "bg-amber-400" :
                                                            "bg-emerald-400"
                                            )} />
                                            <h2 className="font-bold text-base text-gray-700 tracking-widest uppercase truncate">{phase}</h2>
                                            <span className="text-[13px] font-bold text-gray-500 bg-gray-50 border border-gray-200 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ml-1.5 shadow-sm">
                                                {groupedData[phase]?.length || 0}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p className="max-w-[200px] text-xs">{phaseTooltips[phase]}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Column Content */}
                        <div className="space-y-1.5 pr-0.5 min-h-[150px]">
                            {groupedData[phase]?.map((uc) => (
                                <div
                                    key={uc.id}
                                    className={cn(
                                        "bg-white border border-gray-200/60 rounded-lg py-5 px-3 shadow-none transition-all duration-150 cursor-pointer group border-l-2 min-h-[96px] flex flex-col justify-between",
                                        phase === 'Idea' ? "hover:border-blue-300" :
                                            phase === 'Diagnose' ? "hover:border-purple-300" :
                                                phase === 'Design' ? "hover:border-amber-300" :
                                                    "hover:border-emerald-300"
                                    )}
                                    style={{
                                        borderLeftColor:
                                            phase === 'Idea' ? "#60a5fa" : // blue-400
                                                phase === 'Diagnose' ? "#c084fc" : // purple-400
                                                    phase === 'Design' ? "#fbbf24" : // amber-400
                                                        "#34d399" // emerald-400
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
                                            <div className={cn(
                                                "px-1 py-0 rounded text-[8px] font-bold border whitespace-nowrap",
                                                getStatusStyles(uc.status)
                                            )}>
                                                {uc.status}
                                            </div>

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
                                        {uc[phase.toLowerCase() as keyof UseCase] !== 'completed' && uc[phase.toLowerCase() as keyof UseCase] !== 'Not Set' && (
                                            <div className="text-[11px] text-gray-400 font-medium truncate leading-none">
                                                {uc[phase.toLowerCase() as keyof UseCase]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {groupedData[phase]?.length === 0 && (
                                <div className="border border-dashed border-gray-100 rounded py-4 flex flex-col items-center justify-center text-gray-200">
                                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">Empty</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanbanView;
