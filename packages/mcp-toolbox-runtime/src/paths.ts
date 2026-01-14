import path from "node:path";
import fs from "node:fs";

export function resolveFromCwd(...parts: string[]) {
  return path.resolve(process.cwd(), ...parts);
}

export function defaultConfigPath() {
  // Walk up the directory tree to find mcp-toolbox.config.ts
  let currentDir = process.cwd();
  const root = path.parse(currentDir).root;
  
  while (currentDir !== root) {
    const configPath = path.join(currentDir, "mcp-toolbox.config.ts");
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached filesystem root
    }
    currentDir = parentDir;
  }
  
  // Fallback to cwd if not found
  return resolveFromCwd("mcp-toolbox.config.ts");
}

export function defaultOutDir() {
  return resolveFromCwd("toolbox");
}
