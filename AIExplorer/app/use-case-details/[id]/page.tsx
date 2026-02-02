'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoSection } from "@/components/use-case-details/InfoSection";
import { UpdateSection } from "@/components/use-case-details/UpdateSection";
import { AgentLibrarySection } from "@/components/use-case-details/AgentLibrarySection";
import { MetricsSection } from "@/components/use-case-details/MetricsSection";
import type { MetricsRow, ReportedHistoryRow } from "@/components/use-case-details/MetricsSection";
import { ActionsSection } from "@/components/use-case-details/ActionsSection";
import { ReprioritizeSection } from "@/components/use-case-details/ReprioritizeSection";
import { FilterCombobox } from "@/components/shared/filter-combobox";
import { ChecklistSection } from "@/components/submit-use-case/ChecklistSection";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Form } from "@/components/ui/form";
import { toast } from 'sonner';
import { useLocation } from '@/lib/router';
import { useMsal } from '@azure/msal-react';
import { Calendar as CalendarIcon, CheckSquare, Pencil, Trash2 } from 'lucide-react';
import { useUseCaseDetails, type AgentLibraryItem } from '@/hooks/use-usecase-details';
import type {
    ChecklistItem,
    MetricItem,
    PlanItem,
    ReportedMetricItem,
    StakeholderItem,
    UpdateItem,
} from "@/lib/types/usecase-details";
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { updateUseCaseChecklist, updateUseCaseInfo, updateUseCaseMetrics } from '@/lib/api';

import { getMappings } from '@/lib/submit-use-case';
import { useForm } from "react-hook-form";
import { useReactTable, getCoreRowModel, type ColumnDef } from '@tanstack/react-table';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const UseCaseDetailsSkeleton = () => (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full">
        {/* Tabs + Actions bar */}
        <div className="bg-gray-50 -mx-6 px-6 pb-4 border-b border-gray-100">
            <div className="w-[95%] mx-auto flex items-center justify-between">
                <Skeleton className="h-10 w-[520px] rounded-lg" />
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>
        </div>

        {/* Info layout skeleton (2 cards) */}
        <div className="w-[95%] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
                <div className="flex-1 max-w-xl space-y-2">
                    <Skeleton className="h-8 w-72" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(80vh-150px)]">
                <Card
                    className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col"
                    style={{ backgroundColor: "#c7e7e7" }}
                >
                    <CardContent className="p-8 flex-1">
                        <div className="flex h-full flex-col gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-full" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-5 w-52" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                            <div className="mt-auto pt-2">
                                <Skeleton className="h-9 w-32 rounded-md" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col">
                    <CardContent className="pt-6 flex-1">
                        <div className="space-y-8 h-full">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-72" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
);


type Metric = MetricsRow;
type RoleOption = {
    id: number;
    name: string;
    roleType: string;
};

type ChecklistQuestion = {
    id: number | string;
    question: string;
    kind: "yesno" | "choice";
    options: { value: string; label: string }[];
    isMulti: boolean;
    responseKey: string;
};


type ChecklistDisplayItem = {
    id: number | string;
    question: string;
    responses: string[];
};

type AiProductQuestion = {
    id?: number | string;
    question?: string;
    questionType?: string;
    questiontype?: string;
    responseValue?: string;
    responsevalue?: string;
};

const metricColumnSizes = {
    primarySuccessValue: 260,
    parcsCategory: 220,
    unitOfMeasurement: 200,
    baselineValue: 140,
    baselineDate: 140,
    targetValue: 140,
    targetDate: 140,
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
                    {dateValue ? format(dateValue, "MM-dd-yyyy") : <span>Pick date</span>}
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

const formatDisplayDate = (value?: string | null): string => {
    if (!value) return "";
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    const [first, second, third] = parts;
    if (first.length === 4) {
        return `${second.padStart(2, "0")}-${third.padStart(2, "0")}-${first}`;
    }
    return value;
};

const ReportedDatePickerCell = ({
    value,
    onChange,
}: {
    value?: string;
    onChange: (date: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const dateValue = useMemo(() => {
        if (!value) return undefined;
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
                            onChange(format(date, "yyyy-MM-dd"));
                            setOpen(false);
                        }
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};

const normalizeRoleName = (value: string) => value.trim().toLowerCase();

const isOwnerRole = (value: string) => normalizeRoleName(value) === "owner";

const isChampionDelegateRole = (value: string) =>
    normalizeRoleName(value) === "champion delegate";

const buildInitials = (value: string) => {
    const parts = value.split(/[\s@._-]+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
    return letters.join("");
};

const UseCaseDetails = () => {
    const params = useParams();
    const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
    const id = idParam ?? "";
    const location = useLocation<{ useCaseTitle: string; sourceScreen?: string }>();
    const { state } = location;
    const { accounts } = useMsal();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const userParam = String(searchParams.get("user") ?? "").toLowerCase();
    const isChampionView = userParam === "champion" || state?.sourceScreen === "champion";
    const userEmail = accounts?.[0]?.username ?? "";
    const detailType = userEmail ? (isChampionView ? "champion" : "owner") : "";
    const { data: useCaseDetails, loading, error, refetch } = useUseCaseDetails(
        typeof id === "string" && userEmail ? id : undefined,
        {
            type: detailType ? (detailType as "owner" | "champion") : undefined,
            email: userEmail || undefined,
            all: Boolean(detailType),
        },
    );
    
    const agentLibraryItems = useMemo<AgentLibraryItem[]>(
        () =>
            Array.isArray(useCaseDetails?.agentLibrary)
                ? useCaseDetails?.agentLibrary
                : [],
        [useCaseDetails?.agentLibrary],
    );
    
    const useCase = useMemo(() => {
        const raw = useCaseDetails?.useCase;
        const phaseIdValue = raw?.phaseId ?? null;
        const businessValue = String(raw?.businessValue ?? "");
        return {
            id: raw?.id ?? id,
            title: String(raw?.title ?? state?.useCaseTitle ?? "Use Case"),
            phase: String(raw?.phase ?? ""),
            phaseStage: String(raw?.phaseStage ?? ""),
            phaseId: Number.isFinite(phaseIdValue) ? phaseIdValue : null,
            statusName: String(raw?.statusName ?? ""),
            statusColor: String(raw?.statusColor ?? ""),
            businessUnitName: String(raw?.businessUnitName ?? ""),
            teamName: String(raw?.teamName ?? ""),
            headlines: String(raw?.headlines ?? ""),
            opportunity: String(raw?.opportunity ?? ""),
            businessValue,
            informationUrl: String(raw?.informationUrl ?? ""),
            primaryContact: String(raw?.primaryContact ?? ""),
            editorEmail: String(raw?.editorEmail ?? ""),
        };
    }, [useCaseDetails, id, state?.useCaseTitle]);
    const tabParam = String(searchParams.get("tab") ?? "").toLowerCase();
    const resolvedTab = useMemo(() => {
        const ownerTabs = new Set(["info", "update", "checklist", "library", "metrics", "status"]);
        const championTabs = new Set(["info", "update", "reprioritize", "metrics", "status"]);
        const allowedTabs = isChampionView ? championTabs : ownerTabs;
        if (tabParam && allowedTabs.has(tabParam)) {
            return tabParam;
        }
        return "info";
    }, [isChampionView, tabParam]);

    const [selectedStatus, setSelectedStatus] = useState(useCase.statusName || 'Active');
    const showChangeStatusCard = false;
    const [phaseDates, setPhaseDates] = useState<Record<string, { start?: Date; end?: Date }>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(resolvedTab);
    const [selectedMetricIdsForReporting, setSelectedMetricIdsForReporting] = useState<string[]>([]);
    const [stakeholderName, setStakeholderName] = useState('');
    const [stakeholderRole, setStakeholderRole] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    const [editingPhase, setEditingPhase] = useState<string | null>(null);
    const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);
    const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined);
    const [stakeholders, setStakeholders] = useState<{ id?: number | null; name: string; role: string; initial: string; canEdit: boolean; roleId?: number | null }[]>([]);
    const [updateText, setUpdateText] = useState('');
    const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<string[]>([]);
    const [knowledgeSourceOptions, setKnowledgeSourceOptions] = useState<{ label: string; value: string }[]>([]);
    const [instructions, setInstructions] = useState('');
    const [currentStatus, setCurrentStatus] = useState('On-Track');
    const [nextPhase, setNextPhase] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [reportedMetrics, setReportedMetrics] = useState<Metric[]>([]);
    const [reportedHistory, setReportedHistory] = useState<ReportedHistoryRow[]>([]);
    const [updates, setUpdates] = useState<
        {
            id: number;
            author: string;
            role?: string;
            phase?: string;
            status?: string;
            statusColor?: string;
            content: string;
            time: string;
            type: string;
        }[]
    >([]);
    const [planItems, setPlanItems] = useState<PlanItem[]>([]);
    const [stakeholderItems, setStakeholderItems] = useState<StakeholderItem[]>([]);
    const [updateItems, setUpdateItems] = useState<UpdateItem[]>([]);
    const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
    const [isTimelineEditing, setIsTimelineEditing] = useState(false);
    const [isUpdateDataLoading, setIsUpdateDataLoading] = useState(false);
    const [isMetricDateDialogOpen, setIsMetricDateDialogOpen] = useState(false);
    const [editingMetricId, setEditingMetricId] = useState<number | null>(null);
    const [tempBaselineDate, setTempBaselineDate] = useState<Date | undefined>(undefined);
    const [tempTargetDate, setTempTargetDate] = useState<Date | undefined>(undefined);
    const [isMetricSelectDialogOpen, setIsMetricSelectDialogOpen] = useState(false);
    const [isDeleteMetricDialogOpen, setIsDeleteMetricDialogOpen] = useState(false);
    const [pendingDeleteMetricId, setPendingDeleteMetricId] = useState<number | null>(null);
    const [isMetricsEditing, setIsMetricsEditing] = useState(false);
    const [isReprioritizeEditing, setIsReprioritizeEditing] = useState(false);
    const metricsSnapshotRef = useRef<{
        metrics: Metric[];
        reportedMetrics: Metric[];
        reportedHistory: ReportedHistoryRow[];
    } | null>(null);
    const timelineSnapshotRef = useRef<Record<string, { start?: Date; end?: Date }> | null>(null);
    const infoSnapshotRef = useRef<{
        title: string;
        headline: string;
        opportunity: string;
        evidence: string;
    } | null>(null);

    const [themeOptions, setThemeOptions] = useState<{ label: string; value: string }[]>([]);
    const [statusOptions, setStatusOptions] = useState<string[]>([]);
    const [aiProductQuestionsData, setAiProductQuestionsData] = useState<AiProductQuestion[]>([]);

    useEffect(() => {
        setActiveTab(resolvedTab);
    }, [resolvedTab, location.search]);
    const [metricCategoryOptions, setMetricCategoryOptions] = useState<string[]>([]);
    const [metricCategoryMap, setMetricCategoryMap] = useState<Map<number, string>>(new Map());
    const [metricCategoryDefaultUnitMap, setMetricCategoryDefaultUnitMap] = useState<Map<string, string>>(new Map());
    const [unitOfMeasureOptions, setUnitOfMeasureOptions] = useState<string[]>([]);
    const [unitOfMeasureMap, setUnitOfMeasureMap] = useState<Map<number, string>>(new Map());

    const metricCategorySelectOptions = useMemo(
        () => metricCategoryOptions.map((option) => ({ label: option, value: option })),
        [metricCategoryOptions],
    );
    const unitOfMeasureSelectOptions = useMemo(
        () => unitOfMeasureOptions.map((option) => ({ label: option, value: option })),
        [unitOfMeasureOptions],
    );
    const [phaseMappings, setPhaseMappings] = useState<{ id: number; name: string; stage?: string }[]>([]);
    const [riceImpactOptions, setRiceImpactOptions] = useState<{ label: string; value: string }[]>([]);
    const [riceConfidenceOptions, setRiceConfidenceOptions] = useState<{ label: string; value: string }[]>([]);
    const [deliveryOptions, setDeliveryOptions] = useState<{ label: string; value: string }[]>([]);
    const [reportingFrequencyOptions, setReportingFrequencyOptions] = useState<{ label: string; value: string }[]>([]);
    const [deliveryIdMap, setDeliveryIdMap] = useState<Map<string, number>>(new Map());
    const [reportingFrequencyIdMap, setReportingFrequencyIdMap] = useState<Map<string, number>>(new Map());

    // AI Configuration state
    const [personaOptions, setPersonaOptions] = useState<{ label: string; value: string }[]>([]);
    const [vendorOptions, setVendorOptions] = useState<{ label: string; value: string }[]>([]);
    const [modelOptions, setModelOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [agentId, setAgentId] = useState<string>('');
    const [agentLink, setAgentLink] = useState<string>('');
    const [vendorModelsData, setVendorModelsData] = useState<Map<string, { id: number; name: string }[]>>(new Map());
    const [isAgentLibraryEditing, setIsAgentLibraryEditing] = useState(false);
    const [metricDetailRows, setMetricDetailRows] = useState<MetricItem[]>([]);
    const [reportedMetricRows, setReportedMetricRows] = useState<ReportedMetricItem[]>([]);
    const agentLibrarySnapshotRef = useRef<{
        selectedAIThemes: string[];
        selectedPersonas: string[];
        selectedVendor: string;
        selectedModel: string;
        agentId: string;
        agentLink: string;
        selectedKnowledgeSources: string[];
        instructions: string;
    } | null>(null);

    const agentBadgeLabel = useMemo(() => {
        const detailItem = useCaseDetails?.agentLibrary?.[0];
        const vendorName = String(detailItem?.vendorName ?? "").trim();
        const productName = String(detailItem?.productName ?? "").trim();
        if (vendorName && productName) return `${vendorName} - ${productName}`;
        if (vendorName || productName) return productName || vendorName;

        const item = agentLibraryItems[0];
        if (!item) return "";
        const vendorModelId = Number(item.vendormodelid);
        if (!Number.isFinite(vendorModelId) || vendorModelsData.size === 0) return "";
        for (const [vendor, models] of vendorModelsData.entries()) {
            const model = models.find((m) => m.id === vendorModelId);
            if (model?.name) {
                return vendor ? `${vendor} - ${model.name}` : model.name;
            }
        }
        return "";
    }, [useCaseDetails?.agentLibrary, agentLibraryItems, vendorModelsData]);

    // Form state for Reprioritize
    const [formData, setFormData] = useState({
        reach: '',
        impact: '',
        confidence: '',
        effort: '',
        riceScore: '',
        priority: '',
        delivery: '',
        totalUserBase: '',
        displayInGallery: false,
        sltReporting: false,
        reportingFrequency: ''
    });
    const reprioritizeSnapshotRef = useRef<typeof formData | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isChecklistEditing, setIsChecklistEditing] = useState(false);
    const [editableTitle, setEditableTitle] = useState(useCase.title);
    const [editableAITheme, setEditableAITheme] = useState<string[]>([]);
    const [editableHeadline, setEditableHeadline] = useState('');
    const [editableOpportunity, setEditableOpportunity] = useState('');
    const [editableEvidence, setEditableEvidence] = useState('');
    const [editableContactPerson, setEditableContactPerson] = useState('');
    const checklistForm = useForm<{ checklistResponses: Record<string, string | string[]> }>({
        defaultValues: { checklistResponses: {} },
    });
    const checklistSnapshotRef = useRef<Record<string, string | string[]>>({});
    const checklistContainerRef = useRef<HTMLDivElement>(null);

    const roleSelectOptions = useMemo(
        () =>
            roleOptions.filter((role) => {
                if (String(role.roleType ?? "").trim() !== "2") return false;
                const roleId = Number(role.id);
                if (Number.isFinite(roleId) && roleId === 13) return false;
                if (isOwnerRole(role.name)) return false;
                return true;
            }),
        [roleOptions],
    );

    const canAddStakeholder = useMemo(() => roleSelectOptions.length > 0, [roleSelectOptions]);

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

        const mapped = aiProductQuestionsData
            .map((question) => {
                const text = String(question.question ?? "").trim();
                if (!text) return null;

                const rawType = String(question.questionType ?? question.questiontype ?? "").toLowerCase();
                const responseValue = String(question.responseValue ?? question.responsevalue ?? "");
                const isYesNo = rawType.includes("yes") && rawType.includes("no");
                const isChoice = rawType.includes("choice") || (responseValue && !isYesNo);

                return {
                    id: question.id ?? text,
                    question: text,
                    kind: isYesNo ? "yesno" : "choice",
                    options: isChoice ? parseOptions(responseValue) : [],
                    isMulti: isChoice && text.toLowerCase().includes("select all"),
                    responseKey: String(question.id ?? text)
                        .replace(/[^\w-]/g, "_")
                        .toLowerCase(),
                } as ChecklistQuestion;
            })
            .filter((item): item is ChecklistQuestion => Boolean(item));

        return mapped.sort((a, b) => toOrder(a.id) - toOrder(b.id));
    }, [aiProductQuestionsData]);

    const checklistResponseMap = useMemo(() => {
        const map = new Map<number, string>();
        const rows = (useCaseDetails?.checklist ?? []) as ChecklistItem[];
        rows.forEach((row) => {
            const questionId = Number(row.questionId);
            if (!Number.isFinite(questionId)) return;
            const response = String(row.response ?? "").trim();
            map.set(questionId, response);
        });
        return map;
    }, [useCaseDetails?.checklist]);

    const checklistDisplayItems = useMemo<ChecklistDisplayItem[]>(() => {
        if (checklistQuestions.length === 0) return [];
        return checklistQuestions.map((question) => {
            const questionId = Number(question.id);
            const response = Number.isFinite(questionId)
                ? checklistResponseMap.get(questionId) ?? ""
                : "";
            const responses = response
                .split(",")
                .map((entry) => entry.trim())
                .filter(Boolean);
            return {
                id: question.id,
                question: question.question,
                responses,
            };
        });
    }, [checklistQuestions, checklistResponseMap]);

    // Sync editable fields when useCase updates
    useEffect(() => {
        setEditableTitle(useCase.title);
        setEditableHeadline(useCase.headlines);
        setEditableOpportunity(useCase.opportunity);
        setEditableEvidence(useCase.businessValue);
        setEditableContactPerson(useCase.primaryContact);
        setSelectedStatus(useCase.statusName || "Active");
        setCurrentStatus(useCase.statusName || "On-Track");
    }, [
        useCase.title,
        useCase.headlines,
        useCase.opportunity,
        useCase.businessValue,
        useCase.primaryContact,
        useCase.statusName,
    ]);

    useEffect(() => {
        const selectedThemes = (useCaseDetails?.themes ?? [])
            .map((theme) => String(theme.themeName ?? "").trim())
            .filter(Boolean);
        if (selectedThemes.length > 0) {
            setEditableAITheme(selectedThemes);
        } else if (themeOptions.length > 0 && editableAITheme.length === 0) {
            setEditableAITheme([]);
        }
    }, [useCaseDetails?.themes, themeOptions.length, editableAITheme.length]);

    const aiThemeDisplay = useMemo(() => {
        const themeMap = new Map(themeOptions.map((option) => [String(option.value), option.label]));
        const detailThemeEntries = (useCaseDetails?.themes ?? [])
            .map((theme) => [String(theme.aithemeid ?? ""), String(theme.themeName ?? "").trim()] as const)
            .filter((item): item is readonly [string, string] => Boolean(item[0] && item[1]));
        const detailThemeMap = new Map(detailThemeEntries);
        const fallbackThemes = (useCaseDetails?.themes ?? [])
            .map((theme) => String(theme.themeName ?? "").trim())
            .filter(Boolean);
        const rawThemes = editableAITheme.length > 0 ? editableAITheme : fallbackThemes;

        const mapped = rawThemes
            .map((theme) => {
                const key = String(theme ?? "").trim();
                if (!key) return "";
                const mappedName = themeMap.get(key) || detailThemeMap.get(key);
                if (mappedName) return mappedName;
                const isNumeric = /^\d+$/.test(key);
                return isNumeric ? "" : key;
            })
            .filter(Boolean);

        return Array.from(new Set(mapped));
    }, [editableAITheme, themeOptions, useCaseDetails?.themes]);

    // Set default primary contact person to current user if missing
    useEffect(() => {
        if (!useCase.primaryContact && accounts && accounts.length > 0) {
            const account = accounts[0];
            const displayName = account.name || account.username || 'Current User';
            setEditableContactPerson(displayName);
        }
    }, [accounts, useCase.primaryContact]);

    useEffect(() => {
        if (isChecklistEditing || checklistQuestions.length === 0) return;

        const defaults: Record<string, string | string[]> = {};
        checklistQuestions.forEach((question) => {
            const questionId = Number(question.id);
            if (!Number.isFinite(questionId)) return;
            const response = checklistResponseMap.get(questionId) ?? "";
            if (question.isMulti) {
                const values = response
                    .split(",")
                    .map((entry) => entry.trim())
                    .filter(Boolean);
                defaults[question.responseKey] = values;
            } else {
                defaults[question.responseKey] = response;
            }
        });
        checklistForm.reset({ checklistResponses: defaults });
        checklistSnapshotRef.current = defaults;
    }, [checklistForm, checklistQuestions, checklistResponseMap, isChecklistEditing]);

    // Fetch mapping data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const mappings = await getMappings([
                    "themes",
                    "status",
                    "metricCategories",
                    "unitOfMeasure",
                    "phases",
                    "personas",
                    "vendorModels",
                    "knowledgeSources",
                    "rice",
                    "implementationTimespans",
                    "reportingFrequency",
                    "aiProductQuestions",
                    "roles",
                ]);
                const themes = mappings.themes;
                const statuses = mappings.status;
                const metricCategories = mappings.metricCategories;
                const unitOfMeasure = mappings.unitOfMeasure;
                const phases = mappings.phases;
                const personas = mappings.personas;
                const vendorModels = mappings.vendorModels;
                const knowledgeSources = mappings.knowledgeSources;
                const riceMappings = mappings.rice;
                const timespans = mappings.implementationTimespans;
                const reportingFrequencies = mappings.reportingFrequency;
                const aiProductQuestions = mappings.aiProductQuestions;
                const roles = mappings.roles;
                setThemeOptions(
                    (themes?.items ?? [])
                        .filter((item: any) => item.id && item.name)
                        .map((item: any) => ({ 
                            label: String(item.name ?? "").trim(), 
                            value: String(item.id) 
                        })),
                );
                setStatusOptions(
                    (statuses?.items ?? [])
                        .map((item: any) => String(item.name ?? "").trim())
                        .filter(Boolean),
                );
                setMetricCategoryOptions(
                    (metricCategories?.items ?? [])
                        .map((item: any) => String(item.category ?? "").trim())
                        .filter(Boolean),
                );
                const nextCategoryMap = new Map<number, string>();
                (metricCategories?.items ?? []).forEach((item: any) => {
                    const id = Number(item.id);
                    const name = String(item.category ?? "").trim();
                    if (Number.isFinite(id) && name) {
                        nextCategoryMap.set(id, name);
                    }
                });
                setMetricCategoryMap(nextCategoryMap);
                setUnitOfMeasureOptions(
                    (unitOfMeasure?.items ?? [])
                        .map((item: any) => String(item.name ?? "").trim())
                        .filter(Boolean),
                );
                const nextUnitMap = new Map<number, string>();
                (unitOfMeasure?.items ?? []).forEach((item: any) => {
                    const id = Number(item.id);
                    const name = String(item.name ?? "").trim();
                    if (Number.isFinite(id) && name) {
                        nextUnitMap.set(id, name);
                    }
                });
                setUnitOfMeasureMap(nextUnitMap);
                const nextDefaultUnitMap = new Map<string, string>();
                (metricCategories?.items ?? []).forEach((item: any) => {
                    const name = String(item.category ?? "").trim();
                    const defaultUnitId = Number(
                        item.defaultUnitOfMeasureId ?? item.defaultunitofmeasureid,
                    );
                    if (!name || !Number.isFinite(defaultUnitId)) return;
                    const unitName = nextUnitMap.get(defaultUnitId);
                    if (unitName) {
                        nextDefaultUnitMap.set(name, unitName);
                    }
                });
                setMetricCategoryDefaultUnitMap(nextDefaultUnitMap);
                setPhaseMappings(
                    (phases?.items ?? [])
                        .map((item: any) => ({
                            id: Number(item.id),
                            name: String(item.name ?? "").trim(),
                            stage: String(item.phasestage ?? item.stage ?? "").trim(),
                        }))
                        .filter((item: any) => item.name && Number.isFinite(item.id))
                        .sort((a: any, b: any) => a.id - b.id),
                );

                // Set persona options with IDs
                setPersonaOptions(
                    (personas?.items ?? [])
                        .filter((item: any) => item.id && item.name)
                        .map((item: any) => ({ 
                            label: String(item.name ?? "").trim(), 
                            value: String(item.id) 
                        })),
                );

                // Process vendor-model mappings
                const vendorMap = new Map<string, Map<number, { id: number; name: string }>>();
                (vendorModels?.items ?? []).forEach((item: any) => {
                    const vendorName = String(item.vendorName ?? "").trim();
                    const productName = String(item.productName ?? "").trim();
                    const vendorModelId = Number(item.id);
                    if (!vendorName || !vendorModelId || isNaN(vendorModelId)) return;

                    if (!vendorMap.has(vendorName)) {
                        vendorMap.set(vendorName, new Map());
                    }
                    // Use product name if available, otherwise use vendor name
                    const displayName = productName || vendorName;
                    // Use Map to deduplicate by ID (prevents duplicate entries with same ID)
                    vendorMap.get(vendorName)?.set(vendorModelId, { id: vendorModelId, name: displayName });
                });

                // Set vendor options
                setVendorOptions(
                    Array.from(vendorMap.keys())
                        .sort()
                        .map((name: string) => ({ label: name, value: name }))
                );

                // Store vendor-model mapping for later use - convert Maps to sorted arrays
                const vendorModelsMap = new Map<string, { id: number; name: string }[]>();
                vendorMap.forEach((modelsMap, vendor) => {
                    const modelsList = Array.from(modelsMap.values())
                        .filter((m: any) => m && m.id && m.name)
                        .sort((a: any, b: any) => a.name.localeCompare(b.name));
                    if (modelsList.length > 0) {
                        vendorModelsMap.set(vendor, modelsList);
                    }
                });
                setVendorModelsData(vendorModelsMap);

                // Set knowledge source options
                setKnowledgeSourceOptions(
                    (knowledgeSources?.items ?? [])
                        .filter((item: any) => item?.id && item?.name)
                        .map((item: any) => ({
                        label: String(item.name ?? "").trim(),
                        value: String(item.id),
                        }))
                        .filter((x: any) => x.label && x.value)
                        .sort((a: any, b: any) => a.label.localeCompare(b.label)),
                );

                const riceItems = Array.isArray(riceMappings?.items) ? riceMappings.items : [];
                const impactOptions = riceItems
                    .filter((item: any) => String(item.categoryHeader ?? "").toLowerCase().includes("impact"))
                    .map((item: any) => ({
                        label: String(item.categoryDisplay ?? "").trim(),
                        value: String(item.categoryValue ?? "").trim(),
                    }))
                    .filter((item: any) => item.label && item.value);
                const confidenceOptions = riceItems
                    .filter((item: any) => String(item.categoryHeader ?? "").toLowerCase().includes("confidence"))
                    .map((item: any) => ({
                        label: String(item.categoryDisplay ?? "").trim(),
                        value: String(item.categoryValue ?? "").trim(),
                    }))
                    .filter((item: any) => item.label && item.value);
                setRiceImpactOptions(impactOptions);
                setRiceConfidenceOptions(confidenceOptions);

                setDeliveryOptions(
                    (timespans?.items ?? [])
                        .map((item: any) => ({
                            id: Number(item.id),
                            value: String(item.timespan ?? "").trim(),
                        }))
                        .filter((item: any) => item.value && Number.isFinite(item.id))
                        .map((item: any) => ({ value: item.value, label: item.value })),
                );
                setDeliveryIdMap(() => {
                    const next = new Map<string, number>();
                    (timespans?.items ?? []).forEach((item: any) => {
                        const value = String(item.timespan ?? "").trim();
                        const id = Number(item.id);
                        if (value && Number.isFinite(id)) {
                            next.set(value, id);
                        }
                    });
                    return next;
                });

                setReportingFrequencyOptions(
                    (reportingFrequencies?.items ?? [])
                        .map((item: any) => ({
                            id: Number(item.id),
                            value: String(item.frequency ?? "").trim(),
                        }))
                        .filter((item: any) => item.value && Number.isFinite(item.id))
                        .map((item: any) => ({ value: item.value, label: item.value })),
                );
                setReportingFrequencyIdMap(() => {
                    const next = new Map<string, number>();
                    (reportingFrequencies?.items ?? []).forEach((item: any) => {
                        const value = String(item.frequency ?? "").trim();
                        const id = Number(item.id);
                        if (value && Number.isFinite(id)) {
                            next.set(value, id);
                        }
                    });
                    return next;
                });

                if (roleOptions.length === 0 && Array.isArray(roles?.items)) {
                    const items = roles.items
                        .map((item: any) => ({
                            id: Number(item.id),
                            name: String(item.name ?? "").trim(),
                            roleType: String(item.roleType ?? "").trim(),
                        }))
                        .filter((item: RoleOption) => Number.isFinite(item.id) && item.name);
                    setRoleOptions(items);
                }
                if (Array.isArray(aiProductQuestions?.items)) {
                    setAiProductQuestionsData(aiProductQuestions.items as AiProductQuestion[]);
                }
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
            }
        };
        fetchDropdownData();
    }, []);

    // Update model options when vendor changes
    useEffect(() => {
        if (!selectedVendor || vendorModelsData.size === 0) {
            setModelOptions([]);
            setSelectedModel('');
            return;
        }

        const models = vendorModelsData.get(selectedVendor) || [];
        setModelOptions(
            models
                .filter((model: { id: number; name: string }) => model.id && model.name)
                .map((model: { id: number; name: string }) => ({ 
                    label: model.name, 
                    value: String(model.id) 
                }))
        );
        // Reset selected model if it's not available for the new vendor
        if (selectedModel && !models.find((m: { id: number; name: string }) => String(m.id) === selectedModel)) {
            setSelectedModel('');
        }
    }, [selectedVendor, vendorModelsData, selectedModel]);

    useEffect(() => {
        if (activeTab !== "update" || roleOptions.length > 0) return;

        let isMounted = true;

        const fetchRoles = async () => {
            try {
                const data = await getMappings(["roles"]);
                if (!isMounted) return;
                const items = (data.roles?.items ?? [])
                    .map((item: any) => ({
                        id: Number(item.id),
                        name: String(item.name ?? "").trim(),
                        roleType: String(item.roleType ?? "").trim(),
                    }))
                    .filter((item: RoleOption) => Number.isFinite(item.id) && item.name);
                setRoleOptions(items);
            } catch (error) {
                console.error("Error fetching role mappings:", error);
            }
        };

        fetchRoles();
        return () => {
            isMounted = false;
        };
    }, [activeTab, roleOptions.length]);

    useEffect(() => {
        const planRows = (useCaseDetails?.plan ?? []) as PlanItem[];
        const stakeholderRows = (useCaseDetails?.stakeholders ?? []) as StakeholderItem[];
        const updateRows = (useCaseDetails?.updates ?? []) as UpdateItem[];

        setPlanItems(planRows);
        setStakeholderItems(stakeholderRows);
        setUpdateItems(updateRows);

        if (!isTimelineEditing) {
            const nextPhaseDates: Record<string, { start?: Date; end?: Date }> = {};
            planRows.forEach((row) => {
                const phaseName = String(row.phaseName ?? "").trim();
                if (!phaseName) return;
                nextPhaseDates[phaseName] = {
                    start: row.startDate ? new Date(row.startDate) : undefined,
                    end: row.endDate ? new Date(row.endDate) : undefined,
                };
            });
            if (Object.keys(nextPhaseDates).length > 0) {
                setPhaseDates((prev) => ({
                    ...prev,
                    ...nextPhaseDates,
                }));
            }
        }

        const mappedUpdates = updateRows
            .map((row) => {
                const created = row.created ?? row.modified;
                const timeLabel = created ? format(new Date(created), "MMM d, yyyy") : "";
                return {
                    id: Number(row.id ?? 0),
                    author: String(row.editorEmail ?? "").trim() || "Unknown",
                    role: String(row.roleName ?? "").trim(),
                    phase: String(row.phaseName ?? "").trim(),
                    status: String(row.statusName ?? "").trim(),
                    statusColor: String(row.statusColor ?? "").trim(),
                    content: String(row.meaningfulUpdate ?? "").trim(),
                    time: timeLabel,
                    type: "comment",
                };
            })
            .filter((row) => row.content);

        setUpdates(mappedUpdates);
    }, [useCaseDetails?.plan, useCaseDetails?.stakeholders, useCaseDetails?.updates, isTimelineEditing]);

    useEffect(() => {
        setIsUpdateDataLoading(loading);
    }, [loading]);

    useEffect(() => {
        if (!stakeholderItems.length) {
            setStakeholders([]);
            return;
        }

        const nextStakeholders = stakeholderItems
            .map((item) => {
                const roleName = String(item.roleName ?? "").trim();
                const email = String(item.stakeholderEmail ?? "").trim();
                if (!roleName || isChampionDelegateRole(roleName)) {
                    return null;
                }
                const roleOption =
                    roleOptions.find((role) => role.id === Number(item.roleId)) ??
                    roleOptions.find(
                        (role) => normalizeRoleName(role.name) === normalizeRoleName(roleName),
                    );
                const roleType = roleOption?.roleType ?? "";
                const canEdit = roleType === "2" && !isOwnerRole(roleName);
                return {
                    id: item.id ?? null,
                    name: email || "Unknown",
                    role: roleName,
                    initial: buildInitials(email || roleName),
                    canEdit,
                    roleId: item.roleId ?? null,
                };
            })
            .filter(Boolean) as {
                name: string;
                role: string;
                initial: string;
                canEdit: boolean;
                roleId?: number | null;
            }[];

        setStakeholders(nextStakeholders);
    }, [stakeholderItems, roleOptions]);

    useEffect(() => {
        if (!phaseMappings.length) return;
        setPhaseDates((prev) => {
            const next: Record<string, { start?: Date; end?: Date }> = { ...prev };
            phaseMappings.forEach((phase) => {
                if (!next[phase.name]) {
                    next[phase.name] = { start: undefined, end: undefined };
                }
            });
            return next;
        });
    }, [phaseMappings]);

    // Populate agent library form from fetched data
    useEffect(() => {
        if (!agentLibraryItems.length || !themeOptions.length || !personaOptions.length || vendorModelsData.size === 0) {
            return;
        }

        const agentData = agentLibraryItems[0];

        // Populate AI themes
        if (agentData.aiThemeIds && Array.isArray(agentData.aiThemeIds) && agentData.aiThemeIds.length > 0) {
            const uniqueThemeIds = [...new Set(agentData.aiThemeIds)];
            setEditableAITheme(uniqueThemeIds.map(id => String(id)));
        }

        // Populate personas
        if (agentData.personaIds && Array.isArray(agentData.personaIds) && agentData.personaIds.length > 0) {
            const uniquePersonaIds = [...new Set(agentData.personaIds)];
            setSelectedPersonas(uniquePersonaIds.map(id => String(id)));
        }

        // Populate vendor and model
        if (agentData.vendormodelid) {
            const vendorModelId = Number(agentData.vendormodelid);
            // Find which vendor this model belongs to
            for (const [vendorName, models] of vendorModelsData.entries()) {
                const foundModel = models.find(m => m.id === vendorModelId);
                if (foundModel) {
                    setSelectedVendor(vendorName);
                    setSelectedModel(String(vendorModelId));
                    break;
                }
            }
        }

        // Populate knowledge sources
        const ks = (agentData as any).knowledgeSourceIds;
        if (Array.isArray(ks) && ks.length > 0) {
        setSelectedKnowledgeSources([...new Set(ks)].map((x) => String(x)));
        }

        // Populate agent info
        if (agentData.agentid) {
            setAgentId(String(agentData.agentid));
        }
        if (agentData.agentlink) {
            setAgentLink(String(agentData.agentlink));
        }
        if (agentData.prompt) {
            setInstructions(String(agentData.prompt));
        }
    }, [agentLibraryItems, themeOptions, personaOptions, vendorModelsData]);

    const handleFormDataChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleStartReprioritizeEdit = useCallback(() => {
        reprioritizeSnapshotRef.current = { ...formData };
        setIsReprioritizeEditing(true);
    }, [formData]);

    const handleCancelReprioritizeEdit = useCallback(() => {
        if (reprioritizeSnapshotRef.current) {
            setFormData(reprioritizeSnapshotRef.current);
        }
        reprioritizeSnapshotRef.current = null;
        setIsReprioritizeEditing(false);
    }, []);

    const handleApplyReprioritizeChanges = useCallback(async () => {
        const previous = reprioritizeSnapshotRef.current;
        const current = formData;
        const hasChanged = (prevValue: string, nextValue: string) => prevValue !== nextValue;

        const payload: Record<string, unknown> = {
            editorEmail: accounts[0]?.username ?? "",
        };

        if (!previous || hasChanged(previous.reach, current.reach)) payload.reach = current.reach || null;
        if (!previous || hasChanged(previous.impact, current.impact)) payload.impact = current.impact || null;
        if (!previous || hasChanged(previous.confidence, current.confidence)) payload.confidence = current.confidence || null;
        if (!previous || hasChanged(previous.effort, current.effort)) payload.effort = current.effort || null;
        if (!previous || hasChanged(previous.riceScore, current.riceScore)) payload.riceScore = current.riceScore || null;
        if (!previous || hasChanged(previous.priority, current.priority)) payload.priority = current.priority || null;
        if (!previous || hasChanged(previous.totalUserBase, current.totalUserBase)) {
            payload.totalUserBase = current.totalUserBase || null;
        }
        if (!previous || previous.displayInGallery !== current.displayInGallery) {
            payload.displayInGallery = current.displayInGallery;
        }
        if (!previous || previous.sltReporting !== current.sltReporting) {
            payload.sltReporting = current.sltReporting;
        }
        if (!previous || hasChanged(previous.delivery, current.delivery)) {
            payload.timespanId = current.delivery ? deliveryIdMap.get(current.delivery) ?? null : null;
        }
        if (!previous || hasChanged(previous.reportingFrequency, current.reportingFrequency)) {
            payload.reportingFrequencyId = current.reportingFrequency
                ? reportingFrequencyIdMap.get(current.reportingFrequency) ?? null
                : null;
        }

        const payloadKeys = Object.keys(payload).filter((key) => key !== "editorEmail");
        if (payloadKeys.length === 0) {
            setIsReprioritizeEditing(false);
            return;
        }

        try {
            const response = await fetch(`/api/usecases/${id}/prioritize`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const details = await response.text().catch(() => "");
                throw new Error(details || "Failed to update prioritization.");
            }
            toast.success("Prioritization updated.");
            reprioritizeSnapshotRef.current = null;
            setIsReprioritizeEditing(false);
        } catch (error) {
            console.error("Failed to update prioritization:", error);
            toast.error("Failed to update prioritization.");
        }
    }, [
        accounts,
        deliveryIdMap,
        formData,
        id,
        reportingFrequencyIdMap,
    ]);

    const parseBool = (value: unknown) => {
        const normalized = String(value ?? "").trim().toLowerCase();
        if (!normalized) return false;
        return ["true", "1", "yes", "y"].includes(normalized);
    };

    useEffect(() => {
        if (activeTab !== "reprioritize") return;
        if (isReprioritizeEditing) return;
        const item = useCaseDetails?.prioritize;
        if (!item) return;

        const deliveryValue = Array.from(deliveryIdMap.entries()).find(
            ([, value]) => value === Number((item as any).timespanid),
        )?.[0] ?? "";
        const reportingValue = Array.from(reportingFrequencyIdMap.entries()).find(
            ([, value]) => value === Number((item as any).reportingfrequencyid),
        )?.[0] ?? "";

        setFormData({
            reach: String((item as any).reach ?? "").trim(),
            impact: String((item as any).impact ?? "").trim(),
            confidence: String((item as any).confidence ?? "").trim(),
            effort: String((item as any).effort ?? "").trim(),
            riceScore: String((item as any).ricescore ?? "").trim(),
            priority: String((item as any).priority ?? "").trim(),
            delivery: deliveryValue,
            totalUserBase: String((item as any).totaluserbase ?? "").trim(),
            displayInGallery: parseBool((item as any).aigallerydisplay),
            sltReporting: parseBool((item as any).sltreporting),
            reportingFrequency: reportingValue,
        });
    }, [activeTab, deliveryIdMap, reportingFrequencyIdMap, isReprioritizeEditing, useCaseDetails?.prioritize]);

    const riceScoreValue = useMemo(() => {
        const reach = Number(formData.reach);
        const impact = Number(formData.impact);
        const confidence = Number(formData.confidence);
        const effort = Number(formData.effort);
        if (!Number.isFinite(reach) || reach <= 0) return "";
        if (!Number.isFinite(impact) || impact <= 0) return "";
        if (!Number.isFinite(confidence) || confidence <= 0) return "";
        if (!Number.isFinite(effort) || effort <= 0) return "";
        const score = (reach * impact * confidence) / effort;
        if (!Number.isFinite(score)) return "";
        const rounded = Math.round(score * 100) / 100;
        return String(rounded);
    }, [formData.reach, formData.impact, formData.confidence, formData.effort]);

    useEffect(() => {
        if (!riceScoreValue && !isReprioritizeEditing) return;
        setFormData((prev) =>
            prev.riceScore === riceScoreValue ? prev : { ...prev, riceScore: riceScoreValue },
        );
    }, [riceScoreValue, isReprioritizeEditing]);

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



    const approvalHistory: {
        phase: string;
        approver: string;
        status: string;
        date: string;
    }[] = [];



    const handleApprovalSubmit = () => {
        toast.success('Decision submitted successfully');
    };

    const handleClearDecision = () => {
        setDecision('');
        setComments('');
    };



    const handleUpdateStakeholder = async () => {
        if (!stakeholderName || !stakeholderRole) return;
        if (!id) {
            toast.error("Missing use case id.");
            return;
        }

        try {
            const roleOption = roleOptions.find(
                (role) => normalizeRoleName(role.name) === normalizeRoleName(stakeholderRole),
            );
            if (!roleOption) {
                toast.error("Select a valid role.");
                return;
            }

            const editorEmail = accounts?.[0]?.username ?? accounts?.[0]?.name ?? "";
            const payload: {
                id?: number | null;
                roleId: number;
                stakeholderEmail: string;
                editorEmail?: string;
            } = {
                roleId: roleOption.id,
                stakeholderEmail: stakeholderName.trim(),
                editorEmail,
            };

            if (editingIndex !== null) {
                payload.id = stakeholders[editingIndex]?.id ?? null;
                if (!payload.id) {
                    toast.error("Missing stakeholder id.");
                    return;
                }
            }

            const response = await fetch(`/api/usecases/${id}/stakeholders`, {
                method: editingIndex !== null ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to update stakeholder.");
            }

            const data = await response.json();
            const item = data?.item;
            if (item) {
                const normalizedItem: StakeholderItem = {
                    id: Number(item.id ?? payload.id ?? null),
                    useCaseId: Number(item.useCaseId ?? item.usecaseid ?? id ?? null),
                    roleId: Number(item.roleId ?? item.roleid ?? roleOption.id),
                    roleName: String(item.roleName ?? item.role ?? roleOption.name ?? "").trim() || null,
                    stakeholderEmail: String(
                        item.stakeholderEmail ?? item.stakeholder_email ?? stakeholderName.trim(),
                    ).trim() || null,
                    modified: item.modified ?? null,
                    created: item.created ?? null,
                    editorEmail: item.editorEmail ?? item.editor_email ?? editorEmail ?? null,
                };
                setStakeholderItems((prev) => {
                    if (editingIndex !== null && payload.id) {
                        return prev.map((row) =>
                            String(row.id) === String(payload.id) ? normalizedItem : row,
                        );
                    }
                    return [...prev, normalizedItem];
                });
            }

            toast.success(
                editingIndex !== null
                    ? "Stakeholder updated successfully"
                    : "Stakeholder added successfully",
            );

            setIsDialogOpen(false);
            setStakeholderName("");
            setStakeholderRole("");
            setEditingIndex(null);
        } catch (error) {
            console.error("Failed to update stakeholder:", error);
            toast.error("Failed to update stakeholder.");
        }
    };

    const handleEditStakeholder = (index: number) => {
        const stakeholder = stakeholders[index];
        if (!stakeholder?.canEdit) {
            return;
        }
        setStakeholderName(stakeholder.name);
        setStakeholderRole(stakeholder.role);
        setEditingIndex(index);
        setIsDialogOpen(true);
    };

    const handleDeleteStakeholder = (index: number) => {
        setStakeholders(prev => prev.filter((_, idx) => idx !== index));
        toast.success('Stakeholder deleted successfully');
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setStakeholderName('');
        setStakeholderRole('');
        setEditingIndex(null);
    };

    const handlePostUpdate = async () => {
        if (!id) {
            toast.error("Missing use case id.");
            return;
        }
        const trimmedUpdate = updateText.trim();
        if (!trimmedUpdate) return;

        try {
            const editorEmail = accounts?.[0]?.username ?? accounts?.[0]?.name ?? "";
            if (!editorEmail) {
                toast.error("Missing user email.");
                return;
            }

            const response = await fetch(`/api/usecases/${id}/updates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meaningfulUpdate: trimmedUpdate,
                    editorEmail,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add update.");
            }

            const data = await response.json();
            const item = data?.item;
            const roleFromStakeholder = stakeholderItems.find(
                (entry) =>
                    String(entry.stakeholderEmail ?? "").trim().toLowerCase() ===
                    editorEmail.toLowerCase(),
            );
            const roleLabel =
                String(roleFromStakeholder?.roleName ?? "").trim() ||
                roleOptions.find((role) => role.id === Number(item?.roleId ?? item?.roleid))?.name ||
                "Stakeholder";
            const createdAt = item?.created ?? item?.modified ?? new Date().toISOString();
            const newUpdate = {
                id: Number(item?.id ?? Date.now()),
                author: editorEmail,
                role: roleLabel,
                phase: useCase.phase || undefined,
                status: useCase.statusName || undefined,
                statusColor: useCase.statusColor || undefined,
                content: trimmedUpdate,
                time: format(new Date(createdAt), "MMM d, yyyy"),
                type: "comment",
            };
            const normalizedUpdateItem: UpdateItem = {
                id: Number(item?.id ?? Date.now()),
                useCaseId: Number(item?.useCaseId ?? item?.usecaseid ?? id ?? null),
                meaningfulUpdate: String(item?.meaningfulUpdate ?? item?.meaningfulupdate ?? trimmedUpdate).trim() || null,
                roleId: Number(item?.roleId ?? item?.roleid ?? null),
                roleName: roleLabel,
                useCasePhaseId: Number(item?.useCasePhaseId ?? item?.usecasephaseid ?? null),
                phaseName: String(item?.phaseName ?? item?.phase_name ?? useCase.phase ?? "").trim() || null,
                useCaseStatusId: Number(item?.useCaseStatusId ?? item?.usecasestatusid ?? null),
                statusName: String(item?.statusName ?? item?.status_name ?? useCase.statusName ?? "").trim() || null,
                statusColor: String(item?.statusColor ?? item?.status_color ?? useCase.statusColor ?? "").trim() || null,
                modified: item?.modified ?? null,
                created: item?.created ?? null,
                editorEmail: editorEmail || null,
            };
            setUpdates((prev) => [newUpdate, ...prev]);
            setUpdateItems((prev) => [normalizedUpdateItem, ...prev]);
            setUpdateText("");
            toast.success("Update posted successfully!");
        } catch (error) {
            console.error("Update post failed:", error);
            toast.error("Failed to post update.");
        }
    };

    const resetEditableFields = useCallback(() => {
        setEditableTitle(useCase.title);
        setEditableHeadline(useCase.headlines);
        setEditableOpportunity(useCase.opportunity);
        setEditableEvidence(useCase.businessValue);
        setEditableContactPerson(useCase.primaryContact);
        const selectedThemes = (useCaseDetails?.themes ?? [])
            .map((theme) => String(theme.themeName ?? "").trim())
            .filter(Boolean);
        setEditableAITheme(selectedThemes);
    }, [
        useCase.title,
        useCase.headlines,
        useCase.opportunity,
        useCase.businessValue,
        useCase.primaryContact,
        useCaseDetails?.themes,
    ]);

    const handleApplyChanges = useCallback(async () => {
        try {
            const editorEmail = accounts?.[0]?.username ?? accounts?.[0]?.name ?? "";
            const snapshot = infoSnapshotRef.current;
            const diffPayload: Record<string, unknown> = {};

            if (!snapshot || snapshot.title !== editableTitle) {
                diffPayload.title = editableTitle;
            }
            if (!snapshot || snapshot.headline !== editableHeadline) {
                diffPayload.headlines = editableHeadline;
            }
            if (!snapshot || snapshot.opportunity !== editableOpportunity) {
                diffPayload.opportunity = editableOpportunity;
            }
            if (!snapshot || snapshot.evidence !== editableEvidence) {
                diffPayload.businessValue = editableEvidence;
            }

            if (Object.keys(diffPayload).length === 0) {
                setIsEditing(false);
                infoSnapshotRef.current = null;
                return;
            }

            await updateUseCaseInfo(id, {
                ...diffPayload,
                editorEmail,
            });
            toast.success('Changes saved');
            setIsEditing(false);
            infoSnapshotRef.current = null;
        } catch (error) {
            console.error("Failed to update use case info:", error);
            toast.error("Failed to save changes.");
        }
    }, [accounts, editableTitle, editableHeadline, editableOpportunity, editableEvidence, id]);

    const handleCancelEdit = useCallback(() => {
        resetEditableFields();
        setIsEditing(false);
        infoSnapshotRef.current = null;
    }, [resetEditableFields]);

    const handleStartInfoEdit = useCallback(() => {
        infoSnapshotRef.current = {
            title: editableTitle,
            headline: editableHeadline,
            opportunity: editableOpportunity,
            evidence: editableEvidence,
        };
        setIsEditing(true);
    }, [editableEvidence, editableHeadline, editableOpportunity, editableTitle]);

    const normalizeChecklistResponse = (value: unknown) => {
        if (Array.isArray(value)) {
            return value.map((entry) => String(entry).trim()).filter(Boolean).join(", ");
        }
        if (value === null || value === undefined) return "";
        return String(value).trim();
    };

    const handleStartChecklistEdit = useCallback(() => {
        const current = checklistForm.getValues("checklistResponses") ?? {};
        checklistSnapshotRef.current = { ...current };
        setIsChecklistEditing(true);
    }, [checklistForm]);

    const handleCancelChecklistEdit = useCallback(() => {
        checklistForm.reset({ checklistResponses: checklistSnapshotRef.current ?? {} });
        setIsChecklistEditing(false);
    }, [checklistForm]);

    const handleApplyChecklistChanges = useCallback(async () => {
        const current = checklistForm.getValues("checklistResponses") ?? {};
        const snapshot = checklistSnapshotRef.current ?? {};
        const diffItems = checklistQuestions.reduce<{ questionId: number; response: string | null }[]>(
            (acc, question) => {
                const key = question.responseKey;
                const currentValue = normalizeChecklistResponse((current as Record<string, unknown>)[key]);
                const previousValue = normalizeChecklistResponse((snapshot as Record<string, unknown>)[key]);
                if (currentValue === previousValue) return acc;
                const questionId = Number(question.id);
                if (!Number.isFinite(questionId)) return acc;
                acc.push({
                    questionId,
                    response: currentValue ? currentValue : null,
                });
                return acc;
            },
            [],
        );

        if (diffItems.length === 0) {
            setIsChecklistEditing(false);
            return;
        }

        try {
            const editorEmail = accounts?.[0]?.username ?? accounts?.[0]?.name ?? "";
            await updateUseCaseChecklist(id, { editorEmail, items: diffItems });
            await refetch();
            toast.success("Checklist updated successfully");
            setIsChecklistEditing(false);
        } catch (error) {
            console.error("Failed to update checklist:", error);
            toast.error("Failed to update checklist.");
        }
    }, [accounts, checklistForm, checklistQuestions, id, refetch]);

    const resetAgentLibraryFields = useCallback(() => {
        if (agentLibraryItems.length > 0) {
            const item = agentLibraryItems[0];
            setEditableAITheme([]);
            setSelectedPersonas([]);
            setSelectedVendor('');
            setSelectedModel('');
            setAgentId(String(item.agentid ?? ''));
            setAgentLink(String(item.agentlink ?? ''));
            setSelectedKnowledgeSources([]);
            setInstructions(String(item.prompt ?? ''));
        }
    }, [agentLibraryItems]);

    const handleStartAgentLibraryEdit = useCallback(() => {
        agentLibrarySnapshotRef.current = {
            selectedAIThemes: [...editableAITheme],
            selectedPersonas: [...selectedPersonas],
            selectedVendor: selectedVendor || "",
            selectedModel: selectedModel || "",
            agentId: agentId || "",
            agentLink: agentLink || "",
            selectedKnowledgeSources: [...selectedKnowledgeSources],
            instructions: instructions || "",
        };
        setIsAgentLibraryEditing(true);
    }, [
        editableAITheme,
        selectedPersonas,
        selectedVendor,
        selectedModel,
        agentId,
        agentLink,
        selectedKnowledgeSources,
        instructions,
    ]);

    const handleCancelAgentLibraryEdit = useCallback(() => {
        if (agentLibrarySnapshotRef.current) {
            setEditableAITheme(agentLibrarySnapshotRef.current.selectedAIThemes);
            setSelectedPersonas(agentLibrarySnapshotRef.current.selectedPersonas);
            setSelectedVendor(agentLibrarySnapshotRef.current.selectedVendor);
            setSelectedModel(agentLibrarySnapshotRef.current.selectedModel);
            setAgentId(agentLibrarySnapshotRef.current.agentId);
            setAgentLink(agentLibrarySnapshotRef.current.agentLink);
            setSelectedKnowledgeSources(agentLibrarySnapshotRef.current.selectedKnowledgeSources);
            setInstructions(agentLibrarySnapshotRef.current.instructions);
        } else {
            resetAgentLibraryFields();
        }
        setIsAgentLibraryEditing(false);
    }, [resetAgentLibraryFields]);

    const handleStartMetricsEdit = useCallback(() => {
        metricsSnapshotRef.current = {
            metrics: metrics.map((metric) => ({ ...metric })),
            reportedMetrics: reportedMetrics.map((metric) => ({ ...metric })),
            reportedHistory: reportedHistory.map((item) => ({ ...item })),
        };
        setIsMetricsEditing(true);
    }, [metrics, reportedMetrics, reportedHistory]);

    const handleCancelMetricsEdit = useCallback(() => {
        if (metricsSnapshotRef.current) {
            setMetrics(metricsSnapshotRef.current.metrics);
            setReportedMetrics(metricsSnapshotRef.current.reportedMetrics);
            setReportedHistory(metricsSnapshotRef.current.reportedHistory);
        }
        setIsMetricsEditing(false);
    }, []);

    const handleApplyAgentLibraryChanges = useCallback(async () => {
        try {
            // Get the first agent library item ID if it exists
            const agentLibraryId = agentLibraryItems.length > 0 ? agentLibraryItems[0].id : null;
            
            // Get vendorModelId from selected model
            let vendorModelId: number | null = null;
            if (selectedModel) {
                vendorModelId = parseInt(selectedModel) || null;
            }

            // Get user email from MSAL context
            const userEmail = accounts[0]?.username ?? '';

            const snapshot = agentLibrarySnapshotRef.current;
            const normalizeList = (list: string[]) =>
                Array.from(
                    new Set(
                        list
                            .map((value) => String(value).trim())
                            .filter(Boolean),
                    ),
                ).sort();
            const listChanged = (current: string[], previous: string[]) => {
                const a = normalizeList(current);
                const b = normalizeList(previous);
                if (a.length !== b.length) return true;
                return a.some((value, index) => value !== b[index]);
            };
            const normalizeValue = (value: string) => String(value ?? "").trim();

            const payload: Record<string, unknown> = { editorEmail: userEmail };

            if (agentLibraryId) {
                payload.agentLibraryId = agentLibraryId;
            }

            const currentThemes = editableAITheme;
            const previousThemes = snapshot?.selectedAIThemes ?? [];
            if (!snapshot || listChanged(currentThemes, previousThemes)) {
                payload.aiThemeIds = currentThemes
                    .map((id) => parseInt(id))
                    .filter((id) => !isNaN(id) && id > 0);
            }

            const currentPersonas = selectedPersonas;
            const previousPersonas = snapshot?.selectedPersonas ?? [];
            if (!snapshot || listChanged(currentPersonas, previousPersonas)) {
                payload.personaIds = currentPersonas
                    .map((id) => parseInt(id))
                    .filter((id) => !isNaN(id) && id > 0);
            }

            const currentKnowledgeSources = selectedKnowledgeSources;
            const previousKnowledgeSources = snapshot?.selectedKnowledgeSources ?? [];
            if (!snapshot || listChanged(currentKnowledgeSources, previousKnowledgeSources)) {
                payload.knowledgeSourceIds = currentKnowledgeSources
                    .map((id) => parseInt(id))
                    .filter((id) => !isNaN(id) && id > 0);
            }

            const prevModelId = snapshot?.selectedModel
                ? parseInt(snapshot.selectedModel) || null
                : null;
            if (!snapshot || prevModelId !== vendorModelId) {
                payload.vendorModelId = vendorModelId;
            }

            if (!snapshot || normalizeValue(snapshot.agentId) !== normalizeValue(agentId)) {
                payload.agentId = agentId || null;
            }
            if (!snapshot || normalizeValue(snapshot.agentLink) !== normalizeValue(agentLink)) {
                payload.agentLink = agentLink || null;
            }
            if (!snapshot || normalizeValue(snapshot.instructions) !== normalizeValue(instructions)) {
                payload.prompt = instructions || null;
            }

            const payloadKeys = Object.keys(payload).filter((key) => key !== "editorEmail");
            if (payloadKeys.length === 0) {
                setIsAgentLibraryEditing(false);
                agentLibrarySnapshotRef.current = null;
                return;
            }

            const response = await fetch(`/api/usecases/${id}/agent-library`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update agent library');
            }

            toast.success('Agent Library changes saved successfully');
            setIsAgentLibraryEditing(false);
            agentLibrarySnapshotRef.current = null;
            
            // Optionally refetch the data
            // await refetchAgentLibrary();
        } catch (error) {
            console.error('Error updating agent library:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save agent library changes');
        }
    }, [
        accounts,
        agentId,
        agentLibraryItems,
        agentLink,
        editableAITheme,
        id,
        instructions,
        selectedKnowledgeSources,
        selectedModel,
        selectedPersonas,
    ]);

    const handleOpenDateDialog = (phase: string) => {
        if (!isTimelineEditing) return;
        setEditingPhase(phase);
        setTempStartDate(phaseDates[phase]?.start);
        setTempEndDate(phaseDates[phase]?.end);
        setIsDateDialogOpen(true);
    };

    const handleToggleTimelineEdit = () => {
        timelineSnapshotRef.current = Object.keys(phaseDates).reduce(
            (acc, key) => {
                const value = phaseDates[key];
                acc[key] = {
                    start: value?.start ? new Date(value.start) : undefined,
                    end: value?.end ? new Date(value.end) : undefined,
                };
                return acc;
            },
            {} as Record<string, { start?: Date; end?: Date }>,
        );
        setIsTimelineEditing(true);
    };

    const handleSaveTimeline = async () => {
        if (!id) {
            toast.error("Missing use case id.");
            return;
        }
        try {
            const editorEmail = accounts?.[0]?.username ?? accounts?.[0]?.name ?? "";
            const snapshot = timelineSnapshotRef.current;
            const items = phaseMappings
                .map((phase) => {
                    const dates = phaseDates[phase.name];
                    if (!dates?.start || !dates?.end) return null;
                    const nextItem = {
                        usecasephaseid: phase.id,
                        startdate: format(dates.start, "yyyy-MM-dd"),
                        enddate: format(dates.end, "yyyy-MM-dd"),
                    };

                    if (!snapshot) return nextItem;
                    const prev = snapshot[phase.name];
                    if (!prev?.start || !prev?.end) return nextItem;
                    const prevStart = format(prev.start, "yyyy-MM-dd");
                    const prevEnd = format(prev.end, "yyyy-MM-dd");
                    if (prevStart === nextItem.startdate && prevEnd === nextItem.enddate) {
                        return null;
                    }
                    return nextItem;
                })
                .filter(Boolean);

            const hasAnyDates = phaseMappings.some((phase) => {
                const dates = phaseDates[phase.name];
                return Boolean(dates?.start && dates?.end);
            });
            if (!hasAnyDates) {
                toast.error("Add start and end dates before saving.");
                return;
            }
            if (!items.length) {
                toast.success("No timeline changes to save.");
                setIsTimelineEditing(false);
                timelineSnapshotRef.current = null;
                return;
            }

            const response = await fetch(`/api/usecases/${id}/plan`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, editorEmail }),
            });

            if (!response.ok) {
                throw new Error("Failed to save timeline.");
            }
            toast.success("Timeline saved");
            setIsTimelineEditing(false);
            timelineSnapshotRef.current = null;
        } catch (error) {
            console.error("Failed to save timeline:", error);
            toast.error("Failed to save timeline.");
        }
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

    const handleInputChange = useCallback((id: number | string, field: string, value: string) => {
        // Update main metrics state
        setMetrics((prev) =>
            prev.map((metric) => {
                if (String(metric.id) !== String(id)) return metric;
                if (field === "parcsCategory") {
                    const defaultUnit = metricCategoryDefaultUnitMap.get(value);
                    return {
                        ...metric,
                        parcsCategory: value,
                        unitOfMeasurement: defaultUnit ?? metric.unitOfMeasurement,
                    };
                }
                return { ...metric, [field]: value };
            }),
        );
    }, [metricCategoryDefaultUnitMap]);

    const handleDeleteMetric = useCallback((id: number | string) => {
        setMetrics(prev => prev.filter(metric => String(metric.id) !== String(id)));
        setReportedMetrics(prev => prev.filter(metric => String(metric.id) !== String(id)));
        setReportedHistory(prev => prev.filter(metric => String(metric.metricId) !== String(id)));
        toast.success('Metric deleted successfully');
    }, []);

    const handleRequestDeleteMetric = useCallback((id: number | string) => {
        setPendingDeleteMetricId(Number(id));
        setIsDeleteMetricDialogOpen(true);
    }, []);

    const handleConfirmDeleteMetric = useCallback(() => {
        if (pendingDeleteMetricId == null) {
            setIsDeleteMetricDialogOpen(false);
            return;
        }
        handleDeleteMetric(pendingDeleteMetricId);
        setPendingDeleteMetricId(null);
        setIsDeleteMetricDialogOpen(false);
    }, [handleDeleteMetric, pendingDeleteMetricId]);

    const handleCancelDeleteMetric = useCallback(() => {
        setPendingDeleteMetricId(null);
        setIsDeleteMetricDialogOpen(false);
    }, []);

    const handleDeleteReportedMetric = useCallback((id: number | string) => {
        setReportedMetrics(prev => prev.filter(metric => String(metric.id) !== String(id)));
        setReportedHistory(prev => prev.filter(metric => String(metric.metricId) !== String(id)));
        toast.success('Metric removed from reporting');
    }, []);

    const handleReportedInputChange = useCallback((id: number | string, field: string, value: string) => {
        setReportedMetrics(prev => prev.map(metric =>
            String(metric.id) === String(id) ? { ...metric, [field]: value } : metric
        ));
    }, []);

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

    const handleApplyMetricsEdit = useCallback(async () => {
        if (!isMetricsFormValid) {
            toast.error("Fill all metric fields and ensure target dates are after baseline and today.");
            return;
        }
        if (!id) {
            toast.error("Missing use case id.");
            return;
        }
        const snapshot = metricsSnapshotRef.current;
        if (!snapshot) {
            setIsMetricsEditing(false);
            return;
        }

        const metricTypeIdByName = new Map<string, number>();
        metricCategoryMap.forEach((label, key) => {
            metricTypeIdByName.set(label, key);
        });
        const unitIdByName = new Map<string, number>();
        unitOfMeasureMap.forEach((label, key) => {
            unitIdByName.set(label, key);
        });

        const normalize = (value: string | number | null | undefined) =>
            String(value ?? "").trim();

        const snapshotMetricsById = new Map<number, Metric>();
        snapshot.metrics.forEach((metric) => snapshotMetricsById.set(metric.id, metric));
        const currentMetricsById = new Map<number, Metric>();
        metrics.forEach((metric) => currentMetricsById.set(metric.id, metric));

        const deleteMetricIds = snapshot.metrics
            .filter((metric) => !currentMetricsById.has(metric.id))
            .map((metric) => metric.id);

        const newMetrics = metrics
            .filter((metric) => !snapshotMetricsById.has(metric.id))
            .map((metric) => {
                const metricTypeId = metricTypeIdByName.get(metric.parcsCategory) ?? null;
                const unitOfMeasureId = unitIdByName.get(metric.unitOfMeasurement) ?? null;
                return {
                    metricTypeId,
                    unitOfMeasureId,
                    primarySuccessMetricName: metric.primarySuccessValue,
                    baselineValue: metric.baselineValue || null,
                    baselineDate: metric.baselineDate || null,
                    targetValue: metric.targetValue || null,
                    targetDate: metric.targetDate || null,
                };
            });

        const updateMetrics = metrics.reduce<{ id: number }[]>((acc, metric) => {
            const previous = snapshotMetricsById.get(metric.id);
            if (!previous) return acc;
            const patch: Record<string, unknown> = { id: metric.id };
            let hasChanges = false;

            if (normalize(metric.primarySuccessValue) !== normalize(previous.primarySuccessValue)) {
                patch.primarySuccessMetricName = metric.primarySuccessValue;
                hasChanges = true;
            }
            if (normalize(metric.parcsCategory) !== normalize(previous.parcsCategory)) {
                patch.metricTypeId = metric.parcsCategory
                    ? metricTypeIdByName.get(metric.parcsCategory) ?? null
                    : null;
                hasChanges = true;
            }
            if (normalize(metric.unitOfMeasurement) !== normalize(previous.unitOfMeasurement)) {
                patch.unitOfMeasureId = metric.unitOfMeasurement
                    ? unitIdByName.get(metric.unitOfMeasurement) ?? null
                    : null;
                hasChanges = true;
            }
            if (normalize(metric.baselineValue) !== normalize(previous.baselineValue)) {
                patch.baselineValue = metric.baselineValue || null;
                hasChanges = true;
            }
            if (normalize(metric.baselineDate) !== normalize(previous.baselineDate)) {
                patch.baselineDate = metric.baselineDate || null;
                hasChanges = true;
            }
            if (normalize(metric.targetValue) !== normalize(previous.targetValue)) {
                patch.targetValue = metric.targetValue || null;
                hasChanges = true;
            }
            if (normalize(metric.targetDate) !== normalize(previous.targetDate)) {
                patch.targetDate = metric.targetDate || null;
                hasChanges = true;
            }

            if (hasChanges) {
                acc.push(patch as { id: number });
            }
            return acc;
        }, []);

        const latestReportIdByMetricId = new Map<number, number>();
        reportedMetricRows.forEach((row) => {
            const metricId = Number(row.metricId);
            const reportId = Number(row.id);
            if (!Number.isFinite(metricId) || !Number.isFinite(reportId)) return;
            const current = latestReportIdByMetricId.get(metricId);
            if (!current) {
                latestReportIdByMetricId.set(metricId, reportId);
                return;
            }
            const currentRow = reportedMetricRows.find((item) => Number(item.id) === current);
            const currentTime = currentRow
                ? new Date(String(currentRow.reportedDate ?? currentRow.modified ?? currentRow.created ?? "")).getTime()
                : -1;
            const nextTime = new Date(String(row.reportedDate ?? row.modified ?? row.created ?? "")).getTime();
            if (!Number.isFinite(currentTime) || (Number.isFinite(nextTime) && nextTime >= currentTime)) {
                latestReportIdByMetricId.set(metricId, reportId);
            }
        });

        const snapshotReportedByMetricId = new Map<number, Metric>();
        snapshot.reportedMetrics.forEach((metric) => snapshotReportedByMetricId.set(metric.id, metric));
        const currentReportedByMetricId = new Map<number, Metric>();
        reportedMetrics.forEach((metric) => currentReportedByMetricId.set(metric.id, metric));

        const deleteReportedMetricIds = snapshot.reportedMetrics
            .filter((metric) => !currentReportedByMetricId.has(metric.id))
            .map((metric) => latestReportIdByMetricId.get(metric.id))
            .filter((value): value is number => Number.isFinite(value as number));

        const updateReportedMetrics = reportedMetrics.reduce<{ id: number }[]>((acc, metric) => {
            const previous = snapshotReportedByMetricId.get(metric.id);
            if (!previous) return acc;
            const reportId = latestReportIdByMetricId.get(metric.id);
            if (!reportId) return acc;
            const patch: Record<string, unknown> = { id: reportId };
            let hasChanges = false;

            if (normalize(metric.reportedValue) !== normalize(previous.reportedValue)) {
                patch.reportedValue = metric.reportedValue || null;
                hasChanges = true;
            }
            if (normalize(metric.reportedDate) !== normalize(previous.reportedDate)) {
                patch.reportedDate = metric.reportedDate || null;
                hasChanges = true;
            }
            if (hasChanges) {
                acc.push(patch as { id: number });
            }
            return acc;
        }, []);

        const newReportedMetrics = reportedMetrics
            .filter((metric) => !latestReportIdByMetricId.has(metric.id))
            .filter((metric) => normalize(metric.reportedValue) || normalize(metric.reportedDate))
            .map((metric) => ({
                metricId: metric.id,
                reportedValue: metric.reportedValue || null,
                reportedDate: metric.reportedDate || null,
            }));

        const hasChanges =
            newMetrics.length ||
            updateMetrics.length ||
            deleteMetricIds.length ||
            newReportedMetrics.length ||
            updateReportedMetrics.length ||
            deleteReportedMetricIds.length;

        if (!hasChanges) {
            setIsMetricsEditing(false);
            return;
        }

        try {
            const editorEmail = accounts?.[0]?.username ?? accounts?.[0]?.name ?? "";
            const metricsPayload: Record<string, unknown> = { editorEmail };
            if (newMetrics.length) metricsPayload.newMetrics = newMetrics;
            if (updateMetrics.length) metricsPayload.updateMetrics = updateMetrics;
            if (deleteMetricIds.length) metricsPayload.deleteMetricIds = deleteMetricIds;
            if (newReportedMetrics.length) metricsPayload.newReportedMetrics = newReportedMetrics;
            if (updateReportedMetrics.length) metricsPayload.updateReportedMetrics = updateReportedMetrics;
            if (deleteReportedMetricIds.length) {
                metricsPayload.deleteReportedMetricIds = deleteReportedMetricIds;
            }

            await updateUseCaseMetrics(id, metricsPayload);
            await refetch();
            metricsSnapshotRef.current = null;
            toast.success("Metrics updated successfully");
            setIsMetricsEditing(false);
        } catch (error) {
            console.error("Failed to update metrics:", error);
            toast.error("Failed to update metrics.");
        }
    }, [
        accounts,
        id,
        metricCategoryMap,
        metrics,
        reportedMetrics,
        reportedMetricRows,
        unitOfMeasureMap,
        refetch,
    ]);

    const editActions = useMemo(() => {
        if (activeTab === 'info') {
            return {
                isEditing: isEditing,
                onStart: handleStartInfoEdit,
                onCancel: handleCancelEdit,
                onApply: handleApplyChanges,
                applyLabel: "Apply Changes",
            };
        }
        if (activeTab === 'reprioritize') {
            return {
                isEditing: isReprioritizeEditing,
                onStart: handleStartReprioritizeEdit,
                onCancel: handleCancelReprioritizeEdit,
                onApply: handleApplyReprioritizeChanges,
                applyLabel: "Apply Changes",
            };
        }
        if (activeTab === 'library') {
            return {
                isEditing: isAgentLibraryEditing,
                onStart: handleStartAgentLibraryEdit,
                onCancel: handleCancelAgentLibraryEdit,
                onApply: handleApplyAgentLibraryChanges,
                applyLabel: "Apply Changes",
            };
        }
        if (activeTab === 'metrics') {
            return {
                isEditing: isMetricsEditing,
                onStart: handleStartMetricsEdit,
                onCancel: handleCancelMetricsEdit,
                onApply: handleApplyMetricsEdit,
                applyLabel: "Apply Changes",
            };
        }
        if (activeTab === 'checklist') {
            return {
                isEditing: isChecklistEditing,
                onStart: handleStartChecklistEdit,
                onCancel: handleCancelChecklistEdit,
                onApply: handleApplyChecklistChanges,
                applyLabel: "Apply Changes",
            };
        }
        return null;
    }, [
        activeTab,
        isEditing,
        isReprioritizeEditing,
        isAgentLibraryEditing,
        isMetricsEditing,
        isChecklistEditing,
        handleCancelEdit,
        handleApplyChanges,
        handleStartInfoEdit,
        handleStartReprioritizeEdit,
        handleCancelReprioritizeEdit,
        handleApplyReprioritizeChanges,
        handleStartAgentLibraryEdit,
        handleCancelAgentLibraryEdit,
        handleApplyAgentLibraryChanges,
        handleStartMetricsEdit,
        handleCancelMetricsEdit,
        handleApplyMetricsEdit,
        handleStartChecklistEdit,
        handleCancelChecklistEdit,
        handleApplyChecklistChanges,
    ]);

    const isAnyEditing =
        isEditing || isAgentLibraryEditing || isMetricsEditing || isReprioritizeEditing || isChecklistEditing;

    useEffect(() => {
        if (!id || typeof id !== "string") {
            setMetricDetailRows([]);
            setReportedMetricRows([]);
            return;
        }

        const metricsPayload = useCaseDetails?.metrics;
        if (metricsPayload?.items || metricsPayload?.reported) {
            setMetricDetailRows(metricsPayload?.items ?? []);
            setReportedMetricRows(metricsPayload?.reported ?? []);
            return;
        }

        if (loading) return;

        setMetricDetailRows([]);
        setReportedMetricRows([]);
    }, [id, useCaseDetails?.metrics, loading]);

    useEffect(() => {
        if (isMetricsEditing) return;
        if (!metricDetailRows.length && !reportedMetricRows.length) {
            setMetrics([]);
            setReportedMetrics([]);
            setReportedHistory([]);
            return;
        }

        const formatMetricDate = (value?: string | null) => {
            if (!value) return "";
            const parsed = new Date(value);
            if (Number.isNaN(parsed.getTime())) return "";
            return format(parsed, "yyyy-MM-dd");
        };

        const mappedMetrics: Metric[] = metricDetailRows
            .map((row) => {
                const metricId = Number(row.id);
                if (!Number.isFinite(metricId)) return null;
                const metricTypeId = Number(row.metricTypeId);
                const unitId = Number(row.unitOfMeasureId);
                return {
                    id: metricId,
                    primarySuccessValue: String(row.primarySuccessMetricName ?? "").trim(),
                    parcsCategory: metricCategoryMap.get(metricTypeId) ?? "",
                    unitOfMeasurement: unitOfMeasureMap.get(unitId) ?? "",
                    baselineValue: String(row.baselineValue ?? ""),
                    baselineDate: formatMetricDate(String(row.baselineDate ?? "")),
                    targetValue: String(row.targetValue ?? ""),
                    targetDate: formatMetricDate(String(row.targetDate ?? "")),
                    isSubmitted: true,
                };
            })
            .filter(Boolean) as Metric[];

        const latestReports = new Map<number, ReportedMetricItem>();
        reportedMetricRows.forEach((row) => {
            const metricId = Number(row.metricId);
            if (!Number.isFinite(metricId)) return;
            const current = latestReports.get(metricId);
            const currentTime = current
                ? new Date(String(current.reportedDate ?? current.modified ?? current.created ?? "")).getTime()
                : -1;
            const nextTime = new Date(String(row.reportedDate ?? row.modified ?? row.created ?? "")).getTime();
            if (!current || (Number.isFinite(nextTime) && nextTime >= currentTime)) {
                latestReports.set(metricId, row);
            }
        });

        const nextReportedMetrics = mappedMetrics.map((metric) => {
            const report = latestReports.get(metric.id);
            return {
                ...metric,
                reportedValue: report ? String(report.reportedValue ?? "") : "",
                reportedDate: report ? formatMetricDate(String(report.reportedDate ?? "")) : "",
                isSubmitted: true,
            };
        });

        const metricLookup = new Map<number, Metric>();
        mappedMetrics.forEach((metric) => metricLookup.set(metric.id, metric));
        const nextHistory: ReportedHistoryRow[] = reportedMetricRows
            .map((row) => {
                const reportId = Number(row.id);
                const metricId = Number(row.metricId);
                if (!Number.isFinite(reportId) || !Number.isFinite(metricId)) return null;
                const metric = metricLookup.get(metricId);
                return {
                    id: reportId,
                    metricId,
                    primarySuccessValue: metric?.primarySuccessValue ?? `Metric ${metricId}`,
                    reportedValue: String(row.reportedValue ?? ""),
                    reportedDate: formatMetricDate(String(row.reportedDate ?? "")),
                };
            })
            .filter(Boolean) as ReportedHistoryRow[];

        setMetrics(mappedMetrics);
        setReportedMetrics(nextReportedMetrics);
        setReportedHistory(nextHistory);
    }, [metricDetailRows, reportedMetricRows, metricCategoryMap, unitOfMeasureMap, isMetricsEditing]);

    const reportableMetrics = useMemo(() => {
        const submitted = reportedMetrics.filter((metric) => metric.isSubmitted);
        return submitted.length > 0 ? submitted : reportedMetrics;
    }, [reportedMetrics]);

    useEffect(() => {
        const availableIds = new Set(reportableMetrics.map((metric) => metric.id.toString()));
        setSelectedMetricIdsForReporting((prev) => {
            if (prev.length === 0) return prev;
            const next = prev.filter((id) => availableIds.has(id));
            if (next.length === prev.length && next.every((id, idx) => id === prev[idx])) {
                return prev;
            }
            return next;
        });
    }, [reportableMetrics]);

    const reportedHistoryMetrics = useMemo(
        () => reportedMetrics.filter((metric) => metric.reportedValue || metric.reportedDate),
        [reportedMetrics]
    );

    const selectedMetricsForReporting = useMemo(
        () => {
            if (selectedMetricIdsForReporting.length === 0) return [];
            const selectedSet = new Set(selectedMetricIdsForReporting);
            return reportedMetrics.filter((metric) => selectedSet.has(metric.id.toString()));
        },
        [reportedMetrics, selectedMetricIdsForReporting]
    );

    const reportedMetricsForDisplay = useMemo(() => {
        if (selectedMetricsForReporting.length === 0) {
            return reportedHistoryMetrics;
        }
        const merged = [...reportedHistoryMetrics];
        const existingIds = new Set(reportedHistoryMetrics.map((metric) => metric.id));
        selectedMetricsForReporting.forEach((metric) => {
            if (!existingIds.has(metric.id)) {
                merged.push(metric);
            }
        });
        return merged;
    }, [reportedHistoryMetrics, selectedMetricsForReporting]);

    const hasReportedMetrics = reportedHistoryMetrics.length > 0;
    const shouldShowReportedTable = selectedMetricsForReporting.length > 0 || hasReportedMetrics;

    const isMetricsFormValid = useMemo(() => {
        if (!isMetricsEditing) return true;
        if (metrics.length === 0) return false;

        const hasValue = (value: unknown) => String(value ?? "").trim().length > 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const metricsValid = metrics.every((metric) => {
            if (
                !hasValue(metric.primarySuccessValue) ||
                !hasValue(metric.parcsCategory) ||
                !hasValue(metric.unitOfMeasurement) ||
                !hasValue(metric.baselineValue) ||
                !hasValue(metric.baselineDate) ||
                !hasValue(metric.targetValue) ||
                !hasValue(metric.targetDate)
            ) {
                return false;
            }
            const baseline = new Date(`${metric.baselineDate}T00:00:00`);
            const target = new Date(`${metric.targetDate}T00:00:00`);
            if (Number.isNaN(baseline.getTime()) || Number.isNaN(target.getTime())) return false;
            return target > baseline && target > today;
        });

        if (!metricsValid) return false;

        if (shouldShowReportedTable && reportedMetricsForDisplay.length > 0) {
            const reportedValid = reportedMetricsForDisplay.every((metric) =>
                hasValue(metric.reportedValue) && hasValue(metric.reportedDate)
            );
            if (!reportedValid) return false;
        }

        return true;
    }, [isMetricsEditing, metrics, reportedMetricsForDisplay, shouldShowReportedTable]);

    const metricsById = useMemo(() => {
        const map = new Map<string, Metric>();
        metrics.forEach((metric) => {
            map.set(String(metric.id), metric);
        });
        return map;
    }, [metrics]);

    const reportedMetricsById = useMemo(() => {
        const map = new Map<string, Metric>();
        reportedMetricsForDisplay.forEach((metric) => {
            map.set(String(metric.id), metric);
        });
        return map;
    }, [reportedMetricsForDisplay]);

    const reportedColumns = useMemo<ColumnDef<Metric>[]>(() => {
        const columns: ColumnDef<Metric>[] = [
            {
                accessorKey: 'primarySuccessValue',
                header: 'Primary Success Value',
                cell: ({ row }) => (
                    <span className="whitespace-normal break-words">
                        {(reportedMetricsById.get(String(row.original.id)) ?? row.original).primarySuccessValue}
                    </span>
                ),
                size: metricColumnSizes.primarySuccessValue,
            },
            {
                accessorKey: 'baselineValue',
                header: 'Baseline Value',
                cell: ({ row }) => (
                    <span className="whitespace-normal break-words">
                        {(reportedMetricsById.get(String(row.original.id)) ?? row.original).baselineValue}
                    </span>
                ),
                size: metricColumnSizes.baselineValue,
            },
            {
                accessorKey: 'baselineDate',
                header: 'Baseline Date',
                cell: ({ row }) => {
                    const metric = reportedMetricsById.get(String(row.original.id)) ?? row.original;
                    return (
                        <span className="whitespace-normal break-words">
                            {formatDisplayDate(metric.baselineDate)}
                        </span>
                    );
                },
                size: metricColumnSizes.baselineDate,
            },
            {
                accessorKey: 'targetValue',
                header: 'Target Value',
                cell: ({ row }) => (
                    <span className="whitespace-normal break-words">
                        {(reportedMetricsById.get(String(row.original.id)) ?? row.original).targetValue}
                    </span>
                ),
                size: metricColumnSizes.targetValue,
            },
            {
                accessorKey: 'targetDate',
                header: 'Target Date',
                cell: ({ row }) => {
                    const metric = reportedMetricsById.get(String(row.original.id)) ?? row.original;
                    return (
                        <span className="whitespace-normal break-words">
                            {formatDisplayDate(metric.targetDate)}
                        </span>
                    );
                },
                size: metricColumnSizes.targetDate,
            },
            {
                accessorKey: 'reportedValue',
                header: 'Reported Value',
                cell: ({ row }) => {
                    if (!isMetricsEditing) {
                        const metric = reportedMetricsById.get(String(row.original.id)) ?? row.original;
                        return <span>{metric.reportedValue || "—"}</span>;
                    }
                    const metric = reportedMetricsById.get(String(row.original.id)) ?? row.original;
                    return (
                        <Input
                            type="number"
                            className="number-input-no-spinner h-9"
                            value={metric.reportedValue ?? ''}
                            onChange={(e) => handleReportedInputChange(metric.id, 'reportedValue', e.target.value)}
                        />
                    );
                },
                size: metricColumnSizes.reportedValue,
            },
            {
                accessorKey: 'reportedDate',
                header: 'Reported Date',
                cell: ({ row }) => {
                    if (!isMetricsEditing) {
                        const metric = reportedMetricsById.get(String(row.original.id)) ?? row.original;
                        return <span>{formatDisplayDate(metric.reportedDate) || "—"}</span>;
                    }
                    const metric = reportedMetricsById.get(String(row.original.id)) ?? row.original;
                    return (
                        <ReportedDatePickerCell
                            value={metric.reportedDate}
                            onChange={(date) => handleReportedInputChange(metric.id, 'reportedDate', date)}
                        />
                    );
                },
                size: metricColumnSizes.reportedDate,
            },
        ];

        if (isMetricsEditing) {
            columns.push({
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
            });
        }

        return columns;
    }, [handleReportedInputChange, handleDeleteReportedMetric, isMetricsEditing, reportedMetricsById]);

    const addMetricsColumns = useMemo<ColumnDef<Metric>[]>(() => {
        const columns: ColumnDef<Metric>[] = [
        {
            accessorKey: 'primarySuccessValue',
            header: 'Primary Success Value',
            cell: ({ row }) => {
                const metric = metricsById.get(String(row.original.id)) ?? row.original;
                if (!isMetricsEditing) {
                    return (
                        <span className="text-sm px-2 whitespace-normal break-words">
                            {metric.primarySuccessValue}
                        </span>
                    );
                }
                return (
                    <Input
                        type="text"
                        value={metric.primarySuccessValue ?? ""}
                        onChange={(e) => handleInputChange(metric.id, 'primarySuccessValue', e.target.value)}
                        className="h-9"
                    />
                );
            },
            size: metricColumnSizes.primarySuccessValue,
        },
        {
            accessorKey: 'parcsCategory',
            header: 'PARCS Category',
            cell: ({ row }) => {
                const metric = metricsById.get(String(row.original.id)) ?? row.original;
                return (!isMetricsEditing) ? (
                    <span className="text-sm px-2 whitespace-normal break-words">{metric.parcsCategory}</span>
                ) : (
                    <FilterCombobox
                        value={metric.parcsCategory ?? ""}
                        onChange={(val) => handleInputChange(metric.id, 'parcsCategory', val)}
                        options={metricCategorySelectOptions}
                        placeholder="Select"
                        showBadges={false}
                        className="metric-select"
                        buttonClassName="h-9 px-2 text-xs"
                    />
                );
            },
            size: metricColumnSizes.parcsCategory,
        },
        {
            accessorKey: 'unitOfMeasurement',
            header: 'Unit of Measurement',
            cell: ({ row }) => {
                const metric = metricsById.get(String(row.original.id)) ?? row.original;
                return (!isMetricsEditing) ? (
                    <span className="text-sm px-2 whitespace-normal break-words">{metric.unitOfMeasurement}</span>
                ) : (
                    <FilterCombobox
                        value={metric.unitOfMeasurement ?? ""}
                        onChange={(val) => handleInputChange(metric.id, 'unitOfMeasurement', val)}
                        options={unitOfMeasureSelectOptions}
                        placeholder="Select"
                        showBadges={false}
                        className="metric-select"
                        buttonClassName="h-9 px-2 text-xs"
                    />
                );
            },
            size: metricColumnSizes.unitOfMeasurement,
        },
        {
            accessorKey: 'baselineValue',
            header: 'Baseline Value',
            cell: ({ row }) => {
                const metric = metricsById.get(String(row.original.id)) ?? row.original;
                if (!isMetricsEditing) {
                    return <span className="text-sm px-2 whitespace-normal break-words">{metric.baselineValue}</span>;
                }
                return (
                    <Input
                        type="number"
                        className="number-input-no-spinner h-9"
                        value={metric.baselineValue ?? ""}
                        onChange={(e) => handleInputChange(metric.id, 'baselineValue', e.target.value)}
                    />
                );
            },
            size: metricColumnSizes.baselineValue,
        },
        {
            accessorKey: 'baselineDate',
            header: 'Baseline Date',
            cell: ({ row }) => {
                const metric = metricsById.get(String(row.original.id)) ?? row.original;
                return (!isMetricsEditing) ? (
                    <span className="text-sm px-2 whitespace-normal break-words">
                        {formatDisplayDate(metric.baselineDate)}
                    </span>
                ) : (
                    <MetricDatePicker
                        value={metric.baselineDate ?? ""}
                        onChange={(date) => handleInputChange(metric.id, 'baselineDate', date)}
                        onOpenDialog={() => {
                            setEditingMetricId(metric.id);
                            setTempBaselineDate(metric.baselineDate ? new Date(metric.baselineDate + 'T00:00:00') : undefined);
                            setTempTargetDate(metric.targetDate ? new Date(metric.targetDate + 'T00:00:00') : undefined);
                            setIsMetricDateDialogOpen(true);
                        }}
                    />
                );
            },
            size: metricColumnSizes.baselineDate,
        },
        {
            accessorKey: 'targetValue',
            header: 'Target Value',
            cell: ({ row }) => {
                const metric = metricsById.get(String(row.original.id)) ?? row.original;
                if (!isMetricsEditing) {
                    return <span className="text-sm px-2 whitespace-normal break-words">{metric.targetValue}</span>;
                }
                return (
                    <Input
                        type="number"
                        className="number-input-no-spinner h-9"
                        value={metric.targetValue ?? ""}
                        onChange={(e) => handleInputChange(metric.id, 'targetValue', e.target.value)}
                    />
                );
            },
            size: metricColumnSizes.targetValue,
        },
        {
            accessorKey: 'targetDate',
            header: 'Target Date',
            cell: ({ row }) => {
                const metric = metricsById.get(String(row.original.id)) ?? row.original;
                return (!isMetricsEditing) ? (
                    <span className="text-sm px-2 whitespace-normal break-words">
                        {formatDisplayDate(metric.targetDate)}
                    </span>
                ) : (
                    <MetricDatePicker
                        value={metric.targetDate ?? ""}
                        onChange={(date) => handleInputChange(metric.id, 'targetDate', date)}
                        onOpenDialog={() => {
                            setEditingMetricId(metric.id);
                            setTempBaselineDate(metric.baselineDate ? new Date(metric.baselineDate + 'T00:00:00') : undefined);
                            setTempTargetDate(metric.targetDate ? new Date(metric.targetDate + 'T00:00:00') : undefined);
                            setIsMetricDateDialogOpen(true);
                        }}
                    />
                );
            },
            size: metricColumnSizes.targetDate,
        },
        ];

        if (isMetricsEditing) {
            columns.push({
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRequestDeleteMetric(row.original.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
                size: metricColumnSizes.actions,
            });
        }

        return columns;
    }, [handleInputChange, handleRequestDeleteMetric, isMetricsEditing, metricsById, metricCategoryOptions, unitOfMeasureOptions]);

    const reportedTable = useReactTable({
        data: reportedMetricsForDisplay,
        columns: reportedColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => String(row.id),
    });

    const addMetricsTable = useReactTable({
        data: metrics,
        columns: addMetricsColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => String(row.id),
    });

    const completionSummary = useMemo(() => {
        if (!phaseMappings.length) return [];
        return phaseMappings.map((phase) => {
            let status = "Not Started";
            if (useCase.phaseId && phase.id < useCase.phaseId) {
                status = "Completed";
            } else if (useCase.phaseId && phase.id === useCase.phaseId) {
                status = "In Progress";
            }
            return { name: phase.name, status };
        });
    }, [phaseMappings, useCase.phaseId]);

    const nextPhaseOptions = useMemo(() => {
        if (!phaseMappings.length) return [];

        const currentPhaseId = useCase.phaseId;
        if (currentPhaseId == null) {
            return phaseMappings.map((phase) => phase.name);
        }

        return phaseMappings
            .filter((phase) => phase.id > currentPhaseId)
            .map((phase) => phase.name);
    }, [phaseMappings, useCase.phaseId]);

    const decisionPhaseLabel = useMemo(() => {
        const phaseName = useCase.phase?.trim();
        return phaseName ? `${phaseName.toUpperCase()} PHASE` : "CURRENT PHASE";
    }, [useCase.phase]);

    const tabsGridCols = isChampionView ? "grid-cols-5" : "grid-cols-6";

    if (loading) {
        return <UseCaseDetailsSkeleton />;
    }
    if (error) {
        return (
            <div className="flex flex-1 items-center justify-center p-6 text-sm text-red-600">
                Failed to load use case details: {error}
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            <Tabs
                value={activeTab}
                onValueChange={(val) => {
                    if (
                        (isEditing && val !== 'info') ||
                        (isAgentLibraryEditing && val !== 'library') ||
                        (isMetricsEditing && val !== 'metrics') ||
                        (isReprioritizeEditing && val !== 'reprioritize') ||
                        (isChecklistEditing && val !== 'checklist')
                    ) {
                        return;
                    }
                    setActiveTab(val);
                }}
                className="w-full"
            >
                {/* Tabs and Apply Changes Button on same line */}
                <div className="bg-gray-50 -mx-6 px-6 pb-4 border-b border-gray-100 mb-6 justify-center items-center flex">
                    <div className="w-[90%] flex items-center justify-center gap-4">
                        <div />
                        <TabsList
                            className={cn(
                                "grid w-full min-w-0 h-10 bg-gray-100/50 p-1 border rounded-lg transition-[max-width] justify-center items-center",
                                tabsGridCols,
                                isAnyEditing ? "max-w-[900px]" : "max-w-[1600px]"
                            )}
                        >
                            <TabsTrigger
                                value="info"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                disabled={isChecklistEditing}
                            >
                                Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="update"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                disabled={isEditing || isMetricsEditing || isChecklistEditing}
                            >
                                Update
                            </TabsTrigger>
                            {!isChampionView && (
                                <TabsTrigger
                                    value="checklist"
                                    className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                    disabled={isEditing || isAgentLibraryEditing || isMetricsEditing || isReprioritizeEditing}
                                >
                                    AI Product Checklist
                                </TabsTrigger>
                            )}
                            {isChampionView ? (
                                <TabsTrigger
                                    value="reprioritize"
                                    className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                    disabled={isEditing || isAgentLibraryEditing || isMetricsEditing || isChecklistEditing}
                                >
                                    Reprioritize
                                </TabsTrigger>
                            ) : (
                                <TabsTrigger
                                    value="library"
                                    className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                    disabled={isEditing || isAgentLibraryEditing || isMetricsEditing || isChecklistEditing}
                                >
                                    Library
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="metrics"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                disabled={isEditing || isAgentLibraryEditing || isChecklistEditing}
                            >
                                Metrics
                            </TabsTrigger>
                            <TabsTrigger
                                value="status"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                disabled={isEditing || isAgentLibraryEditing || isMetricsEditing || isChecklistEditing}
                            >
                                {isChampionView ? 'Approvals' : 'Actions'}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 shrink-0 justify-end">
                            {editActions ? (
                                editActions.isEditing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={editActions.onCancel}
                                            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-1.5 h-auto text-sm font-medium"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-1.5 h-auto text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={editActions.onApply}
                                            disabled={activeTab === "metrics" && isMetricsEditing && !isMetricsFormValid}
                                        >
                                            {editActions.applyLabel}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={editActions.onStart}
                                        className="border-teal-600 text-teal-600 hover:bg-teal-50"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )
                            ) : null}
                        </div>
                    </div>
                </div>

                <TabsContent value="info" className="space-y-6">
                    <InfoSection
                        id={id}
                        isEditing={isEditing}
                        editableTitle={editableTitle}
                        onTitleChange={setEditableTitle}
                        useCasePhase={useCase.phase}
                        agentBadgeLabel={agentBadgeLabel}
                        agentLink={String(agentLibraryItems?.[0]?.agentlink ?? useCaseDetails?.agentLibrary?.[0]?.agentlink ?? "")}
                        businessUnitName={useCase.businessUnitName}
                        teamName={useCase.teamName}
                        aiThemeNames={aiThemeDisplay}
                        editableHeadline={editableHeadline}
                        onHeadlineChange={setEditableHeadline}
                        editableOpportunity={editableOpportunity}
                        onOpportunityChange={setEditableOpportunity}
                        editableEvidence={editableEvidence}
                        onEvidenceChange={setEditableEvidence}
                        editableContactPerson={editableContactPerson}
                    />
                </TabsContent>

                <TabsContent value="update" className="space-y-6">
                    <UpdateSection
                        showChangeStatusCard={showChangeStatusCard}
                        selectedStatus={selectedStatus}
                        onSelectedStatusChange={setSelectedStatus}
                        statusOptions={statusOptions}
                        useCasePhase={useCase.phase}
                        phaseMappings={phaseMappings}
                        phaseDates={phaseDates}
                        onOpenPhaseDates={handleOpenDateDialog}
                        isLoading={isUpdateDataLoading}
                        isTimelineEditing={isTimelineEditing}
                        onToggleTimelineEdit={handleToggleTimelineEdit}
                        onSaveTimeline={handleSaveTimeline}
                        stakeholders={stakeholders}
                        canAddStakeholder={canAddStakeholder}
                        onOpenStakeholderDialog={() => setIsDialogOpen(true)}
                        onEditStakeholder={handleEditStakeholder}
                        onDeleteStakeholder={handleDeleteStakeholder}
                        updateText={updateText}
                        onUpdateTextChange={setUpdateText}
                        onPostUpdate={handlePostUpdate}
                        updates={updates}
                    />
                </TabsContent>
                {!isChampionView && (
                    <TabsContent value="checklist" className="space-y-6">
                        {isChecklistEditing ? (
                            <Form {...checklistForm}>
                                <div ref={checklistContainerRef}>
                                    <fieldset disabled={!isChecklistEditing}>
                                        <ChecklistSection
                                            form={checklistForm}
                                            questions={checklistQuestions}
                                            selectedModel={agentBadgeLabel}
                                            containerRef={checklistContainerRef}
                                        />
                                    </fieldset>
                                </div>
                            </Form>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-6 rounded-lg border border-dashed">
                                    <div className="flex items-center gap-3 mb-6 bg-background/80 backdrop-blur-sm py-2">
                                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                                            <CheckSquare className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">AI Product Checklist</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Checklist responses for {agentBadgeLabel || "this use case"}.
                                            </p>
                                        </div>
                                    </div>

                                    {checklistQuestions.length === 0 ? (
                                        <div className="rounded-md border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
                                            Checklist questions are not available yet.
                                        </div>
                                    ) : (
                                        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="grid gap-4">
                                                {checklistDisplayItems.map((item, index) => (
                                                    <div
                                                        key={`${item.id}-${index}`}
                                                        className="rounded-md border border-gray-100 bg-white p-4 shadow-sm"
                                                    >
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {index + 1}. {item.question}
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {item.responses.length > 0 ? (
                                                                item.responses.map((response, responseIndex) => (
                                                                    <Badge key={`${item.id}-${responseIndex}`} variant="secondary">
                                                                        {response}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground">—</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                )}
                <TabsContent value="reprioritize" className="space-y-3">
                    <ReprioritizeSection
                        formData={formData}
                        onFormDataChange={(field, value) => handleFormDataChange(field, value)}
                        onToggle={handleToggle}
                        isEditing={isReprioritizeEditing}
                        impactOptions={riceImpactOptions}
                        confidenceOptions={riceConfidenceOptions}
                        deliveryOptions={deliveryOptions}
                        reportingFrequencyOptions={reportingFrequencyOptions}
                    />
                </TabsContent>

                <TabsContent value="library" className="space-y-3">
                    <AgentLibrarySection
                        isEditing={isAgentLibraryEditing}
                        aiThemes={themeOptions}
                        selectedAIThemes={editableAITheme}
                        onAIThemesChange={setEditableAITheme}
                        personas={personaOptions}
                        selectedPersonas={selectedPersonas}
                        onPersonasChange={setSelectedPersonas}
                        vendors={vendorOptions}
                        selectedVendor={selectedVendor}
                        onVendorChange={setSelectedVendor}
                        models={modelOptions}
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        agentId={agentId}
                        onAgentIdChange={setAgentId}
                        agentLink={agentLink}
                        onAgentLinkChange={setAgentLink}
                        knowledgeSourceOptions={knowledgeSourceOptions}
                        selectedKnowledgeSources={selectedKnowledgeSources}
                        onKnowledgeSourcesChange={setSelectedKnowledgeSources}
                        instructions={instructions}
                        onInstructionsChange={setInstructions}
                    />
                </TabsContent>

                <TabsContent value="metrics" className="space-y-6">
                    <MetricsSection
                        metrics={metrics}
                        reportedMetrics={reportedMetricsForDisplay}
                        addMetricsTable={addMetricsTable}
                        reportedTable={reportedTable}
                        shouldShowReportedTable={shouldShowReportedTable}
                        reportedHistory={reportedHistory}
                        isEditing={isMetricsEditing}
                        isMetricsFormValid={isMetricsFormValid}
                        metricCategories={metricCategoryOptions}
                        unitOfMeasurementOptions={unitOfMeasureOptions}
                        onChangeMetric={handleInputChange}
                        onChangeReportedMetric={handleReportedInputChange}
                        onOpenMetricDateDialog={(metric) => {
                            setEditingMetricId(metric.id);
                            setTempBaselineDate(
                                metric.baselineDate ? new Date(`${metric.baselineDate}T00:00:00`) : undefined
                            );
                            setTempTargetDate(
                                metric.targetDate ? new Date(`${metric.targetDate}T00:00:00`) : undefined
                            );
                            setIsMetricDateDialogOpen(true);
                        }}
                        onDeleteMetric={handleRequestDeleteMetric}
                        onAddMetric={handleAddMetric}
                        onSubmitMetrics={handleSubmitMetrics}
                        onOpenReportMetric={() => setIsMetricSelectDialogOpen(true)}
                        onSaveReportedMetrics={handleSaveReportedMetrics}
                        onDeleteReportedMetric={handleDeleteReportedMetric}
                    />
                </TabsContent>

                <TabsContent value="status" className="space-y-8">
                    <ActionsSection
                        isChampion={isChampionView}
                        useCaseTitle={useCase.title}
                        submittedBy={useCase.editorEmail || useCase.primaryContact}
                        statusName={useCase.statusName}
                        businessUnitName={useCase.businessUnitName}
                        useCasePhase={useCase.phase}
                        decisionPhaseLabel={decisionPhaseLabel}
                        decision={decision}
                        onDecisionChange={setDecision}
                        comments={comments}
                        onCommentsChange={setComments}
                        onClearDecision={handleClearDecision}
                        onSubmitDecision={handleApprovalSubmit}
                        approvalHistory={approvalHistory}
                        statusOptions={statusOptions}
                        currentStatus={currentStatus}
                        onCurrentStatusChange={setCurrentStatus}
                        completionSummary={completionSummary}
                        nextPhaseOptions={nextPhaseOptions}
                        nextPhase={nextPhase}
                        onNextPhaseChange={(value) => {
                            if (!value) {
                                setNextPhase("");
                                setStatusNotes("");
                                return;
                            }
                            setNextPhase(value);
                        }}
                        statusNotes={statusNotes}
                        onStatusNotesChange={setStatusNotes}
                        onUpdateStatus={() => toast.success('Status updated successfully')}
                        onSendApprovalRequest={() => toast.success('Approval request sent successfully')}
                    />
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
                        <div className="max-h-64 overflow-auto space-y-2 pr-4">
                            {reportableMetrics.map((metric) => {
                                const metricId = metric.id.toString();
                                const isSelected = selectedMetricIdsForReporting.includes(metricId);
                                return (
                                    <Button
                                        key={metric.id}
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start h-auto p-3 text-left whitespace-normal break-words overflow-hidden hover:bg-transparent hover:text-foreground",
                                            isSelected && "border-teal-600 text-teal-700"
                                        )}
                                        onClick={() => {
                                            setSelectedMetricIdsForReporting((prev) => {
                                                if (prev.includes(metricId)) {
                                                    return prev.filter((id) => id !== metricId);
                                                }
                                                return [...prev, metricId];
                                            });
                                        }}
                                    >
                                        <div className="flex flex-col items-start w-full">
                                            <span className="font-medium whitespace-normal break-words">
                                                {metric.primarySuccessValue}
                                            </span>
                                            {metric.parcsCategory && (
                                                <span className="text-sm text-muted-foreground whitespace-normal break-words">
                                                    {metric.parcsCategory}
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMetricSelectDialogOpen(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Metric Confirmation Dialog */}
            <Dialog open={isDeleteMetricDialogOpen} onOpenChange={handleCancelDeleteMetric}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Delete metric?</DialogTitle>
                        <DialogDescription>
                            Deleting this metric will also delete any reported metric entries tied to it.
                            This action is irreversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelDeleteMetric}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDeleteMetric}>
                            Delete anyway
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
                                <SelectContent side="bottom" align="start" position="popper">
                                    {roleSelectOptions.length > 0 ? (
                                        roleSelectOptions.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {role.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="__roles_loading" disabled>
                                            Roles unavailable
                                        </SelectItem>
                                    )}
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
