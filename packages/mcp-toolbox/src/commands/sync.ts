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

const DEBUG_LOG_PATH = "/Users/shubhankarsharan/Desktop/mcp-toolbox/.cursor/debug.log";
async function debugLog(payload: any) {
  try {
    await fs.appendFile(DEBUG_LOG_PATH, JSON.stringify(payload) + "\n", "utf-8");
  } catch {}
}

export function syncCommand() {
  const cmd = new Command("sync")
    .description(
      "Introspect servers, snapshot schemas, and regenerate wrappers"
    )
    .option("--config <path>", "Path to config file", defaultConfigPath())
    .option("--yes", "Run non-interactively (accept breaking changes)", false)
    .option(
      "--check",
      "Fail if upstream changed but code not regenerated",
      false
    )
    .option("--no-format", "Skip formatting generated output with oxfmt")
    .action(async (opts) => {
      // #region agent log
      await debugLog({location: "sync.ts:39", message: "sync action entry", data: { configPath: opts.config }, timestamp: Date.now(), sessionId: "debug-session", runId: "run1", hypothesisId: "A"});
      // #endregion
      try {
        const configPath: string = opts.config;
        const nonInteractive: boolean = Boolean(opts.yes);
        const checkOnly: boolean = Boolean(opts.check);
        const shouldFormat: boolean = Boolean(opts.format);

        if (!(await fileExists(configPath))) {
          const errorMsg = `Config file not found at ${configPath}. Run 'mcp-toolbox init' first.`;
          console.error(errorMsg);
          process.exitCode = 1;
          return;
        }

        const config = await loadToolboxConfig(configPath);
        // #region agent log
        fetch(
          "http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "sync.ts:53",
              message: "config loaded",
              data: {
                serversCount: config.servers?.length,
                servers: config.servers?.map((s: any) => ({
                  name: s?.name,
                  hasName: !!s?.name,
                })),
              },
              timestamp: Date.now(),
              sessionId: "debug-session",
              runId: "run1",
              hypothesisId: "A,E",
            }),
          }
        ).catch(() => {});
        // #endregion
        const outDir = config.generation.outDir || "toolbox";

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
        const p = progress({ max: totalServers });

        if (totalServers > 0) {
          p.start("Syncing servers...");

          for (let i = 0; i < config.servers.length; i++) {
            const serverCfg = config.servers[i];
            // #region agent log
            fetch(
              "http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  location: "sync.ts:82",
                  message: "server loop entry",
                  data: {
                    index: i,
                    serverCfg: serverCfg
                      ? {
                          name: serverCfg.name,
                          hasName: !!serverCfg.name,
                          transportType: serverCfg.transport?.type,
                        }
                      : null,
                  },
                  timestamp: Date.now(),
                  sessionId: "debug-session",
                  runId: "run1",
                  hypothesisId: "A,E",
                }),
              }
            ).catch(() => {});
            // #endregion
            if (!serverCfg) continue;

            const current = i + 1;
            // #region agent log
            fetch(
              "http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  location: "sync.ts:87",
                  message: "before slugifyServerName",
                  data: {
                    serverName: serverCfg.name,
                    serverNameType: typeof serverCfg.name,
                    isUndefined: serverCfg.name === undefined,
                    isNull: serverCfg.name === null,
                  },
                  timestamp: Date.now(),
                  sessionId: "debug-session",
                  runId: "run1",
                  hypothesisId: "A",
                }),
              }
            ).catch(() => {});
            // #endregion
            const serverSlug = slugifyServerName(serverCfg.name);
            // #region agent log
            fetch(
              "http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  location: "sync.ts:87",
                  message: "after slugifyServerName",
                  data: { serverSlug },
                  timestamp: Date.now(),
                  sessionId: "debug-session",
                  runId: "run1",
                  hypothesisId: "A",
                }),
              }
            ).catch(() => {});
            // #endregion
            const baseDir = path.join(outDir, ".snapshots", serverSlug);
            const latestJsonPath = path.join(baseDir, "latest.json");
            const latestMetaPath = path.join(baseDir, "latest.meta.json");

            try {
              p.message(
                `Processing ${serverCfg.name} (${current}/${totalServers})...`
              );

              const oldSnap = await readJsonIfExists<any>(latestJsonPath);
              const oldMeta = await readJsonIfExists<SnapshotMeta>(
                latestMetaPath
              );

              p.message(`Introspecting ${serverCfg.name}...`);
              // #region agent log
              fetch(
                "http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    location: "sync.ts:102",
                    message: "before introspectServer",
                    data: {
                      serverName: serverCfg.name,
                      allowStdioExec: config.security.allowStdioExec,
                    },
                    timestamp: Date.now(),
                    sessionId: "debug-session",
                    runId: "run1",
                    hypothesisId: "B",
                  }),
                }
              ).catch(() => {});
              // #endregion
              const newSnap = await introspectServer({
                serverConfig: serverCfg,
                allowStdioExec: config.security.allowStdioExec,
              });
              // #region agent log
              fetch(
                "http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    location: "sync.ts:106",
                    message: "after introspectServer",
                    data: {
                      serverName: newSnap?.serverName,
                      toolsCount: newSnap?.tools?.length,
                      transport: newSnap?.transport,
                    },
                    timestamp: Date.now(),
                    sessionId: "debug-session",
                    runId: "run1",
                    hypothesisId: "B,C",
                  }),
                }
              ).catch(() => {});
              // #endregion

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

              p.message(
                `Processing ${serverCfg.name} (${newSnap.tools.length} tools)...`
              );

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
                  // #region agent log
                  const dateObj = new Date();
                  const isoString = dateObj.toISOString();
                  fetch(
                    "http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        location: "sync.ts:142",
                        message: "before report filename replace",
                        data: {
                          isoString,
                          isoStringType: typeof isoString,
                          isUndefined: isoString === undefined,
                        },
                        timestamp: Date.now(),
                        sessionId: "debug-session",
                        runId: "run1",
                        hypothesisId: "D",
                      }),
                    }
                  ).catch(() => {});
                  // #endregion
                  const reportName = `${isoString.replace(/[:.]/g, "-")}.md`;
                  // #region agent log
                  fetch(
                    "http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        location: "sync.ts:144",
                        message: "after report filename replace",
                        data: { reportName },
                        timestamp: Date.now(),
                        sessionId: "debug-session",
                        runId: "run1",
                        hypothesisId: "D",
                      }),
                    }
                  ).catch(() => {});
                  // #endregion
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

              p.message(`Generating code for ${serverCfg.name}...`);
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
              p.advance(
                1,
                `${serverCfg.name}: Done (${newSnap.tools.length} tools)`
              );
            } catch (error: unknown) {
              // #region agent log
              fetch(
                "http://127.0.0.1:7243/ingest/606b7f00-1f79-4b8d-bf62-9515bf8b961d",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    location: "sync.ts:190",
                    message: "error caught in server loop",
                    data: {
                      serverName: serverCfg.name,
                      errorMessage:
                        error instanceof Error ? error.message : String(error),
                      errorStack:
                        error instanceof Error ? error.stack : undefined,
                      errorType: error?.constructor?.name,
                    },
                    timestamp: Date.now(),
                    sessionId: "debug-session",
                    runId: "run1",
                    hypothesisId: "A,B,C,D",
                  }),
                }
              ).catch(() => {});
              // #endregion
              const errorMsg =
                error instanceof Error ? error.message : String(error);
              failedServers.push({
                serverName: serverCfg.name,
                error: errorMsg,
              });
              p.advance(1, `${serverCfg.name}: Failed`);
            }
          }

          p.stop("Sync complete");
        }

        // Display summary
        if (!checkOnly) {
          const totalProcessed =
            successfulServers.length + failedServers.length;
          if (totalProcessed > 0) {
            log.info(
              `Processed ${totalProcessed} server${
                totalProcessed === 1 ? "" : "s"
              }`
            );
          }

          if (successfulServers.length > 0) {
            log.success(
              `${successfulServers.length} server${
                successfulServers.length === 1 ? "" : "s"
              } synced successfully`
            );
          }

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
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(errorMsg);
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
