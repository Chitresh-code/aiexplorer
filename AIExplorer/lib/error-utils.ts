import { isProd } from "@/lib/app-env";

const getErrorText = (error: unknown): string => {
  if (error instanceof Error) {
    return error.stack || error.message;
  }
  return String(error);
};

export const getUiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (isProd) {
    return fallbackMessage;
  }
  return getErrorText(error);
};

export const logErrorTrace = (label: string, error: unknown) => {
  const details = getErrorText(error);
  if (isProd) {
    console.error(label);
    return;
  }
  console.error(label, details);
};
