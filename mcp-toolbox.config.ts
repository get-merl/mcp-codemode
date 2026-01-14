import type { ToolboxConfig } from "mcp-toolbox";

const config: ToolboxConfig = {
  servers: [
    {
      name: "cloudflare-observability",
      transport: {
        type: "stdio",
        command: "npx",
        args: ["mcp-remote", "https://observability.mcp.cloudflare.com/mcp"],
      },
    },
  ],
  generation: {
    outDir: "toolbox",
    language: "ts",
  },
  security: {
    allowStdioExec: true,
    envAllowlist: [],
  },
  cli: {
    interactive: true,
  },
};

export default config;
