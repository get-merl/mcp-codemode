import type { ToolboxConfig } from "mcp-toolbox";

const config: ToolboxConfig = {
  servers: [
    {
      registryId: "io.github.Digital-Defiance/mcp-filesystem",
      channel: "latest",
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
