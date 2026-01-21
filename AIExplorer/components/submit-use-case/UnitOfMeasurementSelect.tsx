
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface UnitOfMeasurementSelectProps {
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    width?: string;
    className?: string;
    sideOffset?: number;
    alignOffset?: number;
    align?: "start" | "center" | "end";
}

const options = [
    'HoursPerDay',
    'HoursPerMonth',
    'HoursPerYear',
    'HoursPerCase',
    'HoursPerTransaction',
    'USDPerMonth',
    'USDPerYear',
    'USD',
    'Users',
    'Audited Risks'
];

export function UnitOfMeasurementSelect({
    value,
    onSelect,
    sideOffset = 4,
    alignOffset = 0,
    placeholder = "Select",
    width = "w-[180px]",
    className,
    align = "start"
}: UnitOfMeasurementSelectProps) {
    const handleValueChange = (newValue: string) => {
        onSelect(newValue === " " ? "" : newValue);
    };

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
