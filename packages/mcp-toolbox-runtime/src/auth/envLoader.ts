import { config } from "dotenv";
import path from "node:path";

/**
 * Load environment variables from .env and .env.local files.
 * This should be called before config validation to ensure tokenEnv values resolve.
 * 
 * Loading order (later files override earlier):
 * 1. .env
 * 2. .env.local
 * 
 * @param cwd - Optional working directory to search for .env files. Defaults to process.cwd()
 */
export function loadEnvFiles(cwd?: string): void {
  const baseDir = cwd || process.cwd();
  
  // Load .env first (lower priority)
  config({ path: path.join(baseDir, ".env") });
  
  // Load .env.local second (higher priority, overrides .env)
  config({ path: path.join(baseDir, ".env.local") });
}
