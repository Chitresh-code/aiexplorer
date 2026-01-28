"use client"

import * as React from "react"
import { Check, PlusCircle } from "lucide-react"
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

interface IdHeaderFilterProps<TData, TValue> {
    column: Column<TData, TValue>
    options?: { label: string; value: string }[]
}

export function IdHeaderFilter<TData, TValue>({
    column,
    options,
}: IdHeaderFilterProps<TData, TValue>) {
    const resolvedOptions = options?.length ? options : []

    const [selectedValues, setSelectedValues] = React.useState<Set<string>>(new Set())

    React.useEffect(() => {
        const filterValue = column.getFilterValue() as string[] | undefined
        setSelectedValues(new Set(filterValue ?? []))
    }, [column.getFilterValue()])

    const handleSelect = (value: string) => {
        const next = new Set(selectedValues)
        if (next.has(value)) {
            next.delete(value)
        } else {
            next.add(value)
        }
        setSelectedValues(next)
        const filterValues = Array.from(next)
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
                    <Button variant="ghost" size="sm" className="h-8 data-[state=open]:bg-accent">
                        <span className="font-bold text-gray-900">ID</span>
                        <PlusCircle className="ml-2 h-4 w-4 text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[120px] p-0" align="start" sideOffset={8}>
                    <Command>
                        <CommandInput placeholder="ID" />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            {selectedValues.size > 0 ? (
                                <>
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={handleClear}
                                            className="justify-center text-center cursor-pointer"
                                        >
                                            Clear filters
                                        </CommandItem>
                                    </CommandGroup>
                                    <CommandSeparator />
                                </>
                            ) : null}
                            <CommandGroup>
                                {resolvedOptions.length === 0 ? (
                                    <CommandItem disabled className="text-muted-foreground">
                                        No IDs
                                    </CommandItem>
                                ) : (
                                    resolvedOptions.map((option) => {
                                        const isSelected = selectedValues.has(option.value)
                                        return (
                                            <CommandItem
                                                key={option.value}
                                                value={option.value}
                                                onSelect={() => handleSelect(option.value)}
                                            >
                                                <span className="flex-1">{option.label}</span>
                                                {isSelected ? <Check className="h-4 w-4 text-teal-600" /> : null}
                                            </CommandItem>
                                        )
                                    })
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
