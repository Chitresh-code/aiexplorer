"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface GallerySubTeamComboboxProps {
    value?: string[]
    onChange: (value: string[]) => void
    options: { label: string; value: string }[]
    className?: string
    sideOffset?: number
    alignOffset?: number
}

export function GallerySubTeamCombobox({
    value = [],
    onChange,
    options,
    className,
    sideOffset = 100,
    alignOffset = 0,
}: GallerySubTeamComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const toggle = (val: string) => {
        onChange(
            value.includes(val)
                ? value.filter((v) => v !== val)
                : [...value, val]
        )
    }

    const removeValue = (val: string) => {
        onChange(value.filter((v) => v !== val))
    }

    return (
        <div className={cn("flex flex-col gap-2 w-full")}>
            <Popover open={open} onOpenChange={setOpen} modal={false}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between h-8 px-3 border-dashed bg-white",
                            !value.length && "text-muted-foreground",
                            className
                        )}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <PlusCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">
                                {value.length ? `${value.length} selected` : "Sub-team Name"}
                            </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    side="bottom"
                    align="start"
                    sideOffset={sideOffset}
                    alignOffset={alignOffset}
                    className="p-0 border shadow-lg w-[355]"
                >
                    <Command>
                        <CommandInput placeholder="Search..." />
                        <CommandList className="max-h-40 overflow-y-auto">
                            <CommandEmpty>No option found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => toggle(option.value)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value.includes(option.value)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
