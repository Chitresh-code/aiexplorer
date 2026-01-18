
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MetricsSelectProps {
    value: string;
    options: string[];
    onSelect: (value: string) => void;
    placeholder?: string;
    width?: string;
    className?: string;
    sideOffset?: number;
    alignOffset?: number;
    align?: "start" | "center" | "end";
}

export function MetricsSelect({
    value,
    options,
    onSelect,
    sideOffset = 50,
    alignOffset = 200,
    placeholder = "Select",
    width = "w-[140px]",
    className,
    align = "start"
}: MetricsSelectProps) {
    const handleValueChange = (newValue: string) => {
        // Map the space back to empty string if selected
        onSelect(newValue === " " ? "" : newValue);
    };

    // Map empty value to space for the Select component state
    // Radix Select requires a valid value that matches one of the items if controlled
    const displayValue = value === "" ? " " : value;

    return (
        <Select value={displayValue} onValueChange={handleValueChange}>
            <SelectTrigger
                className={cn("w-full h-9 px-2 text-xs", className)}
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
