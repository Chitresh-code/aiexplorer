import type { Configuration, PublicClientApplication } from "@azure/msal-browser";
import { LogLevel, PublicClientApplication as MSALPublicClientApplication } from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_MSAL_CLIENT_ID ?? "f85dfe54-b254-4ff3-9fc7-7611d169bc3e";
const tenantId = process.env.NEXT_PUBLIC_MSAL_TENANT_ID ?? "7b6f35d2-1f98-4e5e-82eb-e78f6ea5a1de";
const getRedirectUri = () => {
  const envUri = process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI?.trim();
  if (envUri && envUri.startsWith("http")) return envUri;

  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
};

const redirectUri = getRedirectUri();

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    // Using localStorage for better UX - users stay logged in across tabs and browser restarts
    // This is appropriate for an internal enterprise application where users expect persistent sessions
    // Trade-off: Slightly less secure than sessionStorage (tokens persist until manually cleared)
    // Security consideration: MSAL handles token expiration and refresh automatically
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
        }
      },
      logLevel: LogLevel.Info,
    },
  },
};

export const loginRequest = {
  scopes: (process.env.NEXT_PUBLIC_MSAL_SCOPES ?? "User.Read")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean),
};

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};

let msalInstance: PublicClientApplication | null = null;

export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (msalInstance) {
    return msalInstance;
  }

  const instance = new MSALPublicClientApplication(msalConfig);
  await instance.initialize();
  msalInstance = instance;
  return instance;
}
