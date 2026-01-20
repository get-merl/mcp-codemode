import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { progress, log } from '@clack/prompts';
import type { BenchmarkConfig } from '../types.js';
import { BaseRunner } from './base.js';
import { loadWorkflows } from '../lib/tools.js';
import { callProvider, calculateCost } from '../lib/index.js';
import { buildToolSet, toolsToOpenAIFormat } from '../lib/tools.js';

export interface WorkflowRunnerOptions {
  runsPerTask?: number;
}

export class WorkflowRunner extends BaseRunner {
  private testConfig: NonNullable<BenchmarkConfig['tests']['workflow']>;

  constructor(config: BenchmarkConfig, outputBaseDir: string) {
    super(config, outputBaseDir);
    if (!config.tests.workflow) {
      throw new Error('Workflow test config is required');
    }
    this.testConfig = config.tests.workflow;
  }

  async run(options: WorkflowRunnerOptions = {}): Promise<void> {
    const runsPerTask = options.runsPerTask ?? this.testConfig.runsPerTask;
    const workflows = loadWorkflows(this.testConfig.workflowsFile);
    const allTools = this.loadAllTools();

    const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';

    const totalRuns = workflows.length * runsPerTask;
    const p = progress({ max: totalRuns });
    p.start('Running workflow tests...');

    for (const workflow of workflows) {
      for (let run = 1; run <= runsPerTask; run++) {

        const mode = { name: 'baseline', toolDefinitionScope: 'serverOnly' as const };
        const toolSet = buildToolSet(allTools, mode.toolDefinitionScope);
        const tools = toolsToOpenAIFormat(toolSet);

        const systemPrompt =
          this.config.prompt?.system ||
          'You are a tool-using assistant. Available tools are listed below. When you respond, output only a JSON object with keys tool_name and arguments. Do not include any extra text.';

        const messages: Array<{ role: 'system' | 'user'; content: string }> = [
          { role: 'system', content: systemPrompt },
        ];

        let totalTokens = { input: 0, output: 0, total: 0 };
        let totalCost = 0;

        for (let stepIndex = 0; stepIndex < workflow.steps.length; stepIndex++) {
          const step = workflow.steps[stepIndex]!;
          messages.push({ role: 'user', content: step.prompt });

          const result = await callProvider({
            provider: this.config.provider,
            messages,
            tools: tools.length > 0 ? tools : undefined,
          });

          totalTokens.input += result.tokens.input;
          totalTokens.output += result.tokens.output;
          totalTokens.total += result.tokens.total;

          const cost = calculateCost(
            result.tokens,
            this.config.pricing.input_per_1m,
            this.config.pricing.output_per_1m,
          );
          totalCost += cost;

          // Add assistant response to messages for next step
          const assistantContent =
            this.config.provider.kind === 'openai'
              ? (result.response as { content?: string })?.content || ''
              : (result.response as { content?: Array<{ type?: string; text?: string }> })?.content
                  ?.find((c) => c.type === 'text')
                  ?.text || '';
          messages.push({ role: 'user', content: assistantContent });
        }

        const workflowResult = {
          workflowId: workflow.id,
          mode: mode.name,
          runNumber: run,
          timestamp: new Date().toISOString(),
          tokens: totalTokens,
          cost: totalCost,
          turns: workflow.steps.length,
        };

        // Save workflow result
        const dir = join(
          this.outputBaseDir,
          'benchmarks',
          'multi-turn-growth',
          runId,
          mode.name,
          workflow.id,
        );
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, `run-${run}.json`), JSON.stringify(workflowResult, null, 2));
        
        // Update message only when starting a new workflow
        if (run === 1) {
          p.advance(1, workflow.id);
        } else {
          p.advance(1);
        }
      }
    }

    p.stop('Workflow tests completed');

    // Save run metadata
    const metaDir = join(this.outputBaseDir, 'benchmarks', 'multi-turn-growth', runId);
    mkdirSync(metaDir, { recursive: true });
    writeFileSync(
      join(metaDir, 'run.meta.json'),
      JSON.stringify(
        {
          testType: 'multi-turn-growth',
          timestamp: runId,
          runsPerTask,
          workflowsCount: workflows.length,
        },
        null,
        2,
      ),
    );

    log.info(`Results saved to: ${metaDir}`);
  }
}
