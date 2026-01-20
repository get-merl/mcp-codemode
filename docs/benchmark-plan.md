# Comprehensive Benchmark Plan for mcp-codemode

## Overview

This plan establishes a benchmark suite to validate mcp-codemode's context efficiency claims across diverse, real-world scenarios. Based on Anthropic's article showing **98.7% token reduction** (150,000 → 2,000 tokens) and Cloudflare's code-mode blog emphasizing elimination of intermediate LLM processing cycles.

---

## 1. Story Categories (7 Categories)

| Category                  | Description                             | Key Validation Targets                                 |
| ------------------------- | --------------------------------------- | ------------------------------------------------------ |
| **Database Operations**   | Schema exploration, queries, migrations | Large result sets (10K+ rows), 50+ table introspection |
| **Document Processing**   | Transcripts, PDFs, spreadsheets         | 2-hour transcripts (~50K tokens), 10K-row spreadsheets |
| **DevOps Monitoring**     | Workers, deployments, logs              | Multi-worker observability, log aggregation            |
| **CRM & Sales**           | Contacts, deals, pipelines              | Large contact lists, pipeline analytics                |
| **Communication**         | Slack, email, notifications             | Message search, channel aggregation                    |
| **Code & Repository**     | Git, PRs, documentation                 | Multi-file search, PR analysis                         |
| **Analytics & Reporting** | Events, funnels, dashboards             | Time-series processing, aggregations                   |

---

## 2. MCP Servers to Add

### High Priority (Phase 1)

| Server               | Tool Count | Why Include                                                |
| -------------------- | ---------- | ---------------------------------------------------------- |
| **GitHub MCP**       | ~40+       | PRs, issues, code search - large payloads, complex schemas |
| **Slack MCP**        | ~25+       | Messaging, search - variable payloads                      |
| **Google Drive MCP** | ~20+       | Document processing validation                             |

### Medium Priority (Phase 2)

| Server             | Tool Count | Why Include                        |
| ------------------ | ---------- | ---------------------------------- |
| **Notion MCP**     | ~30+       | Knowledge base, block structures   |
| **Salesforce MCP** | ~50+       | Enterprise CRM, complex schemas    |
| **Linear MCP**     | ~25        | Issue tracking, project management |
| **Postgres MCP**   | ~15        | Direct DB, large result sets       |

### Extreme Scale Testing (Phase 3)

| Server                    | Tool Count | Purpose                                    |
| ------------------------- | ---------- | ------------------------------------------ |
| **Mock Enterprise Suite** | 1000+      | Synthetic server for extreme scaling tests |

---

## 3. Benchmark Scenarios

### 3.1 Single-Turn Tasks (per category)

**Database Operations:**

- `db-list-tables-simple` - Low complexity (~2K → ~500 tokens)
- `db-query-large-result` - 1000+ rows (~50K → ~2K tokens)
- `db-schema-introspection` - 50+ tables (~15K → ~1.5K tokens)
- `db-complex-join-query` - Multi-table aggregation (~8K → ~1.5K tokens)

**Document Processing:**

- `doc-transcript-process` - 2-hour meeting (~55K → ~3K tokens)
- `doc-spreadsheet-filter` - 10K rows (~40K → ~2.5K tokens)
- `doc-pdf-extract` - Structured extraction (~20K → ~2K tokens)

**DevOps Monitoring:**

- `devops-observability-query` - Worker logs (~15K → ~2K tokens)
- `devops-metrics-aggregate` - p99 latency (~20K → ~2.5K tokens)
- `devops-error-search` - Error events (~12K → ~1.8K tokens)

**Code & Repository:**

- `code-pr-analysis` - PR diff + comments (~20K → ~2.5K tokens)
- `code-search-function` - Cross-codebase (~8K → ~1.2K tokens)
- `code-commit-history` - Recent commits (~10K → ~1.5K tokens)

### 3.2 Multi-Turn Workflows

| Category | Workflow                 | Steps | Description                                                      |
| -------- | ------------------------ | ----- | ---------------------------------------------------------------- |
| Database | `db-exploration`         | 4     | List tables → examine schema → sample data → summarize           |
| Database | `db-migration-flow`      | 5     | Check migrations → list extensions → validate → apply → verify   |
| Document | `doc-meeting-pipeline`   | 4     | Fetch transcript → extract actions → create tasks → send summary |
| Document | `doc-data-import`        | 3     | Read spreadsheet → validate schema → insert to database          |
| DevOps   | `devops-incident-triage` | 5     | List workers → query errors → get metrics → analyze → document   |
| Code     | `code-pr-review`         | 5     | Get PR → analyze changes → check tests → review → approve        |
| Code     | `code-release-notes`     | 4     | List commits → categorize → generate notes → create release      |

---

## 3.3 Critical Marketing Validation Suite (Define New Workflows)

These workflows are the definitive marketing validation set. Each is designed to be
repeatable, data-backed, and easy to communicate in public claims.

### Workflow A: Database Insight Report

- **Goal:** Generate a correct summary report from large, multi-table data.
- **Steps (5):**
  1. List tables and identify relevant ones.
  2. Fetch schemas for identified tables.
  3. Sample data and compute aggregates (last 7/30/90 days).
  4. Validate aggregates against ground truth.
  5. Produce a summary report (structured output).
- **Pass/Fail Criteria:** 100% correct aggregates; report format passes schema check.
- **Marketing Claim:** “Accurate analytics summaries from large DBs with 90%+ token reduction.”

### Workflow B: Incident Triage Summary

- **Goal:** Identify top 3 root causes from logs and metrics.
- **Steps (5):**
  1. List services/workers and select target.
  2. Retrieve error logs for a fixed time window.
  3. Pull latency/error-rate metrics.
  4. Cluster errors and rank by frequency/severity.
  5. Output root cause summary + recommended actions.
- **Pass/Fail Criteria:** Top 3 causes match labeled baseline; severity ranking matches.
- **Marketing Claim:** “Faster incident triage with fewer context tokens.”

### Workflow C: Document Action Extraction

- **Goal:** Extract structured action items from large transcripts.
- **Steps (4):**
  1. Fetch full transcript.
  2. Extract action items with owners and deadlines.
  3. Validate against labeled action list.
  4. Output action list in structured JSON schema.
- **Pass/Fail Criteria:** F1 >= 0.90 vs labeled actions; schema validation passes.
- **Marketing Claim:** “Reliable extraction from 50K+ token documents.”

### Workflow D: PR Risk Summary

- **Goal:** Summarize code risk and missing tests.
- **Steps (4):**
  1. Fetch PR diff and comments.
  2. Identify risky changes (config, auth, data migration).
  3. Check for test coverage references.
  4. Produce a short review summary and test gaps.
- **Pass/Fail Criteria:** Risk categories match labeled set; test gap list >= 90% recall.
- **Marketing Claim:** “Consistent PR review summaries with reduced context usage.”

---

## 4. New Metrics to Track

### Performance Metrics

| Metric                         | Description                         |
| ------------------------------ | ----------------------------------- |
| **Time-to-First-Token (TTFT)** | Latency before first response token |
| **End-to-End Latency**         | Total request-to-response time      |
| **Tool Discovery Time**        | Catalog navigation overhead         |
| **Context Window Utilization** | % of context used                   |

### Efficiency Metrics

| Metric                        | Formula/Description                    |
| ----------------------------- | -------------------------------------- |
| **Payload Compression Ratio** | `original_size / filtered_size`        |
| **Schema Definition Density** | `total_schema_tokens / tool_count`     |
| **Turn Efficiency**           | `tasks_completed / conversation_turns` |

### Scaling Metrics

| Metric                     | Description                         |
| -------------------------- | ----------------------------------- |
| **Tool Count Breakpoint**  | Point where baseline fails/degrades |
| **Linear Scaling Factor**  | `delta_tokens / delta_tools`        |
| **Marginal Cost per Tool** | Additional cost per tool added      |

### Quality Metrics

| Metric                     | Description                        |
| -------------------------- | ---------------------------------- |
| **Hallucination Rate**     | Incorrect tool/argument generation |
| **Partial Match Accuracy** | Correct tool, imperfect arguments  |
| **Recovery Rate**          | Success after initial failure      |

---

## 4.1 Marketing Validation Protocol

This protocol turns benchmark results into publishable claims.

1. **Fixed Baseline:** Same model, prompt template, and tool versions.
2. **Fixed Fixtures:** Snapshot datasets for each workflow (frozen data).
3. **Ground Truth:** Labeled outputs or deterministic checks.
4. **Run Policy:** 3 runs per task, median reported.
5. **Reporting:** Publish both absolute outcomes and % improvements.

---

## 4.2 Fixtures, Ground Truth, and Validators

This section defines how each marketing workflow becomes repeatable and auditable.

### Fixture Requirements (all workflows)

- **Frozen inputs:** Snapshot datasets stored in repo or remote fixtures bucket.
- **Versioned schemas:** JSON Schemas for expected outputs.
- **Data scales:** Small, medium, large variants to test scaling claims.
- **Seeded randomness:** Fixed seeds for synthetic data generation.

### Ground Truth Strategies

- **Deterministic checks:** Aggregates and counts computed from fixtures.
- **Labeled outputs:** Human-labeled action items, incident causes, or risk tags.
- **Golden summaries:** Short, structured summaries for comparison.

### Validator Types

- **Schema validator:** JSON Schema compliance for output shape.
- **Exact match validator:** For deterministic numeric outputs.
- **F1/Recall validator:** For extracted lists (actions, root causes).
- **Ranking validator:** For ordered lists (top 3 causes, top risk items).

### Workflow-Specific Validation

- **Database Insight Report:** Exact match aggregates + schema validation.
- **Incident Triage Summary:** Ranked overlap >= 0.80 with labeled causes.
- **Document Action Extraction:** F1 >= 0.90 with labeled actions.
- **PR Risk Summary:** Recall >= 0.90 on labeled risk categories.

---

## 4.3 Fixture Inventory (Marketing Suite)

| Fixture                 | Size       | Source                        | Used By           | Ground Truth                        |
| ----------------------- | ---------- | ----------------------------- | ----------------- | ----------------------------------- |
| `db_sales_30d_small`    | 1K rows    | Synthetic (seeded)            | Database Insight  | Deterministic aggregates            |
| `db_sales_30d_large`    | 100K rows  | Synthetic (seeded)            | Database Insight  | Deterministic aggregates            |
| `incident_logs_weekly`  | 250K lines | Synthetic + curated templates | Incident Triage   | Labeled top causes + severity       |
| `meeting_transcript_2h` | 55K tokens | Curated transcript            | Action Extraction | Labeled action list                 |
| `pr_diff_risky`         | 5K lines   | Curated diff                  | PR Risk Summary   | Labeled risk categories + test gaps |

**Storage:** Fixtures live in `packages/mcp-codemode-benchmark/fixtures/` and are versioned
by hash. Synthetic generators store seed + parameters alongside datasets.

---

## 5. Scaling Test Matrix

### Tool Count Scaling

| Scenario        | Tools  | Expected Outcome                   |
| --------------- | ------ | ---------------------------------- |
| `scale-small`   | 30     | Both modes successful              |
| `scale-medium`  | 100    | Minor baseline degradation         |
| `scale-large`   | 500    | Significant baseline degradation   |
| `scale-xlarge`  | 1,000  | Baseline approaching limits        |
| `scale-extreme` | 2,000  | Baseline failures expected         |
| `scale-massive` | 5,000+ | Baseline unusable, codemode stable |

### Payload Size Scaling

| Scenario         | Size      | Purpose                |
| ---------------- | --------- | ---------------------- |
| `payload-small`  | 1-10KB    | Normal operations      |
| `payload-medium` | 10-100KB  | Table listings, logs   |
| `payload-large`  | 100KB-1MB | Large query results    |
| `payload-xlarge` | 1-10MB    | Full document contents |

### Multi-Turn Scaling

| Scenario   | Turns | Context Growth |
| ---------- | ----- | -------------- |
| `turns-5`  | 5     | ~3x baseline   |
| `turns-10` | 10    | ~5x baseline   |
| `turns-20` | 20    | ~10x baseline  |
| `turns-50` | 50    | ~25x baseline  |

---

## 6. Implementation Plan

### Phase 1: Foundation

1. Extend `types.ts` with new metric interfaces
2. Update `BaseRunner` for new metric collection
3. Add GitHub MCP server configuration
4. Implement Database Operations category (5 tasks, 3 workflows)

### Phase 2: Server Expansion

1. Add Slack, Google Drive, Notion servers
2. Implement Document Processing category
3. Implement Communication category
4. Add payload size scaling tests

### Phase 3: Enterprise Scale

1. Add Salesforce server
2. Create Mock Enterprise Suite (1000+ tools)
3. Implement CRM & Sales category
4. Implement extreme scaling tests (2000-10000 tools)

### Phase 4: Analytics & Reporting

1. Implement all new metrics collection
2. Create comparative analysis reports
3. Generate benchmark baselines
4. Build dashboard templates

---

## 7. File Structure Changes

```
packages/mcp-codemode-benchmark/
├── config/
│   ├── tasks/
│   │   ├── database-operations.json
│   │   ├── document-processing.json
│   │   ├── devops-monitoring.json
│   │   ├── crm-sales.json
│   │   ├── communication.json
│   │   ├── code-repository.json
│   │   └── analytics-reporting.json
│   ├── workflows/
│   │   ├── database-workflows.json
│   │   ├── document-workflows.json
│   │   ├── devops-workflows.json
│   │   └── code-workflows.json
│   ├── scaling/
│   │   ├── tool-count-scaling.json
│   │   ├── payload-scaling.json
│   │   └── multi-turn-scaling.json
│   └── servers/
│       ├── mock-github.json
│       ├── mock-slack.json
│       ├── mock-gdrive.json
│       └── mock-enterprise-suite.json  # 1000+ tools
├── src/
│   ├── metrics/
│   │   ├── performance.ts   # TTFT, latency
│   │   ├── efficiency.ts    # compression, density
│   │   └── quality.ts       # hallucination, recovery
│   ├── runners/
│   │   └── category-runner.ts  # Category-based test runner
│   └── types.ts             # Extended with new metrics
└── reports/
    └── templates/
        ├── executive-summary.md
        └── scaling-analysis.md
```

---

## 8. Critical Files to Modify

| File                                                  | Changes                     |
| ----------------------------------------------------- | --------------------------- |
| `packages/mcp-codemode-benchmark/src/types.ts`        | Add new metric interfaces   |
| `packages/mcp-codemode-benchmark/src/runners/base.ts` | Extend metric collection    |
| `packages/mcp-codemode-benchmark/src/aggregate.ts`    | Add new report formats      |
| `packages/mcp-codemode-benchmark/config/default.json` | Add new test configurations |

---

## 9. Expected Outcomes

| Scenario Type                 | Expected Token Reduction |
| ----------------------------- | ------------------------ |
| Simple queries                | 70-85%                   |
| Complex workflows             | 85-95%                   |
| Large document processing     | 95-99%                   |
| Extreme scaling (1000+ tools) | 99%+                     |

### Cost Savings Projection

| Monthly Usage | Baseline | Codemode  | Savings |
| ------------- | -------- | --------- | ------- |
| 10M tokens    | ~$30     | ~$3-5     | ~$25    |
| 100M tokens   | ~$300    | ~$30-50   | ~$250   |
| 1B tokens     | ~$3,000  | ~$300-500 | ~$2,500 |

---

## 10. Verification

1. **Run existing benchmarks** to establish baseline: `pnpm benchmark all`
2. **Add one category** (Database Operations) and verify metrics collection
3. **Test scaling scenarios** at 100, 500, 1000 tools
4. **Compare results** against Anthropic's 98.7% reduction claim
5. **Generate reports** in all formats (JSON, CSV, Markdown)

---

## References

- [Anthropic: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [Cloudflare: Code Mode Blog](https://blog.cloudflare.com/code-mode/)
