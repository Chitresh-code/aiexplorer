"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

type AgentLibrarySectionProps = {
  isEditing: boolean;
  // AI Configuration props
  aiThemes?: { label: string; value: string }[];
  selectedAIThemes?: string[];
  onAIThemesChange?: (value: string[]) => void;
  personas?: { label: string; value: string }[];
  selectedPersonas?: string[];
  onPersonasChange?: (value: string[]) => void;
  vendors?: { label: string; value: string }[];
  selectedVendor?: string;
  onVendorChange?: (value: string) => void;
  models?: { label: string; value: string }[];
  selectedModel?: string;
  onModelChange?: (value: string) => void;
  agentId?: string;
  onAgentIdChange?: (value: string) => void;
  agentLink?: string;
  onAgentLinkChange?: (value: string) => void;
  knowledgeSourceOptions: { label: string; value: string }[];
  selectedKnowledgeSources: string[];
  onKnowledgeSourcesChange: (value: string[]) => void;
  instructions: string;
  onInstructionsChange: (value: string) => void;
};

export const AgentLibrarySection = ({
  isEditing,
  aiThemes = [],
  selectedAIThemes = [],
  onAIThemesChange,
  personas = [],
  selectedPersonas = [],
  onPersonasChange,
  vendors = [],
  selectedVendor,
  onVendorChange,
  models = [],
  selectedModel,
  onModelChange,
  agentId,
  onAgentIdChange,
  agentLink,
  onAgentLinkChange,
  knowledgeSourceOptions = [],
  selectedKnowledgeSources = [],
  onKnowledgeSourcesChange,
  instructions,
  onInstructionsChange,
}: AgentLibrarySectionProps) => {
  const labelsFromValues = (
    values: (string | number)[] | undefined,
    options: { label: string; value: string }[]
  ) => {
    if (!values?.length) return [];
    const map = new Map(options.map((o) => [String(o.value), o.label]));
    // dedupe + map to label (fallback to raw value if not found)
    return Array.from(new Set(values.map(String))).map((v) => map.get(v) ?? v);
  };

  const labelFromValue = (
    value: string | number | undefined,
    options: { label: string; value: string }[]
  ) => {
    if (value == null || value === "") return "";
    return options.find((o) => String(o.value) === String(value))?.label ?? String(value);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* AI Configuration section */}
      <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              AI Configuration
            </CardTitle>
            <CardDescription>Select AI themes, personas, vendor and model</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel>AI Theme</FieldLabel>
                  <FieldContent>
                    <MultiCombobox
                      value={selectedAIThemes}
                      onChange={onAIThemesChange || (() => {})}
                      options={aiThemes}
                      placeholder="Select AI Themes"
                      searchPlaceholder="Search themes..."
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Target Personas</FieldLabel>
                  <FieldContent>
                    <MultiCombobox
                      value={selectedPersonas}
                      onChange={onPersonasChange || (() => {})}
                      options={personas}
                      placeholder="Select Target Personas"
                      searchPlaceholder="Search personas..."
                    />
                  </FieldContent>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel>Vendor Name</FieldLabel>
                  <FieldContent>
                    <Combobox
                      value={selectedVendor}
                      onChange={onVendorChange || (() => {})}
                      options={vendors}
                      placeholder="No Vendor Identified"
                      searchPlaceholder="Search vendors..."
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Model Name</FieldLabel>
                  <FieldContent>
                    <Combobox
                      value={selectedModel}
                      onChange={onModelChange || (() => {})}
                      options={models}
                      disabled={!selectedVendor || models.length === 0}
                      placeholder="No Model Identified"
                      searchPlaceholder="Search models..."
                    />
                  </FieldContent>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel>Agent ID</FieldLabel>
                  <FieldContent>
                    <Input
                      type="text"
                      value={agentId || ""}
                      onChange={(e) => onAgentIdChange?.(e.target.value)}
                      placeholder="Enter Agent ID"
                      className="bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Agent Link</FieldLabel>
                  <FieldContent>
                    <Input
                      value={agentLink || ""}
                      onChange={(e) => onAgentLinkChange?.(e.target.value)}
                      placeholder="Enter Agent Link"
                      className="bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </FieldContent>
                </Field>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    AI Themes
                  </h3>
                  <div className="text-gray-700">
                    {selectedAIThemes?.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {labelsFromValues(selectedAIThemes, aiThemes).map((theme) => (
                          <li key={theme}>{theme}</li>
                        ))}
                      </ul>
                    ) : (
                      "No AI Themes Selected"
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Target Personas
                  </h3>
                  <div className="text-gray-700">
                    {selectedPersonas?.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {labelsFromValues(selectedPersonas, personas).map((persona) => (
                          <li key={persona}>{persona}</li>
                        ))}
                      </ul>
                    ) : (
                      "No Target Personas Selected"
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Vendor Name
                  </h3>
                  <div className="text-gray-700">
                    {selectedVendor || "No Vendor Identified"}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Model Name
                  </h3>
                  <div className="text-gray-700">
                    {selectedModel ? labelFromValue(selectedModel, models) : "No Model Identified"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Agent ID
                  </h3>
                  <div className="text-gray-700">
                    {agentId || "No Agent ID Provided"}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Agent Link
                  </h3>
                  <div className="text-gray-700">
                    {agentLink ? (
                      <a
                        href={agentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 underline underline-offset-2 hover:text-teal-900"
                      >
                        {agentLink}
                      </a>
                    ) : (
                      "No Agent Link Provided"
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Source section */}
      <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            SELECT KNOWLEDGE SOURCE
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Knowledge Source</Label>

              <MultiCombobox
                value={selectedKnowledgeSources}
                onChange={onKnowledgeSourcesChange || (() => {})}
                options={knowledgeSourceOptions}
                placeholder="Select Knowledge Sources"
                searchPlaceholder="Search sources..."
              />
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Knowledge Source
              </h3>
              <div className="text-gray-700">
                {selectedKnowledgeSources?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {labelsFromValues(selectedKnowledgeSources, knowledgeSourceOptions).map((src) => (
                      <li key={src}>{src}</li>
                    ))}
                  </ul>
                ) : (
                  "No Knowledge Source Selected"
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions section */}
      <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            ADD INSTRUCTIONS / PROMPT
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Agent Instructions / Prompt</Label>
              <Textarea
                placeholder="Enter agent instructions or prompt..."
                rows={8}
                value={instructions}
                onChange={(e) => onInstructionsChange(e.target.value)}
                className="min-h-[200px] bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
              />
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Instructions / Prompt
              </h3>
              <div className={cn(
                "text-gray-700 whitespace-pre-wrap leading-relaxed",
                !instructions && "text-gray-400 italic"
              )}>
                {instructions || "No instructions provided."}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
