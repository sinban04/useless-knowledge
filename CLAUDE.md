# CLAUDE.md — useless-knowledge

Repo-specific rules for AI agents working in `sinban04/useless-knowledge`. The workspace-level `CLAUDE.md` at `/home1/irteam/play/injung/CLAUDE.md` still applies (read `PAT.md`, use `github.com` only, etc.) — the rules below add to it.

## Rule: auto-upload on every modification

**Whenever you modify any source file in this repo, commit and push to `origin` immediately as part of the same turn.**

- **Why:** this repo's purpose is *publishing* curated research for collaborators ([@sinban04](https://github.com/sinban04), [@Jaehoss](https://github.com/Jaehoss), [@sedie1234](https://github.com/sedie1234)) and the public to read. Local changes have zero value until they are on GitHub. Keeping the remote always in sync also avoids the three of us stomping on each other's work.
- **How to apply:**
  1. After finishing the edit(s), run `git add <files>` (prefer named files over `git add -A`).
  2. Commit with a short, descriptive message — no need to ask first.
  3. Push to `origin` on the current branch — no need to ask first.
  4. Briefly tell the user what was committed and pushed (one line).
- **Standing authorization:** the user has pre-authorized commits and pushes in this repo via this rule. You do **not** need to ask before each push.
- **Still confirm before:** force-pushing (`--push --force` / `+refs`), rewriting published history (`rebase`, `commit --amend` after a push), deleting branches, or anything destructive to shared state. Standing auth is for additive pushes only.
- **If a push or hook fails:** stop and surface the error. Do not retry with `--no-verify` or `--force`. Diagnose the root cause first.

## Conventions

- Content language: free (mix Korean / English as the author prefers).
- File layout: not fixed yet. Match what `probe-lab` does (`YYYY-MM-DD-<title>-<author>.md` or a directory of the same name with a `README.md` inside) unless a different structure makes sense for the topic.
- Don't commit raw drafts that haven't been curated for public reading — that's what `probe-lab` in `useless-engineers` is for.
