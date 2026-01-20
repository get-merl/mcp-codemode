import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type { BenchmarkConfig } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ProviderConfigSchema = z.object({
  kind: z.enum(['openai', 'anthropic']),
  model: z.string(),
  apiKeyEnv: z.string(),
  baseUrl: z.string().optional(),
});

const PricingConfigSchema = z.object({
  input_per_1m: z.number(),
  output_per_1m: z.number(),
});

const ModeConfigSchema = z.object({
  name: z.string(),
  toolDefinitionScope: z.enum(['serverOnly', 'taskToolsOnly']),
});

const SelectionTestConfigSchema = z.object({
  runsPerTask: z.number(),
  tasksFile: z.string(),
  modes: z.array(ModeConfigSchema),
});

const ScalingTestConfigSchema = z.object({
  runsPerTask: z.number(),
  toolCounts: z.array(z.number()),
  tasksFile: z.string(),
});

const FilteringTestConfigSchema = z.object({
  runsPerTask: z.number(),
  tasksFile: z.string(),
});

const E2ETestConfigSchema = z.object({
  runsPerTask: z.number(),
  baselines: z.array(z.number()),
  tasksFile: z.string(),
});

const WorkflowTestConfigSchema = z.object({
  runsPerTask: z.number(),
  workflowsFile: z.string(),
});

const BenchmarkConfigSchema = z.object({
  provider: ProviderConfigSchema,
  pricing: PricingConfigSchema,
  tests: z.object({
    selection: SelectionTestConfigSchema.optional(),
    scaling: ScalingTestConfigSchema.optional(),
    filtering: FilteringTestConfigSchema.optional(),
    e2e: E2ETestConfigSchema.optional(),
    workflow: WorkflowTestConfigSchema.optional(),
  }),
  runsPerTask: z.number().optional(),
  tasksFile: z.string().optional(),
  snapshotsDir: z.string().optional(),
  outputDir: z.string().optional(),
  modes: z.array(ModeConfigSchema).optional(),
  prompt: z
    .object({
      system: z.string().optional(),
      userSuffix: z.string().optional(),
    })
    .optional(),
});

export function loadConfig(configPath?: string): BenchmarkConfig {
  // If no path provided, use default config from package
  const configFile = configPath || join(__dirname, '../../config/default.json');
  const configText = readFileSync(configFile, 'utf-8');
  const configJson = JSON.parse(configText);

  const validated = BenchmarkConfigSchema.parse(configJson);
  return validated as BenchmarkConfig;
}

export function getConfigPath(relativePath: string): string {
  // Always resolve relative to package config directory
  return join(__dirname, '../../config', relativePath);
}

export function loadUseCases(): Array<{
  id: string;
  name: string;
  category: string;
  fixtureId: string;
  groundTruthId: string;
  validator: Record<string, unknown>;
  steps: Array<{ prompt: string; expectedTool?: string | null }>;
  passCriteria: Record<string, unknown>;
  expectedOutcome: string;
}> {
  const useCasesPath = getConfigPath('use-cases.json');
  const content = readFileSync(useCasesPath, 'utf-8');
  const data = JSON.parse(content) as { useCases: Array<unknown> };
  return data.useCases as Array<{
    id: string;
    name: string;
    category: string;
    fixtureId: string;
    groundTruthId: string;
    validator: Record<string, unknown>;
    steps: Array<{ prompt: string; expectedTool?: string | null }>;
    passCriteria: Record<string, unknown>;
    expectedOutcome: string;
  }>;
}
