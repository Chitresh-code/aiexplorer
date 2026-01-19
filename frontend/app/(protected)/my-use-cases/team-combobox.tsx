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

interface MyUseCasesTeamComboboxProps {
    value?: string[]
    onChange: (value: string[]) => void
    options: { label: string; value: string }[]
    className?: string
}

export function MyUseCasesTeamCombobox({
    value = [],
    onChange,
    options,
    className,
}: MyUseCasesTeamComboboxProps) {
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
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {value.map((val) => {
                        const opt = options.find((o) => o.value === val)
                        return (
                            <Badge key={val} variant="secondary" className="flex items-center gap-1">
                                <span>{opt?.label ?? val}</span>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        removeValue(val)
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
                        className={cn(
                            "w-full justify-between h-8 px-3 border-dashed bg-white",
                            !value.length && "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <PlusCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">
                                {value.length ? `${value.length} selected` : "Team Name"}
                            </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    side="bottom"
                    align="start"
                    alignOffset={255}
                    sideOffset={30}
                    avoidCollisions={false}
                    collisionPadding={0}
                    className={cn(
                        "p-0 border shadow-lg w-[330] max-w-none"
                    )}
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
