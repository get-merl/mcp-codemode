import fs from "node:fs/promises";
import path from "node:path";

export async function writeToolboxReadme(outDir: string) {
  const contents = `# MCP Toolbox

This repo includes a generated integration SDK under \`./toolbox\`.

## How to discover tools

- Browse available servers: \`toolbox/servers/\`
- Search by name/description: \`toolbox/catalog.json\`

## How to use in code

Each server is a module:

\`\`\`ts
import * as github from \"./toolbox/servers/io-github-yourorg-yourserver\";
\`\`\`

Each tool is a function exported from that module. Prefer importing and calling these wrappers rather than describing raw MCP tool calls in text.

## Regenerating

\`\`\`bash
npx mcp-toolbox sync
\`\`\`
`;
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "README.md"), contents, "utf-8");
}

