// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { flexRender } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type MetricsSectionProps = {
    metrics: unknown[];
    table: any;
    onAddMetric: () => void;
    onSaveMetrics: () => void;
    canSave: boolean;
};

export const MetricsSection = ({
    metrics,
    table,
    onAddMetric,
    onSaveMetrics,
    canSave,
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
                    <Button
                        size="sm"
                        onClick={onSaveMetrics}
                        type="button"
                        className="bg-teal-600 hover:bg-teal-700 text-white h-8"
                        disabled={!canSave}
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
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} style={{ width: header.getSize() }}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : null}
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
