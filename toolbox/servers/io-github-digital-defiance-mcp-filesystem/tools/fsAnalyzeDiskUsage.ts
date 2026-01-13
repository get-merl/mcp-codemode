import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_analyze_disk_usage
// Analyze disk usage

export interface FsanalyzediskusageInput {
  path: string;
  depth?: string;
  groupByType?: string;
}

export type FsanalyzediskusageOutput = unknown;

export async function fsAnalyzeDiskUsage(
  input: FsanalyzediskusageInput,
): Promise<FsanalyzediskusageOutput> {
  return await callMcpTool<FsanalyzediskusageOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_analyze_disk_usage",
    input,
  });
}
