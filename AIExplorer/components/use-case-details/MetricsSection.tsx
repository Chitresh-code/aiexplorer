"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ParcsCategorySelect } from "@/components/use-case-details/ParcsCategorySelect";
import { UnitOfMeasurementSelect } from "@/components/use-case-details/UnitOfMeasurementSelect";
import { cn } from "@/lib/utils";
import { Plus, History, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { flexRender, type Table as TableType } from "@tanstack/react-table";

export type MetricsRow = {
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
};

export type ReportedHistoryRow = {
  id: number;
  metricId: number;
  primarySuccessValue: string;
  reportedValue: string;
  reportedDate: string;
};

type MetricsSectionProps = {
  metrics: MetricsRow[];
  reportedMetrics?: MetricsRow[];
  addMetricsTable: TableType<MetricsRow>;
  reportedTable: TableType<MetricsRow>;
  shouldShowReportedTable: boolean;
  reportedHistory?: ReportedHistoryRow[];
  isEditing: boolean;
  isMetricsFormValid: boolean;
  metricCategories?: string[];
  unitOfMeasurementOptions?: string[];
  onChangeMetric?: (id: number | string, field: keyof MetricsRow, value: string) => void;
  onChangeReportedMetric?: (id: number | string, field: keyof MetricsRow, value: string) => void;
  onOpenMetricDateDialog?: (metric: MetricsRow) => void;
  onDeleteMetric?: (id: number | string) => void;
  onDeleteReportedMetric?: (id: number | string) => void;
  onAddMetric: () => void;
  onSubmitMetrics: () => void;
  onOpenReportMetric: () => void;
  onSaveReportedMetrics: () => void;
};

const MetricDatePicker = ({
  value,
  onChange,
  onOpenDialog,
}: {
  value: string;
  onChange: (date: string) => void;
  onOpenDialog?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const dateValue = useMemo(() => {
    if (!value) return undefined;
    const parts = value.split("-");
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return undefined;
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
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
          {dateValue ? (
            `${String(dateValue.getMonth() + 1).padStart(2, "0")}-${String(dateValue.getDate()).padStart(2, "0")}-${dateValue.getFullYear()}`
          ) : (
            <span>Pick date</span>
          )}
        </Button>
      </PopoverTrigger>
      {!onOpenDialog && (
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={(date) => {
              if (date) {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                const dd = String(date.getDate()).padStart(2, "0");
                onChange(`${yyyy}-${mm}-${dd}`);
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

const metricColumnSizes = {
  primarySuccessValue: 260,
  parcsCategory: 220,
  unitOfMeasurement: 200,
  baselineValue: 140,
  baselineDate: 140,
  targetValue: 140,
  targetDate: 140,
  actions: 60,
};

export const MetricsSection = ({
  metrics,
  reportedMetrics = [],
  addMetricsTable,
  reportedTable,
  shouldShowReportedTable,
  reportedHistory,
  isEditing,
  isMetricsFormValid,
  metricCategories = [],
  unitOfMeasurementOptions = [],
  onChangeMetric,
  onChangeReportedMetric,
  onOpenMetricDateDialog,
  onDeleteMetric,
  onDeleteReportedMetric,
  onAddMetric,
  onSubmitMetrics,
  onOpenReportMetric,
  onSaveReportedMetrics,
}: MetricsSectionProps) => {
  return (
    <div className="w-[95%] mx-auto">
      <div className="mb-8 p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Metrics</h3>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMetric}
                className="text-teal-600 border-teal-600 hover:bg-teal-50 h-8"
              >
                <Plus size={14} className="mr-1" />
                Add New Metric
              </Button>
            </div>
          ) : null}
        </div>

        {metrics.length > 0 ? (
          <div className="rounded-md border">
            <div className="max-h-[250px] overflow-auto">
              <Table className="table-fixed min-w-[1200px]">
                <TableHeader>
                  {isEditing ? (
                    <TableRow>
                      <TableHead style={{ width: metricColumnSizes.primarySuccessValue }}>Primary Success Value</TableHead>
                      <TableHead style={{ width: metricColumnSizes.parcsCategory }}>PARCS Category</TableHead>
                      <TableHead style={{ width: metricColumnSizes.unitOfMeasurement }}>Unit of Measurement</TableHead>
                      <TableHead style={{ width: metricColumnSizes.baselineValue }}>Baseline Value</TableHead>
                      <TableHead style={{ width: metricColumnSizes.baselineDate }}>Baseline Date</TableHead>
                      <TableHead style={{ width: metricColumnSizes.targetValue }}>Target Value</TableHead>
                      <TableHead style={{ width: metricColumnSizes.targetDate }}>Target Date</TableHead>
                      <TableHead style={{ width: metricColumnSizes.actions }} />
                    </TableRow>
                  ) : (
                    addMetricsTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} style={{ width: header.getSize() }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableHeader>
                <TableBody>
                  {isEditing ? (
                    metrics.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell style={{ width: metricColumnSizes.primarySuccessValue }}>
                          <Input
                            type="text"
                            value={metric.primarySuccessValue ?? ""}
                            onChange={(e) => onChangeMetric?.(metric.id, "primarySuccessValue", e.target.value)}
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell style={{ width: metricColumnSizes.parcsCategory }}>
                          <ParcsCategorySelect
                            value={metric.parcsCategory || ""}
                            onSelect={(val) => onChangeMetric?.(metric.id, "parcsCategory", val)}
                            options={metricCategories}
                            className="metric-select"
                          />
                        </TableCell>
                        <TableCell style={{ width: metricColumnSizes.unitOfMeasurement }}>
                          <UnitOfMeasurementSelect
                            value={metric.unitOfMeasurement || ""}
                            onSelect={(val) => onChangeMetric?.(metric.id, "unitOfMeasurement", val)}
                            options={unitOfMeasurementOptions}
                            className="metric-select"
                          />
                        </TableCell>
                        <TableCell style={{ width: metricColumnSizes.baselineValue }}>
                          <Input
                            type="number"
                            className="number-input-no-spinner h-9"
                            value={metric.baselineValue ?? ""}
                            onChange={(e) => onChangeMetric?.(metric.id, "baselineValue", e.target.value)}
                          />
                        </TableCell>
                        <TableCell style={{ width: metricColumnSizes.baselineDate }}>
                          <MetricDatePicker
                            value={metric.baselineDate || ""}
                            onChange={(date) => onChangeMetric?.(metric.id, "baselineDate", date)}
                            onOpenDialog={
                              onOpenMetricDateDialog ? () => onOpenMetricDateDialog(metric) : undefined
                            }
                          />
                        </TableCell>
                        <TableCell style={{ width: metricColumnSizes.targetValue }}>
                          <Input
                            type="number"
                            className="number-input-no-spinner h-9"
                            value={metric.targetValue ?? ""}
                            onChange={(e) => onChangeMetric?.(metric.id, "targetValue", e.target.value)}
                          />
                        </TableCell>
                        <TableCell style={{ width: metricColumnSizes.targetDate }}>
                          <MetricDatePicker
                            value={metric.targetDate || ""}
                            onChange={(date) => onChangeMetric?.(metric.id, "targetDate", date)}
                            onOpenDialog={
                              onOpenMetricDateDialog ? () => onOpenMetricDateDialog(metric) : undefined
                            }
                          />
                        </TableCell>
                        <TableCell style={{ width: metricColumnSizes.actions }}>
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onDeleteMetric?.(metric.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    addMetricsTable.getRowModel().rows?.length
                      ? addMetricsTable.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      : null
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <Empty className="border border-dashed border-gray-200 bg-white/70">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Plus className="size-5 text-gray-600" />
              </EmptyMedia>
              <EmptyTitle>No metrics added yet</EmptyTitle>
              <EmptyDescription>Start by adding a new metric to track your progress.</EmptyDescription>
            </EmptyHeader>
            {isEditing ? (
              <EmptyContent>
                <Button onClick={onAddMetric}>Add New Metric</Button>
              </EmptyContent>
            ) : null}
          </Empty>
        )}
      </div>

      <div className="p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Reported Metrics</h3>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenReportMetric}
                className="text-teal-600 border-teal-600 hover:bg-teal-50 h-8"
              >
                Report Metric
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          {shouldShowReportedTable ? (
            <div className="rounded-md border">
              <div className="max-h-[250px] overflow-auto">
                <Table className="table-fixed min-w-[1200px]">
                  <TableHeader>
                    {isEditing ? (
                      <TableRow>
                        <TableHead style={{ width: metricColumnSizes.primarySuccessValue }}>Primary Success Value</TableHead>
                        <TableHead style={{ width: metricColumnSizes.baselineValue }}>Baseline Value</TableHead>
                        <TableHead style={{ width: metricColumnSizes.baselineDate }}>Baseline Date</TableHead>
                        <TableHead style={{ width: metricColumnSizes.targetValue }}>Target Value</TableHead>
                        <TableHead style={{ width: metricColumnSizes.targetDate }}>Target Date</TableHead>
                        <TableHead style={{ width: metricColumnSizes.targetValue }}>Reported Value</TableHead>
                        <TableHead style={{ width: metricColumnSizes.targetDate }}>Reported Date</TableHead>
                        <TableHead style={{ width: metricColumnSizes.actions }} />
                      </TableRow>
                    ) : (
                      reportedTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} style={{ width: header.getSize() }}>
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableHeader>
                  <TableBody>
                    {isEditing ? (
                      reportedMetrics.map((metric) => (
                        <TableRow key={metric.id}>
                          <TableCell style={{ width: metricColumnSizes.primarySuccessValue }}>
                            <span className="text-sm px-2 whitespace-normal break-words">
                              {metric.primarySuccessValue}
                            </span>
                          </TableCell>
                          <TableCell style={{ width: metricColumnSizes.baselineValue }}>
                            <span className="text-sm px-2 whitespace-normal break-words">
                              {metric.baselineValue}
                            </span>
                          </TableCell>
                          <TableCell style={{ width: metricColumnSizes.baselineDate }}>
                            <span className="text-sm px-2 whitespace-normal break-words">
                              {metric.baselineDate}
                            </span>
                          </TableCell>
                          <TableCell style={{ width: metricColumnSizes.targetValue }}>
                            <span className="text-sm px-2 whitespace-normal break-words">
                              {metric.targetValue}
                            </span>
                          </TableCell>
                          <TableCell style={{ width: metricColumnSizes.targetDate }}>
                            <span className="text-sm px-2 whitespace-normal break-words">
                              {metric.targetDate}
                            </span>
                          </TableCell>
                          <TableCell style={{ width: metricColumnSizes.targetValue }}>
                            <Input
                              type="number"
                              className="number-input-no-spinner h-9"
                              value={metric.reportedValue ?? ""}
                              onChange={(e) => onChangeReportedMetric?.(metric.id, "reportedValue", e.target.value)}
                            />
                          </TableCell>
                          <TableCell style={{ width: metricColumnSizes.targetDate }}>
                            <MetricDatePicker
                              value={metric.reportedDate || ""}
                              onChange={(date) => onChangeReportedMetric?.(metric.id, "reportedDate", date)}
                            />
                          </TableCell>
                          <TableCell style={{ width: metricColumnSizes.actions }}>
                            <div className="flex justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onDeleteReportedMetric?.(metric.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      reportedTable.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <Empty className="border border-dashed border-gray-200 bg-white/70">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <History className="size-5 text-gray-600" />
                </EmptyMedia>
                <EmptyTitle>No reporting active</EmptyTitle>
                <EmptyDescription>
                  Select a metric from the dropdown above and click 'Report Metric' to start.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>

        {null}
      </div>
    </div>
  );
};
