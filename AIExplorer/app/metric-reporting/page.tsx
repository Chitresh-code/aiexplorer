// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { Calendar as CalendarIcon, History, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { cn } from '@/lib/utils';
import {
    fetchUseCaseMetricsDetails,
    updateUseCaseMetrics,
} from '@/lib/api';
import { getMappings } from '@/lib/submit-use-case';
import { ParcsCategorySelect } from '@/components/use-case-details/ParcsCategorySelect';
import { UnitOfMeasurementSelect } from '@/components/use-case-details/UnitOfMeasurementSelect';

const metricColumnSizes = {
    primarySuccessValue: 260,
    parcsCategory: 220,
    unitOfMeasurement: 200,
    baselineValue: 140,
    baselineDate: 140,
    targetValue: 140,
    targetDate: 140,
    reportedValue: 160,
    reportedDate: 160,
    actions: 60,
};

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
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
        return undefined;
    }, [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        'w-full justify-start text-left font-normal h-9 px-2 text-xs',
                        !value && 'text-muted-foreground'
                    )}
                    onClick={() => setOpen(true)}
                >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {dateValue ? (
                        `${String(dateValue.getMonth() + 1).padStart(2, '0')}-${String(
                            dateValue.getDate()
                        ).padStart(2, '0')}-${dateValue.getFullYear()}`
                    ) : (
                        <span>Pick date</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={(date) => {
                        if (date) {
                            const yyyy = date.getFullYear();
                            const mm = String(date.getMonth() + 1).padStart(2, '0');
                            const dd = String(date.getDate()).padStart(2, '0');
                            onChange(`${yyyy}-${mm}-${dd}`);
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
    const { accounts } = useMsal();

    const [useCases, setUseCases] = useState([]);
    const [isUseCasesLoading, setIsUseCasesLoading] = useState(false);
    const [selectedUseCaseId, setSelectedUseCaseId] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [metricCategoryOptions, setMetricCategoryOptions] = useState([]);
    const [metricCategoryMap, setMetricCategoryMap] = useState(new Map());
    const [unitOfMeasureOptions, setUnitOfMeasureOptions] = useState([]);
    const [unitOfMeasureMap, setUnitOfMeasureMap] = useState(new Map());

    const [metricDetailRows, setMetricDetailRows] = useState([]);
    const [reportedMetricRows, setReportedMetricRows] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [reportedMetrics, setReportedMetrics] = useState([]);

    const [isMetricSelectDialogOpen, setIsMetricSelectDialogOpen] = useState(false);
    const [selectedMetricIdsForReporting, setSelectedMetricIdsForReporting] = useState([]);

    const metricsSnapshotRef = useRef(null);

    const userEmail = accounts?.[0]?.username ?? '';

    useEffect(() => {
        if (!userEmail) return;
        let isMounted = true;
        const loadUseCases = async () => {
            try {
                setIsUseCasesLoading(true);
                const response = await fetch(
                    `/api/usecases?role=owner&email=${encodeURIComponent(userEmail)}&view=full`,
                );
                const data = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(data?.message || 'Failed to load use cases');
                }
                const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
                const nextUseCases = items
                    .map((item) => ({
                        id: String(item.id ?? item.ID ?? ''),
                        title: String(item.title ?? item.Title ?? item.useCase ?? item.UseCase ?? '').trim(),
                    }))
                    .filter((item) => item.id && item.title);
                if (isMounted) {
                    setUseCases(nextUseCases);
                }
            } catch (error) {
                console.error('Failed to load use cases', error);
                if (isMounted) {
                    setUseCases([]);
                }
            } finally {
                if (isMounted) {
                    setIsUseCasesLoading(false);
                }
            }
        };
        loadUseCases();
        return () => {
            isMounted = false;
        };
    }, [userEmail]);

    useEffect(() => {
        if (selectedUseCaseId || useCases.length === 0) return;
        setSelectedUseCaseId(useCases[0].id);
    }, [useCases, selectedUseCaseId]);

    useEffect(() => {
        let isMounted = true;
        const loadMappings = async () => {
            try {
                const mappings = await getMappings(["metricCategories", "unitOfMeasure"]);
                if (!isMounted) return;
                const metricCategories = mappings.metricCategories;
                const unitOfMeasure = mappings.unitOfMeasure;
                const categoryOptions = (metricCategories?.items ?? [])
                    .map((item) => String(item.category ?? '').trim())
                    .filter(Boolean);
                const categoryMap = new Map();
                (metricCategories?.items ?? []).forEach((item) => {
                    const id = Number(item.id);
                    const name = String(item.category ?? '').trim();
                    if (Number.isFinite(id) && name) {
                        categoryMap.set(id, name);
                    }
                });

                const unitOptions = (unitOfMeasure?.items ?? [])
                    .map((item) => String(item.name ?? '').trim())
                    .filter(Boolean);
                const unitMap = new Map();
                (unitOfMeasure?.items ?? []).forEach((item) => {
                    const id = Number(item.id);
                    const name = String(item.name ?? '').trim();
                    if (Number.isFinite(id) && name) {
                        unitMap.set(id, name);
                    }
                });

                setMetricCategoryOptions(categoryOptions);
                setMetricCategoryMap(categoryMap);
                setUnitOfMeasureOptions(unitOptions);
                setUnitOfMeasureMap(unitMap);
            } catch (error) {
                console.error('Failed to load metric mappings', error);
            }
        };
        loadMappings();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedUseCaseId) {
            setMetricDetailRows([]);
            setReportedMetricRows([]);
            setMetrics([]);
            setReportedMetrics([]);
            metricsSnapshotRef.current = null;
            setSelectedMetricIdsForReporting([]);
            setIsEditing(false);
            return;
        }

        let isMounted = true;
        const loadMetrics = async () => {
            try {
                const payload = await fetchUseCaseMetricsDetails(selectedUseCaseId);
                if (!isMounted) return;
                setMetricDetailRows(payload?.metrics ?? []);
                setReportedMetricRows(payload?.reportedMetrics ?? []);
            } catch (error) {
                console.error('Failed to load metrics', error);
                if (isMounted) {
                    setMetricDetailRows([]);
                    setReportedMetricRows([]);
                }
            }
        };
        loadMetrics();
        return () => {
            isMounted = false;
        };
    }, [selectedUseCaseId]);

    useEffect(() => {
        if (!metricDetailRows.length && !reportedMetricRows.length) {
            setMetrics([]);
            setReportedMetrics([]);
            return;
        }

        const formatMetricDate = (value) => {
            if (!value) return '';
            const parsed = new Date(value);
            if (Number.isNaN(parsed.getTime())) return '';
            const yyyy = parsed.getFullYear();
            const mm = String(parsed.getMonth() + 1).padStart(2, '0');
            const dd = String(parsed.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        const mappedMetrics = metricDetailRows
            .map((row) => {
                const metricId = Number(row.id);
                if (!Number.isFinite(metricId)) return null;
                const metricTypeId = Number(row.metrictypeid);
                const unitId = Number(row.unitofmeasureid);
                return {
                    id: metricId,
                    primarySuccessValue: String(row.primarysuccessmetricname ?? '').trim(),
                    parcsCategory: metricCategoryMap.get(metricTypeId) ?? '',
                    unitOfMeasurement: unitOfMeasureMap.get(unitId) ?? '',
                    baselineValue: String(row.baselinevalue ?? ''),
                    baselineDate: formatMetricDate(String(row.baselinedate ?? '')),
                    targetValue: String(row.targetvalue ?? ''),
                    targetDate: formatMetricDate(String(row.targetdate ?? '')),
                    reportedValue: '',
                    reportedDate: '',
                    isSubmitted: true,
                };
            })
            .filter(Boolean);

        const latestReports = new Map();
        reportedMetricRows.forEach((row) => {
            const metricId = Number(row.metricid);
            if (!Number.isFinite(metricId)) return;
            const current = latestReports.get(metricId);
            const currentTime = current
                ? new Date(String(current.reporteddate ?? current.modified ?? current.created ?? '')).getTime()
                : -1;
            const nextTime = new Date(String(row.reporteddate ?? row.modified ?? row.created ?? '')).getTime();
            if (!current || (Number.isFinite(nextTime) && nextTime >= currentTime)) {
                latestReports.set(metricId, row);
            }
        });

        const nextReportedMetrics = mappedMetrics.map((metric) => {
            const report = latestReports.get(metric.id);
            return {
                ...metric,
                reportedValue: report ? String(report.reportedvalue ?? '') : '',
                reportedDate: report ? formatMetricDate(String(report.reporteddate ?? '')) : '',
                isSubmitted: true,
            };
        });

        setMetrics(mappedMetrics);
        setReportedMetrics(nextReportedMetrics);
    }, [metricDetailRows, reportedMetricRows, metricCategoryMap, unitOfMeasureMap]);

    const reportableMetrics = useMemo(() => metrics, [metrics]);

    const reportedHistoryMetrics = useMemo(
        () => reportedMetrics.filter((metric) => metric.reportedValue || metric.reportedDate),
        [reportedMetrics]
    );

    const selectedMetricsForReporting = useMemo(() => {
        if (selectedMetricIdsForReporting.length === 0) return [];
        const selectedSet = new Set(selectedMetricIdsForReporting);
        return reportedMetrics.filter((metric) => selectedSet.has(metric.id.toString()));
    }, [reportedMetrics, selectedMetricIdsForReporting]);

    const reportedMetricsForDisplay = useMemo(() => {
        if (selectedMetricsForReporting.length === 0) {
            return reportedHistoryMetrics;
        }
        const merged = [...reportedHistoryMetrics];
        const existingIds = new Set(reportedHistoryMetrics.map((metric) => metric.id));
        selectedMetricsForReporting.forEach((metric) => {
            if (!existingIds.has(metric.id)) {
                merged.push(metric);
            }
        });
        return merged;
    }, [reportedHistoryMetrics, selectedMetricsForReporting]);

    const shouldShowReportedTable = reportedMetricsForDisplay.length > 0;

    useEffect(() => {
        if (selectedMetricIdsForReporting.length === 0) return;
        const availableIds = new Set(reportableMetrics.map((metric) => metric.id.toString()));
        setSelectedMetricIdsForReporting((prev) => {
            const next = prev.filter((id) => availableIds.has(id));
            if (next.length === prev.length && next.every((id, idx) => id === prev[idx])) {
                return prev;
            }
            return next;
        });
    }, [reportableMetrics]);

    const isMetricsFormValid = useMemo(() => {
        if (metrics.length === 0) return false;
        const hasValue = (value) => String(value ?? '').trim().length > 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const metricsValid = metrics.every((metric) => {
            if (
                !hasValue(metric.primarySuccessValue) ||
                !hasValue(metric.parcsCategory) ||
                !hasValue(metric.unitOfMeasurement) ||
                !hasValue(metric.baselineValue) ||
                !hasValue(metric.baselineDate) ||
                !hasValue(metric.targetValue) ||
                !hasValue(metric.targetDate)
            ) {
                return false;
            }
            const baseline = new Date(`${metric.baselineDate}T00:00:00`);
            const target = new Date(`${metric.targetDate}T00:00:00`);
            if (Number.isNaN(baseline.getTime()) || Number.isNaN(target.getTime())) return false;
            return target > baseline && target > today;
        });
        if (!metricsValid) return false;

        if (shouldShowReportedTable) {
            const reportedValid = reportedMetricsForDisplay.every((metric) =>
                hasValue(metric.reportedValue) && hasValue(metric.reportedDate)
            );
            if (!reportedValid) return false;
        }
        return true;
    }, [metrics, reportedMetricsForDisplay, shouldShowReportedTable]);

    const handleAddMetric = useCallback(() => {
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
            isSubmitted: true,
        };
        setMetrics((prev) => [...prev, newMetric]);
        setReportedMetrics((prev) => [...prev, newMetric]);
    }, []);

    const handleDeleteMetric = useCallback((id) => {
        setMetrics((prev) => prev.filter((metric) => String(metric.id) !== String(id)));
        setReportedMetrics((prev) => prev.filter((metric) => String(metric.id) !== String(id)));
        toast.success('Metric deleted successfully');
    }, []);

    const handleChangeMetric = useCallback((id, field, value) => {
        setMetrics((prev) =>
            prev.map((metric) =>
                String(metric.id) === String(id) ? { ...metric, [field]: value } : metric
            )
        );
        setReportedMetrics((prev) =>
            prev.map((metric) =>
                String(metric.id) === String(id) ? { ...metric, [field]: value } : metric
            )
        );
    }, []);

    const handleChangeReportedMetric = useCallback((id, field, value) => {
        setReportedMetrics((prev) =>
            prev.map((metric) =>
                String(metric.id) === String(id) ? { ...metric, [field]: value } : metric
            )
        );
    }, []);

    const handleDeleteReportedMetric = useCallback((id) => {
        setReportedMetrics((prev) => prev.filter((metric) => String(metric.id) !== String(id)));
        toast.success('Reported metric removed');
    }, []);

    const handleStartEdit = useCallback(() => {
        if (!selectedUseCaseId) {
            toast.error('Select a use case first.');
            return;
        }
        metricsSnapshotRef.current = {
            metrics: metrics.map((metric) => ({ ...metric })),
            reportedMetrics: reportedMetrics.map((metric) => ({ ...metric })),
        };
        setIsEditing(true);
    }, [metrics, reportedMetrics, selectedUseCaseId]);

    const handleCancelEdit = useCallback(() => {
        const snapshot = metricsSnapshotRef.current;
        if (snapshot) {
            setMetrics(snapshot.metrics);
            setReportedMetrics(snapshot.reportedMetrics);
        }
        setIsEditing(false);
        setSelectedMetricIdsForReporting([]);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!selectedUseCaseId) {
            toast.error('Select a use case first.');
            return;
        }
        if (!isEditing) return;
        if (!isMetricsFormValid) {
            toast.error('Fill all metric fields and ensure target dates are valid.');
            return;
        }

        const snapshot = metricsSnapshotRef.current;
        if (!snapshot) {
            toast.error('No metrics to update.');
            return;
        }

        const metricTypeIdByName = new Map();
        metricCategoryMap.forEach((label, key) => {
            metricTypeIdByName.set(label, key);
        });
        const unitIdByName = new Map();
        unitOfMeasureMap.forEach((label, key) => {
            unitIdByName.set(label, key);
        });

        const normalize = (value) => String(value ?? '').trim();

        const snapshotMetricsById = new Map();
        snapshot.metrics.forEach((metric) => snapshotMetricsById.set(metric.id, metric));
        const currentMetricsById = new Map();
        metrics.forEach((metric) => currentMetricsById.set(metric.id, metric));

        const deleteMetricIds = snapshot.metrics
            .filter((metric) => !currentMetricsById.has(metric.id))
            .map((metric) => metric.id);

        const newMetrics = metrics
            .filter((metric) => !snapshotMetricsById.has(metric.id))
            .map((metric) => {
                const metricTypeId = metricTypeIdByName.get(metric.parcsCategory) ?? null;
                const unitOfMeasureId = unitIdByName.get(metric.unitOfMeasurement) ?? null;
                return {
                    metricTypeId,
                    unitOfMeasureId,
                    primarySuccessMetricName: metric.primarySuccessValue,
                    baselineValue: metric.baselineValue || null,
                    baselineDate: metric.baselineDate || null,
                    targetValue: metric.targetValue || null,
                    targetDate: metric.targetDate || null,
                };
            });

        const updateMetrics = metrics.reduce((acc, metric) => {
            const previous = snapshotMetricsById.get(metric.id);
            if (!previous) return acc;
            const patch = { id: metric.id };
            let hasChanges = false;

            if (normalize(metric.primarySuccessValue) !== normalize(previous.primarySuccessValue)) {
                patch.primarySuccessMetricName = metric.primarySuccessValue;
                hasChanges = true;
            }
            if (normalize(metric.parcsCategory) !== normalize(previous.parcsCategory)) {
                patch.metricTypeId = metric.parcsCategory
                    ? metricTypeIdByName.get(metric.parcsCategory) ?? null
                    : null;
                hasChanges = true;
            }
            if (normalize(metric.unitOfMeasurement) !== normalize(previous.unitOfMeasurement)) {
                patch.unitOfMeasureId = metric.unitOfMeasurement
                    ? unitIdByName.get(metric.unitOfMeasurement) ?? null
                    : null;
                hasChanges = true;
            }
            if (normalize(metric.baselineValue) !== normalize(previous.baselineValue)) {
                patch.baselineValue = metric.baselineValue || null;
                hasChanges = true;
            }
            if (normalize(metric.baselineDate) !== normalize(previous.baselineDate)) {
                patch.baselineDate = metric.baselineDate || null;
                hasChanges = true;
            }
            if (normalize(metric.targetValue) !== normalize(previous.targetValue)) {
                patch.targetValue = metric.targetValue || null;
                hasChanges = true;
            }
            if (normalize(metric.targetDate) !== normalize(previous.targetDate)) {
                patch.targetDate = metric.targetDate || null;
                hasChanges = true;
            }

            if (hasChanges) {
                acc.push(patch);
            }
            return acc;
        }, []);

        const latestReportIdByMetricId = new Map();
        reportedMetricRows.forEach((row) => {
            const metricId = Number(row.metricid);
            const reportId = Number(row.id);
            if (!Number.isFinite(metricId) || !Number.isFinite(reportId)) return;
            const current = latestReportIdByMetricId.get(metricId);
            if (!current) {
                latestReportIdByMetricId.set(metricId, reportId);
                return;
            }
            const currentRow = reportedMetricRows.find((item) => Number(item.id) === current);
            const currentTime = currentRow
                ? new Date(String(currentRow.reporteddate ?? currentRow.modified ?? currentRow.created ?? '')).getTime()
                : -1;
            const nextTime = new Date(String(row.reporteddate ?? row.modified ?? row.created ?? '')).getTime();
            if (!Number.isFinite(currentTime) || (Number.isFinite(nextTime) && nextTime >= currentTime)) {
                latestReportIdByMetricId.set(metricId, reportId);
            }
        });

        const snapshotReportedByMetricId = new Map();
        snapshot.reportedMetrics.forEach((metric) => snapshotReportedByMetricId.set(metric.id, metric));
        const currentReportedByMetricId = new Map();
        reportedMetrics.forEach((metric) => currentReportedByMetricId.set(metric.id, metric));

        const deleteReportedMetricIds = snapshot.reportedMetrics
            .filter((metric) => !currentReportedByMetricId.has(metric.id))
            .map((metric) => latestReportIdByMetricId.get(metric.id))
            .filter((value) => Number.isFinite(value));

        const updateReportedMetrics = reportedMetrics.reduce((acc, metric) => {
            const previous = snapshotReportedByMetricId.get(metric.id);
            if (!previous) return acc;
            const reportId = latestReportIdByMetricId.get(metric.id);
            if (!reportId) return acc;
            const patch = { id: reportId };
            let hasChanges = false;

            if (normalize(metric.reportedValue) !== normalize(previous.reportedValue)) {
                patch.reportedValue = metric.reportedValue || null;
                hasChanges = true;
            }
            if (normalize(metric.reportedDate) !== normalize(previous.reportedDate)) {
                patch.reportedDate = metric.reportedDate || null;
                hasChanges = true;
            }
            if (hasChanges) {
                acc.push(patch);
            }
            return acc;
        }, []);

        const newReportedMetrics = reportedMetrics
            .filter((metric) => !latestReportIdByMetricId.has(metric.id))
            .filter((metric) => normalize(metric.reportedValue) || normalize(metric.reportedDate))
            .map((metric) => ({
                metricId: metric.id,
                reportedValue: metric.reportedValue || null,
                reportedDate: metric.reportedDate || null,
            }));

        const hasChanges =
            newMetrics.length ||
            updateMetrics.length ||
            deleteMetricIds.length ||
            newReportedMetrics.length ||
            updateReportedMetrics.length ||
            deleteReportedMetricIds.length;

        if (!hasChanges) {
            toast.message('No changes to save.');
            return;
        }

        try {
            await updateUseCaseMetrics(selectedUseCaseId, {
                newMetrics,
                updateMetrics,
                deleteMetricIds,
                newReportedMetrics,
                updateReportedMetrics,
                deleteReportedMetricIds,
                editorEmail: userEmail,
            });
            const payload = await fetchUseCaseMetricsDetails(selectedUseCaseId);
            setMetricDetailRows(payload?.metrics ?? []);
            setReportedMetricRows(payload?.reportedMetrics ?? []);
            toast.success('Metrics updated successfully');
            metricsSnapshotRef.current = null;
            setIsEditing(false);
            setSelectedMetricIdsForReporting([]);
        } catch (error) {
            console.error('Failed to update metrics', error);
            toast.error('Failed to update metrics');
        }
    }, [
        isMetricsFormValid,
        metricCategoryMap,
        metrics,
        reportedMetrics,
        reportedMetricRows,
        selectedUseCaseId,
        unitOfMeasureMap,
        userEmail,
        isEditing,
    ]);

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            <div className="w-[95%] mx-auto space-y-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Use Case
                        </label>
                        {isUseCasesLoading ? (
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-9 w-64" />
                            </div>
                        ) : (
                            <div className="max-w-md">
                                <Select
                                    value={selectedUseCaseId}
                                    onValueChange={(value) => {
                                        setSelectedUseCaseId(value);
                                    }}
                                    disabled={isEditing}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="No use case selected" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {useCases.map((useCase) => (
                                            <SelectItem key={useCase.id} value={useCase.id}>
                                                {useCase.id} - {useCase.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-1.5 h-auto text-sm font-medium"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-1.5 h-auto text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleSubmit}
                                    disabled={!isMetricsFormValid}
                                >
                                    Apply Changes
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleStartEdit}
                                className="border-teal-600 text-teal-600 hover:bg-teal-50"
                                disabled={!selectedUseCaseId}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Metrics</h3>
                        {isEditing ? (
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
                            </div>
                        ) : null}
                    </div>

                    {selectedUseCaseId && metrics.length > 0 ? (
                        <div className="rounded-md border">
                            <div className="max-h-[250px] overflow-auto">
                                <Table className="table-fixed min-w-[1200px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead style={{ width: metricColumnSizes.primarySuccessValue }}>
                                                Primary Success Value
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.parcsCategory }}>
                                                PARCS Category
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.unitOfMeasurement }}>
                                                Unit of Measurement
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.baselineValue }}>
                                                Baseline Value
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.baselineDate }}>
                                                Baseline Date
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.targetValue }}>
                                                Target Value
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.targetDate }}>
                                                Target Date
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.actions }} />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {metrics.map((metric) => (
                                            <TableRow key={metric.id}>
                                                <TableCell style={{ width: metricColumnSizes.primarySuccessValue }}>
                                                    {isEditing ? (
                                                        <Input
                                                            type="text"
                                                            value={metric.primarySuccessValue ?? ''}
                                                            onChange={(e) =>
                                                                handleChangeMetric(
                                                                    metric.id,
                                                                    'primarySuccessValue',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="h-9"
                                                        />
                                                    ) : (
                                                        <span className="text-sm px-2 whitespace-normal break-words">
                                                            {metric.primarySuccessValue}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: metricColumnSizes.parcsCategory }}>
                                                    {isEditing ? (
                                                        <ParcsCategorySelect
                                                            value={metric.parcsCategory || ''}
                                                            onSelect={(val) =>
                                                                handleChangeMetric(metric.id, 'parcsCategory', val)
                                                            }
                                                            options={metricCategoryOptions}
                                                            className="metric-select"
                                                        />
                                                    ) : (
                                                        <span className="text-sm px-2 whitespace-normal break-words">
                                                            {metric.parcsCategory}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: metricColumnSizes.unitOfMeasurement }}>
                                                    {isEditing ? (
                                                        <UnitOfMeasurementSelect
                                                            value={metric.unitOfMeasurement || ''}
                                                            onSelect={(val) =>
                                                                handleChangeMetric(metric.id, 'unitOfMeasurement', val)
                                                            }
                                                            options={unitOfMeasureOptions}
                                                            className="metric-select"
                                                        />
                                                    ) : (
                                                        <span className="text-sm px-2 whitespace-normal break-words">
                                                            {metric.unitOfMeasurement}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: metricColumnSizes.baselineValue }}>
                                                    {isEditing ? (
                                                        <Input
                                                            type="number"
                                                            className="number-input-no-spinner h-9"
                                                            value={metric.baselineValue ?? ''}
                                                            onChange={(e) =>
                                                                handleChangeMetric(
                                                                    metric.id,
                                                                    'baselineValue',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-sm px-2 whitespace-normal break-words">
                                                            {metric.baselineValue}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: metricColumnSizes.baselineDate }}>
                                                    {isEditing ? (
                                                        <MetricDatePicker
                                                            value={metric.baselineDate || ''}
                                                            onChange={(date) =>
                                                                handleChangeMetric(metric.id, 'baselineDate', date)
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-sm px-2 whitespace-normal break-words">
                                                            {metric.baselineDate}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: metricColumnSizes.targetValue }}>
                                                    {isEditing ? (
                                                        <Input
                                                            type="number"
                                                            className="number-input-no-spinner h-9"
                                                            value={metric.targetValue ?? ''}
                                                            onChange={(e) =>
                                                                handleChangeMetric(
                                                                    metric.id,
                                                                    'targetValue',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-sm px-2 whitespace-normal break-words">
                                                            {metric.targetValue}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: metricColumnSizes.targetDate }}>
                                                    {isEditing ? (
                                                        <MetricDatePicker
                                                            value={metric.targetDate || ''}
                                                            onChange={(date) =>
                                                                handleChangeMetric(metric.id, 'targetDate', date)
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-sm px-2 whitespace-normal break-words">
                                                            {metric.targetDate}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: metricColumnSizes.actions }}>
                                                    {isEditing ? (
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
                                                    ) : null}
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
                                <EmptyTitle>{selectedUseCaseId ? 'No metrics added yet' : 'No use case selected'}</EmptyTitle>
                                <EmptyDescription>
                                    {selectedUseCaseId
                                        ? 'Start by adding a new metric to track your progress.'
                                        : 'Select a use case to view metrics.'}
                                </EmptyDescription>
                            </EmptyHeader>
                            {isEditing ? (
                                <EmptyContent>
                                    <Button onClick={handleAddMetric}>Add New Metric</Button>
                                </EmptyContent>
                            ) : null}
                        </Empty>
                    )}
                </div>

                <div className="p-6 bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Reported Metrics</h3>
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsMetricSelectDialogOpen(true)}
                                    disabled={reportableMetrics.length === 0}
                                    className="text-teal-600 border-teal-600 hover:bg-teal-50 h-8"
                                >
                                    Report Metric
                                </Button>
                            </div>
                        ) : null}
                    </div>

                    {selectedUseCaseId && shouldShowReportedTable ? (
                        <div className="rounded-md border">
                            <div className="max-h-[250px] overflow-auto">
                                <Table className="table-fixed min-w-[1200px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead style={{ width: metricColumnSizes.primarySuccessValue }}>
                                                Primary Success Value
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.baselineValue }}>
                                                Baseline Value
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.baselineDate }}>
                                                Baseline Date
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.targetValue }}>
                                                Target Value
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.targetDate }}>
                                                Target Date
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.reportedValue }}>
                                                Reported Value
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.reportedDate }}>
                                                Reported Date
                                            </TableHead>
                                            <TableHead style={{ width: metricColumnSizes.actions }} />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportedMetricsForDisplay.map((metric) => (
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
                                                <TableCell style={{ width: metricColumnSizes.reportedValue }}>
                                                    {isEditing ? (
                                                        <Input
                                                            type="number"
                                                            className="number-input-no-spinner h-9"
                                                            value={metric.reportedValue ?? ''}
                                                            onChange={(e) =>
                                                                handleChangeReportedMetric(
                                                                    metric.id,
                                                                    'reportedValue',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-sm px-2 whitespace-normal break-words">
                                                            {metric.reportedValue || '—'}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: metricColumnSizes.reportedDate }}>
                                                    {isEditing ? (
                                                        <MetricDatePicker
                                                            value={metric.reportedDate || ''}
                                                            onChange={(date) =>
                                                                handleChangeReportedMetric(metric.id, 'reportedDate', date)
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-sm px-2 whitespace-normal break-words">
                                                            {metric.reportedDate || '—'}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{ width: metricColumnSizes.actions }}>
                                                    {isEditing ? (
                                                        <div className="flex justify-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDeleteReportedMetric(metric.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : null}
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
                                <EmptyTitle>{selectedUseCaseId ? 'No reporting active' : 'No use case selected'}</EmptyTitle>
                                <EmptyDescription>
                                    {selectedUseCaseId
                                        ? 'Select a metric from the dropdown above and click \"Report Metric\" to start.'
                                        : 'Select a use case to view reported metrics.'}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}
                </div>
            </div>

            <Dialog open={isMetricSelectDialogOpen} onOpenChange={setIsMetricSelectDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Select Metric for Reporting</DialogTitle>
                        <DialogDescription>
                            Choose submitted metrics to report on from the available options.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-64 overflow-auto space-y-2 pr-2">
                        {reportableMetrics.map((metric) => {
                            const metricId = metric.id.toString();
                            const isSelected = selectedMetricIdsForReporting.includes(metricId);
                            return (
                                <Button
                                    key={metric.id}
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start h-auto p-3 text-left whitespace-normal break-words overflow-hidden hover:bg-transparent hover:text-foreground',
                                        isSelected && 'border-teal-600 text-teal-700'
                                    )}
                                    onClick={() => {
                                        setSelectedMetricIdsForReporting((prev) => {
                                            if (prev.includes(metricId)) {
                                                return prev.filter((id) => id !== metricId);
                                            }
                                            return [...prev, metricId];
                                        });
                                    }}
                                >
                                    <div className="flex flex-col items-start w-full">
                                        <span className="font-medium whitespace-normal break-words">
                                            {metric.primarySuccessValue}
                                        </span>
                                        {metric.parcsCategory && (
                                            <span className="text-sm text-muted-foreground whitespace-normal break-words">
                                                {metric.parcsCategory}
                                            </span>
                                        )}
                                    </div>
                                </Button>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMetricSelectDialogOpen(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MetricReporting;
