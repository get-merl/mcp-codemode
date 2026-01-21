# Token Scaling Benchmark Report

**Test Type:** token-scaling
**Generated:** 1/20/2026, 6:16:46 PM
**Total Runs:** 36

---

## Executive Summary

### Overall Metrics

- **Total Test Runs:** 36
- **Total Tasks Tested:** 3
- **Average Input Tokens:** 74
- **Average Output Tokens:** 27
- **Average Total Tokens:** 101
- **Average Cost per Run:** $0.000631
- **Total Cost:** $0.022701

### Mode Comparison

| Mode | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |
|------|------------------|-------------------|------------------|----------|----------|
baseline-100 | 74 | 25 | 99 | $0.000601 | N/A
baseline-1000 | 74 | 27 | 101 | $0.000624 | N/A
baseline-200 | 74 | 29 | 103 | $0.000659 | N/A
baseline-30 | 74 | 25 | 99 | $0.000601 | N/A
baseline-50 | 74 | 31 | 104 | $0.000681 | N/A
baseline-500 | 74 | 27 | 100 | $0.000619 | N/A

---

## Detailed Results

| Task | Mode | Runs | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |
|------|------|------|------------------|-------------------|------------------|----------|----------|
cloudflare-search-docs-workers | baseline-100 | 2 | 76 | 31 | 107 | $0.000693 | N/A
cloudflare-search-docs-workers | baseline-1000 | 2 | 76 | 33 | 109 | $0.000723 | N/A
cloudflare-search-docs-workers | baseline-200 | 2 | 76 | 31 | 107 | $0.000686 | N/A
cloudflare-search-docs-workers | baseline-30 | 2 | 76 | 31 | 107 | $0.000693 | N/A
cloudflare-search-docs-workers | baseline-50 | 2 | 76 | 35 | 111 | $0.000753 | N/A
cloudflare-search-docs-workers | baseline-500 | 2 | 76 | 30 | 106 | $0.000678 | N/A
supabase-get-project-url | baseline-100 | 2 | 73 | 18 | 91 | $0.000489 | N/A
supabase-get-project-url | baseline-1000 | 2 | 73 | 18 | 91 | $0.000489 | N/A
supabase-get-project-url | baseline-200 | 2 | 73 | 18 | 91 | $0.000489 | N/A
supabase-get-project-url | baseline-30 | 2 | 73 | 18 | 91 | $0.000489 | N/A
supabase-get-project-url | baseline-50 | 2 | 73 | 18 | 91 | $0.000489 | N/A
supabase-get-project-url | baseline-500 | 2 | 73 | 18 | 91 | $0.000489 | N/A
supabase-list-tables-public | baseline-100 | 2 | 72 | 27 | 99 | $0.000621 | N/A
supabase-list-tables-public | baseline-1000 | 2 | 72 | 30 | 102 | $0.000659 | N/A
supabase-list-tables-public | baseline-200 | 2 | 72 | 39 | 111 | $0.000801 | N/A
supabase-list-tables-public | baseline-30 | 2 | 72 | 27 | 99 | $0.000621 | N/A
supabase-list-tables-public | baseline-50 | 2 | 72 | 39 | 111 | $0.000801 | N/A
supabase-list-tables-public | baseline-500 | 2 | 72 | 32 | 104 | $0.000688 | N/A

---

## Statistics by Mode

### baseline-100

**Token Usage:**
- Average Input: 74 tokens
- Average Output: 25 tokens
- Average Total: 99 tokens
- Min Total: 91 tokens
- Max Total: 107 tokens

**Cost:**
- Average per Run: $0.000601
- Total: $0.003606

### baseline-1000

**Token Usage:**
- Average Input: 74 tokens
- Average Output: 27 tokens
- Average Total: 101 tokens
- Min Total: 91 tokens
- Max Total: 109 tokens

**Cost:**
- Average per Run: $0.000624
- Total: $0.003741

### baseline-200

**Token Usage:**
- Average Input: 74 tokens
- Average Output: 29 tokens
- Average Total: 103 tokens
- Min Total: 91 tokens
- Max Total: 111 tokens

**Cost:**
- Average per Run: $0.000659
- Total: $0.003951

### baseline-30

**Token Usage:**
- Average Input: 74 tokens
- Average Output: 25 tokens
- Average Total: 99 tokens
- Min Total: 91 tokens
- Max Total: 107 tokens

**Cost:**
- Average per Run: $0.000601
- Total: $0.003606

### baseline-50

**Token Usage:**
- Average Input: 74 tokens
- Average Output: 31 tokens
- Average Total: 104 tokens
- Min Total: 91 tokens
- Max Total: 111 tokens

**Cost:**
- Average per Run: $0.000681
- Total: $0.004086

### baseline-500

**Token Usage:**
- Average Input: 74 tokens
- Average Output: 27 tokens
- Average Total: 100 tokens
- Min Total: 91 tokens
- Max Total: 106 tokens

**Cost:**
- Average per Run: $0.000619
- Total: $0.003711

---

## Insights

### Scaling Analysis

Token usage grows as the number of available tools increases.
This test measures the relationship between tool count and context size.

---

## Test Configuration

This report was generated from the most recent test run.
For detailed per-run data, see the individual run JSON files in the run directory.

**Test Type:** token-scaling
**Report Generated:** 2026-01-21T02:16:46.703Z