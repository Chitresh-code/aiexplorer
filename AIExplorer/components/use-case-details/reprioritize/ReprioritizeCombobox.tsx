"use client";

import { Combobox } from "@/components/ui/combobox";

type ReprioritizeComboboxOption = {
  value: string;
  label: string;
};

type ReprioritizeComboboxProps = {
  value?: string;
  onChange: (value: string) => void;
  options: ReprioritizeComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  className?: string;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  sideOffset?: number;
  contentClassName?: string;
  disabled?: boolean;
};

export const ReprioritizeCombobox = ({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  className,
  align = "end",
  alignOffset = 130,
  sideOffset = 60,
  contentClassName = "w-[calc(var(--radix-popper-anchor-width)-8px)] min-w-[200px]",
  disabled,
}: ReprioritizeComboboxProps) => {
  return (
    <Combobox
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      className={className ?? "w-full"}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      contentClassName={contentClassName}
      disabled={disabled}
    />
  );
};
