import fs from "node:fs/promises";
import path from "node:path";
import { cosmiconfig } from "cosmiconfig";
import { TypeScriptLoader } from "cosmiconfig-typescript-loader";
import type { CodemodeConfig } from "./config.js";
import { codemodeConfigSchema } from "./config.js";
import { loadEnvFiles } from "./auth/envLoader.js";

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const MODULE_NAME = "mcp-codemode";

const explorer = cosmiconfig(MODULE_NAME, {
  searchPlaces: [
    "package.json",
    `.${MODULE_NAME}rc`,
    `.${MODULE_NAME}rc.json`,
    `.${MODULE_NAME}rc.yaml`,
    `.${MODULE_NAME}rc.yml`,
    `${MODULE_NAME}.config.js`,
    `${MODULE_NAME}.config.cjs`,
    `${MODULE_NAME}.config.mjs`,
    `${MODULE_NAME}.config.ts`,
    `${MODULE_NAME}.config.json`,
  ],
  loaders: {
    ".ts": TypeScriptLoader(),
  },
});

/**
 * Find the workspace root by looking for monorepo indicators.
 * Returns the directory containing pnpm-workspace.yaml, lerna.json, or similar,
 * or null if not in a monorepo.
 */
async function findWorkspaceRoot(startDir: string): Promise<string | null> {
  let currentDir = path.resolve(startDir);
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    // Check for common monorepo indicators
    const pnpmWorkspace = path.join(currentDir, "pnpm-workspace.yaml");
    const lernaJson = path.join(currentDir, "lerna.json");
    const nxJson = path.join(currentDir, "nx.json");
    const turboJson = path.join(currentDir, "turbo.json");
    const rushJson = path.join(currentDir, "rush.json");

    const indicators = [pnpmWorkspace, lernaJson, nxJson, turboJson, rushJson];

    for (const indicator of indicators) {
      if (await fileExists(indicator)) {
        return currentDir;
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached filesystem root
    }
    currentDir = parentDir;
  }

  return null;
}

export async function loadCodemodeConfig(
  configPath?: string
): Promise<CodemodeConfig> {
  // Load .env files before config validation so tokenEnv values resolve
  loadEnvFiles();

  let result;
  if (configPath) {
    result = await explorer.load(configPath);
  } else {
    // Try to find workspace root first, then search from there
    // This ensures we find config files in monorepo roots even when
    // the command is run from a package subdirectory
    const workspaceRoot = await findWorkspaceRoot(process.cwd());
    const searchDir = workspaceRoot || process.cwd();
    result = await explorer.search(searchDir);
  }

  if (!result || result.isEmpty) {
    throw new Error(
      `mcp-codemode: no config found. Create mcp-codemode.config.json or run 'mcp-codemode init'`
    );
  }

  const parsed = codemodeConfigSchema.safeParse(result.config);
  if (!parsed.success) {
    const issueLines = parsed.error.issues.map((issue) => {
      const pathLabel = issue.path.length > 0 ? issue.path.join(".") : "config";
      return `- ${pathLabel}: ${issue.message}`;
    });
    throw new Error(
      `mcp-codemode: invalid config at ${result.filepath}:\n${issueLines.join(
        "\n"
      )}`
    );
  }

  return parsed.data;
}

/**
 * Load config and return both the config and the filepath it was loaded from.
 * Useful for commands that need to write back to the config file.
 */
export async function loadCodemodeConfigWithPath(
  configPath?: string
): Promise<{ config: CodemodeConfig; filepath: string }> {
  // Load .env files before config validation so tokenEnv values resolve
  loadEnvFiles();

  let result;
  if (configPath) {
    result = await explorer.load(configPath);
  } else {
    // Try to find workspace root first, then search from there
    // This ensures we find config files in monorepo roots even when
    // the command is run from a package subdirectory
    const workspaceRoot = await findWorkspaceRoot(process.cwd());
    const searchDir = workspaceRoot || process.cwd();
    result = await explorer.search(searchDir);
  }

  if (!result || result.isEmpty) {
    throw new Error(
      `mcp-codemode: no config found. Create mcp-codemode.config.json or run 'mcp-codemode init'`
    );
  }

  const parsed = codemodeConfigSchema.safeParse(result.config);
  if (!parsed.success) {
    const issueLines = parsed.error.issues.map((issue) => {
      const pathLabel = issue.path.length > 0 ? issue.path.join(".") : "config";
      return `- ${pathLabel}: ${issue.message}`;
    });
    throw new Error(
      `mcp-codemode: invalid config at ${result.filepath}:\n${issueLines.join(
        "\n"
      )}`
    );
  }

  return { config: parsed.data, filepath: result.filepath };
}

/**
 * Clear the cosmiconfig cache. Useful for tests.
 */
export function clearConfigCache(): void {
  explorer.clearCaches();
}
