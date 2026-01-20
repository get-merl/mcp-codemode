import type { z } from "zod";
import type { compactionConfigSchema } from "../config.js";

export type CompactionConfig = z.infer<typeof compactionConfigSchema>;
export type CompactionStrategy = "summarize" | "truncate" | "persist-to-file";

export interface CompactionResult {
  compacted: boolean;
  originalSize: number;
  compactedSize: number;
  strategy?: CompactionStrategy;
  result: { content: unknown[]; isError?: boolean };
}

export interface SizeEstimate {
  bytes: number;
  estimatedTokens: number;
  exceedsThreshold: boolean;
}
