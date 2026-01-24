// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MetricDatePicker } from "@/components/submit-use-case/MetricDatePicker";
import { ParcsCategorySelect } from "@/components/submit-use-case/ParcsCategorySelect";
import { UnitOfMeasurementSelect } from "@/components/submit-use-case/UnitOfMeasurementSelect";

type Metric = {
    id: number;
    primarySuccessValue: string;
    parcsCategory: string;
    unitOfMeasurement: string;
    baselineValue: string;
    baselineDate: string;
    targetValue: string;
    targetDate: string;
    isSubmitted?: boolean;
};

const metricColumnSizes = {
    primarySuccessValue: 160,
    parcsCategory: 160,
    unitOfMeasurement: 160,
    baselineValue: 160,
    baselineDate: 160,
    targetValue: 160,
    targetDate: 160,
    actions: 96,
};

const addMetricColumns = [
    { key: "primarySuccessValue", label: "Primary Success Value", width: metricColumnSizes.primarySuccessValue },
    { key: "parcsCategory", label: "PARCS Category", width: metricColumnSizes.parcsCategory },
    { key: "unitOfMeasurement", label: "Unit of Measurement", width: metricColumnSizes.unitOfMeasurement },
    { key: "baselineValue", label: "Baseline Value", width: metricColumnSizes.baselineValue },
    { key: "baselineDate", label: "Baseline Date", width: metricColumnSizes.baselineDate },
    { key: "targetValue", label: "Target Value", width: metricColumnSizes.targetValue },
    { key: "targetDate", label: "Target Date", width: metricColumnSizes.targetDate },
    { key: "actions", label: "", width: metricColumnSizes.actions },
];

type MetricsSectionProps = {
    metrics: Metric[];
    metricCategories: string[];
    unitOfMeasurementOptions: string[];
    isSuggestionsLoading?: boolean;
    suggestionsAvailable?: boolean;
    aiGeneratedMetricIds?: Record<number, boolean>;
    onAddMetric: () => void;
    onDeleteMetric: (id: number | string) => void;
    onChangeMetric: (id: number | string, field: keyof Metric, value: string) => void;
    onOpenMetricDateDialog: (metric: Metric) => void;
    onAcceptSuggestions?: () => void;
    onRejectSuggestions?: () => void;
};

export const MetricsSection = ({
    metrics,
    metricCategories,
    unitOfMeasurementOptions,
    isSuggestionsLoading = false,
    suggestionsAvailable = false,
    aiGeneratedMetricIds = {},
    onAddMetric,
    onDeleteMetric,
    onChangeMetric,
    onOpenMetricDateDialog,
    onAcceptSuggestions = () => {},
    onRejectSuggestions = () => {},
}: MetricsSectionProps) => (
    <div className="space-y-6">
        <div className="mb-8 p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add Metrics</h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAddMetric}
                        type="button"
                        className="text-teal-600 border-teal-600 hover:bg-teal-50 h-8"
                    >
                        <Plus size={14} className="mr-1" />
                        Add New Metric
                    </Button>
                </div>
            </div>
            {isSuggestionsLoading && (
                <div className="mb-4 text-xs text-sky-600">Generating AI suggestions...</div>
            )}
            {suggestionsAvailable && (
                <div className="mb-4 flex items-center justify-between text-xs text-sky-600">
                    <span>Use AI suggestion for all metrics?</span>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-sky-600 hover:text-sky-700"
                            onClick={onAcceptSuggestions}
                        >
                            Yes
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-sky-600 hover:text-sky-700"
                            onClick={onRejectSuggestions}
                        >
                            No
                        </Button>
                    </div>
                </div>
            )}

            {metrics.length > 0 ? (
                <div className="rounded-md border">
                    <ScrollArea className="h-[250px]">
                        <Table className="table-fixed">
                            <TableHeader>
                                <TableRow>
                                    {addMetricColumns.map((column) => (
                                        <TableHead key={column.key} style={{ width: column.width }}>
                                            {column.label}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {metrics.map((metric) => (
                                    <TableRow key={metric.id}>
                                        <TableCell style={{ width: metricColumnSizes.primarySuccessValue }}>
                                            {metric.isSubmitted ? (
                                                <span className="text-sm px-2 text-nowrap">{metric.primarySuccessValue}</span>
                                            ) : (
                                                <Input
                                                    type="text"
                                                    value={metric.primarySuccessValue ?? ""}
                                                    onChange={(e) =>
                                                        onChangeMetric(metric.id, "primarySuccessValue", e.target.value)
                                                    }
                                                    className="h-9"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell style={{ width: metricColumnSizes.parcsCategory }}>
                                            {metric.isSubmitted ? (
                                                <span className="text-sm px-2">{metric.parcsCategory}</span>
                                            ) : (
                                                <ParcsCategorySelect
                                                    value={metric.parcsCategory || ""}
                                                    onSelect={(val) => onChangeMetric(metric.id, "parcsCategory", val)}
                                                    options={metricCategories}
                                                    className="metric-select"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell style={{ width: metricColumnSizes.unitOfMeasurement }}>
                                            {metric.isSubmitted ? (
                                                <span className="text-sm px-2">{metric.unitOfMeasurement}</span>
                                            ) : (
                                                <UnitOfMeasurementSelect
                                                    value={metric.unitOfMeasurement || ""}
                                                    onSelect={(val) =>
                                                        onChangeMetric(metric.id, "unitOfMeasurement", val)
                                                    }
                                                    options={unitOfMeasurementOptions}
                                                    className="metric-select"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell style={{ width: metricColumnSizes.baselineValue }}>
                                            {metric.isSubmitted ? (
                                                <span className="text-sm px-2">{metric.baselineValue}</span>
                                            ) : (
                                                <Input
                                                    type="number"
                                                    className="number-input-no-spinner h-9"
                                                    value={metric.baselineValue ?? ""}
                                                    onChange={(e) =>
                                                        onChangeMetric(metric.id, "baselineValue", e.target.value)
                                                    }
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell style={{ width: metricColumnSizes.baselineDate }}>
                                            {metric.isSubmitted ? (
                                                <span className="text-sm px-2 text-nowrap">{metric.baselineDate}</span>
                                            ) : (
                                                <MetricDatePicker
                                                    value={metric.baselineDate}
                                                    onChange={(date) => onChangeMetric(metric.id, "baselineDate", date)}
                                                    onOpenDialog={() => onOpenMetricDateDialog(metric)}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell style={{ width: metricColumnSizes.targetValue }}>
                                            {metric.isSubmitted ? (
                                                <span className="text-sm px-2">{metric.targetValue}</span>
                                            ) : (
                                                <Input
                                                    type="number"
                                                    className="number-input-no-spinner h-9"
                                                    value={metric.targetValue ?? ""}
                                                    onChange={(e) =>
                                                        onChangeMetric(metric.id, "targetValue", e.target.value)
                                                    }
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell style={{ width: metricColumnSizes.targetDate }}>
                                            {metric.isSubmitted ? (
                                                <span className="text-sm px-2 text-nowrap">{metric.targetDate}</span>
                                            ) : (
                                                <MetricDatePicker
                                                    value={metric.targetDate}
                                                    onChange={(date) => onChangeMetric(metric.id, "targetDate", date)}
                                                    onOpenDialog={() => onOpenMetricDateDialog(metric)}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell style={{ width: metricColumnSizes.actions }} className="overflow-visible">
                                            <div className="flex items-center justify-end gap-2 pr-2">
                                                {aiGeneratedMetricIds[metric.id] && (
                                                    <span
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600"
                                                        title="AI generated"
                                                    >
                                                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => onDeleteMetric(metric.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            ) : (
                <Empty className="border border-dashed border-gray-200 bg-white/70">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Plus className="size-5 text-gray-600" />
                        </EmptyMedia>
                        <EmptyTitle>No metrics added yet</EmptyTitle>
                        <EmptyDescription>
                            Start by adding a new metric to track your progress.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={onAddMetric} type="button">
                            Add New Metric
                        </Button>
                    </EmptyContent>
                </Empty>
            )}
        </div>
    </div>
);
