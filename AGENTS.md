## MCP Codemode

Type-safe wrappers for MCP server tools.

### Discover Tools

- `codemode/catalog.json` — list of all servers and tools with descriptions
- `codemode/servers/{server}/tools/{tool}.ts` — tool implementations

### Execute Tools

**Single tool call** → run directly, no script needed:

```bash
echo '{}' | npx tsx ./codemode/servers/supabase/tools/getProjectUrl.ts
echo '{"schemas": ["public"]}' | npx tsx ./codemode/servers/supabase/tools/listTables.ts
```

Output: JSON to stdout.

**Multi-tool workflow** → create script in `codemode/scripts/`:

```typescript
// codemode/scripts/my-workflow.ts
import { listTables, executeSql } from "../servers/supabase/index.js";

async function main() {
  const tables = await listTables({ schemas: ["public"] });
  for (const table of tables.tables) {
    const count = await executeSql({ sql: `SELECT COUNT(*) FROM ${table.name}` });
    console.log(`${table.name}: ${count.rows[0].count} rows`);
  }
}

main().catch(console.error);
```

Run: `npx tsx codemode/scripts/my-workflow.ts`

### Decision Tree

| Scenario                      | Action                                                                    |
| ----------------------------- | ------------------------------------------------------------------------- |
| Single tool, simple input     | `echo '{...}' \| npx tsx ./codemode/servers/{server}/tools/{tool}.ts` |
| Multiple tools, chained logic | Create script in `codemode/scripts/`                                   |
| Reusable workflow             | Create script in `codemode/scripts/`                                   |
