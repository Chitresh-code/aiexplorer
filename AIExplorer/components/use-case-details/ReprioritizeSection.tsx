"use client";

import { Button } from "@/components/ui/button";
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
};

const impactOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Very High", label: "Very High" },
];

const confidenceOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const effortOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const priorityOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

const deliveryOptions = [
  { value: "FY25Q01", label: "FY25Q01" },
  { value: "FY25Q02", label: "FY25Q02" },
  { value: "FY25Q03", label: "FY25Q03" },
  { value: "FY25Q04", label: "FY25Q04" },
  { value: "FY26Q01", label: "FY26Q01" },
  { value: "FY26Q02", label: "FY26Q02" },
  { value: "FY26Q03", label: "FY26Q03" },
  { value: "FY26Q04", label: "FY26Q04" },
];

const userBaseOptions = [
  { value: "0-100", label: "0-100" },
  { value: "100-500", label: "100-500" },
  { value: "500-1000", label: "500-1000" },
  { value: "1000-5000", label: "1000-5000" },
  { value: "5000+", label: "5000+" },
];

const reportingFrequencyOptions = [
  { value: "Once in two week", label: "Once in two week" },
  { value: "Weekly", label: "Weekly" },
  { value: "Bi-weekly", label: "Bi-weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
];

const standardMenuClass = "w-[calc(var(--radix-popper-anchor-width)-8px)] min-w-[200px]";
const wideMenuClass = "w-[calc(var(--radix-popper-anchor-width)-24px)] min-w-[200px] max-w-[240px]";

export const ReprioritizeSection = ({
  formData,
  onFormDataChange,
  onToggle,
}: ReprioritizeSectionProps) => {
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
                <Input
                  type="text"
                  value={formData.reach}
                  onChange={(e) => onFormDataChange("reach", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Impact</Label>
                <ReprioritizeCombobox
                  value={formData.impact}
                  onChange={(value) => onFormDataChange("impact", value)}
                  options={impactOptions}
                  placeholder="Select impact level"
                  searchPlaceholder="Search impact..."
                  align="end"
                  alignOffset={130}
                  sideOffset={60}
                  contentClassName={standardMenuClass}
                />
              </div>

              <div className="space-y-2">
                <Label>Confidence</Label>
                <ReprioritizeCombobox
                  value={formData.confidence}
                  onChange={(value) => onFormDataChange("confidence", value)}
                  options={confidenceOptions}
                  placeholder="Select confidence level"
                  searchPlaceholder="Search confidence..."
                  align="start"
                  alignOffset={100}
                  sideOffset={80}
                  contentClassName={standardMenuClass}
                />
              </div>

              <div className="space-y-2">
                <Label>Effort</Label>
                <ReprioritizeCombobox
                  value={formData.effort}
                  onChange={(value) => onFormDataChange("effort", value)}
                  options={effortOptions}
                  placeholder="Select effort level"
                  searchPlaceholder="Search effort..."
                  align="end"
                  alignOffset={130}
                  sideOffset={80}
                  contentClassName={standardMenuClass}
                />
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
                <Input
                  type="text"
                  value={formData.riceScore}
                  onChange={(e) => onFormDataChange("riceScore", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <ReprioritizeCombobox
                  value={formData.priority}
                  onChange={(value) => onFormDataChange("priority", value)}
                  options={priorityOptions}
                  placeholder="Select priority level"
                  searchPlaceholder="Search priority..."
                  align="end"
                  alignOffset={130}
                  sideOffset={70}
                  contentClassName={standardMenuClass}
                />
              </div>

              <div className="space-y-2">
                <Label>Delivery</Label>
                <ReprioritizeCombobox
                  value={formData.delivery}
                  onChange={(value) => onFormDataChange("delivery", value)}
                  options={deliveryOptions}
                  placeholder="Select delivery quarter"
                  searchPlaceholder="Search delivery quarter..."
                  align="start"
                  alignOffset={100}
                  sideOffset={90}
                  contentClassName={wideMenuClass}
                />
              </div>

              <div className="space-y-2">
                <Label>Total User Base</Label>
                <ReprioritizeCombobox
                  value={formData.totalUserBase}
                  onChange={(value) => onFormDataChange("totalUserBase", value)}
                  options={userBaseOptions}
                  placeholder="Select user base range"
                  searchPlaceholder="Search user base..."
                  align="end"
                  alignOffset={130}
                  sideOffset={90}
                  contentClassName={wideMenuClass}
                />
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
              <Switch checked={formData.displayInGallery} onCheckedChange={() => onToggle("displayInGallery")} />
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-gray-900">SLT Reporting</div>
                <div className="text-sm text-gray-500">Include in senior leadership reports</div>
              </div>
              <Switch checked={formData.sltReporting} onCheckedChange={() => onToggle("sltReporting")} />
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
              <ReprioritizeCombobox
                value={formData.reportingFrequency}
                onChange={(value) => onFormDataChange("reportingFrequency", value)}
                options={reportingFrequencyOptions}
                placeholder="Select frequency"
                searchPlaceholder="Search frequency..."
                className="w-[220px] ml-auto"
                align="end"
                alignOffset={0}
                sideOffset={6}
                contentClassName={standardMenuClass}
                disabled={!formData.sltReporting}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
