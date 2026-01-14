# Manual Testing Guide: mcp-toolbox Flow

This guide walks you through testing the mcp-toolbox flow manually by running commands in your terminal.

## Prerequisites

1. Make sure the project is built:
```bash
cd /Users/shubhankarsharan/Desktop/mcp-toolbox
pnpm install
pnpm build
```

## Step-by-Step Testing Flow

### Step 1: Initialize mcp-toolbox

Create a new directory for testing and initialize the config:

```bash
# Create a test directory
mkdir -p ~/mcp-toolbox-test
cd ~/mcp-toolbox-test

# Initialize mcp-toolbox (non-interactive mode)
cd /Users/shubhankarsharan/Desktop/mcp-toolbox/packages/mcp-toolbox
node dist/bin.js init --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --outDir ~/mcp-toolbox-test/toolbox --yes

# Verify the config was created
cat ~/mcp-toolbox-test/mcp-toolbox.config.ts
```

### Step 2: Add Servers to Config

Add servers interactively or by editing the config file:

```bash
cd /Users/shubhankarsharan/Desktop/mcp-toolbox/packages/mcp-toolbox

# Interactive mode (prompts for name, transport type, and connection details)
node dist/bin.js add --config ~/mcp-toolbox-test/mcp-toolbox.config.ts

# Or manually edit the config file
# Example config:
# {
#   name: "my-server",
#   transport: {
#     type: "stdio",
#     command: "npx",
#     args: ["mcp-remote", "https://example.com/mcp"]
#   }
# }

# Verify it was added
cat ~/mcp-toolbox-test/mcp-toolbox.config.ts
```

**Note**: If you want to test stdio servers (npm packages), you'll need to update the config to allow it:
```bash
# Edit the config to set allowStdioExec: true
# Or manually edit ~/mcp-toolbox-test/mcp-toolbox.config.ts
```

### Step 4: Sync and Generate Wrappers

Run sync to introspect servers and generate TypeScript wrappers:

```bash
cd /Users/shubhankarsharan/Desktop/mcp-toolbox/packages/mcp-toolbox

# Sync all servers (non-interactive, skip formatting for faster runs)
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes --no-format

# With JSON output
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes --no-format --json | jq

# Check status only (fast, doesn't generate code)
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --check
```

### Step 5: Explore Generated Output

Check what was generated:

```bash
cd ~/mcp-toolbox-test

# View the catalog (index of all servers and tools)
cat toolbox/catalog.json | jq

# View the README
cat toolbox/README.md

# List all generated servers
ls -la toolbox/servers/

# Explore a specific server's tools
ls -la toolbox/servers/io-github-digital-defiance-mcp-filesystem/tools/

# View a generated tool wrapper
cat toolbox/servers/io-github-digital-defiance-mcp-filesystem/tools/fsAnalyzeDiskUsage.ts

# View snapshots
ls -la toolbox/.snapshots/
cat toolbox/.snapshots/io-github-digital-defiance-mcp-filesystem/latest.json | jq '.tools[] | {name, description}'
```

### Step 6: Test Multiple Servers (10-50 servers)

Add multiple servers and test:

```bash
cd /Users/shubhankarsharan/Desktop/mcp-toolbox

# Get a list of 50 servers (using helper script)
node scripts/fetch-servers.js 50 > ~/mcp-toolbox-test/50-servers.json

# Extract server IDs
jq -r '.servers[].server.name' ~/mcp-toolbox-test/50-servers.json > ~/mcp-toolbox-test/server-ids.txt

# View the list
head -20 ~/mcp-toolbox-test/server-ids.txt

# Add servers one by one (first 10 as example)
for server in $(head -10 ~/mcp-toolbox-test/server-ids.txt); do
  echo "Adding $server..."
  node dist/bin.js add "$server" --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes || echo "Failed to add $server"
  sleep 1  # Small delay to avoid rate limiting
done

# Verify servers were added
cat ~/mcp-toolbox-test/mcp-toolbox.config.ts | grep registryId

# Sync all added servers
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes --no-format

# Check results
echo "Total servers in catalog: $(jq '.servers | length' ~/mcp-toolbox-test/toolbox/catalog.json)"
```

### Step 7: Test Specific Scenarios

#### Test HTTP Servers
```bash
# Find HTTP servers in registry
node dist/bin.js registry search http --json | jq '.servers[] | select(.server.remotes != null) | .server.name'

# Add and sync an HTTP server
node dist/bin.js add <http-server-id> --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes --no-format
```

#### Test Stdio Servers (npm packages)
```bash
# First, edit config to allow stdio exec
# Set security.allowStdioExec: true in ~/mcp-toolbox-test/mcp-toolbox.config.ts

# Find stdio servers
node dist/bin.js registry show <server-id> --json | jq '.server.packages[] | select(.transport.type == "stdio")'

# Add and sync a stdio server
node dist/bin.js add <stdio-server-id> --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes --no-format
```

#### Test Server Removal
```bash
# Remove a server
node dist/bin.js remove <server-id> --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes

# Verify removal
cat ~/mcp-toolbox-test/mcp-toolbox.config.ts

# Re-sync (should regenerate without removed server)
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes --no-format
```

#### Test Idempotency
```bash
# Run sync multiple times - should produce identical results
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes --no-format
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes --no-format
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --yes --no-format

# Check that snapshots are identical
md5 toolbox/.snapshots/*/latest.json
```

#### Test Breaking Changes Detection
```bash
# Use sync --check to see if anything changed upstream
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --check

# With JSON output
node dist/bin.js sync --config ~/mcp-toolbox-test/mcp-toolbox.config.ts --check --json | jq
```

### Step 8: Inspect Individual Servers

Test introspection of a single server:

```bash
cd /Users/shubhankarsharan/Desktop/mcp-toolbox/packages/mcp-toolbox

# Introspect a server without adding to config
node dist/bin.js introspect io.github.Digital-Defiance/mcp-filesystem --json | jq

# This shows you what tools the server provides
```

### Step 9: Use Generated Code

Test that the generated TypeScript code is usable:

```bash
cd ~/mcp-toolbox-test

# Create a test script
cat > test-usage.ts << 'EOF'
import * as fsTools from "./toolbox/servers/io-github-digital-defiance-mcp-filesystem";

async function test() {
  console.log("Available tools:", Object.keys(fsTools));
  // Try calling a tool (note: this requires runtime setup)
}

test();
EOF

# Type check it
cd /Users/shubhankarsharan/Desktop/mcp-toolbox
npx tsc --noEmit ~/mcp-toolbox-test/test-usage.ts
```

### Step 10: Analyze Results

Compare different servers and see what works:

```bash
cd ~/mcp-toolbox-test

# Count tools per server
jq '.servers[] | {server: .serverSlug, toolCount: (.snapshot.tools | length)}' toolbox/catalog.json

# List all unique tool names
jq -r '.servers[].snapshot.tools[].name' toolbox/catalog.json | sort | uniq

# Find servers with most tools
jq '.servers[] | {server: .serverSlug, tools: (.snapshot.tools | length)}' toolbox/catalog.json | \
  jq -s 'sort_by(.tools) | reverse | .[0:10]'

# View diff reports (if any)
ls -la toolbox/.reports/*/
cat toolbox/.reports/*/latest*.md 2>/dev/null | head -50
```

## Quick Reference Commands

```bash
# Setup
cd ~/mcp-toolbox-test
BIN="/Users/shubhankarsharan/Desktop/mcp-toolbox/packages/mcp-toolbox/dist/bin.js"
CONFIG="$HOME/mcp-toolbox-test/mcp-toolbox.config.ts"

# Essential commands
node "$BIN" init --config "$CONFIG" --yes
node "$BIN" registry list
node "$BIN" registry search <query>
node "$BIN" registry show <server-id>
node "$BIN" add <server-id> --config "$CONFIG" --yes
node "$BIN" sync --config "$CONFIG" --yes
node "$BIN" remove <server-id> --config "$CONFIG" --yes
node "$BIN" sync --check --config "$CONFIG"
node "$BIN" introspect <server-id>

# Fetch servers in JSON format (helper script)
cd /Users/shubhankarsharan/Desktop/mcp-toolbox
node scripts/fetch-servers.js 50 > servers.json
```

## Troubleshooting

### Server fails to sync
- Check if it's an HTTP server that needs variables: `node dist/bin.js registry show <server-id> --json | jq '.server.remotes'`
- Check if it's a stdio server: `node dist/bin.js registry show <server-id> --json | jq '.server.packages'`
- Ensure `allowStdioExec: true` in config for stdio servers
- Check for required environment variables

### Rate limiting
- Add delays between registry API calls
- Use `sleep 1` between commands

### View errors
- Check sync output for error messages
- Look at snapshots to see what succeeded: `ls toolbox/.snapshots/`
- Check catalog to see which servers have tools: `jq '.servers[] | {server: .serverSlug, toolCount: (.snapshot.tools | length)}' toolbox/catalog.json`

## Testing 50 Servers (Full Flow)

```bash
#!/bin/bash
# Save as scripts/test-50-servers.sh

CONFIG="$HOME/mcp-toolbox-test/mcp-toolbox.config.ts"
BIN="/Users/shubhankarsharan/Desktop/mcp-toolbox/packages/mcp-toolbox/dist/bin.js"

# Initialize if needed
if [ ! -f "$CONFIG" ]; then
  node "$BIN" init --config "$CONFIG" --outDir "$HOME/mcp-toolbox-test/toolbox" --yes
fi

# Enable stdio exec
sed -i '' 's/"allowStdioExec": false/"allowStdioExec": true/g' "$CONFIG"

# Get 50 server IDs
node "$BIN" registry list --json | jq -r '.servers[0:50][].server.name' > /tmp/server-list.txt

# Add all servers
while IFS= read -r server; do
  echo "Adding $server..."
  node "$BIN" add "$server" --config "$CONFIG" --yes || echo "  ✗ Failed"
  sleep 0.5
done < /tmp/server-list.txt

# Sync all
echo "Syncing all servers..."
node "$BIN" sync --config "$CONFIG" --yes --no-format

# Show results
echo "Results:"
jq '.servers | length' "$HOME/mcp-toolbox-test/toolbox/catalog.json" | xargs -I {} echo "Servers with generated code: {}"
```

Run with: `bash scripts/test-50-servers.sh`

## Next Steps

1. Try different server types (HTTP, stdio, SSE)
2. Test error scenarios (invalid server IDs, network failures)
3. Test with custom overrides (environment variables, URLs)
4. Compare generated code quality across different servers
5. Test the runtime usage of generated wrappers