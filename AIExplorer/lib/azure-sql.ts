import "server-only";
import sql from "mssql";
import { ManagedIdentityCredential } from "@azure/identity";

const readEnv = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) return fallback;
  return value.toLowerCase() === "true" || value === "1";
};

const getAuthMode = (): "managed-identity" | "password" => {
  const value = process.env.AZURE_SQL_AUTH?.trim().toLowerCase();
  return value === "managed-identity" ? "managed-identity" : "password";
};

const getBaseConfig = (): sql.config => ({
  server: readEnv("AZURE_SQL_SERVER"),
  database: readEnv("AZURE_SQL_DATABASE"),
  port: Number(process.env.AZURE_SQL_PORT ?? 1433),
  options: {
    encrypt: parseBoolean(process.env.AZURE_SQL_ENCRYPT, true),
    trustServerCertificate: parseBoolean(
      process.env.AZURE_SQL_TRUST_SERVER_CERT,
      false,
    ),
  },
  pool: {
    max: 5,
    min: 0,
    idleTimeoutMillis: 30000,
  },
});

const getPasswordConfig = (): sql.config => ({
  ...getBaseConfig(),
  user: readEnv("AZURE_SQL_USER"),
  password: readEnv("AZURE_SQL_PASSWORD"),
});

const getManagedIdentityConfig = async (): Promise<{
  config: sql.config;
  expiresOnTimestamp: number;
}> => {
  const clientId = process.env.AZURE_SQL_MI_CLIENT_ID?.trim();
  const credential = clientId
    ? new ManagedIdentityCredential(clientId)
    : new ManagedIdentityCredential();
  const tokenResponse = await credential.getToken(
    "https://database.windows.net/.default",
  );
  if (!tokenResponse?.token) {
    throw new Error("Failed to acquire Azure SQL access token.");
  }
  return {
    config: {
      ...getBaseConfig(),
      authentication: {
        type: "azure-active-directory-access-token",
        options: {
          token: tokenResponse.token,
        },
      },
    },
    expiresOnTimestamp: tokenResponse.expiresOnTimestamp ?? Date.now(),
  };
};

const globalForSql = globalThis as typeof globalThis & {
  __azureSqlPool?: Promise<sql.ConnectionPool>;
  __azureSqlTokenExpiresAt?: number;
};

export const getSqlPool = async (): Promise<sql.ConnectionPool> => {
  const authMode = getAuthMode();
  if (authMode === "managed-identity") {
    const now = Date.now();
    const expiresAt = globalForSql.__azureSqlTokenExpiresAt ?? 0;
    const needsRefresh = !globalForSql.__azureSqlPool || expiresAt - now < 2 * 60 * 1000;
    if (needsRefresh) {
      const { config, expiresOnTimestamp } = await getManagedIdentityConfig();
      globalForSql.__azureSqlTokenExpiresAt = expiresOnTimestamp;
      globalForSql.__azureSqlPool = new sql.ConnectionPool(config).connect();
    }
    if (!globalForSql.__azureSqlPool) {
      throw new Error("Azure SQL pool not initialized for managed identity.");
    }
    return await globalForSql.__azureSqlPool;
  }

  if (!globalForSql.__azureSqlPool) {
    globalForSql.__azureSqlPool = new sql.ConnectionPool(
      getPasswordConfig(),
    ).connect();
  }
  if (!globalForSql.__azureSqlPool) {
    throw new Error("Azure SQL pool not initialized.");
  }
  return await globalForSql.__azureSqlPool;
};
