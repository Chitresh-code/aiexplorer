// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiCombobox } from "@/components/ui/multi-combobox";

type ChecklistQuestion = {
    id: number | string;
    question: string;
    kind: "yesno" | "choice";
    options: { value: string; label: string }[];
    isMulti: boolean;
};

type ChecklistSectionProps = {
    form: any;
    questions: ChecklistQuestion[];
    selectedModel?: string;
    containerRef?: React.RefObject<HTMLDivElement>;
};

const yesNoOptions = ["Yes", "No"];

export const ChecklistSection = ({
    form,
    questions,
    selectedModel,
    containerRef,
}: ChecklistSectionProps) => (
    <div className="space-y-6 animate-in fade-in duration-500 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="p-6 rounded-lg border border-dashed">
            <div className="flex items-center gap-3 mb-6 bg-background/80 backdrop-blur-sm py-2">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">AI Product Checklist</h3>
                    <p className="text-sm text-muted-foreground">
                        Please provide accurate responses for your {selectedModel || "AI product"} implementation.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {questions.length === 0 ? (
                    <div className="rounded-md border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
                        Checklist questions are not available yet.
                    </div>
                ) : (
                    questions.map((question, index) => (
                        <div key={`${question.id}-${index}`} className="flex flex-col gap-2 p-4 bg-card rounded-md">
                            <span className="text-sm font-medium">
                                {index + 1}. {question.question}
                            </span>
                            <FormField
                                control={form.control}
                                name={`checklistResponses.${question.id}`}
                                render={({ field }) => {
                                    if (question.kind === "yesno") {
                                        return (
                                            <div className="flex flex-col gap-2 ml-4">
                                                {yesNoOptions.map((option) => (
                                                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                        <div
                                                            className={cn(
                                                                "h-4 w-4 rounded-full border border-primary flex items-center justify-center transition-all",
                                                                field.value === option
                                                                    ? "bg-primary"
                                                                    : "bg-transparent group-hover:border-primary/50",
                                                            )}
                                                        >
                                                            {field.value === option && (
                                                                <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                                                            )}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            className="hidden"
                                                            checked={field.value === option}
                                                            onChange={() => field.onChange(option)}
                                                        />
                                                        <span className="text-sm">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        );
                                    }

                                    if (question.kind === "choice") {
                                        if (!question.options.length) {
                                            return (
                                                <div className="max-w-72 ml-4">
                                                    <Input
                                                        value={field.value || ""}
                                                        onChange={field.onChange}
                                                        placeholder="Enter response"
                                                    />
                                                </div>
                                            );
                                        }

                                        if (question.isMulti) {
                                            return (
                                                <div className="max-w-72 ml-4">
                                                    <MultiCombobox
                                                        value={Array.isArray(field.value) ? field.value : []}
                                                        onChange={field.onChange}
                                                        options={question.options}
                                                        placeholder="Select options"
                                                        align="end"
                                                        containerRef={containerRef}
                                                    />
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="max-w-72 ml-4">
                                                <Combobox
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={question.options}
                                                    placeholder="Select option"
                                                    align="end"
                                                    contentClassName="translate-x-4"
                                                    containerRef={containerRef}
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="max-w-72 ml-4">
                                            <Input
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                placeholder="Enter response"
                                            />
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);
