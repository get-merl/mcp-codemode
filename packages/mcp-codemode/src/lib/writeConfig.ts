import fs from "node:fs/promises";
import path from "node:path";
import type { CodemodeConfig } from "@merl-ai/mcp-codemode-runtime";

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function writeCodemodeConfigJson(
  configPath: string,
  config: CodemodeConfig
) {
  await ensureDir(path.dirname(configPath));
  const contents = JSON.stringify(config, null, 2) + "\n";
  await fs.writeFile(configPath, contents, "utf-8");
}

