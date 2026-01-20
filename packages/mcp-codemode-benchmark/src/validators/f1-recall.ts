import type { ValidationResult, ValidatorConfig } from '../types.js';

export interface F1RecallResult {
  f1: number;
  precision: number;
  recall: number;
}

export function computeF1(predicted: string[], actual: string[]): F1RecallResult {
  const predictedSet = new Set(predicted);
  const actualSet = new Set(actual);
  const tp = [...predictedSet].filter((x) => actualSet.has(x)).length;
  const precision = predictedSet.size > 0 ? tp / predictedSet.size : 0;
  const recall = actualSet.size > 0 ? tp / actualSet.size : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  return { f1, precision, recall };
}

export function validateF1Recall(
  predicted: unknown,
  actual: unknown,
  config: ValidatorConfig
): ValidationResult {
  // Extract arrays from the outputs
  const predictedArray = extractArray(predicted);
  const actualArray = extractArray(actual);

  if (!predictedArray || !actualArray) {
    return {
      passed: false,
      validator: 'f1_recall',
      details: 'Invalid input: expected arrays or objects with array properties',
    };
  }

  const { f1, precision, recall } = computeF1(predictedArray, actualArray);

  // Check against thresholds
  const minF1 = config.minF1 ?? 0;
  const minRecall = config.minRecall ?? 0;

  const passedF1 = f1 >= minF1;
  const passedRecall = recall >= minRecall;
  const passed = passedF1 && passedRecall;

  return {
    passed,
    validator: 'f1_recall',
    score: f1,
    details: passed
      ? `F1: ${f1.toFixed(3)}, Precision: ${precision.toFixed(3)}, Recall: ${recall.toFixed(3)}`
      : `Failed - F1: ${f1.toFixed(3)} (min: ${minF1}), Recall: ${recall.toFixed(3)} (min: ${minRecall})`,
  };
}

function extractArray(value: unknown): string[] | null {
  // If it's already an array, use it
  if (Array.isArray(value)) {
    return value.map((v) => String(v));
  }

  // If it's an object, try to find an array property
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    // Common property names for arrays
    const arrayProps = ['items', 'actions', 'results', 'list', 'data', 'values'];
    for (const prop of arrayProps) {
      if (Array.isArray(obj[prop])) {
        return (obj[prop] as unknown[]).map((v) => String(v));
      }
    }

    // Just use the first array property found
    for (const [key, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        return val.map((v) => String(v));
      }
    }
  }

  return null;
}
