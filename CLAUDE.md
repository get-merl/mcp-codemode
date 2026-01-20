# CLAUDE.md

This file provides guidance for AI assistants working on the mcp-codemode project.

## Project Overview

**mcp-codemode** transforms MCP (Model Context Protocol) servers into type-safe TypeScript functions. Instead of loading tool definitions into LLM context, it generates a browsable SDK tree that agents discover on-demand.

**Core packages:**

- `@merl-ai/mcp-codemode` — CLI for code generation (`packages/mcp-codemode`)
- `@merl-ai/mcp-codemode-runtime` — Runtime library for generated code (`packages/mcp-codemode-runtime`)
- `@merl-ai/mcp-codemode-benchmark` — Context efficiency benchmarking (`packages/mcp-codemode-benchmark`)

## Quick Commands

```bash
pnpm install        # Install dependencies
pnpm build          # Build all packages (required before testing)
pnpm test           # Run tests (vitest)
pnpm typecheck      # Type check without emit
pnpm lint           # Lint with oxlint
pnpm format         # Format with oxfmt

# Run CLI locally
pnpm mcp-codemode sync
pnpm mcp-codemode add
pnpm mcp-codemode init
```

## Project Structure

```
mcp-codemode/
├── packages/
│   ├── mcp-codemode/              # CLI package
│   │   ├── src/
│   │   │   ├── bin.ts             # Entry point
│   │   │   ├── cli.ts             # Command definitions
│   │   │   ├── commands/          # init, add, remove, sync, introspect
│   │   │   ├── codegen/ts/        # TypeScript code generation
│   │   │   └── introspect/        # Server introspection
│   │   └── tests/                 # CLI tests
│   ├── mcp-codemode-runtime/      # Runtime library
│   │   ├── src/
│   │   │   ├── index.ts           # callMcpTool() - main function
│   │   │   ├── config.ts          # Zod config schema
│   │   │   ├── loadConfig.ts      # cosmiconfig loading
│   │   │   └── auth/              # Token resolution
│   │   └── tests/
│   └── mcp-codemode-benchmark/    # Benchmarking
├── codemode/                      # Generated output (committed)
│   ├── catalog.json               # Tool index for discovery
│   ├── servers/                   # Generated TypeScript wrappers
│   │   └── {server}/
│   │       ├── index.ts           # Barrel exports
│   │       └── tools/*.ts         # Individual tool functions
│   ├── scripts/                   # User workflows
│   ├── .snapshots/                # Schema snapshots
│   └── .reports/                  # Change reports
└── codemode.config.json           # Server configuration
```

## Key Files

| File                                                     | Purpose                  |
| -------------------------------------------------------- | ------------------------ |
| `packages/mcp-codemode/src/cli.ts`                       | CLI command definitions  |
| `packages/mcp-codemode/src/commands/sync.ts`             | Main sync workflow       |
| `packages/mcp-codemode/src/codegen/ts/generateServer.ts` | TypeScript generation    |
| `packages/mcp-codemode-runtime/src/index.ts`             | `callMcpTool()` function |
| `packages/mcp-codemode-runtime/src/config.ts`            | Config Zod schema        |
| `packages/mcp-codemode-runtime/src/auth/resolver.ts`     | Token resolution         |
| `codemode/catalog.json`                                  | Searchable tool index    |

## Conventions

### Naming

- **Tool files**: snake_case matching MCP tool names (`get_project_url.ts`)
- **Function names**: camelCase (`getProjectUrl`)
- **Server directories**: kebab-case (`cloudflare-observability`)

### Code Style

- ESM only (no CommonJS)
- TypeScript strict mode
- Zod for runtime validation
- Use `generic-pool` for connection pooling

### Testing

- Framework: Vitest
- Use `clearConfigCache()` between tests that modify config
- Tests create temp directories via helpers

## Generated Tool Pattern

Each generated tool file follows this structure:

```typescript
#!/usr/bin/env npx tsx
import { callMcpTool } from "@merl-ai/mcp-codemode-runtime";

// Input/output types from JSON Schema
export interface ToolNameInput {
  /* ... */
}
export interface ToolNameOutput {
  /* ... */
}

// Async function wrapper
export async function toolName(input: ToolNameInput): Promise<ToolNameOutput> {
  return callMcpTool("server-name", "tool_name", input) as Promise<ToolNameOutput>;
}

// CLI execution block (reads JSON from stdin)
if (import.meta.url === `file://${process.argv[1]}`) {
  // ... stdin handling
}
```

## Common Tasks

### Add a new CLI command

1. Create handler in `packages/mcp-codemode/src/commands/`
2. Register in `packages/mcp-codemode/src/cli.ts`
3. Add tests in `packages/mcp-codemode/tests/`

### Modify code generation

- Edit `packages/mcp-codemode/src/codegen/ts/generateServer.ts`
- Test with `packages/mcp-codemode/tests/codegen.test.ts`

### Update config schema

1. Modify Zod schema in `packages/mcp-codemode-runtime/src/config.ts`
2. Update `packages/mcp-codemode-runtime/src/auth/schema.ts` if auth-related
3. Run `pnpm typecheck` to find affected code

### Test a single package

```bash
pnpm --filter @merl-ai/mcp-codemode test
pnpm --filter @merl-ai/mcp-codemode-runtime test
```

## Debug Mode

Set `MCP_CODEMODE_DEBUG=true` for verbose logging:

```bash
MCP_CODEMODE_DEBUG=true pnpm mcp-codemode sync
```

## CI/CD

- **CI** (`ci.yml`) — Build, test, lint on PR/push
- **Sync** (`mcp-codemode-sync.yml`) — Daily schema sync from upstream
- **Release** (`release.yml`) — npm publish via Changesets

Local workflow testing:

```bash
pnpm act:ci
pnpm act:sync
```

<!-- Auto-generated by mcp-codemode - DO NOT EDIT DIRECTLY -->

## MCP Codemode

Type-safe wrappers for MCP server tools.

### Discover Tools

- `codemode/catalog.json` — list of all servers and tools with descriptions
- `codemode/servers/{server}/tools/{tool}.ts` — tool implementations

### Execute Tools

**Single tool call** → run directly, no script needed:

```bash
echo '{}' | npx tsx ./codemode/servers/supabase/tools/get_project_url.ts
echo '{"schemas": ["public"]}' | npx tsx ./codemode/servers/supabase/tools/list_tables.ts
```

Output: JSON to stdout.

**Multi-tool workflow** → create script in `codemode/scripts/`:

```typescript
// codemode/scripts/my-workflow.ts
import { listTables, executeSql } from "../servers/supabase/index.js";

async function main() {
  const tables = await listTables({ schemas: ["public"] });
  for (const table of tables.tables) {
    const count = await executeSql({ sql: \`SELECT COUNT(*) FROM \${table.name}\` });
    console.log(\`\${table.name}: \${count.rows[0].count} rows\`);
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