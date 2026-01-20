import { Command } from "commander";
import { confirm, isCancel, log, multiselect, outro, text } from "@clack/prompts";
import fs from "node:fs/promises";
import path from "node:path";
import {
  defaultConfigPath,
  defaultOutDir,
  fileExists,
} from "@merl-ai/mcp-codemode-runtime";
import { writeCodemodeConfigJson } from "../lib/writeConfig.js";
import {
  syncLlmInstructions,
  getExistingLlmTargets,
  LLM_TARGETS,
} from "../lib/writeAgentInstructions.js";
import { writeScriptsFolder } from "../lib/writeScriptsFolder.js";

export function initCommand() {
  const cmd = new Command("init")
    .description("Initialize mcp-codemode in the current repo")
    .option("--config <path>", "Path to config file", defaultConfigPath())
    .option("--outDir <path>", "Generated output directory", defaultOutDir())
    .option("--yes", "Run non-interactively with defaults", false);

  cmd.action(async (opts) => {
    const configPath: string = opts.config;
    const outDir: string = opts.outDir;
    const nonInteractive: boolean = Boolean(opts.yes);

    // Check if config file already exists
    const configExists = await fileExists(configPath);
    let shouldOverwriteConfig = false;
    if (configExists) {
      log.info(`Config file already exists at ${configPath}`);
      if (!nonInteractive) {
        const overwrite = await confirm({
          message: `Overwrite existing config file?`,
          initialValue: false,
        });
        if (isCancel(overwrite)) {
          outro("Init cancelled.");
          return;
        }
        shouldOverwriteConfig = overwrite;
      } else {
        // Non-interactive: don't overwrite existing config
        shouldOverwriteConfig = false;
      }
    }

    if (!nonInteractive) {
      const outDirAnswer = await text({
        message: "Where should generated wrappers be written?",
        initialValue: outDir,
        validate(value) {
          if (!value || value.trim().length === 0) {
            return "Output directory is required";
          }
        },
      });
      if (isCancel(outDirAnswer)) return;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const outDirStr = outDirAnswer as string;

      // Check if output directory already exists
      const resolvedOutDir = path.resolve(outDirStr);
      const outDirExists = await directoryExists(resolvedOutDir);
      if (outDirExists) {
        log.info(`Output directory already exists at ${resolvedOutDir}`);
      }

      const written = await maybeWriteConfig(
        configPath,
        outDirStr,
        shouldOverwriteConfig
      );

      const projectRoot = path.dirname(path.resolve(configPath));

      // Ask which LLM instruction files to generate (combined step)
      const existingTargets = await getExistingLlmTargets(projectRoot);
      const selectedTargets = await multiselect({
        message: "Which LLM instruction files do you want to generate?",
        options: LLM_TARGETS.map((t) => ({
          value: t.id,
          label: t.label,
          hint: existingTargets.includes(t.id) ? `${t.hint} - update` : t.hint,
        })),
        initialValues: existingTargets.length > 0 ? existingTargets : ["claude"],
        required: false,
      });

      if (isCancel(selectedTargets)) {
        outro("Init cancelled.");
        return;
      }

      if (selectedTargets.length > 0) {
        const resolvedOutDir = path.isAbsolute(outDirStr)
          ? outDirStr
          : path.resolve(projectRoot, outDirStr);
        const result = await syncLlmInstructions(projectRoot, resolvedOutDir, selectedTargets);

        if (result.appended.length > 0) {
          log.info(`Appended to: ${result.appended.join(", ")}`);
        }
        const newFiles = result.synced.filter(f => !result.appended.includes(f));
        if (newFiles.length > 0) {
          log.info(`Created: ${newFiles.join(", ")}`);
        }
      }

      // Create scripts folder in the toolbox output directory
      const resolvedOutDirForScripts = path.isAbsolute(outDirStr)
        ? outDirStr
        : path.resolve(projectRoot, outDirStr);
      await writeScriptsFolder(resolvedOutDirForScripts);
      log.info("Created scripts folder for custom workflows");

      if (written) {
        const resolvedPath = path.resolve(configPath);
        outro(`Initialized config at ${resolvedPath}`);
      } else {
        outro("Init complete.");
      }
      return;
    }

    // Check if output directory already exists (non-interactive mode)
    const resolvedOutDir = path.resolve(outDir);
    const outDirExists = await directoryExists(resolvedOutDir);
    if (outDirExists) {
      log.info(`Output directory already exists at ${resolvedOutDir}`);
    }

    const written = await maybeWriteConfig(
      configPath,
      outDir,
      shouldOverwriteConfig
    );

    // Create scripts folder in non-interactive mode too
    const projectRoot = path.dirname(path.resolve(configPath));
    const resolvedOutDirForScripts = path.isAbsolute(outDir)
      ? outDir
      : path.resolve(projectRoot, outDir);
    await writeScriptsFolder(resolvedOutDirForScripts);
    log.info("Created scripts folder for custom workflows");

    if (written) {
      const resolvedPath = path.resolve(configPath);
      outro(`Initialized config at ${resolvedPath}`);
    } else {
      outro("Init complete.");
    }
  });

  return cmd;
}

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function maybeWriteConfig(
  configPath: string,
  outDir: string,
  overwrite: boolean = false
): Promise<boolean> {
  if ((await fileExists(configPath)) && !overwrite) return false;

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

  await writeCodemodeConfigJson(configPath, {
    servers: [],
    generation: { outDir: relativeOutDir, language: "ts" },
    security: { allowStdioExec: false, envAllowlist: ["PATH"] },
    cli: { interactive: true },
  });
  return true;
}
