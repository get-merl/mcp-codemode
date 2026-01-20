# @merl-ai/mcp-toolbox-benchmark

Context metrics benchmarking for MCP tool definitions. This package provides comprehensive testing tools to measure token usage, cost, and accuracy when using different tool definition strategies.

## Installation

```bash
pnpm install
pnpm build
```

## Usage

### CLI Commands

```bash
# Run tool selection accuracy tests (compare baseline vs toolbox)
pnpm benchmark tool-selection-accuracy

# Run token scaling tests with custom tool counts
pnpm benchmark token-scaling --tool-counts 30,50,100,500

# Run filtering impact tests
pnpm benchmark filtering-impact

# Run combined tests (scaling + filtering)
pnpm benchmark combined-test --mode toolbox

# Run multi-turn growth tests
pnpm benchmark multi-turn-growth

# Run all test types
pnpm benchmark all

# Aggregate existing results
pnpm benchmark aggregate --type tool-selection-accuracy
```

### Programmatic API

```typescript
import { runSelection, runScaling } from '@merl-ai/mcp-toolbox-benchmark';

await runSelection({ runsPerTask: 3, modes: ['baseline', 'toolbox'] });
await runScaling({ toolCounts: [30, 50, 100], runsPerTask: 2 });
```

## Test Types

- **tool-selection-accuracy**: Compare tool selection accuracy between baseline (all tools) vs toolbox (task-specific tools only)
- **token-scaling**: Measure token usage growth as the number of available tools increases (30 to 20k tools)
- **filtering-impact**: Measure token reduction from filtering large tool response arrays (raw vs filtered results)
- **combined-test**: Combined test of token scaling with different tool counts + filtering impact (baseline vs toolbox)
- **multi-turn-growth**: Measure context token growth across multiple conversation turns in a workflow

## Configuration

Configuration is stored in `config/default.json`. See the config file for available options.

## Output

Results are written to `test-results/benchmarks/` at the repository root, organized by test type and timestamp.
