import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURES_DIR = join(process.cwd(), 'packages', 'mcp-codemode-benchmark', 'fixtures');

export async function loadFixture(fixtureId: string): Promise<unknown> {
  const manifestPath = join(FIXTURES_DIR, 'manifest.json');
  const manifestContent = readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestContent) as {
    fixtures: Array<{
      id: string;
      type: string;
      path?: string;
      generator?: string;
      params?: Record<string, unknown>;
    }>;
  };

  const fixtureConfig = manifest.fixtures.find((f) => f.id === fixtureId);
  if (!fixtureConfig) {
    throw new Error(`Fixture not found: ${fixtureId}`);
  }

  // If it's a curated fixture with a path, load from file
  if (fixtureConfig.path) {
    const fixturePath = join(FIXTURES_DIR, fixtureConfig.path);
    const content = readFileSync(fixturePath, 'utf-8');

    // Try to parse as JSON, otherwise return as text
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }

  // For generated fixtures, load the generated file
  const fixturePath = join(FIXTURES_DIR, fixtureConfig.type, `${fixtureId}.json`);
  const content = readFileSync(fixturePath, 'utf-8');
  return JSON.parse(content);
}

export async function loadGroundTruth(groundTruthId: string): Promise<unknown> {
  // Ground truth files are stored in {type}/ground-truth/{id}.json
  // We need to find the right directory
  const types = ['database', 'incident', 'document', 'code'];

  for (const type of types) {
    try {
      const groundTruthPath = join(FIXTURES_DIR, type, 'ground-truth', `${groundTruthId}.json`);
      const content = readFileSync(groundTruthPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Try next type
      continue;
    }
  }

  throw new Error(`Ground truth not found: ${groundTruthId}`);
}
