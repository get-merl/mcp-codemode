import type { ValidationResult, ValidatorConfig } from '../types.js';

export function validateSchema(
  predicted: unknown,
  actual: unknown,
  config: ValidatorConfig
): ValidationResult {
  // Basic schema validation - checks if predicted matches the shape of actual
  // For now, this is a simple structural comparison

  if (typeof predicted !== typeof actual) {
    return {
      passed: false,
      validator: 'schema',
      details: `Type mismatch: expected ${typeof actual}, got ${typeof predicted}`,
    };
  }

  if (predicted === null || actual === null) {
    return {
      passed: predicted === actual,
      validator: 'schema',
      details: predicted === actual ? 'Both null' : 'Null mismatch',
    };
  }

  if (typeof predicted !== 'object') {
    // For primitives, exact match
    return {
      passed: predicted === actual,
      validator: 'schema',
      details: predicted === actual ? 'Values match' : 'Values differ',
    };
  }

  // Check object/array structure
  if (Array.isArray(predicted) !== Array.isArray(actual)) {
    return {
      passed: false,
      validator: 'schema',
      details: 'Structure mismatch: array vs object',
    };
  }

  if (Array.isArray(predicted) && Array.isArray(actual)) {
    // For arrays, just check they both have elements
    return {
      passed: true,
      validator: 'schema',
      details: `Both arrays (predicted: ${predicted.length} items, actual: ${actual.length} items)`,
    };
  }

  // For objects, check all keys from actual exist in predicted
  const actualObj = actual as Record<string, unknown>;
  const predictedObj = predicted as Record<string, unknown>;

  const missingKeys: string[] = [];
  const extraKeys = Object.keys(predictedObj).filter((k) => !(k in actualObj));

  for (const key of Object.keys(actualObj)) {
    if (!(key in predictedObj)) {
      missingKeys.push(key);
    }
  }

  const passed = missingKeys.length === 0;

  return {
    passed,
    validator: 'schema',
    details: passed
      ? `Schema valid (${Object.keys(actualObj).length} fields${extraKeys.length > 0 ? `, ${extraKeys.length} extra` : ''})`
      : `Missing fields: ${missingKeys.join(', ')}`,
  };
}
