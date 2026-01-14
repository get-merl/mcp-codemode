import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { Command } from "commander";
import { confirm, isCancel, log, progress } from "@clack/prompts";

import {
  defaultConfigPath,
  loadToolboxConfig,
  fileExists,
} from "mcp-toolbox-runtime";
import { slugifyServerName } from "../lib/slug.js";

import { introspectServer } from "../introspect/introspectServer.js";
import type { SnapshotMeta } from "../snapshot/writeSnapshot.js";
import { writeLatestSnapshot } from "../snapshot/writeSnapshot.js";
import { fingerprint } from "../snapshot/fingerprint.js";

import { diffSnapshots } from "../diff/diffSnapshots.js";
import { renderDiffReport } from "../diff/report.js";

import { generateServerTs } from "../codegen/ts/generateServer.js";
import { writeCatalog } from "../codegen/catalog.js";
import { writeToolboxReadme } from "../codegen/readme.js";

export function syncCommand() {
  // Defensive handling of defaultConfigPath to ensure it always returns a string
  let defaultConfigPathValue: string;
  try {
    defaultConfigPathValue = defaultConfigPath();
    if (!defaultConfigPathValue || typeof defaultConfigPathValue !== "string") {
      defaultConfigPathValue = "mcp-toolbox.config.ts";
    }
  } catch (err) {
    defaultConfigPathValue = "mcp-toolbox.config.ts";
  }

  const cmd = new Command("sync")
    .description(
      "Introspect servers, snapshot schemas, and regenerate wrappers"
    )
    .option("--config <path>", "Path to config file", defaultConfigPathValue)
    .option("--yes", "Run non-interactively (accept breaking changes)", false)
    .option(
      "--check",
      "Fail if upstream changed but code not regenerated",
      false
    )
    .option("--no-format", "Skip formatting generated output with oxfmt")
    .action(async (opts) => {
      let p: ReturnType<typeof progress> | undefined;
      let progressStarted = false;
      try {
        const configPath: string = opts.config;
        const nonInteractive: boolean = Boolean(opts.yes);
        const checkOnly: boolean = Boolean(opts.check);
        const shouldFormat: boolean = Boolean(opts.format);

        if (!(await fileExists(configPath))) {
          const errorMsg = `Config file not found at ${configPath}. Run 'mcp-toolbox init' first.`;
          log.error(errorMsg);
          process.exitCode = 1;
          return;
        }

        const config = await loadToolboxConfig(configPath);
        // Resolve outDir relative to config file location, not cwd
        const resolvedConfigPath = path.resolve(configPath);
        const configDir = path.dirname(resolvedConfigPath);
        const outDir = path.resolve(
          configDir,
          config.generation.outDir || "toolbox"
        );

        const entriesForCatalog: Array<{
          serverSlug: string;
          serverName: string;
          snapshot: any;
        }> = [];

        let anyOutOfSync = false;
        const breakingChanges: Array<{
          serverName: string;
          oldVersion: string;
          newVersion: string;
        }> = [];

        // Track results for summary
        const successfulServers: Array<{
          serverName: string;
          toolsCount: number;
        }> = [];
        const failedServers: Array<{ serverName: string; error: string }> = [];

        const totalServers = config.servers.length;
        p = progress({ max: totalServers });
        let completedCount = 0;

        if (totalServers > 0) {
          p.start("Syncing servers...");
          progressStarted = true;

          for (let i = 0; i < config.servers.length; i++) {
            const serverCfg = config.servers[i];
            if (!serverCfg) continue;

            const current = i + 1;
            // Validate server name before using it
            if (!serverCfg.name || typeof serverCfg.name !== "string") {
              throw new Error(
                `Server at index ${i} has invalid or missing name: ${serverCfg.name}`
              );
            }
            const serverSlug = slugifyServerName(serverCfg.name);
            const baseDir = path.join(outDir, ".snapshots", serverSlug);
            const latestJsonPath = path.join(baseDir, "latest.json");
            const latestMetaPath = path.join(baseDir, "latest.meta.json");

            try {
              const oldSnap = await readJsonIfExists<any>(latestJsonPath);
              const oldMeta = await readJsonIfExists<SnapshotMeta>(
                latestMetaPath
              );

              let newSnap;
              try {
                newSnap = await introspectServer({
                  serverConfig: serverCfg,
                  allowStdioExec: config.security.allowStdioExec,
                });
              } catch (introspectError) {
                throw introspectError;
              }

              const newFingerprintCandidate = fingerprintFromTools(newSnap);
              const oldFingerprint = oldMeta?.schemaFingerprint;
              const changed = oldFingerprint
                ? oldFingerprint !== newFingerprintCandidate
                : true;

              if (checkOnly) {
                if (changed) anyOutOfSync = true;
                p.advance(
                  1,
                  changed
                    ? `${serverCfg.name}: Changed`
                    : `${serverCfg.name}: Up to date`
                );
                continue;
              }

              // Continue processing (code generation is fast, no status needed)

              // Diff/report only (we never patch generated output; we always regenerate).
              if (oldSnap) {
                const diff = diffSnapshots(oldSnap, newSnap);
                if (diff.changes.length > 0) {
                  const report = renderDiffReport({
                    serverName: serverCfg.name,
                    oldVersion: oldSnap.version,
                    newVersion: newSnap.version,
                    diff,
                  });

                  const reportsDir = path.join(outDir, ".reports", serverSlug);
                  await fs.mkdir(reportsDir, { recursive: true });
                  const reportName = `${new Date()
                    .toISOString()
                    .replace(/[:.]/g, "-")}.md`;
                  await fs.writeFile(
                    path.join(reportsDir, reportName),
                    report,
                    "utf-8"
                  );

                  // Collect breaking changes for interactive mode
                  if (diff.breaking && !nonInteractive) {
                    breakingChanges.push({
                      serverName: serverCfg.name,
                      oldVersion: oldSnap.version,
                      newVersion: newSnap.version,
                    });
                  }
                }
              }

              // Generate code
              await writeLatestSnapshot({
                outDir,
                serverSlug,
                serverName: serverCfg.name,
                introspected: newSnap,
              });

              await generateServerTs({
                outDir,
                serverSlug,
                serverName: serverCfg.name,
                snapshot: newSnap,
              });

              entriesForCatalog.push({
                serverSlug,
                serverName: serverCfg.name,
                snapshot: newSnap,
              });
              successfulServers.push({
                serverName: serverCfg.name,
                toolsCount: newSnap.tools.length,
              });
              completedCount++;
              p.advance(
                1,
                `✓ ${serverCfg.name} (${newSnap.tools.length} tools)`
              );
            } catch (error: unknown) {
              const errorMsg =
                error instanceof Error ? error.message : String(error);
              failedServers.push({
                serverName: serverCfg.name,
                error: errorMsg,
              });
              completedCount++;
              p.advance(1, `✗ ${serverCfg.name}: Failed`);
            }
          }

          // Stop progress bar with summary message (replaces redundant "Complete" step)
          if (progressStarted) {
            if (!checkOnly) {
              if (failedServers.length > 0) {
                p.stop(
                  `✗ ${failedServers.length} server${
                    failedServers.length === 1 ? "" : "s"
                  } failed`
                );
              } else if (successfulServers.length > 0) {
                const toolsCount = successfulServers.reduce(
                  (sum, s) => sum + s.toolsCount,
                  0
                );
                p.stop(
                  `Synced ${successfulServers.length} server${
                    successfulServers.length === 1 ? "" : "s"
                  } (${toolsCount} tool${toolsCount === 1 ? "" : "s"} total)`
                );
              } else {
                p.stop();
              }
            } else {
              // Check-only mode: show sync status
              if (anyOutOfSync) {
                p.stop("Out of sync");
              } else {
                p.stop("Up to date");
              }
            }
            progressStarted = false;
          }
        }

        // Display detailed summary (only for errors in non-check mode)
        if (!checkOnly) {
          if (failedServers.length > 0) {
            log.error(
              `${failedServers.length} server${
                failedServers.length === 1 ? "" : "s"
              } failed:`
            );
            for (const failed of failedServers) {
              log.error(`  - ${failed.serverName}: ${failed.error}`);
            }
          }

          // Handle breaking changes after all tasks complete (in interactive mode)
          if (!nonInteractive && breakingChanges.length > 0) {
            const serversList = breakingChanges
              .map(
                (b) => `  - ${b.serverName} (${b.oldVersion} → ${b.newVersion})`
              )
              .join("\n");
            const ok = await confirm({
              message: `Breaking changes detected for ${breakingChanges.length} server(s):\n${serversList}\n\nCode has been regenerated. Continue?`,
              initialValue: true,
            });
            if (isCancel(ok) || !ok) {
              throw new Error("Aborted by user.");
            }
          }

          // Set exit code based on failures
          if (failedServers.length > 0) {
            process.exitCode = 1;
          }
        } else {
          // Check-only mode summary
          if (anyOutOfSync) {
            log.warn("Some servers are out of sync");
            process.exitCode = 1;
          } else {
            log.success("All servers are up to date");
          }
        }

        if (checkOnly) {
          return;
        }

        await writeCatalog({ outDir, entries: entriesForCatalog });
        await writeToolboxReadme(outDir);

        if (shouldFormat) {
          await tryFormatWithOxfmt(outDir);
        }
      } catch (error: unknown) {
        // Stop progress bar if it was started
        if (p && progressStarted) {
          p.stop("Sync failed");
        }
        const errorMsg = error instanceof Error ? error.message : String(error);
        log.error(errorMsg);
        process.exitCode = 1;
      }
    });

  return cmd;
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const txt = await fs.readFile(filePath, "utf-8");
    return JSON.parse(txt) as T;
  } catch {
    return null;
  }
}

function fingerprintFromTools(snap: {
  tools: unknown;
  version: string;
  serverName: string;
}) {
  return fingerprint({
    serverName: snap.serverName,
    version: snap.version,
    tools: snap.tools,
  });
}

async function tryFormatWithOxfmt(targetDir: string) {
  // Use local binary if available; fall back to npx.
  const localBin = path.join(process.cwd(), "node_modules", ".bin", "oxfmt");
  const cmd = await fileExists(localBin).then((ok) => (ok ? localBin : "npx"));
  const args =
    cmd === "npx"
      ? ["--no-install", "oxfmt", "--write", targetDir]
      : ["--write", targetDir];
  await spawnAndWait(cmd, args);
}

async function spawnAndWait(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `${command} ${args.join(" ")} failed with exit code ${code}`
          )
        );
    });
  });
}
