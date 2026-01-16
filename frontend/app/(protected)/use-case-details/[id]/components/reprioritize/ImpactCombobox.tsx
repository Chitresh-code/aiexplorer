"use client";

import { Combobox } from "@/components/ui/combobox";

const impactOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Very High", label: "Very High" },
];

const menuClassName =
    "w-[calc(var(--radix-popper-anchor-width)-8px)] min-w-[200px]";

type ImpactComboboxProps = {
    value?: string;
    onChange: (value: string) => void;
};

export function ImpactCombobox({ value, onChange }: ImpactComboboxProps) {
    return (
        <Combobox
            value={value}
            onChange={onChange}
            options={impactOptions}
            placeholder="Select impact level"
            searchPlaceholder="Search impact..."
            className="w-full"
            align="end"
            alignOffset={130}
            sideOffset={60}
            contentClassName={menuClassName}
        />
    );
}
