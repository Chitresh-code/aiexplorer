// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from '@/lib/router';
import { useMsal } from '@azure/msal-react';
import { X, Loader2, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import {
    getAIModels,
    getBusinessStructure,
    getRoles,
    getDropdownData,
    getAllVendors,
    getVendorsFromData,
    getAllVendorsFromAllVendorsData,
    getModelsForVendor,
    getBusinessUnitsFromData,
    getTeamsForBusinessUnit,
    getSubTeamsForTeam,
    getRolesFromData,
    getChampionsForBusinessUnit,
    getAllChampionNames,
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
} from "@/components/ui/popover"
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

// Combobox component definition
const Combobox = ({
    value,
    onChange,
    options,
    placeholder = "Select option",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    disabled = false,
    className,
    align = "center",
}) => {
    const [open, setOpen] = useState(false)

    const Trigger = (
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between form-select min-w-0 h-auto py-1.5", className, !value && "text-muted-foreground")}
            disabled={disabled}
        >
            <span className="truncate mr-2">
                {value
                    ? options.find((option) => option.value === value)?.label || value
                    : placeholder}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
    );

    return (
        <div className="relative w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    {Trigger}
                </PopoverTrigger>
                <PopoverContent
                    className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)]"
                    align={align}
                    sideOffset={4}
                >
                    <Command className="w-full">
                        <CommandInput placeholder={searchPlaceholder} className="h-9" />
                        <CommandList>
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => {
                                            onChange(option.value)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

// MultiCombobox component definition
const MultiCombobox = ({
    value,
    onChange,
    options,
    placeholder = "Select options",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    disabled = false,
    className,
    align = "center",
}) => {
    const [open, setOpen] = useState(false)

    // Ensure value is always an array
    const safeValue = Array.isArray(value) ? value : []

    const handleSelect = (optionValue) => {
        const newValue = safeValue.includes(optionValue)
            ? safeValue.filter(v => v !== optionValue)
            : [...safeValue, optionValue]
        onChange(newValue)
    }

    const handleRemove = (optionValue) => {
        onChange(safeValue.filter(v => v !== optionValue))
    }

    const Trigger = (
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between form-select min-w-0 h-auto py-1.5", className, !safeValue.length && "text-muted-foreground")}
            disabled={disabled}
        >
            <span className="truncate mr-2">
                {safeValue.length > 0 ? `${safeValue.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
    );

    return (
        <div className="space-y-2">
            {safeValue.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {safeValue.map((val) => {
                        const option = options.find(opt => opt.value === val);
                        return (
                            <Badge key={val} variant="secondary" className="text-xs">
                                {option?.label || val}
                                <button
                                    type="button"
                                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(val);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}
            <div className="relative w-full">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        {Trigger}
                    </PopoverTrigger>
                    <PopoverContent
                        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)]"
                        align={align}
                        sideOffset={4}
                    >
                        <Command className="w-full">
                            <CommandInput placeholder={searchPlaceholder} className="h-9" />
                            <CommandList>
                                <CommandEmpty>{emptyText}</CommandEmpty>
                                <CommandGroup>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.label}
                                            onSelect={() => handleSelect(option.value)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    safeValue.includes(option.value) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

const formSchema = z.object({
    useCaseTitle: z.string().min(1, "Use Case Title is required"),
    headline: z.string().min(1, "Headline is required"),
    opportunity: z.string().min(1, "Opportunity is required"),
    evidence: z.string().min(1, "Evidence is required"),
    businessValue: z.string().min(1, "Business Value is required"),
    selectedAITheme: z.array(z.string()).min(1, "AI Theme is required"),
    selectedPersona: z.array(z.string()).min(1, "Target Persona is required"),
    selectedVendor: z.string().min(1, "Vendor Name is required"),
    selectedModel: z.string().min(1, "Model Name is required"),
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
    intendedUserLocation: z.string().optional(),
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
    // Removed manual eseResourceValue state, using form watch instead

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
            intendedUserLocation: "",
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

    const showChecklistTab = useMemo(() => {
        if (!selectedVendor || !selectedModel) return false;

        const isGoogle = selectedVendor.toLowerCase() === 'google';
        const isOpenAI = selectedVendor === 'Open AI' || selectedVendor === 'OpenAI';

        if (isGoogle && (selectedModel === 'Agent Space' || selectedModel === 'Custom Vertex AI Agent')) {
            return true;
        }
        if (isOpenAI && selectedModel === 'Custom ChatGPT Agent') {
            return true;
        }
        return false;
    }, [selectedVendor, selectedModel]);

    // Stakeholder form values
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStakeholder, setSelectedStakeholder] = useState('');
    const [addedStakeholders, setAddedStakeholders] = useState([]);

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

    // Fetch all data on mount
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                setLoadingError(null);

                const [aiModels, allVendors, businessStructure, roles, dropdowns, championNames] = await Promise.all([
                    getAIModels(),
                    getAllVendors(),
                    getBusinessStructure(),
                    getRoles(),
                    getDropdownData(),
                    getAllChampionNames()
                ]);

                setAiModelsData(aiModels);
                setAllVendorsData(allVendors);
                setBusinessStructureData(businessStructure);
                setRolesData(roles);
                setDropdownData(dropdowns);
                setChampionNames(championNames);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoadingError('Failed to load form data. Please refresh the page.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
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
        } else {
            // Submit action (currentStep === 3)
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
        if (currentStep === 3) {
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

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            {/* KPI Dashboard Section */}
            <div className="w-full">
                <SectionCards />
            </div>

            <div className="flex justify-center w-full">
                <div className="flex flex-1 flex-col mx-auto max-w-7xl w-full px-4">
                    <Tabs value={currentStep.toString()} onValueChange={(val) => setCurrentStep(parseInt(val))} className="w-full">
                        <div className="flex justify-start">
                            <TabsList className={cn("grid w-full max-w-[650px]", showChecklistTab ? "grid-cols-3" : "grid-cols-2")}>
                                <TabsTrigger value="1">Use Case Information</TabsTrigger>
                                {showChecklistTab && <TabsTrigger value="2">AI Product Checklist</TabsTrigger>}
                                <TabsTrigger value="3">Stakeholders & Launch Plan</TabsTrigger>
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
                                    <Card className="shadow-sm">
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
                                                                <MultiCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={aiThemes}
                                                                    placeholder="Select AI Themes"
                                                                    searchPlaceholder="Search themes..."
                                                                    align="start"
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
                                                                <MultiCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={personas}
                                                                    placeholder="Select Target Personas"
                                                                    searchPlaceholder="Search personas..."
                                                                    align="end"
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
                                                                <Combobox
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
                                                                <Combobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={models}
                                                                    disabled={!selectedVendor}
                                                                    placeholder="No Product Identified"
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
                                                                <Combobox
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
                                                                <Combobox
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
                                                                <Combobox
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
                                                                    <DropdownMenuContent className="w-full p-0">
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
                                                    Please provide accurate responses for your {selectedModel} implementation.
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
                                                                <Combobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    options={[
                                                                        { value: "AMER", label: "AMER" },
                                                                        { value: "APAC", label: "APAC" },
                                                                        { value: "EMEA", label: "EMEA" },
                                                                        { value: "ANZ", label: "ANZ" },
                                                                        { value: "All Regions", label: "All Regions" },
                                                                    ]}
                                                                    placeholder="Select location"
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
                                <div className="space-y-10">
                                    <div className="stakeholders-container">
                                        <div className="stakeholder-form">
                                            <div className="form-group">
                                                <FieldLabel className="mb-2">Role</FieldLabel>
                                                <Combobox
                                                    value={selectedRole}
                                                    onChange={setSelectedRole}
                                                    options={roles}
                                                    placeholder="Select a Role"
                                                    searchPlaceholder="Search roles..."
                                                />
                                            </div>
                                            <div className="form-group">
                                                <FieldLabel className="mb-2">Stakeholder</FieldLabel>
                                                <button
                                                    className="add-stakeholder-btn"
                                                    onClick={handleAddStakeholder}
                                                    disabled={!selectedRole || !selectedStakeholder}
                                                >
                                                    + Add Stakeholder
                                                </button>
                                                <Combobox
                                                    value={selectedStakeholder}
                                                    onChange={setSelectedStakeholder}
                                                    options={championNames.map(name => ({ value: name, label: name }))}
                                                    placeholder="Search for people's email or name"
                                                    searchPlaceholder="Search people..."
                                                />
                                                <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                                                    Please add at least one stakeholder.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="stakeholder-list">
                                            {championsData.length > 0 && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    {championsData.map((champion, idx) => (
                                                        <div key={idx} style={{
                                                            padding: '0.5rem',
                                                            marginBottom: '0.25rem',
                                                            backgroundColor: '#f8f9fa',
                                                            borderRadius: '4px',
                                                            border: '1px solid #e9ecef'
                                                        }}>
                                                            <div>{champion.UKrewer}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>Champion</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {addedStakeholders.length > 0 && (
                                                <div style={{ marginTop: '1rem' }}>
                                                    {addedStakeholders.map((stakeholder, idx) => (
                                                        <div key={idx} style={{
                                                            padding: '0.5rem',
                                                            marginBottom: '0.25rem',
                                                            backgroundColor: '#e8f5e8',
                                                            borderRadius: '4px',
                                                            border: '1px solid #c3e6c3'
                                                        }}>
                                                            <div>{stakeholder.name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>{stakeholder.role}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="launch-plan-container pt-6 border-t">
                                        <FieldLabel className="mb-4">Use Case Launch Plan</FieldLabel>
                                        <p className="text-sm text-muted-foreground mb-4">Please add both start and end date to submit.</p>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[200px]">Phase</TableHead>
                                                        <TableHead>Start Date</TableHead>
                                                        <TableHead>End Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell className="font-medium">
                                                            <Input type="text" value="Idea" readOnly className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !startDate && "text-muted-foreground"
                                                                )}
                                                                onClick={() => handleOpenDateDialog('Idea')}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {startDate ? format(startDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !endDate && "text-muted-foreground"
                                                                )}
                                                                onClick={() => handleOpenDateDialog('Idea')}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {endDate ? format(endDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="font-medium">
                                                            <Input type="text" value="Diagnose" readOnly className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !diagnoseStartDate && "text-muted-foreground"
                                                                )}
                                                                onClick={() => handleOpenDateDialog('Diagnose')}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {diagnoseStartDate ? format(diagnoseStartDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !diagnoseEndDate && "text-muted-foreground"
                                                                )}
                                                                onClick={() => handleOpenDateDialog('Diagnose')}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {diagnoseEndDate ? format(diagnoseEndDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="font-medium">
                                                            <Input type="text" value="Design" readOnly className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !designStartDate && "text-muted-foreground"
                                                                )}
                                                                onClick={() => handleOpenDateDialog('Design')}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {designStartDate ? format(designStartDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !designEndDate && "text-muted-foreground"
                                                                )}
                                                                onClick={() => handleOpenDateDialog('Design')}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {designEndDate ? format(designEndDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="font-medium">
                                                            <Input type="text" value="Implemented" readOnly className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !implementedStartDate && "text-muted-foreground"
                                                                )}
                                                                onClick={() => handleOpenDateDialog('Implemented')}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {implementedStartDate ? format(implementedStartDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !implementedEndDate && "text-muted-foreground"
                                                                )}
                                                                onClick={() => handleOpenDateDialog('Implemented')}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {implementedEndDate ? format(implementedEndDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Form>
            )}

            <div className="form-actions">
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
                        currentStep === 3 ? 'Submit' : 'Next'
                    )}
                </Button>
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
        </div>
    );
};

export default SubmitUseCase;
