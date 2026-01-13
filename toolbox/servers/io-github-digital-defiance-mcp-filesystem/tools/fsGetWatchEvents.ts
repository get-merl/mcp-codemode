import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_get_watch_events
// Get accumulated watch events

export interface FsgetwatcheventsInput {
  sessionId: string;
  clear?: string;
}

export type FsgetwatcheventsOutput = unknown;

export async function fsGetWatchEvents(
  input: FsgetwatcheventsInput,
): Promise<FsgetwatcheventsOutput> {
  return await callMcpTool<FsgetwatcheventsOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_get_watch_events",
    input,
  });
}
