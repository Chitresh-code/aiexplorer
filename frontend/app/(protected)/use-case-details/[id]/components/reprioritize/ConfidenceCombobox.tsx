"use client";

import { Combobox } from "@/components/ui/combobox";

const confidenceOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
];

const menuClassName =
    "w-[calc(var(--radix-popper-anchor-width)-8px)] min-w-[200px]";

type ConfidenceComboboxProps = {
    value?: string;
    onChange: (value: string) => void;
};

export function ConfidenceCombobox({ value, onChange }: ConfidenceComboboxProps) {
    return (
        <Combobox
            value={value}
            onChange={onChange}
            options={confidenceOptions}
            placeholder="Select confidence level"
            searchPlaceholder="Search confidence..."
            className="w-full"
            align="start"
            alignOffset={100}
            sideOffset={80}
            contentClassName={menuClassName}
        />
    );
}
