## MCP Toolbox

This repository uses `mcp-toolbox` to generate type-safe wrappers for MCP server tools.

### Discovering Tools

- Browse available servers: `toolbox/servers/`
- Search by name/description: `toolbox/catalog.json`
- Read tool implementations: `toolbox/servers/{server}/tools/{tool}.ts`

### Using Tools

Import and use the generated wrappers instead of making raw MCP tool calls. Since the toolbox generates TypeScript files, use `tsx` (TypeScript executor) to run them directly in your terminal session. Install with `npx --yes tsx` if needed.

#### Single Tool Usage

Run a tool directly using `tsx --eval` with an async wrapper:

```bash
npx --yes tsx --eval "(async () => { const { getProjectUrl } = await import('toolbox/servers/supabase/tools/getProjectUrl.js'); try { const result = await getProjectUrl({}); console.log(JSON.stringify(result, null, 2)); } catch (e) { console.error('Error:', e); process.exit(1); } finally { process.exit(0); } })()"
```

#### Multiple Operations

For multiple operations, you can chain them in the same command:

```bash
npx --yes tsx --eval "(async () => { const { getProjectUrl, generateTypescriptTypes } = await import('toolbox/servers/supabase/index.js'); try { const url = await getProjectUrl({}); console.log('Project URL:', JSON.stringify(url, null, 2)); const types = await generateTypescriptTypes({}); console.log('\nGenerated Types:', JSON.stringify(types, null, 2)); } catch (e) { console.error('Error:', e); process.exit(1); } finally { process.exit(0); } })()"
```

For better readability with multiple operations, you can use a multi-line format in your shell:

```bash
npx --yes tsx --eval "
(async () => {
  const { getProjectUrl, generateTypescriptTypes } = await import('toolbox/servers/supabase/index.js');
  try {
    const url = await getProjectUrl({});
    console.log('Project URL:', JSON.stringify(url, null, 2));
    const types = await generateTypescriptTypes({});
    console.log('\nGenerated Types:', JSON.stringify(types, null, 2));
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})()
"
```

**Important**: Always include `process.exit(0)` in the `finally` block to prevent the process from hanging due to open MCP client connections.

Always import specific tool functions rather than using `callMcpTool` directly. See `toolbox/README.md` for more details.