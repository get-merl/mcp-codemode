import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { progress, log } from '@clack/prompts';
import type { BenchmarkConfig } from '../types.js';
import { BaseRunner } from './base.js';
import { loadTasks } from '../lib/tools.js';
import { loadSnapshotTools } from '../lib/tools.js';
import { buildToolSet, toolsToOpenAIFormat } from '../lib/tools.js';
import { callProvider, calculateCost } from '../lib/index.js';

export interface ScalingRunnerOptions {
  toolCounts?: number[];
  runsPerTask?: number;
  mode?: string;
}

export class ScalingRunner extends BaseRunner {
  private testConfig: NonNullable<BenchmarkConfig['tests']['scaling']>;

  constructor(config: BenchmarkConfig, outputBaseDir: string) {
    super(config, outputBaseDir);
    if (!config.tests.scaling) {
      throw new Error('Scaling test config is required');
    }
    this.testConfig = config.tests.scaling;
  }

  async run(options: ScalingRunnerOptions = {}): Promise<void> {
    const runsPerTask = options.runsPerTask ?? this.testConfig.runsPerTask;
    const toolCounts = options.toolCounts ?? this.testConfig.toolCounts;
    const tasks = loadTasks(this.testConfig.tasksFile);
    const allTools = this.loadAllTools();

    const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';

    const totalRuns = toolCounts.length * tasks.length * runsPerTask;
    const p = progress({ max: totalRuns });
    p.start('Running scaling tests...');

    for (const toolCount of toolCounts) {
      const modeName = options.mode || `baseline-${toolCount}`;
      const selectedTools = allTools.slice(0, toolCount);

      for (const task of tasks) {
        for (let run = 1; run <= runsPerTask; run++) {
          const tools = toolsToOpenAIFormat(selectedTools);
          const systemPrompt =
            this.config.prompt?.system ||
            'You are a tool-using assistant. Available tools are listed below. When you respond, output only a JSON object with keys tool_name and arguments. Do not include any extra text.';
          const userPrompt = `${task.prompt}\n\n${
            this.config.prompt?.userSuffix || 'Choose the best tool for the task and provide arguments.'
          }`;

          const result = await callProvider({
            provider: this.config.provider,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            tools: tools.length > 0 ? tools : undefined,
          });

          const cost = calculateCost(
            result.tokens,
            this.config.pricing.input_per_1m,
            this.config.pricing.output_per_1m,
          );

          const runResult = {
            taskId: task.id,
            mode: modeName,
            runNumber: run,
            timestamp: new Date().toISOString(),
            tokens: result.tokens,
            cost,
            response: result.response,
            toolCount,
          };

          this.saveRunResult('token-scaling', runId, task.id, modeName, run, runResult);
          
          // Update message only when starting a new task (first run) or use simpler message
          if (run === 1) {
            p.advance(1, `${toolCount} tools, ${task.id}`);
          } else {
            p.advance(1);
          }
        }
      }
    }

    p.stop('Scaling tests completed');

    // Save run metadata
    const metaDir = join(this.outputBaseDir, 'benchmarks', 'token-scaling', runId);
    mkdirSync(metaDir, { recursive: true });
    writeFileSync(
      join(metaDir, 'run.meta.json'),
      JSON.stringify(
        {
          testType: 'token-scaling',
          timestamp: runId,
          runsPerTask,
          tasksCount: tasks.length,
          toolCounts,
        },
        null,
        2,
      ),
    );

    log.info(`Results saved to: ${metaDir}`);
  }
}
