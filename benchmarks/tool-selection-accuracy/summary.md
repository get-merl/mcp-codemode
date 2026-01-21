# Tool Selection Accuracy Benchmark Report

**Test Type:** tool-selection-accuracy
**Generated:** 1/20/2026, 10:31:42 PM
**Total Runs:** 18

---

## Executive Summary

### Overall Metrics

- **Total Test Runs:** 18
- **Total Tasks Tested:** 3
- **Average Input Tokens:** 74
- **Average Output Tokens:** 26
- **Average Total Tokens:** 100
- **Average Cost per Run:** $0.000610
- **Total Cost:** $0.010983
- **Overall Accuracy:** 11.1%

### Mode Comparison

| Mode | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |
|------|------------------|-------------------|------------------|----------|----------|
baseline | 74 | 22 | 96 | $0.000551 | 11.1%
toolbox | 74 | 30 | 104 | $0.000669 | 11.1%

---

## Detailed Results

| Task | Mode | Runs | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |
|------|------|------|------------------|-------------------|------------------|----------|----------|
cloudflare-search-docs-workers | baseline | 3 | 76 | 32 | 108 | $0.000703 | 0.0%
cloudflare-search-docs-workers | toolbox | 3 | 76 | 32 | 108 | $0.000713 | 0.0%
supabase-get-project-url | baseline | 3 | 73 | 18 | 91 | $0.000489 | 33.3%
supabase-get-project-url | toolbox | 3 | 73 | 18 | 91 | $0.000489 | 33.3%
supabase-list-tables-public | baseline | 3 | 72 | 16 | 88 | $0.000461 | 0.0%
supabase-list-tables-public | toolbox | 3 | 72 | 39 | 111 | $0.000806 | 0.0%

---

## Statistics by Mode

### baseline

**Token Usage:**
- Average Input: 74 tokens
- Average Output: 22 tokens
- Average Total: 96 tokens
- Min Total: 88 tokens
- Max Total: 108 tokens

**Cost:**
- Average per Run: $0.000551
- Total: $0.004959

**Accuracy:**
- Average: 11.1%
- Correct Runs: 1 / 9

### toolbox

**Token Usage:**
- Average Input: 74 tokens
- Average Output: 30 tokens
- Average Total: 104 tokens
- Min Total: 91 tokens
- Max Total: 111 tokens

**Cost:**
- Average per Run: $0.000669
- Total: $0.006024

**Accuracy:**
- Average: 11.1%
- Correct Runs: 1 / 9

---

## Insights

### Baseline vs Toolbox Comparison

📊 **Accuracy:** Both modes perform similarly (11.1% vs 11.1%)

---

## Test Configuration

This report was generated from the most recent test run.
For detailed per-run data, see the individual run JSON files in the run directory.

**Test Type:** tool-selection-accuracy
**Report Generated:** 2026-01-21T06:31:42.963Z