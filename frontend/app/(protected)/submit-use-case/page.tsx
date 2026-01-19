// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from '@/lib/router';
import { useMsal } from '@azure/msal-react';
import { X, Loader2, CheckSquare, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    getSubmitUseCaseData,
    getVendorsFromData,
    getAllVendorsFromAllVendorsData,
    getModelsForVendor,
    getBusinessUnitsFromData,
    getTeamsForBusinessUnit,
    getSubTeamsForTeam,
    getRolesFromData,
    getChampionsForBusinessUnit,
    createUseCase,
    createStakeholder,
    createPlan
} from '@/lib/submit-use-case';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
    Form,
    FormField,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverAnchor,
} from "@/components/ui/popover"
import { Combobox } from "@/components/ui/combobox"
import { VendorCombobox } from "./vendor-combobox"
import { ModelCombobox } from "./model-combobox"
import { BusinessUnitCombobox } from "./business-unit-combobox"
import { TeamCombobox } from "./team-combobox"
import { SubTeamCombobox } from "./sub-team-combobox"
import { SubmitUseCaseAIThemeMultiCombobox as AIThemeMultiCombobox } from "./ai-theme-multi-combobox"
import { SubmitUseCasePersonaMultiCombobox as PersonaMultiCombobox } from "./persona-multi-combobox"
import { SubmitUseCaseMultiCombobox as MultiCombobox } from "./multi-combobox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
    Field,
    FieldLabel,
    FieldContent,
    FieldError,
} from "@/components/ui/field"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionCards } from "@/features/dashboard/components/SectionCards"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { ParcsCategorySelect } from "./components/ParcsCategorySelect";
import { UnitOfMeasurementSelect } from "./components/UnitOfMeasurementSelect";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyHeader, EmptyContent } from '@/components/ui/empty';
import { History } from "lucide-react";

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

const FormSkeleton = () => (
    <div className="space-y-6">
        <Card className="shadow-sm border-none ring-1 ring-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                ))}
            </CardContent>
        </Card>
        <Card className="shadow-sm border-none ring-1 ring-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);


const formSchema = z.object({
    useCaseTitle: z.string().min(1, "Use Case Title is required"),
    headline: z.string().min(1, "Headline is required"),
    opportunity: z.string().min(1, "Opportunity is required"),
    evidence: z.string().min(1, "Evidence is required"),
    businessValue: z.string().min(1, "Business Value is required"),
    selectedAITheme: z.array(z.string()).min(1, "AI Theme is required"),
    selectedPersona: z.array(z.string()).min(1, "Target Persona is required"),
    selectedVendor: z.string().min(1, "Vendor Name is required"),
    selectedModel: z.string().optional(),
    selectedBusinessUnit: z.string().min(1, "Business Unit is required"),
    selectedTeam: z.string().min(1, "Team Name is required"),
    primaryContact: z.string().optional(),
    selectedSubTeam: z.string().optional(),
    eseResourceValue: z.string().min(1, "Required"),
    infoLink: z.string().optional(),
    // Checklist fields
    usingExternalSource: z.string().optional(),
    dataSource: z.array(z.string()).optional(),
    hasCustomerData: z.string().optional(),
    hasEmployeeData: z.string().optional(),
    hasFinancialData: z.string().optional(),
    hasProductData: z.string().optional(),
    isSourceAccessibleAll: z.string().optional(),
    hasAccessToOriginalSource: z.string().optional(),
    isCollectingData: z.string().optional(),
    usesSyntheticData: z.string().optional(),
    hasPII: z.string().optional(),
    informsHighRiskDecisions: z.string().optional(),
    hasHumanInLoop: z.string().optional(),
    intendedUserLocation: z.array(z.string()).optional(),
    hasSupportChannel: z.string().optional(),
    hasDataFlowDiagram: z.string().optional(),
    hasWritePrivileges: z.string().optional(),
    processedSensitiveAttributes: z.string().optional(),
    dataClassificationLevel: z.string().optional(),
    attestCompliance: z.string().optional(),
    confirmPolicySharing: z.string().optional(),
})

const SubmitUseCase = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { accounts } = useMsal();
    const [currentStep, setCurrentStep] = useState(location.state?.initialStep || 1);
    const formContainerRef = useRef(null);
    const aiCardRef = useRef(null);
    // Removed manual eseResourceValue state, using form watch instead

    // Initialize addedStakeholders with the logged-in user
    useEffect(() => {
        if (accounts && accounts.length > 0) {
            const account = accounts[0];
            const name = account.name || account.username || 'Unknown User';
            const role = 'Primary Contact';

            setAddedStakeholders(prev => {
                const exists = prev.some(s => s.name === name && s.role === role);
                if (!exists) {
                    return [...prev, { name, role }];
                }
                return prev;
            });
        }
    }, [accounts]);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Raw data from APIs
    const [aiModelsData, setAiModelsData] = useState(null);
    const [allVendorsData, setAllVendorsData] = useState(null);
    const [businessStructureData, setBusinessStructureData] = useState(null);
    const [rolesData, setRolesData] = useState(null);
    const [dropdownData, setDropdownData] = useState(null);
    const [championsData, setChampionsData] = useState([]);
    const [championNames, setChampionNames] = useState([]);

    // Form definition
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            useCaseTitle: "",
            headline: "",
            opportunity: "",
            evidence: "",
            businessValue: "",
            selectedAITheme: [],
            selectedPersona: [],
            selectedVendor: "",
            selectedModel: "",
            selectedBusinessUnit: "",
            selectedTeam: "",
            primaryContact: "",
            selectedSubTeam: "",
            eseResourceValue: "No",
            infoLink: "",
            // Checklist default values
            usingExternalSource: "",
            dataSource: [],
            hasCustomerData: "",
            hasEmployeeData: "",
            hasFinancialData: "",
            hasProductData: "",
            isSourceAccessibleAll: "",
            hasAccessToOriginalSource: "",
            isCollectingData: "",
            usesSyntheticData: "",
            hasPII: "",
            informsHighRiskDecisions: "",
            hasHumanInLoop: "",
            intendedUserLocation: [],
            hasSupportChannel: "",
            hasDataFlowDiagram: "",
            hasWritePrivileges: "",
            processedSensitiveAttributes: "",
            dataClassificationLevel: "",
            attestCompliance: "",
            confirmPolicySharing: "",
        },
        mode: "onChange",
    })

    // Watch values for dependencies
    const {
        selectedVendor,
        selectedBusinessUnit,
        selectedTeam,
        eseResourceValue: watchedEseResourceValue
    } = form.watch()

    // Derived state for existing logic compatibility
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const useCaseTitle = form.watch("useCaseTitle");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const headline = form.watch("headline");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const opportunity = form.watch("opportunity");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const evidence = form.watch("evidence");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const businessValue = form.watch("businessValue");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const selectedAITheme = form.watch("selectedAITheme");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const selectedPersona = form.watch("selectedPersona");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const selectedModel = form.watch("selectedModel");

    const showChecklistTab = true;

    // Stakeholder form values
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStakeholder, setSelectedStakeholder] = useState('');
    const [addedStakeholders, setAddedStakeholders] = useState([]);

    // Stakeholder dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [stakeholderName, setStakeholderName] = useState('');
    const [stakeholderRole, setStakeholderRole] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Step 3 form values - Launch Plan dates
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [diagnoseStartDate, setDiagnoseStartDate] = useState<Date | undefined>(undefined);
    const [diagnoseEndDate, setDiagnoseEndDate] = useState<Date | undefined>(undefined);
    const [designStartDate, setDesignStartDate] = useState<Date | undefined>(undefined);
    const [designEndDate, setDesignEndDate] = useState<Date | undefined>(undefined);
    const [implementedStartDate, setImplementedStartDate] = useState<Date | undefined>(undefined);
    const [implementedEndDate, setImplementedEndDate] = useState<Date | undefined>(undefined);

    // Phase date dialog states
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    const [editingPhase, setEditingPhase] = useState(null);
    const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);
    const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined);

    const handleOpenDateDialog = (phase) => {
        setEditingPhase(phase);
        if (phase === 'Idea') {
            setTempStartDate(startDate);
            setTempEndDate(endDate);
        } else if (phase === 'Diagnose') {
            setTempStartDate(diagnoseStartDate);
            setTempEndDate(diagnoseEndDate);
        } else if (phase === 'Design') {
            setTempStartDate(designStartDate);
            setTempEndDate(designEndDate);
        } else if (phase === 'Implemented') {
            setTempStartDate(implementedStartDate);
            setTempEndDate(implementedEndDate);
        }
        setIsDateDialogOpen(true);
    };

    const handleDateDialogClose = () => {
        setIsDateDialogOpen(false);
        setEditingPhase(null);
        setTempStartDate(undefined);
        setTempEndDate(undefined);
    };

    const handleSubmitDates = () => {
        if (editingPhase === 'Idea') {
            setStartDate(tempStartDate);
            setEndDate(tempEndDate);
        } else if (editingPhase === 'Diagnose') {
            setDiagnoseStartDate(tempStartDate);
            setDiagnoseEndDate(tempEndDate);
        } else if (editingPhase === 'Design') {
            setDesignStartDate(tempStartDate);
            setDesignEndDate(tempEndDate);
        } else if (editingPhase === 'Implemented') {
            setImplementedStartDate(tempStartDate);
            setImplementedEndDate(tempEndDate);
        }
        toast.success('Dates updated successfully');
        handleDateDialogClose();
    };

    // Metrics State & Logic
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [inputValues, setInputValues] = useState({});
    const [metricsSubmitted, setMetricsSubmitted] = useState(false);
    const [editingMetricId, setEditingMetricId] = useState<number | null>(null);
    const [tempBaselineDate, setTempBaselineDate] = useState<Date | undefined>(undefined);
    const [tempTargetDate, setTempTargetDate] = useState<Date | undefined>(undefined);
    const [isMetricDateDialogOpen, setIsMetricDateDialogOpen] = useState(false);

    const handleAddMetric = useCallback(() => {
        const newMetric = {
            id: Date.now(),
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

    const handleDeleteMetric = useCallback((id: number) => {
        setMetrics(prev => prev.filter(metric => metric.id !== id));
        toast.success('Metric deleted successfully');
    }, []);

    const handleInputChange = useCallback((id: number, field: string, value: string) => {
        const inputKey = `${id}-${field}`;
        setInputValues(prev => ({ ...prev, [inputKey]: value }));
        setMetrics(prev => prev.map(metric =>
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
            setMetrics(prev => prev.map(m => m.isSubmitted ? m : { ...m, isSubmitted: true }));
            toast.success('Metrics saved successfully');
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

    const addMetricsTable = useReactTable({
        data: metrics,
        columns: addMetricsColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Fetch all data on mount with stale-while-revalidate cache
    useEffect(() => {
        let isMounted = true;
        const cacheKey = "submit-use-case-data-v1";
        const cacheTtlMs = 10 * 60 * 1000;

        const applySubmitUseCaseData = (consolidatedData) => {
            setAiModelsData(consolidatedData.ai_models);
            setAllVendorsData(consolidatedData.vendors);
            setBusinessStructureData(consolidatedData.business_structure);
            setRolesData(consolidatedData.roles);
            setDropdownData(consolidatedData.dropdown_data);
            setChampionNames(consolidatedData.champion_names.champions);
        };

        const loadFromCache = () => {
            if (typeof window === "undefined") return false;
            try {
                const raw = window.localStorage.getItem(cacheKey);
                if (!raw) return false;
                const cached = JSON.parse(raw);
                if (!cached?.data || !cached?.ts) return false;
                if (Date.now() - cached.ts > cacheTtlMs) return false;
                applySubmitUseCaseData(cached.data);
                return true;
            } catch (error) {
                console.warn("Failed to read submit use case cache:", error);
                return false;
            }
        };

        const fetchAllData = async (hasCache: boolean) => {
            try {
                if (!hasCache) {
                    setIsLoading(true);
                }
                setLoadingError(null);

                const consolidatedData = await getSubmitUseCaseData();
                if (!isMounted) return;

                applySubmitUseCaseData(consolidatedData);
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(
                        cacheKey,
                        JSON.stringify({ ts: Date.now(), data: consolidatedData })
                    );
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                if (!hasCache) {
                    setLoadingError("Failed to load form data. Please refresh the page.");
                }
            } finally {
                if (!hasCache && isMounted) {
                    setIsLoading(false);
                }
            }
        };

        const hasCache = loadFromCache();
        if (hasCache) {
            setIsLoading(false);
        }
        fetchAllData(hasCache);

        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch champions when business unit changes
    useEffect(() => {
        const fetchChampions = async () => {
            if (selectedBusinessUnit) {
                try {
                    const champions = await getChampionsForBusinessUnit(selectedBusinessUnit);
                    setChampionsData(champions);
                } catch (error) {
                    console.error('Error fetching champions:', error);
                    setChampionsData([]);
                }
            } else {
                setChampionsData([]);
            }
        };

        fetchChampions();
    }, [selectedBusinessUnit]);

    // Computed dropdown options using frontend filtering
    const aiThemes = useMemo(() => {
        if (!dropdownData?.ai_themes) return [];
        const seen = new Set();
        return dropdownData.ai_themes.filter(item => {
            const label = item.label.trim().toLowerCase();
            if (seen.has(label)) return false;
            seen.add(label);
            return true;
        });
    }, [dropdownData]);

    const personas = useMemo(() => {
        if (!dropdownData?.personas) return [];
        const seen = new Set();
        return dropdownData.personas.filter(item => {
            const label = item.label.trim().toLowerCase();
            if (seen.has(label)) return false;
            seen.add(label);
            return true;
        });
    }, [dropdownData]);

    const roles = useMemo(() => {
        const roleNames = getRolesFromData(rolesData);
        const seen = new Set();
        return roleNames
            .filter(name => {
                const label = name.trim().toLowerCase();
                if (seen.has(label)) return false;
                seen.add(label);
                return true;
            })
            .map(name => ({ value: name, label: name }));
    }, [rolesData]);

    const vendors = useMemo(() => {
        const vendorNames = getAllVendorsFromAllVendorsData(allVendorsData);
        return vendorNames.map(name => ({ value: name, label: name }));
    }, [allVendorsData]);

    const models = useMemo(() => {
        if (!selectedVendor || !aiModelsData) return [];
        const modelNames = getModelsForVendor(aiModelsData, selectedVendor);
        return modelNames.map(name => ({ value: name, label: name }));
    }, [aiModelsData, selectedVendor]);

    const businessUnits = useMemo(() => {
        const buNames = getBusinessUnitsFromData(businessStructureData);
        return buNames.map(name => ({ value: name, label: name }));
    }, [businessStructureData]);

    useEffect(() => {
        if (!selectedVendor) {
            form.setValue("selectedModel", "", { shouldDirty: true, shouldValidate: true });
            return;
        }
        const hasSelected = models.some(model => model.value === selectedModel);
        if (!hasSelected) {
            form.setValue("selectedModel", "", { shouldDirty: true, shouldValidate: true });
        }
    }, [form, models, selectedModel, selectedVendor]);

    const teams = useMemo(() => {
        if (!selectedBusinessUnit || !businessStructureData) return [];
        const teamNames = getTeamsForBusinessUnit(businessStructureData, selectedBusinessUnit);
        return teamNames.map(name => ({ value: name, label: name }));
    }, [businessStructureData, selectedBusinessUnit]);

    const subTeams = useMemo(() => {
        if (!selectedBusinessUnit || !selectedTeam || !businessStructureData) return [];
        const subTeamNames = getSubTeamsForTeam(businessStructureData, selectedBusinessUnit, selectedTeam);
        return subTeamNames.map(name => ({ value: name, label: name }));
    }, [businessStructureData, selectedBusinessUnit, selectedTeam]);

    const primaryContactOptions = useMemo(() => {
        if (!accounts || accounts.length === 0) return [];
        const account = accounts[0];
        const displayName = account.name || account.username;
        const email = account.username;
        return [{
            value: email,
            label: `${displayName} (${email})`
        }];
    }, [accounts]);

    // Validation for Next button
    const isStep1Valid = form.formState.isValid;

    const isStep2Valid = useMemo(() => {
        return addedStakeholders.length > 0 && startDate !== undefined && endDate !== undefined;
    }, [addedStakeholders, startDate, endDate]);

    // Reset dependent selections when parent changes
    useEffect(() => {
        form.setValue("selectedTeam", "");
        form.setValue("selectedSubTeam", "");
    }, [selectedBusinessUnit, form]);

    // Set primary contact default
    useEffect(() => {
        if (primaryContactOptions.length > 0 && !form.getValues("primaryContact")) {
            form.setValue("primaryContact", primaryContactOptions[0].value);
        }
    }, [primaryContactOptions, form]);

    // Redirect mapping if currentStep is no longer valid
    useEffect(() => {
        if (currentStep === 2 && !showChecklistTab) {
            setCurrentStep(3);
        }
    }, [showChecklistTab, currentStep]);

    const handleNext = useCallback(async () => {
        if (currentStep === 1) {
            const isValid = await form.trigger();
            if (!isValid) return;
            setCurrentStep(showChecklistTab ? 2 : 3);
        } else if (currentStep === 2) {
            setCurrentStep(3);
        } else if (currentStep === 3) {
            setCurrentStep(4);
        } else {
            // Submit action (currentStep === 4)
            // Submit action
            setIsSubmitting(true);
            setSubmitError(null);

            try {
                const values = form.getValues();

                // Prepare use case data
                const useCaseData = {
                    Title: values.useCaseTitle,
                    Headlines: values.headline,
                    Opportunity: values.opportunity,
                    Evidence: values.evidence,
                    BusinessValue: values.businessValue,
                    AITheme: values.selectedAITheme.join(', '),
                    TargetPersonas: values.selectedPersona.join(', '),
                    VendorName: values.selectedVendor,
                    ModelName: values.selectedModel,
                    BusinessUnit: values.selectedBusinessUnit,
                    TeamName: values.selectedTeam,
                    PrimaryContact: values.primaryContact || primaryContactOptions[0]?.value || '',
                    CreatedBy: accounts[0]?.username || accounts[0]?.name || 'Unknown',
                    ESEResourcesNeeded: values.eseResourceValue === 'Yes',
                    Phase: 'Idea', // Default phase
                    Status: 'Draft' // Default status
                };

                // Create use case
                const createdUseCase = await createUseCase(useCaseData);
                const useCaseId = createdUseCase.ID;

                // Create stakeholders
                for (const stakeholder of addedStakeholders) {
                    await createStakeholder(useCaseId, {
                        Stakeholder: stakeholder.name,
                        Role: stakeholder.role,
                        UseCasesID: useCaseId,
                        BusinessUnit: values.selectedBusinessUnit,
                        UseCaseTitle: values.useCaseTitle
                    });
                }

                // Create plan with dates
                await createPlan(useCaseId, {
                    StartDate: startDate ? format(startDate, 'dd-MM-yyyy') : '',
                    EndDate: endDate ? format(endDate, 'dd-MM-yyyy') : '',
                    UseCasesID: useCaseId,
                    UseCasePhase: 'Idea'
                });

                // Show success toast
                toast.success(`Your record has been submitted successfully with ID: ${useCaseId}`);
                navigate('/champion');

            } catch (error) {
                console.error('Error submitting use case:', error);
                setSubmitError('Failed to submit use case. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [currentStep, form, primaryContactOptions, addedStakeholders, startDate, endDate, accounts]);

    const handleBack = useCallback(() => {
        if (currentStep === 4) {
            setCurrentStep(3);
        } else if (currentStep === 3) {
            setCurrentStep(showChecklistTab ? 2 : 1);
        } else if (currentStep === 2) {
            setCurrentStep(1);
        } else {
            navigate(-1);
        }
    }, [currentStep, showChecklistTab, navigate]);

    // Form input handlers removed in favor of React Hook Form
    // Step 3 handlers
    const handleStartDateChange = useCallback((date: Date | undefined) => setStartDate(date), []);
    const handleEndDateChange = useCallback((date: Date | undefined) => setEndDate(date), []);

    const handleRoleChange = useCallback((e) => {
        setSelectedRole(e.target.value);
    }, []);

    const handleStakeholderChange = useCallback((e) => {
        setSelectedStakeholder(e.target.value);
    }, []);

    const handleAddStakeholder = useCallback(() => {
        if (selectedRole && selectedStakeholder) {
            // Check if stakeholder is already added
            const isAlreadyAdded = addedStakeholders.some(
                stakeholder => stakeholder.name === selectedStakeholder && stakeholder.role === selectedRole
            );

            if (!isAlreadyAdded) {
                setAddedStakeholders(prev => [...prev, {
                    name: selectedStakeholder,
                    role: selectedRole
                }]);
            }

            // Reset form
            setSelectedRole('');
            setSelectedStakeholder('');
        }
    }, [selectedRole, selectedStakeholder, addedStakeholders]);

    const handleUpdateStakeholder = useCallback(() => {
        if (stakeholderName && stakeholderRole) {
            // Generate initials from the name
            const initial = stakeholderName.split(' ').map(n => n[0]).join('').toUpperCase();

            if (editingIndex !== null) {
                // Update existing stakeholder
                setAddedStakeholders(prev => prev.map((stakeholder, idx) =>
                    idx === editingIndex
                        ? { ...stakeholder, name: stakeholderName, role: stakeholderRole }
                        : stakeholder
                ));
                toast.success('Stakeholder updated successfully');
            } else {
                // Add new stakeholder to the list
                setAddedStakeholders(prev => [...prev, {
                    name: stakeholderName,
                    role: stakeholderRole
                }]);
                toast.success('Stakeholder added successfully');
            }

            setIsDialogOpen(false);
            setStakeholderName('');
            setStakeholderRole('');
            setEditingIndex(null);
        }
    }, [stakeholderName, stakeholderRole, editingIndex]);

    const handleEditStakeholder = useCallback((index: number) => {
        const stakeholder = addedStakeholders[index];
        setStakeholderName(stakeholder.name);
        setStakeholderRole(stakeholder.role);
        setEditingIndex(index);
        setIsDialogOpen(true);
    }, [addedStakeholders]);

    const handleDialogClose = useCallback(() => {
        setIsDialogOpen(false);
        setStakeholderName('');
        setStakeholderRole('');
        setEditingIndex(null);
    }, []);

    return (
        <div ref={formContainerRef} className="flex flex-1 flex-col gap-6 p-6 w-full">

            <div className="sticky top-14 z-[50] flex justify-center w-full bg-gray-50 pb-4 pt-4 border-b border-gray-100">
                <div className="flex flex-1 flex-col mx-auto max-w-7xl w-full px-4">
                    <Tabs value={currentStep.toString()} onValueChange={(val) => setCurrentStep(parseInt(val))} className="w-full">
                        <div className="flex justify-start">
                            <TabsList className={cn("grid w-full max-w-[800px]", showChecklistTab ? "grid-cols-4" : "grid-cols-3")}>
                                <TabsTrigger value="1">Use Case Information</TabsTrigger>
                                {showChecklistTab && <TabsTrigger value="2">AI Product Checklist</TabsTrigger>}
                                <TabsTrigger value="3">Stakeholders & Launch Plan</TabsTrigger>
                                <TabsTrigger value="4">PARCS Metrics</TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>
                </div>
            </div>


            {isLoading && (
                <div className="flex flex-1 flex-col gap-6 w-full">
                    <div className="flex justify-center w-full">
                        <div className="flex flex-1 flex-col gap-6 mx-auto max-w-7xl w-full px-4">
                            <FormSkeleton />
                        </div>
                    </div>
                </div>
            )}

            {/* Error message */}
            {loadingError && (
                <div className="error-message">
                    <p>{loadingError}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            )}

            {/* Submit error message */}
            {submitError && (
                <div className="error-message">
                    <p>{submitError}</p>
                </div>
            )}

            {!isLoading && !loadingError && (
                <Form {...form}>
                    <div className="flex justify-center w-full">
                        <div className="flex flex-1 flex-col gap-6 mx-auto max-w-7xl w-full px-4">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    {/* Basic Information Card - Updated with shadcn styling */}
                                    <Card className="shadow-sm">
                                        <CardHeader className="border-b">
                                            <CardTitle>Use Case</CardTitle>
                                            <CardDescription>Basic information about your use case</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="useCaseTitle"
                                                render={({ field, fieldState }) => (
                                                    <Field>
                                                        <FieldLabel>Use Case Title</FieldLabel>
                                                        <FieldContent>
                                                            <Input placeholder="Use Case Title" {...field} className="form-input" />
                                                            <FieldError errors={[fieldState.error]} />
                                                        </FieldContent>
                                                    </Field>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="headline"
                                                render={({ field, fieldState }) => (
                                                    <Field>
                                                        <FieldLabel>Headline</FieldLabel>
                                                        <FieldContent>
                                                            <Input placeholder="One Line Executive Headline" {...field} className="form-input" />
                                                            <FieldError errors={[fieldState.error]} />
                                                        </FieldContent>
                                                    </Field>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="opportunity"
                                                render={({ field, fieldState }) => (
                                                    <Field>
                                                        <FieldLabel>Opportunity</FieldLabel>
                                                        <FieldContent>
                                                            <Textarea rows={3} placeholder="What is AI being used for?" {...field} className="form-textarea" />
                                                            <FieldError errors={[fieldState.error]} />
                                                        </FieldContent>
                                                    </Field>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="evidence"
                                                render={({ field, fieldState }) => (
                                                    <Field>
                                                        <FieldLabel>Evidence</FieldLabel>
                                                        <FieldContent>
                                                            <Textarea rows={3} placeholder="Why it is needed?" {...field} className="form-textarea" />
                                                            <FieldError errors={[fieldState.error]} />
                                                        </FieldContent>
                                                    </Field>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="businessValue"
                                                render={({ field, fieldState }) => (
                                                    <Field>
                                                        <FieldLabel>Business Value</FieldLabel>
                                                        <FieldContent>
                                                            <Textarea rows={3} placeholder="What are the anticipated benefits to UKG?" {...field} className="form-textarea" />
                                                            <FieldError errors={[fieldState.error]} />
                                                        </FieldContent>
                                                    </Field>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* AI Configuration Card */}
                                    <Card ref={aiCardRef} className="shadow-sm">
                                        <CardHeader className="border-b">
                                            <CardTitle>AI Configuration</CardTitle>
                                            <CardDescription>Select AI themes, personas, vendor and model</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="selectedAITheme"
                                                    render={({ field, fieldState }) => (
                                                        <Field>
                                                            <FieldLabel>AI Theme</FieldLabel>
                                                            <FieldContent>
                                                                <AIThemeMultiCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={aiThemes}
                                                                    placeholder="Select AI Themes"
                                                                    searchPlaceholder="Search themes..."
                                                                    container={aiCardRef.current}
                                                                />
                                                                <FieldError errors={[fieldState.error]} />
                                                            </FieldContent>
                                                        </Field>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="selectedPersona"
                                                    render={({ field, fieldState }) => (
                                                        <Field>
                                                            <FieldLabel>Target Personas</FieldLabel>
                                                            <FieldContent>
                                                                <PersonaMultiCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={personas}
                                                                    placeholder="Select Target Personas"
                                                                    searchPlaceholder="Search personas..."
                                                                />
                                                                <FieldError errors={[fieldState.error]} />
                                                            </FieldContent>
                                                        </Field>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="selectedVendor"
                                                    render={({ field, fieldState }) => (
                                                        <Field>
                                                            <FieldLabel>Vendor Name</FieldLabel>
                                                            <FieldContent>
                                                                <VendorCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={vendors}
                                                                    placeholder="No Vendor Identified"
                                                                    searchPlaceholder="Search vendors..."
                                                                />
                                                                <FieldError errors={[fieldState.error]} />
                                                            </FieldContent>
                                                        </Field>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="selectedModel"
                                                    render={({ field, fieldState }) => (
                                                        <Field>
                                                            <FieldLabel>Model Name</FieldLabel>
                                                            <FieldContent>
                                                                <ModelCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={models}
                                                                    disabled={!selectedVendor || models.length === 0}
                                                                    placeholder="No Model Identified"
                                                                    searchPlaceholder="Search models..."
                                                                />
                                                                <FieldError errors={[fieldState.error]} />
                                                            </FieldContent>
                                                        </Field>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Team Information Card */}
                                    <Card className="shadow-sm">
                                        <CardHeader className="border-b">
                                            <CardTitle>Team Information</CardTitle>
                                            <CardDescription>Business unit, team details and resources</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="selectedBusinessUnit"
                                                    render={({ field, fieldState }) => (
                                                        <Field>
                                                            <FieldLabel>Business Unit</FieldLabel>
                                                            <FieldContent>
                                                                <BusinessUnitCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={businessUnits}
                                                                    placeholder="Select a Business Unit"
                                                                    searchPlaceholder="Search business units..."
                                                                />
                                                                <FieldError errors={[fieldState.error]} />
                                                            </FieldContent>
                                                        </Field>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="selectedTeam"
                                                    render={({ field, fieldState }) => (
                                                        <Field>
                                                            <FieldLabel>Team Name</FieldLabel>
                                                            <FieldContent>
                                                                <TeamCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={teams}
                                                                    disabled={!selectedBusinessUnit}
                                                                    placeholder="Select Team Name"
                                                                    searchPlaceholder="Search teams..."
                                                                />
                                                                <FieldError errors={[fieldState.error]} />
                                                            </FieldContent>
                                                        </Field>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="selectedSubTeam"
                                                    render={({ field, fieldState }) => (
                                                        <Field>
                                                            <FieldLabel>Sub Team Name</FieldLabel>
                                                            <FieldContent>
                                                                <SubTeamCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={subTeams}
                                                                    disabled={!selectedTeam}
                                                                    placeholder="Select Sub Team Name"
                                                                />
                                                                <FieldError errors={[fieldState.error]} />
                                                            </FieldContent>
                                                        </Field>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="eseResourceValue"
                                                    render={({ field, fieldState }) => (
                                                        <Field>
                                                            <FieldLabel>ESE Resources Needed</FieldLabel>
                                                            <FieldContent>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            role="combobox"
                                                                            className="w-full justify-between form-select min-w-0 h-auto py-1.5"
                                                                        >
                                                                            <span className="truncate mr-2">
                                                                                {field.value || "No"}
                                                                            </span>
                                                                            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent className="w-full p-0" sideOffset={144}>
                                                                        <DropdownMenuItem onSelect={() => field.onChange("No")}>No</DropdownMenuItem>
                                                                        <DropdownMenuItem onSelect={() => field.onChange("Yes")}>Yes</DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                                <FieldError errors={[fieldState.error]} />
                                                            </FieldContent>
                                                        </Field>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="infoLink"
                                                render={({ field, fieldState }) => (
                                                    <Field>
                                                        <FieldLabel>Info Link</FieldLabel>
                                                        <FieldContent>
                                                            <Input placeholder="Additional Info Link about Use Case" {...field} className="form-input" />
                                                            <FieldError errors={[fieldState.error]} />
                                                        </FieldContent>
                                                    </Field>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {currentStep === 2 && showChecklistTab && (
                                <div className="space-y-6 animate-in fade-in duration-500 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="p-6 rounded-lg border border-dashed">
                                        <div className="flex items-center gap-3 mb-6 sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
                                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                                <CheckSquare className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">AI Product Checklist</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Please provide accurate responses for your {selectedModel || "AI product"} implementation.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-6">
                                            {/* Question 1 */}
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-2 p-4 bg-card rounded-md">
                                                    <span className="text-sm font-medium">1. Are you using an external file or system as a data source for your custom Agent?</span>
                                                    <FormField
                                                        control={form.control}
                                                        name="usingExternalSource"
                                                        render={({ field }) => (
                                                            <div className="flex flex-col gap-2 ml-4">
                                                                {["Yes", "No"].map((option) => (
                                                                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                                        <div className={cn(
                                                                            "h-4 w-4 rounded-full border border-primary flex items-center justify-center transition-all",
                                                                            field.value === option ? "bg-primary" : "bg-transparent group-hover:border-primary/50"
                                                                        )}>
                                                                            {field.value === option && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                                                                        </div>
                                                                        <input type="radio" className="hidden" checked={field.value === option} onChange={() => field.onChange(option)} />
                                                                        <span className="text-sm">{option}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    />
                                                </div>

                                                {/* Question 2 */}
                                                <div className="flex flex-col gap-2 p-4 bg-card rounded-md">
                                                    <span className="text-sm font-medium">2. What is the original source of the data? Select all that apply</span>
                                                    <FormField
                                                        control={form.control}
                                                        name="dataSource"
                                                        render={({ field }) => (
                                                            <div className="max-w-72 ml-4">
                                                                <MultiCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={[
                                                                        { value: "Salesforce", label: "Salesforce" },
                                                                        { value: "UKG Data Warehouse", label: "UKG Data Warehouse" },
                                                                        { value: "ServiceNow", label: "ServiceNow" },
                                                                        { value: "Jira", label: "Jira" },
                                                                        { value: "Sharepoint", label: "Sharepoint" },
                                                                        { value: "D365", label: "D365" },
                                                                        { value: "UKG Products Data", label: "UKG Products Data" },
                                                                    ]}
                                                                    placeholder="Select data sources"
                                                                    align="end"
                                                                    containerRef={formContainerRef}
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                </div>

                                                {/* Yes/No block 1 */}
                                                {[
                                                    { name: "hasCustomerData", label: "3. Does this custom Agent contain any Customer-related data?" },
                                                    { name: "hasEmployeeData", label: "4. Does this custom Agent contain any Employee-related data?" },
                                                    { name: "hasFinancialData", label: "5. Does this custom Agent contain any Financial-related data?" },
                                                    { name: "hasProductData", label: "6. Does this custom Agent contain any Product-related data?" },
                                                    { name: "isSourceAccessibleAll", label: "7. Is the current data source accessible to all UKG employees?" },
                                                    { name: "hasAccessToOriginalSource", label: "8. Do team members who has access to your custom Agent also have access to the original data source?" },
                                                    { name: "isCollectingData", label: "9. Is the Agent collecting any data during use? If yes, please describe in Opportunity field." },
                                                    { name: "usesSyntheticData", label: "10. Does this custom Agent use synthetic data?" },
                                                    { name: "hasPII", label: "11. Does this custom Agent have any Personally Identifiable Information data?" },
                                                    { name: "informsHighRiskDecisions", label: "12. Will outputs from the custom Agent inform or make employment or other high-risk decisions?" },
                                                    { name: "hasHumanInLoop", label: "13. Is there a \"Human In the Loop\" for this custom Agent?" },
                                                ].map((q, idx) => (
                                                    <div key={idx} className="flex flex-col gap-2 p-4 bg-card rounded-md">
                                                        <span className="text-sm font-medium">{q.label}</span>
                                                        <FormField
                                                            control={form.control}
                                                            name={q.name}
                                                            render={({ field }) => (
                                                                <div className="flex flex-col gap-2 ml-4">
                                                                    {["Yes", "No"].map((option) => (
                                                                        <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                                            <div className={cn(
                                                                                "h-4 w-4 rounded-full border border-primary flex items-center justify-center transition-all",
                                                                                field.value === option ? "bg-primary" : "bg-transparent group-hover:border-primary/50"
                                                                            )}>
                                                                                {field.value === option && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                                                                            </div>
                                                                            <input type="radio" className="hidden" checked={field.value === option} onChange={() => field.onChange(option)} />
                                                                            <span className="text-sm">{option}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                ))}

                                                {/* Question 14 */}
                                                <div className="flex flex-col gap-2 p-4 bg-card rounded-md">
                                                    <span className="text-sm font-medium">14. Where are the Intended users of this custom Agent located?</span>
                                                    <FormField
                                                        control={form.control}
                                                        name="intendedUserLocation"
                                                        render={({ field }) => (
                                                            <div className="max-w-72 ml-4">
                                                                <MultiCombobox
                                                                    value={field.value ?? []}
                                                                    onChange={field.onChange}
                                                                    options={[
                                                                        { value: "AMER", label: "AMER" },
                                                                        { value: "APAC", label: "APAC" },
                                                                        { value: "EMEA", label: "EMEA" },
                                                                        { value: "ANZ", label: "ANZ" },
                                                                        { value: "All Regions", label: "All Regions" },
                                                                    ]}
                                                                    placeholder="Select locations"
                                                                    align="end"
                                                                    containerRef={formContainerRef}
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                </div>

                                                {/* Yes/No block 2 */}
                                                {[
                                                    { name: "hasSupportChannel", label: "15. Does this custom Agent have Support channel & escalation path & target SLA established?" },
                                                    { name: "hasDataFlowDiagram", label: "16. Does this custom Agent have a documented Data flow diagram?" },
                                                    { name: "hasWritePrivileges", label: "17. Does this custom Agent have a Tools/actions with write privileges?" },
                                                    { name: "processedSensitiveAttributes", label: "18. Done Sensitive attributes (e.g., race, health, unions) processed?" },
                                                ].map((q, idx) => (
                                                    <div key={idx} className="flex flex-col gap-2 p-4 bg-card rounded-md">
                                                        <span className="text-sm font-medium">{q.label}</span>
                                                        <FormField
                                                            control={form.control}
                                                            name={q.name}
                                                            render={({ field }) => (
                                                                <div className="flex flex-col gap-2 ml-4">
                                                                    {["Yes", "No"].map((option) => (
                                                                        <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                                            <div className={cn(
                                                                                "h-4 w-4 rounded-full border border-primary flex items-center justify-center transition-all",
                                                                                field.value === option ? "bg-primary" : "bg-transparent group-hover:border-primary/50"
                                                                            )}>
                                                                                {field.value === option && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                                                                            </div>
                                                                            <input type="radio" className="hidden" checked={field.value === option} onChange={() => field.onChange(option)} />
                                                                            <span className="text-sm">{option}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                ))}

                                                {/* Question 19 */}
                                                <div className="flex flex-col gap-2 p-4 bg-card rounded-md">
                                                    <span className="text-sm font-medium">19. What Data classification level would you assign to this custom agent?</span>
                                                    <FormField
                                                        control={form.control}
                                                        name="dataClassificationLevel"
                                                        render={({ field }) => (
                                                            <div className="max-w-72 ml-4">
                                                                <Combobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={[
                                                                        { value: "Public", label: "Public" },
                                                                        { value: "Internal", label: "Internal" },
                                                                        { value: "Confidential", label: "Confidential" },
                                                                        { value: "Restricted", label: "Restricted" },
                                                                    ]}
                                                                    placeholder="Select classification level"
                                                                    align="end"
                                                                    contentClassName="translate-x-4"
                                                                    containerRef={formContainerRef}
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                </div>

                                                {/* Yes/No block 3 (Policy) */}
                                                {[
                                                    { name: "attestCompliance", label: "20. Do you attest that this custom agent would comply with UKG AI policy?" },
                                                    { name: "confirmPolicySharing", label: "21. Would you confirm that sharing this Agent would not violate the UKG AI policy?" },
                                                ].map((q, idx) => (
                                                    <div key={idx} className="flex flex-col gap-2 p-4 bg-card rounded-md">
                                                        <span className="text-sm font-medium">{q.label}</span>
                                                        <FormField
                                                            control={form.control}
                                                            name={q.name}
                                                            render={({ field }) => (
                                                                <div className="flex flex-col gap-2 ml-4">
                                                                    {["Yes", "No"].map((option) => (
                                                                        <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                                            <div className={cn(
                                                                                "h-4 w-4 rounded-full border border-primary flex items-center justify-center transition-all",
                                                                                field.value === option ? "bg-primary" : "bg-transparent group-hover:border-primary/50"
                                                                            )}>
                                                                                {field.value === option && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                                                                            </div>
                                                                            <input type="radio" className="hidden" checked={field.value === option} onChange={() => field.onChange(option)} />
                                                                            <span className="text-sm">{option}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                                    {/* Left column: Stakeholders Card - 40% width */}
                                    <div className="lg:col-span-4">
                                        <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 min-h-[560px]">
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
                                            <CardContent className="pt-2 flex-1">
                                                <ScrollArea className="h-[470px]">
                                                    <div className="space-y-3 pr-3">
                                                        {championsData.map((champion, idx) => (
                                                            <div key={`champion-${idx}`} className="flex items-center justify-between gap-3 group">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8 border-none ring-1 ring-gray-100 shadow-sm">
                                                                        <AvatarFallback className="bg-[#E5FF1F] text-gray-900 text-[10px] font-bold">
                                                                            {champion.UKrewer.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-900 leading-none">{champion.UKrewer}</p>
                                                                        <p className="text-xs text-gray-500 mt-1">Champion</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {addedStakeholders.map((stakeholder, idx) => (
                                                            <div key={`added-${idx}`} className="flex items-center justify-between gap-3 group">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8 border-none ring-1 ring-gray-100 shadow-sm">
                                                                        <AvatarFallback className="bg-[#E5FF1F] text-gray-900 text-[10px] font-bold">
                                                                            {stakeholder.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-900 leading-none">{stakeholder.name}</p>
                                                                        <p className="text-xs text-gray-500 mt-1">{stakeholder.role}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 mr-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                                                                    onClick={() => handleEditStakeholder(idx)}
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Second column: Timeline Card - 60% width */}
                                    <div className="lg:col-span-6">
                                        <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 min-h-[560px]">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-teal-600" />
                                                    Timeline
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-6 py-4">
                                                <div className="metrics-table-container">
                                                    <table className="reporting-table" style={{ fontSize: '14px', tableLayout: 'fixed', width: '100%' }}>
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: '25%', padding: '12px 8px', fontWeight: '600', color: '#374151', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Phase</th>
                                                                <th style={{ width: '37.5%', padding: '12px 8px', fontWeight: '600', color: '#374151', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Start Date</th>
                                                                <th style={{ width: '37.5%', padding: '12px 8px', fontWeight: '600', color: '#374151', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>End Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr className="hover:bg-gray-50">
                                                                <td style={{ padding: '16px 8px', fontWeight: '500', textAlign: 'left', fontSize: '14px', color: '#111827' }}>
                                                                    Idea
                                                                </td>
                                                                <td style={{ padding: '16px 8px' }}>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                                                        onClick={() => handleOpenDateDialog('Idea')}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {startDate ? format(startDate, "dd-MM-yyyy") : "Pick date"}
                                                                    </Button>
                                                                </td>
                                                                <td style={{ padding: '16px 8px' }}>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                                                        onClick={() => handleOpenDateDialog('Idea')}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {endDate ? format(endDate, "dd-MM-yyyy") : "Pick date"}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                            <tr className="hover:bg-gray-50">
                                                                <td style={{ padding: '16px 8px', fontWeight: '500', textAlign: 'left', fontSize: '14px', color: '#111827' }}>
                                                                    Diagnose
                                                                </td>
                                                                <td style={{ padding: '16px 8px' }}>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                                                        onClick={() => handleOpenDateDialog('Diagnose')}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {diagnoseStartDate ? format(diagnoseStartDate, "dd-MM-yyyy") : "Pick date"}
                                                                    </Button>
                                                                </td>
                                                                <td style={{ padding: '16px 8px' }}>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                                                        onClick={() => handleOpenDateDialog('Diagnose')}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {diagnoseEndDate ? format(diagnoseEndDate, "dd-MM-yyyy") : "Pick date"}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                            <tr className="hover:bg-gray-50">
                                                                <td style={{ padding: '16px 8px', fontWeight: '500', textAlign: 'left', fontSize: '14px', color: '#111827' }}>
                                                                    Design
                                                                </td>
                                                                <td style={{ padding: '16px 8px' }}>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                                                        onClick={() => handleOpenDateDialog('Design')}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {designStartDate ? format(designStartDate, "dd-MM-yyyy") : "Pick date"}
                                                                    </Button>
                                                                </td>
                                                                <td style={{ padding: '16px 8px' }}>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                                                        onClick={() => handleOpenDateDialog('Design')}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-2" />
                                                                        {designEndDate ? format(designEndDate, "dd-MM-yyyy") : "Pick date"}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                            <tr className="hover:bg-gray-50">
                                                                <td style={{ padding: '16px 8px', fontWeight: '500', textAlign: 'left', fontSize: '14px', color: '#111827' }}>
                                                                    Implemented
                                                                </td>
                                                                <td style={{ padding: '16px 8px' }}>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                                                        onClick={() => handleOpenDateDialog('Implemented')}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {implementedStartDate ? format(implementedStartDate, "dd-MM-yyyy") : "Pick date"}
                                                                    </Button>
                                                                </td>
                                                                <td style={{ padding: '16px 8px' }}>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                                                        onClick={() => handleOpenDateDialog('Implemented')}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {implementedEndDate ? format(implementedEndDate, "dd-MM-yyyy") : "Pick date"}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="mb-8 p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add Metrics</h3>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleAddMetric}
                                                    type="button"
                                                    className="text-teal-600 border-teal-600 hover:bg-teal-50 h-8"
                                                >
                                                    <Plus size={14} className="mr-1" />
                                                    Add New Metric
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleSubmitMetrics}
                                                    type="button"
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
                                                    <Button onClick={handleAddMetric} type="button">
                                                        Add New Metric
                                                    </Button>
                                                </EmptyContent>
                                            </Empty>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Form>
            )}

            <div className="w-full max-w-7xl mx-auto px-4">
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleBack}>Back</Button>
                    <Button variant="outline" onClick={() => navigate('/')}>Cancel</Button>
                    <Button
                        onClick={handleNext}
                        disabled={
                            (currentStep === 1 && !isStep1Valid) ||
                            (currentStep === 3 && !isStep2Valid) ||
                            isSubmitting
                        }
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            currentStep === 4 ? 'Submit' : 'Next'
                        )}
                    </Button>
                </div>
            </div>

            {/* Date Selection Dialog */}
            <Dialog open={isDateDialogOpen} onOpenChange={handleDateDialogClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Select Dates for {editingPhase} Phase</DialogTitle>
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
                                initialFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">End Date</Label>
                            <Calendar
                                mode="single"
                                selected={tempEndDate}
                                onSelect={setTempEndDate}
                                className="rounded-md border"
                                initialFocus
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

        </div>
    );
};

export default SubmitUseCase;
