import { callMcpTool } from "mcp-toolbox/runtime";

// server: io.github.Digital-Defiance/mcp-filesystem
// tool: fs_stop_watch
// Stop watching a directory

export interface FsstopwatchInput {
  sessionId: string;
}

export type FsstopwatchOutput = unknown;

export async function fsStopWatch(input: FsstopwatchInput): Promise<FsstopwatchOutput> {
  return await callMcpTool<FsstopwatchOutput>({
    registryId: "io.github.Digital-Defiance/mcp-filesystem",
    toolName: "fs_stop_watch",
    input,
  });
}
