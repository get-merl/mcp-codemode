import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { ToolboxConfig } from "../lib/config.js";
import { defaultConfigPath } from "../lib/paths.js";
import { loadToolboxConfig, fileExists } from "../lib/loadConfig.js";
import { RegistryClient } from "../registry/client.js";

type CallArgs = { registryId: string; toolName: string; input: unknown };

const clientCache = new Map<string, { client: Client; transport: Transport }>();

export async function callMcpTool<T = unknown>(args: CallArgs): Promise<T> {
  const config = await loadConfigForRuntime();
  const serverCfg = config.servers.find((s) => s.registryId === args.registryId);
  if (!serverCfg) throw new Error(`mcp-toolbox: server not configured: ${args.registryId}`);

  const cacheKey = args.registryId;
  let cached = clientCache.get(cacheKey);
  if (!cached) {
    const transport = await chooseTransportRuntime(config, serverCfg);
    const client = new Client({ name: "mcp-toolbox-runtime", version: "0.0.1" });
    await client.connect(transport);
    cached = { client, transport };
    clientCache.set(cacheKey, cached);
  }

  const res = await cached.client.callTool({ name: args.toolName, arguments: args.input as any } as any);
  return res as unknown as T;
}

async function loadConfigForRuntime(): Promise<ToolboxConfig> {
  const explicit = process.env["MCP_TOOLBOX_CONFIG"];
  const configPath = explicit ? explicit : defaultConfigPath();
  if (!(await fileExists(configPath))) {
    throw new Error(
      `mcp-toolbox: config not found at ${configPath}. Set MCP_TOOLBOX_CONFIG or create mcp-toolbox.config.ts`
    );
  }
  return await loadToolboxConfig(configPath);
}

async function chooseTransportRuntime(config: ToolboxConfig, serverCfg: ToolboxConfig["servers"][number]) {
  const overrideHttp = serverCfg.overrides?.http?.url;
  if (overrideHttp) return new StreamableHTTPClientTransport(new URL(overrideHttp), {});

  const overrideRun = serverCfg.overrides?.run;
  if (overrideRun) {
    if (!config.security.allowStdioExec) {
      throw new Error(
        `mcp-toolbox: stdio disabled (security.allowStdioExec=false) for ${serverCfg.registryId}`
      );
    }
    return new StdioClientTransport({
      command: overrideRun.command,
      args: overrideRun.args ?? [],
      env: overrideRun.env,
    });
  }

  const registry = new RegistryClient();
  const server = await registry.getServerVersion({ serverName: serverCfg.registryId, version: "latest" });
  const remotes: Array<{ type: string; url?: string; variables?: unknown }> = (server.server as any).remotes ?? [];
  const streamable = remotes.find((r) => r.type === "streamable-http" && r.url);
  if (streamable?.url) {
    if (streamable.variables && Object.keys(streamable.variables).length > 0) {
      throw new Error(
        `mcp-toolbox: remote transport for ${serverCfg.registryId} requires variables; set overrides.http.url`
      );
    }
    return new StreamableHTTPClientTransport(new URL(streamable.url), {});
  }

  const packages: Array<{
    registryType?: string;
    identifier?: string;
    version?: string;
    transport?: { type?: string };
    environmentVariables?: Array<{ name?: string; isRequired?: boolean }>;
  }> = (server.server as any).packages ?? [];

  const npmStdio = packages.find(
    (p) => p.registryType === "npm" && p.transport?.type === "stdio" && p.identifier
  );

  if (npmStdio?.identifier) {
    if (!config.security.allowStdioExec) {
      throw new Error(
        `mcp-toolbox: stdio disabled (security.allowStdioExec=false) for ${serverCfg.registryId}`
      );
    }

    const pkgVersion =
      npmStdio.version && npmStdio.version !== "latest"
        ? `${npmStdio.identifier}@${npmStdio.version}`
        : npmStdio.identifier;

    const env: Record<string, string> = Object.fromEntries(
      Object.entries(process.env).filter(([, v]) => typeof v === "string")
    ) as Record<string, string>;
    const requiredVars = (npmStdio.environmentVariables ?? []).filter((v) => v.isRequired && v.name);
    for (const v of requiredVars) {
      const name = String(v.name);
      if (env[name]) continue;
      if (name === "WORKSPACE_ROOT") {
        env[name] = process.cwd();
        continue;
      }
      throw new Error(`mcp-toolbox: missing required env var ${name} for ${serverCfg.registryId}`);
    }

    return new StdioClientTransport({
      command: "npx",
      args: ["-y", pkgVersion],
      env,
    });
  }

  throw new Error(
    `mcp-toolbox: no runtime transport found for ${serverCfg.registryId}. Set overrides.http.url or overrides.run`
  );
}

