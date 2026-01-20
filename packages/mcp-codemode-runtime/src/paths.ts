import path from "node:path";
import fs from "node:fs";

export function resolveFromCwd(...parts: string[]) {
  return path.resolve(process.cwd(), ...parts);
}

export function defaultConfigPath() {
  // Walk up the directory tree to find codemode.config.json
  let currentDir = process.cwd();
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const configPath = path.join(currentDir, "codemode.config.json");
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
  return resolveFromCwd("codemode.config.json");
}

export function defaultOutDir() {
  // Find project root (where config file is or would be)
  const configPath = defaultConfigPath();
  const projectRoot = path.dirname(configPath);
  return path.join(projectRoot, "codemode");
}
