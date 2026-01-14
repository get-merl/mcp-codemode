import fs from "node:fs/promises";
import path from "node:path";
import { fileExists } from "mcp-toolbox-runtime";

export async function writeAgentInstructions(
  projectRoot: string,
  toolboxDir: string
): Promise<void> {
  const agentsMdPath = path.join(projectRoot, "AGENTS.md");
  const relativeToolboxDir = path.relative(projectRoot, toolboxDir);
  const normalizedToolboxDir =
    relativeToolboxDir.startsWith("..") || path.isAbsolute(relativeToolboxDir)
      ? toolboxDir
      : relativeToolboxDir;

  const instructions = generateAgentInstructions(normalizedToolboxDir);

  const exists = await fileExists(agentsMdPath);
  if (exists) {
    // Read existing content and append new section
    const existingContent = await fs.readFile(agentsMdPath, "utf-8");
    const newContent = existingContent + "\n\n" + instructions;
    await fs.writeFile(agentsMdPath, newContent, "utf-8");
  } else {
    // Create new file
    await fs.writeFile(agentsMdPath, instructions, "utf-8");
  }
}

function generateAgentInstructions(toolboxDir: string): string {
  return `## MCP Toolbox

This repository uses \`mcp-toolbox\` to generate type-safe wrappers for MCP server tools.

### Discovering Tools

- Browse available servers: \`${toolboxDir}/servers/\`
- Search by name/description: \`${toolboxDir}/catalog.json\`
- Read tool implementations: \`${toolboxDir}/servers/{server}/tools/{tool}.ts\`

### Using Tools

Import and use the generated wrappers instead of making raw MCP tool calls. Since the toolbox generates TypeScript files, use \`tsx\` (TypeScript executor) to run them directly in your terminal session. Install with \`npx --yes tsx\` if needed.

#### Single Tool Usage

Run a tool directly using \`tsx --eval\` with an async wrapper:

\`\`\`bash
npx --yes tsx --eval "(async () => { const { getProjectUrl } = await import('${toolboxDir}/servers/supabase/tools/getProjectUrl.js'); try { const result = await getProjectUrl({}); console.log(JSON.stringify(result, null, 2)); } catch (e) { console.error('Error:', e); process.exit(1); } finally { process.exit(0); } })()"
\`\`\`

#### Multiple Operations

For multiple operations, you can chain them in the same command:

\`\`\`bash
npx --yes tsx --eval "(async () => { const { getProjectUrl, generateTypescriptTypes } = await import('${toolboxDir}/servers/supabase/index.js'); try { const url = await getProjectUrl({}); console.log('Project URL:', JSON.stringify(url, null, 2)); const types = await generateTypescriptTypes({}); console.log('\\nGenerated Types:', JSON.stringify(types, null, 2)); } catch (e) { console.error('Error:', e); process.exit(1); } finally { process.exit(0); } })()"
\`\`\`

For better readability with multiple operations, you can use a multi-line format in your shell:

\`\`\`bash
npx --yes tsx --eval "
(async () => {
  const { getProjectUrl, generateTypescriptTypes } = await import('${toolboxDir}/servers/supabase/index.js');
  try {
    const url = await getProjectUrl({});
    console.log('Project URL:', JSON.stringify(url, null, 2));
    const types = await generateTypescriptTypes({});
    console.log('\\nGenerated Types:', JSON.stringify(types, null, 2));
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})()
"
\`\`\`

**Important**: Always include \`process.exit(0)\` in the \`finally\` block to prevent the process from hanging due to open MCP client connections.

Always import specific tool functions rather than using \`callMcpTool\` directly. See \`${toolboxDir}/README.md\` for more details.`;
}
