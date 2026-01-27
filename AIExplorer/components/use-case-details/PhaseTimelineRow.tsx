"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

type PhaseTimelineRowProps = {
  phaseName: string;
  start?: Date;
  end?: Date;
  onOpen?: () => void;
  isEditable?: boolean;
};

export const PhaseTimelineRow = ({
  phaseName,
  start,
  end,
  onOpen,
  isEditable = false,
}: PhaseTimelineRowProps) => {
  const formatDate = (value?: Date) =>
    value ? format(value, "dd-MM-yyyy") : "";

  return (
    <div className="grid grid-cols-[140px_1fr_1fr] gap-2 items-center p-4 bg-gray-50/50 rounded-lg border border-gray-100">
      <div className="font-medium text-gray-900 text-sm">{phaseName}</div>
      <Button
        variant="outline"
        className="h-9 w-full justify-start text-left font-normal text-sm px-3"
        onClick={onOpen}
        disabled={!isEditable}
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">{start ? formatDate(start) : "Pick start date"}</span>
      </Button>
      <Button
        variant="outline"
        className="h-9 w-full justify-start text-left font-normal text-sm px-3"
        onClick={onOpen}
        disabled={!isEditable}
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">{end ? formatDate(end) : "Pick end date"}</span>
      </Button>
    </div>
  );
};
