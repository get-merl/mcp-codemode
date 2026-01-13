import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_sync_directory
// Sync directories (copy only newer or missing files)

export interface FssyncdirectoryInput {
  source: string;
  destination: string;
  exclusions?: string;
}

export type FssyncdirectoryOutput = unknown;

export async function fsSyncDirectory(input: FssyncdirectoryInput): Promise<FssyncdirectoryOutput> {
  return await callMcpTool<FssyncdirectoryOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_sync_directory",
    input,
  });
}
