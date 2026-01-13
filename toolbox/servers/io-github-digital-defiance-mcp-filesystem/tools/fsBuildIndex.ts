import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_build_index
// Build file index for fast searching

export interface FsbuildindexInput {
  path: string;
  includeContent?: string;
}

export type FsbuildindexOutput = unknown;

export async function fsBuildIndex(input: FsbuildindexInput): Promise<FsbuildindexOutput> {
  return await callMcpTool<FsbuildindexOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_build_index",
    input,
  });
}
