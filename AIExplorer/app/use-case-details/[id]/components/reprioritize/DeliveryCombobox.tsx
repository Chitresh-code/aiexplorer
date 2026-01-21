"use client";

import { Combobox } from "@/components/ui/combobox";

const deliveryOptions = [
    { value: "FY25Q01", label: "FY25Q01" },
    { value: "FY25Q02", label: "FY25Q02" },
    { value: "FY25Q03", label: "FY25Q03" },
    { value: "FY25Q04", label: "FY25Q04" },
    { value: "FY26Q01", label: "FY26Q01" },
    { value: "FY26Q02", label: "FY26Q02" },
    { value: "FY26Q03", label: "FY26Q03" },
    { value: "FY26Q04", label: "FY26Q04" },
];

const menuClassName =
    "w-[calc(var(--radix-popper-anchor-width)-24px)] min-w-[200px] max-w-[240px]";

type DeliveryComboboxProps = {
    value?: string;
    onChange: (value: string) => void;
};

export function DeliveryCombobox({ value, onChange }: DeliveryComboboxProps) {
    return (
        <Combobox
            value={value}
            onChange={onChange}
            options={deliveryOptions}
            placeholder="Select delivery quarter"
            searchPlaceholder="Search delivery quarter..."
            className="w-full"
            align="start"
            alignOffset={100}
            sideOffset={90}
            contentClassName={menuClassName}
        />
    );
}
