"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, FileText, History, MessageSquare } from "lucide-react";

type ApprovalHistoryItem = {
  phase: string;
  approver: string;
  status: string;
  date: string;
};

type CompletionSummaryItem = {
  name: string;
  status: string;
};

type ActionsSectionProps = {
  isChampion: boolean;
  useCaseTitle: string;
  submittedBy: string;
  statusName: string;
  businessUnitName: string;
  useCasePhase: string;
  decisionPhaseLabel: string;
  decision: string;
  onDecisionChange: (value: string) => void;
  comments: string;
  onCommentsChange: (value: string) => void;
  onClearDecision: () => void;
  onSubmitDecision: () => void;
  approvalHistory: ApprovalHistoryItem[];
  statusOptions: string[];
  currentStatus: string;
  onCurrentStatusChange: (value: string) => void;
  completionSummary: CompletionSummaryItem[];
  nextPhaseOptions: string[];
  nextPhase: string;
  onNextPhaseChange: (value: string) => void;
  statusNotes: string;
  onStatusNotesChange: (value: string) => void;
  onUpdateStatus: () => void;
  onSendApprovalRequest: () => void;
};

const getStatusBadge = (status: string) => {
  if (status === "Approved") {
    return { bg: "#d4edda", color: "#155724" };
  }
  if (status === "Rejected") {
    return { bg: "#f8d7da", color: "#721c24" };
  }
  return { bg: "#e0e0e0", color: "#666" };
};

export const ActionsSection = ({
  isChampion,
  useCaseTitle,
  submittedBy,
  statusName,
  businessUnitName,
  useCasePhase,
  decisionPhaseLabel,
  decision,
  onDecisionChange,
  comments,
  onCommentsChange,
  onClearDecision,
  onSubmitDecision,
  approvalHistory,
  statusOptions,
  currentStatus,
  onCurrentStatusChange,
  completionSummary,
  nextPhaseOptions,
  nextPhase,
  onNextPhaseChange,
  statusNotes,
  onStatusNotesChange,
  onUpdateStatus,
  onSendApprovalRequest,
}: ActionsSectionProps) => {
  return (
    <div className="w-[95%] mx-auto space-y-8">
      {isChampion ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                    <div className="text-base font-semibold text-gray-900">{useCaseTitle || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Submitted By</div>
                    <div className="text-base font-medium text-gray-900">{submittedBy || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <div className="text-base font-medium text-gray-900">{statusName || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Business Unit</div>
                    <div className="text-base font-medium text-gray-900">{businessUnitName || "—"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-600" />
                  APPROVAL HISTORY
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {approvalHistory.length > 0 ? (
                  <div className="space-y-6">
                    {approvalHistory.map((item, index) => {
                      const badgeStyle = getStatusBadge(item.status);
                      return (
                        <div key={`${item.phase}-${index}`} className={`pb-4 ${index < approvalHistory.length - 1 ? "border-b border-gray-200" : ""}`}>
                          <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-1">Phase</div>
                            <div className="text-base font-semibold text-gray-900">{item.phase}</div>
                          </div>
                          <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-1">Status</div>
                            <span
                              className="text-sm px-3 py-1 rounded-full font-semibold"
                              style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}
                            >
                              {item.status}
                            </span>
                          </div>
                          <div className="mb-4">
                            <div className="text-sm text-gray-600 mb-1">Approver</div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-medium text-gray-900">{item.approver}</span>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-[#13352C] text-white text-xs">
                                  {item.approver
                                    .split(" ")
                                    .map((name) => name.charAt(0))
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
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
                ) : (
                  <div className="text-sm text-gray-500">No approval history available.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                YOUR DECISION ON {decisionPhaseLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8 mb-6">
                <div className="w-full md:w-1/4">
                  <Label htmlFor="decision">Your Decision</Label>
                  <Select value={decision} onValueChange={onDecisionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Decision" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" align="start" sideOffset={130} alignOffset={70} className="w-[180px]">
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
                    onChange={(e) => onCommentsChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end mt-4">
                <Button variant="outline" onClick={onClearDecision}>
                  Clear
                </Button>
                <Button onClick={onSubmitDecision} disabled={!comments.trim()} className="bg-[#13352C] hover:bg-[#0f2a23] text-white">
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      {!isChampion && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <div className="text-xl font-semibold text-primary mt-1">{useCasePhase || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Status</Label>
                    <Select value={currentStatus} onValueChange={onCurrentStatusChange}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" side="bottom" align="start" sideOffset={70} alignOffset={70} className="w-[200px]">
                        {statusOptions.length > 0 ? (
                          statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-status" disabled>
                            No statuses available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={onUpdateStatus} className="w-full">
                  Update Status
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  COMPLETION SUMMARY
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {completionSummary.length > 0 ? (
                  completionSummary.map((phase) => (
                    <div key={phase.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                      <span className="font-medium text-sm">{phase.name}</span>
                      <Badge variant={phase.status === "Completed" ? "default" : "secondary"} className="text-xs">
                        {phase.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No phase data available.</div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  APPROVAL HISTORY
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto pt-6">
                {approvalHistory.length > 0 ? (
                  <div className="space-y-4">
                    {approvalHistory.map((item, index) => {
                      const badgeStyle = getStatusBadge(item.status);
                      return (
                        <div key={`${item.phase}-${index}`} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">{item.phase}</span>
                            <Badge className="text-xs" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{item.date}</span>
                            <span>{item.approver}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No approval history available.</div>
                )}
              </CardContent>
            </Card>
          </div>

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
                    <Select value={nextPhase} onValueChange={onNextPhaseChange}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select Next Phase" />
                      </SelectTrigger>
                      <SelectContent position="popper" side="bottom" align="start" sideOffset={120} alignOffset={70} className="w-[200px]">
                        {nextPhaseOptions.length > 0 ? (
                          nextPhaseOptions.map((phase) => (
                            <SelectItem key={phase} value={phase}>
                              {phase}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-phase" disabled>
                            No phases available
                          </SelectItem>
                        )}
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
                    onChange={(e) => onStatusNotesChange(e.target.value)}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => onNextPhaseChange("")} className="sm:w-auto">
                  Clear Form
                </Button>
                <Button onClick={onSendApprovalRequest} className="sm:w-auto">
                  Send Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
