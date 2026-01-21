"use client";

import { Combobox } from "@/components/ui/combobox";

const priorityOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
];

const menuClassName =
    "w-[calc(var(--radix-popper-anchor-width)-8px)] min-w-[200px]";

type PriorityComboboxProps = {
    value?: string;
    onChange: (value: string) => void;
};

export function PriorityCombobox({ value, onChange }: PriorityComboboxProps) {
    return (
        <Combobox
            value={value}
            onChange={onChange}
            options={priorityOptions}
            placeholder="Select priority level"
            searchPlaceholder="Search priority..."
            className="w-full"
            align="end"
            alignOffset={130}
            sideOffset={70}
            contentClassName={menuClassName}
        />
    );
}
