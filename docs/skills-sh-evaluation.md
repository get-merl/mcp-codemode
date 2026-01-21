## skills.sh evaluation (2026-01-20)

### What it is

skills.sh is a directory and installer for "agent skills" - reusable, text-only
instruction sets stored in `SKILL.md` files with YAML frontmatter (`name`,
`description`, optional `metadata`). The published npm CLI is `skills`, which is
a thin wrapper around the `add-skill` CLI.

### CLI behavior (observed)

- `npx skills --help` shows `init` and `add` commands.
- `npx skills add <owner/repo>` delegates to `npx add-skill ...` and is
  interactive by default.
- `npx skills init <name>` creates a template skill at
  `<name>/SKILL.md` (or `./SKILL.md` if no name is provided).
- `npx add-skill <source>` supports GitHub/GitLab URLs, shorthand (`owner/repo`),
  and local paths.
- Non-interactive installs are possible with:
  - `--skill <name>` (skip selection prompt)
  - `--agent <agent>` (skip agent selection)
  - `--yes` (skip confirmations)
  - `--global` (install to user-level paths)
  - `--list` (list skills without installing)
  - `--all` (install all skills to all agents, implies `--yes --global`)

### Installation test (separate branch)

Repository used: `vercel-labs/agent-skills`

Commands:

```
npx add-skill vercel-labs/agent-skills --list
npx add-skill vercel-labs/agent-skills \
  --skill vercel-react-best-practices \
  --agent cursor \
  --yes
```

Observed behavior:

- The tool clones the repo to a temp directory, discovers `SKILL.md` files,
  prompts for skill/agent selection unless flags are supplied, and copies the
  skill directory into an agent-specific install location.
- For Cursor (project-level), the install path is:
  `.cursor/skills/<skill-name>/`.
- The installer copies the skill directory recursively and excludes:
  - `README.md`
  - `metadata.json`
  - any file prefixed with `_`
- Telemetry is enabled by default (`DISABLE_TELEMETRY=1` or `DO_NOT_TRACK=1`
  disables it).

Files created (Cursor, project-level):

```
.cursor/skills/vercel-react-best-practices/
  SKILL.md
  AGENTS.md
  rules/
    async-parallel.md
    bundle-barrel-imports.md
    ...
```

`npx skills init test-skill` created:

```
test-skill/SKILL.md
```

with a simple YAML-frontmatter template and placeholder instructions.

### Is this a competitor to codemode?

Not directly. Skills are static, text-only instructions that improve agent
behavior and discoverability. They do **not** provide executable tools, runtime
APIs, schemas, or live data access. MCP servers (and codemode's generated SDK)
remain necessary for any action that requires external data or side effects.

Where skills can overlap:

- Runbooks, guidelines, and procedural knowledge currently stored as markdown
  or prompt snippets could be packaged as skills instead of (or alongside) MCP
  tools.
- This is a *content distribution* channel rather than a tool-transport layer.

Conclusion: skills do not make MCP servers irrelevant. They can reduce the need
for some "instruction-only" MCP tools, but cannot replace tools that perform
real actions or access external systems.

### How we could use skills to improve codemode

1. **Publish a codemode skill repo**
   - Create `skills/` containing `SKILL.md` files that teach agents how to use
     codemode in a repo (e.g., how to search `codemode/catalog.json`, run
     generated tool wrappers, and choose MCP servers).
   - This makes codemode discoverable from the skills directory and usable via
     `npx skills add <owner/repo>`.

2. **Generate skills from MCP metadata**
   - Add an optional codemode CLI command to emit `SKILL.md` per server or per
     tool category (from `codemode/catalog.json`).
   - Each skill could include:
     - tool summaries
     - example invocations
     - "when to use" heuristics

3. **Ship a "codemode usage" skill inside repos**
   - Add a `SKILL.md` (or `.cursor/skills/` entry) during `mcp-codemode init`
     so users immediately get guidance on how to use codemode effectively.

4. **Improve discoverability in multi-agent ecosystems**
   - Skills are supported by many agents (Cursor, Claude Code, Codex, etc.).
   - Publishing codemode skills would allow non-MCP-aware agents to discover
     codemode-provided capabilities via instructions, even if they cannot load
     MCP schemas directly.

### Risks / limitations to note

- Skills are untyped and non-executable; they rely on agent compliance.
- Installation is agent-specific, and some agents need extra configuration
  (e.g., Kiro CLI `resources`).
- Telemetry is on by default in `add-skill` (should be documented if we depend
  on it in CI).
