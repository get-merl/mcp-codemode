import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  BenchmarkConfig,
  RunResult,
  TokenUsage,
  Task,
} from '../types.js';
import {
  callProvider,
  calculateCost,
  formatTimestamp,
  extractJson,
} from '../lib/index.js';
import { buildToolSet, toolsToOpenAIFormat, filterResult } from '../lib/tools.js';
import { loadSnapshotTools } from '../lib/tools.js';

export abstract class BaseRunner {
  protected config: BenchmarkConfig;
  protected outputBaseDir: string;

  constructor(config: BenchmarkConfig, outputBaseDir: string) {
    this.config = config;
    this.outputBaseDir = outputBaseDir;
  }

  protected async runSingleTask(
    task: Task,
    mode: { name: string; toolDefinitionScope: 'serverOnly' | 'taskToolsOnly' },
    runNumber: number,
    allTools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>,
  ): Promise<RunResult> {
    const toolSet = buildToolSet(allTools, mode.toolDefinitionScope, task.toolNames);
    const tools = toolsToOpenAIFormat(toolSet);

    const systemPrompt =
      this.config.prompt?.system ||
      'You are a tool-using assistant. Available tools are listed below. When you respond, output only a JSON object with keys tool_name and arguments. Do not include any extra text.';

    const userPrompt = `${task.prompt}\n\n${
      this.config.prompt?.userSuffix ?? 'Choose the best tool for the task and provide arguments.'
    }`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const result = await callProvider({
      provider: this.config.provider,
      messages,
      tools: tools.length > 0 ? tools : undefined,
    });

    // Extract tool call from response
    let toolCall: unknown = null;
    if (this.config.provider.kind === 'openai') {
      const msg = result.response as { tool_calls?: Array<{ function: { name: string; arguments: string } }> };
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        try {
          toolCall = {
            tool_name: msg.tool_calls[0]!.function.name,
            arguments: JSON.parse(msg.tool_calls[0]!.function.arguments),
          };
        } catch {
          // Fallback to extracting JSON from content
          const content = (result.response as { content?: string })?.content || '';
          toolCall = extractJson(content);
        }
      } else {
        const content = (result.response as { content?: string })?.content || '';
        toolCall = extractJson(content);
      }
    } else {
      // Anthropic
      const content = (result.response as { content?: Array<{ type: string; text?: string }> })?.content || [];
      const textContent = content.find((c) => c.type === 'text')?.text || '';
      toolCall = extractJson(textContent);
    }

    // Check correctness
    const correct = this.checkCorrectness(toolCall, task.expectedToolCall);

    const cost = calculateCost(
      result.tokens,
      this.config.pricing.input_per_1m,
      this.config.pricing.output_per_1m,
    );

    return {
      taskId: task.id,
      mode: mode.name,
      runNumber,
      timestamp: new Date().toISOString(),
      tokens: result.tokens,
      cost,
      response: toolCall,
      correct,
    };
  }

  protected checkCorrectness(
    actual: unknown,
    expected: { tool_name: string; arguments: Record<string, unknown> },
  ): boolean {
    if (!actual || typeof actual !== 'object') return false;

    const actualObj = actual as Record<string, unknown>;
    if (actualObj['tool_name'] !== expected.tool_name) return false;

    const actualArgs = actualObj['arguments'];
    if (!actualArgs || typeof actualArgs !== 'object') return false;

    // Check that all expected arguments match
    for (const [key, value] of Object.entries(expected.arguments)) {
      if (JSON.stringify(actualArgs[key as keyof typeof actualArgs]) !== JSON.stringify(value)) {
        return false;
      }
    }

    return true;
  }

  protected saveRunResult(
    testType: string,
    runId: string,
    taskId: string,
    mode: string,
    runNumber: number,
    result: RunResult,
  ): void {
    const dir = join(
      this.outputBaseDir,
      'benchmarks',
      testType,
      runId,
      mode,
      taskId,
    );
    mkdirSync(dir, { recursive: true });
    const filePath = join(dir, `run-${runNumber}.json`);
    writeFileSync(filePath, JSON.stringify(result, null, 2));
  }

  protected loadAllTools(): Array<{
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
  }> {
    const snapshotsDir =
      this.config.snapshotsDir ?? 'toolbox/.snapshots';
    // Resolve relative to output base dir (repo root), not package directory
    const resolvedDir = snapshotsDir.startsWith('/')
      ? snapshotsDir
      : join(this.outputBaseDir, snapshotsDir);
    return loadSnapshotTools(resolvedDir);
  }

  abstract run(): Promise<void>;
}
