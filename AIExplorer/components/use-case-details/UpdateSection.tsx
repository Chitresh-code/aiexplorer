"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { PhaseTimelineRow } from "@/components/use-case-details/PhaseTimelineRow";
import { Calendar as CalendarIcon, CheckCircle2, ChevronDown, Clock, Edit, Plus, Save, Trash2, Users } from "lucide-react";

type Stakeholder = {
  name: string;
  role: string;
  initial: string;
  canEdit: boolean;
};

type UpdateItem = {
  id: number;
  author: string;
  role?: string;
  phase?: string;
  status?: string;
  statusColor?: string;
  content: string;
  time: string;
  type: string;
};

type PhaseMapping = {
  id: number;
  name: string;
};

type PhaseDates = Record<string, { start?: Date; end?: Date }>;

type UpdateSectionProps = {
  showChangeStatusCard: boolean;
  selectedStatus: string;
  onSelectedStatusChange: (value: string) => void;
  statusOptions: string[];
  useCasePhase?: string;
  phaseMappings: PhaseMapping[];
  phaseDates: PhaseDates;
  onOpenPhaseDates: (phaseName: string) => void;
  isLoading?: boolean;
  isTimelineEditing: boolean;
  onToggleTimelineEdit: () => void;
  onSaveTimeline: () => void;
  stakeholders: Stakeholder[];
  onOpenStakeholderDialog: () => void;
  onEditStakeholder: (index: number) => void;
  onDeleteStakeholder: (index: number) => void;
  updateText: string;
  onUpdateTextChange: (value: string) => void;
  onPostUpdate: () => void;
  updates: UpdateItem[];
};

export const UpdateSection = ({
  showChangeStatusCard,
  selectedStatus,
  onSelectedStatusChange,
  statusOptions,
  useCasePhase,
  phaseMappings,
  phaseDates,
  onOpenPhaseDates,
  isLoading = false,
  isTimelineEditing,
  onToggleTimelineEdit,
  onSaveTimeline,
  stakeholders,
  onOpenStakeholderDialog,
  onEditStakeholder,
  onDeleteStakeholder,
  updateText,
  onUpdateTextChange,
  onPostUpdate,
  updates,
}: UpdateSectionProps) => {
  const getStatusBadgeClass = (color?: string) => {
    switch ((color ?? "").trim().toLowerCase()) {
      case "green":
        return "bg-green-100 text-green-700 border-green-200";
      case "red":
        return "bg-red-100 text-red-700 border-red-200";
      case "orange":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "gray":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };
  return (
    <div className="w-[95%] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-6 items-start lg:items-stretch mx-auto">
        <div className="space-y-6 lg:self-stretch lg:flex lg:flex-col lg:gap-6 lg:space-y-0">
          {showChangeStatusCard && (
            <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 flex flex-col min-h-[176px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Change Status
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200">
                    {useCasePhase || "—"}
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
                      {statusOptions.length > 0 ? (
                        statusOptions.map((status) => (
                          <DropdownMenuItem key={status} onClick={() => onSelectedStatusChange(status)}>
                            {status}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>No statuses available</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-teal-600" />
                  Timeline
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-teal-600 hover:bg-teal-50"
                  onClick={isTimelineEditing ? onSaveTimeline : onToggleTimelineEdit}
                >
                  {isTimelineEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <div className="space-y-3">
                <div className="grid grid-cols-[140px_1fr_1fr] gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wide px-4">
                  <span>Phase</span>
                  <span className="pl-6">Start Date</span>
                  <span className="pl-6">End Date</span>
                </div>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={`timeline-skeleton-${index}`}
                        className="grid grid-cols-[140px_1fr_1fr] gap-2 items-center p-4 bg-gray-50/50 rounded-lg border border-gray-100"
                      >
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ))}
                  </div>
                ) : phaseMappings.length > 0 ? (
                  phaseMappings.map((phase) => (
                    <PhaseTimelineRow
                      key={phase.id}
                      phaseName={phase.name}
                      start={phaseDates[phase.name]?.start}
                      end={phaseDates[phase.name]?.end}
                      onOpen={() => onOpenPhaseDates(phase.name)}
                      isEditable={isTimelineEditing}
                    />
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No phase mappings available.</div>
                )}
              </div>
            </CardContent>
          </Card>

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
                onClick={onOpenStakeholderDialog}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-3">
                  {isLoading ? (
                    [...Array(3)].map((_, index) => (
                      <div
                        key={`stakeholder-skeleton-${index}`}
                        className="flex items-center gap-3 rounded-md px-2 py-1.5"
                      >
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))
                  ) : stakeholders.length > 0 ? (
                    stakeholders.map((person, index) => (
                      <div
                        key={`${person.name}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-gray-50/70 transition-colors group"
                      >
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
                        {person.canEdit ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-teal-600 hover:bg-teal-50 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => onEditStakeholder(index)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 mr-1 text-gray-400 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => onDeleteStakeholder(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No stakeholders to display.</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:self-stretch lg:flex lg:flex-col lg:gap-6 lg:space-y-0">
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
                  onChange={(e) => onUpdateTextChange(e.target.value)}
                  className="min-h-[100px] bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-4"
                    onClick={onPostUpdate}
                    disabled={!updateText.trim()}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  {isLoading ? (
                    [...Array(3)].map((_, index) => (
                      <div key={`update-skeleton-${index}`} className="p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    ))
                  ) : (
                    updates.map((update) => (
                      <div key={update.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex gap-4">
                          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white shadow-sm">
                            <AvatarFallback className="bg-[#E5FF1F] text-gray-900 font-bold">
                              {update.author.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-bold text-gray-900">{update.author}</p>
                                  {update.role ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-2 py-0 h-5 font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    >
                                      {update.role}
                                    </Badge>
                                  ) : null}
                                </div>
                                <p className="text-sm text-gray-600 leading-normal whitespace-pre-wrap">{update.content}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-xs text-gray-400">{update.time}</span>
                                <div className="flex flex-wrap items-center justify-end gap-1">
                                  {update.phase ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-2 py-0 h-5 font-medium bg-slate-100 text-slate-600 hover:bg-slate-100"
                                    >
                                      {update.phase}
                                    </Badge>
                                  ) : null}
                                  {update.status ? (
                                    <Badge
                                      variant="secondary"
                                      className={`text-[10px] px-2 py-0 h-5 font-medium border ${getStatusBadgeClass(
                                        update.statusColor,
                                      )}`}
                                    >
                                      {update.status}
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            {update.type === "status_change" && (
                              <div className="mt-3 flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-tight">
                                  Phase Updated
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
