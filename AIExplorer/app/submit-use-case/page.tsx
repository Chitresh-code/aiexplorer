// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "@/lib/router";
import { useMsal } from "@azure/msal-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getLoginRequest } from "@/lib/msal";
import {
    getBusinessUnitsFromData,
    getTeamsForBusinessUnit,
    getSubTeamsForTeam,
    getStakeholdersForBusinessUnitId,
    getMappingBusinessUnits,
    getMappingRoles,
    getMappingAiProductQuestions,
    getMappingPhases,
    getMappingMetricCategories,
    getMappingUnitOfMeasure,
    createUseCase
} from "@/lib/submit-use-case";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChecklistSection } from "@/components/submit-use-case/ChecklistSection";
import { MetricsSection } from "@/components/submit-use-case/MetricsSection";
import { StakeholdersPlanSection } from "@/components/submit-use-case/StakeholdersPlanSection";
import { UseCaseInfoSection } from "@/components/submit-use-case/UseCaseInfoSection";

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


type ChecklistQuestion = {
    id: number | string;
    question: string;
    kind: "yesno" | "choice";
    options: { value: string; label: string }[];
    isMulti: boolean;
    responseKey: string;
};

const formSchema = z.object({
    useCaseTitle: z.string().min(1, "Use Case Title is required"),
    headline: z.string().min(1, "Headline is required"),
    opportunity: z.string().min(1, "Opportunity is required"),
    businessValue: z.string().min(1, "Business Value is required"),
    selectedBusinessUnit: z.string().min(1, "Business Unit is required"),
    selectedTeam: z.string().min(1, "Team Name is required"),
    primaryContact: z.string().optional(),
    selectedSubTeam: z.string().optional(),
    eseResourceValue: z.string().min(1, "Required"),
    infoLink: z.string().optional(),
    checklistResponses: z.record(z.any()).optional(),
})

const normalizeStakeholderRole = (role: string) => {
    const trimmed = String(role ?? "").trim();
    if (!trimmed) return "";
    if (trimmed.toLowerCase() === "primary contact") return "Owner";
    return trimmed;
};

const SubmitUseCase = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { accounts, instance } = useMsal();
    const [currentStep, setCurrentStep] = useState(location.state?.initialStep || 1);
    const formContainerRef = useRef(null);
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
    const [aiStatus, setAiStatus] = useState<"idle" | "loading">("idle");
    const [aiGeneratedValues, setAiGeneratedValues] = useState<Record<string, string>>({});
    const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
    const [checklistNeedsAttention, setChecklistNeedsAttention] = useState(false);

    // Raw data from APIs
    const [businessStructureData, setBusinessStructureData] = useState(null);
    const [rolesData, setRolesData] = useState([]);
    const [aiProductQuestionsData, setAiProductQuestionsData] = useState([]);
    const [stakeholdersData, setStakeholdersData] = useState([]);
    const [isStakeholdersLoading, setIsStakeholdersLoading] = useState(false);
    const [phasesData, setPhasesData] = useState([]);
    const [isPhasesLoading, setIsPhasesLoading] = useState(false);
    const [isTimelineGenerating, setIsTimelineGenerating] = useState(false);
    const [aiGeneratedPhases, setAiGeneratedPhases] = useState<Record<string, boolean>>({});
    const [timelineSuggestions, setTimelineSuggestions] = useState<
        Record<string, { startDate: Date; endDate: Date }>
    >({});
    const [prefetchTimeline, setPrefetchTimeline] = useState(false);
    const [prefetchMetrics, setPrefetchMetrics] = useState(false);
    const [metricCategoriesData, setMetricCategoriesData] = useState([]);
    const [unitOfMeasureData, setUnitOfMeasureData] = useState([]);

    // Form definition
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            useCaseTitle: "",
            headline: "",
            opportunity: "",
            businessValue: "",
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

    const selectedBusinessUnit = useWatch({
        control: form.control,
        name: "selectedBusinessUnit",
    });
    const selectedTeam = useWatch({
        control: form.control,
        name: "selectedTeam",
    });
    const generatedWatchedValues = useWatch({
        control: form.control,
        name: ["useCaseTitle", "headline", "opportunity", "businessValue"],
    });
    const step1RequiredValues = useWatch({
        control: form.control,
        name: [
            "useCaseTitle",
            "headline",
            "opportunity",
            "businessValue",
            "selectedBusinessUnit",
            "selectedTeam",
            "eseResourceValue",
        ],
    });
    const checklistResponses = useWatch({
        control: form.control,
        name: "checklistResponses",
    });

    const showChecklistTab = true;

    const aiRequestInFlightRef = useRef(false);
    const timelineRequestInFlightRef = useRef(false);
    const previousFieldValuesRef = useRef<string[]>([]);

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

    const phaseKey = (phase: string) => phase.trim().toLowerCase();
    const phaseDateState: Record<string, { start?: Date; end?: Date; setStart: (date?: Date) => void; setEnd: (date?: Date) => void }> = {
        idea: { start: startDate, end: endDate, setStart: setStartDate, setEnd: setEndDate },
        diagnose: { start: diagnoseStartDate, end: diagnoseEndDate, setStart: setDiagnoseStartDate, setEnd: setDiagnoseEndDate },
        design: { start: designStartDate, end: designEndDate, setStart: setDesignStartDate, setEnd: setDesignEndDate },
        implemented: { start: implementedStartDate, end: implementedEndDate, setStart: setImplementedStartDate, setEnd: setImplementedEndDate },
    };

    const handleOpenDateDialog = (phase) => {
        setEditingPhase(phase);
        const state = phaseDateState[phaseKey(phase)];
        if (state) {
            setTempStartDate(state.start);
            setTempEndDate(state.end);
        } else {
            setTempStartDate(undefined);
            setTempEndDate(undefined);
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
        if (!editingPhase) return;
        const state = phaseDateState[phaseKey(editingPhase)];
        if (!state) return;

        if (tempStartDate && tempEndDate && tempEndDate <= tempStartDate) {
            toast.error("End date must be after the start date.");
            return;
        }

        const fallbackOrder = ["Idea", "Diagnose", "Design", "Implemented"];
        const phaseOrder = phasesData.length
            ? phasesData
                .slice()
                .sort((a, b) => {
                    const aId = Number(a.id);
                    const bId = Number(b.id);
                    if (Number.isFinite(aId) && Number.isFinite(bId) && aId !== bId) {
                        return aId - bId;
                    }
                    return String(a.name ?? "").localeCompare(String(b.name ?? ""));
                })
                .map((phase) => String(phase.name ?? "").trim())
                .filter(Boolean)
            : fallbackOrder;

        const currentIndex = phaseOrder.findIndex(
            (name) => phaseKey(name) === phaseKey(editingPhase),
        );
        if (currentIndex > 0 && tempStartDate) {
            const prevPhaseName = phaseOrder[currentIndex - 1];
            const prevState = phaseDateState[phaseKey(prevPhaseName)];
            const prevEndDate = prevState?.end;
            if (prevEndDate && tempStartDate < prevEndDate) {
                toast.error(
                    `Start date must be on or after the previous phase end date (${format(prevEndDate, "dd-MM-yyyy")}).`,
                );
                return;
            }
        }

        state.setStart(tempStartDate);
        state.setEnd(tempEndDate);
        const phaseKeyName = phaseKey(editingPhase);
        setAiGeneratedPhases((prev) => {
            if (!prev[phaseKeyName]) return prev;
            const next = { ...prev };
            delete next[phaseKeyName];
            return next;
        });
        setTimelineSuggestions((prev) => {
            if (!prev[phaseKeyName]) return prev;
            const next = { ...prev };
            delete next[phaseKeyName];
            return next;
        });
        toast.success("Dates updated successfully");
        handleDateDialogClose();
    };

    // Metrics State & Logic
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [metricSuggestions, setMetricSuggestions] = useState<Omit<Metric, "id">[]>([]);
    const [isMetricSuggestionsLoading, setIsMetricSuggestionsLoading] = useState(false);
    const [aiGeneratedMetricIds, setAiGeneratedMetricIds] = useState<Record<number, boolean>>({});
    const metricSuggestionsInFlightRef = useRef(false);
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

    const handleDeleteMetric = useCallback((id: number | string) => {
        setMetrics(prev => prev.filter(metric => String(metric.id) !== String(id)));
        setAiGeneratedMetricIds((prev) => {
            const next = { ...prev };
            const numericId = Number(id);
            if (Number.isFinite(numericId)) {
                delete next[numericId];
            }
            return next;
        });
        toast.success('Metric deleted successfully');
    }, []);

    const handleInputChange = useCallback((id: number | string, field: string, value: string) => {
        setMetrics((prev) => {
            const next = prev.map((metric) => {
                if (String(metric.id) === String(id)) {
                    return { ...metric, [field]: value };
                }
                return metric;
            });
            return next;
        });
    }, []);

    const hasMetricValue = (value: unknown) => String(value ?? "").trim().length > 0;

    const isMetricsFormValid = metrics.length > 0 && metrics.every((metric) => {
        if (
            !hasMetricValue(metric.primarySuccessValue) ||
            !hasMetricValue(metric.parcsCategory) ||
            !hasMetricValue(metric.unitOfMeasurement) ||
            !hasMetricValue(metric.baselineValue) ||
            !hasMetricValue(metric.baselineDate) ||
            !hasMetricValue(metric.targetValue) ||
            !hasMetricValue(metric.targetDate)
        ) {
            return false;
        }
        const baseline = new Date(`${metric.baselineDate}T00:00:00`);
        const target = new Date(`${metric.targetDate}T00:00:00`);
        if (Number.isNaN(baseline.getTime()) || Number.isNaN(target.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return target > baseline && target > today;
    });


    const handleSubmitMetricDates = () => {
        if (editingMetricId !== null && tempBaselineDate && tempTargetDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (tempTargetDate <= tempBaselineDate) {
                toast.error('Target date must be after the baseline date.');
                return;
            }
            if (tempTargetDate <= today) {
                toast.error('Target date must be after today.');
                return;
            }
            handleInputChange(editingMetricId, 'baselineDate', format(tempBaselineDate, "yyyy-MM-dd"));
            handleInputChange(editingMetricId, 'targetDate', format(tempTargetDate, "yyyy-MM-dd"));
            toast.success('Dates Submitted Successfully');
            setIsMetricDateDialogOpen(false);
            setEditingMetricId(null);
            setTempBaselineDate(undefined);
            setTempTargetDate(undefined);
        }
    };

    const handleAcceptMetricSuggestions = useCallback(() => {
        if (metricSuggestions.length === 0) return;
        const baseId = Date.now();
        const nextMetrics = metricSuggestions.map((item, index) => ({
            id: baseId + index,
            ...item,
            isSubmitted: false,
        }));
        setMetrics((prev) => (prev.length > 0 ? [...prev, ...nextMetrics] : nextMetrics));
        setAiGeneratedMetricIds((prev) => {
            const next = { ...prev };
            nextMetrics.forEach((metric) => {
                next[metric.id] = true;
            });
            return next;
        });
        setMetricSuggestions([]);
    }, [metricSuggestions]);

    const handleRejectMetricSuggestions = useCallback(() => {
        setMetricSuggestions([]);
    }, []);

    const handleOpenMetricDateDialog = useCallback((metric: Metric) => {
        setEditingMetricId(metric.id);
        setTempBaselineDate(
            metric.baselineDate ? new Date(`${metric.baselineDate}T00:00:00`) : undefined,
        );
        setTempTargetDate(
            metric.targetDate ? new Date(`${metric.targetDate}T00:00:00`) : undefined,
        );
        setIsMetricDateDialogOpen(true);
    }, []);

    const metricCategories = useMemo(() => {
        if (!Array.isArray(metricCategoriesData)) return [];
        const names = metricCategoriesData
            .map((item) => String(item.category ?? item.name ?? "").trim())
            .filter(Boolean);
        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    }, [metricCategoriesData]);

    const unitOfMeasurementOptions = useMemo(() => {
        if (!Array.isArray(unitOfMeasureData)) return [];
        const names = unitOfMeasureData
            .map((item) => String(item.name ?? item.unitOfMeasure ?? "").trim())
            .filter(Boolean);
        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    }, [unitOfMeasureData]);

    const metricCategoryIdByName = useMemo(() => {
        const map = new Map<string, number>();
        if (!Array.isArray(metricCategoriesData)) return map;
        metricCategoriesData.forEach((item) => {
            const name = String(item.category ?? item.name ?? "").trim();
            const id = Number(item.id);
            if (name && Number.isFinite(id)) {
                map.set(name.toLowerCase(), id);
            }
        });
        return map;
    }, [metricCategoriesData]);

    const unitOfMeasureIdByName = useMemo(() => {
        const map = new Map<string, number>();
        if (!Array.isArray(unitOfMeasureData)) return map;
        unitOfMeasureData.forEach((item) => {
            const name = String(item.name ?? item.unitOfMeasure ?? "").trim();
            const id = Number(item.id);
            if (name && Number.isFinite(id)) {
                map.set(name.toLowerCase(), id);
            }
        });
        return map;
    }, [unitOfMeasureData]);

    const roleIdByName = useMemo(() => {
        const map = new Map<string, number>();
        if (!Array.isArray(rolesData)) return map;
        rolesData.forEach((role) => {
            const name = String(role.name ?? "").trim();
            const id = Number(role.id);
            if (name && Number.isFinite(id)) {
                map.set(name.toLowerCase(), id);
            }
        });
        return map;
    }, [rolesData]);

    useEffect(() => {
        let isMounted = true;
        const generateMetricSuggestions = async () => {
            if (currentStep !== 4 && !prefetchMetrics) return;
            if (metricSuggestionsInFlightRef.current) return;
            if (metricSuggestions.length > 0) return;
            if (metrics.length > 0) return;
            if (metricCategories.length === 0 || unitOfMeasurementOptions.length === 0) return;

            const businessValue = form.getValues("businessValue");
            if (!businessValue || !businessValue.trim()) return;

            metricSuggestionsInFlightRef.current = true;
            setIsMetricSuggestionsLoading(true);

            try {
                const now = new Date();
                const response = await fetch("/api/ai/suggestions/metric", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        currentDate: now.toISOString().slice(0, 10),
                        businessValue,
                        fields: [
                            "primarySuccessValue",
                            "parcsCategory",
                            "unitOfMeasurement",
                            "baselineValue",
                            "baselineDate",
                            "targetValue",
                            "targetDate",
                        ],
                        options: {
                            parcsCategories: metricCategories,
                            unitOfMeasurement: unitOfMeasurementOptions,
                        },
                    }),
                });
                const data = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(data?.message || "Metric suggestions failed");
                }

                const normalizeNumber = (value: string) => {
                    const cleaned = value.replace(/,/g, "");
                    const match = cleaned.match(/-?\d+(\.\d+)?/);
                    return match ? match[0] : "";
                };

                const nextSuggestions = (Array.isArray(data?.items) ? data.items : [])
                    .map((item: any) => {
                        const baselineValue = normalizeNumber(String(item?.baselineValue ?? "").trim());
                        const targetValue = normalizeNumber(String(item?.targetValue ?? "").trim());
                        return {
                            primarySuccessValue: String(item?.primarySuccessValue ?? "").trim(),
                            parcsCategory: String(item?.parcsCategory ?? "").trim(),
                            unitOfMeasurement: String(item?.unitOfMeasurement ?? "").trim(),
                            baselineValue,
                            baselineDate: String(item?.baselineDate ?? "").trim(),
                            targetValue,
                            targetDate: String(item?.targetDate ?? "").trim(),
                        };
                    })
                    .filter((item: any) =>
                        item.primarySuccessValue &&
                        item.parcsCategory &&
                        item.unitOfMeasurement &&
                        item.baselineValue &&
                        item.baselineDate &&
                        item.targetValue &&
                        item.targetDate
                    );

                if (isMounted) {
                    setMetricSuggestions(nextSuggestions);
                }
            } catch (error) {
                console.error("Metric suggestions failed", error);
                if (isMounted) {
                    setMetricSuggestions([]);
                }
            } finally {
                metricSuggestionsInFlightRef.current = false;
                if (isMounted) {
                    setIsMetricSuggestionsLoading(false);
                }
            }
        };

        generateMetricSuggestions();

        return () => {
            isMounted = false;
        };
    }, [
        currentStep,
        form,
        metricCategories,
        unitOfMeasurementOptions,
        metricSuggestions.length,
        metrics.length,
        prefetchMetrics,
    ]);


    // Fetch all data on mount with stale-while-revalidate cache
    useEffect(() => {
        let isMounted = true;
        const cacheKey = "submit-use-case-data-v2";
        const cacheTtlMs = 10 * 60 * 1000;
        const uniqueSorted = (values: string[]) =>
            Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));

        const applySubmitUseCaseData = (consolidatedData) => {
            setBusinessStructureData(consolidatedData.business_structure);
            setRolesData(consolidatedData.roles ?? []);
            setAiProductQuestionsData(consolidatedData.ai_product_questions ?? []);
            setMetricCategoriesData(consolidatedData.metric_categories ?? []);
            setUnitOfMeasureData(consolidatedData.unit_of_measure ?? []);
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
                const [
                    businessUnitsResponse,
                    rolesResponse,
                    aiQuestionsResponse,
                    metricCategoriesResponse,
                    unitOfMeasureResponse,
                ] = await Promise.all([
                    getMappingBusinessUnits(),
                    getMappingRoles(),
                    getMappingAiProductQuestions(),
                    getMappingMetricCategories(),
                    getMappingUnitOfMeasure(),
                ]);

                const businessUnitItems = businessUnitsResponse?.items ?? [];
                const roleItems = rolesResponse?.items ?? [];
                const aiQuestionItems = aiQuestionsResponse?.items ?? [];
                const metricCategoryItems = metricCategoriesResponse?.items ?? [];
                const unitOfMeasureItems = unitOfMeasureResponse?.items ?? [];

                const business_units: Record<string, Record<string, string[]>> = {};
                const business_unit_ids: Record<string, number> = {};
                businessUnitItems.forEach((unit) => {
                    const unitName = String(unit.businessUnitName ?? "").trim();
                    if (!unitName) return;
                    const teamMap: Record<string, string[]> = {};
                    const unitId = Number(unit.businessUnitId);
                    if (Number.isFinite(unitId)) {
                        business_unit_ids[unitName] = unitId;
                    }
                    const rawTeams = Array.isArray(unit.teams) ? unit.teams : [];
                    rawTeams.forEach((team) => {
                        const teamName = String(team).trim();
                        if (!teamName) return;
                        teamMap[teamName] = [];
                    });
                    business_units[unitName] = teamMap;
                });

                const roles = roleItems
                    .map((item) => ({
                        id: item.id,
                        name: String(item.name ?? "").trim(),
                        roleType: String(item.roleType ?? "").trim(),
                    }))
                    .filter((role) => role.name.length > 0);

                const consolidatedData = {
                    business_structure: { business_units, business_unit_ids },
                    roles,
                    ai_product_questions: aiQuestionItems,
                    metric_categories: metricCategoryItems,
                    unit_of_measure: unitOfMeasureItems,
                };
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

    const selectedBusinessUnitId = useMemo(() => {
        if (!selectedBusinessUnit) return null;
        const id = businessStructureData?.business_unit_ids?.[selectedBusinessUnit];
        return Number.isFinite(id) ? id : null;
    }, [businessStructureData, selectedBusinessUnit]);

    useEffect(() => {
        let isMounted = true;
        const fetchStakeholders = async () => {
            if (currentStep !== 3) return;
            if (!selectedBusinessUnitId) {
                setStakeholdersData([]);
                return;
            }
            setIsStakeholdersLoading(true);
            try {
                const response = await getStakeholdersForBusinessUnitId(selectedBusinessUnitId);
                if (!isMounted) return;
                const seen = new Set<string>();
                const normalized = (response?.items ?? [])
                    .map((item: any) => {
                        const email = String(item?.email ?? "").trim();
                        const role = String(item?.role ?? "").trim();
                        const roleId = Number(item?.roleId);
                        const businessUnitId = Number(item?.businessUnitId);
                        return {
                            id: Number(item?.id),
                            email,
                            role,
                            roleId: Number.isFinite(roleId) ? roleId : null,
                            businessUnitId: Number.isFinite(businessUnitId) ? businessUnitId : null,
                            businessUnitName: String(item?.businessUnitName ?? "").trim(),
                        };
                    })
                    .filter((item) => item.email)
                    .filter((item) => {
                        const key = `${item.email.toLowerCase()}|${item.roleId ?? item.role}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    })
                    .sort((a, b) => {
                        const roleCompare = a.role.localeCompare(b.role);
                        if (roleCompare !== 0) return roleCompare;
                        return a.email.localeCompare(b.email);
                    });
                setStakeholdersData(normalized);
            } catch (error) {
                console.error('Error fetching stakeholders:', error);
                if (isMounted) {
                    setStakeholdersData([]);
                }
            } finally {
                if (isMounted) {
                    setIsStakeholdersLoading(false);
                }
            }
        };

        fetchStakeholders();

        return () => {
            isMounted = false;
        };
    }, [currentStep, selectedBusinessUnitId]);

    const roles = useMemo(() => {
        if (!Array.isArray(rolesData)) return [];
        const seen = new Set();
        return rolesData
            .filter((role) => String(role.roleType ?? "").trim() === "2")
            .map((role) => String(role.name ?? "").trim())
            .filter((name) => {
                const key = name.toLowerCase();
                if (key === "owner") return false;
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .map((name) => ({ value: name, label: normalizeStakeholderRole(name) }));
    }, [rolesData]);

    const visibleStakeholders = useMemo(() => {
        return stakeholdersData.filter((stakeholder) => {
            const role = String(stakeholder?.role ?? "").trim().toLowerCase();
            return role === "champion";
        });
    }, [stakeholdersData]);

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

    const aiGeneratedFields = useMemo(() => ({
        useCaseTitle: Boolean(aiGeneratedValues.useCaseTitle),
        headline: Boolean(aiGeneratedValues.headline),
        opportunity: Boolean(aiGeneratedValues.opportunity),
        businessValue: Boolean(aiGeneratedValues.businessValue),
    }), [aiGeneratedValues]);

    const buildAiPayload = useCallback(() => {
        const values = form.getValues();
        const formatDate = (date: Date) => date.toISOString().slice(0, 10);
        const now = new Date();
        const earliestTarget = new Date(now);
        earliestTarget.setMonth(earliestTarget.getMonth() + 3);
        const latestTarget = new Date(now);
        latestTarget.setMonth(latestTarget.getMonth() + 6);
        return {
            context: {
                organization: "UKG",
                currentDate: formatDate(now),
                targetDateEarliest: formatDate(earliestTarget),
                targetDateLatest: formatDate(latestTarget),
            },
            form: {
                useCaseTitle: values.useCaseTitle || "",
                headline: values.headline || "",
                opportunity: values.opportunity || "",
                businessValue: values.businessValue || "",
            },
        };
    }, [form]);

    const handleGenerateAi = useCallback(async () => {
        const opportunity = form.getValues("opportunity")?.trim();
        if (!opportunity) {
            form.setError("opportunity", {
                type: "manual",
                message: "Please add an Opportunity description before using Write with AI.",
            });
            toast.error("Please add an Opportunity description before using Write with AI.");
            return;
        }
        if (aiRequestInFlightRef.current) return;

        aiRequestInFlightRef.current = true;
        setAiStatus("loading");

        try {
            const payload = buildAiPayload();
            const response = await fetch("/api/ai/suggestions/usecase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.suggestions) {
                throw new Error(data?.message || "AI suggestions failed");
            }

            const suggestions = data.suggestions ?? {};

            const applyOrSuggest = (
                fieldName: "useCaseTitle" | "headline" | "opportunity" | "businessValue",
                value?: string,
                alwaysSuggest?: boolean,
            ) => {
                if (!value) return;
                const trimmed = value.trim();
                if (!trimmed) return;
                const currentValue = String(form.getValues(fieldName) ?? "").trim();
                if (alwaysSuggest || currentValue.length > 0) {
                    setAiSuggestions((prev) => ({ ...prev, [fieldName]: trimmed }));
                    return;
                }
                form.setValue(fieldName, trimmed, { shouldDirty: true, shouldValidate: true });
                setAiGeneratedValues((prev) => ({ ...prev, [fieldName]: trimmed }));
                setAiSuggestions((prev) => {
                    if (!prev[fieldName]) return prev;
                    const next = { ...prev };
                    delete next[fieldName];
                    return next;
                });
            };

            applyOrSuggest("useCaseTitle", suggestions.useCaseTitle?.value);
            applyOrSuggest("headline", suggestions.headline?.value);
            applyOrSuggest("opportunity", suggestions.opportunity?.value);
            applyOrSuggest("businessValue", suggestions.businessValue?.value);
        } catch (error) {
            console.error("AI suggestions failed", error);
            toast.error("AI suggestions are unavailable right now.");
        } finally {
            aiRequestInFlightRef.current = false;
            setAiStatus("idle");
        }
    }, [form, buildAiPayload]);

    const handleAcceptSuggestion = useCallback((fieldName: string) => {
        const suggestion = aiSuggestions[fieldName];
        if (!suggestion) return;
        form.setValue(fieldName as any, suggestion, { shouldDirty: true, shouldValidate: true });
        setAiGeneratedValues((prev) => ({ ...prev, [fieldName]: suggestion }));
        setAiSuggestions((prev) => {
            const next = { ...prev };
            delete next[fieldName];
            return next;
        });
    }, [aiSuggestions, form]);

    const handleRejectSuggestion = useCallback((fieldName: string) => {
        setAiSuggestions((prev) => {
            if (!prev[fieldName]) return prev;
            const next = { ...prev };
            delete next[fieldName];
            return next;
        });
    }, []);

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
                    responseKey: String(question.id ?? question.ID ?? index)
                        .replace(/[^\w-]/g, "_")
                        .toLowerCase(),
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
    const isStep1Valid =
        Array.isArray(step1RequiredValues) &&
        step1RequiredValues.every(
            (value) => typeof value === "string" && value.trim().length > 0,
        );

    const isStep2Valid = useMemo(() => {
        return addedStakeholders.length > 0 && startDate !== undefined && endDate !== undefined;
    }, [addedStakeholders, startDate, endDate]);

    const hasChecklistAnswers = useMemo(() => {
        if (!checklistResponses || typeof checklistResponses !== "object") return false;
        return Object.values(checklistResponses).some((value) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === "string") return value.trim().length > 0;
            return value !== null && value !== undefined && value !== "";
        });
    }, [checklistResponses]);

    useEffect(() => {
        let isMounted = true;
        const fetchPhases = async () => {
            if (currentStep !== 3 && !prefetchTimeline) return;
            if (phasesData.length > 0) return;
            setIsPhasesLoading(true);
            try {
                const response = await getMappingPhases();
                if (!isMounted) return;
                setPhasesData(response?.items ?? []);
            } catch (error) {
                console.error("Error fetching phase mappings:", error);
                if (isMounted) {
                    setPhasesData([]);
                }
            } finally {
                if (isMounted) {
                    setIsPhasesLoading(false);
                }
            }
        };

        fetchPhases();

        return () => {
            isMounted = false;
        };
    }, [currentStep, phasesData.length, prefetchTimeline]);

    useEffect(() => {
        let isMounted = true;
        const generateTimeline = async () => {
            if (currentStep !== 3 && !prefetchTimeline) return;
            if (phasesData.length === 0) return;
            if (timelineRequestInFlightRef.current) return;
            if (Object.keys(aiGeneratedPhases).length > 0) return;
            if (Object.keys(timelineSuggestions).length > 0) return;

            const [useCaseTitle, headline, opportunity, businessValue] = form.getValues([
                "useCaseTitle",
                "headline",
                "opportunity",
                "businessValue",
            ]);
            if (!useCaseTitle || !headline || !opportunity || !businessValue) return;

            const now = new Date();
            const earliestTarget = new Date(now);
            earliestTarget.setMonth(earliestTarget.getMonth() + 3);
            const latestTarget = new Date(now);
            latestTarget.setMonth(latestTarget.getMonth() + 6);

            const formatDate = (date: Date) => date.toISOString().slice(0, 10);
            const phasesPayload = phasesData
                .slice()
                .sort((a, b) => {
                    const aId = Number(a.id);
                    const bId = Number(b.id);
                    if (Number.isFinite(aId) && Number.isFinite(bId) && aId !== bId) {
                        return aId - bId;
                    }
                    return String(a.name ?? "").localeCompare(String(b.name ?? ""));
                })
                .map((phase) => ({
                    name: String(phase.name ?? "").trim(),
                    stage: String(phase.stage ?? "").trim(),
                }))
                .filter((phase) => phase.name.length > 0);

            if (phasesPayload.length === 0) return;

            timelineRequestInFlightRef.current = true;
            setIsTimelineGenerating(true);

            try {
                const response = await fetch("/api/ai/suggestions/phase", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        context: {
                            currentDate: formatDate(now),
                            targetDateEarliest: formatDate(earliestTarget),
                            targetDateLatest: formatDate(latestTarget),
                        },
                        useCase: { useCaseTitle, headline, opportunity, businessValue },
                        phases: phasesPayload,
                    }),
                });
                const data = await response.json().catch(() => null);
                if (!response.ok || !Array.isArray(data?.items)) {
                    throw new Error(data?.message || "Timeline generation failed");
                }

                const parseDate = (value: string | undefined) => {
                    if (!value) return undefined;
                    const [year, month, day] = value.split("-").map(Number);
                    if (!year || !month || !day) return undefined;
                    return new Date(year, month - 1, day);
                };

                const nextSuggestions: Record<string, { startDate: Date; endDate: Date }> = {};
                data.items.forEach((item: { name?: string; startDate?: string; endDate?: string }) => {
                    const name = String(item.name ?? "").trim();
                    if (!name) return;
                    const key = name.toLowerCase();
                    const start = parseDate(item.startDate);
                    const end = parseDate(item.endDate);
                    if (!start || !end) return;
                    nextSuggestions[key] = { startDate: start, endDate: end };
                });

                if (isMounted) {
                    setTimelineSuggestions(nextSuggestions);
                }
            } catch (error) {
                console.error("Timeline generation failed", error);
                toast.error("Timeline generation is unavailable right now.");
            } finally {
                timelineRequestInFlightRef.current = false;
                if (isMounted) {
                    setIsTimelineGenerating(false);
                }
            }
        };

        generateTimeline();

        return () => {
            isMounted = false;
        };
    }, [
        currentStep,
        phasesData,
        form,
        aiGeneratedPhases,
        timelineSuggestions,
        prefetchTimeline,
    ]);


    // Reset dependent selections when parent changes
    useEffect(() => {
        form.setValue("selectedTeam", "");
        form.setValue("selectedSubTeam", "");
    }, [selectedBusinessUnit, form]);

    useEffect(() => {
        if (!Array.isArray(generatedWatchedValues)) return;
        const trackedFields = ["useCaseTitle", "headline", "opportunity", "businessValue"] as const;
        const nextValues = generatedWatchedValues.map((value) =>
            typeof value === "string" ? value : "",
        );
        const prevValues = previousFieldValuesRef.current;

        if (prevValues.length > 0) {
            setAiSuggestions((prev) => {
                let updated = prev;
                trackedFields.forEach((field, index) => {
                    if (prevValues[index] !== nextValues[index] && updated[field]) {
                        if (updated === prev) updated = { ...prev };
                        delete updated[field];
                    }
                });
                return updated;
            });
        }

        setAiGeneratedValues((prev) => {
            let changed = false;
            const next = { ...prev };
            trackedFields.forEach((field, index) => {
                const currentValue = nextValues[index] ?? "";
                if (next[field] && next[field] !== currentValue) {
                    delete next[field];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
        previousFieldValuesRef.current = nextValues;
    }, [generatedWatchedValues]);

    useEffect(() => {
        if (hasChecklistAnswers) {
            setChecklistNeedsAttention(false);
        }
    }, [hasChecklistAnswers]);

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
            if (!isStep1Valid) {
                const values = form.getValues();
                const requiredFields: Array<{ name: keyof typeof values; message: string }> = [
                    { name: "useCaseTitle", message: "Use Case Title is required" },
                    { name: "headline", message: "Headline is required" },
                    { name: "opportunity", message: "Opportunity is required" },
                    { name: "businessValue", message: "Business Value is required" },
                    { name: "selectedBusinessUnit", message: "Business Unit is required" },
                    { name: "selectedTeam", message: "Team Name is required" },
                    { name: "eseResourceValue", message: "Required" },
                ];

                requiredFields.forEach(({ name, message }) => {
                    const value = values[name];
                    if (typeof value !== "string" || value.trim().length === 0) {
                        form.setError(name as unknown, { type: "manual", message });
                    }
                });
                return;
            }
            setPrefetchTimeline(true);
            setPrefetchMetrics(true);
            setCurrentStep(showChecklistTab ? 2 : 3);
        } else if (currentStep === 2) {
            if (!hasChecklistAnswers) {
                setChecklistNeedsAttention(true);
            }
            setCurrentStep(3);
        } else if (currentStep === 3) {
            if (!startDate || !endDate) {
                toast.error("Please set the start and end dates for the first phase.");
                return;
            }
            setCurrentStep(4);
        } else {
            // Submit action (currentStep === 4)
            // Submit action
            setIsSubmitting(true);
            setSubmitError(null);

            try {
                if (!isStep1Valid) {
                    toast.error("Please complete all required fields in Use Case Information.");
                    return;
                }
                if (!startDate || !endDate) {
                    toast.error("Please set the start and end dates for the first phase.");
                    return;
                }
                if (!isMetricsFormValid || metrics.length === 0) {
                    toast.error("Please complete at least one metric before submitting.");
                    return;
                }

                const values = form.getValues();
                const primaryContact =
                    values.primaryContact?.trim() ||
                    accounts[0]?.username ||
                    accounts[0]?.name ||
                    primaryContactOptions[0]?.value ||
                    "";

                if (!primaryContact) {
                    toast.error("Primary contact is required.");
                    return;
                }

                if (!selectedBusinessUnitId) {
                    toast.error("Business Unit is required.");
                    return;
                }

                const normalizeChecklistResponse = (value: unknown) => {
                    if (Array.isArray(value)) {
                        return value.map((entry) => String(entry).trim()).filter(Boolean).join(", ");
                    }
                    if (value === null || value === undefined) return "";
                    return String(value).trim();
                };

                const checklistEntries = checklistQuestions
                    .map((question) => {
                        const response = normalizeChecklistResponse(
                            checklistResponses?.[question.responseKey],
                        );
                        const questionId = Number(question.id);
                        if (!Number.isFinite(questionId) || !response) return null;
                        return { questionId, response };
                    })
                    .filter(Boolean);

                const stakeholdersPayload = addedStakeholders
                    .map((stakeholder) => {
                        const email = String(stakeholder.email ?? "").trim();
                        const rawRole = String(stakeholder.role ?? "").trim();
                        const role = normalizeStakeholderRole(rawRole);
                        const roleId = roleIdByName.get(role.toLowerCase())
                            ?? roleIdByName.get(rawRole.toLowerCase());
                        if (!email || !role || !Number.isFinite(roleId)) return null;
                        return { roleId, role, stakeholderEmail: email };
                    })
                    .filter(Boolean);

                const apiStakeholdersPayload = stakeholdersData
                    .map((stakeholder) => {
                        const email = String(stakeholder?.email ?? "").trim();
                        const role = String(stakeholder?.role ?? "").trim();
                        const fallbackRoleId = roleIdByName.get(role.toLowerCase());
                        const roleId = Number.isFinite(Number(stakeholder?.roleId))
                            ? Number(stakeholder?.roleId)
                            : fallbackRoleId;
                        if (!email || !role || !Number.isFinite(roleId)) return null;
                        return { roleId, role, stakeholderEmail: email };
                    })
                    .filter(Boolean);

                const combinedStakeholders = [...stakeholdersPayload, ...apiStakeholdersPayload].filter(Boolean);
                const uniqueStakeholders: Array<{ roleId: number; role: string; stakeholderEmail: string }> = [];
                const seenStakeholders = new Set<string>();
                combinedStakeholders.forEach((stakeholder) => {
                    const key = `${stakeholder.roleId}|${stakeholder.stakeholderEmail.toLowerCase()}`;
                    if (seenStakeholders.has(key)) return;
                    seenStakeholders.add(key);
                    uniqueStakeholders.push(stakeholder);
                });

                const formatDate = (date?: Date) => (date ? format(date, "yyyy-MM-dd") : "");

                const planPayload = phasesData
                    .map((phase) => {
                        const phaseName = String(phase?.name ?? "").trim();
                        if (!phaseName) return null;
                        const state = phaseDateState[phaseKey(phaseName)];
                        if (!state?.start || !state?.end) return null;
                        const usecasephaseid = Number(phase?.id);
                        if (!Number.isFinite(usecasephaseid)) return null;
                        return {
                            usecasephaseid,
                            startdate: formatDate(state.start),
                            enddate: formatDate(state.end),
                        };
                    })
                    .filter(Boolean);

                const metricsPayload = metrics
                    .map((metric) => {
                        const parcsCategory = String(metric.parcsCategory ?? "").trim();
                        const unitOfMeasurement = String(metric.unitOfMeasurement ?? "").trim();
                        const metrictypeid = metricCategoryIdByName.get(parcsCategory.toLowerCase());
                        const unitofmeasureid = unitOfMeasureIdByName.get(
                            unitOfMeasurement.toLowerCase(),
                        );
                        if (!Number.isFinite(metrictypeid) || !Number.isFinite(unitofmeasureid)) {
                            return null;
                        }
                        return {
                            metrictypeid,
                            unitofmeasureid,
                            primarysuccessmetricname: String(metric.primarySuccessValue ?? "").trim(),
                            baselinevalue: String(metric.baselineValue ?? "").trim(),
                            baselinedate: String(metric.baselineDate ?? "").trim(),
                            targetvalue: String(metric.targetValue ?? "").trim(),
                            targetdate: String(metric.targetDate ?? "").trim(),
                        };
                    })
                    .filter(Boolean);

                const useCaseData = {
                    businessUnitId: selectedBusinessUnitId,
                    phaseId: 1,
                    statusId: 6,
                    title: values.useCaseTitle?.trim(),
                    headlines: values.headline?.trim() || null,
                    opportunity: values.opportunity?.trim() || null,
                    businessValue: values.businessValue?.trim() || null,
                    subTeamName: values.selectedSubTeam?.trim() || null,
                    informationUrl: values.infoLink?.trim() || null,
                    eseDependency: values.eseResourceValue?.trim() || null,
                    primaryContact,
                    editorEmail: accounts[0]?.username || primaryContact,
                    checklist: checklistEntries.length ? checklistEntries : null,
                    stakeholders: uniqueStakeholders.length ? uniqueStakeholders : null,
                    plan: planPayload.length ? planPayload : null,
                    metrics: metricsPayload.length ? metricsPayload : null,
                };

                const createdUseCase = await createUseCase(useCaseData);
                const useCaseId = createdUseCase?.id ?? createdUseCase?.ID ?? null;

                toast.success(
                    useCaseId
                        ? `Your record has been submitted successfully with ID: ${useCaseId}`
                        : "Your record has been submitted successfully.",
                );
                navigate('/champion');

            } catch (error) {
                console.error('Error submitting use case:', error);
                setSubmitError('Failed to submit use case. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [
        currentStep,
        isStep1Valid,
        showChecklistTab,
        form,
        hasChecklistAnswers,
        startDate,
        endDate,
        addedStakeholders,
        primaryContactOptions,
        accounts,
        navigate,
        isMetricsFormValid,
        metrics,
        checklistQuestions,
        checklistResponses,
        selectedBusinessUnitId,
        roleIdByName,
        phasesData,
        metricCategoryIdByName,
        unitOfMeasureIdByName,
        phaseDateState,
        stakeholdersData,
    ]);

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

    const handleAcceptTimelineSuggestions = useCallback(() => {
        const entries = Object.entries(timelineSuggestions);
        if (entries.length === 0) return;

        entries.forEach(([key, suggestion]) => {
            if (!suggestion) return;
            if (key === "idea") {
                setStartDate(suggestion.startDate);
                setEndDate(suggestion.endDate);
            } else if (key === "diagnose") {
                setDiagnoseStartDate(suggestion.startDate);
                setDiagnoseEndDate(suggestion.endDate);
            } else if (key === "design") {
                setDesignStartDate(suggestion.startDate);
                setDesignEndDate(suggestion.endDate);
            } else if (key === "implemented") {
                setImplementedStartDate(suggestion.startDate);
                setImplementedEndDate(suggestion.endDate);
            }
        });

        setAiGeneratedPhases((prev) => {
            const next = { ...prev };
            entries.forEach(([key]) => {
                next[key] = true;
            });
            return next;
        });
        setTimelineSuggestions({});
    }, [timelineSuggestions]);

    const handleRejectTimelineSuggestions = useCallback(() => {
        setTimelineSuggestions({});
    }, []);

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
                    <Tabs value={currentStep.toString()} className="w-full">
                        <div className="flex justify-start w-full">
                            <TabsList className={cn("grid w-full pointer-events-none", showChecklistTab ? "grid-cols-4" : "grid-cols-3")}>
                                <TabsTrigger value="1">Use Case Information</TabsTrigger>
                                {showChecklistTab && (
                                    <TabsTrigger
                                        value="2"
                                        className={cn(
                                            checklistNeedsAttention && "text-destructive data-[state=active]:text-destructive",
                                        )}
                                    >
                                        AI Product Checklist
                                    </TabsTrigger>
                                )}
                                <TabsTrigger value="3">Stakeholders & Launch Plan</TabsTrigger>
                                <TabsTrigger value="4">PARCS Metrics</TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>
                </div>
            </div>


            {/* Submit error message */}
            {submitError && (
                <div className="error-message">
                    <p>{submitError}</p>
                </div>
            )}

            <Form {...form}>
                <div className="flex justify-center w-full">
                    <div className="flex flex-1 flex-col gap-6 mx-auto max-w-7xl w-full px-4">
                        {currentStep === 1 && (
                            <UseCaseInfoSection
                                form={form}
                                businessUnits={businessUnits}
                                teams={teams}
                                subTeams={subTeams}
                                selectedBusinessUnit={selectedBusinessUnit}
                                selectedTeam={selectedTeam}
                                isMappingsLoading={isLoading}
                                aiStatus={aiStatus}
                                aiGeneratedFields={aiGeneratedFields}
                                aiSuggestions={aiSuggestions}
                                onGenerateAi={handleGenerateAi}
                                onAcceptSuggestion={handleAcceptSuggestion}
                                onRejectSuggestion={handleRejectSuggestion}
                            />
                        )}

                        {currentStep === 2 && showChecklistTab && (
                            <ChecklistSection
                                form={form}
                                questions={checklistQuestions}
                                containerRef={formContainerRef}
                                isLoading={isLoading}
                            />
                        )}

                        {currentStep === 3 && (
                            <StakeholdersPlanSection
                                stakeholders={visibleStakeholders}
                                isLoading={isStakeholdersLoading}
                                phases={phasesData}
                                isPhasesLoading={isPhasesLoading}
                                isTimelineGenerating={isTimelineGenerating}
                                aiGeneratedPhases={aiGeneratedPhases}
                                timelineSuggestions={timelineSuggestions}
                                onAcceptTimelineSuggestions={handleAcceptTimelineSuggestions}
                                onRejectTimelineSuggestions={handleRejectTimelineSuggestions}
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
                                metricCategories={metricCategories}
                                unitOfMeasurementOptions={unitOfMeasurementOptions}
                                isSuggestionsLoading={isMetricSuggestionsLoading}
                                suggestionsAvailable={metricSuggestions.length > 0}
                                aiGeneratedMetricIds={aiGeneratedMetricIds}
                                onAddMetric={handleAddMetric}
                                onDeleteMetric={handleDeleteMetric}
                                onChangeMetric={handleInputChange}
                                onOpenMetricDateDialog={handleOpenMetricDateDialog}
                                onAcceptSuggestions={handleAcceptMetricSuggestions}
                                onRejectSuggestions={handleRejectMetricSuggestions}
                            />
                        )}
                    </div>
                </div>
            </Form>

            <div className="w-full max-w-7xl mx-auto px-4">
                <div className="flex justify-end gap-2">
                    {currentStep !== 1 && (
                        <Button variant="ghost" onClick={handleBack}>Back</Button>
                    )}
                    <Button variant="outline" onClick={() => navigate('/')}>Cancel</Button>
                    <Button
                        onClick={handleNext}
                        disabled={
                            (currentStep === 1 && !isStep1Valid) ||
                            (currentStep === 3 && !isStep2Valid) ||
                            (currentStep === 4 && (!isMetricsFormValid || metrics.length === 0)) ||
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
                                <SelectContent
                                    position="popper"
                                    side="bottom"
                                    align="start"
                                    className="min-w-[var(--radix-select-trigger-width)]"
                                >
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
