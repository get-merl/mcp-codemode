# E2E Tests for mcp-toolbox

This directory contains end-to-end tests that validate ideal business behaviors of the mcp-toolbox CLI.

## Structure

- `*.test.ts` - Test files organized by feature
- `fixtures/` - Mock MCP servers and test data
- `helpers/` - Test utilities and helper functions

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test tests/init.test.ts
```

## Test Philosophy

These tests validate **ideal behaviors**, not just current implementation. Tests may initially fail, revealing gaps between current and ideal behavior. The tests serve as:

- **Specification** for expected system behavior
- **Regression prevention** for user experience
- **Documentation** of system capabilities

## Test Coverage

Tests are organized by feature/command:

- ✅ `init.test.ts` - Initialization command
- ✅ `server-management.test.ts` - Add/remove server commands
- ✅ `sync.test.ts` - Core sync functionality
- ✅ `codegen.test.ts` - TypeScript code generation
- ✅ `diff.test.ts` - Diff and reporting
- ✅ `check.test.ts` - `sync --check` command
- ✅ `registry.test.ts` - Registry interaction
- ✅ `transport.test.ts` - Transport selection
- ✅ `introspect.test.ts` - Server introspection
- ✅ `runtime.test.ts` - Generated wrapper execution
- ✅ `error-handling.test.ts` - Error handling and recovery
- ✅ `integrity.test.ts` - Data integrity and atomicity
- ✅ `full-flow.test.ts` - End-to-end happy path

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
