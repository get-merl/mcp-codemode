// Deterministic stringify for stable fingerprints.
export function normalizeForHash(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(normalizeForHash);
  if (typeof value !== "object") return value;

  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    // Remove obviously volatile fields if present.
    if (key === "retrievedAt" || key === "timestamp") continue;
    out[key] = normalizeForHash(obj[key]);
  }
  return out;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(normalizeForHash(value));
}

