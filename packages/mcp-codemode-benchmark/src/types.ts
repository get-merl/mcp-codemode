export interface BenchmarkConfig {
  provider: ProviderConfig;
  pricing: PricingConfig;
  tests: TestsConfig;
  snapshotsDir?: string;
  prompt?: {
    system?: string;
    userSuffix?: string;
  };
}

export interface ProviderConfig {
  kind: 'openai' | 'anthropic';
  model: string;
  apiKeyEnv: string;
  baseUrl?: string;
}

export interface PricingConfig {
  input_per_1m: number;
  output_per_1m: number;
}

export interface TestsConfig {
  selection?: SelectionTestConfig;
  scaling?: ScalingTestConfig;
  filtering?: FilteringTestConfig;
  e2e?: E2ETestConfig;
  workflow?: WorkflowTestConfig;
}

export interface SelectionTestConfig {
  runsPerTask: number;
  tasksFile: string;
  modes: ModeConfig[];
}

export interface ScalingTestConfig {
  runsPerTask: number;
  toolCounts: number[];
  tasksFile: string;
}

export interface FilteringTestConfig {
  runsPerTask: number;
  tasksFile: string;
}

export interface E2ETestConfig {
  runsPerTask: number;
  baselines: number[];
  tasksFile: string;
}

export interface WorkflowTestConfig {
  runsPerTask: number;
  workflowsFile: string;
}

export interface ModeConfig {
  name: string;
  toolDefinitionScope: 'serverOnly' | 'taskToolsOnly';
}

export interface RunResult {
  taskId: string;
  mode: string;
  runNumber: number;
  timestamp: string;
  tokens: TokenUsage;
  cost: number;
  response: unknown;
  correct?: boolean;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

export interface Summary {
  testType: string;
  timestamp: string;
  totalRuns: number;
  results: SummaryResult[];
}

export interface SummaryResult {
  taskId: string;
  mode: string;
  runs: RunResult[];
  averageTokens: TokenUsage;
  averageCost: number;
  accuracy?: number;
}

export interface Task {
  id: string;
  serverSlug: string;
  prompt: string;
  toolNames: string[];
  expectedToolCall: {
    tool_name: string;
    arguments: Record<string, unknown>;
  };
  filterConfig?: FilterConfig;
}

export interface FilterConfig {
  type: 'summarize_array';
  sampleSize: number;
}

export interface Workflow {
  id: string;
  serverSlug: string;
  description?: string;
  toolNames: string[];
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  prompt: string;
  expectedTool?: string | null;
  filterConfig?: FilterConfig | null;
}
