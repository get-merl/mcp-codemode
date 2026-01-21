# Multi-Turn Growth Benchmark Report

**Test Type:** multi-turn-growth
**Generated:** 1/20/2026, 10:14:06 PM
**Total Runs:** 4

---

## Executive Summary

### Overall Metrics

- **Total Test Runs:** 4
- **Total Tasks Tested:** 4
- **Average Input Tokens:** 727
- **Average Output Tokens:** 328
- **Average Total Tokens:** 1,055
- **Average Cost per Run:** $0.007097
- **Total Cost:** $0.028389

---

## Detailed Results

| Task | Mode | Runs | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |
|------|------|------|------------------|-------------------|------------------|----------|----------|
cloudflare-workers-analysis | baseline | 1 | 465 | 90 | 555 | $0.002745 | N/A
supabase-check-health | baseline | 1 | 442 | 69 | 511 | $0.002361 | N/A
supabase-explore-database | baseline | 1 | 875 | 283 | 1,158 | $0.006870 | N/A
supabase-migration-workflow | baseline | 1 | 1,126 | 869 | 1,995 | $0.016413 | N/A

---

## Statistics by Mode

### baseline

**Token Usage:**
- Average Input: 727 tokens
- Average Output: 328 tokens
- Average Total: 1,055 tokens
- Min Total: 511 tokens
- Max Total: 1,995 tokens

**Cost:**
- Average per Run: $0.007097
- Total: $0.028389

---

## Insights

### Multi-Turn Growth Analysis

This test measures how context size grows across multiple conversation turns.
Each turn adds to the conversation history, increasing token usage.

---

## Test Configuration

This report was generated from the most recent test run.
For detailed per-run data, see the individual run JSON files in the run directory.

**Test Type:** multi-turn-growth
**Report Generated:** 2026-01-21T06:14:06.295Z