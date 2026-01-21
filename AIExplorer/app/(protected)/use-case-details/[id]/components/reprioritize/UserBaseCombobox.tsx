"use client";

import { Combobox } from "@/components/ui/combobox";

const userBaseOptions = [
    { value: "0-100", label: "0-100" },
    { value: "100-500", label: "100-500" },
    { value: "500-1000", label: "500-1000" },
    { value: "1000-5000", label: "1000-5000" },
    { value: "5000+", label: "5000+" },
];

const menuClassName =
    "w-[calc(var(--radix-popper-anchor-width)-24px)] min-w-[200px] max-w-[240px]";

type UserBaseComboboxProps = {
    value?: string;
    onChange: (value: string) => void;
};

export function UserBaseCombobox({ value, onChange }: UserBaseComboboxProps) {
    return (
        <Combobox
            value={value}
            onChange={onChange}
            options={userBaseOptions}
            placeholder="Select user base range"
            searchPlaceholder="Search user base..."
            className="w-full"
            align="end"
            alignOffset={130}
            sideOffset={90}
            contentClassName={menuClassName}
        />
    );
}
