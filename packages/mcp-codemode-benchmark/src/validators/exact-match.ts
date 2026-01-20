import type { ValidationResult, ValidatorConfig } from '../types.js';

export function validateExactMatch(
  predicted: unknown,
  actual: unknown,
  config: ValidatorConfig
): ValidationResult {
  if (!predicted || typeof predicted !== 'object') {
    return {
      passed: false,
      validator: 'exact_match',
      details: 'Invalid predicted value: expected object',
    };
  }

  if (!actual || typeof actual !== 'object') {
    return {
      passed: false,
      validator: 'exact_match',
      details: 'Invalid actual value: expected object',
    };
  }

  const predictedObj = predicted as Record<string, unknown>;
  const actualObj = actual as Record<string, unknown>;

  // If fields are specified, only check those fields
  const fieldsToCheck = config.fields || Object.keys(actualObj);

  const mismatches: string[] = [];

  for (const field of fieldsToCheck) {
    const predictedValue = predictedObj[field];
    const actualValue = actualObj[field];

    if (JSON.stringify(predictedValue) !== JSON.stringify(actualValue)) {
      mismatches.push(
        `${field}: expected ${JSON.stringify(actualValue)}, got ${JSON.stringify(predictedValue)}`
      );
    }
  }

  const passed = mismatches.length === 0;

  return {
    passed,
    validator: 'exact_match',
    details: passed ? `All ${fieldsToCheck.length} fields match` : `Mismatches: ${mismatches.join('; ')}`,
  };
}
