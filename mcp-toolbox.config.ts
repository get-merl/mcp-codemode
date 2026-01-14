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
    {
      name: "supabase",
      transport: {
        type: "stdio",
        command: "npx",
        args: [
          "-y",
          "mcp-remote",
          "https://mcp.supabase.com/mcp?project_ref=grbydozdxbgurgdpkqvv&read_only=true",
        ],
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
