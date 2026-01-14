export type ToolboxServerConfig = {
  name: string; // Required: unique identifier for this server
  transport:
    | {
        type: "stdio";
        command: string;
        args?: string[];
        env?: Record<string, string>;
      }
    | {
        type: "http";
        url: string;
        headers?: Record<string, string>;
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
