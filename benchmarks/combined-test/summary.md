# Combined Test Benchmark Report

**Test Type:** combined-test
**Generated:** 1/20/2026, 10:15:26 PM
**Total Runs:** 54

---

## Executive Summary

### Overall Metrics

- **Total Test Runs:** 54
- **Total Tasks Tested:** 3
- **Average Input Tokens:** 76
- **Average Output Tokens:** 102
- **Average Total Tokens:** 178
- **Average Cost per Run:** $0.001759
- **Total Cost:** $0.094983
- **Overall Accuracy:** 0.0%

### Mode Comparison

| Mode | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |
|------|------------------|-------------------|------------------|----------|----------|
baseline-100 | 76 | 55 | 131 | $0.001057 | N/A
baseline-200 | 76 | 156 | 231 | $0.002560 | N/A
baseline-30 | 76 | 147 | 222 | $0.002429 | N/A
baseline-50 | 76 | 79 | 155 | $0.001419 | N/A
baseline-500 | 76 | 63 | 138 | $0.001167 | N/A
toolbox | 76 | 113 | 189 | $0.001922 | 0.0%

---

## Detailed Results

| Task | Mode | Runs | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |
|------|------|------|------------------|-------------------|------------------|----------|----------|
cloudflare-workers-list-large | baseline-100 | 3 | 74 | 25 | 99 | $0.000602 | N/A
cloudflare-workers-list-large | baseline-200 | 3 | 74 | 22 | 96 | $0.000557 | N/A
cloudflare-workers-list-large | baseline-30 | 3 | 74 | 22 | 96 | $0.000552 | N/A
cloudflare-workers-list-large | baseline-50 | 3 | 74 | 29 | 103 | $0.000657 | N/A
cloudflare-workers-list-large | baseline-500 | 3 | 74 | 22 | 96 | $0.000552 | N/A
cloudflare-workers-list-large | toolbox | 3 | 74 | 24 | 98 | $0.000582 | 0.0%
supabase-execute-sql-query | baseline-100 | 3 | 76 | 23 | 99 | $0.000568 | N/A
supabase-execute-sql-query | baseline-200 | 3 | 76 | 28 | 104 | $0.000648 | N/A
supabase-execute-sql-query | baseline-30 | 3 | 76 | 23 | 99 | $0.000578 | N/A
supabase-execute-sql-query | baseline-50 | 3 | 76 | 23 | 99 | $0.000568 | N/A
supabase-execute-sql-query | baseline-500 | 3 | 76 | 26 | 102 | $0.000623 | N/A
supabase-execute-sql-query | toolbox | 3 | 76 | 35 | 111 | $0.000748 | 0.0%
supabase-list-tables-large | baseline-100 | 3 | 77 | 118 | 195 | $0.002001 | N/A
supabase-list-tables-large | baseline-200 | 3 | 77 | 416 | 493 | $0.006476 | N/A
supabase-list-tables-large | baseline-30 | 3 | 77 | 395 | 472 | $0.006156 | N/A
supabase-list-tables-large | baseline-50 | 3 | 77 | 187 | 264 | $0.003031 | N/A
supabase-list-tables-large | baseline-500 | 3 | 77 | 140 | 217 | $0.002326 | N/A
supabase-list-tables-large | toolbox | 3 | 77 | 280 | 357 | $0.004436 | 0.0%

---

## Statistics by Mode

### baseline-100

**Token Usage:**
- Average Input: 76 tokens
- Average Output: 55 tokens
- Average Total: 131 tokens
- Min Total: 99 tokens
- Max Total: 195 tokens

**Cost:**
- Average per Run: $0.001057
- Total: $0.009513

### baseline-200

**Token Usage:**
- Average Input: 76 tokens
- Average Output: 156 tokens
- Average Total: 231 tokens
- Min Total: 96 tokens
- Max Total: 493 tokens

**Cost:**
- Average per Run: $0.002560
- Total: $0.023043

### baseline-30

**Token Usage:**
- Average Input: 76 tokens
- Average Output: 147 tokens
- Average Total: 222 tokens
- Min Total: 96 tokens
- Max Total: 472 tokens

**Cost:**
- Average per Run: $0.002429
- Total: $0.021858

### baseline-50

**Token Usage:**
- Average Input: 76 tokens
- Average Output: 79 tokens
- Average Total: 155 tokens
- Min Total: 99 tokens
- Max Total: 264 tokens

**Cost:**
- Average per Run: $0.001419
- Total: $0.012768

### baseline-500

**Token Usage:**
- Average Input: 76 tokens
- Average Output: 63 tokens
- Average Total: 138 tokens
- Min Total: 96 tokens
- Max Total: 217 tokens

**Cost:**
- Average per Run: $0.001167
- Total: $0.010503

### toolbox

**Token Usage:**
- Average Input: 76 tokens
- Average Output: 113 tokens
- Average Total: 189 tokens
- Min Total: 98 tokens
- Max Total: 357 tokens

**Cost:**
- Average per Run: $0.001922
- Total: $0.017298

**Accuracy:**
- Average: 0.0%
- Correct Runs: 0 / 9

---

## Insights

### Combined Test Analysis

This test combines token scaling and filtering impact measurements.
It provides a comprehensive view of context optimization strategies.

---

## Test Configuration

This report was generated from the most recent test run.
For detailed per-run data, see the individual run JSON files in the run directory.

**Test Type:** combined-test
**Report Generated:** 2026-01-21T06:15:26.274Z