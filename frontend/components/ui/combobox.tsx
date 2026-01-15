"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
    PopoverAnchor,
} from "@/components/ui/popover"

interface ComboboxProps {
    value?: string
    onChange: (value: string) => void
    options: { label: string; value: string }[]
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    align?: "start" | "center" | "end"
    icon?: React.ReactNode
}

export function Combobox({
    value,
    onChange,
    options,
    placeholder = "Select option",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    disabled = false,
    className,
    align = "start",
    icon,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <div className={cn(className?.includes("w-") ? "w-fit" : "w-full")}>
            <Popover open={open} onOpenChange={setOpen} modal={false}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between h-10 px-3",
                            !value && "text-muted-foreground",
                            className
                        )}
                        disabled={disabled}
                    >
                        <div className="flex items-center gap-2 truncate">
                            {icon}
                            <span className="truncate">
                                {value
                                    ? options.find((o) => o.value === value)?.label
                                    : placeholder}
                            </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    side="bottom"
                    align="start"
                    alignOffset={50}
                    sideOffset={29}
                    className="p-0 border shadow-lg w-[280px]"
                >
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList className="max-h-40 overflow-y-auto">
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => {
                                            onChange(option.value)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
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
        </div >
    )
}
