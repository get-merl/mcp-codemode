# Quick Start: Test mcp-toolbox Flow

## Option 1: Automated Script (Easiest)

Run the automated script to test 50 servers:

```bash
cd /Users/shubhankarsharan/Desktop/mcp-toolbox
bash scripts/test-50-servers.sh
```

This will:

1. Initialize a test directory at `~/mcp-toolbox-test`
2. Configure servers in the config
3. Sync all servers and generate wrappers
4. Show you a summary

## Option 2: Manual Step-by-Step

Follow the detailed guide: **`docs/MANUAL_TESTING_GUIDE.md`**

Quick commands:

```bash
# 1. Setup
mkdir -p ~/mcp-toolbox-test
cd /Users/shubhankarsharan/Desktop/mcp-toolbox/packages/mcp-toolbox
node dist/bin.js init --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes

# 2. Add a server (interactive)
node dist/bin.js add --config ~/mcp-toolbox-test/mcp-toolbox.config.ts

# Or manually edit the config file to add servers with transport configuration

# 4. Sync and generate
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes

# 5. Explore results
cat ~/mcp-toolbox-test/toolbox/catalog.json | jq
ls ~/mcp-toolbox-test/toolbox/servers/
```

## Essential Commands Cheat Sheet

```bash
# Setup
node dist/bin.js init --config <path> --yes

# Server Management
node dist/bin.js add --config <path>              # Interactive: add server
node dist/bin.js remove <name> --config <path>    # Remove server by name
node dist/bin.js sync --config <path> --yes       # Sync and generate
node dist/bin.js sync --check --config <path>     # Check for changes
node dist/bin.js introspect --server <name>       # Test single server
```

## Next Steps

1. Read `docs/MANUAL_TESTING_GUIDE.md` for detailed exploration
2. Try different server types (HTTP, stdio)
3. Test error scenarios
4. Explore generated TypeScript code
5. Test using the generated wrappers in your own code

## Tips

- Use `--yes` flag to skip interactive prompts (where supported)
- Use `--no-format` to skip code formatting (faster sync)
- Check `toolbox/.snapshots/` to see raw introspection data
- View `toolbox/.reports/` for schema change diffs
