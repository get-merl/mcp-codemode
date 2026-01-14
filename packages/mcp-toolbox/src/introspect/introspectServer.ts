import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { ToolboxServerConfig } from "mcp-toolbox-runtime";
import type { IntrospectedServer, McpToolDefinition } from "./types.js";

export async function introspectServer(args: {
  serverConfig: ToolboxServerConfig;
  allowStdioExec: boolean;
}): Promise<IntrospectedServer> {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:8',message:'introspectServer entry',data:{serverName:args.serverConfig.name,transportType:args.serverConfig.transport?.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const serverName = args.serverConfig.name;

  const transport = await chooseTransport({
    serverConfig: args.serverConfig,
    allowStdioExec: args.allowStdioExec,
  });
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:17',message:'after chooseTransport',data:{transportConstructor:transport?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const client = new Client({ name: "mcp-toolbox", version: "0.0.1" });

  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:22',message:'before client.connect',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    await client.connect(transport);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:22',message:'after client.connect',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:23',message:'before client.listTools',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const toolsResult = await client.listTools();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:23',message:'after client.listTools',data:{toolsCount:toolsResult?.tools?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const tools: McpToolDefinition[] = (toolsResult.tools ?? []).map((t: any) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:30',message:'before describeTransport',data:{transportConstructor:transport?.constructor?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const transportDesc = describeTransport(transport);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:34',message:'after describeTransport',data:{transportDesc},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return {
      serverName,
      version: "latest",
      retrievedAt: new Date().toISOString(),
      transport: transportDesc,
      tools,
    };
  } catch (error: unknown) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:40',message:'error in introspectServer',data:{errorMessage:error instanceof Error ? error.message : String(error),errorStack:error instanceof Error ? error.stack : undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    throw error;
  } finally {
    await safeCloseTransport(transport);
  }
}

async function safeCloseTransport(transport: Transport) {
  try {
    // Transports in the SDK expose close(); keep it best-effort.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (transport as any).close?.();
  } catch {
    // ignore
  }
}

function describeTransport(transport: Transport): IntrospectedServer["transport"] {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:52',message:'describeTransport entry',data:{transportConstructor:transport?.constructor?.name,hasTransport:!!transport},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t: any = transport;
  const ctorName = transport?.constructor?.name ?? "";
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:56',message:'describeTransport before checks',data:{ctorName,tUrl:t?.url,tCommand:t?.command,tArgs:t?.args,urlType:typeof t?.url,commandType:typeof t?.command},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  if (ctorName.includes("StreamableHTTP")) {
    const url = String(t?.url ?? "");
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:58',message:'describeTransport StreamableHTTP branch',data:{url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return { kind: "streamable-http", url };
  }
  if (ctorName.includes("SSE")) {
    const url = String(t?.url ?? "");
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:61',message:'describeTransport SSE branch',data:{url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return { kind: "sse", url };
  }
  const result = { kind: "stdio" as const, command: t?.command, args: t?.args };
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'introspectServer.ts:63',message:'describeTransport stdio branch',data:{result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  return result;
}

async function chooseTransport(args: {
  serverConfig: ToolboxServerConfig;
  allowStdioExec: boolean;
}): Promise<Transport> {
  if (args.serverConfig.transport.type === "http") {
    // Note: StreamableHTTPClientTransport doesn't support headers in options
    // Headers would need to be handled via authProvider or other mechanisms
    return new StreamableHTTPClientTransport(
      new URL(args.serverConfig.transport.url)
    );
  }

  if (args.serverConfig.transport.type === "stdio") {
    if (!args.allowStdioExec) {
      throw new Error(
        `Refusing to run stdio server '${args.serverConfig.name}' because security.allowStdioExec=false. Set security.allowStdioExec=true to enable stdio execution.`
      );
    }
    return new StdioClientTransport({
      command: args.serverConfig.transport.command,
      args: args.serverConfig.transport.args ?? [],
      env: args.serverConfig.transport.env,
    });
  }

  throw new Error(`Unknown transport type for server '${args.serverConfig.name}'`);
}

