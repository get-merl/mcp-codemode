import { Command } from "commander";
import { intro, outro } from "@clack/prompts";
import { initCommand } from "./commands/init.js";
import { registryCommand } from "./commands/registry.js";
import { addCommand } from "./commands/add.js";
import { removeCommand } from "./commands/remove.js";
import { introspectCommand } from "./commands/introspect.js";
import { syncCommand } from "./commands/sync.js";

export async function runCli(argv: string[]) {
  const program = new Command()
    .name("mcp-toolbox")
    .description(
      "Generate repo-committed code wrappers for MCP servers to enable token-efficient tool use."
    )
    .version("0.0.1");

  program
    .hook("preAction", async () => {
      // Only show clack intro for interactive CLI runs. For now, always show;
      // we'll refine to check TTY and flags as we flesh out commands.
      intro("mcp-toolbox");
    })
    .hook("postAction", async () => {
      outro("Done.");
    });

  program.addCommand(initCommand());
  program.addCommand(registryCommand());
  program.addCommand(addCommand());
  program.addCommand(removeCommand());
  program.addCommand(introspectCommand());
  program.addCommand(syncCommand());

  await program.parseAsync(argv);
}

