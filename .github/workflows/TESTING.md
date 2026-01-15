# Testing GitHub Actions Workflows Locally

This guide explains how to test your GitHub Actions workflows locally using [`act`](https://github.com/nektos/act).

## Installation

Install `act` using one of these methods:

**macOS (Homebrew):**

```bash
brew install act
```

**Other platforms:**
See the [official installation guide](https://github.com/nektos/act#installation).

## Quick Start

1. **List available workflows:**

   ```bash
   act -l
   ```

2. **Test a specific workflow:**

   ```bash
   # Test the check workflow (simulates push event)
   act push -W .github/workflows/mcp-toolbox-check.yml

   # Test the sync workflow (simulates workflow_dispatch)
   act workflow_dispatch -W .github/workflows/mcp-toolbox-sync.yml
   ```

3. **Test a specific job:**
   ```bash
   act -j check -W .github/workflows/mcp-toolbox-check.yml
   ```

## Configuration

### Secrets

Create `.github/workflows/.secrets` (this file is gitignored) with your secrets:

```bash
cp .github/workflows/.secrets.example .github/workflows/.secrets
# Edit .github/workflows/.secrets with your actual tokens
```

Then run with secrets:

```bash
act push --secret-file .github/workflows/.secrets -W .github/workflows/mcp-toolbox-check.yml
```

Or pass secrets directly:

```bash
act push -s GITHUB_TOKEN=your_token -s NPM_TOKEN=your_npm_token
```

### Default Configuration

The `.actrc` file in the project root contains default settings:

- Uses `catthehacker/ubuntu:act-latest` runner image (includes more tools)
- Enables verbose output for debugging

## Common Commands

```bash
# List all workflows and jobs
act -l

# Run a workflow with push event (default)
act push

# Run a specific workflow file
act push -W .github/workflows/mcp-toolbox-check.yml

# Run a specific job
act -j check

# Dry run (simulate without executing)
act -n

# Run with verbose output
act -v

# Run with secrets from file
act push --secret-file .github/workflows/.secrets
```

## Limitations

⚠️ **Important Notes:**

1. **Some actions may not work locally** - Actions that require GitHub API access (like `changesets/action` for publishing) may behave differently or fail locally.

2. **Skip publishing steps** - The `release.yml` workflow includes publishing steps that should be skipped locally. You can modify workflows to check for `ACT` environment variable:

   ```yaml
   - name: Create Release PR or Publish
     if: env.ACT == null
     uses: changesets/action@v1
   ```

3. **PR creation** - The `peter-evans/create-pull-request` action in `mcp-toolbox-sync.yml` won't create actual PRs locally.

4. **Network access** - Some steps may behave differently due to network/Docker limitations.

## Testing Tips

1. **Test individual jobs** - Use `-j JOB_NAME` to test specific jobs without running the entire workflow.

2. **Use dry-run mode** - Test workflow syntax with `-n` flag before full execution.

3. **Check logs** - Use `-v` for verbose output to debug issues.

4. **Test event payloads** - For workflows triggered by specific events, you can provide custom event payloads with `-e` flag.

## Example: Testing the Check Workflow

```bash
# Full test with secrets
act push \
  --secret-file .github/workflows/.secrets \
  -W .github/workflows/mcp-toolbox-check.yml \
  -j check

# Dry run to see what would execute
act push -n -W .github/workflows/mcp-toolbox-check.yml
```

## Troubleshooting

- **Docker not running**: Make sure Docker Desktop is running
- **Image pull errors**: Try `act -P ubuntu-latest=catthehacker/ubuntu:act-latest` to use a different image
- **Permission errors**: Some actions require specific permissions that may not work locally
- **pnpm version issues**: The workflow should auto-detect from `package.json`, but you can verify with `act -l`

For more information, see the [act documentation](https://github.com/nektos/act).
