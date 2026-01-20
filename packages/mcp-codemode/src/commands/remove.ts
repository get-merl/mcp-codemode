import { Command } from "commander";
import path from "node:path";
import { outro } from "@clack/prompts";
import { loadCodemodeConfigWithPath } from "@merl-ai/mcp-codemode-runtime";
import { writeCodemodeConfigJson } from "../lib/writeConfig.js";

export function removeCommand() {
  const cmd = new Command("remove")
    .description("Remove an MCP server from mcp-codemode.config.json")
    .argument("[name]", "Server name")
    .option("--config <path>", "Path to config file (auto-detected if not specified)")
    .action(async (name: string | undefined, opts) => {
      const configPathOpt: string | undefined = opts.config;
      if (!name) {
        throw new Error("Server name is required");
      }
      const { config, filepath: configPath } = await loadCodemodeConfigWithPath(configPathOpt);
      const initialLength = config.servers.length;
      config.servers = config.servers.filter((s) => s.name !== name);
      if (config.servers.length === initialLength) {
        throw new Error(`Server '${name}' not found in config`);
      }
      await writeCodemodeConfigJson(configPath, config);
      const resolvedPath = path.resolve(configPath);
      outro(`Removed server '${name}' from ${resolvedPath}`);
    });

  return cmd;
}
