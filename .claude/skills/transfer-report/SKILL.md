---
name: transfer-report
description: Port a single report from sinban04/useless-engineers's `probe-lab/` directory into this repo's `report/` directory, preserving the original folder or file name verbatim (including the `YYYY-MM-DD-` date prefix). Use this skill whenever the user asks to transfer, port, copy, move, publish, upload, share, or "transfer-report" a probe-lab study — including when they paste a `github.com/sinban04/useless-engineers` URL that points inside `probe-lab/`, mention a probe-lab dated folder or file name (e.g., `2026-03-20-anti-cancer-medication` or `2026-03-06-Wireless-Power-Transfer-Suhwan.md`), say things like "put this probe-lab study on useless-knowledge", "make this report public", "publish this", or refer to "the anti-cancer one" / any other fuzzy probe-lab reference. Handles pulling the source repo first, copying the report as-is, and committing + pushing per this repo's auto-upload rule.
---

# transfer-report

Port a single report from the working/private research repo (`sinban04/useless-engineers`, in `probe-lab/`) into this publishing repo (`sinban04/useless-knowledge`, in `report/`). Preserve the original name verbatim — date prefix and all — and don't touch the contents.

## Why this skill exists

`probe-lab` (in `useless-engineers`) is where the three collaborators ([@sinban04](https://github.com/sinban04), [@Jaehoss](https://github.com/Jaehoss), [@sedie1234](https://github.com/sedie1234)) draft their weekly deep-dive research. `useless-knowledge` is where finished pieces get published for the public to read. Porting is therefore a frequent, repetitive flow — same `cp -r` + same commit + push every time. This skill encodes that flow so the assistant can execute it consistently without rediscovering the procedure each time.

The repo's owner has been explicit about how the port should look: **as-is, including the date prefix, no in-file "Source:" footer, no editorial header.** Honor that — don't get creative.

## Workspace layout this skill assumes

```
<workspace-root>/                              ← /home1/irteam/play/injung/
├── useless-engineers/probe-lab/<name>         ← source (file OR directory)
└── useless-knowledge/report/<name>            ← destination (same name verbatim)
```

Resolve the destination repo root with `git rev-parse --show-toplevel` (run inside `useless-knowledge`). The source is a sibling: `<repo-root>/../useless-engineers/probe-lab/`.

## Workflow

### 1. Identify the source

The user might give you any of these — handle them all:

| Input form | Example |
|---|---|
| Full GitHub URL | `https://github.com/sinban04/useless-engineers/tree/main/probe-lab/2026-03-20-anti-cancer-medication` |
| `blob` URL to single file | `.../blob/main/probe-lab/2026-03-06-Wireless-Power-Transfer-Suhwan.md` |
| Folder name | `2026-03-20-anti-cancer-medication` |
| Single-file name | `2026-03-06-Wireless-Power-Transfer-Suhwan.md` |
| Fuzzy reference | "the anti-cancer one", "Suhwan's wireless power one" |

For URLs, extract the path segment after `probe-lab/`. For fuzzy references, `ls ../useless-engineers/probe-lab/` and match. If multiple plausible matches, ask which one — don't guess.

### 2. Refresh the source repo

probe-lab gets edits, so a stale local clone may miss updates. Before copying:

```bash
cd <workspace-root>/useless-engineers
git pull --ff-only
```

If `useless-engineers` isn't cloned locally yet, stop and ask the user before cloning. They can authorize cloning from `https://github.com/sinban04/useless-engineers.git` (the GitHub PAT lives in `<workspace-root>/PAT.md` — that's the convention already established in this workspace; see the workspace-level `CLAUDE.md`).

### 3. Pre-flight check the destination

```bash
ls <repo-root>/report/<name> 2>/dev/null
```

If it already exists, **stop and ask the user before proceeding**. Updating an existing report and accidentally re-running the port are two different intentions that need different handling. Don't silently overwrite.

### 4. Copy as-is

```bash
mkdir -p <repo-root>/report
cp -r <workspace-root>/useless-engineers/probe-lab/<name> <repo-root>/report/
```

- `cp -r` works correctly for both single `.md` files and directories — probe-lab uses both conventions.
- **Do not rename. Do not restructure. Do not add headers or footers. Do not insert a `Source:` line inside any file.** The owner of this repo has said this explicitly and repeatedly; it's not a stylistic preference you can override.

### 5. Verify the copy landed correctly

For a **directory** source:

```bash
# file counts should match
ls <workspace-root>/useless-engineers/probe-lab/<name> | wc -l
ls <repo-root>/report/<name>                          | wc -l
```

For a **single-file** source:

```bash
# both paths should exist with the same size
ls -la <workspace-root>/useless-engineers/probe-lab/<name>
ls -la <repo-root>/report/<name>
```

If counts/sizes diverge, something went wrong — investigate before committing.

### 6. Commit and push

This repo's `CLAUDE.md` grants **standing authorization** to commit + push after modifications. No need to ask the user before each push. Use this template:

```bash
cd <repo-root>
git add report/<name>
git commit -m "$(cat <<'EOF'
Add report: <name>

Ported from sinban04/useless-engineers probe-lab. <one-line factual
topic description — what the report covers, drawn from its TOC or
first chapter or filename. Keep it descriptive, not editorial.>

Source: https://github.com/sinban04/useless-engineers/tree/main/probe-lab/<name>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

Notes on the message:
- The `Source:` line goes in the **commit message** only — never inside any file in the destination repo.
- For directory ports, include the file count and the kinds of files in the body (e.g., "TOC, 11 chapters, consolidated paper, 5 glossaries"). For single-file ports, one line of topic summary is enough.
- If `git push` fails (auth, hook, non-fast-forward), surface the error and stop. Don't `--force` or `--no-verify`.

### 7. Report back

Tell the user in one or two lines: the report name, the file count (or "single file"), and the resulting commit hash. Example:

> Ported `2026-04-24-gpu-arch-101` (8 files) — commit `a1b2c3d` pushed to `origin/main`.

## Edge cases and variations

- **User wants to port multiple reports**: do them one at a time, one commit each. One report per commit keeps history reviewable and lets the user revert a single port if they change their mind.
- **User wants to update an already-ported report**: the file already exists in `report/`. Confirm intent before overwriting (step 3 catches this). If confirmed, run `cp -r` again — it will overwrite — then commit with a message like "Update report: <name>" plus a short note on what changed.
- **User wants to port from outside `probe-lab/`**: this skill is scoped to `probe-lab/` because that's the curated research source. If they want something from another path in `useless-engineers`, confirm intent explicitly before going there — most likely the file doesn't belong on the public repo.
- **Source has been deleted from `probe-lab/` upstream**: rare, but if `git pull --ff-only` removed the directory, stop and ask the user; the report may have been retracted intentionally.

## When this skill does NOT apply

- The user is writing a **brand-new** report directly in `useless-knowledge` with no probe-lab origin. Just edit the files normally — this skill is specifically for porting, not authoring.
- The user is editing a typo or making a small in-place fix to an already-ported report. Just edit and commit per the auto-upload rule. No porting needed.
- The user wants to port something to a different repo (not `useless-knowledge`). This skill is project-scoped to `useless-knowledge`; don't try to apply it elsewhere.
