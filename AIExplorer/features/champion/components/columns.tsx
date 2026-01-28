"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Check, Calendar, BarChart2, User, FileText, ArrowUp, Edit, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { setRouteState } from "@/lib/navigation-state";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HeaderMultiFilter } from "@/components/table/header-multi-filter";

const phaseTooltips = {
    Idea: "Pitch idea. It is submitted for AI Champions or Business Leaders prioritization and approvals.",
    Diagnose: "Play with Proof of Concepts. Run the experiments in development environment.",
    Design: "Pilot a solution in a non-production environment. Quantify outcomes metrics and finalize a launch plan.",
    Implemented: "Production Launch of the solution and celebrate success."
};

// Status update dialog component
const StatusUpdateDialog = ({ useCase, open, onOpenChange }: {
    useCase: UseCase;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    const [selectedPhase, setSelectedPhase] = useState(getCurrentPhase(useCase));
    const [selectedStatus, setSelectedStatus] = useState('Completed');

    const phases = ['Idea', 'Diagnose', 'Design', 'Implemented', 'Delivery'];
    const statusOptions = ['On-Track', 'At Risk', 'Completed', 'Help Needed', 'No Updates', 'Not Started', 'Parked', 'Rejected'];

    const handleUpdateStatus = () => {
        toast.success('Status updated successfully');
        onOpenChange(false);
        // Reset to default values
        setSelectedPhase(getCurrentPhase(useCase));
        setSelectedStatus('Completed');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Current Use Case Phase Status</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-2">{useCase.title}</p>
                </DialogHeader>
                <div className="py-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phase</label>
                        <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select phase" />
                            </SelectTrigger>
                            <SelectContent>
                                {phases.map((phase) => (
                                    <SelectItem key={phase} value={phase}>
                                        {phase}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            className="bg-[#13352C] hover:bg-[#0f2a23] text-white"
                        >
                            Update Status
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Define the UseCase type based on ChampionUseCaseScreen
export type UseCase = {
    id: number;
    title: string;
    idea: string;
    diagnose: string;
    design: string;
    implemented: string;
    delivery: string;
    priority: 1 | 2 | 3 | 4 | 5 | null;
    status: string;
    statusColor?: string;
};

// Helper function for navigation instructions
const getPhaseAndStatus = (useCase: UseCase) => {
    let phase = 'Idea';
    const status = 'On-Track';

    if (useCase.idea !== 'Not Set' && useCase.idea !== 'completed') phase = 'Idea';
    else if (useCase.diagnose !== 'Not Set') phase = 'Diagnose';
    else if (useCase.design !== 'Not Set') phase = 'Design';
    else if (useCase.implemented !== 'Not Set') phase = 'Implemented';

    return { phase, status };
};

const getCurrentPhase = (useCase: UseCase) => {
    if (useCase.idea !== 'Not Set' && useCase.idea !== 'completed') return 'Idea';
    if (useCase.diagnose !== 'Not Set') return 'Diagnose';
    if (useCase.design !== 'Not Set') return 'Design';
    if (useCase.implemented !== 'Not Set') return 'Implemented';
    return 'Idea';
};

const getPriorityColor = (priority: number | null) => {
    switch (priority) {
        case 1: return 'bg-red-100 text-red-800 border-red-200';
        case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
        case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
        case 5: return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return '';
    }
};

const ActionCell = ({ useCase, navigate }: { useCase: UseCase; navigate: (path: string, options?: any) => void }) => {
    const [showStatusModal, setShowStatusModal] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" color="#008080" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/add-timeline/${useCase.id}`, {
                        state: { useCaseTitle: useCase.title, sourceScreen: 'champion' }
                    })}>
                        <Calendar className="mr-2 h-4 w-4" /> Add Timelines
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        const { phase, status } = getPhaseAndStatus(useCase);
                        navigate(`/metrics/${useCase.id}`, {
                            state: {
                                useCaseTitle: useCase.title,
                                useCasePhase: phase,
                                useCaseStatus: status,
                                sourceScreen: 'champion'
                            }
                        });
                    }}>
                        <BarChart2 className="mr-2 h-4 w-4" /> Add Metrics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/submit-use-case', {
                        state: {
                            initialStep: 2,
                            useCaseTitle: useCase.title
                        }
                    })}>
                        <User className="mr-2 h-4 w-4" /> Add Stakeholders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/meaningful-update/${useCase.id}`, {
                        state: { useCaseTitle: useCase.title, sourceScreen: 'champion' }
                    })}>
                        <FileText className="mr-2 h-4 w-4" /> Add Meaningful Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setRouteState(`/metadata-reporting/${useCase.id}`, { useCaseTitle: useCase.title, sourceScreen: 'champion' });
                        navigate(`/metadata-reporting/${useCase.id}?source=champion&title=${encodeURIComponent(useCase.title)}`);
                    }}>
                        <ArrowUp className="mr-2 h-4 w-4" /> Reprioritize
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setShowStatusModal(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Modify Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setRouteState(`/approval/${useCase.id}`, { useCaseTitle: useCase.title, sourceScreen: 'champion' });
                        navigate(`/approval/${useCase.id}`);
                    }}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Approvals
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <StatusUpdateDialog
                useCase={useCase}
                open={showStatusModal}
                onOpenChange={setShowStatusModal}
            />
        </>
    );
};

export const createColumns = (navigate: (path: string, options?: any) => void): ColumnDef<UseCase>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                onClick={(e) => e.stopPropagation()}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: ({ column }) => (
            <div className="w-[80px] flex justify-center mx-auto">
                <HeaderMultiFilter column={column} label="ID" />
            </div>
        ),
        cell: ({ row }) => {
            const id = row.getValue("id") as number | string;
            return <div className="w-[80px] text-center text-gray-600 mx-auto">{id}</div>;
        },
        filterFn: (row, id, value) => {
            if (!value || value.length === 0) return true;
            return value.includes(row.getValue(id)?.toString());
        },
    },
    {
        accessorKey: "title",
        header: () => (
            <div className="font-medium text-gray-900">Use Case</div>
        ),
        cell: ({ row }) => {
            const useCase = row.original;
            return (
                <div
                    className="font-medium text-gray-900 cursor-pointer hover:underline"
                    onClick={() => {
                        setRouteState(`/use-case-details/${useCase.id}`, { useCaseTitle: useCase.title, sourceScreen: 'champion' });
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
                    <TooltipContent side="bottom" align="start" sideOffset={0} alignOffset={160}>
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
                        "flex items-center justify-center w-full h-full py-2 rounded whitespace-nowrap min-w-[100px]",
                        isCompleted ? "text-green-600 bg-teal-50/50" : "text-gray-400"
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
                    <TooltipContent side="bottom" align="start" sideOffset={0} alignOffset={200}>
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
                        "text-center py-2 whitespace-nowrap min-w-[100px]",
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
                    <TooltipContent side="bottom" align="start" sideOffset={0} alignOffset={450}>
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
                        "text-center py-2 whitespace-nowrap min-w-[100px]",
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
                    <TooltipContent side="bottom" align="start" sideOffset={10} alignOffset={3450}>
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
                        "text-center py-2 whitespace-nowrap min-w-[100px]",
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
                <HeaderMultiFilter column={column} label="Delivery" />
            </div>
        ),
        cell: ({ row }) => (
            <div className="w-[80px] text-center text-gray-600 mx-auto">
                {row.getValue("delivery")}
            </div>
        ),
        filterFn: (row, id, value) => {
            if (!value || value.length === 0) return true;
            return value.includes(String(row.getValue(id)));
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => (
            <div className="w-[80px] flex justify-center mx-auto">
                <HeaderMultiFilter
                    column={column}
                    label="Priority"
                    options={[
                        { label: "1", value: "1" },
                        { label: "2", value: "2" },
                        { label: "3", value: "3" },
                        { label: "4", value: "4" },
                        { label: "5", value: "5" },
                    ]}
                />
            </div>
        ),
        cell: ({ row }) => {
            const priority = row.getValue("priority") as number | null;
            if (!priority) return null;
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
            if (!value || value.length === 0) return true;
            return value.includes(String(row.getValue(id)));
        },
    },
    // Temporarily removed actions column
    // {
    //     id: "actions",
    //     cell: ({ row }) => <ActionCell useCase={row.original} navigate={navigate} />,
    // },
]
