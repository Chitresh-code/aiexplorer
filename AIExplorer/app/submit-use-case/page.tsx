// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "@/lib/router";
import { useMsal } from "@azure/msal-react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getLoginRequest } from "@/lib/msal";
import {
    getSubmitUseCaseData,
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
} from "@/lib/submit-use-case";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReactTable, getCoreRowModel, type ColumnDef } from "@tanstack/react-table";
import { ChecklistSection } from "@/components/submit-use-case/ChecklistSection";
import { MetricsSection } from "@/components/submit-use-case/MetricsSection";
import { StakeholdersPlanSection } from "@/components/submit-use-case/StakeholdersPlanSection";
import { UseCaseInfoSection } from "@/components/submit-use-case/UseCaseInfoSection";
import { ParcsCategorySelect } from "@/components/submit-use-case/ParcsCategorySelect";
import { UnitOfMeasurementSelect } from "@/components/submit-use-case/UnitOfMeasurementSelect";

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

type ChecklistQuestion = {
    id: number | string;
    question: string;
    kind: "yesno" | "choice";
    options: { value: string; label: string }[];
    isMulti: boolean;
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
    checklistResponses: z.record(z.union([z.string(), z.array(z.string()), z.undefined()])).optional(),
})

const SubmitUseCase = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { accounts, instance } = useMsal();
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
            const email = account.username;

            setAddedStakeholders(prev => {
                const exists = prev.some(s => s.name === name && s.role === role);
                if (!exists) {
                    return [...prev, { name, role, email }];
                }
                return prev;
            });
        }
    }, [accounts]);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Raw data from APIs
    const [aiModelsData, setAiModelsData] = useState(null);
    const [allVendorsData, setAllVendorsData] = useState(null);
    const [businessStructureData, setBusinessStructureData] = useState(null);
    const [rolesData, setRolesData] = useState(null);
    const [dropdownData, setDropdownData] = useState(null);
    const [aiProductQuestionsData, setAiProductQuestionsData] = useState([]);
    const [championsData, setChampionsData] = useState([]);

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
            checklistResponses: {},
        },
        mode: "onChange",
    })

    const selectedVendor = useWatch({
        control: form.control,
        name: "selectedVendor",
    });
    const selectedBusinessUnit = useWatch({
        control: form.control,
        name: "selectedBusinessUnit",
    });
    const selectedTeam = useWatch({
        control: form.control,
        name: "selectedTeam",
    });
    const selectedModel = useWatch({
        control: form.control,
        name: "selectedModel",
    });

    const showChecklistTab = true;


    const [addedStakeholders, setAddedStakeholders] = useState([]);

    // Stakeholder dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [stakeholderName, setStakeholderName] = useState('');
    const [stakeholderEmail, setStakeholderEmail] = useState('');
    const [stakeholderRole, setStakeholderRole] = useState('');
    const [stakeholderSearchResults, setStakeholderSearchResults] = useState([]);
    const [isStakeholderSearching, setIsStakeholderSearching] = useState(false);
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
            setAiProductQuestionsData(consolidatedData.ai_product_questions ?? []);
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
        const normalized = roleNames
            .filter(name => {
                const label = name.trim().toLowerCase();
                if (seen.has(label)) return false;
                seen.add(label);
                return true;
            })
            .map(name => ({ value: name, label: name }));
        if (!normalized.some((role) => role.value === 'Primary Contact')) {
            normalized.unshift({ value: 'Primary Contact', label: 'Primary Contact' });
        }
        return normalized;
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

    const checklistQuestions = useMemo<ChecklistQuestion[]>(() => {
        if (!Array.isArray(aiProductQuestionsData) || aiProductQuestionsData.length === 0) {
            return [];
        }

        const parseOptions = (raw?: string) => {
            if (!raw) return [];
            return raw
                .split(",")
                .map((option) => option.trim())
                .filter(Boolean)
                .map((option) => ({ value: option, label: option }));
        };

        const toOrder = (value: number | string) => {
            const numeric = Number(value);
            return Number.isFinite(numeric) ? numeric : Number.MAX_SAFE_INTEGER;
        };

        return aiProductQuestionsData
            .map((question) => {
                const text = String(question.question || "").trim();
                if (!text) return null;

                const rawType = String(question.questionType || "").toLowerCase();
                const isYesNo = rawType.includes("yes") && rawType.includes("no");
                const isChoice = rawType.includes("choice") || (!!question.responseValue && !isYesNo);

                return {
                    id: question.id ?? question.ID ?? text,
                    question: text,
                    kind: isYesNo ? "yesno" : "choice",
                    options: isChoice ? parseOptions(question.responseValue) : [],
                    isMulti: isChoice && text.toLowerCase().includes("select all"),
                };
            })
            .filter(Boolean)
            .sort((a, b) => toOrder(a.id) - toOrder(b.id));
    }, [aiProductQuestionsData]);

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

    useEffect(() => {
        if (stakeholderEmail) {
            setStakeholderSearchResults([]);
            setIsStakeholderSearching(false);
            return;
        }

        const searchTerm = stakeholderName.trim();
        if (searchTerm.length < 2) {
            setStakeholderSearchResults([]);
            setIsStakeholderSearching(false);
            return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(async () => {
            try {
                setIsStakeholderSearching(true);
                const account = instance.getActiveAccount() ?? accounts[0];
                if (!account) {
                    setStakeholderSearchResults([]);
                    return;
                }

                const tokenResponse = await instance.acquireTokenSilent({
                    ...getLoginRequest(),
                    account,
                });

                const escaped = searchTerm.replace(/'/g, "''");
                const filter = `startswith(displayName,'${escaped}') or startswith(mail,'${escaped}') or startswith(userPrincipalName,'${escaped}')`;
                const url = `https://graph.microsoft.com/v1.0/users?$filter=${encodeURIComponent(filter)}&$select=id,displayName,mail,userPrincipalName&$top=8`;
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.accessToken}`,
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    setStakeholderSearchResults([]);
                    return;
                }

                const data = await response.json();
                setStakeholderSearchResults(data.value ?? []);
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                console.error("User search failed", error);
                setStakeholderSearchResults([]);
            } finally {
                setIsStakeholderSearching(false);
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [stakeholderName, stakeholderEmail, instance, accounts]);

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
                const primaryStakeholder = addedStakeholders.find(
                    (stakeholder) => stakeholder.role === 'Primary Contact'
                );
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
                    PrimaryContact:
                        values.primaryContact ||
                        primaryStakeholder?.email ||
                        primaryStakeholder?.name ||
                        primaryContactOptions[0]?.value ||
                        '',
                    CreatedBy: accounts[0]?.username || accounts[0]?.name || 'Unknown',
                    ESEResourcesNeeded: values.eseResourceValue === 'Yes',
                    Phase: 'Idea', // Default phase
                    Status: 'Draft' // Default status
                };

                // Create use case
                const createdUseCase = await createUseCase(useCaseData);
                const useCaseId = createdUseCase.ID;

                const stakeholderRequests = addedStakeholders.map((stakeholder) =>
                    createStakeholder(useCaseId, {
                        Stakeholder: stakeholder.name,
                        Role: stakeholder.role,
                        UseCasesID: useCaseId,
                        BusinessUnit: values.selectedBusinessUnit,
                        UseCaseTitle: values.useCaseTitle
                    })
                );

                const planRequest = createPlan(useCaseId, {
                    StartDate: startDate ? format(startDate, 'dd-MM-yyyy') : '',
                    EndDate: endDate ? format(endDate, 'dd-MM-yyyy') : '',
                    UseCasesID: useCaseId,
                    UseCasePhase: 'Idea'
                });

                await Promise.all([planRequest, ...stakeholderRequests]);

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


    const handleUpdateStakeholder = useCallback(() => {
        if (stakeholderName && stakeholderRole) {
            if (editingIndex !== null) {
                // Update existing stakeholder
                setAddedStakeholders(prev => prev.map((stakeholder, idx) =>
                    idx === editingIndex
                        ? { ...stakeholder, name: stakeholderName, role: stakeholderRole, email: stakeholderEmail }
                        : stakeholder
                ));
                toast.success('Stakeholder updated successfully');
            } else {
                // Add new stakeholder to the list
                setAddedStakeholders(prev => [...prev, {
                    name: stakeholderName,
                    role: stakeholderRole,
                    email: stakeholderEmail
                }]);
                toast.success('Stakeholder added successfully');
            }

            if (stakeholderRole === 'Primary Contact') {
                form.setValue('primaryContact', stakeholderEmail || stakeholderName);
            }

            setIsDialogOpen(false);
            setStakeholderName('');
            setStakeholderEmail('');
            setStakeholderRole('');
            setStakeholderSearchResults([]);
            setIsStakeholderSearching(false);
            setEditingIndex(null);
        }
    }, [stakeholderName, stakeholderRole, editingIndex, stakeholderEmail, form]);

    const handleEditStakeholder = useCallback((index: number) => {
        const stakeholder = addedStakeholders[index];
        setStakeholderName(stakeholder.name);
        setStakeholderRole(stakeholder.role);
        setStakeholderEmail(stakeholder.email ?? '');
        setStakeholderSearchResults([]);
        setIsStakeholderSearching(false);
        setEditingIndex(index);
        setIsDialogOpen(true);
    }, [addedStakeholders]);

    const handleRemoveStakeholder = useCallback((index: number) => {
        setAddedStakeholders(prev => prev.filter((_, idx) => idx !== index));
        toast.success('Stakeholder removed successfully');
    }, []);

    const handleDialogClose = useCallback(() => {
        setIsDialogOpen(false);
        setStakeholderName('');
        setStakeholderEmail('');
        setStakeholderRole('');
        setStakeholderSearchResults([]);
        setIsStakeholderSearching(false);
        setEditingIndex(null);
    }, []);

    return (
        <div ref={formContainerRef} className="flex flex-1 flex-col gap-6 p-6 w-full">

            <div className="flex justify-center w-full bg-gray-50 pb-4 pt-4 border-b border-gray-100">
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

            {/* Submit error message */}
            {submitError && (
                <div className="error-message">
                    <p>{submitError}</p>
                </div>
            )}

            {!isLoading && (
                <Form {...form}>
                    <div className="flex justify-center w-full">
                        <div className="flex flex-1 flex-col gap-6 mx-auto max-w-7xl w-full px-4">
                            {currentStep === 1 && (
                                <UseCaseInfoSection
                                    form={form}
                                    aiThemes={aiThemes}
                                    personas={personas}
                                    vendors={vendors}
                                    models={models}
                                    businessUnits={businessUnits}
                                    teams={teams}
                                    subTeams={subTeams}
                                    selectedVendor={selectedVendor}
                                    selectedBusinessUnit={selectedBusinessUnit}
                                    selectedTeam={selectedTeam}
                                    aiCardRef={aiCardRef}
                                />
                            )}

                            {currentStep === 2 && showChecklistTab && (
                                <ChecklistSection
                                    form={form}
                                    questions={checklistQuestions}
                                    selectedModel={selectedModel}
                                    containerRef={formContainerRef}
                                />
                            )}

                            {currentStep === 3 && (
                                <StakeholdersPlanSection
                                    championsData={championsData}
                                    addedStakeholders={addedStakeholders}
                                    onAddStakeholder={() => setIsDialogOpen(true)}
                                    onEditStakeholder={handleEditStakeholder}
                                    onRemoveStakeholder={handleRemoveStakeholder}
                                    startDate={startDate}
                                    endDate={endDate}
                                    diagnoseStartDate={diagnoseStartDate}
                                    diagnoseEndDate={diagnoseEndDate}
                                    designStartDate={designStartDate}
                                    designEndDate={designEndDate}
                                    implementedStartDate={implementedStartDate}
                                    implementedEndDate={implementedEndDate}
                                    onOpenDateDialog={handleOpenDateDialog}
                                />
                            )}
                            {currentStep === 4 && (
                                <MetricsSection
                                    metrics={metrics}
                                    table={addMetricsTable}
                                    onAddMetric={handleAddMetric}
                                    onSaveMetrics={handleSubmitMetrics}
                                    canSave={isMetricsFormValid}
                                />
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
                            <div className="col-span-3 space-y-2">
                                <Input
                                    id="name"
                                    value={stakeholderName}
                                    onChange={(e) => {
                                        setStakeholderName(e.target.value);
                                        setStakeholderEmail('');
                                    }}
                                    placeholder="Search for a user"
                                />
                                {stakeholderName.trim().length >= 2 && !stakeholderEmail && (
                                    <div
                                        className="rounded-md border bg-white shadow-sm max-h-40 overflow-y-auto"
                                        role="listbox"
                                        aria-label="Stakeholder search results"
                                    >
                                        {isStakeholderSearching && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                Searching...
                                            </div>
                                        )}
                                        {!isStakeholderSearching && stakeholderSearchResults.length === 0 && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                No users found.
                                            </div>
                                        )}
                                        {stakeholderSearchResults.map((user) => {
                                            const label = user.displayName || user.userPrincipalName || user.mail;
                                            const email = user.mail || user.userPrincipalName || '';
                                            return (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                                                    onClick={() => {
                                                        setStakeholderName(label || '');
                                                        setStakeholderEmail(email);
                                                        setStakeholderSearchResults([]);
                                                    }}
                                                    role="option"
                                                    aria-selected={stakeholderEmail === email}
                                                >
                                                    <div className="font-medium text-gray-900">{label}</div>
                                                    {email && <div className="text-xs text-gray-500">{email}</div>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="stakeholder-role" className="text-right text-sm font-medium">
                                Role
                            </label>
                            <Select value={stakeholderRole} onValueChange={setStakeholderRole}>
                                <SelectTrigger id="stakeholder-role" className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent position="popper" side="bottom" align="start" alignOffset={180} sideOffset={-120}>
                                    {roles.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
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
