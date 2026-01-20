import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BenchmarkConfig, UseCaseBenchmark, UseCaseBenchmarkResult } from '../types.js';
import { loadFixture, loadGroundTruth } from '../fixtures/loader.js';
import { validate } from '../validators/index.js';
import { runWorkflowSteps } from './workflow-executor.js';

export interface RunUseCaseOptions {
  config: BenchmarkConfig;
  useCase: UseCaseBenchmark;
  outputDir: string;
}

export async function runUseCaseBenchmark(
  options: RunUseCaseOptions
): Promise<UseCaseBenchmarkResult> {
  const { config, useCase, outputDir } = options;

  // Load fixtures
  const fixtures = await loadFixture(useCase.fixtureId);
  const groundTruth = await loadGroundTruth(useCase.groundTruthId);

  // Execute workflow steps
  const result = await runWorkflowSteps({
    config,
    steps: useCase.steps,
    fixtures,
    outputDir,
  });

  // Validate against ground truth
  const validation = await validate(result.output, groundTruth, useCase.validator);

  return {
    taskId: useCase.id,
    useCaseId: useCase.id,
    category: useCase.category,
    mode: 'codemode',
    runNumber: 1,
    timestamp: new Date().toISOString(),
    tokens: {
      input: result.tokens.codemode,
      output: 0,
      total: result.tokens.codemode,
    },
    cost: result.cost.codemode,
    response: result.output,
    validation,
    groundTruth,
    expectedOutcome: useCase.expectedOutcome,
  };
}

export async function runAllUseCases(
  config: BenchmarkConfig,
  useCases: UseCaseBenchmark[],
  outputDir: string,
  runsPerUseCase: number = 3
): Promise<UseCaseBenchmarkResult[]> {
  const results: UseCaseBenchmarkResult[] = [];

  for (const useCase of useCases) {
    for (let run = 1; run <= runsPerUseCase; run++) {
      const result = await runUseCaseBenchmark({ config, useCase, outputDir });
      result.runNumber = run;
      results.push(result);
      saveUseCaseResult(outputDir, useCase.id, run, result);
    }
  }

  return results;
}

function saveUseCaseResult(
  outputDir: string,
  useCaseId: string,
  runNumber: number,
  result: UseCaseBenchmarkResult
): void {
  const dir = join(outputDir, 'benchmarks', 'use-cases', useCaseId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `run-${runNumber}.json`), JSON.stringify(result, null, 2));
}
