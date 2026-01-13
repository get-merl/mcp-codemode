import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_batch_operations
// Execute multiple filesystem operations atomically

export interface FsbatchoperationsInput {
  operations: string;
  atomic?: string;
}

export type FsbatchoperationsOutput = unknown;

export async function fsBatchOperations(
  input: FsbatchoperationsInput,
): Promise<FsbatchoperationsOutput> {
  return await callMcpTool<FsbatchoperationsOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_batch_operations",
    input,
  });
}
