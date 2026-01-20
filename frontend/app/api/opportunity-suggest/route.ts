import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Build chat messages to expand a short draft into a polished opportunity.
const buildMessages = (draft: string) => [
  {
    role: "system",
    content:
      "You expand short drafts into concise, professional opportunity statements for a business intake form. Keep it 3-5 sentences, plain language, no bullets or headings.",
  },
  {
    role: "user",
    content: `Draft:\n${draft}\n\nExpand this into a polished opportunity description.`,
  },
];

export async function POST(request: Request) {
  // Parse incoming JSON and normalize the draft text.
  const body = await request.json().catch(() => ({}));
  const draft = typeof body?.draft === "string" ? body.draft.trim() : "";

  if (!draft) {
    return NextResponse.json({ error: "Draft is required." }, { status: 400 });
  }

  // Load Azure OpenAI config from env (server-side only).
  const endpoint = (process.env.GPT5_ENDPOINT || "").trim();
  const deployment = (process.env.GPT5_DEPLOYMENT || "").trim();
  const apiVersion = (process.env.GPT5_API_VERSION || "").trim();
  const apiKey = (process.env.GPT5_API_SECRET || "").trim();

  if (!endpoint || !deployment || !apiVersion || !apiKey) {
    return NextResponse.json(
      { error: "Missing GPT-5 configuration." },
      { status: 500 }
    );
  }

  // Azure OpenAI chat completions endpoint for the selected deployment.
  const completionsUrl = new URL(
    `/openai/deployments/${deployment}/chat/completions`,
    endpoint
  );
  completionsUrl.searchParams.set("api-version", apiVersion);
  console.log("Completions url for azure:", completionsUrl);

  try {
    // Call Azure OpenAI with the drafted prompt.
    const response = await fetch(completionsUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: buildMessages(draft),
        temperature: 0.6,
        max_tokens: 200,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.error?.message || "AI request failed. Please try again.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const text = (data?.choices?.[0]?.message?.content || "").trim();

    if (!text) {
      return NextResponse.json(
        { error: "AI returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json(
      { error: "AI request failed. Please try again." },
      { status: 502 }
    );
  }
}
