import { Command } from "commander";
import { spinner } from "@clack/prompts";
import { RegistryClient } from "../registry/client.js";

export function registryCommand() {
  const cmd = new Command("registry").description("Query the MCP registry");

  cmd
    .command("search")
    .argument("<query>", "Search term")
    .option("--json", "Output machine-readable JSON", false)
    .action(async (query: string, opts) => {
      const s = spinner();
      s.start("Searching registry…");
      const client = new RegistryClient();
      const res = await client.listServers({ search: query, version: "latest" });
      s.stop(`Found ${res.servers?.length ?? 0} servers`);

      if (opts.json) {
        process.stdout.write(JSON.stringify(res, null, 2) + "\n");
        return;
      }

      for (const entry of res.servers ?? []) {
        const server = entry.server;
        console.log(`${server.name}@${server.version} — ${server.title ?? server.description}`);
      }
    });

  cmd
    .command("list")
    .option("--json", "Output machine-readable JSON", false)
    .action(async (opts) => {
      const s = spinner();
      s.start("Listing registry servers…");
      const client = new RegistryClient();
      const res = await client.listServers({ version: "latest", limit: 30 });
      s.stop(`Got ${res.servers?.length ?? 0} servers (page)`);

      if (opts.json) {
        process.stdout.write(JSON.stringify(res, null, 2) + "\n");
        return;
      }

      for (const entry of res.servers ?? []) {
        const server = entry.server;
        console.log(`${server.name}@${server.version} — ${server.title ?? server.description}`);
      }
      if (res.metadata?.next_cursor) {
        console.log(`next_cursor: ${res.metadata.next_cursor}`);
      }
    });

  cmd
    .command("show")
    .argument("<id>", "Registry server ID")
    .option("--json", "Output machine-readable JSON", false)
    .option("--version <version>", "Version to fetch (default: latest)", "latest")
    .action(async (id: string, opts) => {
      const s = spinner();
      s.start(`Fetching ${id}@${opts.version}…`);
      const client = new RegistryClient();
      const res = await client.getServerVersion({ serverName: id, version: opts.version });
      s.stop("Fetched");

      if (opts.json) {
        process.stdout.write(JSON.stringify(res, null, 2) + "\n");
        return;
      }

      const server = res.server;
      console.log(`${server.name}@${server.version}`);
      console.log(server.title ?? "");
      console.log(server.description);
      if (server.websiteUrl) console.log(`website: ${server.websiteUrl}`);
    });

  return cmd;
}

