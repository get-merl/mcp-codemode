export type RegistryMetadata = {
  cursor?: string | null;
  next_cursor?: string | null;
  total?: number | null;
};

// Mirrors the OpenAPI shapes loosely (we keep it permissive for MVP).
export type RegistryServerJson = {
  name: string;
  description: string;
  version: string;
  title?: string;
  websiteUrl?: string;
  repository?: unknown;
  packages?: unknown;
  remotes?: Array<{ type: string; url?: string }> | null;
};

export type RegistryServerResponse = {
  _meta: unknown;
  server: RegistryServerJson;
};

export type RegistryServerListResponse = {
  metadata: RegistryMetadata;
  servers: RegistryServerResponse[] | null;
};

