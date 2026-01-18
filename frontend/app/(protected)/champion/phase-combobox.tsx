"use client"

import { PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Combobox } from "@/components/ui/combobox"

interface ChampionPhaseComboboxProps {
    value?: string
    onChange: (value: string) => void
    options: { label: string; value: string }[]
    className?: string
}

export function ChampionPhaseCombobox({
    value,
    onChange,
    options,
    className,
}: ChampionPhaseComboboxProps) {
    return (
        <Combobox
            options={options}
            value={value}
            onChange={onChange}
            placeholder="Phase"
            className={cn("h-8 w-full gap-2 border-dashed bg-white px-3", className)}
            icon={<PlusCircle className="h-4 w-3 text-muted-foreground" />}
            sideOffset={50}
            alignOffset={-190}
            contentClassName="w-[220px] min-w-[300px] max-w-[220px]"
            listClassName="max-h-none overflow-visible"
        />
    )
}
