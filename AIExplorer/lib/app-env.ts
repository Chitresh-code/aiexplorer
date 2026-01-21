export type AppEnv = "dev" | "test" | "prod";

const normalizeAppEnv = (value?: string): AppEnv | null => {
  if (!value) return null;
  const lowered = value.toLowerCase();
  if (lowered === "dev" || lowered === "test" || lowered === "prod") {
    return lowered;
  }
  return null;
};

export const appEnv: AppEnv =
  normalizeAppEnv(process.env.NEXT_PUBLIC_APP_ENV) ??
  (process.env.NODE_ENV === "production" ? "prod" : "dev");

export const isProd = appEnv === "prod";
