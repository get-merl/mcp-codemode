import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import jitiFactory from "jiti";
import type { ToolboxConfig } from "./config.js";

export async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadToolboxConfig(configPath: string): Promise<ToolboxConfig> {
  const jiti = jitiFactory(import.meta.url, { interopDefault: true });
  const mod = await jiti(pathToFileURL(configPath).href);
  const config: unknown = mod?.default ?? mod;
  return config as ToolboxConfig;
}

