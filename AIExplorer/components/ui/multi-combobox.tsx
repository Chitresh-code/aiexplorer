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

interface MultiComboboxProps {
    value?: string[]
    onChange: (value: string[]) => void
    options: { label: string; value: string }[]
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    align?: "start" | "center" | "end"
    icon?: React.ReactNode
    hideBadges?: boolean
    contentClassName?: string
    listClassName?: string
    badgeClassName?: string
    sideOffset?: number
    alignOffset?: number
    container?: Element | null
    containerRef?: React.RefObject<Element | null>
}

export function MultiCombobox({
    value = [],
    onChange,
    options,
    placeholder = "Select options",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    disabled = false,
    className,
    align = "start",
    icon,
    hideBadges = false,
    contentClassName,
    listClassName,
    badgeClassName,
    sideOffset = 4,
    alignOffset = 0,
    container,
    containerRef,
}: MultiComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const popoverContainer = container ?? containerRef?.current ?? undefined

    const toggle = (val: string) => {
        onChange(
            value.includes(val)
                ? value.filter((v) => v !== val)
                : [...value, val]
        )
    }

    return (
        <div className={cn("flex flex-col gap-2", className?.includes("w-") ? "w-fit" : "w-full")}>
            {!hideBadges && value.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {value.map((val) => {
                        const opt = options.find((o) => o.value === val)
                        return (
                            <Badge
                                key={val}
                                variant="secondary"
                                className={cn("flex items-center gap-1", badgeClassName)}
                            >
                                <span>{opt?.label ?? val}</span>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        onChange(value.filter((v) => v !== val))
                                    }}
                                    className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                                    aria-label={`Remove ${opt?.label ?? val}`}
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
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between h-10 px-3",
                            !value.length && "text-muted-foreground",
                            className
                        )}
                        disabled={disabled}
                    >
                        <div className="flex items-center gap-2 truncate">
                            {icon}
                            <span className="truncate">
                                {value.length ? `${value.length} selected` : placeholder}
                            </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    side="bottom"
                    align={align}
                    alignOffset={alignOffset}
                    sideOffset={sideOffset}
                    avoidCollisions
                    className={cn(
                        "p-0 border shadow-lg w-[var(--radix-popper-anchor-width)] min-w-[220px]",
                        contentClassName
                    )}
                    container={popoverContainer}
                >
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList className={cn("max-h-40 overflow-y-auto", listClassName)}>
                            <CommandEmpty>{emptyText}</CommandEmpty>
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
