import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_compute_checksum
// Compute file checksums

export interface FscomputechecksumInput {
  path: string;
  algorithm?: string;
}

export type FscomputechecksumOutput = unknown;

export async function fsComputeChecksum(
  input: FscomputechecksumInput,
): Promise<FscomputechecksumOutput> {
  return await callMcpTool<FscomputechecksumOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_compute_checksum",
    input,
  });
}
