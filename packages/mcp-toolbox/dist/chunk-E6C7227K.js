// src/lib/paths.ts
import path from "path";
function resolveFromCwd(...parts) {
  return path.resolve(process.cwd(), ...parts);
}
function defaultConfigPath() {
  return resolveFromCwd("mcp-toolbox.config.ts");
}
function defaultOutDir() {
  return resolveFromCwd("toolbox");
}

// src/lib/loadConfig.ts
import fs from "fs/promises";
import { pathToFileURL } from "url";
import jitiFactory from "jiti";
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
async function loadToolboxConfig(configPath) {
  const jiti = jitiFactory(import.meta.url, { interopDefault: true });
  const mod = await jiti(pathToFileURL(configPath).href);
  const config = mod?.default ?? mod;
  return config;
}

// src/registry/client.ts
var RegistryClient = class {
  baseUrl;
  apiVersion;
  userAgent;
  constructor(opts = {}) {
    this.baseUrl = (opts.baseUrl ?? process.env.MCP_REGISTRY_BASE_URL ?? "https://registry.modelcontextprotocol.io").replace(
      /\/+$/,
      ""
    );
    this.apiVersion = opts.apiVersion ?? "v0.1";
    this.userAgent = opts.userAgent;
  }
  async listServers(params = {}) {
    const url = new URL(`${this.baseUrl}/${this.apiVersion}/servers`);
    for (const [k, v] of Object.entries(params)) {
      if (v === void 0) continue;
      url.searchParams.set(k, String(v));
    }
    return this.getJson(url);
  }
  async getServerVersion(args) {
    const serverName = encodeURIComponent(args.serverName);
    const version = encodeURIComponent(args.version);
    const url = new URL(
      `${this.baseUrl}/${this.apiVersion}/servers/${serverName}/versions/${version}`
    );
    return this.getJson(url);
  }
  async listServerVersions(args) {
    const serverName = encodeURIComponent(args.serverName);
    const url = new URL(
      `${this.baseUrl}/${this.apiVersion}/servers/${serverName}/versions`
    );
    return this.getJson(url);
  }
  async getJson(url) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...this.userAgent ? { "User-Agent": this.userAgent } : {}
      }
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Registry request failed (${res.status} ${res.statusText}): ${text}`);
    }
    return await res.json();
  }
};

export {
  defaultConfigPath,
  defaultOutDir,
  fileExists,
  loadToolboxConfig,
  RegistryClient
};
