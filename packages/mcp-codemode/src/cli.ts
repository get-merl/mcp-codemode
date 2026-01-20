import { Command } from "commander";
import { intro } from "@clack/prompts";
import { loadEnvFiles, findWorkspaceRoot } from "@merl-ai/mcp-codemode-runtime";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { removeCommand } from "./commands/remove.js";
import { introspectCommand } from "./commands/introspect.js";
import { syncCommand } from "./commands/sync.js";

export async function runCli(argv: string[]) {
  // Find workspace root and load env files from there
  // This ensures .env.local in the repo root is found even when running from subdirectories
  const workspaceRoot = await findWorkspaceRoot(process.cwd());
  const envDir = workspaceRoot || process.cwd();
  loadEnvFiles(envDir);

  // Suppress npm/pnpm warnings globally
  if (!process.env["npm_config_loglevel"]) {
    process.env["npm_config_loglevel"] = "error";
  }
  if (!process.env["NPM_CONFIG_LOGLEVEL"]) {
    process.env["NPM_CONFIG_LOGLEVEL"] = "error";
  }
  if (!process.env["PNPM_LOG_LEVEL"]) {
    process.env["PNPM_LOG_LEVEL"] = "error";
  }

  const program = new Command()
    .name("mcp-codemode")
    .description(
      "Generate repo-committed code wrappers for MCP servers to enable token-efficient tool use."
    )
    .version("0.0.1");

  program.hook("preAction", async () => {
    intro("mcp-codemode");
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
    // Commander throws an error with a 'code' property for controlled exits (help, version, etc.)
    // Check if this is a help/version request, which should exit with code 0
    const isHelpOrVersion =
      argv.includes("--help") ||
      argv.includes("-h") ||
      argv.includes("--version") ||
      argv.includes("-V") ||
      (error && typeof error === "object" && "code" in error && (error.code === "commander.help" || error.code === "commander.version"));

    if (isHelpOrVersion) {
      // Help and version are successful operations
      process.exitCode = 0;
      return;
    }

    // Ensure error message is a string before any operations
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message || String(error) || "Unknown error";
    } else {
      errorMessage = String(error) || "Unknown error";
    }
    // Output user-friendly error message without stack trace
    try {
      process.stderr.write(errorMessage + "\n");
    } catch (writeError) {
      // Fallback if stderr write fails
      console.error(errorMessage);
    }
    process.exitCode = 1;
  }
}
