"use client";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, History } from "lucide-react";
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
  addMetricsTable: TableType<MetricsRow>;
  reportedTable: TableType<MetricsRow>;
  shouldShowReportedTable: boolean;
  reportedHistory?: ReportedHistoryRow[];
  isMetricsFormValid: boolean;
  onAddMetric: () => void;
  onSubmitMetrics: () => void;
  onOpenReportMetric: () => void;
  onSaveReportedMetrics: () => void;
};

export const MetricsSection = ({
  metrics,
  addMetricsTable,
  reportedTable,
  shouldShowReportedTable,
  reportedHistory,
  isMetricsFormValid,
  onAddMetric,
  onSubmitMetrics,
  onOpenReportMetric,
  onSaveReportedMetrics,
}: MetricsSectionProps) => {
  return (
    <div className="w-[95%] mx-auto">
      <div className="mb-8 p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add Metrics</h3>
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
            <Button
              size="sm"
              onClick={onSubmitMetrics}
              className="bg-teal-600 hover:bg-teal-700 text-white h-8"
              disabled={!isMetricsFormValid}
            >
              Save
            </Button>
          </div>
        </div>

        {metrics.length > 0 ? (
          <div className="rounded-md border">
            <ScrollArea className="h-[250px]">
              <Table className="table-fixed">
                <TableHeader>
                  {addMetricsTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} style={{ width: header.getSize() }}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {addMetricsTable.getRowModel().rows?.length
                    ? addMetricsTable.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : null}
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
              <EmptyDescription>Start by adding a new metric to track your progress.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onAddMetric}>Add New Metric</Button>
            </EmptyContent>
          </Empty>
        )}
      </div>

      <div className="p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Reported Metrics</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenReportMetric}
              className="text-teal-600 border-teal-600 hover:bg-teal-50 h-8"
            >
              Report Metric
            </Button>
            <Button size="sm" onClick={onSaveReportedMetrics} className="bg-teal-600 hover:bg-teal-700 text-white h-8">
              Save
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {shouldShowReportedTable ? (
            <div className="rounded-md border">
              <ScrollArea className="h-[250px]">
                <Table className="table-fixed">
                  <TableHeader>
                    {reportedTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} style={{ width: header.getSize() }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {reportedTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
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

        {reportedHistory && reportedHistory.length > 0 ? (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Reported History
            </h4>
            <div className="rounded-md border">
              <ScrollArea className="h-[220px]">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Reported Value</TableHead>
                      <TableHead>Reported Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportedHistory.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-gray-700">{row.primarySuccessValue}</TableCell>
                        <TableCell className="text-gray-700">{row.reportedValue || "—"}</TableCell>
                        <TableCell className="text-gray-700">{row.reportedDate || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
