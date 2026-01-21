import "server-only";
import sql from "mssql";

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

const sqlConfig: sql.config = {
  user: readEnv("AZURE_SQL_USER"),
  password: readEnv("AZURE_SQL_PASSWORD"),
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
};

const globalForSql = globalThis as typeof globalThis & {
  __azureSqlPool?: Promise<sql.ConnectionPool>;
};

export const getSqlPool = (): Promise<sql.ConnectionPool> => {
  if (!globalForSql.__azureSqlPool) {
    globalForSql.__azureSqlPool = new sql.ConnectionPool(sqlConfig).connect();
  }
  return globalForSql.__azureSqlPool;
};
