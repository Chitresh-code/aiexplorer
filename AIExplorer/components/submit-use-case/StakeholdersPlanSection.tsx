// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { CalendarIcon, Edit, Plus, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type Stakeholder = {
    name: string;
    role: string;
};

type Champion = {
    UKrewer: string;
};

type StakeholdersPlanSectionProps = {
    championsData: Champion[];
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
};

export const StakeholdersPlanSection = ({
    championsData,
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
                            {championsData.map((champion, idx) => (
                                <div key={`champion-${idx}`} className="flex items-center justify-between gap-3 group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border-none ring-1 ring-gray-100 shadow-sm">
                                            <AvatarFallback className="bg-[#E5FF1F] text-gray-900 text-[10px] font-bold">
                                                {champion.UKrewer.split(" ").map((n) => n[0]).join("").toUpperCase()}
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
                                                {stakeholder.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 leading-none">{stakeholder.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{stakeholder.role}</p>
                                        </div>
                                    </div>
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
                </CardHeader>
                <CardContent className="px-6 py-4">
                    <div className="metrics-table-container">
                        <table className="reporting-table" style={{ fontSize: "14px", tableLayout: "fixed", width: "100%" }}>
                            <thead>
                                <tr>
                                    <th style={{ width: "25%", padding: "12px 8px", fontWeight: "600", color: "#374151", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Phase</th>
                                    <th style={{ width: "37.5%", padding: "12px 8px", fontWeight: "600", color: "#374151", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Start Date</th>
                                    <th style={{ width: "37.5%", padding: "12px 8px", fontWeight: "600", color: "#374151", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>End Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-50">
                                    <td style={{ padding: "16px 8px", fontWeight: "500", textAlign: "left", fontSize: "14px", color: "#111827" }}>Idea</td>
                                    <td style={{ padding: "16px 8px" }}>
                                        <Button
                                            variant="outline"
                                            className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                            onClick={() => onOpenDateDialog("Idea")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "dd-MM-yyyy") : "Pick date"}
                                        </Button>
                                    </td>
                                    <td style={{ padding: "16px 8px" }}>
                                        <Button
                                            variant="outline"
                                            className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                            onClick={() => onOpenDateDialog("Idea")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "dd-MM-yyyy") : "Pick date"}
                                        </Button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td style={{ padding: "16px 8px", fontWeight: "500", textAlign: "left", fontSize: "14px", color: "#111827" }}>Diagnose</td>
                                    <td style={{ padding: "16px 8px" }}>
                                        <Button
                                            variant="outline"
                                            className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                            onClick={() => onOpenDateDialog("Diagnose")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {diagnoseStartDate ? format(diagnoseStartDate, "dd-MM-yyyy") : "Pick date"}
                                        </Button>
                                    </td>
                                    <td style={{ padding: "16px 8px" }}>
                                        <Button
                                            variant="outline"
                                            className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                            onClick={() => onOpenDateDialog("Diagnose")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {diagnoseEndDate ? format(diagnoseEndDate, "dd-MM-yyyy") : "Pick date"}
                                        </Button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td style={{ padding: "16px 8px", fontWeight: "500", textAlign: "left", fontSize: "14px", color: "#111827" }}>Design</td>
                                    <td style={{ padding: "16px 8px" }}>
                                        <Button
                                            variant="outline"
                                            className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                            onClick={() => onOpenDateDialog("Design")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {designStartDate ? format(designStartDate, "dd-MM-yyyy") : "Pick date"}
                                        </Button>
                                    </td>
                                    <td style={{ padding: "16px 8px" }}>
                                        <Button
                                            variant="outline"
                                            className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                            onClick={() => onOpenDateDialog("Design")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-2" />
                                            {designEndDate ? format(designEndDate, "dd-MM-yyyy") : "Pick date"}
                                        </Button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td style={{ padding: "16px 8px", fontWeight: "500", textAlign: "left", fontSize: "14px", color: "#111827" }}>Implemented</td>
                                    <td style={{ padding: "16px 8px" }}>
                                        <Button
                                            variant="outline"
                                            className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                            onClick={() => onOpenDateDialog("Implemented")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {implementedStartDate ? format(implementedStartDate, "dd-MM-yyyy") : "Pick date"}
                                        </Button>
                                    </td>
                                    <td style={{ padding: "16px 8px" }}>
                                        <Button
                                            variant="outline"
                                            className="h-9 w-full justify-start text-left font-normal text-sm px-3"
                                            onClick={() => onOpenDateDialog("Implemented")}
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
);
