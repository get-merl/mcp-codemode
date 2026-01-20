import type { ValidationResult, ValidatorConfig } from '../types.js';

export function validateRanking(
  predicted: unknown,
  actual: unknown,
  config: ValidatorConfig
): ValidationResult {
  const predictedArray = extractArray(predicted);
  const actualArray = extractArray(actual);

  if (!predictedArray || !actualArray) {
    return {
      passed: false,
      validator: 'ranking',
      details: 'Invalid input: expected arrays or objects with array properties',
    };
  }

  const topK = config.topK ?? actualArray.length;
  const minOverlap = config.minOverlap ?? 0.5;

  // Take top K from each
  const predictedTopK = predictedArray.slice(0, topK);
  const actualTopK = actualArray.slice(0, topK);

  // Calculate overlap (how many items appear in both top K lists)
  const predictedSet = new Set(predictedTopK);
  const actualSet = new Set(actualTopK);
  const overlap = [...predictedSet].filter((x) => actualSet.has(x)).length;

  const overlapRatio = topK > 0 ? overlap / topK : 0;
  const passed = overlapRatio >= minOverlap;

  return {
    passed,
    validator: 'ranking',
    score: overlapRatio,
    details: passed
      ? `Top-${topK} overlap: ${overlap}/${topK} (${(overlapRatio * 100).toFixed(1)}%)`
      : `Failed - Top-${topK} overlap: ${overlap}/${topK} (${(overlapRatio * 100).toFixed(1)}%), required: ${(minOverlap * 100).toFixed(1)}%`,
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

    // Common property names for ranked lists
    const arrayProps = ['items', 'results', 'ranking', 'list', 'causes', 'errors'];
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
