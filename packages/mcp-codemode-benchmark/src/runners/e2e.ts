import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { progress, log } from '@clack/prompts';
import type { BenchmarkConfig } from '../types.js';
import { BaseRunner } from './base.js';
import { loadTasks } from '../lib/tools.js';
import { loadSnapshotTools } from '../lib/tools.js';
import { buildToolSet, toolsToOpenAIFormat } from '../lib/tools.js';
import { callProvider, calculateCost } from '../lib/index.js';

export interface E2ERunnerOptions {
  baselines?: number[];
  runsPerTask?: number;
  mode?: string;
}

export class E2ERunner extends BaseRunner {
  private testConfig: NonNullable<BenchmarkConfig['tests']['e2e']>;

  constructor(config: BenchmarkConfig, outputBaseDir: string) {
    super(config, outputBaseDir);
    if (!config.tests.e2e) {
      throw new Error('E2E test config is required');
    }
    this.testConfig = config.tests.e2e;
  }

  async run(options: E2ERunnerOptions = {}): Promise<void> {
    const runsPerTask = options.runsPerTask ?? this.testConfig.runsPerTask;
    const baselines = options.baselines ?? this.testConfig.baselines;
    const tasks = loadTasks(this.testConfig.tasksFile);
    const allTools = this.loadAllTools();

    const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';

    // Calculate total runs: baselines + toolbox mode
    const totalRuns = baselines.length * tasks.length * runsPerTask + tasks.length * runsPerTask;
    const p = progress({ max: totalRuns });
    p.start('Running e2e tests...');

    // Run baseline tests with different tool counts
    for (const baselineCount of baselines) {
      const modeName = options.mode || `baseline-${baselineCount}`;
      const selectedTools = allTools.slice(0, baselineCount);

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
            toolCount: baselineCount,
          };

          this.saveRunResult('combined-test', runId, task.id, modeName, run, runResult);
          
          // Update message only when starting a new task
          if (run === 1) {
            p.advance(1, `Baseline ${baselineCount} tools, ${task.id}`);
          } else {
            p.advance(1);
          }
        }
      }
    }

    // Run toolbox mode (taskToolsOnly)
    const toolboxMode = { name: 'toolbox', toolDefinitionScope: 'taskToolsOnly' as const };
    for (const task of tasks) {
      for (let run = 1; run <= runsPerTask; run++) {
        const result = await this.runSingleTask(task, toolboxMode, run, allTools);
        this.saveRunResult('combined-test', runId, task.id, 'toolbox', run, result);
        
        // Update message only when starting a new task
        if (run === 1) {
          p.advance(1, `Toolbox mode, ${task.id}`);
        } else {
          p.advance(1);
        }
      }
    }

    p.stop('E2E tests completed');

    // Save run metadata
    const metaDir = join(this.outputBaseDir, 'benchmarks', 'combined-test', runId);
    mkdirSync(metaDir, { recursive: true });
    writeFileSync(
      join(metaDir, 'run.meta.json'),
      JSON.stringify(
        {
          testType: 'combined-test',
          timestamp: runId,
          runsPerTask,
          tasksCount: tasks.length,
          baselines,
        },
        null,
        2,
      ),
    );

    log.info(`Results saved to: ${metaDir}`);
  }
}
