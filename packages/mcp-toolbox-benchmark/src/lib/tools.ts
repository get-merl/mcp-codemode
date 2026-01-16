import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Task, Workflow } from '../types.js';
import { getConfigPath } from './config.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export function loadTasks(tasksFile: string): Task[] {
  const filePath = tasksFile.startsWith('/')
    ? tasksFile
    : getConfigPath(tasksFile);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as Task[];
}

export function loadWorkflows(workflowsFile: string): Workflow[] {
  const filePath = workflowsFile.startsWith('/')
    ? workflowsFile
    : getConfigPath(workflowsFile);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as Workflow[];
}

export function loadSnapshotTools(snapshotsDir: string): ToolDefinition[] {
  const tools: ToolDefinition[] = [];
  // snapshotsDir should already be an absolute path when passed from runners
  const dirPath = snapshotsDir;

  try {
    const files = readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = join(dirPath, file);
        const content = readFileSync(filePath, 'utf-8');
        const snapshot = JSON.parse(content);
        if (snapshot.tools && Array.isArray(snapshot.tools)) {
          tools.push(...snapshot.tools);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not load snapshot tools from ${dirPath}:`, error);
  }

  return tools;
}

export function buildToolSet(
  allTools: ToolDefinition[],
  scope: 'serverOnly' | 'taskToolsOnly',
  taskToolNames?: string[],
): ToolDefinition[] {
  if (scope === 'serverOnly') {
    return allTools;
  } else if (scope === 'taskToolsOnly') {
    if (!taskToolNames || taskToolNames.length === 0) {
      return [];
    }
    return allTools.filter((tool) => taskToolNames.includes(tool.name));
  }
  return [];
}

export function toolsToOpenAIFormat(tools: ToolDefinition[]): Array<{
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}> {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

export function filterResult(
  result: unknown,
  filterConfig?: { type: 'summarize_array'; sampleSize: number },
): unknown {
  if (!filterConfig || filterConfig.type !== 'summarize_array') {
    return result;
  }

  if (Array.isArray(result)) {
    const sampleSize = filterConfig.sampleSize;
    if (result.length <= sampleSize) {
      return result;
    }

    const sample = result.slice(0, sampleSize);
    const total = result.length;
    return {
      sample,
      total,
      summary: `Array with ${total} items, showing first ${sampleSize}`,
    };
  }

  return result;
}
