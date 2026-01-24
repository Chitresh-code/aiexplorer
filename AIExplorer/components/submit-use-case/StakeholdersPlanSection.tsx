// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { CalendarIcon, Edit, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

type Stakeholder = {
    name: string;
    role: string;
};

type StakeholderSuggestion = {
    email: string;
    role: string;
    roleId?: number | null;
    businessUnitId?: number | null;
    businessUnitName?: string;
};

type StakeholdersPlanSectionProps = {
    stakeholders: StakeholderSuggestion[];
    isLoading: boolean;
    phases: Array<{ id?: number | null; name?: string | null; stage?: string | null }>;
    addedStakeholders: Stakeholder[];
    onAddStakeholder: () => void;
    onEditStakeholder: (index: number) => void;
    onRemoveStakeholder: (index: number) => void;
    startDate?: Date;
    endDate?: Date;
    diagnoseStartDate?: Date;
    diagnoseEndDate?: Date;
    designStartDate?: Date;
    designEndDate?: Date;
    implementedStartDate?: Date;
    implementedEndDate?: Date;
    onOpenDateDialog: (phase: string) => void;
    isPhasesLoading?: boolean;
    isTimelineGenerating?: boolean;
    aiGeneratedPhases?: Record<string, boolean>;
    timelineSuggestions?: Record<string, { startDate: Date; endDate: Date }>;
    onAcceptTimelineSuggestions?: () => void;
    onRejectTimelineSuggestions?: () => void;
};

const formatDisplayName = (email: string) => {
    if (!email) return "Unknown";
    const localPart = email.split("@")[0] ?? email;
    return localPart
        .split(".")
        .map((chunk) => (chunk ? chunk[0].toUpperCase() + chunk.slice(1) : ""))
        .join(" ");
};

export const StakeholdersPlanSection = ({
    stakeholders,
    isLoading,
    phases,
    addedStakeholders,
    onAddStakeholder,
    onEditStakeholder,
    onRemoveStakeholder,
    startDate,
    endDate,
    diagnoseStartDate,
    diagnoseEndDate,
    designStartDate,
    designEndDate,
    implementedStartDate,
    implementedEndDate,
    onOpenDateDialog,
    isPhasesLoading = false,
    isTimelineGenerating = false,
    aiGeneratedPhases = {},
    timelineSuggestions = {},
    onAcceptTimelineSuggestions = () => {},
    onRejectTimelineSuggestions = () => {},
}: StakeholdersPlanSectionProps) => (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
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
                        onClick={onAddStakeholder}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent className="pt-2 flex-1">
                    <ScrollArea className="h-[470px]">
                        <div className="space-y-3 pr-3">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={`stakeholder-skeleton-${idx}`} className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                stakeholders.map((stakeholder, idx) => {
                                    const displayName = formatDisplayName(stakeholder.email);
                                    const initials = displayName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase();
                                    return (
                                        <div key={`stakeholder-${idx}`} className="flex items-center justify-between gap-3 group">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border-none ring-1 ring-gray-100 shadow-sm">
                                                    <AvatarFallback className="bg-[#E5FF1F] text-gray-900 text-[10px] font-bold">
                                                        {initials || "UK"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 leading-none">
                                                        {displayName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {stakeholder.role || "Champion"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {addedStakeholders.map((stakeholder, idx) => (
                                <div key={`added-${idx}`} className="flex items-center justify-between gap-3 group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border-none ring-1 ring-gray-100 shadow-sm">
                                            <AvatarFallback className="bg-[#E5FF1F] text-gray-900 text-[10px] font-bold">
                                                {stakeholder.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 leading-none">{stakeholder.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{stakeholder.role}</p>
                                        </div>
                                    </div>
                                    {!["owner", "primary contact"].includes(
                                        stakeholder.role?.trim().toLowerCase(),
                                    ) && (
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                                                onClick={() => onEditStakeholder(idx)}
                                            >
                                                <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-gray-400 hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => onRemoveStakeholder(idx)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 min-h-[560px]">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-teal-600" />
                        Timeline
                    </CardTitle>
                    {Object.keys(timelineSuggestions).length > 0 && (
                        <div className="mt-2 flex items-center justify-between text-xs text-sky-600">
                            <span>Use AI suggestion for all phases?</span>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-sky-600 hover:text-sky-700"
                                    onClick={onAcceptTimelineSuggestions}
                                >
                                    Yes
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-sky-600 hover:text-sky-700"
                                    onClick={onRejectTimelineSuggestions}
                                >
                                    No
                                </Button>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="px-6 py-4">
                    <div className="metrics-table-container">
                        <table className="reporting-table" style={{ fontSize: "14px", tableLayout: "fixed", width: "100%" }}>
                            <thead>
                                <tr>
                                    <th style={{ width: "25%", padding: "12px 8px", fontWeight: "600", color: "#374151", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Phase</th>
                                    <th style={{ width: "37.5%", padding: "12px 8px", fontWeight: "600", color: "#374151", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                        Start Date
                                        {isTimelineGenerating && (
                                            <div className="text-xs font-normal text-sky-600">Generating...</div>
                                        )}
                                    </th>
                                    <th style={{ width: "37.5%", padding: "12px 8px", fontWeight: "600", color: "#374151", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                                        End Date
                                        {isTimelineGenerating && (
                                            <div className="text-xs font-normal text-sky-600">Generating...</div>
                                        )}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isPhasesLoading ? (
                                    Array.from({ length: 4 }).map((_, idx) => (
                                        <tr key={`phase-skeleton-${idx}`} className="hover:bg-gray-50">
                                            <td style={{ padding: "16px 8px" }}>
                                                <Skeleton className="h-4 w-24" />
                                            </td>
                                            <td style={{ padding: "16px 8px" }}>
                                                <Skeleton className="h-9 w-full" />
                                            </td>
                                            <td style={{ padding: "16px 8px" }}>
                                                <Skeleton className="h-9 w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    (phases ?? []).map((phase) => {
                                    const phaseName = String(phase.name ?? "").trim();
                                    if (!phaseName) return null;
                                    const normalized = phaseName.toLowerCase();
                                    const start =
                                        normalized === "idea"
                                            ? startDate
                                            : normalized === "diagnose"
                                            ? diagnoseStartDate
                                            : normalized === "design"
                                            ? designStartDate
                                            : normalized === "implemented"
                                            ? implementedStartDate
                                            : undefined;
                                    const end =
                                        normalized === "idea"
                                            ? endDate
                                            : normalized === "diagnose"
                                            ? diagnoseEndDate
                                            : normalized === "design"
                                            ? designEndDate
                                            : normalized === "implemented"
                                            ? implementedEndDate
                                            : undefined;

                                    return (
                                        <tr key={phaseName} className="hover:bg-gray-50">
                                            <td style={{ padding: "16px 8px", fontWeight: "500", textAlign: "left", fontSize: "14px", color: "#111827" }}>
                                                <div className="flex items-center gap-2">
                                                    <span>{phaseName}</span>
                                                    {aiGeneratedPhases[phaseName.toLowerCase()] && (
                                                        <span
                                                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600"
                                                            title="AI generated"
                                                        >
                                                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: "16px 8px" }}>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                                    onClick={() => onOpenDateDialog(phaseName)}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {start ? format(start, "dd-MM-yyyy") : "Pick date"}
                                                </Button>
                                            </td>
                                            <td style={{ padding: "16px 8px" }}>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                                    onClick={() => onOpenDateDialog(phaseName)}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {end ? format(end, "dd-MM-yyyy") : "Pick date"}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);
