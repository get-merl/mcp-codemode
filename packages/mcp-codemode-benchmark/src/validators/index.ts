import type { ValidationResult, ValidatorConfig } from '../types.js';
import { validateExactMatch } from './exact-match.js';
import { validateF1Recall } from './f1-recall.js';
import { validateRanking } from './ranking.js';
import { validateSchema } from './schema.js';

export { computeF1 } from './f1-recall.js';
export { validateExactMatch } from './exact-match.js';
export { validateF1Recall } from './f1-recall.js';
export { validateRanking } from './ranking.js';
export { validateSchema } from './schema.js';

export function validate(
  predicted: unknown,
  actual: unknown,
  config: ValidatorConfig
): ValidationResult {
  switch (config.type) {
    case 'exact_match':
      return validateExactMatch(predicted, actual, config);
    case 'f1_recall':
      return validateF1Recall(predicted, actual, config);
    case 'ranking':
      return validateRanking(predicted, actual, config);
    case 'schema':
      return validateSchema(predicted, actual, config);
    default:
      return {
        passed: false,
        validator: config.type,
        details: `Unknown validator type: ${config.type}`,
      };
  }
}
