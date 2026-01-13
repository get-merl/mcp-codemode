import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_search_files
// Search for files by name, content, or metadata

export interface FssearchfilesInput {
  query: string;
  searchType?: string;
  fileTypes?: string;
  minSize?: string;
  maxSize?: string;
  modifiedAfter?: string;
  useIndex?: string;
}

export type FssearchfilesOutput = unknown;

export async function fsSearchFiles(input: FssearchfilesInput): Promise<FssearchfilesOutput> {
  return await callMcpTool<FssearchfilesOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_search_files",
    input,
  });
}
