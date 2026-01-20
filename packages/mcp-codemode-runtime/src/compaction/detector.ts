import type { CompactionConfig, SizeEstimate } from "./types.js";

export function estimateSize(result: unknown): SizeEstimate {
  const jsonString = JSON.stringify(result);
  const bytes = Buffer.byteLength(jsonString, "utf-8");
  const estimatedTokens = Math.ceil(bytes / 4); // ~4 chars per token

  return { bytes, estimatedTokens, exceedsThreshold: false };
}

export function shouldCompact(
  sizeEstimate: SizeEstimate,
  config: CompactionConfig
): boolean {
  if (!config.enabled) return false;

  const { bytes, estimatedTokens } = sizeEstimate;
  const { thresholds } = config;

  if (thresholds.bytes !== undefined && bytes > thresholds.bytes) return true;
  if (thresholds.tokens !== undefined && estimatedTokens > thresholds.tokens)
    return true;

  return false;
}
