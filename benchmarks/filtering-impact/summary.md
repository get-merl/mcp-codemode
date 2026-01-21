# Filtering Impact Benchmark Report

**Test Type:** filtering-impact
**Generated:** 1/20/2026, 10:13:03 PM
**Total Runs:** 36

---

## Executive Summary

### Overall Metrics

- **Total Test Runs:** 36
- **Total Tasks Tested:** 6
- **Average Input Tokens:** 70
- **Average Output Tokens:** 110
- **Average Total Tokens:** 180
- **Average Cost per Run:** $0.001863
- **Total Cost:** $0.067068
- **Overall Accuracy:** 0.0%

### Mode Comparison

| Mode | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |
|------|------------------|-------------------|------------------|----------|----------|
filtered | 70 | 110 | 180 | $0.001863 | 0.0%
unfiltered | 70 | 110 | 180 | $0.001863 | 0.0%

---

## Detailed Results

| Task | Mode | Runs | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |
|------|------|------|------------------|-------------------|------------------|----------|----------|
cloudflare-observability-query | filtered | 3 | 72 | 82 | 154 | $0.001446 | 0.0%
cloudflare-observability-query | unfiltered | 3 | 72 | 82 | 154 | $0.001446 | 0.0%
cloudflare-workers-list | filtered | 3 | 67 | 34 | 101 | $0.000716 | 0.0%
cloudflare-workers-list | unfiltered | 3 | 67 | 34 | 101 | $0.000716 | 0.0%
supabase-execute-sql-query | filtered | 3 | 73 | 125 | 198 | $0.002099 | 0.0%
supabase-execute-sql-query | unfiltered | 3 | 73 | 125 | 198 | $0.002099 | 0.0%
supabase-get-logs | filtered | 3 | 72 | 41 | 113 | $0.000831 | 0.0%
supabase-get-logs | unfiltered | 3 | 72 | 41 | 113 | $0.000831 | 0.0%
supabase-list-migrations | filtered | 3 | 67 | 25 | 92 | $0.000576 | 0.0%
supabase-list-migrations | unfiltered | 3 | 67 | 25 | 92 | $0.000576 | 0.0%
supabase-list-tables-large | filtered | 3 | 70 | 353 | 423 | $0.005510 | 0.0%
supabase-list-tables-large | unfiltered | 3 | 70 | 353 | 423 | $0.005510 | 0.0%

---

## Statistics by Mode

### filtered

**Token Usage:**
- Average Input: 70 tokens
- Average Output: 110 tokens
- Average Total: 180 tokens
- Min Total: 92 tokens
- Max Total: 423 tokens

**Cost:**
- Average per Run: $0.001863
- Total: $0.033534

**Accuracy:**
- Average: 0.0%
- Correct Runs: 0 / 18

### unfiltered

**Token Usage:**
- Average Input: 70 tokens
- Average Output: 110 tokens
- Average Total: 180 tokens
- Min Total: 92 tokens
- Max Total: 423 tokens

**Cost:**
- Average per Run: $0.001863
- Total: $0.033534

**Accuracy:**
- Average: 0.0%
- Correct Runs: 0 / 18

---

## Insights

### Filtering Impact

This test measures the token reduction achieved by filtering large tool response arrays.
Compare "unfiltered" vs "filtered" modes to see the savings.

---

## Test Configuration

This report was generated from the most recent test run.
For detailed per-run data, see the individual run JSON files in the run directory.

**Test Type:** filtering-impact
**Report Generated:** 2026-01-21T06:13:03.885Z