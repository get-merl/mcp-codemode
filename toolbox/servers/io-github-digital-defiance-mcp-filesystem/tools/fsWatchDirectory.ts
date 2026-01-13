import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_watch_directory
// Watch directory for filesystem changes

export interface FswatchdirectoryInput {
  path: string;
  recursive?: string;
  filters?: string;
}

export type FswatchdirectoryOutput = unknown;

export async function fsWatchDirectory(
  input: FswatchdirectoryInput,
): Promise<FswatchdirectoryOutput> {
  return await callMcpTool<FswatchdirectoryOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_watch_directory",
    input,
  });
}
