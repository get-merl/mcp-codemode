import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_verify_checksum
// Verify file checksums

export interface FsverifychecksumInput {
  path: string;
  checksum: string;
  algorithm?: string;
}

export type FsverifychecksumOutput = unknown;

export async function fsVerifyChecksum(
  input: FsverifychecksumInput,
): Promise<FsverifychecksumOutput> {
  return await callMcpTool<FsverifychecksumOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_verify_checksum",
    input,
  });
}
