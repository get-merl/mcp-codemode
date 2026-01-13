export type ToolboxServerConfig = {
  registryId: string;
  channel: "latest";
  overrides?: {
    run?: {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    };
    http?: {
      url: string;
      headers?: Record<string, string>;
    };
  };
};

export type ToolboxConfig = {
  servers: ToolboxServerConfig[];
  generation: {
    outDir: string;
    language: "ts";
  };
  security: {
    allowStdioExec: boolean;
    envAllowlist: string[];
  };
  cli?: {
    interactive?: boolean;
  };
};

