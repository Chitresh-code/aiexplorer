"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Check, Plus, Calendar, BarChart2, User, FileText, Edit, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@/lib/router";
import { setRouteState } from "@/lib/navigation-state";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DeliveryHeaderFilter } from "./delivery-header-filter";
import { PriorityHeaderFilter } from "./priority-header-filter";

type PhaseColumn = {
    id: number;
    name: string;
    stage?: string;
};

// Define the UseCase type based on what's used in MyUseCases.tsx
export type UseCase = {
    id: string;
    title: string;
    delivery: string;
    priority: number | null;
    status?: string;
    statusColor?: string;
    phaseId?: number | null;
    phase?: string;
    currentPhaseDisplay?: string;
    [key: string]: string | number | null | undefined;
};

// Helper function for navigation instructions
const getPhaseAndStatus = (useCase: UseCase) => {
    return { phase: useCase.phase || "Idea", status: useCase.status || "On-Track" };
};

const getPriorityColor = (priority: number) => {
    switch (priority) {
        case 1: return 'bg-red-100 text-red-800 border-red-200'; // Adjusted for Tailwind
        case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
        case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
        case 5: return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return '';
    }
};

export const createColumns = (
    navigate: (path: string, options?: any) => void,
    phases: PhaseColumn[],
    deliveryOptions?: { label: string; value: string }[],
): ColumnDef<UseCase>[] => {
    const phaseColumns: ColumnDef<UseCase>[] = phases.map((phase) => {
        const key = `phase_${phase.id}`;
        return {
            accessorKey: key,
            header: () => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="text-center w-full cursor-pointer hover:text-teal-700 transition-colors">
                                {phase.name}
                            </div>
                        </TooltipTrigger>
                        {phase.stage ? (
                            <TooltipContent side="bottom" align="start">
                                <p className="max-w-[200px] text-xs">{phase.stage}</p>
                            </TooltipContent>
                        ) : null}
                    </Tooltip>
                </TooltipProvider>
            ),
            cell: ({ row }) => {
                const value = String(row.getValue(key) ?? "");
                const isCompleted = value === "completed";
                const isNotSet = value === "Not Set" || value === "";

                return (
                    <div
                        className={cn(
                            "text-center py-2 whitespace-nowrap min-w-[120px]",
                            isCompleted ? "text-green-600" : isNotSet ? "text-gray-400" : "text-teal-700"
                        )}
                    >
                        {isCompleted ? <Check size={16} /> : value || "Not Set"}
                    </div>
                );
            },
        };
    });

    return [
        {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent pl-0 text-left font-bold text-gray-900"
                >
                    Use Case
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const useCase = row.original;

            return (
                <div
                    className="font-medium text-gray-900 cursor-pointer hover:underline"
                    onClick={() => {
                        setRouteState(`/use-case-details/${useCase.id}`, { useCaseTitle: useCase.title, sourceScreen: 'my-use-cases' });
                        navigate(`/use-case-details/${useCase.id}`);
                    }}
                >
                    {useCase.title}
                </div>
            )
        }
    },
        ...phaseColumns,
    {
        accessorKey: "delivery",
        header: ({ column }) => (
            <div className="w-[80px] flex justify-center mx-auto">
                <DeliveryHeaderFilter column={column} options={deliveryOptions} />
            </div>
        ),
        cell: ({ row }) => (
            <div className="w-[80px] text-center text-gray-600 mx-auto">
                {row.getValue("delivery") || "—"}
            </div>
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id) as string);
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => (
            <div className="w-[80px] flex justify-center mx-auto">
                <PriorityHeaderFilter column={column} />
            </div>
        ),
        cell: ({ row }) => {
            const priority = row.getValue("priority") as number | null;
            if (!priority) {
                return (
                    <div className="w-[80px] text-center text-gray-400 mx-auto">
                        —
                    </div>
                );
            }
            return (
                <div className="w-[80px] flex justify-center mx-auto">
                    <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-semibold border",
                        getPriorityColor(priority)
                    )}>
                        {priority}
                    </span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id)?.toString());
        },
    },
    // Temporarily removed actions column
    // {
    //     id: "actions",
    //     cell: ({ row }) => {
    //         const useCase = row.original;

    //         return (
    //             <DropdownMenu>
    //                 <DropdownMenuTrigger asChild>
    //                     <Button variant="ghost" className="h-8 w-8 p-0">
    //                         <span className="sr-only">Open menu</span>
    //                         <MoreVertical className="h-4 w-4" color="#008080" />
    //                     </Button>
    //                 </DropdownMenuTrigger>
    //                 <DropdownMenuContent align="start" side="bottom" avoidCollisions={true}>
    //                     <DropdownMenuItem onClick={() => navigate(`/add-agent-library/${useCase.id}`, {
    //                         state: { useCaseTitle: useCase.title, sourceScreen: 'my-use-cases' }
    //                     })}>
    //                         <Plus className="mr-2 h-4 w-4" /> Add Agent Library
    //                     </DropdownMenuItem>
    //                     <DropdownMenuItem onClick={() => navigate(`/add-timeline/${useCase.id}`, {
    //                         state: { useCaseTitle: useCase.title, sourceScreen: 'my-use-cases' }
    //                     })}>
    //                         <Calendar className="mr-2 h-4 w-4" /> Add Timelines
    //                     </DropdownMenuItem>
    //                     <DropdownMenuItem onClick={() => {
    //                         const { phase, status } = getPhaseAndStatus(useCase);
    //                         navigate(`/metrics/${useCase.id}`, {
    //                             state: {
    //                                 useCaseTitle: useCase.title,
    //                                 useCasePhase: phase,
    //                                 useCaseStatus: status,
    //                                 sourceScreen: 'my-use-cases'
    //                             }
    //                         });
    //                     }}>
    //                         <BarChart2 className="mr-2 h-4 w-4" /> Add Metrics
    //                     </DropdownMenuItem>
    //                     <DropdownMenuItem onClick={() => navigate('/submit-use-case', {
    //                         state: {
    //                             initialStep: 2,
    //                             useCaseTitle: useCase.title
    //                         }
    //                     })}>
    //                         <User className="mr-2 h-4 w-4" /> Add Stakeholders
    //                     </DropdownMenuItem>
    //                     <DropdownMenuItem onClick={() => navigate(`/meaningful-update/${useCase.id}`, {
    //                         state: { useCaseTitle: useCase.title, sourceScreen: 'my-use-cases' }
    //                     })}>>
    //                         <FileText className="mr-2 h-4 w-4" /> Add Meaningful Update
    //                     </DropdownMenuItem>
    //                     <DropdownMenuItem onClick={() => navigate(`/status/${useCase.id}`, {
    //                         state: { useCaseTitle: useCase.title, sourceScreen: 'my-use-cases' }
    //                     })}>
    //                         <Edit className="mr-2 h-4 w-4" /> Status
    //                     </DropdownMenuItem>
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         )
    //     },
    // },
    ];
}
