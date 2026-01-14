import { Command } from "commander";
import { spinner } from "@clack/prompts";
import path from "node:path";
import { defaultConfigPath, defaultOutDir, loadToolboxConfig } from "mcp-toolbox-runtime";
import { slugifyServerName } from "../lib/slug.js";
import { introspectServer } from "../introspect/introspectServer.js";
import { writeLatestSnapshot } from "../snapshot/writeSnapshot.js";

export function introspectCommand() {
  const cmd = new Command("introspect")
    .description("Connect to configured MCP servers and snapshot tools/list")
    .option("--config <path>", "Path to config file", defaultConfigPath())
    .option("--outDir <path>", "Output directory (default: toolbox)", defaultOutDir())
    .option("--server <name>", "Only introspect a single server (name)")
    .action(async (opts) => {
      const config = await loadToolboxConfig(opts.config);
      // Resolve outDir relative to config file location if using config's outDir
      const configDir = path.dirname(path.resolve(opts.config));
      const outDir = opts.outDir 
        ? path.resolve(process.cwd(), opts.outDir)
        : config.generation?.outDir 
          ? path.resolve(configDir, config.generation.outDir)
          : defaultOutDir();
      const target = opts.server as string | undefined;

      const servers = config.servers.filter((s) => (target ? s.name === target : true));

      for (const serverConfig of servers) {
        const s = spinner();
        s.start(`Introspecting ${serverConfig.name}…`);
        const introspected = await introspectServer({
          serverConfig,
          allowStdioExec: config.security.allowStdioExec,
        });
        const serverSlug = slugifyServerName(serverConfig.name);
        await writeLatestSnapshot({
          outDir,
          serverSlug,
          serverName: serverConfig.name,
          introspected,
        });
        s.stop(`Snapshotted ${serverConfig.name} (${introspected.tools.length} tools)`);
      }
    });

  return cmd;
}

