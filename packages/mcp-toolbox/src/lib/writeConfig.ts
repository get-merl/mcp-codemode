import fs from "node:fs/promises";
import path from "node:path";
import type { ToolboxConfig } from "./config.js";

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function writeToolboxConfigTs(configPath: string, config: ToolboxConfig) {
  await ensureDir(path.dirname(configPath));
  const contents = `import type { ToolboxConfig } from "mcp-toolbox";

const config: ToolboxConfig = ${JSON.stringify(config, null, 2)};

export default config;
`;
  await fs.writeFile(configPath, contents, "utf-8");
}

