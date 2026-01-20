import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { progress, log } from '@clack/prompts';
import type { BenchmarkConfig } from '../types.js';
import { BaseRunner } from './base.js';
import { loadTasks } from '../lib/tools.js';
import { filterResult } from '../lib/tools.js';

export interface FilteringRunnerOptions {
  runsPerTask?: number;
}

export class FilteringRunner extends BaseRunner {
  private testConfig: NonNullable<BenchmarkConfig['tests']['filtering']>;

  constructor(config: BenchmarkConfig, outputBaseDir: string) {
    super(config, outputBaseDir);
    if (!config.tests.filtering) {
      throw new Error('Filtering test config is required');
    }
    this.testConfig = config.tests.filtering;
  }

  async run(options: FilteringRunnerOptions = {}): Promise<void> {
    const runsPerTask = options.runsPerTask ?? this.testConfig.runsPerTask;
    const tasks = loadTasks(this.testConfig.tasksFile);
    const allTools = this.loadAllTools();

    const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';

    const totalRuns = tasks.length * runsPerTask;
    const p = progress({ max: totalRuns });
    p.start('Running filtering tests...');

    // Use baseline mode (serverOnly) for filtering tests
    const mode = { name: 'baseline', toolDefinitionScope: 'serverOnly' as const };

    for (const task of tasks) {
      for (let run = 1; run <= runsPerTask; run++) {
        // Run without filtering
        const resultUnfiltered = await this.runSingleTask(task, mode, run, allTools);

        // Run with filtering if filterConfig is present
        let resultFiltered = resultUnfiltered;
        if (task.filterConfig) {
          const filteredResponse = filterResult(resultUnfiltered.response, task.filterConfig);
          resultFiltered = {
            ...resultUnfiltered,
            response: filteredResponse,
          };
        }

        // Save both results
        this.saveRunResult('filtering-impact', runId, task.id, 'unfiltered', run, resultUnfiltered);
        if (task.filterConfig) {
          this.saveRunResult('filtering-impact', runId, task.id, 'filtered', run, resultFiltered);
        }
        
        // Update message only when starting a new task
        if (run === 1) {
          p.advance(1, task.id);
        } else {
          p.advance(1);
        }
      }
    }

    p.stop('Filtering tests completed');

    // Save run metadata
    const metaDir = join(this.outputBaseDir, 'benchmarks', 'filtering-impact', runId);
    mkdirSync(metaDir, { recursive: true });
    writeFileSync(
      join(metaDir, 'run.meta.json'),
      JSON.stringify(
        {
          testType: 'filtering-impact',
          timestamp: runId,
          runsPerTask,
          tasksCount: tasks.length,
        },
        null,
        2,
      ),
    );

    log.info(`Results saved to: ${metaDir}`);
  }
}
