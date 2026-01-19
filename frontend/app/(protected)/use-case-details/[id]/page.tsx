'use client';

import { UseCaseDetailsMultiCombobox as MultiCombobox } from "../multi-combobox"

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfidenceCombobox } from "./components/reprioritize/ConfidenceCombobox";
import { DeliveryCombobox } from "./components/reprioritize/DeliveryCombobox";
import { EffortCombobox } from "./components/reprioritize/EffortCombobox";
import { ImpactCombobox } from "./components/reprioritize/ImpactCombobox";
import { ParcsCategorySelect } from "./components/ParcsCategorySelect";
import { UnitOfMeasurementSelect } from "./components/UnitOfMeasurementSelect";
import { PriorityCombobox } from "./components/reprioritize/PriorityCombobox";
import { ReportingFrequencyCombobox } from "./components/reprioritize/ReportingFrequencyCombobox";
import { UserBaseCombobox } from "./components/reprioritize/UserBaseCombobox";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyHeader, EmptyContent } from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bot, Check, ChevronsUpDown } from "lucide-react";
import { useNavigate, useLocation } from '@/lib/router';
import { useMsal } from '@azure/msal-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from '@/components/ui/switch';
import {
    Clock,
    Users,
    Plus,
    MessageSquare,
    CheckCircle2,
    Calendar as CalendarIcon,
    Send,
    MoreHorizontal,
    ChevronDown,
    Edit,
    AlertCircle,
    FileText,
    History,
    Library,
    Wand2,
    Trash2
} from 'lucide-react';
import { useUseCases } from '@/hooks/use-usecases';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { fetchMetrics } from '@/lib/api';
import { getDropdownData } from '@/lib/submit-use-case';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { SectionCards } from "@/features/dashboard/components/SectionCards";
import { Skeleton } from "@/components/ui/skeleton";

const UseCaseDetailsSkeleton = () => (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full">
        {/* KPI Dashboard Skeleton */}
        <div className="w-full">
            <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="shadow-sm border-none ring-1 ring-gray-200">
                        <CardHeader className="relative space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-16" />
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-2 pt-0 pb-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>

        {/* Tabs and Actions Skeleton */}
        <Card className="shadow-sm">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-10 w-[600px] rounded-lg" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-64" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Form Content Skeleton */}
        <Card className="shadow-sm">
            <CardHeader className="border-b">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
);


interface Metric {
    id: number;
    primarySuccessValue: string;
    parcsCategory: string;
    unitOfMeasurement: string;
    baselineValue: string;
    baselineDate: string;
    targetValue: string;
    targetDate: string;
    reportedValue?: string;
    reportedDate?: string;
    isSubmitted?: boolean;
}

const metricColumnSizes = {
    primarySuccessValue: 160,
    parcsCategory: 160,
    unitOfMeasurement: 160,
    baselineValue: 160,
    baselineDate: 160,
    targetValue: 160,
    targetDate: 160,
    reportedValue: 160,
    reportedDate: 160,
    actions: 60,
};

const MetricDatePicker = ({
    value,
    onChange,
    onOpenDialog
}: {
    value: string,
    onChange: (date: string) => void,
    onOpenDialog?: () => void
}) => {
    const [open, setOpen] = useState(false);

    // Parse the date string "YYYY-MM-DD" safely
    const dateValue = useMemo(() => {
        if (!value) return undefined;
        // Append time to avoid timezone issues with plain date strings if parsed directly by Date()
        // Or just use split
        const parts = value.split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return undefined;
    }, [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal h-9 px-2 text-xs",
                        !value && "text-muted-foreground"
                    )}
                    onClick={() => {
                        if (onOpenDialog) {
                            onOpenDialog();
                        } else {
                            setOpen(true);
                        }
                    }}
                >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {dateValue ? format(dateValue, "dd-MM-yyyy") : <span>Pick date</span>}
                </Button>
            </PopoverTrigger>
            {!onOpenDialog && (
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={dateValue}
                        onSelect={(date) => {
                            if (date) {
                                onChange(format(date, "yyyy-MM-dd"));
                                setOpen(false);
                            }
                        }}
                        initialFocus
                    />
                </PopoverContent>
            )}
        </Popover>
    );
};

const UseCaseDetails = () => {
    const { id } = useParams();
    const { useCases, loading } = useUseCases();
    const navigate = useNavigate();
    const { state } = useLocation<{ useCaseTitle: string; sourceScreen?: string }>();
    const { accounts } = useMsal();

    const useCase = useMemo(() => {
        const found = useCases?.find(uc => uc.ID.toString() === id);
        const title = state?.useCaseTitle || found?.Title || found?.UseCase || 'Process Automation with AI';
        return found ? { ...found, Title: title } : {
            ID: id,
            Title: title,
            Phase: 'Idea',
            Status: 'In Progress',
        };
    }, [useCases, id, state]);

    const [selectedStatus, setSelectedStatus] = useState(useCase.Status || 'Active');
    const showChangeStatusCard = false;
    const [startDate, setStartDate] = useState<Date | undefined>(new Date('2024-01-01'));
    const [endDate, setEndDate] = useState<Date | undefined>(new Date('2024-12-31'));
    const [phaseDates, setPhaseDates] = useState({
        idea: { start: new Date('2024-01-01'), end: undefined as Date | undefined },
        diagnose: { start: undefined as Date | undefined, end: undefined as Date | undefined },
        design: { start: undefined as Date | undefined, end: undefined as Date | undefined },
        implemented: { start: undefined as Date | undefined, end: new Date('2024-12-31') }
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [selectedMetricIdForReporting, setSelectedMetricIdForReporting] = useState<string>("");
    const [stakeholderName, setStakeholderName] = useState('');
    const [stakeholderRole, setStakeholderRole] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    const [editingPhase, setEditingPhase] = useState<keyof typeof phaseDates | null>(null);
    const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);
    const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined);
    const [stakeholders, setStakeholders] = useState([
        { name: 'John Doe', role: 'Champion', initial: 'JD' },
        { name: 'Alice Smith', role: 'Expert', initial: 'AS' },
        { name: 'Bob Johnson', role: 'Contributor', initial: 'BJ' },
    ]);
    const [updateText, setUpdateText] = useState('');
    const [knowledgeForce, setKnowledgeForce] = useState('');
    const [instructions, setInstructions] = useState('');
    const [currentStatus, setCurrentStatus] = useState('On-Track');
    const [nextPhase, setNextPhase] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [inputValues, setInputValues] = useState({});
    const [reportedMetrics, setReportedMetrics] = useState<Metric[]>([]);
    const [updates, setUpdates] = useState([
        {
            id: 1,
            author: 'John Doe',
            content: 'Initial requirement gathering completed. Moving to design phase.',
            time: '2 hours ago',
            type: 'status_change',
        },
        {
            id: 2,
            author: 'Alice Smith',
            content: 'Started working on the design document. Expecting to finish by Friday.',
            time: '5 hours ago',
            type: 'comment',
        },
        {
            id: 3,
            author: 'Bob Johnson',
            content: 'Set up the environment and initial project structure.',
            time: 'Yesterday',
            type: 'activity',
        },
    ]);
    const [isMetricDateDialogOpen, setIsMetricDateDialogOpen] = useState(false);
    const [editingMetricId, setEditingMetricId] = useState<number | null>(null);
    const [tempBaselineDate, setTempBaselineDate] = useState<Date | undefined>(undefined);
    const [tempTargetDate, setTempTargetDate] = useState<Date | undefined>(undefined);
    const [metricsSubmitted, setMetricsSubmitted] = useState(false);
    const [isMetricSelectDialogOpen, setIsMetricSelectDialogOpen] = useState(false);

    // Dropdown data state
    const [dropdownData, setDropdownData] = useState(null);

    // Form state for Reprioritize
    const [formData, setFormData] = useState({
        reach: '',
        impact: '',
        confidence: '',
        effort: '',
        riceScore: '10434783',
        priority: '',
        delivery: '',
        totalUserBase: '',
        displayInGallery: true,
        sltReporting: true,
        reportingFrequency: 'Once in two week'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editableTitle, setEditableTitle] = useState(state?.useCaseTitle || useCase.Title);
    const [editableDepartment, setEditableDepartment] = useState('Communications');
    const [editableAITheme, setEditableAITheme] = useState(['Audio Generation', 'Causal Inference / Causal AI', 'Data Extraction']);
    const [editableHeadline, setEditableHeadline] = useState('Streamline multilingual communication through AI-assisted translation.');
    const [editableOpportunity, setEditableOpportunity] = useState('Streamline multilingual communication through AI-assisted translation.');
    const [editableEvidence, setEditableEvidence] = useState('Streamline multilingual communication through AI-assisted translation.');
    const [editableContactPerson, setEditableContactPerson] = useState('Current User');

    // Sync editable title when useCase updates
    useEffect(() => {
        setEditableTitle(useCase.Title);
    }, [useCase.Title]);

    // Set default primary contact person to current user
    useEffect(() => {
        if (accounts && accounts.length > 0) {
            const account = accounts[0];
            const displayName = account.name || account.username || 'Current User';
            setEditableContactPerson(displayName);
        }
    }, [accounts]);

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const data = await getDropdownData();
                setDropdownData(data);
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);

    const handleFormDataChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleToggle = (field: keyof typeof formData) => {
        if (field === 'sltReporting') {
            setFormData(prev => ({
                ...prev,
                sltReporting: !prev.sltReporting,
                // When SLT Reporting is turned off, clear frequency but keep Display in AI Gallery as is
                reportingFrequency: !prev.sltReporting ? prev.reportingFrequency : ''
            }));
        } else {
            // Allow toggling displayInGallery independently
            setFormData(prev => ({
                ...prev,
                [field]: !prev[field]
            }));
        }
    };

    // Approval Screen State & Helpers
    const [decision, setDecision] = useState('');
    const [comments, setComments] = useState('');



    const approvalHistory = [
        {
            phase: 'Diagnose',
            approver: 'Saurabh Yadav - Executive Sponsor',
            status: 'Approved',
            date: 'Oct 03, 2025',
        },
    ];



    const handleApprovalSubmit = () => {
        console.log('Decision:', decision, 'Comments:', comments);
        toast.success('Decision submitted successfully');
    };

    const handleClearDecision = () => {
        setDecision('');
        setComments('');
    };



    const getStatusBadge = (status: string) => {
        if (status === 'Approved') {
            return { bg: '#d4edda', color: '#155724' };
        } else if (status === 'Rejected') {
            return { bg: '#f8d7da', color: '#721c24' };
        }
        return { bg: '#e0e0e0', color: '#666' };
    };

    const handleUpdateStakeholder = () => {
        if (stakeholderName && stakeholderRole) {
            // Generate initials from the name
            const initial = stakeholderName.split(' ').map(n => n[0]).join('').toUpperCase();

            if (editingIndex !== null) {
                // Update existing stakeholder
                setStakeholders(prev => prev.map((stakeholder, idx) =>
                    idx === editingIndex
                        ? { ...stakeholder, name: stakeholderName, role: stakeholderRole, initial: initial }
                        : stakeholder
                ));
                toast.success('Stakeholder updated successfully');
            } else {
                // Add new stakeholder to the list
                setStakeholders(prev => [...prev, {
                    name: stakeholderName,
                    role: stakeholderRole,
                    initial: initial
                }]);
                toast.success('Stakeholder added successfully');
            }

            setIsDialogOpen(false);
            setStakeholderName('');
            setStakeholderRole('');
            setEditingIndex(null);
        }
    };

    const handleEditStakeholder = (index: number) => {
        const stakeholder = stakeholders[index];
        setStakeholderName(stakeholder.name);
        setStakeholderRole(stakeholder.role);
        setEditingIndex(index);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setStakeholderName('');
        setStakeholderRole('');
        setEditingIndex(null);
    };

    const handlePostUpdate = () => {
        if (updateText.trim()) {
            const newUpdate = {
                id: updates.length + 1,
                author: 'Current User', // Placeholder - should come from auth context
                content: updateText,
                time: 'Just now',
                type: 'comment',
            };
            setUpdates(prev => [newUpdate, ...prev]);
            setUpdateText('');
            toast.success('Update posted successfully!');
        }
    };

    const handleSaveAgentLibrary = () => {
        // Here you would typically save the data
        toast.success('Agent library submitted successfully');
    };

    const handleApplyChanges = () => {
        toast.success('Changes Made Successfully');
        navigate('/my-use-cases');
    };

    const handlePhaseDateChange = (phase: keyof typeof phaseDates, field: 'start' | 'end', date: Date | undefined) => {
        setPhaseDates(prev => ({
            ...prev,
            [phase]: {
                ...prev[phase],
                [field]: date
            }
        }));
    };

    const handleOpenDateDialog = (phase: keyof typeof phaseDates) => {
        setEditingPhase(phase);
        setTempStartDate(phaseDates[phase].start);
        setTempEndDate(phaseDates[phase].end);
        setIsDateDialogOpen(true);
    };

    const handleDateDialogClose = () => {
        setIsDateDialogOpen(false);
        setEditingPhase(null);
        setTempStartDate(undefined);
        setTempEndDate(undefined);
    };

    const handleSubmitDates = () => {
        if (editingPhase && tempStartDate && tempEndDate) {
            setPhaseDates(prev => ({
                ...prev,
                [editingPhase]: {
                    start: tempStartDate,
                    end: tempEndDate
                }
            }));
            toast.success('Dates submitted successfully');
            handleDateDialogClose();
        }
    };

    const handleSubmitMetricDates = () => {
        if (editingMetricId !== null && tempBaselineDate && tempTargetDate) {
            handleInputChange(editingMetricId, 'baselineDate', format(tempBaselineDate, "yyyy-MM-dd"));
            handleInputChange(editingMetricId, 'targetDate', format(tempTargetDate, "yyyy-MM-dd"));
            toast.success('Dates Submitted Successfully');
            setIsMetricDateDialogOpen(false);
            setEditingMetricId(null);
            setTempBaselineDate(undefined);
            setTempTargetDate(undefined);
        }
    };

    const handleAddMetric = useCallback(() => {
        const newMetric = {
            id: Date.now(), // Use timestamp for unique ID
            primarySuccessValue: '',
            parcsCategory: '',
            unitOfMeasurement: '',
            baselineValue: '',
            baselineDate: '',
            targetValue: '',
            targetDate: '',
            isSubmitted: false
        };
        setMetrics(prev => [...prev, newMetric]);
    }, []);

    const handleInputChange = useCallback((id: number, field: string, value: string) => {
        // Update local input values for immediate feedback
        const inputKey = `${id}-${field}`;
        setInputValues(prev => ({ ...prev, [inputKey]: value }));

        // Update main metrics state
        setMetrics(prev => prev.map(metric =>
            metric.id === id ? { ...metric, [field]: value } : metric
        ));
    }, []);

    const handleDeleteMetric = useCallback((id: number) => {
        setMetrics(prev => prev.filter(metric => metric.id !== id));
        toast.success('Metric deleted successfully');
    }, []);

    const handleDeleteReportedMetric = useCallback((id: number) => {
        setReportedMetrics(prev => prev.filter(metric => metric.id !== id));
        toast.success('Metric removed from reporting');
    }, []);

    const handleReportedInputChange = useCallback((id: number, field: string, value: string) => {
        // Update reported metrics state
        setReportedMetrics(prev => prev.map(metric =>
            metric.id === id ? { ...metric, [field]: value } : metric
        ));
    }, []);




    const isMetricsFormValid = metrics.length > 0 && metrics.filter(m => !m.isSubmitted).every(metric =>
        metric.primarySuccessValue &&
        metric.parcsCategory &&
        metric.unitOfMeasurement &&
        metric.baselineValue &&
        metric.baselineDate &&
        metric.targetValue &&
        metric.targetDate
    );

    const handleSubmitMetrics = () => {
        const unsubmittedMetrics = metrics.filter(m => !m.isSubmitted);
        if (unsubmittedMetrics.length > 0) {
            // Mark as submitted
            const lockedMetrics = unsubmittedMetrics.map(m => ({ ...m, isSubmitted: true }));

            // Update metrics state (keeping submitted ones as read-only)
            setMetrics(prev => prev.map(m => m.isSubmitted ? m : { ...m, isSubmitted: true }));

            // Add to reported metrics
            setReportedMetrics(prev => [...prev, ...lockedMetrics]);

            toast.success('Metrics saved successfully');
        }
    };





    const handleSaveReportedMetrics = () => {
        toast.success('Reported metrics saved successfully');
    };

    useEffect(() => {
        if (id && typeof id === 'string') {
            fetchMetrics(id)
                .then(setReportedMetrics)
                .catch((error) => {
                    console.error('Error fetching metrics:', error);
                    setReportedMetrics([]);
                });
        } else {
            setReportedMetrics([]);
        }
    }, [id]);

    const reportableMetrics = useMemo(() => {
        const submitted = reportedMetrics.filter((metric) => metric.isSubmitted);
        return submitted.length > 0 ? submitted : reportedMetrics;
    }, [reportedMetrics]);

    const reportedHistoryMetrics = useMemo(
        () => reportedMetrics.filter((metric) => metric.reportedValue || metric.reportedDate),
        [reportedMetrics]
    );

    const selectedMetricForReporting = useMemo(
        () => reportedMetrics.find((metric) => metric.id.toString() === selectedMetricIdForReporting),
        [reportedMetrics, selectedMetricIdForReporting]
    );

    const reportedMetricsForDisplay = useMemo(() => {
        if (!selectedMetricForReporting) {
            return reportedHistoryMetrics;
        }
        const alreadyListed = reportedHistoryMetrics.some(
            (metric) => metric.id === selectedMetricForReporting.id
        );
        return alreadyListed
            ? reportedHistoryMetrics
            : [...reportedHistoryMetrics, selectedMetricForReporting];
    }, [reportedHistoryMetrics, selectedMetricForReporting]);

    const hasReportedMetrics = reportedHistoryMetrics.length > 0;
    const shouldShowReportedTable = Boolean(selectedMetricForReporting) || hasReportedMetrics;

    const reportedColumns = useMemo<ColumnDef<Metric>[]>(() => [
        {
            accessorKey: 'primarySuccessValue',
            header: 'Primary Success Value',
            cell: ({ row }) => <span>{row.original.primarySuccessValue}</span>,
            size: metricColumnSizes.primarySuccessValue,
        },
        {
            accessorKey: 'baselineValue',
            header: 'Baseline Value',
            cell: ({ row }) => <span>{row.original.baselineValue}</span>,
            size: metricColumnSizes.baselineValue,
        },
        {
            accessorKey: 'baselineDate',
            header: 'Baseline Date',
            cell: ({ row }) => <span>{row.original.baselineDate}</span>,
            size: metricColumnSizes.baselineDate,
        },
        {
            accessorKey: 'targetValue',
            header: 'Target Value',
            cell: ({ row }) => <span>{row.original.targetValue}</span>,
            size: metricColumnSizes.targetValue,
        },
        {
            accessorKey: 'targetDate',
            header: 'Target Date',
            cell: ({ row }) => <span>{row.original.targetDate}</span>,
            size: metricColumnSizes.targetDate,
        },
        {
            accessorKey: 'reportedValue',
            header: 'Reported Value',
            cell: ({ row }) => (
                <Input
                    type="number"
                    className="number-input-no-spinner h-9"
                    value={row.original.reportedValue || ''}
                    onChange={(e) => handleReportedInputChange(row.original.id, 'reportedValue', e.target.value)}
                />
            ),
            size: metricColumnSizes.reportedValue,
        },
        {
            accessorKey: 'reportedDate',
            header: 'Reported Date',
            cell: ({ row }) => {
                const [open, setOpen] = useState(false);
                const dateValue = useMemo(() => {
                    if (!row.original.reportedDate) return undefined;
                    const parts = row.original.reportedDate.split('-');
                    if (parts.length === 3) {
                        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    }
                    return undefined;
                }, [row.original.reportedDate]);

                return (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal h-9 px-2 text-xs",
                                    !row.original.reportedDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {dateValue ? format(dateValue, "dd-MM-yyyy") : <span>Pick date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateValue}
                                onSelect={(date) => {
                                    if (date) {
                                        handleReportedInputChange(row.original.id, 'reportedDate', format(date, "yyyy-MM-dd"));
                                        setOpen(false);
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                );
            },
            size: metricColumnSizes.reportedDate,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteReportedMetric(row.original.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
            size: metricColumnSizes.actions,
        },
    ], [handleReportedInputChange, handleDeleteReportedMetric]);

    const addMetricsColumns = useMemo<ColumnDef<Metric>[]>(() => [
        {
            accessorKey: 'primarySuccessValue',
            header: 'Primary Success Value',
            cell: ({ row }) => {
                if (row.original.isSubmitted) return <span className="text-sm px-2 text-nowrap">{row.original.primarySuccessValue}</span>;
                return (
                    <Input
                        type="text"
                        value={row.original.primarySuccessValue}
                        onChange={(e) => handleInputChange(row.original.id, 'primarySuccessValue', e.target.value)}
                        className="h-9"
                    />
                );
            },
            size: metricColumnSizes.primarySuccessValue,
        },
        {
            accessorKey: 'parcsCategory',
            header: 'PARCS Category',
            cell: ({ row }) => row.original.isSubmitted ? (
                <span className="text-sm px-2">{row.original.parcsCategory}</span>
            ) : (
                <ParcsCategorySelect
                    value={row.original.parcsCategory}
                    onSelect={(val) => handleInputChange(row.original.id, 'parcsCategory', val)}
                    className="metric-select"
                />
            ),
            size: metricColumnSizes.parcsCategory,
        },
        {
            accessorKey: 'unitOfMeasurement',
            header: 'Unit of Measurement',
            cell: ({ row }) => row.original.isSubmitted ? (
                <span className="text-sm px-2">{row.original.unitOfMeasurement}</span>
            ) : (
                <UnitOfMeasurementSelect
                    value={row.original.unitOfMeasurement}
                    onSelect={(val) => handleInputChange(row.original.id, 'unitOfMeasurement', val)}
                    className="metric-select"
                />
            ),
            size: metricColumnSizes.unitOfMeasurement,
        },
        {
            accessorKey: 'baselineValue',
            header: 'Baseline Value',
            cell: ({ row }) => {
                if (row.original.isSubmitted) return <span className="text-sm px-2">{row.original.baselineValue}</span>;
                return (
                    <Input
                        type="number"
                        className="number-input-no-spinner h-9"
                        value={row.original.baselineValue}
                        onChange={(e) => handleInputChange(row.original.id, 'baselineValue', e.target.value)}
                    />
                );
            },
            size: metricColumnSizes.baselineValue,
        },
        {
            accessorKey: 'baselineDate',
            header: 'Baseline Date',
            cell: ({ row }) => row.original.isSubmitted ? (
                <span className="text-sm px-2 text-nowrap">{row.original.baselineDate}</span>
            ) : (
                <MetricDatePicker
                    value={row.original.baselineDate}
                    onChange={(date) => handleInputChange(row.original.id, 'baselineDate', date)}
                    onOpenDialog={() => {
                        setEditingMetricId(row.original.id);
                        setTempBaselineDate(row.original.baselineDate ? new Date(row.original.baselineDate + 'T00:00:00') : undefined);
                        setTempTargetDate(row.original.targetDate ? new Date(row.original.targetDate + 'T00:00:00') : undefined);
                        setIsMetricDateDialogOpen(true);
                    }}
                />
            ),
            size: metricColumnSizes.baselineDate,
        },
        {
            accessorKey: 'targetValue',
            header: 'Target Value',
            cell: ({ row }) => {
                if (row.original.isSubmitted) return <span className="text-sm px-2">{row.original.targetValue}</span>;
                return (
                    <Input
                        type="number"
                        className="number-input-no-spinner h-9"
                        value={row.original.targetValue}
                        onChange={(e) => handleInputChange(row.original.id, 'targetValue', e.target.value)}
                    />
                );
            },
            size: metricColumnSizes.targetValue,
        },
        {
            accessorKey: 'targetDate',
            header: 'Target Date',
            cell: ({ row }) => row.original.isSubmitted ? (
                <span className="text-sm px-2 text-nowrap">{row.original.targetDate}</span>
            ) : (
                <MetricDatePicker
                    value={row.original.targetDate}
                    onChange={(date) => handleInputChange(row.original.id, 'targetDate', date)}
                    onOpenDialog={() => {
                        setEditingMetricId(row.original.id);
                        setTempBaselineDate(row.original.baselineDate ? new Date(row.original.baselineDate + 'T00:00:00') : undefined);
                        setTempTargetDate(row.original.targetDate ? new Date(row.original.targetDate + 'T00:00:00') : undefined);
                        setIsMetricDateDialogOpen(true);
                    }}
                />
            ),
            size: metricColumnSizes.targetDate,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteMetric(row.original.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
            size: metricColumnSizes.actions,
        },
    ], [handleInputChange, handleDeleteMetric]);

    const reportedTable = useReactTable({
        data: reportedMetricsForDisplay,
        columns: reportedColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const addMetricsTable = useReactTable({
        data: metrics,
        columns: addMetricsColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const timeline = [
        { label: 'Start Date', date: '2024-01-01', status: 'completed' },
        { label: 'End Date', date: '2024-12-31', status: 'pending' },
    ];

    if (loading) {
        return <UseCaseDetailsSkeleton />;
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Tabs and Apply Changes Button on same line */}
                <div className="sticky top-14 z-[50] bg-gray-50 -mx-6 px-6 pb-4 border-b border-gray-100 mb-6">
                    <div className="w-[95%] mx-auto flex items-center justify-between">
                        <TabsList className="grid w-full grid-cols-5 max-w-[650px] h-10 bg-gray-100/50 p-1 border rounded-lg">
                            <TabsTrigger
                                value="info"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                            >
                                Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="update"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                            >
                                Update
                            </TabsTrigger>
                            {state?.sourceScreen === 'champion' ? (
                                <TabsTrigger
                                    value="reprioritize"
                                    className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                >
                                    Reprioritize
                                </TabsTrigger>
                            ) : (
                                <TabsTrigger
                                    value="agent-library"
                                    className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                >
                                    Agent Library
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="metrics"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                            >
                                Metrics
                            </TabsTrigger>
                            <TabsTrigger
                                value="status"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                            >
                                {state?.sourceScreen === 'champion' ? 'Approvals' : 'Actions'}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            {activeTab === 'info' && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg px-4 py-1.5 h-auto text-sm font-medium"
                                >
                                    {isEditing ? 'Save' : 'Edit'}
                                </Button>
                            )}
                            {activeTab !== 'metrics' && (
                                <Button
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-1.5 h-auto text-sm font-medium"
                                    onClick={handleApplyChanges}
                                >
                                    Apply Changes
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <TabsContent value="info" className="space-y-6">
                    <div className="w-[95%] mx-auto">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
                            <div className="flex-1 max-w-xl">
                                <Input
                                    value={editableTitle}
                                    onChange={(e) => setEditableTitle(e.target.value)}
                                    readOnly={!isEditing}
                                    className={cn(
                                        "text-3xl font-bold text-gray-900 tracking-tight h-auto py-1 p-0 border-none shadow-none focus-visible:ring-0 bg-transparent mb-1",
                                        isEditing && "border-solid border border-gray-200 bg-white px-3 py-2 shadow-sm focus-visible:ring-1"
                                    )}
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-gray-600">
                                        ID: {id}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Gallery Detail Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(80vh-150px)]">
                            {/* Left Column: Sidebar Card */}
                            <div className="lg:col-span-1">
                                <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col" style={{ backgroundColor: '#c7e7e7' }}>
                                    <CardContent className="p-8 flex-1">
                                        <div className="space-y-6 h-full">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Use Case:</h3>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Input
                                                        value={editableTitle}
                                                        onChange={(e) => setEditableTitle(e.target.value)}
                                                        readOnly={!isEditing}
                                                        className={cn(
                                                            "text-[#13352C] font-medium bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto",
                                                            isEditing && "bg-white/50 border-white/20 px-2 py-1 shadow-sm focus-visible:ring-1"
                                                        )}
                                                    />
                                                    <Badge variant="secondary" className="bg-white/80 text-[#13352C] border-none shadow-sm hover:bg-white font-semibold flex-shrink-0">
                                                        {useCase.Phase}
                                                    </Badge>
                                                    <Badge variant="outline" className="bg-[#13352C] text-white border-none shadow-md px-3 py-1 font-medium flex-shrink-0">
                                                        Poppulo AI
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Department:</h3>
                                                <Input
                                                    value={editableDepartment}
                                                    onChange={(e) => setEditableDepartment(e.target.value)}
                                                    readOnly={!isEditing}
                                                    className={cn(
                                                        "text-[#13352C] font-medium bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto",
                                                        isEditing && "bg-white/50 border-white/20 px-2 py-1 shadow-sm focus-visible:ring-1"
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">AI Theme:</h3>
                                                {isEditing ? (
                                                    <MultiCombobox
                                                        value={editableAITheme}
                                                        onChange={setEditableAITheme}
                                                        options={(dropdownData as any)?.ai_themes || []}
                                                        placeholder="Select AI Themes"
                                                        searchPlaceholder="Search themes..."
                                                        className={cn(
                                                            "bg-white/50 border-white/20 px-2 py-1 shadow-sm focus-visible:ring-1"
                                                        )}
                                                    />
                                                ) : (
                                                    <div className="text-[#13352C] font-medium text-base">
                                                        {editableAITheme.join(', ') || 'No AI themes selected'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Main Content Card */}
                            <div className="lg:col-span-1">
                                <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col">
                                    <CardContent className="pt-6 flex-1">
                                        <div className="space-y-8 h-full">
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Headline - One line Executive Headline</CardTitle>
                                                <Textarea
                                                    value={editableHeadline}
                                                    onChange={(e) => setEditableHeadline(e.target.value)}
                                                    readOnly={!isEditing}
                                                    className={cn(
                                                        "text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden",
                                                        isEditing && "bg-gray-50 border-gray-200 px-3 py-2 shadow-sm focus-visible:ring-1 min-h-[60px] resize-y"
                                                    )}
                                                    ref={(el) => {
                                                        if (el && !isEditing) {
                                                            el.style.height = 'auto';
                                                            el.style.height = el.scrollHeight + 'px';
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Opportunity - What is the idea for which AI is being used?</CardTitle>
                                                <Textarea
                                                    value={editableOpportunity}
                                                    onChange={(e) => setEditableOpportunity(e.target.value)}
                                                    readOnly={!isEditing}
                                                    className={cn(
                                                        "text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden",
                                                        isEditing && "bg-gray-50 border-gray-200 px-3 py-2 shadow-sm focus-visible:ring-1 min-h-[60px] resize-y"
                                                    )}
                                                    ref={(el) => {
                                                        if (el && !isEditing) {
                                                            el.style.height = 'auto';
                                                            el.style.height = el.scrollHeight + 'px';
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Evidence - Why it is needed?</CardTitle>
                                                <Textarea
                                                    value={editableEvidence}
                                                    onChange={(e) => setEditableEvidence(e.target.value)}
                                                    readOnly={!isEditing}
                                                    className={cn(
                                                        "text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden",
                                                        isEditing && "bg-gray-50 border-gray-200 px-3 py-2 shadow-sm focus-visible:ring-1 min-h-[60px] resize-y"
                                                    )}
                                                    ref={(el) => {
                                                        if (el && !isEditing) {
                                                            el.style.height = 'auto';
                                                            el.style.height = el.scrollHeight + 'px';
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Primary Contact Person</CardTitle>
                                                <Textarea
                                                    value={editableContactPerson}
                                                    onChange={(e) => setEditableContactPerson(e.target.value)}
                                                    readOnly={!isEditing}
                                                    className={cn(
                                                        "text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden",
                                                        isEditing && "bg-gray-50 border-gray-200 px-3 py-2 shadow-sm focus-visible:ring-1 min-h-[60px] resize-y"
                                                    )}
                                                    ref={(el) => {
                                                        if (el && !isEditing) {
                                                            el.style.height = 'auto';
                                                            el.style.height = el.scrollHeight + 'px';
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="update" className="space-y-6">
                    <div className="w-[95%] mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-6 items-start lg:items-stretch mx-auto">
                            {/* Left Column: Change Status, Timeline, Stakeholders */}
                            <div className="space-y-6 lg:self-stretch lg:flex lg:flex-col lg:gap-6 lg:space-y-0">
                                {/* Change Status Card */}
                                {showChangeStatusCard && (
                                    <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 flex flex-col min-h-[176px]">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                Change Status
                                                <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200">
                                                    {useCase.Phase}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col justify-center">
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                <span className="font-medium text-gray-900">{selectedStatus}</span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                                                            <ChevronDown className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => setSelectedStatus('On-Track')}>On-Track</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setSelectedStatus('At Risk')}>At Risk</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setSelectedStatus('Completed')}>Completed</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setSelectedStatus('Help Needed')}>Help Needed</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setSelectedStatus('No Updates')}>No Updates</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setSelectedStatus('Not Started')}>Not Started</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setSelectedStatus('Parked')}>Parked</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setSelectedStatus('Rejected')}>Rejected</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Timeline Card */}
                                <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-teal-600" />
                                            Timeline
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 py-4">
                                        <div className="space-y-4">
                                            {/* Idea Phase */}
                                            <div className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                                <div className="font-medium text-gray-900 text-sm">Idea</div>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 justify-start text-left font-normal text-sm"
                                                    onClick={() => handleOpenDateDialog('idea')}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {phaseDates.idea.start ? format(phaseDates.idea.start, "dd-MM-yyyy") : "Pick start date"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 justify-start text-left font-normal text-sm"
                                                    onClick={() => handleOpenDateDialog('idea')}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {phaseDates.idea.end ? format(phaseDates.idea.end, "dd-MM-yyyy") : "Pick end date"}
                                                </Button>
                                            </div>

                                            {/* Diagnose Phase */}
                                            <div className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                                <div className="font-medium text-gray-900 text-sm">Diagnose</div>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 justify-start text-left font-normal text-sm"
                                                    onClick={() => handleOpenDateDialog('diagnose')}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {phaseDates.diagnose.start ? format(phaseDates.diagnose.start, "dd-MM-yyyy") : "Pick start date"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 justify-start text-left font-normal text-sm"
                                                    onClick={() => handleOpenDateDialog('diagnose')}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {phaseDates.diagnose.end ? format(phaseDates.diagnose.end, "dd-MM-yyyy") : "Pick end date"}
                                                </Button>
                                            </div>

                                            {/* Design Phase */}
                                            <div className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                                <div className="font-medium text-gray-900 text-sm">Design</div>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 justify-start text-left font-normal text-sm"
                                                    onClick={() => handleOpenDateDialog('design')}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {phaseDates.design.start ? format(phaseDates.design.start, "dd-MM-yyyy") : "Pick start date"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 justify-start text-left font-normal text-sm"
                                                    onClick={() => handleOpenDateDialog('design')}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {phaseDates.design.end ? format(phaseDates.design.end, "dd-MM-yyyy") : "Pick end date"}
                                                </Button>
                                            </div>

                                            {/* Implemented Phase */}
                                            <div className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                                <div className="font-medium text-gray-900 text-sm">Implemented</div>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 justify-start text-left font-normal text-sm"
                                                    onClick={() => handleOpenDateDialog('implemented')}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {phaseDates.implemented.start ? format(phaseDates.implemented.start, "dd-MM-yyyy") : "Pick start date"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 justify-start text-left font-normal text-sm"
                                                    onClick={() => handleOpenDateDialog('implemented')}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {phaseDates.implemented.end ? format(phaseDates.implemented.end, "dd-MM-yyyy") : "Pick end date"}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Stakeholders Card */}
                                <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                        <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                            <Users className="w-4 h-4 text-teal-600" />
                                            Stakeholders
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-teal-600 hover:bg-teal-50"
                                            onClick={() => setIsDialogOpen(true)}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <ScrollArea className="h-48">
                                            <div className="space-y-2 pr-3">
                                                {stakeholders.map((person, index) => {
                                                    return (
                                                        <div key={index} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-gray-50/70 transition-colors group">
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                <Avatar className="h-7 w-7 border-none ring-1 ring-gray-100 shadow-sm">
                                                                    <AvatarFallback className="bg-[#E5FF1F] text-gray-900 text-[10px] font-bold">
                                                                        {person.initial}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-900 leading-none truncate">{person.name}</p>
                                                                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{person.role}</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 mr-1 text-gray-400 hover:text-teal-600 hover:bg-teal-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleEditStakeholder(index)}
                                                            >
                                                                <Edit className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>


                            </div>

                            {/* Right Column: Post Update, Recent Updates */}
                            <div className="space-y-6 lg:self-stretch lg:flex lg:flex-col lg:gap-6 lg:space-y-0">
                                {/* Post Update Card */}
                                <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Post your update
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="relative">
                                            <Textarea
                                                placeholder="What's the latest on this use case?"
                                                value={updateText}
                                                onChange={(e) => setUpdateText(e.target.value)}
                                                className="min-h-[100px] bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                                            />
                                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-4"
                                                    onClick={handlePostUpdate}
                                                    disabled={!updateText.trim()}
                                                >
                                                    Update
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Updates Feed */}
                                <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 flex flex-col lg:flex-1 lg:min-h-0">
                                    <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
                                        <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-teal-600" />
                                            Recent Updates
                                        </CardTitle>
                                        <Badge variant="outline" className="text-[10px] font-bold text-gray-400 border-gray-200">
                                            {updates.length} TOTAL
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-1 overflow-hidden lg:min-h-0">
                                        <ScrollArea className="h-48 lg:h-full">
                                            <div className="divide-y divide-gray-100">
                                                {updates.map((update) => (
                                                    <div key={update.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                                        <div className="flex gap-4">
                                                            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white shadow-sm">
                                                                <AvatarFallback className="bg-[#E5FF1F] text-gray-900 font-bold">
                                                                    {update.author.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-sm font-bold text-gray-900">{update.author}</p>
                                                                        {stakeholders.find(s => s.name === update.author)?.role && (
                                                                            <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">
                                                                                {stakeholders.find(s => s.name === update.author)?.role}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs text-gray-400">{update.time}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                                    {update.content}
                                                                </p>
                                                                {update.type === 'status_change' && (
                                                                    <div className="mt-3 flex items-center gap-2">
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                                                                        <span className="text-[11px] font-bold text-teal-700 uppercase tracking-tight">Phase Updated</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="reprioritize" className="space-y-3">
                    <div className="flex justify-center w-full">
                        <div className="flex flex-1 flex-col gap-6 mx-auto max-w-7xl w-full px-4">
                            <Card className="shadow-sm">
                                <CardHeader className="border-b">
                                    <CardTitle>Impact Metrics</CardTitle>
                                    <CardDescription>Measure the potential reach and impact of this use case</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Reach</Label>
                                            <Input
                                                type="text"
                                                value={formData.reach}
                                                onChange={(e) => handleFormDataChange('reach', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Impact</Label>
                                            <ImpactCombobox
                                                value={formData.impact}
                                                onChange={(value) => handleFormDataChange('impact', value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Confidence</Label>
                                            <ConfidenceCombobox
                                                value={formData.confidence}
                                                onChange={(value) => handleFormDataChange('confidence', value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Effort</Label>
                                            <EffortCombobox
                                                value={formData.effort}
                                                onChange={(value) => handleFormDataChange('effort', value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="border-b">
                                    <CardTitle>Priority & Scoring</CardTitle>
                                    <CardDescription>Define prioritization and scoring metrics</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>RICE Score</Label>
                                            <Input
                                                type="text"
                                                value={formData.riceScore}
                                                onChange={(e) => handleFormDataChange('riceScore', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Priority</Label>
                                            <PriorityCombobox
                                                value={formData.priority}
                                                onChange={(value) => handleFormDataChange('priority', value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Delivery</Label>
                                            <DeliveryCombobox
                                                value={formData.delivery}
                                                onChange={(value) => handleFormDataChange('delivery', value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Total User Base</Label>
                                            <UserBaseCombobox
                                                value={formData.totalUserBase}
                                                onChange={(value) => handleFormDataChange('totalUserBase', value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="border-b">
                                    <CardTitle>Reporting Configuration</CardTitle>
                                    <CardDescription>Configure how this use case is reported</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium text-gray-900">
                                                Display in AI Gallery
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Show this use case publicly in the gallery
                                            </div>
                                        </div>
                                        <Switch
                                            checked={formData.displayInGallery}
                                            onCheckedChange={() => handleToggle('displayInGallery')}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-6">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium text-gray-900">
                                                SLT Reporting
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Include in senior leadership reports
                                            </div>
                                        </div>
                                        <Switch
                                            checked={formData.sltReporting}
                                            onCheckedChange={() => handleToggle('sltReporting')}
                                        />
                                    </div>

                                    <div className={cn("flex items-center justify-between border-t pt-6 flex-wrap gap-4", !formData.sltReporting && "opacity-50")}>
                                        <div className="space-y-0.5 flex-1 min-w-[200px]">
                                            <div className={cn("text-sm font-medium", formData.sltReporting ? "text-gray-900" : "text-gray-400")}>
                                                Reporting Frequency
                                            </div>
                                            <div className={cn("text-sm", formData.sltReporting ? "text-gray-500" : "text-gray-400")}>
                                                How often this use case is reported
                                            </div>
                                        </div>
                                        <ReportingFrequencyCombobox
                                            value={formData.reportingFrequency}
                                            onChange={(value) => handleFormDataChange('reportingFrequency', value)}
                                            disabled={!formData.sltReporting}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="agent-library" className="space-y-3">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Knowledge Source Selection */}
                        <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
                            <CardHeader className="pb-3 border-b border-gray-100">
                                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    SELECT KNOWLEDGE SOURCE
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase">Knowledge Source</Label>
                                    <Select value={knowledgeForce} onValueChange={setKnowledgeForce}>
                                        <SelectTrigger className="h-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                                            <SelectValue placeholder="Select Knowledge Source" />
                                        </SelectTrigger>
                                        <SelectContent position="item-aligned" className="w-60 -translate-x-0.5">
                                            <SelectItem value="Sharepoint">Sharepoint</SelectItem>
                                            <SelectItem value="OneDrive">OneDrive</SelectItem>
                                            <SelectItem value="ServiceNow">ServiceNow</SelectItem>
                                            <SelectItem value="Salesforce">Salesforce</SelectItem>
                                            <SelectItem value="Public Websites">Public Websites</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Instructions Section */}
                        <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
                            <CardHeader className="pb-3 border-b border-gray-100">
                                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    ADD INSTRUCTIONS / PROMPT
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold text-gray-500 uppercase">Agent Instructions / Prompt</Label>
                                    <Textarea
                                        placeholder="Enter agent instructions or prompt..."
                                        rows={8}
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        className="min-h-[200px] bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-6">
                    <div className="w-[95%] mx-auto">

                        <div className="mb-8 p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add Metrics</h3>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddMetric}
                                        className="text-teal-600 border-teal-600 hover:bg-teal-50 h-8"
                                    >
                                        <Plus size={14} className="mr-1" />
                                        Add New Metric
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSubmitMetrics}
                                        className="bg-teal-600 hover:bg-teal-700 text-white h-8"
                                        disabled={!isMetricsFormValid}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>

                            {metrics.length > 0 ? (
                                <div className="rounded-md border">
                                    <ScrollArea className="h-[250px]">
                                        <Table className="table-fixed">
                                            <TableHeader>
                                                {addMetricsTable.getHeaderGroups().map((headerGroup) => (
                                                    <TableRow key={headerGroup.id}>
                                                        {headerGroup.headers.map((header) => (
                                                            <TableHead key={header.id} style={{ width: header.getSize() }}>
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )}
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableHeader>
                                            <TableBody>
                                                {addMetricsTable.getRowModel().rows?.length ? (
                                                    addMetricsTable.getRowModel().rows.map((row) => (
                                                        <TableRow
                                                            key={row.id}
                                                            data-state={row.getIsSelected() && "selected"}
                                                        >
                                                            {row.getVisibleCells().map((cell) => (
                                                                <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))
                                                ) : null}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>
                            ) : (
                                <Empty className="border border-dashed border-gray-200 bg-white/70">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Plus className="size-5 text-gray-600" />
                                        </EmptyMedia>
                                        <EmptyTitle>No metrics added yet</EmptyTitle>
                                        <EmptyDescription>
                                            Start by adding a new metric to track your progress.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <Button onClick={handleAddMetric}>
                                            Add New Metric
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            )}
                        </div>

                        {/* Reported Metrics Section */}
                        <div className="p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Reported Metrics</h3>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsMetricSelectDialogOpen(true)}
                                        className="text-teal-600 border-teal-600 hover:bg-teal-50 h-8"
                                    >
                                        Report Metric
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveReportedMetrics}
                                        className="bg-teal-600 hover:bg-teal-700 text-white h-8"
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                {shouldShowReportedTable ? (
                                    <div className="rounded-md border">
                                        <ScrollArea className="h-[250px]">
                                            <Table className="table-fixed">
                                                <TableHeader>
                                                    {reportedTable.getHeaderGroups().map((headerGroup) => (
                                                        <TableRow key={headerGroup.id}>
                                                            {headerGroup.headers.map((header) => (
                                                                <TableHead key={header.id} style={{ width: header.getSize() }}>
                                                                    {header.isPlaceholder
                                                                        ? null
                                                                        : flexRender(
                                                                            header.column.columnDef.header,
                                                                            header.getContext()
                                                                        )}
                                                                </TableHead>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableHeader>
                                                <TableBody>
                                                    {reportedTable.getRowModel().rows.map((row) => (
                                                        <TableRow key={row.id}>
                                                            {row.getVisibleCells().map((cell) => (
                                                                <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </div>
                                ) : (
                                    <Empty className="border border-dashed border-gray-200 bg-white/70">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <History className="size-5 text-gray-600" />
                                            </EmptyMedia>
                                            <EmptyTitle>No reporting active</EmptyTitle>
                                            <EmptyDescription>
                                                Select a metric from the dropdown above and click 'Report Metric' to start.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="status" className="space-y-8">
                    <div className="w-[95%] mx-auto space-y-8">
                        {state?.sourceScreen === 'champion' ? (
                            <>
                                {/* Top Section - 3 Cards */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Use Case Details */}
                                    <Card className="h-full">
                                        <CardHeader className="pb-3 border-b border-gray-100">
                                            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-teal-600" />
                                                USE CASE DETAILS
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-6">
                                                <div>
                                                    <div className="text-sm text-gray-600 mb-1">Use Case Title</div>
                                                    <div className="text-base font-semibold text-gray-900">{useCase.Title}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600 mb-1">Submitted By</div>
                                                    <div className="text-base font-medium text-gray-900">Achman Saxena</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600 mb-1">Status</div>
                                                    <div className="text-base font-medium text-gray-900">{useCase.Status}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-600 mb-1">Business Unit</div>
                                                    <div className="text-base font-medium text-gray-900">Demo Channel</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>



                                    {/* Approval History */}
                                    <Card className="h-full">
                                        <CardHeader className="pb-3 border-b border-gray-100">
                                            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                                <History className="w-4 h-4 text-teal-600" />
                                                APPROVAL HISTORY
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-6">
                                                {approvalHistory.map((item, index) => {
                                                    const badgeStyle = getStatusBadge(item.status);
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`pb-4 ${index < approvalHistory.length - 1 ? 'border-b border-gray-200' : ''}`}
                                                        >
                                                            <div className="mb-4">
                                                                <div className="text-sm text-gray-600 mb-1">Phase</div>
                                                                <div className="text-base font-semibold text-gray-900">{item.phase}</div>
                                                            </div>
                                                            <div className="mb-4">
                                                                <div className="text-sm text-gray-600 mb-1">Status</div>
                                                                <span className="text-sm px-3 py-1 rounded-full font-semibold"
                                                                    style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}>
                                                                    {item.status}
                                                                </span>
                                                            </div>
                                                            <div className="mb-4">
                                                                <div className="text-sm text-gray-600 mb-1">Approver</div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-base font-medium text-gray-900">{item.approver}</span>
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="bg-[#13352C] text-white text-xs">
                                                                            {item.approver.split(' ').map(name => name.charAt(0)).join('').slice(0, 2).toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm text-gray-600 mb-1">Date</div>
                                                                <div className="text-base font-medium text-gray-900">{item.date}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Your Decision Section */}
                                <Card className="mb-8">
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-teal-600" />
                                            YOUR DECISION ON DESIGN PHASE
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-8 mb-6">
                                            <div className="w-full md:w-1/4">
                                                <Label htmlFor="decision">Your Decision</Label>
                                                <Select value={decision} onValueChange={setDecision}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Decision" />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" side="bottom" align="start" sideOffset={120} alignOffset={80} className="w-[180px]">
                                                        <SelectItem value="Approve">Approve</SelectItem>
                                                        <SelectItem value="Reject">Reject</SelectItem>
                                                        <SelectItem value="Request Clarification">Request Clarification</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex-1">
                                                <Label htmlFor="comments">Comments</Label>
                                                <Textarea
                                                    id="comments"
                                                    rows={6}
                                                    placeholder="Add your comments here..."
                                                    value={comments}
                                                    onChange={(e) => setComments(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 justify-end mt-4">
                                            <Button variant="outline" onClick={handleClearDecision}>
                                                Clear
                                            </Button>
                                            <Button
                                                onClick={handleApprovalSubmit}
                                                disabled={!comments.trim()}
                                                className="bg-[#13352C] hover:bg-[#0f2a23] text-white"
                                            >
                                                Submit
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : null}

                        {state?.sourceScreen !== 'champion' && (
                            /* Original Status Content for My Use Cases */
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Current Phase & Status */}
                                <Card className="lg:col-span-1">
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            CURRENT PHASE & STATUS
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium">Current Phase</Label>
                                                <div className="text-xl font-semibold text-primary mt-1">{useCase.Phase}</div>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium">Current Status</Label>
                                                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" side="bottom" align="start" sideOffset={70} alignOffset={70} className="w-[200px]">
                                                        <SelectItem value="On-Track">On-Track</SelectItem>
                                                        <SelectItem value="At Risk">At Risk</SelectItem>
                                                        <SelectItem value="Completed">Completed</SelectItem>
                                                        <SelectItem value="Help Needed">Help Needed</SelectItem>
                                                        <SelectItem value="No Updates">No Updates</SelectItem>
                                                        <SelectItem value="Not Started">Not Started</SelectItem>
                                                        <SelectItem value="Parked">Parked</SelectItem>
                                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button onClick={() => toast.success('Status updated successfully')} className="w-full">
                                            Update Status
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Completion Summary */}
                                <Card className="lg:col-span-1">
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            COMPLETION SUMMARY
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-6">
                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                            <span className="font-medium text-sm">Idea</span>
                                            <Badge variant="default" className="text-xs">
                                                Completed
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                            <span className="font-medium text-sm">Diagnose</span>
                                            <Badge variant="secondary" className="text-xs">
                                                Not Started
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                            <span className="font-medium text-sm">Design</span>
                                            <Badge variant="secondary" className="text-xs">
                                                Not Started
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                            <span className="font-medium text-sm">Implement</span>
                                            <Badge variant="secondary" className="text-xs">
                                                Not Started
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Approval History */}
                                <Card className="lg:col-span-1">
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            APPROVAL HISTORY
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="max-h-80 overflow-y-auto pt-6">
                                        <div className="space-y-4">
                                            <div className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-sm">Idea</span>
                                                    <Badge variant="default" className="text-xs">
                                                        Approved
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                    <span>10/25/2025</span>
                                                    <span>System</span>
                                                </div>
                                            </div>
                                            <div className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-sm">Diagnose</span>
                                                    <Badge variant="destructive" className="text-xs">
                                                        Rejected
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                    <span>11/02/2025</span>
                                                    <span>Jane Doe</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded">
                                                    "More details needed on ROI."
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Request Approval Section - Only for My Use Cases, or if we want it for both but likely just my use cases as per request to keep it */}
                        {state?.sourceScreen !== 'champion' && (
                            <Card>
                                <CardHeader className="pb-3 border-b border-gray-100">
                                    <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        REQUEST APPROVAL FOR NEXT PHASE
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium">Request Approval For</Label>
                                                <Select value={nextPhase} onValueChange={setNextPhase}>
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue placeholder="Select Next Phase" />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" side="bottom" align="start" sideOffset={120} alignOffset={70} className="w-[200px]">
                                                        <SelectItem value="Diagnose">Diagnose</SelectItem>
                                                        <SelectItem value="Design">Design</SelectItem>
                                                        <SelectItem value="Implement">Implement</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm">
                                                    Action blocked — phase must be Completed or Not Started, select 'Request Approval for Next Phase'.
                                                </AlertDescription>
                                            </Alert>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Notes and Justification</Label>
                                            <Textarea
                                                rows={6}
                                                placeholder="Describe the work completed and why you're ready to advance to the next phase..."
                                                value={statusNotes}
                                                onChange={(e) => setStatusNotes(e.target.value)}
                                                className="resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                        <Button variant="outline" onClick={() => { setNextPhase(''); setStatusNotes(''); }} className="sm:w-auto">
                                            Clear Form
                                        </Button>
                                        <Button onClick={() => toast.success('Approval request sent successfully')} className="sm:w-auto">
                                            Send Request
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Date Selection Dialog */}
            <Dialog open={isDateDialogOpen} onOpenChange={handleDateDialogClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Select Dates for {editingPhase?.charAt(0).toUpperCase()}{editingPhase?.slice(1)} Phase</DialogTitle>
                        <DialogDescription>
                            Please select both start and end dates for this phase.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Start Date</Label>
                            <Calendar
                                mode="single"
                                selected={tempStartDate}
                                onSelect={setTempStartDate}
                                className="rounded-md border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">End Date</Label>
                            <Calendar
                                mode="single"
                                selected={tempEndDate}
                                onSelect={setTempEndDate}
                                className="rounded-md border"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDateDialogClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitDates}
                            disabled={!tempStartDate || !tempEndDate}
                        >
                            Submit Dates
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Metric Date Selection Dialog */}
            <Dialog open={isMetricDateDialogOpen} onOpenChange={() => setIsMetricDateDialogOpen(false)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Select Baseline and Target Dates</DialogTitle>
                        <DialogDescription>
                            Please select both baseline and target dates for this metric.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Baseline Date</Label>
                            <Calendar
                                mode="single"
                                selected={tempBaselineDate}
                                onSelect={setTempBaselineDate}
                                className="rounded-md border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Target Date</Label>
                            <Calendar
                                mode="single"
                                selected={tempTargetDate}
                                onSelect={setTempTargetDate}
                                className="rounded-md border"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMetricDateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitMetricDates}
                            disabled={!tempBaselineDate || !tempTargetDate}
                        >
                            Submit Dates
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Metric Selection Dialog */}
            <Dialog open={isMetricSelectDialogOpen} onOpenChange={setIsMetricSelectDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Select Metric for Reporting</DialogTitle>
                        <DialogDescription>
                            Choose a submitted metric to report on from the available options.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {reportableMetrics.length >= 3 ? (
                            <ScrollArea className="h-64">
                                <div className="space-y-2 pr-4">
                                    {reportableMetrics.map((metric) => (
                                        <Button
                                            key={metric.id}
                                            variant="outline"
                                            className="w-full justify-start h-auto p-3 text-left hover:bg-transparent hover:text-foreground"
                                            onClick={() => {
                                                setSelectedMetricIdForReporting(metric.id.toString());
                                                setIsMetricSelectDialogOpen(false);
                                            }}
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">{metric.primarySuccessValue}</span>
                                                {metric.parcsCategory && (
                                                    <span className="text-sm text-muted-foreground">{metric.parcsCategory}</span>
                                                )}
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="space-y-2">
                                {reportableMetrics.map((metric) => (
                                    <Button
                                        key={metric.id}
                                        variant="outline"
                                        className="w-full justify-start h-auto p-3 text-left hover:bg-transparent hover:text-foreground"
                                        onClick={() => {
                                            setSelectedMetricIdForReporting(metric.id.toString());
                                            setIsMetricSelectDialogOpen(false);
                                        }}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium">{metric.primarySuccessValue}</span>
                                            {metric.parcsCategory && (
                                                <span className="text-sm text-muted-foreground">{metric.parcsCategory}</span>
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMetricSelectDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Stakeholders Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingIndex !== null ? 'Edit Stakeholder' : 'Add Stakeholder'}</DialogTitle>
                        <DialogDescription>
                            {editingIndex !== null ? 'Update the stakeholder information.' : 'Add a new stakeholder to this use case.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-sm font-medium">
                                Name
                            </label>
                            <Input
                                id="name"
                                value={stakeholderName}
                                onChange={(e) => setStakeholderName(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter stakeholder name"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="role" className="text-right text-sm font-medium">
                                Role
                            </label>
                            <Select value={stakeholderRole} onValueChange={setStakeholderRole}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                                    <SelectItem value="Program Manager">Program Manager</SelectItem>
                                    <SelectItem value="Team Member">Team Member</SelectItem>
                                    <SelectItem value="Champion">Champion</SelectItem>
                                    <SelectItem value="Executive Sponsor">Executive Sponsor</SelectItem>
                                    <SelectItem value="Process Owner">Process Owner</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                    <SelectItem value="Engineering Lead">Engineering Lead</SelectItem>
                                    <SelectItem value="Security Lead">Security Lead</SelectItem>
                                    <SelectItem value="Procurement Lead">Procurement Lead</SelectItem>
                                    <SelectItem value="Legal lead">Legal lead</SelectItem>
                                    <SelectItem value="Arch Review">Arch Review</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdateStakeholder} disabled={!stakeholderName || !stakeholderRole}>
                            {editingIndex !== null ? 'Update' : 'Add Stakeholder'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UseCaseDetails;
