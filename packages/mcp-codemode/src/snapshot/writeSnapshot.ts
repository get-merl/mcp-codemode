import fs from "node:fs/promises";
import path from "node:path";
import type { IntrospectedServer } from "../introspect/types.js";
import { fingerprint } from "./fingerprint.js";

export type SnapshotMeta = {
  retrievedAt: string;
  serverName: string;
  transport: IntrospectedServer["transport"];
  serverReportedVersion: string;
  schemaFingerprint: string;
};

export async function writeLatestSnapshot(args: {
  outDir: string;
  serverSlug: string;
  serverName: string;
  introspected: IntrospectedServer;
}) {
  const baseDir = path.join(args.outDir, ".snapshots", args.serverSlug);
  await fs.mkdir(baseDir, { recursive: true });

  const schemaFingerprint = fingerprint({
    serverName: args.introspected.serverName,
    version: args.introspected.version,
    tools: args.introspected.tools,
  });

  const meta: SnapshotMeta = {
    retrievedAt: args.introspected.retrievedAt,
    serverName: args.serverName,
    transport: args.introspected.transport,
    serverReportedVersion: args.introspected.version,
    schemaFingerprint,
  };

  const latestJsonPath = path.join(baseDir, "latest.json");
  const latestMetaPath = path.join(baseDir, "latest.meta.json");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const historicalPath = path.join(baseDir, `${timestamp}.json`);

  const snapshotBody = JSON.stringify(args.introspected, null, 2) + "\n";
  await fs.writeFile(latestJsonPath, snapshotBody, "utf-8");
  await fs.writeFile(historicalPath, snapshotBody, "utf-8");
  await fs.writeFile(latestMetaPath, JSON.stringify(meta, null, 2) + "\n", "utf-8");

  return { latestJsonPath, latestMetaPath, schemaFingerprint };
}

