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
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Column, Table } from "@tanstack/react-table"

interface IdHeaderFilterProps<TData, TValue> {
    column: Column<TData, TValue>
    table: Table<TData>
}

export function IdHeaderFilter<TData, TValue>({
    column,
    table,
}: IdHeaderFilterProps<TData, TValue>) {
    // Get unique IDs from the column
    const sortedUniqueValues = React.useMemo(
        () => {
            const values = new Set<string>()
            column.getFacetedUniqueValues?.()?.forEach((_, value) => {
                if (value !== null && value !== undefined) {
                    values.add(String(value))
                }
            })

            if (values.size === 0) {
                table.getCoreRowModel().flatRows.forEach((row: any) => {
                    const value = row.getValue(column.id)
                    if (value !== null && value !== undefined) {
                        values.add(String(value))
                    }
                })
            }

            return Array.from(values).sort()
        },
        [column, table]
    )

    // Use local state to track selections and force re-renders
    const [selectedValues, setSelectedValues] = React.useState<Set<string>>(new Set())

    // Sync with column filter value
    React.useEffect(() => {
        const filterValue = column.getFilterValue() as string[] | undefined
        setSelectedValues(new Set(filterValue ?? []))
    }, [column.getFilterValue()])

    const handleSelect = (value: string) => {
        const newSelectedValues = new Set(selectedValues)
        if (newSelectedValues.has(value)) {
            newSelectedValues.delete(value)
        } else {
            newSelectedValues.add(value)
        }
        setSelectedValues(newSelectedValues)
        const filterValues = Array.from(newSelectedValues)
        column.setFilterValue(filterValues.length ? filterValues : undefined)
    }

    const handleClear = () => {
        setSelectedValues(new Set())
        column.setFilterValue(undefined)
    }

    return (
        <div className="flex items-center justify-center w-full">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                        <span className="font-bold text-gray-900">ID</span>
                        {selectedValues.size > 0 && (
                            <div className="ml-2 rounded-sm bg-teal-100 px-1 text-[10px] font-medium text-teal-800">
                                {selectedValues.size}
                            </div>
                        )}
                        <PlusCircle className="ml-2 h-4 w-4 text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[90px] p-0"
                    align="start"
                    sideOffset={100}
                    alignOffset={75}
                >
                    <Command>
                        <CommandInput placeholder="ID" />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            {selectedValues.size > 0 && (
                                <>
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={handleClear}
                                            className="justify-center text-center cursor-pointer"
                                        >
                                            Clear filters
                                        </CommandItem>
                                    </CommandGroup>
                                    <div className="h-px bg-border" />
                                </>
                            )}
                            <CommandGroup>
                                {sortedUniqueValues.map((value) => {
                                    const isSelected = selectedValues.has(value)
                                    return (
                                        <CommandItem
                                            key={value}
                                            onSelect={() => handleSelect(value)}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className="h-4 w-4" />
                                            </div>
                                            <span>{value}</span>
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
