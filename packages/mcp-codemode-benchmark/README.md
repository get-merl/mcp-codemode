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

### Provider Configuration

The benchmark uses the Vercel AI SDK for unified LLM access.

#### Supported Providers

- **OpenAI**: `gpt-5.2`, `gpt-4o`, etc.
- **Anthropic**: `claude-sonnet-4.5`, `claude-opus-4.5`, etc.

#### Environment Variables

```bash
# For OpenAI
export OPENAI_API_KEY=your-key-here

# For Anthropic
export ANTHROPIC_API_KEY=your-key-here
```

#### Configuration

Edit `config/default.json`:

```json
{
  "provider": {
    "kind": "openai",
    "model": "gpt-5.2",
    "apiKeyEnv": "OPENAI_API_KEY"
  }
}
```

## Output

Results are written to `test-results/benchmarks/` at the repository root, organized by test type and timestamp.

---

## Use Case Validation Benchmarks

### Overview

In addition to the core benchmarks above, this package includes **use case validation benchmarks** that test real-world scenarios with ground truth validation. These benchmarks validate the codemode approach against diverse use cases with measurable success criteria.

### Quick Start

```bash
# Generate test fixtures (only needed once)
pnpm fixtures:generate

# Run all use case benchmarks
pnpm benchmark use-cases --report

# Run specific use case
pnpm benchmark use-cases --use-case database-insight-report

# Run by category
pnpm benchmark use-cases --category database
```

### Available Use Cases

#### Database Operations
- **database-insight-report**: Compute aggregates from 100K row dataset
  - Validator: exact_match (totalSales, avgOrderValue, topProducts)
  - Expected: 90%+ token reduction

#### DevOps Monitoring
- **incident-triage-summary**: Identify top 3 root causes from 250K logs
  - Validator: ranking (top-3 overlap >= 80%)
  - Expected: Faster incident triage

#### Document Processing
- **document-action-extraction**: Extract action items from 2-hour transcript
  - Validator: f1_recall (F1 >= 0.9)
  - Expected: Reliable extraction from 50K+ token documents

#### Code Repository
- **pr-risk-summary**: Identify security risks in PR diffs
  - Validator: f1_recall (recall >= 0.9)
  - Expected: Consistent PR review summaries

### Validators

The benchmark suite includes 4 validator types:

1. **exact_match**: Validates exact field matches
2. **f1_recall**: Computes F1 score, precision, and recall
3. **ranking**: Validates top-K overlap for ranked lists
4. **schema**: Validates structural conformance

### Fixtures

Fixtures are generated using seeded random generators for reproducibility:

```bash
pnpm fixtures:generate
```

This creates:
- **Database**: 100K row sales dataset ($50M+ in sales)
- **Incident Logs**: 250K log entries with error patterns
- **Meeting Transcript**: 2-hour transcript with action items
- **PR Diff**: Risky code changes with security implications

All fixtures include ground truth files for automated validation.

### Report Output

```
benchmarks/use-cases/
├── database-insight-report/
│   ├── run-1.json
│   ├── run-2.json
│   └── run-3.json
└── reports/
    ├── benchmark-summary.json
    └── benchmark-summary.md
```

Example report:

```markdown
# Benchmark Report

## Summary
- Total Use Cases: 4
- Passed: 3
- Failed: 1
- Pass Rate: 75.0%

## Metrics
- Average Token Reduction: 90.5%
- Average Cost Savings: $0.0042
```

### Adding New Use Cases

Edit `config/use-cases.json`:

```json
{
  "useCases": [
    {
      "id": "my-use-case",
      "name": "My Use Case",
      "category": "database",
      "fixtureId": "my_fixture",
      "groundTruthId": "my_ground_truth",
      "validator": {
        "type": "exact_match",
        "fields": ["result"]
      },
      "steps": [
        { "prompt": "Perform task", "expectedTool": "tool_name" }
      ],
      "passCriteria": { "exactMatch": true },
      "expectedOutcome": "Description"
    }
  ]
}
```

### Testing

```bash
# Test validators
npx tsx scripts/test-validators.ts

# Regenerate fixtures
pnpm fixtures:generate
```
