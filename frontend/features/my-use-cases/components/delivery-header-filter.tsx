"use client"

import * as React from "react"
import { Check, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Column } from "@tanstack/react-table"

interface DeliveryHeaderFilterProps<TData, TValue> {
    column: Column<TData, TValue>
}

export function DeliveryHeaderFilter<TData, TValue>({
    column,
}: DeliveryHeaderFilterProps<TData, TValue>) {
    const options = [
        { label: "FY25Q01", value: "FY25Q01" },
        { label: "FY25Q02", value: "FY25Q02" },
        { label: "FY25Q03", value: "FY25Q03" },
        { label: "FY25Q04", value: "FY25Q04" },
    ]
    const normalizeFilterValues = (value: unknown) => {
        if (Array.isArray(value)) return value.map((item) => String(item))
        if (value === null || value === undefined) return []
        return [String(value)]
    }
    const selectedValues = new Set(normalizeFilterValues(column.getFilterValue()))

    return (
        <div className="flex items-center justify-center w-full">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                        <span className="font-bold text-gray-900">Delivery</span>
                        {selectedValues.size > 0 && (
                            <div className="ml-2 rounded-sm bg-teal-100 px-1 text-[10px] font-medium text-teal-800">
                                {selectedValues.size}
                            </div>
                        )}
                        <PlusCircle className="ml-2 h-4 w-4 text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[120px] p-0"
                    align="end"
                    sideOffset={45}
                    alignOffset={-345}
                    avoidCollisions={false}
                >
                    <Command>
                        <CommandInput placeholder="Delivery" />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            {selectedValues.size > 0 && (
                                <>
                                    <CommandGroup>
                                        <CommandItem
                                            value="__clear__"
                                            onSelect={() => column.setFilterValue(undefined)}
                                            className="justify-center text-center"
                                        >
                                            Clear filters
                                        </CommandItem>
                                    </CommandGroup>
                                    <CommandSeparator />
                                </>
                            )}
                            <CommandGroup>
                                {options.map((option) => {
                                    const isSelected = selectedValues.has(option.value)
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            onSelect={() => {
                                                const nextValues = new Set(normalizeFilterValues(column.getFilterValue()))
                                                if (isSelected) {
                                                    nextValues.delete(option.value)
                                                } else {
                                                    nextValues.add(option.value)
                                                }
                                                const updatedValues = Array.from(nextValues)
                                                column.setFilterValue(updatedValues.length ? updatedValues : undefined)
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            <span>{option.label}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
