import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_create_symlink
// Create symbolic links

export interface FscreatesymlinkInput {
  linkPath: string;
  targetPath: string;
}

export type FscreatesymlinkOutput = unknown;

export async function fsCreateSymlink(input: FscreatesymlinkInput): Promise<FscreatesymlinkOutput> {
  return await callMcpTool<FscreatesymlinkOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_create_symlink",
    input,
  });
}
