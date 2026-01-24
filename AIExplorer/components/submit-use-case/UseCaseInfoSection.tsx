// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { Check, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Option = {
    value: string;
    label: string;
};

type UseCaseInfoSectionProps = {
    form: unknown;
    businessUnits: Option[];
    teams: Option[];
    subTeams: Option[];
    selectedBusinessUnit: string;
    selectedTeam: string;
    isMappingsLoading: boolean;
    aiStatus: "idle" | "loading";
    aiGeneratedFields: Record<string, boolean>;
    aiSuggestions: Record<string, string>;
    onGenerateAi: () => void;
    onAcceptSuggestion: (field: string) => void;
    onRejectSuggestion: (field: string) => void;
};

export const UseCaseInfoSection = ({
    form,
    businessUnits,
    teams,
    subTeams,
    selectedBusinessUnit,
    selectedTeam,
    isMappingsLoading,
    aiStatus,
    aiGeneratedFields,
    aiSuggestions,
    onGenerateAi,
    onAcceptSuggestion,
    onRejectSuggestion,
}: UseCaseInfoSectionProps) => (
    <div className="space-y-6">
        <Card className="shadow-sm">
            <CardHeader className="border-b space-y-0">
                <div className="space-y-1">
                    <CardTitle>Use Case</CardTitle>
                    <CardDescription>Basic information about your use case</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <FormField
                    control={form.control}
                    name="useCaseTitle"
                    render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>
                                    Use Case Title<span className="text-red-500">*</span>
                                    {aiGeneratedFields.useCaseTitle && (
                                        <span
                                            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600"
                                            title="AI generated"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                        </span>
                                    )}
                                </FieldLabel>
                                <FieldContent>
                                    <Input
                                        placeholder="Use Case Title"
                                        {...field}
                                        className="form-input"
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                    {aiSuggestions.useCaseTitle && (
                                        <div className="mt-2 flex items-center justify-between text-xs text-sky-600">
                                            <span className="truncate">
                                                AI Suggestion: {aiSuggestions.useCaseTitle}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onAcceptSuggestion("useCaseTitle")}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onRejectSuggestion("useCaseTitle")}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </FieldContent>
                            </Field>
                        )}
                    />

                <FormField
                    control={form.control}
                    name="headline"
                    render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>
                                    Headline<span className="text-red-500">*</span>
                                    {aiGeneratedFields.headline && (
                                        <span
                                            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600"
                                            title="AI generated"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                        </span>
                                    )}
                                </FieldLabel>
                                <FieldContent>
                                    <Input
                                        placeholder="One Line Executive Headline"
                                        {...field}
                                        className="form-input"
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                    {aiSuggestions.headline && (
                                        <div className="mt-2 flex items-center justify-between text-xs text-sky-600">
                                            <span className="truncate">
                                                AI Suggestion: {aiSuggestions.headline}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onAcceptSuggestion("headline")}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onRejectSuggestion("headline")}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </FieldContent>
                            </Field>
                        )}
                    />

                <FormField
                    control={form.control}
                    name="opportunity"
                    render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel className="w-full justify-between h-4">
                                    <span>
                                        Opportunity<span className="text-red-500">*</span>
                                        {aiGeneratedFields.opportunity && (
                                            <span
                                                className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600"
                                                title="AI generated"
                                            >
                                                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                            </span>
                                        )}
                                    </span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    className="h-auto px-0 text-xs text-sky-600"
                                                    onClick={onGenerateAi}
                                                    disabled={aiStatus === "loading"}
                                                >
                                                    {aiStatus === "loading" ? "Generating..." : "Write with AI"}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="left" className="max-w-[260px]">
                                                Generates a title, headline, rewritten opportunity, and business value from your opportunity.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </FieldLabel>
                                <FieldContent>
                                    <Textarea
                                        rows={3}
                                        placeholder="What is AI being used for?"
                                        {...field}
                                        className="form-textarea"
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                    {aiSuggestions.opportunity && (
                                        <div className="mt-2 flex items-center justify-between text-xs text-sky-600">
                                            <span>Use AI suggestion?</span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onAcceptSuggestion("opportunity")}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onRejectSuggestion("opportunity")}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </FieldContent>
                            </Field>
                        )}
                    />

                <FormField
                    control={form.control}
                    name="businessValue"
                    render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>
                                    Business Value<span className="text-red-500">*</span>
                                    {aiGeneratedFields.businessValue && (
                                        <span
                                            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600"
                                            title="AI generated"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                        </span>
                                    )}
                                </FieldLabel>
                                <FieldContent>
                                    <Textarea
                                        rows={3}
                                        placeholder="Supporting Evidence of how this agent benifits UKG? (ie. Productivity, Adoption, Risk Mitigation, Cost Reduction, Sustainability, etc.)"
                                        {...field}
                                        className="form-textarea"
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                    {aiSuggestions.businessValue && (
                                        <div className="mt-2 flex items-center justify-between text-xs text-sky-600">
                                            <span>Use AI suggestion?</span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onAcceptSuggestion("businessValue")}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onRejectSuggestion("businessValue")}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
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
                                    <Input
                                        placeholder="Additional Info Link about Use Case"
                                        {...field}
                                        className="form-input"
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </FieldContent>
                            </Field>
                        )}
                    />
            </CardContent>
        </Card>

        {/* AI Configuration section hidden for now */}
        {/* <Card ref={aiCardRef} className="shadow-sm">
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
                                        onChange={(value) => {
                                            field.onChange(value);
                                            onFieldBlur();
                                        }}
                                        options={aiThemes}
                                        placeholder="Select AI Themes"
                                        searchPlaceholder="Search themes..."
                                        container={aiCardRef.current}
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                    {aiEnabled && aiSuggestions.selectedAITheme?.values?.length ? (
                                        <div className="mt-2 flex items-center justify-between text-xs text-sky-600">
                                            <span className="truncate">
                                                AI Suggestion: {aiSuggestions.selectedAITheme.values.join(", ")}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onAcceptSuggestion("selectedAITheme")}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onRejectSuggestion("selectedAITheme")}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : null}
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
                                        onChange={(value) => {
                                            field.onChange(value);
                                            onFieldBlur();
                                        }}
                                        options={personas}
                                        placeholder="Select Target Personas"
                                        searchPlaceholder="Search personas..."
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                    {aiEnabled && aiSuggestions.selectedPersona?.values?.length ? (
                                        <div className="mt-2 flex items-center justify-between text-xs text-sky-600">
                                            <span className="truncate">
                                                AI Suggestion: {aiSuggestions.selectedPersona.values.join(", ")}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onAcceptSuggestion("selectedPersona")}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onRejectSuggestion("selectedPersona")}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : null}
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
                                        onChange={(value) => {
                                            field.onChange(value);
                                            onFieldBlur();
                                        }}
                                        options={vendors}
                                        placeholder="No Vendor Identified"
                                        searchPlaceholder="Search vendors..."
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                    {aiEnabled && aiSuggestions.selectedVendor?.value ? (
                                        <div className="mt-2 flex items-center justify-between text-xs text-sky-600">
                                            <span className="truncate">
                                                AI Suggestion: {aiSuggestions.selectedVendor.value}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onAcceptSuggestion("selectedVendor")}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onRejectSuggestion("selectedVendor")}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : null}
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
                                        onChange={(value) => {
                                            field.onChange(value);
                                            onFieldBlur();
                                        }}
                                        options={models}
                                        disabled={!selectedVendor || models.length === 0}
                                        placeholder="No Model Identified"
                                        searchPlaceholder="Search models..."
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                    {aiEnabled && aiSuggestions.selectedModel?.value ? (
                                        <div className="mt-2 flex items-center justify-between text-xs text-sky-600">
                                            <span className="truncate">
                                                AI Suggestion: {aiSuggestions.selectedModel.value}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onAcceptSuggestion("selectedModel")}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-sky-600 hover:text-sky-700"
                                                    onClick={() => onRejectSuggestion("selectedModel")}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : null}
                                </FieldContent>
                            </Field>
                        )}
                    />
                </div>
            </CardContent>
        </Card> */}

        <Card className="shadow-sm">
            <CardHeader className="border-b">
                <CardTitle>Team Information</CardTitle>
                <CardDescription>Business unit, team details and resources</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isMappingsLoading ? (
                        <>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </>
                    ) : (
                        <>
                            <FormField
                                control={form.control}
                                name="selectedBusinessUnit"
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>
                                            Business Unit<span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <FieldContent>
                                            <Combobox
                                                value={field.value}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                }}
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
                                        <FieldLabel>
                                            Team Name<span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <FieldContent>
                                            <Combobox
                                                value={field.value}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                }}
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
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isMappingsLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <FormField
                            control={form.control}
                            name="selectedSubTeam"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Sub Team Name</FieldLabel>
                                    <FieldContent>
                                        <Combobox
                                            value={field.value}
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            options={subTeams}
                                            disabled={!selectedTeam}
                                            placeholder="Select Sub Team Name"
                                        />
                                        <FieldError errors={[fieldState.error]} />
                                    </FieldContent>
                                </Field>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="eseResourceValue"
                        render={({ field, fieldState }) => (
                            <Field>
                            <FieldLabel>
                                ESE Resources Needed<span className="text-red-500">*</span>
                            </FieldLabel>
                                <FieldContent>
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="No">No</SelectItem>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                        </SelectContent>
                                    </Select>
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
