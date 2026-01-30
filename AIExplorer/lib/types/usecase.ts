export type UseCasePhasePlan = {
  phaseId: number | null;
  phaseName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type UseCaseSummary = {
  id: number;
  title: string;
  phase?: string;
  phaseId?: number | null;
  statusName?: string;
  statusColor?: string;
  businessUnitName?: string;
  teamName?: string;
  priority?: number | null;
  deliveryTimespan?: string | null;
  primaryContact?: string;
  headlines?: string;
  opportunity?: string;
  businessValue?: string;
  informationUrl?: string;
  productChecklist?: string | null;
  eseDependency?: string;
  phasePlan?: UseCasePhasePlan[];
};

export type UseCaseDetail = UseCaseSummary & {
  phaseStage?: string;
  editorEmail?: string;
};
