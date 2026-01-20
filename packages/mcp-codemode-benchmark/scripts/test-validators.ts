#!/usr/bin/env tsx
import { validate } from '../src/validators/index.js';
import type { ValidatorConfig } from '../src/types.js';

function testExactMatch() {
  console.log('\n1. Testing exact_match validator...');

  const config: ValidatorConfig = {
    type: 'exact_match',
    fields: ['name', 'age'],
  };

  // Test 1: Matching data
  const result1 = validate(
    { name: 'Alice', age: 30, extra: 'ignored' },
    { name: 'Alice', age: 30 },
    config
  );
  console.log('   Test 1 (matching):', result1.passed ? '✓ PASS' : '✗ FAIL', '-', result1.details);

  // Test 2: Non-matching data
  const result2 = validate(
    { name: 'Alice', age: 31 },
    { name: 'Alice', age: 30 },
    config
  );
  console.log('   Test 2 (mismatch):', result2.passed ? '✗ FAIL' : '✓ PASS', '-', result2.details);
}

function testF1Recall() {
  console.log('\n2. Testing f1_recall validator...');

  const config: ValidatorConfig = {
    type: 'f1_recall',
    minF1: 0.8,
    minRecall: 0.75,
  };

  // Test 1: High overlap
  const result1 = validate(
    ['action1', 'action2', 'action3', 'action4'],
    ['action1', 'action2', 'action3'],
    config
  );
  console.log('   Test 1 (high overlap):', result1.passed ? '✓ PASS' : '✗ FAIL', '-', result1.details);

  // Test 2: Low overlap
  const result2 = validate(
    ['action1', 'action5', 'action6'],
    ['action1', 'action2', 'action3', 'action4'],
    config
  );
  console.log('   Test 2 (low overlap):', result2.passed ? '✗ FAIL' : '✓ PASS', '-', result2.details);
}

function testRanking() {
  console.log('\n3. Testing ranking validator...');

  const config: ValidatorConfig = {
    type: 'ranking',
    topK: 3,
    minOverlap: 0.66,
  };

  // Test 1: Good ranking overlap
  const result1 = validate(
    ['timeout', 'rate_limit', 'auth_fail', 'other'],
    ['timeout', 'auth_fail', 'rate_limit'],
    config
  );
  console.log('   Test 1 (good ranking):', result1.passed ? '✓ PASS' : '✗ FAIL', '-', result1.details);

  // Test 2: Poor ranking overlap
  const result2 = validate(
    ['other1', 'other2', 'timeout'],
    ['timeout', 'auth_fail', 'rate_limit'],
    config
  );
  console.log('   Test 2 (poor ranking):', result2.passed ? '✗ FAIL' : '✓ PASS', '-', result2.details);
}

function testSchema() {
  console.log('\n4. Testing schema validator...');

  const config: ValidatorConfig = {
    type: 'schema',
  };

  // Test 1: Matching schema
  const result1 = validate(
    { name: 'Alice', age: 30, city: 'NYC' },
    { name: 'Bob', age: 25 },
    config
  );
  console.log('   Test 1 (matching schema):', result1.passed ? '✓ PASS' : '✗ FAIL', '-', result1.details);

  // Test 2: Missing fields
  const result2 = validate(
    { name: 'Alice' },
    { name: 'Bob', age: 25 },
    config
  );
  console.log('   Test 2 (missing fields):', result2.passed ? '✗ FAIL' : '✓ PASS', '-', result2.details);
}

function main() {
  console.log('='.repeat(60));
  console.log('Testing Validators');
  console.log('='.repeat(60));

  testExactMatch();
  testF1Recall();
  testRanking();
  testSchema();

  console.log('\n' + '='.repeat(60));
  console.log('All validator tests completed!');
  console.log('='.repeat(60));
}

main();
