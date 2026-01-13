import type {
  RegistryServerListResponse,
  RegistryServerResponse,
} from "./types.js";

export type RegistryClientOptions = {
  baseUrl?: string; // default https://registry.modelcontextprotocol.io
  apiVersion?: "v0.1";
  userAgent?: string;
};

export type ListServersParams = {
  cursor?: string;
  limit?: number;
  updated_since?: string;
  search?: string;
  version?: string; // 'latest' or exact version
};

export class RegistryClient {
  private readonly baseUrl: string;
  private readonly apiVersion: "v0.1";
  private readonly userAgent?: string;

  constructor(opts: RegistryClientOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? process.env.MCP_REGISTRY_BASE_URL ?? "https://registry.modelcontextprotocol.io").replace(
      /\/+$/,
      ""
    );
    this.apiVersion = opts.apiVersion ?? "v0.1";
    this.userAgent = opts.userAgent;
  }

  async listServers(params: ListServersParams = {}): Promise<RegistryServerListResponse> {
    const url = new URL(`${this.baseUrl}/${this.apiVersion}/servers`);
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined) continue;
      url.searchParams.set(k, String(v));
    }
    return this.getJson<RegistryServerListResponse>(url);
  }

  async getServerVersion(args: {
    serverName: string;
    version: string; // 'latest' or exact
  }): Promise<RegistryServerResponse> {
    const serverName = encodeURIComponent(args.serverName);
    const version = encodeURIComponent(args.version);
    const url = new URL(
      `${this.baseUrl}/${this.apiVersion}/servers/${serverName}/versions/${version}`
    );
    return this.getJson<RegistryServerResponse>(url);
  }

  async listServerVersions(args: { serverName: string }): Promise<RegistryServerListResponse> {
    const serverName = encodeURIComponent(args.serverName);
    const url = new URL(
      `${this.baseUrl}/${this.apiVersion}/servers/${serverName}/versions`
    );
    return this.getJson<RegistryServerListResponse>(url);
  }

  private async getJson<T>(url: URL): Promise<T> {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(this.userAgent ? { "User-Agent": this.userAgent } : {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Registry request failed (${res.status} ${res.statusText}): ${text}`);
    }

    return (await res.json()) as T;
  }
}

