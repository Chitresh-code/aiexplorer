import "server-only";

type ResponsesRequestConfig = {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
};

type ResponsesRequestOptions = {
  systemPrompt: string;
  schemaName: string;
  schema: Record<string, unknown>;
  payload: unknown;
  modelOverride?: string;
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const getAzureConfig = () => ({
  endpoint: process.env.GPT5_ENDPOINT?.trim(),
  deployment: process.env.GPT5_DEPLOYMENT?.trim(),
  apiVersion: process.env.GPT5_API_VERSION?.trim() || "2025-04-01-preview",
  apiKey: process.env.GPT5_API_SECRET?.trim(),
  model: process.env.GPT5_MODEL_NAME?.trim(),
});

const getOpenAiConfig = () => ({
  apiKey: process.env.OPENAI_API_KEY?.trim(),
  model: process.env.OPENAI_MODEL?.trim() || "gpt-5-nano",
});

export const buildResponsesRequest = (
  options: ResponsesRequestOptions,
): ResponsesRequestConfig => {
  const openAi = getOpenAiConfig();
  const azure = getAzureConfig();
  const useAzure =
    process.env.NODE_ENV === "production" &&
    azure.endpoint &&
    azure.deployment &&
    azure.apiKey;

  if (!useAzure && !openAi.apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const model = useAzure
    ? azure.model || options.modelOverride
    : options.modelOverride || openAi.model;

  const requestBody: Record<string, unknown> = {
    model,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: options.systemPrompt }],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify(options.payload),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: options.schemaName,
        schema: options.schema,
        strict: true,
      },
    },
  };

  if (!model) {
    delete requestBody.model;
  }

  const azureBase = azure.endpoint?.replace(/\/+$/, "") ?? "";
  const url = useAzure
    ? `${azureBase}/openai/deployments/${azure.deployment}/responses?api-version=${azure.apiVersion}`
    : OPENAI_API_URL;

  const headers = useAzure
    ? {
        "Content-Type": "application/json",
        "api-key": azure.apiKey ?? "",
      }
    : {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAi.apiKey}`,
      };

  return { url, headers, body: requestBody };
};
