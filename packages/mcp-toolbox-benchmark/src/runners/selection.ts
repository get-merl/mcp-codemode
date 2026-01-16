import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { progress, log } from '@clack/prompts';
import type { BenchmarkConfig } from '../types.js';
import { BaseRunner } from './base.js';
import { loadTasks } from '../lib/tools.js';

export interface SelectionRunnerOptions {
  runsPerTask?: number;
  modes?: string[];
}

export class SelectionRunner extends BaseRunner {
  private testConfig: NonNullable<BenchmarkConfig['tests']['selection']>;

  constructor(config: BenchmarkConfig, outputBaseDir: string) {
    super(config, outputBaseDir);
    if (!config.tests.selection) {
      throw new Error('Selection test config is required');
    }
    this.testConfig = config.tests.selection;
  }

  async run(options: SelectionRunnerOptions = {}): Promise<void> {
    const runsPerTask = options.runsPerTask ?? this.testConfig.runsPerTask;
    const tasks = loadTasks(this.testConfig.tasksFile);
    const allTools = this.loadAllTools();

    const modes = options.modes
      ? this.testConfig.modes.filter((m) => options.modes!.includes(m.name))
      : this.testConfig.modes;

    const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';

    const totalRuns = tasks.length * modes.length * runsPerTask;
    const p = progress({ max: totalRuns });
    p.start('Running selection tests...');

    for (const task of tasks) {
      for (const mode of modes) {
        for (let run = 1; run <= runsPerTask; run++) {
          const result = await this.runSingleTask(task, mode, run, allTools);
          this.saveRunResult('tool-selection-accuracy', runId, task.id, mode.name, run, result);
          
          // Update message only when starting a new task/mode combination
          if (run === 1) {
            p.advance(1, `${task.id} (${mode.name})`);
          } else {
            p.advance(1);
          }
        }
      }
    }

    p.stop('Selection tests completed');

    // Save run metadata
    const metaDir = join(this.outputBaseDir, 'benchmarks', 'tool-selection-accuracy', runId);
    mkdirSync(metaDir, { recursive: true });
    writeFileSync(
      join(metaDir, 'run.meta.json'),
      JSON.stringify(
        {
          testType: 'tool-selection-accuracy',
          timestamp: runId,
          runsPerTask,
          tasksCount: tasks.length,
          modes: modes.map((m) => m.name),
        },
        null,
        2,
      ),
    );

    log.info(`Results saved to: ${metaDir}`);
  }
}
