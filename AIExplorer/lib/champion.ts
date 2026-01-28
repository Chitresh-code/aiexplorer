export const fetchChampionStatus = async (email: string): Promise<boolean> => {
  const normalized = email.trim();
  if (!normalized) return false;

  const response = await fetch(
    `/api/champion?email=${encodeURIComponent(normalized)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(details || "Failed to check champion status.");
  }
  const data = await response.json().catch(() => null);
  return Boolean(data?.isChampion);
};
