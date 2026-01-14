import { spawn } from "node:child_process";
import path from "node:path";
import type { ExecResult } from "./types";

export async function runCli(
  args: string[],
  options: {
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
    input?: string;
  } = {}
): Promise<ExecResult> {
  const binPath = path.join(process.cwd(), "dist", "bin.js");
  const timeout = options.timeout ?? 30000;

  return new Promise((resolve, reject) => {
    // Spawn with detached process group on Unix to allow killing children
    const spawnOptions: Parameters<typeof spawn>[2] = {
      cwd: options.cwd ?? process.cwd(),
      env: { ...process.env, ...options.env },
      stdio: ["pipe", "pipe", "pipe"],
    };

    // On Unix, create a new process group so we can kill all children
    if (process.platform !== "win32") {
      spawnOptions.detached = false; // Keep attached but use killpg
    }

    const child = spawn("node", [binPath, ...args], spawnOptions);

    let stdout = "";
    let stderr = "";
    let isResolved = false;

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    if (options.input) {
      child.stdin?.write(options.input);
      child.stdin?.end();
    }

    const killProcessTree = () => {
      if (child.pid === undefined) return;
      
      try {
        // First, try graceful termination
        child.kill("SIGTERM");
        
        // Force kill after a short delay
        setTimeout(() => {
          try {
            if (child.pid !== undefined) {
              child.kill("SIGKILL");
            }
            
            // Also try to kill any child processes using killpg (Unix only)
            if (process.platform !== "win32" && child.pid !== undefined) {
              try {
                process.kill(-child.pid, "SIGKILL");
              } catch {
                // Process group kill might fail, that's okay
              }
            }
          } catch {
            // Process already dead or other error
          }
        }, 2000); // Give it 2 seconds before force kill
      } catch (error) {
        // Ignore errors during kill
      }
    };

    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        killProcessTree();
        reject(new Error(`CLI execution timed out after ${timeout}ms`));
      }
    }, timeout);

    child.on("error", (error) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        reject(error);
      }
    });

    child.on("exit", (code, signal) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        resolve({
          exitCode: code ?? 0,
          signal: signal ?? null,
          stdout,
          stderr,
        });
      }
    });
  });
}

export function mockPrompts(responses: Record<string, string | boolean>): void {
  // This would need to be implemented by mocking @clack/prompts
  // For now, we'll use --yes flag for non-interactive mode
}
