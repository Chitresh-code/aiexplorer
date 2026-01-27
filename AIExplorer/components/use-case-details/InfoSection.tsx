"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type InfoSectionProps = {
  id: string | number;
  isEditing: boolean;
  editableTitle: string;
  onTitleChange: (value: string) => void;
  useCasePhase?: string;
  agentBadgeLabel?: string;
  businessUnitName: string;
  teamName: string;
  aiThemeNames: string[];
  editableHeadline: string;
  onHeadlineChange: (value: string) => void;
  editableOpportunity: string;
  onOpportunityChange: (value: string) => void;
  editableEvidence: string;
  onEvidenceChange: (value: string) => void;
  editableContactPerson: string;
};

export const InfoSection = ({
  id,
  isEditing,
  editableTitle,
  onTitleChange,
  useCasePhase,
  agentBadgeLabel,
  businessUnitName,
  teamName,
  aiThemeNames,
  editableHeadline,
  onHeadlineChange,
  editableOpportunity,
  onOpportunityChange,
  editableEvidence,
  onEvidenceChange,
  editableContactPerson,
}: InfoSectionProps) => {
  const MarkdownBlock = ({ content }: { content: string }) => {
    if (!content.trim()) {
      return <div className="text-gray-400 italic">No content provided.</div>;
    }
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 text-gray-700 leading-relaxed space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 text-gray-700 leading-relaxed space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-teal-700 underline underline-offset-2 hover:text-teal-900"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-800">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-teal-200 pl-3 text-gray-600">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="w-[95%] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
        <div className="flex-1 max-w-xl">
          <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {editableTitle || "Use Case"}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-gray-600">
              ID: {id}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(80vh-150px)]">
        <div className="lg:col-span-1">
          <Card
            className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col"
            style={{ backgroundColor: "#c7e7e7" }}
          >
            <CardContent className="p-8 flex-1">
              <div className="flex h-full flex-col gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Use Case:
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      value={editableTitle}
                      onChange={(e) => onTitleChange(e.target.value)}
                      readOnly={!isEditing}
                      className={cn(
                        "text-[#13352C] font-medium bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto",
                        isEditing &&
                          "bg-white/50 border-white/20 px-2 py-1 shadow-sm focus-visible:ring-1",
                      )}
                    />
                    <Badge
                      variant="secondary"
                      className="bg-white/80 text-[#13352C] border-none shadow-sm hover:bg-white font-semibold flex-shrink-0"
                    >
                      {useCasePhase || "—"}
                    </Badge>
                    {agentBadgeLabel ? (
                      <Badge
                        variant="outline"
                        className="bg-[#13352C] text-white border-none shadow-md px-3 py-1 font-medium flex-shrink-0"
                      >
                        {agentBadgeLabel}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Business Unit:
                  </h3>
                  <div className="text-[#13352C] font-medium">
                    {businessUnitName || "—"}
                  </div>
                  {teamName ? (
                    <div className="text-sm text-[#13352C] mt-1">
                      Team: {teamName}
                    </div>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    AI Theme:
                  </h3>
                  {aiThemeNames.length > 0 ? (
                    <ul className="list-disc pl-5 text-[#13352C] font-medium text-base space-y-1">
                      {aiThemeNames.map((theme) => (
                        <li key={theme}>{theme}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-[#13352C] font-medium text-base">
                      No AI themes selected
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Primary Contact Person
                  </h3>
                  <div className="text-[#13352C] font-medium">
                    {editableContactPerson || "—"}
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <Button
                    className="bg-[#D3E12E] hover:bg-[#c0ce25] text-[#13352C] font-bold px-8 rounded-md"
                  >
                    Explore
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col">
            <CardContent className="pt-6 flex-1">
              <div className="space-y-8 h-full">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Headline - One line Executive Headline
                  </CardTitle>
                  {isEditing ? (
                    <Textarea
                      value={editableHeadline}
                      onChange={(e) => onHeadlineChange(e.target.value)}
                      className={cn(
                        "text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden",
                        "bg-gray-50 border-gray-200 px-3 py-2 shadow-sm focus-visible:ring-1 min-h-[60px] resize-y",
                      )}
                    />
                  ) : (
                    <MarkdownBlock content={editableHeadline} />
                  )}
                </div>

                <div>
                  <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Opportunity - What is the idea for which AI is being used?
                  </CardTitle>
                  {isEditing ? (
                    <Textarea
                      value={editableOpportunity}
                      onChange={(e) => onOpportunityChange(e.target.value)}
                      className={cn(
                        "text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden",
                        "bg-gray-50 border-gray-200 px-3 py-2 shadow-sm focus-visible:ring-1 min-h-[60px] resize-y",
                      )}
                    />
                  ) : (
                    <MarkdownBlock content={editableOpportunity} />
                  )}
                </div>

                <div>
                  <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Business Value
                  </CardTitle>
                  {isEditing ? (
                    <Textarea
                      value={editableEvidence}
                      onChange={(e) => onEvidenceChange(e.target.value)}
                      className={cn(
                        "text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden",
                        "bg-gray-50 border-gray-200 px-3 py-2 shadow-sm focus-visible:ring-1 min-h-[60px] resize-y",
                      )}
                    />
                  ) : (
                    <MarkdownBlock content={editableEvidence} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
