import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_copy_directory
// Copy directories recursively

export interface FscopydirectoryInput {
  source: string;
  destination: string;
  preserveMetadata?: string;
  exclusions?: string;
}

export type FscopydirectoryOutput = unknown;

export async function fsCopyDirectory(input: FscopydirectoryInput): Promise<FscopydirectoryOutput> {
  return await callMcpTool<FscopydirectoryOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_copy_directory",
    input,
  });
}
