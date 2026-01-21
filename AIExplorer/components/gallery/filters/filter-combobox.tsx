"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
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

type Option = { label: string; value: string }

type BaseProps = {
    options: Option[]
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    contentClassName?: string
    align?: "start" | "center" | "end"
    icon?: React.ReactNode
    showBadges?: boolean
    sideOffset?: number
    alignOffset?: number
}

type SingleProps = BaseProps & {
    multiple?: false
    value?: string
    onChange: (value: string) => void
}

type MultiProps = BaseProps & {
    multiple: true
    value?: string[]
    onChange: (value: string[]) => void
}

export type FilterComboboxProps = SingleProps | MultiProps

export function FilterCombobox({
    value,
    onChange,
    options,
    placeholder = "Select options",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    disabled = false,
    className,
    contentClassName,
    align = "start",
    icon,
    showBadges = true,
    sideOffset = 6,
    alignOffset = 0,
    multiple = false,
}: FilterComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const selectedValues = multiple
        ? (value ?? [])
        : value
            ? [value]
            : []

    const handleToggle = (val: string) => {
        if (multiple) {
            const current = Array.isArray(value) ? value : []
            const next = current.includes(val)
                ? current.filter((entry) => entry !== val)
                : [...current, val]
            onChange(next)
            return
        }

        const current = typeof value === "string" ? value : ""
        onChange(current === val ? "" : val)
        setOpen(false)
    }

    const handleRemove = (val: string) => {
        if (multiple) {
            const current = Array.isArray(value) ? value : []
            onChange(current.filter((entry) => entry !== val))
            return
        }
        onChange("")
    }

    const selectedLabel = options.find((option) => option.value === selectedValues[0])?.label
    const buttonLabel = multiple
        ? selectedValues.length
            ? `${selectedValues.length} selected`
            : placeholder
        : selectedLabel ?? placeholder

    return (
        <div className={cn("flex flex-col gap-2", className?.includes("w-") ? "w-fit" : "w-full")}>
            {showBadges && selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedValues.map((val) => {
                        const opt = options.find((option) => option.value === val)
                        return (
                            <Badge key={val} variant="secondary" className="flex items-center gap-1 pr-1">
                                {opt?.label ?? val}
                                <button
                                    type="button"
                                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        handleRemove(val)
                                    }}
                                    aria-label={`Remove ${opt?.label ?? "selection"}`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )
                    })}
                </div>
            )}

            <Popover open={open} onOpenChange={setOpen} modal={false}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between",
                            !selectedValues.length && "text-muted-foreground",
                            className
                        )}
                        disabled={disabled}
                    >
                        <div className="flex items-center gap-2 truncate">
                            {icon}
                            <span className="truncate">{buttonLabel}</span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    side="bottom"
                    align={align}
                    alignOffset={alignOffset}
                    sideOffset={sideOffset}
                    className={cn(
                        "p-0 border shadow-lg w-[var(--radix-popper-anchor-width)] min-w-[220px]",
                        contentClassName
                    )}
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
                                        onSelect={() => handleToggle(option.value)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedValues.includes(option.value)
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
