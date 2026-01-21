"use client";

import { Combobox } from "@/components/ui/combobox";

const reportingFrequencyOptions = [
    { value: "Once in two week", label: "Once in two week" },
    { value: "Weekly", label: "Weekly" },
    { value: "Bi-weekly", label: "Bi-weekly" },
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
];

const menuClassName =
    "w-[calc(var(--radix-popper-anchor-width)-8px)] min-w-[200px]";

type ReportingFrequencyComboboxProps = {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

export function ReportingFrequencyCombobox({
    value,
    onChange,
    disabled,
}: ReportingFrequencyComboboxProps) {
    return (
        <Combobox
            value={value}
            onChange={onChange}
            options={reportingFrequencyOptions}
            placeholder="Select frequency"
            searchPlaceholder="Search frequency..."
            className="w-[220px] ml-auto"
            align="end"
            alignOffset={0}
            sideOffset={6}
            contentClassName={menuClassName}
            disabled={disabled}
        />
    );
}
