"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ReprioritizeCombobox } from "@/components/use-case-details/reprioritize/ReprioritizeCombobox";

type ReprioritizeFormData = {
  reach: string;
  impact: string;
  confidence: string;
  effort: string;
  riceScore: string;
  priority: string;
  delivery: string;
  totalUserBase: string;
  displayInGallery: boolean;
  sltReporting: boolean;
  reportingFrequency: string;
};

type ReprioritizeSectionProps = {
  formData: ReprioritizeFormData;
  onFormDataChange: (field: keyof ReprioritizeFormData, value: string) => void;
  onToggle: (field: keyof ReprioritizeFormData) => void;
  isEditing?: boolean;
  impactOptions: { value: string; label: string }[];
  confidenceOptions: { value: string; label: string }[];
  deliveryOptions: { value: string; label: string }[];
  reportingFrequencyOptions: { value: string; label: string }[];
};

const priorityOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

export const ReprioritizeSection = ({
  formData,
  onFormDataChange,
  onToggle,
  isEditing = false,
  impactOptions,
  confidenceOptions,
  deliveryOptions,
  reportingFrequencyOptions,
}: ReprioritizeSectionProps) => {
  const impactLabel =
    impactOptions.find((option) => option.value === formData.impact)?.label ?? formData.impact;
  const confidenceLabel =
    confidenceOptions.find((option) => option.value === formData.confidence)?.label ??
    formData.confidence;
  const deliveryLabel =
    deliveryOptions.find((option) => option.value === formData.delivery)?.label ?? formData.delivery;
  const reportingLabel =
    reportingFrequencyOptions.find((option) => option.value === formData.reportingFrequency)?.label ??
    formData.reportingFrequency;

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-1 flex-col gap-6 mx-auto max-w-7xl w-full px-4">
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Impact Metrics</CardTitle>
            <CardDescription>Measure the potential reach and impact of this use case</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Reach</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min={1}
                    max={10000}
                    value={formData.reach}
                    onChange={(e) => onFormDataChange("reach", e.target.value)}
                  />
                ) : (
                  <div className="text-sm text-gray-700">{formData.reach || "Not set"}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Impact</Label>
                {isEditing ? (
                  <ReprioritizeCombobox
                    value={formData.impact}
                    onChange={(value) => onFormDataChange("impact", value)}
                    options={impactOptions}
                    placeholder="Select impact level"
                    searchPlaceholder="Search impact..."
                  />
                ) : (
                  <div className="text-sm text-gray-700">{impactLabel || "Not set"}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Confidence</Label>
                {isEditing ? (
                  <ReprioritizeCombobox
                    value={formData.confidence}
                    onChange={(value) => onFormDataChange("confidence", value)}
                    options={confidenceOptions}
                    placeholder="Select confidence level"
                    searchPlaceholder="Search confidence..."
                  />
                ) : (
                  <div className="text-sm text-gray-700">{confidenceLabel || "Not set"}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Effort</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min={1}
                    value={formData.effort}
                    onChange={(e) => onFormDataChange("effort", e.target.value)}
                  />
                ) : (
                  <div className="text-sm text-gray-700">{formData.effort || "Not set"}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Priority & Scoring</CardTitle>
            <CardDescription>Define prioritization and scoring metrics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>RICE Score</Label>
                {isEditing ? (
                  <Input type="text" value={formData.riceScore} readOnly />
                ) : (
                  <div className="text-sm text-gray-700">{formData.riceScore || "Not set"}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                {isEditing ? (
                  <ReprioritizeCombobox
                    value={formData.priority}
                    onChange={(value) => onFormDataChange("priority", value)}
                    options={priorityOptions}
                    placeholder="Select priority level"
                    searchPlaceholder="Search priority..."
                  />
                ) : (
                  <div className="text-sm text-gray-700">{formData.priority || "Not set"}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Delivery</Label>
                {isEditing ? (
                  <ReprioritizeCombobox
                    value={formData.delivery}
                    onChange={(value) => onFormDataChange("delivery", value)}
                    options={deliveryOptions}
                    placeholder="Select delivery quarter"
                    searchPlaceholder="Search delivery quarter..."
                  />
                ) : (
                  <div className="text-sm text-gray-700">{deliveryLabel || "Not set"}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Total User Base</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min={0}
                    value={formData.totalUserBase}
                    onChange={(e) => onFormDataChange("totalUserBase", e.target.value)}
                  />
                ) : (
                  <div className="text-sm text-gray-700">{formData.totalUserBase || "Not set"}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Reporting Configuration</CardTitle>
            <CardDescription>Configure how this use case is reported</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-gray-900">Display in AI Gallery</div>
                <div className="text-sm text-gray-500">Show this use case publicly in the gallery</div>
              </div>
              <Switch
                checked={formData.displayInGallery}
                onCheckedChange={() => onToggle("displayInGallery")}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-gray-900">SLT Reporting</div>
                <div className="text-sm text-gray-500">Include in senior leadership reports</div>
              </div>
              <Switch
                checked={formData.sltReporting}
                onCheckedChange={() => onToggle("sltReporting")}
                disabled={!isEditing}
              />
            </div>

            <div className={cn("flex items-center justify-between border-t pt-6 flex-wrap gap-4", !formData.sltReporting && "opacity-50")}>
              <div className="space-y-0.5 flex-1 min-w-[200px]">
                <div className={cn("text-sm font-medium", formData.sltReporting ? "text-gray-900" : "text-gray-400")}>
                  Reporting Frequency
                </div>
                <div className={cn("text-sm", formData.sltReporting ? "text-gray-500" : "text-gray-400")}>
                  How often this use case is reported
                </div>
              </div>
              {isEditing ? (
                <ReprioritizeCombobox
                  value={formData.reportingFrequency}
                  onChange={(value) => onFormDataChange("reportingFrequency", value)}
                  options={reportingFrequencyOptions}
                  placeholder="Select frequency"
                  searchPlaceholder="Search frequency..."
                  className="w-[220px] ml-auto"
                  disabled={!formData.sltReporting}
                />
              ) : (
                <div className="text-sm text-gray-700">
                  {formData.sltReporting ? (reportingLabel || "Not set") : "Not set"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
