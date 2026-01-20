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

// New metric interfaces for use case validation
export interface PerformanceMetrics {
  ttft: number; // Time-to-First-Token (ms)
  e2eLatency: number; // End-to-end latency (ms)
  toolDiscoveryTime: number; // Catalog navigation time (ms)
  contextUtilization: number; // % of context window used
}

export interface EfficiencyMetrics {
  payloadCompressionRatio: number; // original_size / filtered_size
  schemaDefinitionDensity: number; // total_schema_tokens / tool_count
  turnEfficiency: number; // tasks_completed / conversation_turns
}

export interface QualityMetrics {
  hallucinationRate: number; // Incorrect tool/argument %
  partialMatchAccuracy: number; // Correct tool, imperfect args %
  recoveryRate: number; // Success after initial failure %
}

export interface ScalingMetrics {
  toolCountBreakpoint: number; // Where baseline degrades
  linearScalingFactor: number; // delta_tokens / delta_tools
  marginalCostPerTool: number; // $ per additional tool
}

// Validator types
export type ValidatorType = 'schema' | 'exact_match' | 'f1_recall' | 'ranking';

export interface ValidationResult {
  passed: boolean;
  validator: ValidatorType;
  score?: number; // For F1/recall/ranking
  details?: string; // Error message or diff
}

export interface ValidatorConfig {
  type: ValidatorType;
  fields?: string[]; // For exact_match
  topK?: number; // For ranking
  minOverlap?: number; // For ranking
  minF1?: number; // For f1_recall
  minRecall?: number; // For f1_recall
}

// Use case benchmark types
export interface UseCaseBenchmark {
  id: string;
  name: string;
  category: string;
  fixtureId: string;
  groundTruthId: string;
  validator: ValidatorConfig;
  steps: WorkflowStep[];
  passCriteria: Record<string, unknown>;
  expectedOutcome: string;
}

export interface UseCaseBenchmarkResult extends RunResult {
  useCaseId: string;
  category: string;
  validation: ValidationResult;
  groundTruth: unknown;
  expectedOutcome: string;
}
