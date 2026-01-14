// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from '@/lib/router';
import { X, Plus, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useUseCases } from '@/hooks/use-usecases';
import { fetchMetrics } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { SectionCards } from "@/features/dashboard/components/SectionCards";

// MetricDatePicker component for calendar date selection with dialog
const MetricDatePicker = ({
    baselineValue,
    targetValue,
    onBaselineChange,
    onTargetChange,
    onOpenDialog,
}: {
    baselineValue: string,
    targetValue: string,
    onBaselineChange: (date: string) => void,
    onTargetChange: (date: string) => void,
    onOpenDialog: () => void,
}) => {
    // Parse the date strings "YYYY-MM-DD" safely
    const baselineDateValue = useMemo(() => {
        if (!baselineValue) return undefined;
        const parts = baselineValue.split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return undefined;
    }, [baselineValue]);

    const targetDateValue = useMemo(() => {
        if (!targetValue) return undefined;
        const parts = targetValue.split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return undefined;
    }, [targetValue]);

    return (
        <Button
            variant={"outline"}
            className={cn(
                "w-full justify-start text-left font-normal h-9 px-2 text-xs",
                (!baselineValue && !targetValue) && "text-muted-foreground"
            )}
            onClick={onOpenDialog}
        >
            <CalendarIcon className="mr-2 h-3 w-3" />
            {baselineDateValue && targetDateValue ?
                `${format(baselineDateValue, "dd-MM-yyyy")} / ${format(targetDateValue, "dd-MM-yyyy")}` :
                baselineDateValue ?
                    format(baselineDateValue, "dd-MM-yyyy") :
                    targetDateValue ?
                        format(targetDateValue, "dd-MM-yyyy") :
                        <span>Pick dates</span>
            }
        </Button>
    );
};

const Metrics = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { useCaseTitle, useCaseId } = location.state || {};

    const { useCases: backendUseCases } = useUseCases();
    const useCases = backendUseCases.map(uc => ({
        id: uc.ID,
        title: uc.Title || uc.UseCase || 'Untitled'
    }));

    const [metrics, setMetrics] = useState([]);

    const [selectedUseCase, setSelectedUseCase] = useState(useCaseTitle || (useCases.length > 0 ? useCases[0].title : ''));
    const [inputValues, setInputValues] = useState({});
    const [reportedMetrics, setReportedMetrics] = useState([]);

    // Update selectedUseCase if useCaseTitle changes or when useCases load
    useEffect(() => {
        if (useCaseTitle) {
            setSelectedUseCase(useCaseTitle);
        } else if (!selectedUseCase && useCases.length > 0) {
            setSelectedUseCase(useCases[0].title);
        }
    }, [useCaseTitle, useCases, selectedUseCase]);

    // Dialog state for date selection
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    const [editingMetricId, setEditingMetricId] = useState<number | null>(null);
    const [tempBaselineDate, setTempBaselineDate] = useState<Date | undefined>(undefined);
    const [tempTargetDate, setTempTargetDate] = useState<Date | undefined>(undefined);

    const isFormValid = metrics.length > 0 && metrics.every(metric =>
        metric.primarySuccessValue &&
        metric.parcsCategory &&
        metric.unitOfMeasurement &&
        metric.baselineValue &&
        metric.baselineDate &&
        metric.targetValue &&
        metric.targetDate
    );

    const handleAddMetric = () => {
        const newMetric = {
            id: Date.now(), // Use timestamp for unique ID
            primarySuccessValue: '',
            parcsCategory: '',
            unitOfMeasurement: '',
            baselineValue: '',
            baselineDate: '',
            targetValue: '',
            targetDate: ''
        };
        setMetrics([...metrics, newMetric]);
    };

    const handleRemoveMetric = (id) => {
        setMetrics(metrics.filter(metric => metric.id !== id));
    };

    const handleInputChange = (id, field, value) => {
        // Update local input values for immediate feedback
        const inputKey = `${id}-${field}`;
        setInputValues(prev => ({ ...prev, [inputKey]: value }));

        // Update main metrics state
        setMetrics(metrics.map(metric =>
            metric.id === id ? { ...metric, [field]: value } : metric
        ));
    };

    const getInputValue = (id, field) => {
        const inputKey = `${id}-${field}`;
        return inputValues[inputKey] !== undefined ? inputValues[inputKey] : '';
    };

    const handleSubmit = () => {
        if (isFormValid) {
            toast.success('Your metrics have been submitted successfully!');
            // Navigate to MetricReporting with the submitted metrics data
            navigate('/metric-reporting', {
                state: {
                    submittedMetrics: metrics,
                    useCaseId: useCaseId,
                    useCaseTitle: useCaseTitle
                }
            });
        }
    };

    const handleOpenDateDialog = (metricId: number) => {
        const metric = metrics.find(m => m.id === metricId);
        if (metric) {
            setEditingMetricId(metricId);
            setTempBaselineDate(metric.baselineDate ? new Date(metric.baselineDate + 'T00:00:00') : undefined);
            setTempTargetDate(metric.targetDate ? new Date(metric.targetDate + 'T00:00:00') : undefined);
            setIsDateDialogOpen(true);
        }
    };

    const handleSubmitDates = () => {
        if (editingMetricId !== null) {
            if (tempBaselineDate) {
                handleInputChange(editingMetricId, 'baselineDate', format(tempBaselineDate, "yyyy-MM-dd"));
            }
            if (tempTargetDate) {
                handleInputChange(editingMetricId, 'targetDate', format(tempTargetDate, "yyyy-MM-dd"));
            }
            toast.success('Dates updated successfully');
            setIsDateDialogOpen(false);
            setEditingMetricId(null);
            setTempBaselineDate(undefined);
            setTempTargetDate(undefined);
        }
    };

    useEffect(() => {
        const selectedUseCaseData = useCases.find(uc => uc.title === selectedUseCase);
        if (selectedUseCaseData) {
            fetchMetrics(selectedUseCaseData.id)
                .then(setReportedMetrics)
                .catch((error) => {
                    console.error('Error fetching metrics:', error);
                    setReportedMetrics([]);
                });
        } else {
            setReportedMetrics([]);
        }
    }, [selectedUseCase]);

    const columns: ColumnDef<any>[] = [
        {
            id: 'remove',
            header: '',
            cell: ({ row }) => (
                <button
                    className="remove-metric-btn"
                    onClick={() => handleRemoveMetric(row.original.id)}
                >
                    <X size={16} color="#ff0000" />
                </button>
            ),
            size: 45,
        },
        {
            accessorKey: 'primarySuccessValue',
            header: 'Primary Success Value',
            cell: ({ row }) => {
                const inputKey = `${row.original.id}-primarySuccessValue`;
                return (
                    <Input
                        type="text"
                        defaultValue={row.original.primarySuccessValue}
                        onChange={(e) => handleInputChange(row.original.id, 'primarySuccessValue', e.target.value)}
                    />
                );
            },
            size: 200,
        },
        {
            accessorKey: 'parcsCategory',
            header: 'PARCS Category',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between metric-select">
                            <span className="truncate">{row.original.parcsCategory || "Select"}</span>
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'parcsCategory', '')}>
                            Select
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'parcsCategory', 'Productivity')}>
                            Productivity
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'parcsCategory', 'Adoption')}>
                            Adoption
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'parcsCategory', 'Risk Mitigation')}>
                            Risk Mitigation
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'parcsCategory', 'Cost')}>
                            Cost
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'parcsCategory', 'Scale')}>
                            Scale
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            size: 150,
        },
        {
            accessorKey: 'unitOfMeasurement',
            header: 'Unit of Measurement',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between metric-select">
                            <span className="truncate">{row.original.unitOfMeasurement || "Select"}</span>
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', '')}>
                            Select
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', 'HoursPerDay')}>
                            HoursPerDay
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', 'HoursPerMonth')}>
                            HoursPerMonth
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', 'HoursPerYear')}>
                            HoursPerYear
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', 'HoursPerCase')}>
                            HoursPerCase
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', 'HoursPerTransaction')}>
                            HoursPerTransaction
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', 'USDPerMonth')}>
                            USDPerMonth
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', 'USDPerYear')}>
                            USDPerYear
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', 'USD')}>
                            USD
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', 'Users')}>
                            Users
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInputChange(row.original.id, 'unitOfMeasurement', 'Audited Risks')}>
                            Audited Risks
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            size: 180,
        },
        {
            accessorKey: 'baselineValue',
            header: 'Baseline Value',
            cell: ({ row }) => {
                return (
                    <Input
                        type="number"
                        className="number-input-no-spinner"
                        defaultValue={row.original.baselineValue}
                        onChange={(e) => handleInputChange(row.original.id, 'baselineValue', e.target.value)}
                    />
                );
            },
            size: 150,
        },
        {
            accessorKey: 'baselineDate',
            header: 'Baseline Date',
            cell: ({ row }) => (
                <MetricDatePicker
                    baselineValue={row.original.baselineDate}
                    targetValue={row.original.targetDate}
                    onBaselineChange={(date) => handleInputChange(row.original.id, 'baselineDate', date)}
                    onTargetChange={(date) => handleInputChange(row.original.id, 'targetDate', date)}
                    onOpenDialog={() => handleOpenDateDialog(row.original.id)}
                />
            ),
            size: 130,
        },
        {
            accessorKey: 'targetValue',
            header: 'Target Value',
            cell: ({ row }) => {
                return (
                    <Input
                        type="number"
                        className="number-input-no-spinner"
                        defaultValue={row.original.targetValue}
                        onChange={(e) => handleInputChange(row.original.id, 'targetValue', e.target.value)}
                    />
                );
            },
            size: 150,
        },
        {
            accessorKey: 'targetDate',
            header: 'Target Date',
            cell: ({ row }) => (
                <MetricDatePicker
                    baselineValue={row.original.baselineDate}
                    targetValue={row.original.targetDate}
                    onBaselineChange={(date) => handleInputChange(row.original.id, 'baselineDate', date)}
                    onTargetChange={(date) => handleInputChange(row.original.id, 'targetDate', date)}
                    onOpenDialog={() => handleOpenDateDialog(row.original.id)}
                />
            ),
            size: 130,
        },
    ];

    const reportedColumns: ColumnDef<any>[] = [
        {
            accessorKey: 'primarySuccessValue',
            header: 'Primary Success Value',
            cell: ({ row }) => <span>{row.original.primarySuccessValue}</span>,
            size: 200,
        },
        {
            accessorKey: 'parcsCategory',
            header: 'PARCS Category',
            cell: ({ row }) => <span>{row.original.parcsCategory}</span>,
            size: 150,
        },
        {
            accessorKey: 'unitOfMeasurement',
            header: 'Unit of Measurement',
            cell: ({ row }) => <span>{row.original.unitOfMeasurement}</span>,
            size: 180,
        },
        {
            accessorKey: 'baselineValue',
            header: 'Baseline Value',
            cell: ({ row }) => <span>{row.original.baselineValue}</span>,
            size: 150,
        },
        {
            accessorKey: 'baselineDate',
            header: 'Baseline Date',
            cell: ({ row }) => <span>{row.original.baselineDate}</span>,
            size: 130,
        },
        {
            accessorKey: 'targetValue',
            header: 'Target Value',
            cell: ({ row }) => <span>{row.original.targetValue}</span>,
            size: 150,
        },
        {
            accessorKey: 'targetDate',
            header: 'Target Date',
            cell: ({ row }) => <span>{row.original.targetDate}</span>,
            size: 130,
        },
    ];

    const table = useReactTable({
        data: metrics,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const reportedTable = useReactTable({
        data: reportedMetrics,
        columns: reportedColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            {/* KPI Dashboard Section */}
            <div className="w-full">
                <SectionCards />
            </div>

            {/* Use Case Selector and Actions Card */}
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                Use Case
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-64 justify-between">
                                        <span className="truncate">{selectedUseCase || "Select a use case"}</span>
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64">
                                    {useCases.map((useCase) => (
                                        <DropdownMenuItem
                                            key={useCase.id}
                                            onClick={() => setSelectedUseCase(useCase.title)}
                                        >
                                            {useCase.title}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                variant="outline"
                                onClick={handleAddMetric}
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} /> Add New Metric
                            </Button>

                            <Button
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Metrics Table Card */}
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                            .number-input-no-spinner::-webkit-outer-spin-button,
                            .number-input-no-spinner::-webkit-inner-spin-button {
                                -webkit-appearance: none;
                                margin: 0;
                            }
                            .number-input-no-spinner[type=number] {
                                -moz-appearance: textfield;
                            }
                        `
                    }} />

                    {metrics.length > 0 ? (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
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
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : null}
                                </TableBody>
                            </Table>
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
                                <Button onClick={handleAddMetric}>
                                    Add New Metric
                                </Button>
                            </EmptyContent>
                        </Empty>
                    )}
                </CardContent>
            </Card>

            {/* Reported Metrics Card */}
            {reportedMetrics.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="border-b">
                        <CardTitle>Reported Metrics</CardTitle>
                        <CardDescription>Previously reported metrics for this use case</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    {reportedTable.getHeaderGroups().map((headerGroup) => (
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
                                    {reportedTable.getRowModel().rows?.length ? (
                                        reportedTable.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : null}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Date Selection Dialog */}
            <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Select Baseline and Target Dates</DialogTitle>
                        <DialogDescription>
                            Please select both baseline and target dates for this metric.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Baseline Date</label>
                            <Calendar
                                mode="single"
                                selected={tempBaselineDate}
                                onSelect={setTempBaselineDate}
                                className="rounded-md border"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Date</label>
                            <Calendar
                                mode="single"
                                selected={tempTargetDate}
                                onSelect={setTempTargetDate}
                                className="rounded-md border"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitDates}>
                            Submit Dates
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Metrics;
