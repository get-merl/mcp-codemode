import type { CompactionConfig } from "./types.js";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

type CompactableResult = { content: unknown[]; isError?: boolean };

// Strategy 1: Truncate
export function truncateContent(
  result: CompactableResult,
  config: CompactionConfig
): CompactableResult {

  const maxLength = config.truncateLength ?? 5000;

  const compactedContent = result.content.map((item: any) => {
    if (item.type === "text") {
      const originalText = item.text;
      if (originalText.length > maxLength) {
        const truncated = originalText.slice(0, maxLength);
        return {
          ...item,
          text: `${truncated}\n\n[... truncated ${originalText.length - maxLength} characters. Original: ${originalText.length} chars]`,
        };
      }
    }
    return item;
  });

  return { ...result, content: compactedContent };
}

// Strategy 2: Summarize
export function summarizeContent(
  result: CompactableResult,
  config: CompactionConfig
): CompactableResult {

  const maxLength = config.summaryMaxLength ?? 3000;

  const compactedContent = result.content.map((item: any) => {
    if (item.type === "text") {
      const originalText = item.text;
      if (originalText.length > maxLength) {
        const chunkSize = Math.floor(maxLength / 2);
        const beginning = originalText.slice(0, chunkSize);
        const end = originalText.slice(-chunkSize);

        return {
          ...item,
          text: `${beginning}\n\n[... ${originalText.length - maxLength} characters omitted ...]\n\n${end}`,
        };
      }
    }
    return item;
  });

  return { ...result, content: compactedContent };
}

// Strategy 3: Persist to file
export async function persistToFile(
  result: CompactableResult,
  config: CompactionConfig,
  context: { serverName: string; toolName: string }
): Promise<CompactableResult> {
  const baseDir =
    config.persistDir ??
    path.join(process.cwd(), "codemode", ".cache", "compacted");
  const toolDir = path.join(baseDir, context.serverName, context.toolName);
  await fs.mkdir(toolDir, { recursive: true });

  const contentHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(result))
    .digest("hex")
    .slice(0, 12);
  const timestamp = Date.now();
  const filename = `${timestamp}-${contentHash}.json`;
  const filePath = path.join(toolDir, filename);

  await fs.writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");

  return {
    content: [
      {
        type: "text",
        text: `[Large output compacted to file]\n\nFile: ${filePath}\nSize: ${JSON.stringify(result).length} bytes\nServer: ${context.serverName}\nTool: ${context.toolName}\n\nTo retrieve: cat ${filePath}`,
      },
    ],
    isError: result.isError ?? false,
  };
}

// Strategy dispatcher
export async function applyCompactionStrategy(
  result: CompactableResult,
  config: CompactionConfig,
  context: { serverName: string; toolName: string }
): Promise<CompactableResult> {
  switch (config.strategy) {
    case "truncate":
      return truncateContent(result, config);
    case "summarize":
      return summarizeContent(result, config);
    case "persist-to-file":
      return await persistToFile(result, config, context);
    default:
      throw new Error(`Unknown compaction strategy: ${config.strategy}`);
  }
}
