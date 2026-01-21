// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from '@/lib/router';
import { Calendar as CalendarIcon, Check, History, Plus, Trash2 } from 'lucide-react';
import { useUseCases } from '@/hooks/use-usecases';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ParcsCategorySelect } from './components/ParcsCategorySelect';
import { UnitOfMeasurementSelect } from './components/UnitOfMeasurementSelect';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const reportMetricColumnSizes = {
    primarySuccessValue: 160,
    baselineValue: 160,
    baselineDate: 160,
    targetValue: 160,
    targetDate: 160,
    reportedValue: 160,
    reportedDate: 160,
    actions: 60,
};

const reportMetricColumns = [
    { key: 'primarySuccessValue', label: 'Primary Success Value', width: reportMetricColumnSizes.primarySuccessValue },
    { key: 'baselineValue', label: 'Baseline Value', width: reportMetricColumnSizes.baselineValue },
    { key: 'baselineDate', label: 'Baseline Date', width: reportMetricColumnSizes.baselineDate },
    { key: 'targetValue', label: 'Target Value', width: reportMetricColumnSizes.targetValue },
    { key: 'targetDate', label: 'Target Date', width: reportMetricColumnSizes.targetDate },
    { key: 'reportedValue', label: 'Reported Value', width: reportMetricColumnSizes.reportedValue },
    { key: 'reportedDate', label: 'Reported Date', width: reportMetricColumnSizes.reportedDate },
    { key: 'actions', label: '', width: reportMetricColumnSizes.actions },
];

const addMetricColumnSizes = {
    primarySuccessValue: 160,
    parcsCategory: 160,
    unitOfMeasurement: 160,
    baselineValue: 160,
    baselineDate: 160,
    targetValue: 160,
    targetDate: 160,
    actions: 60,
};

const addMetricColumns = [
    { key: 'primarySuccessValue', label: 'Primary Success Value', width: addMetricColumnSizes.primarySuccessValue },
    { key: 'parcsCategory', label: 'PARCS Category', width: addMetricColumnSizes.parcsCategory },
    { key: 'unitOfMeasurement', label: 'Unit of Measurement', width: addMetricColumnSizes.unitOfMeasurement },
    { key: 'baselineValue', label: 'Baseline Value', width: addMetricColumnSizes.baselineValue },
    { key: 'baselineDate', label: 'Baseline Date', width: addMetricColumnSizes.baselineDate },
    { key: 'targetValue', label: 'Target Value', width: addMetricColumnSizes.targetValue },
    { key: 'targetDate', label: 'Target Date', width: addMetricColumnSizes.targetDate },
    { key: 'actions', label: '', width: addMetricColumnSizes.actions },
];



const MetricDatePicker = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (date: string) => void;
}) => {
    const [open, setOpen] = useState(false);

    const dateValue = useMemo(() => {
        if (!value) return undefined;
        const parts = value.split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return undefined;
    }, [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal h-9 px-2 text-xs",
                        !value && "text-muted-foreground"
                    )}
                    onClick={() => setOpen(true)}
                >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {dateValue ? format(dateValue, "dd-MM-yyyy") : <span>Pick date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={(date) => {
                        if (date) {
                            onChange(format(date, "yyyy-MM-dd"));
                            setOpen(false);
                        }
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};

const MetricReporting = () => {
    const location = useLocation();
    const { submittedMetrics, useCaseTitle } = location.state || {};
    const { useCases: backendUseCases, loading } = useUseCases();
    const useCases = backendUseCases.map(uc => ({
        id: uc.ID,
        title: uc.Title || uc.UseCase || 'Untitled'
    }));

    const [metrics, setMetrics] = useState([]);
    const [isReporting, setIsReporting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedUseCase, setSelectedUseCase] = useState(useCaseTitle || (useCases.length > 0 ? useCases[0].title : ''));
    const didInitUseCase = useRef(false);

    // Update selectedUseCase if useCaseTitle changes or when useCases load
    useEffect(() => {
        if (useCaseTitle) {
            setSelectedUseCase(useCaseTitle);
            didInitUseCase.current = true;
        } else if (!didInitUseCase.current && !selectedUseCase && useCases.length > 0) {
            setSelectedUseCase(useCases[0].title);
            didInitUseCase.current = true;
        }
    }, [useCaseTitle, useCases, selectedUseCase]);

    useEffect(() => {
        if (submittedMetrics) {
            const initializedMetrics = submittedMetrics.map(m => ({
                ...m,
                reportedValue: m.reportedValue || '',
                reportedDate: m.reportedDate || '',
                isSubmitted: m.isSubmitted ?? true,
            }));
            setMetrics(initializedMetrics);
        }
    }, [submittedMetrics]);

    const reportableMetrics = metrics.filter(metric => metric.isSubmitted);
    const pendingMetrics = metrics.filter(metric => !metric.isSubmitted);
    const isAddMetricsFormValid = pendingMetrics.length > 0 && pendingMetrics.every(metric =>
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
            id: Date.now(),
            primarySuccessValue: '',
            parcsCategory: '',
            unitOfMeasurement: '',
            baselineValue: '',
            baselineDate: '',
            targetValue: '',
            targetDate: '',
            reportedValue: '',
            reportedDate: '',
            isSubmitted: false,
        };
        setMetrics(prev => [...prev, newMetric]);
    };

    const handleSaveMetrics = () => {
        if (!isAddMetricsFormValid) return;
        setMetrics(prev => prev.map(metric =>
            metric.isSubmitted ? metric : { ...metric, isSubmitted: true }
        ));
    };

    const handleDeleteMetric = (id) => {
        setMetrics(prev => prev.filter(metric => metric.id !== id));
        toast.success('Metric deleted successfully');
    };

    const handleReportMetric = () => {
        if (reportableMetrics.length > 0) {
            setIsReporting(true);
        }
    };

    const handleInputChange = (id, field, value) => {
        setMetrics(prev => prev.map(metric =>
            metric.id === id ? { ...metric, [field]: value } : metric
        ));
    };

    const isSubmitEnabled = isReporting && reportableMetrics.length > 0 && reportableMetrics.every(m => m.reportedValue && m.reportedDate);

    const handleSubmit = () => {
        if (isSubmitEnabled) {
            setShowSuccessModal(true);
        }
    };

    const handleModalOk = () => {
        setShowSuccessModal(false);
        setIsReporting(false);
        // Here you would typically save the reported values to a backend
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            <div className="w-[95%] mx-auto space-y-8">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Use Case
                    </label>
                    {loading ? (
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-9 w-64" />
                        </div>
                    ) : (
                        <div className="max-w-md">
                            <Input
                                type="search"
                                placeholder="Search use case"
                                className="h-9"
                                value={selectedUseCase}
                                onChange={(e) => setSelectedUseCase(e.target.value)}
                                list="use-case-options"
                            />
                            <datalist id="use-case-options">
                                {useCases.map((useCase) => (
                                    <option key={useCase.id} value={useCase.title} />
                                ))}
                            </datalist>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add Metrics</h3>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddMetric}
                                className="text-teal-600 border-teal-600 hover:bg-teal-50 h-8"
                            >
                                <Plus size={14} className="mr-1" />
                                Add New Metric
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSaveMetrics}
                                disabled={!isAddMetricsFormValid}
                                className="bg-teal-600 hover:bg-teal-700 text-white h-8"
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
                                                <TableCell style={{ width: addMetricColumnSizes.primarySuccessValue }}>
                                                    {metric.isSubmitted ? (
                                                        <span className="text-sm px-2 text-nowrap">{metric.primarySuccessValue}</span>
                                                    ) : (
                                                        <Input
                                                            type="text"
                                                            value={metric.primarySuccessValue}
                                                            onChange={(e) => handleInputChange(metric.id, 'primarySuccessValue', e.target.value)}
                                                            className="h-9"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: addMetricColumnSizes.parcsCategory }}>
                                                    {metric.isSubmitted ? (
                                                        <span className="text-sm px-2">{metric.parcsCategory}</span>
                                                    ) : (
                                                        <ParcsCategorySelect
                                                            value={metric.parcsCategory || ""}
                                                            onSelect={(val) => handleInputChange(metric.id, 'parcsCategory', val)}
                                                            className="metric-select"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: addMetricColumnSizes.unitOfMeasurement }}>
                                                    {metric.isSubmitted ? (
                                                        <span className="text-sm px-2">{metric.unitOfMeasurement}</span>
                                                    ) : (
                                                        <UnitOfMeasurementSelect
                                                            value={metric.unitOfMeasurement || ""}
                                                            onSelect={(val) => handleInputChange(metric.id, 'unitOfMeasurement', val)}
                                                            className="metric-select"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: addMetricColumnSizes.baselineValue }}>
                                                    {metric.isSubmitted ? (
                                                        <span className="text-sm px-2">{metric.baselineValue}</span>
                                                    ) : (
                                                        <Input
                                                            type="number"
                                                            className="number-input-no-spinner h-9"
                                                            value={metric.baselineValue}
                                                            onChange={(e) => handleInputChange(metric.id, 'baselineValue', e.target.value)}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: addMetricColumnSizes.baselineDate }}>
                                                    {metric.isSubmitted ? (
                                                        <span className="text-sm px-2 text-nowrap">{metric.baselineDate}</span>
                                                    ) : (
                                                        <MetricDatePicker
                                                            value={metric.baselineDate}
                                                            onChange={(date) => handleInputChange(metric.id, 'baselineDate', date)}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: addMetricColumnSizes.targetValue }}>
                                                    {metric.isSubmitted ? (
                                                        <span className="text-sm px-2">{metric.targetValue}</span>
                                                    ) : (
                                                        <Input
                                                            type="number"
                                                            className="number-input-no-spinner h-9"
                                                            value={metric.targetValue}
                                                            onChange={(e) => handleInputChange(metric.id, 'targetValue', e.target.value)}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: addMetricColumnSizes.targetDate }}>
                                                    {metric.isSubmitted ? (
                                                        <span className="text-sm px-2 text-nowrap">{metric.targetDate}</span>
                                                    ) : (
                                                        <MetricDatePicker
                                                            value={metric.targetDate}
                                                            onChange={(date) => handleInputChange(metric.id, 'targetDate', date)}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: addMetricColumnSizes.actions }}>
                                                    <div className="flex justify-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteMetric(metric.id)}
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
                                <Button onClick={handleAddMetric}>
                                    Add New Metric
                                </Button>
                            </EmptyContent>
                        </Empty>
                    )}
                </div>

                <div className="p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Reported Metrics</h3>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReportMetric}
                                disabled={reportableMetrics.length === 0}
                                className="text-teal-600 border-teal-600 hover:bg-teal-50 h-8"
                            >
                                Report Metric
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={!isSubmitEnabled}
                                className="bg-teal-600 hover:bg-teal-700 text-white h-8"
                            >
                                Submit
                            </Button>
                        </div>
                    </div>

                    <style
                        dangerouslySetInnerHTML={{
                            __html: `
                                .number-input-no-spinner::-webkit-outer-spin-button,
                                .number-input-no-spinner::-webkit-inner-spin-button {
                                    -webkit-appearance: none;
                                    margin: 0;
                                }
                                .number-input-no-spinner[type=number] {
                                    -moz-appearance: textfield;
                                }
                            `,
                        }}
                    />

                    {reportableMetrics.length > 0 ? (
                        <div className="rounded-md border">
                            <ScrollArea className="h-[250px]">
                                <Table className="table-fixed">
                                    <TableHeader>
                                        <TableRow>
                                            {reportMetricColumns.map((column) => (
                                                <TableHead key={column.key} style={{ width: column.width }}>
                                                    {column.label}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportableMetrics.map((metric) => (
                                            <TableRow key={metric.id}>
                                                <TableCell style={{ width: reportMetricColumnSizes.primarySuccessValue }}>
                                                    {metric.primarySuccessValue}
                                                </TableCell>
                                                <TableCell style={{ width: reportMetricColumnSizes.baselineValue }}>
                                                    {metric.baselineValue}
                                                </TableCell>
                                                <TableCell style={{ width: reportMetricColumnSizes.baselineDate }}>
                                                    {metric.baselineDate}
                                                </TableCell>
                                                <TableCell style={{ width: reportMetricColumnSizes.targetValue }}>
                                                    {metric.targetValue}
                                                </TableCell>
                                                <TableCell style={{ width: reportMetricColumnSizes.targetDate }}>
                                                    {metric.targetDate}
                                                </TableCell>
                                                <TableCell style={{ width: reportMetricColumnSizes.reportedValue }}>
                                                    {isReporting ? (
                                                        <Input
                                                            type="number"
                                                            className="number-input-no-spinner h-9"
                                                            value={metric.reportedValue}
                                                            onChange={(e) => handleInputChange(metric.id, 'reportedValue', e.target.value)}
                                                        />
                                                    ) : (
                                                        metric.reportedValue || '-'
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: reportMetricColumnSizes.reportedDate }}>
                                                    {isReporting ? (
                                                        <Input
                                                            type="date"
                                                            className="h-9"
                                                            value={metric.reportedDate}
                                                            onChange={(e) => handleInputChange(metric.id, 'reportedDate', e.target.value)}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span>{metric.reportedDate || '-'}</span>
                                                            {metric.reportedDate && <CalendarIcon size={16} className="text-muted-foreground" />}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: reportMetricColumnSizes.actions }}>
                                                    <div className="flex justify-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteMetric(metric.id)}
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
                                    <History className="size-5 text-gray-600" />
                                </EmptyMedia>
                                <EmptyTitle>No metrics to report</EmptyTitle>
                                <EmptyDescription>
                                    Add and save a metric above, then click "Report Metric" to start.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}
                </div>
            </div>

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <button className="absolute top-4 right-4" onClick={() => setShowSuccessModal(false)}>A-</button>
                        <div className="flex items-center justify-center mb-4">
                            <Check size={48} className="text-green-600" />
                        </div>
                        <p className="text-center mb-4">
                            Reported metrics submitted successfully!
                        </p>
                        <Button onClick={handleModalOk} className="w-full">
                            OK
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetricReporting;

