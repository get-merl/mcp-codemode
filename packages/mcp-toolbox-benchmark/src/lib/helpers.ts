import { accessSync, constants } from 'node:fs';
import type { TokenUsage } from '../types.js';

export function toBytes(str: string): number {
  return new TextEncoder().encode(str).length;
}

export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

export function calculateCost(
  tokens: TokenUsage,
  inputPer1M: number,
  outputPer1M: number,
): number {
  return (tokens.input / 1_000_000) * inputPer1M + (tokens.output / 1_000_000) * outputPer1M;
}

export function extractJson(text: string): unknown | null {
  // Try to find JSON object or array in the text
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]!);
  } catch {
    return null;
  }
}

export function formatTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';
}

export function ensureDir(dirPath: string): void {
  // Simple implementation - in production might want to use fs.mkdir with recursive
  // For now, we'll rely on the file writing to create directories
}

export function fileExists(filePath: string): boolean {
  try {
    accessSync(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
