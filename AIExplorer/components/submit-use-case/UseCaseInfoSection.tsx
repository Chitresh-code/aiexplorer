// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { Textarea } from "@/components/ui/textarea";

type Option = {
    value: string;
    label: string;
};

type UseCaseInfoSectionProps = {
    form: any;
    aiThemes: Option[];
    personas: Option[];
    vendors: Option[];
    models: Option[];
    businessUnits: Option[];
    teams: Option[];
    subTeams: Option[];
    selectedVendor: string;
    selectedBusinessUnit: string;
    selectedTeam: string;
    aiCardRef: React.RefObject<HTMLDivElement>;
};

export const UseCaseInfoSection = ({
    form,
    aiThemes,
    personas,
    vendors,
    models,
    businessUnits,
    teams,
    subTeams,
    selectedVendor,
    selectedBusinessUnit,
    selectedTeam,
    aiCardRef,
}: UseCaseInfoSectionProps) => (
    <div className="space-y-6">
        <Card className="shadow-sm">
            <CardHeader className="border-b">
                <CardTitle>Use Case</CardTitle>
                <CardDescription>Basic information about your use case</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <FormField
                    control={form.control}
                    name="useCaseTitle"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Use Case Title</FieldLabel>
                            <FieldContent>
                                <Input placeholder="Use Case Title" {...field} className="form-input" />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />

                <FormField
                    control={form.control}
                    name="headline"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Headline</FieldLabel>
                            <FieldContent>
                                <Input placeholder="One Line Executive Headline" {...field} className="form-input" />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />

                <FormField
                    control={form.control}
                    name="opportunity"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Opportunity</FieldLabel>
                            <FieldContent>
                                <Textarea rows={3} placeholder="What is AI being used for?" {...field} className="form-textarea" />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />

                <FormField
                    control={form.control}
                    name="evidence"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Evidence</FieldLabel>
                            <FieldContent>
                                <Textarea rows={3} placeholder="Why it is needed?" {...field} className="form-textarea" />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />

                <FormField
                    control={form.control}
                    name="businessValue"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Business Value</FieldLabel>
                            <FieldContent>
                                <Textarea rows={3} placeholder="What are the anticipated benefits to UKG?" {...field} className="form-textarea" />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />

                <FormField
                    control={form.control}
                    name="infoLink"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Info Link</FieldLabel>
                            <FieldContent>
                                <Input placeholder="Additional Info Link about Use Case" {...field} className="form-input" />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />
            </CardContent>
        </Card>

        <Card ref={aiCardRef} className="shadow-sm">
            <CardHeader className="border-b">
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>Select AI themes, personas, vendor and model</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="selectedAITheme"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>AI Theme</FieldLabel>
                                <FieldContent>
                                    <MultiCombobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={aiThemes}
                                        placeholder="Select AI Themes"
                                        searchPlaceholder="Search themes..."
                                        container={aiCardRef.current}
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </FieldContent>
                            </Field>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="selectedPersona"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Target Personas</FieldLabel>
                                <FieldContent>
                                    <MultiCombobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={personas}
                                        placeholder="Select Target Personas"
                                        searchPlaceholder="Search personas..."
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </FieldContent>
                            </Field>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="selectedVendor"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Vendor Name</FieldLabel>
                                <FieldContent>
                                    <Combobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={vendors}
                                        placeholder="No Vendor Identified"
                                        searchPlaceholder="Search vendors..."
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </FieldContent>
                            </Field>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="selectedModel"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Model Name</FieldLabel>
                                <FieldContent>
                                    <Combobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={models}
                                        disabled={!selectedVendor || models.length === 0}
                                        placeholder="No Model Identified"
                                        searchPlaceholder="Search models..."
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </FieldContent>
                            </Field>
                        )}
                    />
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-sm">
            <CardHeader className="border-b">
                <CardTitle>Team Information</CardTitle>
                <CardDescription>Business unit, team details and resources</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="selectedBusinessUnit"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Business Unit</FieldLabel>
                                <FieldContent>
                                    <Combobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={businessUnits}
                                        placeholder="Select a Business Unit"
                                        searchPlaceholder="Search business units..."
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </FieldContent>
                            </Field>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="selectedTeam"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Team Name</FieldLabel>
                                <FieldContent>
                                    <Combobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={teams}
                                        disabled={!selectedBusinessUnit}
                                        placeholder="Select Team Name"
                                        searchPlaceholder="Search teams..."
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </FieldContent>
                            </Field>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="selectedSubTeam"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Sub Team Name</FieldLabel>
                                <FieldContent>
                                    <Combobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={subTeams}
                                        disabled={!selectedTeam}
                                        placeholder="Select Sub Team Name"
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </FieldContent>
                            </Field>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="eseResourceValue"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>ESE Resources Needed</FieldLabel>
                                <FieldContent>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between form-select min-w-0 h-auto py-1.5"
                                            >
                                                <span className="truncate mr-2">
                                                    {field.value || "No"}
                                                </span>
                                                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-full p-0" sideOffset={144}>
                                            <DropdownMenuItem onSelect={() => field.onChange("No")}>No</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => field.onChange("Yes")}>Yes</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <FieldError errors={[fieldState.error]} />
                                </FieldContent>
                            </Field>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    </div>
);
