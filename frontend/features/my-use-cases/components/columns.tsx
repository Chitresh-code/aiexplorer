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

const phaseTooltips = {
    Idea: "Pitch idea. It is submitted for AI Champions or Business Leaders prioritization and approvals.",
    Diagnose: "Play with Proof of Concepts. Run the experiments in development environment.",
    Design: "Pilot a solution in a non-production environment. Quantify outcomes metrics and finalize a launch plan.",
    Implemented: "Production Launch of the solution and celebrate success."
};

// Define the UseCase type based on what's used in MyUseCases.tsx
export type UseCase = {
    id: string;
    title: string;
    idea: string;
    diagnose: string;
    design: string;
    implemented: string;
    delivery: string;
    priority: number;
};

// Helper function for navigation instructions
const getPhaseAndStatus = (useCase: UseCase) => {
    let phase = 'Idea';
    const status = 'On-Track';

    if (useCase.idea !== 'Not Set' && useCase.idea !== 'completed') phase = 'Idea';
    else if (useCase.diagnose !== 'Not Set') phase = 'Diagnose';
    else if (useCase.design !== 'Not Set') phase = 'Design';
    else if (useCase.implemented !== 'Not Set') phase = 'Implemented';
    else if (useCase.delivery) phase = 'Delivery';

    return { phase, status };
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

export const createColumns = (navigate: (path: string, options?: any) => void): ColumnDef<UseCase>[] => [
    {
        accessorKey: "id",
        header: () => (
            <div className="whitespace-nowrap font-bold text-gray-900">Use Case ID</div>
        ),
        cell: ({ row }) => {
            const id = row.getValue("id") as string | number;
            return <div className="whitespace-nowrap text-gray-600">{id}</div>;
        }
    },
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
    {
        accessorKey: "idea",
        header: () => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="text-center w-full cursor-pointer hover:text-teal-700 transition-colors">Idea</div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" sideOffset={-40} alignOffset={160}>
                        <p className="max-w-[200px] text-xs">{phaseTooltips.Idea}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
        cell: ({ row }) => {
            const useCase = row.original;
            const isCompleted = useCase.idea === 'completed';
            const isNotSet = useCase.idea === 'Not Set';
            const isClickable = !isCompleted && !isNotSet;

            return (
                <div
                    className={cn(
                        "flex items-center justify-center w-full h-full py-2 rounded whitespace-nowrap min-w-[120px]",
                        isCompleted ? "text-green-600" : "text-gray-400"
                    )}
                >
                    {isCompleted ? <Check size={16} /> : useCase.idea}
                </div>
            )
        },
    },
    {
        accessorKey: "diagnose",
        header: () => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="text-center w-full cursor-pointer hover:text-teal-700 transition-colors">Diagnose</div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" sideOffset={-40} alignOffset={200}>
                        <p className="max-w-[200px] text-xs">{phaseTooltips.Diagnose}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
        cell: ({ row }) => {
            const useCase = row.original;
            const isNotSet = useCase.diagnose === 'Not Set';

            return (
                <div
                    className={cn(
                        "text-center py-2 whitespace-nowrap min-w-[120px]",
                        !isNotSet ? "text-teal-700" : "text-gray-400"
                    )}
                >
                    {useCase.diagnose}
                </div>
            )
        }
    },
    {
        accessorKey: "design",
        header: () => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="text-center w-full cursor-pointer hover:text-teal-700 transition-colors">Design</div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" sideOffset={-40} alignOffset={450}>
                        <p className="max-w-[200px] text-xs">{phaseTooltips.Design}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
        cell: ({ row }) => {
            const useCase = row.original;
            const isNotSet = useCase.design === 'Not Set';

            return (
                <div
                    className={cn(
                        "text-center py-2 whitespace-nowrap min-w-[120px]",
                        !isNotSet ? "text-teal-700" : "text-gray-400"
                    )}
                >
                    {useCase.design}
                </div>
            )
        }
    },
    {
        accessorKey: "implemented",
        header: () => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="text-center w-full cursor-pointer hover:text-teal-700 transition-colors">Implemented</div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" sideOffset={-30} alignOffset={3450}>
                        <p className="max-w-[210px] text-xs">{phaseTooltips.Implemented}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
        cell: ({ row }) => {
            const useCase = row.original;
            const isNotSet = useCase.implemented === 'Not Set';

            return (
                <div
                    className={cn(
                        "text-center py-2 whitespace-nowrap min-w-[120px]",
                        !isNotSet ? "text-teal-700" : "text-gray-400"
                    )}
                >
                    {useCase.implemented}
                </div>
            )
        }
    },
    {
        accessorKey: "delivery",
        header: ({ column }) => (
            <div className="w-[80px] flex justify-center mx-auto">
                <DeliveryHeaderFilter column={column} />
            </div>
        ),
        cell: ({ row }) => (
            <div className="w-[80px] text-center text-gray-600 mx-auto">
                {row.getValue("delivery")}
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
            const priority = row.getValue("priority") as number;
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
]
