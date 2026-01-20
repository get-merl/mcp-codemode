import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { log } from '@clack/prompts';
import type { RunResult, Summary, SummaryResult, TokenUsage } from './types.js';
import { average, calculateCost } from './lib/index.js';

export interface AggregateOptions {
  testType: string;
  outputBaseDir: string;
  config: { pricing: { input_per_1m: number; output_per_1m: number } };
}

export async function aggregateResults(options: AggregateOptions): Promise<void> {
  const { testType, outputBaseDir, config } = options;
  const testDir = join(outputBaseDir, 'benchmarks', testType);

  // Find all run directories
  const runs = readdirSync(testDir)
    .filter((item) => {
      const itemPath = join(testDir, item);
      return statSync(itemPath).isDirectory() && item.includes('T');
    })
    .sort()
    .reverse(); // Most recent first

  if (runs.length === 0) {
    log.warn(`No runs found for test type: ${testType}`);
    return;
  }

  // Aggregate the most recent run
  const latestRun = runs[0]!;
  const runDir = join(testDir, latestRun);

  log.info(`Aggregating results from: ${runDir}`);

  const summary = await aggregateRun(runDir, testType, config);

  // Save summary files
  const summaryDir = join(testDir);
  writeFileSync(join(summaryDir, 'summary.json'), JSON.stringify(summary, null, 2));

  // Generate CSV
  const csv = generateCSV(summary);
  writeFileSync(join(summaryDir, 'summary.csv'), csv);

  // Generate Markdown
  const md = generateMarkdown(summary);
  writeFileSync(join(summaryDir, 'summary.md'), md);

  log.info(`Summary saved to: ${summaryDir}`);
}

async function aggregateRun(
  runDir: string,
  testType: string,
  config: { pricing: { input_per_1m: number; output_per_1m: number } },
): Promise<Summary> {
  const results: SummaryResult[] = [];
  const modes = readdirSync(runDir).filter((item) => {
    const itemPath = join(runDir, item);
    return statSync(itemPath).isDirectory();
  });

  for (const mode of modes) {
    const modeDir = join(runDir, mode);
    const tasks = readdirSync(modeDir).filter((item) => {
      const itemPath = join(modeDir, item);
      return statSync(itemPath).isDirectory();
    });

    for (const taskId of tasks) {
      const taskDir = join(modeDir, taskId);
      const runFiles = readdirSync(taskDir)
        .filter((f) => f.startsWith('run-') && f.endsWith('.json'))
        .sort();

      const runs: RunResult[] = runFiles.map((file) => {
        const content = readFileSync(join(taskDir, file), 'utf-8');
        return JSON.parse(content) as RunResult;
      });

      if (runs.length === 0) continue;

      const inputTokens = runs.map((r) => r.tokens.input);
      const outputTokens = runs.map((r) => r.tokens.output);
      const totalTokens = runs.map((r) => r.tokens.total);
      const costs = runs.map((r) => r.cost);

      const averageTokens: TokenUsage = {
        input: average(inputTokens),
        output: average(outputTokens),
        total: average(totalTokens),
      };

      const averageCost = average(costs);
      const accuracy =
        runs.filter((r) => r.correct !== undefined).length > 0
          ? runs.filter((r) => r.correct === true).length / runs.length
          : undefined;

      results.push({
        taskId,
        mode,
        runs,
        averageTokens,
        averageCost,
        accuracy,
      });
    }
  }

  return {
    testType,
    timestamp: new Date().toISOString(),
    totalRuns: results.reduce((sum, r) => sum + r.runs.length, 0),
    results,
  };
}

function generateCSV(summary: Summary): string {
  const lines: string[] = [
    'testType,taskId,mode,runNumber,tokensInput,tokensOutput,tokensTotal,cost,correct',
  ];

  for (const result of summary.results) {
    for (const run of result.runs) {
      lines.push(
        [
          summary.testType,
          result.taskId,
          result.mode,
          run.runNumber,
          run.tokens.input,
          run.tokens.output,
          run.tokens.total,
          run.cost.toFixed(6),
          run.correct !== undefined ? (run.correct ? '1' : '0') : '',
        ].join(','),
      );
    }
  }

  return lines.join('\n');
}

function generateMarkdown(summary: Summary): string {
  const testTypeName = formatTestTypeName(summary.testType);
  const lines: string[] = [
    `# ${testTypeName} Benchmark Report`,
    '',
    `**Test Type:** ${summary.testType}`,
    `**Generated:** ${new Date(summary.timestamp).toLocaleString()}`,
    `**Total Runs:** ${summary.totalRuns}`,
    '',
    '---',
    '',
    '## Executive Summary',
    '',
  ];

  // Calculate overall statistics
  const allInputTokens = summary.results.flatMap((r) => r.runs.map((run) => run.tokens.input));
  const allOutputTokens = summary.results.flatMap((r) => r.runs.map((run) => run.tokens.output));
  const allTotalTokens = summary.results.flatMap((r) => r.runs.map((run) => run.tokens.total));
  const allCosts = summary.results.flatMap((r) => r.runs.map((run) => run.cost));
  const allAccuracies = summary.results
    .filter((r) => r.accuracy !== undefined)
    .map((r) => r.accuracy!);

  const overallAvgInput = average(allInputTokens);
  const overallAvgOutput = average(allOutputTokens);
  const overallAvgTotal = average(allTotalTokens);
  const overallAvgCost = average(allCosts);
  const overallAccuracy = allAccuracies.length > 0 ? average(allAccuracies) : undefined;
  const totalCost = allCosts.reduce((sum, cost) => sum + cost, 0);

  lines.push('### Overall Metrics');
  lines.push('');
  lines.push(`- **Total Test Runs:** ${summary.totalRuns}`);
  lines.push(`- **Total Tasks Tested:** ${new Set(summary.results.map((r) => r.taskId)).size}`);
  lines.push(`- **Average Input Tokens:** ${Math.round(overallAvgInput).toLocaleString()}`);
  lines.push(`- **Average Output Tokens:** ${Math.round(overallAvgOutput).toLocaleString()}`);
  lines.push(`- **Average Total Tokens:** ${Math.round(overallAvgTotal).toLocaleString()}`);
  lines.push(`- **Average Cost per Run:** $${overallAvgCost.toFixed(6)}`);
  lines.push(`- **Total Cost:** $${totalCost.toFixed(6)}`);
  if (overallAccuracy !== undefined) {
    lines.push(`- **Overall Accuracy:** ${(overallAccuracy * 100).toFixed(1)}%`);
  }
  lines.push('');

  // Mode comparison (if multiple modes)
  const modes = [...new Set(summary.results.map((r) => r.mode))];
  if (modes.length > 1) {
    lines.push('### Mode Comparison');
    lines.push('');
    lines.push('| Mode | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |');
    lines.push('|------|------------------|-------------------|------------------|----------|----------|');

    for (const mode of modes) {
      const modeResults = summary.results.filter((r) => r.mode === mode);
      const avgInput = average(modeResults.map((r) => r.averageTokens.input));
      const avgOutput = average(modeResults.map((r) => r.averageTokens.output));
      const avgTotal = average(modeResults.map((r) => r.averageTokens.total));
      const avgCost = average(modeResults.map((r) => r.averageCost));
      const avgAccuracy =
        modeResults.filter((r) => r.accuracy !== undefined).length > 0
          ? average(modeResults.map((r) => r.accuracy ?? 0))
          : undefined;

      const accuracyStr =
        avgAccuracy !== undefined ? `${(avgAccuracy * 100).toFixed(1)}%` : 'N/A';
      lines.push(
        [
          mode,
          Math.round(avgInput).toLocaleString(),
          Math.round(avgOutput).toLocaleString(),
          Math.round(avgTotal).toLocaleString(),
          `$${avgCost.toFixed(6)}`,
          accuracyStr,
        ].join(' | '),
      );
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Detailed Results');
  lines.push('');
  lines.push(
    '| Task | Mode | Runs | Avg Input Tokens | Avg Output Tokens | Avg Total Tokens | Avg Cost | Accuracy |',
  );
  lines.push(
    '|------|------|------|------------------|-------------------|------------------|----------|----------|',
  );

  // Group by task for better readability
  const tasks = [...new Set(summary.results.map((r) => r.taskId))];
  for (const taskId of tasks) {
    const taskResults = summary.results.filter((r) => r.taskId === taskId);
    for (const result of taskResults) {
      const accuracyStr =
        result.accuracy !== undefined ? `${(result.accuracy * 100).toFixed(1)}%` : 'N/A';
      lines.push(
        [
          result.taskId,
          result.mode,
          result.runs.length,
          Math.round(result.averageTokens.input).toLocaleString(),
          Math.round(result.averageTokens.output).toLocaleString(),
          Math.round(result.averageTokens.total).toLocaleString(),
          `$${result.averageCost.toFixed(6)}`,
          accuracyStr,
        ].join(' | '),
      );
    }
  }

  // Add per-mode statistics
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Statistics by Mode');
  lines.push('');

  for (const mode of modes) {
    const modeResults = summary.results.filter((r) => r.mode === mode);
    const avgInput = average(modeResults.map((r) => r.averageTokens.input));
    const avgOutput = average(modeResults.map((r) => r.averageTokens.output));
    const avgTotal = average(modeResults.map((r) => r.averageTokens.total));
    const minTotal = Math.min(...modeResults.map((r) => r.averageTokens.total));
    const maxTotal = Math.max(...modeResults.map((r) => r.averageTokens.total));
    const avgCost = average(modeResults.map((r) => r.averageCost));
    const totalCostForMode = modeResults.reduce(
      (sum, r) => sum + r.runs.reduce((s, run) => s + run.cost, 0),
      0,
    );
    const avgAccuracy =
      modeResults.filter((r) => r.accuracy !== undefined).length > 0
        ? average(modeResults.map((r) => r.accuracy ?? 0))
        : undefined;

    lines.push(`### ${mode}`);
    lines.push('');
    lines.push('**Token Usage:**');
    lines.push(`- Average Input: ${Math.round(avgInput).toLocaleString()} tokens`);
    lines.push(`- Average Output: ${Math.round(avgOutput).toLocaleString()} tokens`);
    lines.push(`- Average Total: ${Math.round(avgTotal).toLocaleString()} tokens`);
    lines.push(`- Min Total: ${Math.round(minTotal).toLocaleString()} tokens`);
    lines.push(`- Max Total: ${Math.round(maxTotal).toLocaleString()} tokens`);
    lines.push('');
    lines.push('**Cost:**');
    lines.push(`- Average per Run: $${avgCost.toFixed(6)}`);
    lines.push(`- Total: $${totalCostForMode.toFixed(6)}`);
    if (avgAccuracy !== undefined) {
      lines.push('');
      lines.push('**Accuracy:**');
      lines.push(`- Average: ${(avgAccuracy * 100).toFixed(1)}%`);
      const correctRuns = modeResults.reduce(
        (sum, r) => sum + r.runs.filter((run) => run.correct === true).length,
        0,
      );
      const totalRuns = modeResults.reduce((sum, r) => sum + r.runs.length, 0);
      lines.push(`- Correct Runs: ${correctRuns} / ${totalRuns}`);
    }
    lines.push('');
  }

  // Add insights section
  lines.push('---');
  lines.push('');
  lines.push('## Insights');
  lines.push('');

  if (modes.length > 1) {
    const baselineResults = summary.results.filter((r) => r.mode === 'baseline');
    const toolboxResults = summary.results.filter((r) => r.mode === 'toolbox');

    if (baselineResults.length > 0 && toolboxResults.length > 0) {
      const baselineAvgTotal = average(baselineResults.map((r) => r.averageTokens.total));
      const toolboxAvgTotal = average(toolboxResults.map((r) => r.averageTokens.total));
      const tokenReduction = ((baselineAvgTotal - toolboxAvgTotal) / baselineAvgTotal) * 100;
      const baselineCost = average(baselineResults.map((r) => r.averageCost));
      const toolboxCost = average(toolboxResults.map((r) => r.averageCost));
      const costReduction = ((baselineCost - toolboxCost) / baselineCost) * 100;

      lines.push('### Baseline vs Toolbox Comparison');
      lines.push('');
      if (tokenReduction > 0) {
        lines.push(
          `✅ **Token Reduction:** Toolbox uses ${tokenReduction.toFixed(1)}% fewer tokens than baseline`,
        );
        lines.push(
          `   - Baseline: ${Math.round(baselineAvgTotal).toLocaleString()} tokens avg`,
        );
        lines.push(`   - Toolbox: ${Math.round(toolboxAvgTotal).toLocaleString()} tokens avg`);
        lines.push('');
      }
      if (costReduction > 0) {
        lines.push(
          `💰 **Cost Reduction:** Toolbox costs ${costReduction.toFixed(1)}% less than baseline`,
        );
        lines.push(`   - Baseline: $${baselineCost.toFixed(6)} per run`);
        lines.push(`   - Toolbox: $${toolboxCost.toFixed(6)} per run`);
        lines.push('');
      }

      if (summary.testType === 'tool-selection-accuracy') {
        const baselineAccuracy = baselineResults.filter((r) => r.accuracy !== undefined).length > 0
          ? average(baselineResults.map((r) => r.accuracy ?? 0))
          : undefined;
        const toolboxAccuracy = toolboxResults.filter((r) => r.accuracy !== undefined).length > 0
          ? average(toolboxResults.map((r) => r.accuracy ?? 0))
          : undefined;

        if (baselineAccuracy !== undefined && toolboxAccuracy !== undefined) {
          const accuracyDiff = (toolboxAccuracy - baselineAccuracy) * 100;
          if (Math.abs(accuracyDiff) < 1) {
            lines.push(`📊 **Accuracy:** Both modes perform similarly (${(baselineAccuracy * 100).toFixed(1)}% vs ${(toolboxAccuracy * 100).toFixed(1)}%)`);
          } else if (accuracyDiff > 0) {
            lines.push(`📊 **Accuracy:** Toolbox performs ${accuracyDiff.toFixed(1)}% better than baseline`);
          } else {
            lines.push(`📊 **Accuracy:** Baseline performs ${Math.abs(accuracyDiff).toFixed(1)}% better than toolbox`);
          }
          lines.push('');
        }
      }
    }
  }

  // Test-specific insights
  if (summary.testType === 'token-scaling') {
    lines.push('### Scaling Analysis');
    lines.push('');
    lines.push('Token usage grows as the number of available tools increases.');
    lines.push('This test measures the relationship between tool count and context size.');
    lines.push('');
  } else if (summary.testType === 'filtering-impact') {
    lines.push('### Filtering Impact');
    lines.push('');
    lines.push('This test measures the token reduction achieved by filtering large tool response arrays.');
    lines.push('Compare "unfiltered" vs "filtered" modes to see the savings.');
    lines.push('');
  } else if (summary.testType === 'combined-test') {
    lines.push('### Combined Test Analysis');
    lines.push('');
    lines.push('This test combines token scaling and filtering impact measurements.');
    lines.push('It provides a comprehensive view of context optimization strategies.');
    lines.push('');
  } else if (summary.testType === 'multi-turn-growth') {
    lines.push('### Multi-Turn Growth Analysis');
    lines.push('');
    lines.push('This test measures how context size grows across multiple conversation turns.');
    lines.push('Each turn adds to the conversation history, increasing token usage.');
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Test Configuration');
  lines.push('');
  lines.push('This report was generated from the most recent test run.');
  lines.push('For detailed per-run data, see the individual run JSON files in the run directory.');
  lines.push('');
  lines.push(`**Test Type:** ${summary.testType}`);
  lines.push(`**Report Generated:** ${new Date(summary.timestamp).toISOString()}`);

  return lines.join('\n');
}

function formatTestTypeName(testType: string): string {
  const names: Record<string, string> = {
    'tool-selection-accuracy': 'Tool Selection Accuracy',
    'token-scaling': 'Token Scaling',
    'filtering-impact': 'Filtering Impact',
    'combined-test': 'Combined Test',
    'multi-turn-growth': 'Multi-Turn Growth',
  };
  return names[testType] || testType;
}
