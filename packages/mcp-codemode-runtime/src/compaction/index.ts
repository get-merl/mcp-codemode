import type { CompactionConfig, CompactionResult } from "./types.js";
import { estimateSize, shouldCompact } from "./detector.js";
import { applyCompactionStrategy } from "./strategies.js";

export async function compactIfNeeded(
  result: { content: unknown[]; isError?: boolean },
  config: CompactionConfig | undefined,
  context: { serverName: string; toolName: string }
): Promise<CompactionResult> {
  if (!config || !config.enabled) {
    return {
      compacted: false,
      originalSize: 0,
      compactedSize: 0,
      result,
    };
  }

  const sizeEstimate = estimateSize(result);

  if (!shouldCompact(sizeEstimate, config)) {
    return {
      compacted: false,
      originalSize: sizeEstimate.bytes,
      compactedSize: sizeEstimate.bytes,
      result,
    };
  }

  const compactedResult = await applyCompactionStrategy(
    result,
    config,
    context
  );
  const compactedSize = estimateSize(compactedResult);

  return {
    compacted: true,
    originalSize: sizeEstimate.bytes,
    compactedSize: compactedSize.bytes,
    strategy: config.strategy,
    result: compactedResult,
  };
}

// Re-exports
export type {
  CompactionConfig,
  CompactionResult,
  SizeEstimate,
} from "./types.js";
export { estimateSize, shouldCompact } from "./detector.js";
export { applyCompactionStrategy } from "./strategies.js";
