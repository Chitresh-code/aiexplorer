export type SqlRow = Record<string, unknown>;

const normalizeKey = (value: string): string =>
  value.toLowerCase().replace(/[\s._-]+/g, "");

export const pickValue = (row: SqlRow, keys: string[]): unknown => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const value = row[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }

  const normalizedKeys = keys.map(normalizeKey);
  for (const rowKey of Object.keys(row)) {
    const normalizedRowKey = normalizeKey(rowKey);
    const matchIndex = normalizedKeys.indexOf(normalizedRowKey);
    if (matchIndex === -1) continue;
    const value = row[rowKey];
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

export const isRowActive = (row: SqlRow): boolean => {
  const raw = pickValue(row, ["isactive", "IsActive", "Isactive"]);
  if (raw === undefined) return true;
  if (typeof raw === "boolean") return raw;
  const normalized = String(raw).trim().toLowerCase();
  if (["1", "true", "yes", "y", "active"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "inactive"].includes(normalized)) return false;
  return false;
};

export const toStringValue = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  return String(value);
};

export const toNumberValue = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
