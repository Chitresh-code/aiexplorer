import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";
import { buildResponsesRequest } from "@/lib/ai-config";
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


type TimelineItem = {
  name: string;
  startDate: string;
  endDate: string;
};

type TimelineConfig = {
  schema_name?: string;
  system_prompt?: string;
  schema?: Record<string, unknown>;
};

const configPath = path.join(process.cwd(), "config", "phase-timeline.yaml");
let cachedConfig: TimelineConfig | null = null;

const loadTimelineConfig = async (): Promise<TimelineConfig> => {
  if (cachedConfig && process.env.NODE_ENV !== "development") {
    return cachedConfig;
  }
  const raw = await readFile(configPath, "utf8");
  const parsed = parse(raw) as TimelineConfig;
  if (!parsed?.schema || !parsed?.system_prompt) {
    throw new Error("phase-timeline.yaml is missing schema or system_prompt");
  }
  if (process.env.NODE_ENV !== "development") {
    cachedConfig = parsed;
  }
  return parsed;
};

export const POST = async (req: Request): Promise<NextResponse> => {
  try {
    const payload = await req.json();
    const phases = Array.isArray(payload?.phases) ? payload.phases : [];
    const context = payload?.context ?? {};
    const useCase = payload?.useCase ?? {};

    if (phases.length === 0) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const config = await loadTimelineConfig();
    const schema = config.schema as Record<string, unknown>;
    const schemaName = config.schema_name || "PhaseTimeline";
    const systemPrompt = config.system_prompt || "";

    const { url, headers, body } = buildResponsesRequest({
      systemPrompt,
      schemaName,
      schema,
      payload: { useCase, phases, context },
    });

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(details || "OpenAI request failed.");
    }

    const data = await response.json();
    const outputText =
      data.output_text ||
      data.output
        ?.flatMap((item: { content?: Array<{ type: string; text?: string }> }) => item.content ?? [])
        .find((item: { type: string }) => item.type === "output_text" || item.type === "summary_text")
        ?.text ||
      "";
    const parsed = outputText ? JSON.parse(outputText) : { items: [] };
    const items = Array.isArray(parsed?.items) ? (parsed.items as TimelineItem[]) : [];

    return NextResponse.json(
      { items },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logErrorTrace("Phase timeline generation failed", error);
    return NextResponse.json(
      {
        message: getUiErrorMessage(error, "Failed to generate timeline."),
      },
      { status: 500 },
    );
  }
};
