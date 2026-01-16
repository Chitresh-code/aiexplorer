"use client";

import { Combobox } from "@/components/ui/combobox";

const effortOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
];

const menuClassName =
    "w-[calc(var(--radix-popper-anchor-width)-8px)] min-w-[200px]";

type EffortComboboxProps = {
    value?: string;
    onChange: (value: string) => void;
};

export function EffortCombobox({ value, onChange }: EffortComboboxProps) {
    return (
        <Combobox
            value={value}
            onChange={onChange}
            options={effortOptions}
            placeholder="Select effort level"
            searchPlaceholder="Search effort..."
            className="w-full"
            align="end"
            alignOffset={130}
            sideOffset={80}
            contentClassName={menuClassName}
        />
    );
}
