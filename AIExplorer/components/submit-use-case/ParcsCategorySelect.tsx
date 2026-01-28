
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ParcsCategorySelectProps {
    value: string;
    onSelect: (value: string) => void;
    options: string[];
    dataField?: string;
    placeholder?: string;
    width?: string;
    className?: string;
    sideOffset?: number;
    alignOffset?: number;
    align?: "start" | "center" | "end";
}

export function ParcsCategorySelect({
    value,
    onSelect,
    options = [],
    dataField,
    sideOffset = 4,
    alignOffset = 0,
    placeholder = "Select",
    width = "w-[var(--radix-select-trigger-width)]",
    className,
    align = "start"
}: ParcsCategorySelectProps) {
    const handleValueChange = (newValue: string) => {
        onSelect(newValue === " " ? "" : newValue);
    };

    const displayValue = value === "" ? " " : value;

    return (
        <Select value={displayValue} onValueChange={handleValueChange}>
            <SelectTrigger
                className={cn("w-full h-9 px-2 text-xs", className)}
                data-metric-field={dataField}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className={width} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
                <SelectItem value=" " className="text-muted-foreground">{placeholder}</SelectItem>
                {options.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
