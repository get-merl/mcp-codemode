import { Command } from "commander";
import { defaultConfigPath } from "mcp-toolbox-runtime";

export function removeCommand() {
  const cmd = new Command("remove")
    .description("Remove a registry server from mcp-toolbox.config.ts")
    .argument("[registryId]", "Registry server ID")
    .option("--config <path>", "Path to config file", defaultConfigPath())
    .option("--yes", "Run non-interactively", false)
    .action(async (registryId: string | undefined, _opts) => {
      // TODO: implement interactive selection via @clack/prompts
      if (!registryId) {
        console.log(
          "remove requires a registryId for now (interactive mode not implemented yet)"
        );
        return;
      }
      console.log(`remove not implemented yet (registryId=${registryId})`);
    });

  return cmd;
}

