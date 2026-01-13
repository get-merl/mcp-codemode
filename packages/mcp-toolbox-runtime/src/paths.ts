import path from "node:path";

export function resolveFromCwd(...parts: string[]) {
  return path.resolve(process.cwd(), ...parts);
}

export function defaultConfigPath() {
  return resolveFromCwd("mcp-toolbox.config.ts");
}

export function defaultOutDir() {
  return resolveFromCwd("toolbox");
}
