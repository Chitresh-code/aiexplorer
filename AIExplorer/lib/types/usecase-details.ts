export type PlanItem = {
  id: number | null;
  useCaseId: number | null;
  useCasePhaseId: number | null;
  phaseName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  modified?: string | null;
  created?: string | null;
  editorEmail?: string | null;
};

export type StakeholderItem = {
  id: number | null;
  useCaseId: number | null;
  roleId: number | null;
  roleName?: string | null;
  stakeholderEmail?: string | null;
  modified?: string | null;
  created?: string | null;
  editorEmail?: string | null;
};

export type UpdateItem = {
  id: number | null;
  useCaseId: number | null;
  meaningfulUpdate?: string | null;
  roleId: number | null;
  roleName?: string | null;
  useCasePhaseId: number | null;
  phaseName?: string | null;
  useCaseStatusId: number | null;
  statusName?: string | null;
  statusColor?: string | null;
  modified?: string | null;
  created?: string | null;
  editorEmail?: string | null;
};

export type MetricItem = {
  id: number | null;
  useCaseId: number | null;
  metricTypeId: number | null;
  unitOfMeasureId: number | null;
  primarySuccessMetricName?: string | null;
  baselineValue?: string | null;
  baselineDate?: string | null;
  targetValue?: string | null;
  targetDate?: string | null;
  modified?: string | null;
  created?: string | null;
  editorEmail?: string | null;
};

export type ReportedMetricItem = {
  id: number | null;
  useCaseId: number | null;
  metricId: number | null;
  reportedValue?: string | null;
  reportedDate?: string | null;
  modified?: string | null;
  created?: string | null;
  editorEmail?: string | null;
};

export type ChecklistItem = {
  questionId: number | null;
  response?: string | null;
};
