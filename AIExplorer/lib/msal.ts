import type {
  AuthenticationResult,
  Configuration,
  PublicClientApplication,
  PopupRequest,
} from "@azure/msal-browser";
import {
  EventType,
  LogLevel,
  PublicClientApplication as MSALPublicClientApplication,
} from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_MSAL_CLIENT_ID?.trim();
const tenantId = process.env.NEXT_PUBLIC_MSAL_TENANT_ID?.trim();
const redirectUri = process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI?.trim();
const rawScopes = process.env.NEXT_PUBLIC_MSAL_SCOPES?.trim();

const requireEnv = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const getScopes = (): string[] => {
  const scopes = requireEnv(rawScopes, "NEXT_PUBLIC_MSAL_SCOPES")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
  if (scopes.length === 0) {
    throw new Error("NEXT_PUBLIC_MSAL_SCOPES must include at least one scope.");
  }
  return scopes;
};

const getMsalConfig = (): Configuration => {
  const resolvedClientId = requireEnv(
    clientId,
    "NEXT_PUBLIC_MSAL_CLIENT_ID",
  );
  const resolvedTenantId = requireEnv(
    tenantId,
    "NEXT_PUBLIC_MSAL_TENANT_ID",
  );
  const resolvedRedirectUri = requireEnv(
    redirectUri,
    "NEXT_PUBLIC_MSAL_REDIRECT_URI",
  );

  return {
    auth: {
      clientId: resolvedClientId,
      authority: `https://login.microsoftonline.com/${resolvedTenantId}`,
      redirectUri: resolvedRedirectUri,
      postLogoutRedirectUri: resolvedRedirectUri,
    },
    cache: {
      cacheLocation: "localStorage",
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
};

export const getLoginRequest = (): PopupRequest => ({
  scopes: getScopes(),
  redirectUri: requireEnv(redirectUri, "NEXT_PUBLIC_MSAL_REDIRECT_URI"),
});

export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};

let msalInstance: PublicClientApplication | null = null;

export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (msalInstance) {
    return msalInstance;
  }

  const instance = new MSALPublicClientApplication(getMsalConfig());
  await instance.initialize();

  instance.addEventCallback((event) => {
    if (
      event.eventType === EventType.LOGIN_SUCCESS ||
      event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
    ) {
      const result = event.payload as AuthenticationResult | null;
      if (result?.account) {
        instance.setActiveAccount(result.account);
      }
    }
  });

  if (!instance.getActiveAccount()) {
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
    }
  }

  msalInstance = instance;
  return instance;
}
