import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

export async function createTestDir(prefix = "mcp-codemode-test"): Promise<string> {
  const dir = await fs.mkdtemp(path.join(tmpdir(), prefix));
  return dir;
}

export async function cleanupTestDir(dir: string): Promise<void> {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

export async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function writeFileAtomic(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, content, "utf-8");
  await fs.rename(tempPath, filePath);
}

export async function listFiles(dir: string, recursive = false): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && recursive) {
      const subFiles = await listFiles(fullPath, true);
      files.push(...subFiles.map((f) => path.relative(dir, f)));
    } else if (entry.isFile()) {
      files.push(path.relative(dir, fullPath));
    }
  }

  return files.sort();
}

export async function compareDirectories(
  dir1: string,
  dir2: string
): Promise<{ onlyIn1: string[]; onlyIn2: string[]; different: string[] }> {
  const files1 = new Set(await listFiles(dir1, true));
  const files2 = new Set(await listFiles(dir2, true));

  const onlyIn1 = Array.from(files1).filter((f) => !files2.has(f));
  const onlyIn2 = Array.from(files2).filter((f) => !files1.has(f));

  const common = Array.from(files1).filter((f) => files2.has(f));
  const different: string[] = [];

  for (const file of common) {
    const content1 = await readFileIfExists(path.join(dir1, file));
    const content2 = await readFileIfExists(path.join(dir2, file));
    if (content1 !== content2) {
      different.push(file);
    }
  }

  return { onlyIn1, onlyIn2, different };
}
