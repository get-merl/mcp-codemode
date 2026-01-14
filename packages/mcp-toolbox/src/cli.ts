import { Command } from "commander";
import { intro, outro } from "@clack/prompts";
import { initCommand } from "./commands/init.js";
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
      intro("mcp-toolbox");
    })
    .hook("postAction", async () => {
      outro("Done.");
    });

  program.addCommand(initCommand());
  program.addCommand(addCommand());
  program.addCommand(removeCommand());
  program.addCommand(introspectCommand());
  program.addCommand(syncCommand());

  // Override Commander's default error handling to avoid stack traces
  program.exitOverride();

  try {
    await program.parseAsync(argv);
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Output user-friendly error message without stack trace
      process.stderr.write(error.message + "\n");
      process.exitCode = 1;
    } else {
      process.stderr.write(String(error) + "\n");
      process.exitCode = 1;
    }
  }
}

