import { Command } from 'commander';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { intro, outro, log } from '@clack/prompts';
import { loadConfig } from './lib/config.js';
import {
  SelectionRunner,
  ScalingRunner,
  FilteringRunner,
  E2ERunner,
  WorkflowRunner,
} from './runners/index.js';
import { aggregateResults } from './aggregate.js';

// Find repo root by going up from the dist directory
// When running via pnpm, process.cwd() is the package directory, so we need to find the repo root
// Path structure: repo-root/packages/mcp-toolbox-benchmark/dist/cli.js
function findRepoRoot(): string {
  const __filename = fileURLToPath(import.meta.url);
  const distDir = dirname(__filename); // dist/
  const packageDir = dirname(distDir); // packages/mcp-toolbox-benchmark
  const packagesDir = dirname(packageDir); // packages/
  const repoRoot = dirname(packagesDir); // repo root (three levels up from dist/cli.js)
  
  return repoRoot;
}

const OUTPUT_BASE_DIR = findRepoRoot();

export function createCLI(): Command {
  const program = new Command();

  program
    .name('mcp-benchmark')
    .description('Context metrics benchmarking for MCP tool definitions')
    .version('0.1.0');

  program.hook('preAction', async () => {
    intro('mcp-benchmark');
  });

  program
    .command('tool-selection-accuracy')
    .description('Compare tool selection accuracy: baseline (all tools) vs toolbox (task-specific tools only)')
    .option('-r, --runs <n>', 'runs per task', '3')
    .option('-m, --mode <mode>', 'comma-separated modes (baseline,toolbox)', 'both')
    .option('-c, --config <path>', 'config file path')
    .action(async (options) => {
      const config = loadConfig(options.config);
      if (!config.tests.selection) {
        log.error('Selection test config not found');
        outro('Benchmark cancelled');
        process.exit(1);
      }

      // Validate API key before starting tests
      const apiKey = process.env[config.provider.apiKeyEnv];
      if (!apiKey) {
        log.error(`Missing API key: ${config.provider.apiKeyEnv}`);
        log.error(`Please set the ${config.provider.apiKeyEnv} environment variable before running benchmarks.`);
        outro('Benchmark cancelled');
        process.exit(1);
      }

      const runner = new SelectionRunner(config, OUTPUT_BASE_DIR);
      const modes = options.mode === 'both' ? undefined : options.mode.split(',');
      await runner.run({
        runsPerTask: parseInt(options.runs, 10),
        modes,
      });

      // Generate summary report
      await aggregateResults({
        testType: 'tool-selection-accuracy',
        outputBaseDir: OUTPUT_BASE_DIR,
        config,
      });

      outro('Tool selection accuracy tests completed');
    });

  program
    .command('token-scaling')
    .description('Measure token usage growth as the number of available tools increases (30 to 20k tools)')
    .option('--tool-counts <counts>', 'comma-separated tool counts')
    .option('-r, --runs <n>', 'runs per task', '2')
    .option('--mode <mode>', 'mode name (default: baseline-{count})')
    .option('-c, --config <path>', 'config file path')
    .action(async (options) => {
      const config = loadConfig(options.config);
      if (!config.tests.scaling) {
        log.error('Scaling test config not found');
        outro('Benchmark cancelled');
        process.exit(1);
      }

      // Validate API key before starting tests
      const apiKey = process.env[config.provider.apiKeyEnv];
      if (!apiKey) {
        log.error(`Missing API key: ${config.provider.apiKeyEnv}`);
        log.error(`Please set the ${config.provider.apiKeyEnv} environment variable before running benchmarks.`);
        outro('Benchmark cancelled');
        process.exit(1);
      }

      const runner = new ScalingRunner(config, OUTPUT_BASE_DIR);
      const toolCounts = options.toolCounts
        ? options.toolCounts.split(',').map((n: string) => parseInt(n.trim(), 10))
        : undefined;
      await runner.run({
        toolCounts,
        runsPerTask: parseInt(options.runs, 10),
        mode: options.mode,
      });

      // Generate summary report
      await aggregateResults({
        testType: 'token-scaling',
        outputBaseDir: OUTPUT_BASE_DIR,
        config,
      });

      outro('Token scaling tests completed');
    });

  program
    .command('filtering-impact')
    .description('Measure token reduction from filtering large tool response arrays (raw vs filtered results)')
    .option('-r, --runs <n>', 'runs per task', '3')
    .option('-c, --config <path>', 'config file path')
    .action(async (options) => {
      const config = loadConfig(options.config);
      if (!config.tests.filtering) {
        log.error('Filtering test config not found');
        outro('Benchmark cancelled');
        process.exit(1);
      }

      // Validate API key before starting tests
      const apiKey = process.env[config.provider.apiKeyEnv];
      if (!apiKey) {
        log.error(`Missing API key: ${config.provider.apiKeyEnv}`);
        log.error(`Please set the ${config.provider.apiKeyEnv} environment variable before running benchmarks.`);
        outro('Benchmark cancelled');
        process.exit(1);
      }

      const runner = new FilteringRunner(config, OUTPUT_BASE_DIR);
      await runner.run({
        runsPerTask: parseInt(options.runs, 10),
      });

      // Generate summary report
      await aggregateResults({
        testType: 'filtering-impact',
        outputBaseDir: OUTPUT_BASE_DIR,
        config,
      });

      outro('Filtering impact tests completed');
    });

  program
    .command('combined-test')
    .description('Combined test: token scaling with different tool counts + filtering impact (baseline vs toolbox)')
    .option('-m, --mode <mode>', 'mode name (default: baseline-{count} or toolbox)')
    .option('--baselines <counts>', 'comma-separated baseline tool counts')
    .option('-r, --runs <n>', 'runs per task', '3')
    .option('-c, --config <path>', 'config file path')
    .action(async (options) => {
      const config = loadConfig(options.config);
      if (!config.tests.e2e) {
        log.error('E2E test config not found');
        outro('Benchmark cancelled');
        process.exit(1);
      }

      // Validate API key before starting tests
      const apiKey = process.env[config.provider.apiKeyEnv];
      if (!apiKey) {
        log.error(`Missing API key: ${config.provider.apiKeyEnv}`);
        log.error(`Please set the ${config.provider.apiKeyEnv} environment variable before running benchmarks.`);
        outro('Benchmark cancelled');
        process.exit(1);
      }

      const runner = new E2ERunner(config, OUTPUT_BASE_DIR);
      const baselines = options.baselines
        ? options.baselines.split(',').map((n: string) => parseInt(n.trim(), 10))
        : undefined;
      await runner.run({
        baselines,
        runsPerTask: parseInt(options.runs, 10),
        mode: options.mode,
      });

      // Generate summary report
      await aggregateResults({
        testType: 'combined-test',
        outputBaseDir: OUTPUT_BASE_DIR,
        config,
      });

      outro('Combined tests completed');
    });

  program
    .command('multi-turn-growth')
    .description('Measure context token growth across multiple conversation turns in a workflow')
    .option('-r, --runs <n>', 'runs per workflow', '1')
    .option('-c, --config <path>', 'config file path')
    .action(async (options) => {
      const config = loadConfig(options.config);
      if (!config.tests.workflow) {
        log.error('Workflow test config not found');
        outro('Benchmark cancelled');
        process.exit(1);
      }

      // Validate API key before starting tests
      const apiKey = process.env[config.provider.apiKeyEnv];
      if (!apiKey) {
        log.error(`Missing API key: ${config.provider.apiKeyEnv}`);
        log.error(`Please set the ${config.provider.apiKeyEnv} environment variable before running benchmarks.`);
        outro('Benchmark cancelled');
        process.exit(1);
      }

      const runner = new WorkflowRunner(config, OUTPUT_BASE_DIR);
      await runner.run({
        runsPerTask: parseInt(options.runs, 10),
      });

      // Generate summary report
      await aggregateResults({
        testType: 'multi-turn-growth',
        outputBaseDir: OUTPUT_BASE_DIR,
        config,
      });

      outro('Multi-turn growth tests completed');
    });

  program
    .command('aggregate')
    .description('Aggregate results into reports')
    .option('-t, --type <type>', 'test type to aggregate (tool-selection-accuracy, token-scaling, filtering-impact, combined-test, multi-turn-growth)')
    .option('-c, --config <path>', 'config file path')
    .action(async (options) => {
      if (!options.type) {
        log.error('Test type required (--type)');
        outro('Aggregation cancelled');
        process.exit(1);
      }

      const config = loadConfig(options.config);
      await aggregateResults({
        testType: options.type,
        outputBaseDir: OUTPUT_BASE_DIR,
        config,
      });
      outro('Results aggregated successfully');
    });

  program
    .command('all')
    .description('Run all test types')
    .option('-c, --config <path>', 'config file path')
    .action(async (options) => {
      const config = loadConfig(options.config);

      // Validate API key before starting any tests
      const apiKey = process.env[config.provider.apiKeyEnv];
      if (!apiKey) {
        log.error(`Missing API key: ${config.provider.apiKeyEnv}`);
        log.error(`Please set the ${config.provider.apiKeyEnv} environment variable before running benchmarks.`);
        outro('Benchmark cancelled');
        process.exit(1);
      }

      if (config.tests.selection) {
        log.info('Running Tool Selection Accuracy Tests');
        const runner = new SelectionRunner(config, OUTPUT_BASE_DIR);
        await runner.run();
        await aggregateResults({
          testType: 'tool-selection-accuracy',
          outputBaseDir: OUTPUT_BASE_DIR,
          config,
        });
      }

      if (config.tests.scaling) {
        log.info('Running Token Scaling Tests');
        const runner = new ScalingRunner(config, OUTPUT_BASE_DIR);
        await runner.run();
        await aggregateResults({
          testType: 'token-scaling',
          outputBaseDir: OUTPUT_BASE_DIR,
          config,
        });
      }

      if (config.tests.filtering) {
        log.info('Running Filtering Impact Tests');
        const runner = new FilteringRunner(config, OUTPUT_BASE_DIR);
        await runner.run();
        await aggregateResults({
          testType: 'filtering-impact',
          outputBaseDir: OUTPUT_BASE_DIR,
          config,
        });
      }

      if (config.tests.e2e) {
        log.info('Running Combined Tests');
        const runner = new E2ERunner(config, OUTPUT_BASE_DIR);
        await runner.run();
        await aggregateResults({
          testType: 'combined-test',
          outputBaseDir: OUTPUT_BASE_DIR,
          config,
        });
      }

      if (config.tests.workflow) {
        log.info('Running Multi-Turn Growth Tests');
        const runner = new WorkflowRunner(config, OUTPUT_BASE_DIR);
        await runner.run();
        await aggregateResults({
          testType: 'multi-turn-growth',
          outputBaseDir: OUTPUT_BASE_DIR,
          config,
        });
      }

      outro('All benchmark tests completed');
    });

  program
    .command('use-cases')
    .description('Run use case validation benchmarks')
    .option('--use-case <id>', 'Run specific use case')
    .option('--category <name>', 'Run all use cases in category (database, devops, document, code)')
    .option('-r, --runs <n>', 'Number of runs per use case', '3')
    .option('--report', 'Generate benchmark report')
    .option('-c, --config <path>', 'config file path')
    .action(async (options) => {
      const config = loadConfig(options.config);

      // Validate API key before starting tests
      const apiKey = process.env[config.provider.apiKeyEnv];
      if (!apiKey) {
        log.error(`Missing API key: ${config.provider.apiKeyEnv}`);
        log.error(`Please set the ${config.provider.apiKeyEnv} environment variable before running benchmarks.`);
        outro('Benchmark cancelled');
        process.exit(1);
      }

      const { loadUseCases } = await import('./lib/config.js');
      const { runAllUseCases } = await import('./runners/use-cases.js');
      const { generateBenchmarkReport } = await import('./reports/benchmark-report.js');

      const allUseCases = loadUseCases();
      const runsPerUseCase = parseInt(options.runs, 10);

      let useCases = allUseCases;
      if (options.useCase) {
        useCases = allUseCases.filter((uc) => uc.id === options.useCase);
        if (useCases.length === 0) {
          log.error(`Use case not found: ${options.useCase}`);
          outro('Benchmark cancelled');
          process.exit(1);
        }
      } else if (options.category) {
        useCases = allUseCases.filter((uc) => uc.category === options.category);
        if (useCases.length === 0) {
          log.error(`No use cases found for category: ${options.category}`);
          outro('Benchmark cancelled');
          process.exit(1);
        }
      }

      log.info(`Running ${useCases.length} use case(s) with ${runsPerUseCase} run(s) each`);

      const results = await runAllUseCases(config as any, useCases as any, OUTPUT_BASE_DIR, runsPerUseCase);

      if (options.report) {
        log.info('Generating benchmark report...');
        const report = await generateBenchmarkReport(results, OUTPUT_BASE_DIR);
        log.success(`Report generated: ${report.summary.passed}/${report.summary.totalUseCases} passed (${report.summary.passRate.toFixed(1)}%)`);
      }

      outro('Use case benchmarks completed');
    });

  return program;
}
