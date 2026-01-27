"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { Combobox } from "@/components/ui/combobox";

type AgentLibrarySectionProps = {
  knowledgeForce: string;
  onKnowledgeForceChange: (value: string) => void;
  knowledgeSourceOptions: string[];
  instructions: string;
  onInstructionsChange: (value: string) => void;
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
};

export const AgentLibrarySection = ({
  knowledgeForce,
  onKnowledgeForceChange,
  knowledgeSourceOptions,
  instructions,
  onInstructionsChange,
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
}: AgentLibrarySectionProps) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* AI Configuration section */}
      <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            AI Configuration
          </CardTitle>
          <CardDescription>Select AI themes, personas, vendor and model</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel>AI Theme</FieldLabel>
              <FieldContent>
                <MultiCombobox
                  value={selectedAIThemes}
                  onChange={onAIThemesChange || (() => { })}
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
                  onChange={onPersonasChange || (() => { })}
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
                  onChange={onVendorChange || (() => { })}
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
                  onChange={onModelChange || (() => { })}
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
                  type="number"
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
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            SELECT KNOWLEDGE SOURCE
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-gray-500 uppercase">Knowledge Source</Label>
            <Select value={knowledgeForce} onValueChange={onKnowledgeForceChange}>
              <SelectTrigger className="h-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                <SelectValue placeholder="Select Knowledge Source" />
              </SelectTrigger>
              <SelectContent position="item-aligned" className="w-60 -translate-x-0.5">
                {knowledgeSourceOptions.length > 0 ? (
                  knowledgeSourceOptions.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-source" disabled>
                    No sources available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            ADD INSTRUCTIONS / PROMPT
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>
    </div>
  );
};
