# E2E Tests for mcp-toolbox

This directory contains end-to-end tests that validate ideal business behaviors of the mcp-toolbox CLI.

## Structure

- `e2e/` - End-to-end test files organized by feature
- `fixtures/` - Mock MCP servers and test data
- `helpers/` - Test utilities and helper functions

## Running Tests

```bash
# Run all e2e tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:e2e:watch

# Run specific test file
pnpm test:e2e tests/e2e/init.test.ts
```

## Test Philosophy

These tests validate **ideal behaviors**, not just current implementation. Tests may initially fail, revealing gaps between current and ideal behavior. The tests serve as:

- **Specification** for expected system behavior
- **Regression prevention** for user experience
- **Documentation** of system capabilities

## Test Coverage

### Critical Flows
- ✅ Initialization (`init` command)
- ✅ Server management (`add`/`remove` commands)
- ✅ Sync flow (core functionality)
- ✅ Code generation
- ✅ Diff and reporting
- ✅ Check flow (`sync --check`)
- ✅ Registry interaction
- ✅ Transport selection
- ✅ Introspection
- ✅ Runtime execution
- ✅ Error handling
- ✅ Data integrity
- ✅ End-to-end happy path

## Test Helpers

### File System Helpers (`helpers/fs.ts`)
- Isolated test directories
- Atomic file operations
- Directory comparison utilities

### CLI Helpers (`helpers/cli.ts`)
- Execute CLI commands programmatically
- Capture output and exit codes
- Timeout protection

### Config Helpers (`helpers/config.ts`)
- Generate test configs
- Validate config structure
- Server management utilities

### Network Helpers (`helpers/network.ts`)
- Mock registry server
- Network failure simulation
- Rate limiting simulation

## Mock MCP Server

The `fixtures/mock-server.ts` provides a mock MCP server implementation for testing:
- Supports stdio and HTTP transports
- Configurable tool definitions
- Failure simulation capabilities
- Schema versioning support

## Notes

- Tests use isolated temporary directories
- Tests can run in parallel (where safe)
- Tests validate ideal behaviors, not just current implementation
- Some tests may require network access or mocks
