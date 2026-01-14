import { Command } from "commander";
import { confirm, isCancel, outro, text } from "@clack/prompts";
import path from "node:path";
import { defaultConfigPath, defaultOutDir, fileExists } from "mcp-toolbox-runtime";
import { writeToolboxConfigTs } from "../lib/writeConfig.js";

export function initCommand() {
  const cmd = new Command("init")
    .description("Initialize mcp-toolbox in the current repo")
    .option("--config <path>", "Path to config file", defaultConfigPath())
    .option("--outDir <path>", "Generated output directory", defaultOutDir())
    .option("--yes", "Run non-interactively with defaults", false);

  cmd.action(async (opts) => {
    const configPath: string = opts.config;
    const outDir: string = opts.outDir;
    const nonInteractive: boolean = Boolean(opts.yes);

    if (!nonInteractive) {
      const outDirAnswer = await text({
        message: "Where should generated wrappers be written?",
        initialValue: outDir,
      });
      if (isCancel(outDirAnswer)) return;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const outDirStr = outDirAnswer as string;

      const writeIfMissing = await confirm({
        message: `Write config file at ${configPath}?`,
        initialValue: true,
      });
      if (isCancel(writeIfMissing)) return;
      if (!writeIfMissing) {
        outro("Init cancelled.");
        return;
      }

      await maybeWriteConfig(configPath, outDirStr);
      return;
    }

    await maybeWriteConfig(configPath, outDir);
  });

  return cmd;
}

async function maybeWriteConfig(configPath: string, outDir: string) {
  if (await fileExists(configPath)) return;

  // Convert absolute path to relative path if it's under process.cwd()
  let relativeOutDir = outDir;
  const cwd = process.cwd();
  if (path.isAbsolute(outDir) && outDir.startsWith(cwd)) {
    relativeOutDir = path.relative(cwd, outDir);
    // If it's the same directory, use "."
    if (relativeOutDir === "") {
      relativeOutDir = ".";
    }
  } else if (path.isAbsolute(outDir)) {
    // If it's absolute but not under cwd, keep it as-is
    relativeOutDir = outDir;
  }

  await writeToolboxConfigTs(configPath, {
    servers: [],
    generation: { outDir: relativeOutDir, language: "ts" },
    security: { allowStdioExec: false, envAllowlist: [] },
    cli: { interactive: true },
  });
}

