import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { CodemodeConfig } from "./config.js";
import { loadCodemodeConfig } from "./loadConfig.js";
import { buildStdioEnv } from "./env.js";
import { resolveAuth } from "./auth/resolver.js";
import { getOrCreatePool, closeAllPools } from "./connectionPool.js";
import { compactIfNeeded } from "./compaction/index.js";

type CallArgs = { serverName: string; toolName: string; input: unknown };

export async function callMcpTool<T = unknown>(args: CallArgs): Promise<T> {
  const config = await loadConfigForRuntime();
  const serverCfg = config.servers.find((s) => s.name === args.serverName);
  if (!serverCfg)
    throw new Error(`mcp-codemode: server not configured: ${args.serverName}`);

  const pool = getOrCreatePool(args.serverName, async () => {
    const transport = await chooseTransportRuntime(config, serverCfg);
    const client = new Client({
      name: config.client?.name || "mcp-codemode-runtime",
      version: config.client?.version || "0.1.0",
    });
    await client.connect(transport);
    return { client, transport };
  });

  const resource = await pool.acquire();
  try {
    const res = await resource.client.callTool({
      name: args.toolName,
      arguments: args.input as Record<string, unknown>,
    });

    // Apply compaction if configured
    // Only compact results that have content (not toolResult variant)
    if (config.compaction && "content" in res) {
      try {
        const compactionResult = await compactIfNeeded(
          res as { content: unknown[]; isError?: boolean },
          config.compaction,
          {
            serverName: args.serverName,
            toolName: args.toolName,
          }
        );

        // Optional debug logging
        if (
          compactionResult.compacted &&
          process.env["MCP_CODEMODE_DEBUG"] === "true"
        ) {
          const reduction = Math.round(
            (1 -
              compactionResult.compactedSize / compactionResult.originalSize) *
              100
          );
          console.error(
            `[mcp-codemode] Compacted ${args.toolName}: ${compactionResult.originalSize} → ${compactionResult.compactedSize} bytes (${reduction}% reduction)`
          );
        }

        return compactionResult.result as unknown as T;
      } catch (compactionError) {
        // Graceful fallback if compaction fails
        if (process.env["MCP_CODEMODE_DEBUG"] === "true") {
          console.error(`[mcp-codemode] Compaction failed:`, compactionError);
        }
        return res as unknown as T;
      }
    }

    return res as unknown as T;
  } finally {
    pool.release(resource);
  }
}

async function loadConfigForRuntime(): Promise<CodemodeConfig> {
  const explicit = process.env["MCP_CODEMODE_CONFIG"];
  // Use cosmiconfig's auto-search when no explicit config is provided
  return await loadCodemodeConfig(explicit || undefined);
}

async function chooseTransportRuntime(
  config: CodemodeConfig,
  serverCfg: CodemodeConfig["servers"][number]
) {
  if (serverCfg.transport.type === "http") {
    const authResult = resolveAuth(serverCfg.transport.auth);
    const headers: Record<string, string> = {};

    if (authResult.status === "resolved") {
      headers["Authorization"] = `Bearer ${authResult.token}`;
    }

    return new StreamableHTTPClientTransport(new URL(serverCfg.transport.url), {
      requestInit: { headers },
    });
  }

  if (serverCfg.transport.type === "stdio") {
    if (!config.security.allowStdioExec) {
      throw new Error(
        `mcp-codemode: stdio disabled (security.allowStdioExec=false) for ${serverCfg.name}`
      );
    }
    const stdioTransport = serverCfg.transport;

    // Resolve auth token and pass via env vars
    const authResult = resolveAuth(serverCfg.transport.auth);
    const authEnv: Record<string, string> = {};

    if (
      authResult.status === "resolved" &&
      serverCfg.transport.auth?.type === "bearer"
    ) {
      // Pass token via the same env var name the server expects
      authEnv[serverCfg.transport.auth.tokenEnv] = authResult.token;
    }

    const env = buildStdioEnv({
      allowlist: config.security.envAllowlist,
      baseEnv: process.env,
      transportEnv: { ...stdioTransport.env, ...authEnv },
    });
    return new StdioClientTransport({
      command: serverCfg.transport.command,
      args: serverCfg.transport.args ?? [],
      env,
      // Suppress stderr from child process to keep UI clean
      stderr: "ignore",
    });
  }

  throw new Error(`mcp-codemode: unknown transport type for ${serverCfg.name}`);
}

// Graceful shutdown handlers
let shutdownRegistered = false;
function registerShutdownHandlers() {
  if (shutdownRegistered) return;
  shutdownRegistered = true;

  const shutdown = async () => {
    await closeAllPools();
    process.exit(0);
  };

  process.on("beforeExit", closeAllPools);
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

// Register shutdown handlers on module load
registerShutdownHandlers();

// Export types for users
export type { CodemodeConfig, CodemodeServerConfig } from "./config.js";

// Export shared utilities used by CLI
export { defaultConfigPath, defaultOutDir, resolveFromCwd } from "./paths.js";
export {
  loadCodemodeConfig,
  loadCodemodeConfigWithPath,
  fileExists,
  clearConfigCache,
} from "./loadConfig.js";
export { buildStdioEnv } from "./env.js";

// Export auth utilities
export { resolveAuth, isAuthError, loadEnvFiles } from "./auth/index.js";
export type { AuthConfig, AuthResult } from "./auth/index.js";

// Export connection pool control methods
export {
  closePool as closeConnection,
  closeAllPools as closeAllConnections,
  getPoolStats,
} from "./connectionPool.js";
