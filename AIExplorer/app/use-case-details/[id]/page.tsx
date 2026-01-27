'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoSection } from "@/components/use-case-details/InfoSection";
import { UpdateSection } from "@/components/use-case-details/UpdateSection";
import { AgentLibrarySection } from "@/components/use-case-details/AgentLibrarySection";
import { MetricsSection } from "@/components/use-case-details/MetricsSection";
import type { MetricsRow } from "@/components/use-case-details/MetricsSection";
import { ActionsSection } from "@/components/use-case-details/ActionsSection";
import { ReprioritizeSection } from "@/components/use-case-details/ReprioritizeSection";
import { ParcsCategorySelect } from "@/components/use-case-details/ParcsCategorySelect";
import { UnitOfMeasurementSelect } from "@/components/use-case-details/UnitOfMeasurementSelect";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLocation } from '@/lib/router';
import { useMsal } from '@azure/msal-react';
import { Calendar as CalendarIcon, Pencil, Trash2 } from 'lucide-react';
import { useUseCaseDetails } from '@/hooks/use-usecase-details';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { fetchMetrics } from '@/lib/api';
import {
    getMappingMetricCategories,
    getMappingPhases,
    getMappingRoles,
    getMappingStatus,
    getMappingThemes,
    getMappingUnitOfMeasure,
    getMappingPersonas,
    getMappingVendorModels,
    getMappingKnowledgeSources,
} from '@/lib/submit-use-case';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
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


type Metric = MetricsRow;

type RoleOption = {
    id: number;
    name: string;
    roleType: string;
};

type PlanItem = {
    id: number | null;
    usecaseid: number | null;
    usecasephaseid: number | null;
    phase: string | null;
    startdate: string | null;
    enddate: string | null;
    modified: string | null;
    created: string | null;
    editor_email: string | null;
};

type StakeholderItem = {
    id: number | null;
    roleid: number | null;
    usecaseid: number | null;
    role: string | null;
    stakeholder_email: string | null;
    modified: string | null;
    created: string | null;
    editor_email: string | null;
};

type UpdateItem = {
    id: number | null;
    usecaseid: number | null;
    meaningfulupdate: string | null;
    roleid: number | null;
    role: string | null;
    usecasephaseid: number | null;
    phase: string | null;
    usecasestatusid: number | null;
    status: string | null;
    statusColor: string | null;
    modified: string | null;
    created: string | null;
    editor_email: string | null;
};

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
    const { data: useCaseDetails, loading, error } = useUseCaseDetails(
        typeof id === "string" ? id : undefined,
    );
    const { state } = useLocation<{ useCaseTitle: string; sourceScreen?: string }>();
    const { accounts } = useMsal();
    const useCase = useMemo(() => {
        const raw = useCaseDetails?.useCase ?? {};
        const phaseIdValue = Number((raw as any).phaseid ?? (raw as any).phaseId);
        const businessValue = String((raw as any).business_value ?? (raw as any).businessValue ?? "");
        return {
            id: (raw as any).id ?? id,
            title: String((raw as any).title ?? state?.useCaseTitle ?? "Use Case"),
            phase: String((raw as any).phase ?? ""),
            phaseStage: String((raw as any).phaseStage ?? (raw as any).phasestage ?? ""),
            phaseId: Number.isFinite(phaseIdValue) ? phaseIdValue : null,
            statusName: String((raw as any).statusName ?? ""),
            statusColor: String((raw as any).statusColor ?? ""),
            businessUnitName: String((raw as any).businessUnitName ?? ""),
            teamName: String((raw as any).teamName ?? ""),
            headlines: String((raw as any).headlines ?? ""),
            opportunity: String((raw as any).opportunity ?? ""),
            businessValue,
            informationUrl: String((raw as any).informationurl ?? (raw as any).informationUrl ?? ""),
            primaryContact: String((raw as any).primarycontact ?? (raw as any).primaryContact ?? ""),
            editorEmail: String((raw as any).editor_email ?? (raw as any).editorEmail ?? ""),
        };
    }, [useCaseDetails, id, state?.useCaseTitle]);
    const agentLibraryItems = useMemo(
        () => useCaseDetails?.agentLibrary ?? [],
        [useCaseDetails?.agentLibrary],
    );
    const agentBadgeLabel = useMemo(() => {
        if (!agentLibraryItems.length) return "";
        const item = agentLibraryItems[0];
        const vendor = String(item.vendorName ?? "").trim();
        const product = String(item.productName ?? "").trim();
        if (vendor && product) return `${vendor} - ${product}`;
        return vendor || product;
    }, [agentLibraryItems]);

    const [selectedStatus, setSelectedStatus] = useState(useCase.statusName || 'Active');
    const showChangeStatusCard = false;
    const [phaseDates, setPhaseDates] = useState<Record<string, { start?: Date; end?: Date }>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [selectedMetricIdForReporting, setSelectedMetricIdForReporting] = useState<string>("");
    const [stakeholderName, setStakeholderName] = useState('');
    const [stakeholderRole, setStakeholderRole] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    const [editingPhase, setEditingPhase] = useState<string | null>(null);
    const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);
    const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined);
    const [stakeholders, setStakeholders] = useState<{ id?: number | null; name: string; role: string; initial: string; canEdit: boolean; roleId?: number | null }[]>([]);
    const [updateText, setUpdateText] = useState('');
    const [knowledgeForce, setKnowledgeForce] = useState('');
    const [knowledgeSourceOptions, setKnowledgeSourceOptions] = useState<string[]>([]);
    const [instructions, setInstructions] = useState('');
    const [currentStatus, setCurrentStatus] = useState('On-Track');
    const [nextPhase, setNextPhase] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [reportedMetrics, setReportedMetrics] = useState<Metric[]>([]);
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

    const [themeOptions, setThemeOptions] = useState<{ label: string; value: string }[]>([]);
    const [statusOptions, setStatusOptions] = useState<string[]>([]);
    const [metricCategoryOptions, setMetricCategoryOptions] = useState<string[]>([]);
    const [unitOfMeasureOptions, setUnitOfMeasureOptions] = useState<string[]>([]);
    const [phaseMappings, setPhaseMappings] = useState<{ id: number; name: string; stage?: string }[]>([]);

    // AI Configuration state
    const [personaOptions, setPersonaOptions] = useState<{ label: string; value: string }[]>([]);
    const [vendorOptions, setVendorOptions] = useState<{ label: string; value: string }[]>([]);
    const [modelOptions, setModelOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [agentId, setAgentId] = useState<string>('');
    const [agentLink, setAgentLink] = useState<string>('');
    const [vendorModelsData, setVendorModelsData] = useState<Map<string, string[]>>(new Map());

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

    const [isEditing, setIsEditing] = useState(false);
    const [editableTitle, setEditableTitle] = useState(useCase.title);
    const [editableDepartment, setEditableDepartment] = useState('');
    const [editableAITheme, setEditableAITheme] = useState<string[]>([]);
    const [editableHeadline, setEditableHeadline] = useState('');
    const [editableOpportunity, setEditableOpportunity] = useState('');
    const [editableEvidence, setEditableEvidence] = useState('');
    const [editableContactPerson, setEditableContactPerson] = useState('');

    const roleSelectOptions = useMemo(
        () =>
            roleOptions.filter(
                (role) =>
                    String(role.roleType ?? "").trim() === "2" &&
                    !isOwnerRole(role.name) &&
                    !isChampionDelegateRole(role.name),
            ),
        [roleOptions],
    );

    // Sync editable fields when useCase updates
    useEffect(() => {
        setEditableTitle(useCase.title);
        setEditableDepartment(useCase.businessUnitName || useCase.teamName || "");
        setEditableHeadline(useCase.headlines);
        setEditableOpportunity(useCase.opportunity);
        setEditableEvidence(useCase.businessValue);
        setEditableContactPerson(useCase.primaryContact);
        setSelectedStatus(useCase.statusName || "Active");
        setCurrentStatus(useCase.statusName || "On-Track");
    }, [
        useCase.title,
        useCase.businessUnitName,
        useCase.teamName,
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

    // Set default primary contact person to current user if missing
    useEffect(() => {
        if (!useCase.primaryContact && accounts && accounts.length > 0) {
            const account = accounts[0];
            const displayName = account.name || account.username || 'Current User';
            setEditableContactPerson(displayName);
        }
    }, [accounts, useCase.primaryContact]);

    // Fetch mapping data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [themes, statuses, metricCategories, unitOfMeasure, phases, personas, vendorModels, knowledgeSources] = await Promise.all([
                    getMappingThemes(),
                    getMappingStatus(),
                    getMappingMetricCategories(),
                    getMappingUnitOfMeasure(),
                    getMappingPhases(),
                    getMappingPersonas(),
                    getMappingVendorModels(),
                    getMappingKnowledgeSources(),
                ]);
                setThemeOptions(
                    (themes?.items ?? [])
                        .map((item: any) => String(item.name ?? "").trim())
                        .filter(Boolean)
                        .map((name: string) => ({ label: name, value: name })),
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
                setUnitOfMeasureOptions(
                    (unitOfMeasure?.items ?? [])
                        .map((item: any) => String(item.name ?? "").trim())
                        .filter(Boolean),
                );
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

                // Set persona options
                setPersonaOptions(
                    (personas?.items ?? [])
                        .map((item: any) => String(item.name ?? "").trim())
                        .filter(Boolean)
                        .map((name: string) => ({ label: name, value: name })),
                );

                // Process vendor-model mappings
                const vendorMap = new Map<string, Set<string>>();
                (vendorModels?.items ?? []).forEach((item: any) => {
                    const vendorName = String(item.vendorName ?? "").trim();
                    const productName = String(item.productName ?? "").trim();
                    if (!vendorName) return;

                    if (!vendorMap.has(vendorName)) {
                        vendorMap.set(vendorName, new Set());
                    }
                    if (productName) {
                        vendorMap.get(vendorName)?.add(productName);
                    }
                });

                // Set vendor options
                setVendorOptions(
                    Array.from(vendorMap.keys())
                        .sort()
                        .map((name: string) => ({ label: name, value: name }))
                );

                // Store vendor-model mapping for later use
                const vendorModelsMap = new Map<string, string[]>();
                vendorMap.forEach((models, vendor) => {
                    vendorModelsMap.set(vendor, Array.from(models).sort());
                });
                setVendorModelsData(vendorModelsMap);

                // Set knowledge source options
                setKnowledgeSourceOptions(
                    (knowledgeSources?.items ?? [])
                        .map((item: any) => String(item.name ?? "").trim())
                        .filter(Boolean)
                        .sort(),
                );
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
            models.map((name: string) => ({ label: name, value: name }))
        );
        // Reset selected model if it's not available for the new vendor
        if (selectedModel && !models.includes(selectedModel)) {
            setSelectedModel('');
        }
    }, [selectedVendor, vendorModelsData, selectedModel]);

    useEffect(() => {
        if (activeTab !== "update" || roleOptions.length > 0) return;

        let isMounted = true;

        const fetchRoles = async () => {
            try {
                const data = await getMappingRoles();
                if (!isMounted) return;
                const items = (data?.items ?? [])
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
        if (activeTab !== "update" || !id) return;

        let isMounted = true;
        const controller = new AbortController();

        const fetchUpdateData = async () => {
            try {
                setIsUpdateDataLoading(true);
                const [planResult, stakeholderResult, updatesResult] = await Promise.allSettled([
                    fetch(`/api/usecases/${id}/plan`, { signal: controller.signal }),
                    fetch(`/api/usecases/${id}/stakeholders`, { signal: controller.signal }),
                    fetch(`/api/usecases/${id}/updates`, { signal: controller.signal }),
                ]);

                const planData =
                    planResult.status === "fulfilled" && planResult.value.ok
                        ? await planResult.value.json()
                        : null;
                const stakeholderData =
                    stakeholderResult.status === "fulfilled" && stakeholderResult.value.ok
                        ? await stakeholderResult.value.json()
                        : null;
                const updatesData =
                    updatesResult.status === "fulfilled" && updatesResult.value.ok
                        ? await updatesResult.value.json()
                        : null;

                if (!isMounted) return;

                const planRows = (planData?.items ?? []) as PlanItem[];
                const stakeholderRows = (stakeholderData?.items ?? []) as StakeholderItem[];
                const updateRows = (updatesData?.items ?? []) as UpdateItem[];

                setPlanItems(planRows);
                setStakeholderItems(stakeholderRows);
                setUpdateItems(updateRows);

                if (!isTimelineEditing) {
                    const nextPhaseDates: Record<string, { start?: Date; end?: Date }> = {};
                    planRows.forEach((row) => {
                        const phaseName = String(row.phase ?? "").trim();
                        if (!phaseName) return;
                        nextPhaseDates[phaseName] = {
                            start: row.startdate ? new Date(row.startdate) : undefined,
                            end: row.enddate ? new Date(row.enddate) : undefined,
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
                            author: String(row.editor_email ?? "").trim() || "Unknown",
                            role: String(row.role ?? "").trim(),
                            phase: String(row.phase ?? "").trim(),
                            status: String(row.status ?? "").trim(),
                            statusColor: String(row.statusColor ?? "").trim(),
                            content: String(row.meaningfulupdate ?? "").trim(),
                            time: timeLabel,
                            type: "comment",
                        };
                    })
                    .filter((row) => row.content);

                setUpdates(mappedUpdates);
            } catch (error) {
                console.error("Error fetching update data:", error);
            } finally {
                if (isMounted) {
                    setIsUpdateDataLoading(false);
                }
            }
        };

        fetchUpdateData();
        return () => {
            isMounted = false;
            controller.abort();
            setIsUpdateDataLoading(false);
        };
    }, [activeTab, id]);

    useEffect(() => {
        if (!stakeholderItems.length) {
            setStakeholders([]);
            return;
        }

        const nextStakeholders = stakeholderItems
            .map((item) => {
                const roleName = String(item.role ?? "").trim();
                const email = String(item.stakeholder_email ?? "").trim();
                if (!roleName || isChampionDelegateRole(roleName)) {
                    return null;
                }
                const roleOption =
                    roleOptions.find((role) => role.id === Number(item.roleid)) ??
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
                    roleId: item.roleid ?? null,
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



    const approvalHistory: {
        phase: string;
        approver: string;
        status: string;
        date: string;
    }[] = [];



    const handleApprovalSubmit = () => {
        console.log('Decision:', decision, 'Comments:', comments);
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
                setStakeholderItems((prev) => {
                    if (editingIndex !== null && payload.id) {
                        return prev.map((row) =>
                            String(row.id) === String(payload.id) ? item : row,
                        );
                    }
                    return [...prev, item];
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
                    String(entry.stakeholder_email ?? "").trim().toLowerCase() ===
                    editorEmail.toLowerCase(),
            );
            const roleLabel =
                String(roleFromStakeholder?.role ?? "").trim() ||
                roleOptions.find((role) => role.id === Number(item?.roleid))?.name ||
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
            setUpdates((prev) => [newUpdate, ...prev]);
            setUpdateItems((prev) => [item, ...prev]);
            setUpdateText("");
            toast.success("Update posted successfully!");
        } catch (error) {
            console.error("Update post failed:", error);
            toast.error("Failed to post update.");
        }
    };

    const resetEditableFields = useCallback(() => {
        setEditableTitle(useCase.title);
        setEditableDepartment(useCase.businessUnitName || useCase.teamName || "");
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
        useCase.businessUnitName,
        useCase.teamName,
        useCase.headlines,
        useCase.opportunity,
        useCase.businessValue,
        useCase.primaryContact,
        useCaseDetails?.themes,
    ]);

    const handleApplyChanges = () => {
        // TODO: wire to update API
        toast.success('Changes saved');
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        resetEditableFields();
        setIsEditing(false);
    };

    const handleOpenDateDialog = (phase: string) => {
        if (!isTimelineEditing) return;
        setEditingPhase(phase);
        setTempStartDate(phaseDates[phase]?.start);
        setTempEndDate(phaseDates[phase]?.end);
        setIsDateDialogOpen(true);
    };

    const handleToggleTimelineEdit = () => {
        setIsTimelineEditing(true);
    };

    const handleSaveTimeline = async () => {
        if (!id) {
            toast.error("Missing use case id.");
            return;
        }
        try {
            const editorEmail = accounts?.[0]?.username ?? accounts?.[0]?.name ?? "";
            const items = phaseMappings
                .map((phase) => {
                    const dates = phaseDates[phase.name];
                    if (!dates?.start || !dates?.end) return null;
                    return {
                        usecasephaseid: phase.id,
                        startdate: format(dates.start, "yyyy-MM-dd"),
                        enddate: format(dates.end, "yyyy-MM-dd"),
                    };
                })
                .filter(Boolean);

            if (!items.length) {
                toast.error("Add start and end dates before saving.");
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

    const handleInputChange = useCallback((id: number, field: string, value: string) => {
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
                    options={metricCategoryOptions}
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
                    options={unitOfMeasureOptions}
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
                    if (isEditing && val !== 'info') return;
                    setActiveTab(val);
                }}
                className="w-full"
            >
                {/* Tabs and Apply Changes Button on same line */}
                <div className="bg-gray-50 -mx-6 px-6 pb-4 border-b border-gray-100 mb-6">
                    <div className="w-[95%] mx-auto flex items-center justify-between">
                        <TabsList className="grid w-full grid-cols-5 max-w-[650px] h-10 bg-gray-100/50 p-1 border rounded-lg">
                            <TabsTrigger
                                value="info"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                disabled={false}
                            >
                                Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="update"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                disabled={isEditing}
                            >
                                Update
                            </TabsTrigger>
                            {state?.sourceScreen === 'champion' ? (
                                <TabsTrigger
                                    value="reprioritize"
                                    className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                    disabled={isEditing}
                                >
                                    Reprioritize
                                </TabsTrigger>
                            ) : (
                                <TabsTrigger
                                    value="agent-library"
                                    className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                    disabled={isEditing}
                                >
                                    Agent Library
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="metrics"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                disabled={isEditing}
                            >
                                Metrics
                            </TabsTrigger>
                            <TabsTrigger
                                value="status"
                                className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm py-1.5 px-3 rounded-md transition-all text-gray-600 font-medium"
                                disabled={isEditing}
                            >
                                {state?.sourceScreen === 'champion' ? 'Approvals' : 'Actions'}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            {activeTab === 'info' && !isEditing && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsEditing(true)}
                                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                            {activeTab === 'info' && isEditing && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-1.5 h-auto text-sm font-medium"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-1.5 h-auto text-sm font-medium"
                                        onClick={handleApplyChanges}
                                    >
                                        Apply Changes
                                    </Button>
                                </>
                            )}
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
                        editableDepartment={editableDepartment}
                        editableAITheme={editableAITheme}
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
                        onOpenStakeholderDialog={() => setIsDialogOpen(true)}
                        onEditStakeholder={handleEditStakeholder}
                        onDeleteStakeholder={handleDeleteStakeholder}
                        updateText={updateText}
                        onUpdateTextChange={setUpdateText}
                        onPostUpdate={handlePostUpdate}
                        updates={updates}
                    />
                </TabsContent>
                <TabsContent value="reprioritize" className="space-y-3">
                    <ReprioritizeSection
                        formData={formData}
                        onFormDataChange={(field, value) => handleFormDataChange(field, value)}
                        onToggle={handleToggle}
                    />
                </TabsContent>

                <TabsContent value="agent-library" className="space-y-3">
                    <AgentLibrarySection
                        knowledgeForce={knowledgeForce}
                        onKnowledgeForceChange={setKnowledgeForce}
                        knowledgeSourceOptions={knowledgeSourceOptions}
                        instructions={instructions}
                        onInstructionsChange={setInstructions}
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
                    />
                </TabsContent>

                <TabsContent value="metrics" className="space-y-6">
                    <MetricsSection
                        metrics={metrics}
                        addMetricsTable={addMetricsTable}
                        reportedTable={reportedTable}
                        shouldShowReportedTable={shouldShowReportedTable}
                        isMetricsFormValid={isMetricsFormValid}
                        onAddMetric={handleAddMetric}
                        onSubmitMetrics={handleSubmitMetrics}
                        onOpenReportMetric={() => setIsMetricSelectDialogOpen(true)}
                        onSaveReportedMetrics={handleSaveReportedMetrics}
                    />
                </TabsContent>

                <TabsContent value="status" className="space-y-8">
                    <ActionsSection
                        isChampion={state?.sourceScreen === 'champion'}
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
