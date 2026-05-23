# Design Spec — `useless-knowledge` landing page

| Field | Value |
|---|---|
| Project | Single-page static landing site for `sinban04/useless-knowledge` |
| Status | Approved (2026-05-23) |
| Author | Brainstormed with [@sinban04](https://github.com/sinban04); design proposals dispatched as parallel design agents |
| Hosting | GitHub Pages (deploy from `main` / `/`) |
| Visual direction | Modern arXiv — Newsreader serif body + JetBrains Mono metadata, single cinnabar accent for links only |

## 1. Goal

Publish a single static HTML page at the root of `sinban04/useless-knowledge` that lists the published reports and serves as the public face of the repo at `https://sinban04.github.io/useless-knowledge/`. The page must be readable on its own merits — the kind of site a working researcher in 2026 would respect — and act as the routing layer to per-report content.

## 2. Non-goals (YAGNI)

The following are out of scope. Add later only when a concrete need exists.

- Search across reports
- Tag system / filters
- RSS / Atom feed
- Pagination (revisit at ≥ 20 reports)
- Analytics / cookies / tracking
- Comment system
- Multilingual UI chrome (chrome stays English; content language is shown per report)
- Custom 404 page
- Per-page interactive features

## 3. Constraints (locked)

- Single HTML file (`index.html`) plus a single CSS file (`css/style.css`).
- No JavaScript framework, no build tooling, no bundler, no package.json.
- Vanilla CSS only — no preprocessors.
- Dark mode via `prefers-color-scheme` auto-detect — no toggle button.
- Per-report metadata shows a language chip (`KR` / `EN`) and an author chip when the source dirname carries an author suffix; otherwise the author chip is omitted (no guessing).
- Deploys to GitHub Pages from `main` branch root via repo settings — no Actions workflow.

## 4. File layout

```
useless-knowledge/
├── index.html                 ← landing page (new)
├── css/
│   └── style.css              ← styles (new)
├── README.md                  ← unchanged; remains the github.com-native fallback
├── CLAUDE.md                  ← unchanged
├── AGENTS.md                  ← unchanged (symlink to CLAUDE.md)
├── .claude/
│   └── skills/
│       └── transfer-report/SKILL.md   ← updated in a follow-up (see §11)
└── report/
    └── <existing 5 entries>   ← unchanged
```

GitHub Pages auto-prefers `index.html` over `README.md` when both exist at the root, so the landing page becomes the served entry point.

## 5. Page sections (top → bottom)

1. **Header.** Wordmark `useless-knowledge` (JetBrains Mono, lowercase, 0.95rem) on the left; right-aligned link `[ github ↗ ]` to `https://github.com/sinban04/useless-knowledge`.
2. **Hairline rule** beneath the header.
3. **About blurb.** Two short paragraphs of self-description; first paragraph derived from the README's opening; second points readers at the broader `probe-lab` context.
4. **Stats line.** `<N> reports · updated <YYYY-MM-DD>` rendered in JetBrains Mono small. `<N>` is the literal count of report entries on the page; `<YYYY-MM-DD>` is the date of the most-recently-listed report (i.e. the date prefix of the first entry in the reverse-chronological list). Both update whenever a report is added.
5. **Double-rule** separator — the only decorative rule on the page; pattern: `border-top: 1px solid var(--rule); padding-top: 3px; border-bottom: 1px solid var(--rule)`.
6. **Reports list.** Each entry is a `<article>` containing: date and chips row, an `<h2>` title link, then a short dek paragraph. Entries appear in reverse chronological order.
7. **Hairline rules** between report entries (1px, ~50% width, left-aligned).
8. **Footer.** Collaborators line on the left (`sinban04 · Jaehoss · sedie1234`); the right-aligned link `useless-engineers / probe-lab` points to `https://github.com/sinban04/useless-engineers/tree/main/probe-lab` for readers who want the source side.

## 6. Per-report data model

Each `<article>` carries the following fields. The list is currently maintained inline in `index.html` — no JSON/YAML manifest, no build step, no template engine. Future additions follow the same pattern (and the `transfer-report` skill update in §11 will template them).

| Field | Required | Source |
|---|---|---|
| `date` (YYYY-MM-DD) | yes | from the source directory name's prefix |
| `href` | yes | `https://github.com/sinban04/useless-knowledge/tree/main/report/<dirname>` (see §9 for the transition rationale) |
| `title` (Display Title) | yes | human-readable rewrite of the dirname; current values match the README's `## Reports` section |
| `language` (`KR` / `EN`) | yes | determined from content language at port time |
| `author` (e.g. `Suhwan`) | optional | from the dirname's author suffix; omitted if no suffix is present — never guessed |
| `dek` (one line) | yes | factual one-line summary; reused verbatim from the README's `## Reports` section so README and landing page stay consistent |

### 6.1 Initial 5 entries

| Date | Display Title | Lang | Author |
|---|---|---|---|
| 2026-05-15 | Principles of Taste | KR | Suhwan |
| 2026-05-01 | ATP, Energy, and Kinases | EN | — |
| 2026-04-17 | AI Compiler | KR | Suhwan |
| 2026-03-20 | Anti-Cancer Medication Generations | EN | — |
| 2026-03-06 | Wireless Power Transfer | KR | Suhwan |

Dek text comes from `README.md`'s `## Reports` section — single source of truth.

## 7. Visual system

Inherits Proposal B from the design exploration ("Modern arXiv"). One addition over the proposal: an explicit `:focus-visible` ring for keyboard users (Proposal B specified hover but not focus).

### 7.1 Typography

| Role | Stack | Size | Weight | LH |
|---|---|---|---|---|
| Wordmark | `"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace` | 0.95rem | 500 | 1.2 |
| H1 / report titles | `"Newsreader", "Source Serif Pro", "Source Serif 4", Georgia, "Noto Serif KR", serif` | 1.5rem | 500 | 1.25 |
| H2 / section labels | same as H1 | 1.125rem | 500 | 1.3 |
| Body | same serif stack | 1.0625rem (17px) | 400 | 1.6 |
| Metadata (chips, date, footer) | `"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace` | 0.8125rem (13px) | 400 | 1.4 |

Letter-spacing: wordmark −0.005em; metadata +0.01em.

Korean text falls through to `"Noto Serif KR"` via the cascade so the two languages share one visual register.

### 7.2 Color palette

```css
:root {
  --paper:  #FBFBF9;   /* near-white with a faint warm tint */
  --ink:    #1A1A1A;   /* deep neutral, not pure black */
  --accent: #B5341F;   /* arXiv-adjacent cinnabar — links only */
  --rule:   #E3E1DC;   /* hairline divider, low contrast */
  --muted:  #6B6B6B;   /* metadata text */
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper:  #14171A;   /* cool slate, not pure black */
    --ink:    #E6E4DF;   /* warm off-white for serif legibility */
    --accent: #E07A5F;   /* desaturated terracotta, dark-safe */
    --rule:   #2A2E33;
    --muted:  #8A8F95;
  }
}
```

Light mode ink/paper contrast ≈ 14:1; dark mode ≈ 12:1. Both are well above WCAG AAA.

### 7.3 Layout

- Content `max-width: 720px`, centered, side padding `1.5rem`.
- Vertical rhythm: paragraph spacing `1em`; between report blocks `2.5rem`; between header and about blurb `2rem`.
- Rules: outer hairlines `1px solid var(--rule)`; double-rule = two 1px rules with a 3px gap.
- Inter-report dividers: `1px solid var(--rule)`, `width: 50%`, left-aligned.
- Chips: monospace text in literal brackets — `[ KR ]`, `[ Suhwan ]`. Light mode = no background, no border (typographic chips). Dark mode = `1px solid var(--rule)` for separation against the darker paper.
- **Whole-row click target (JS-free).** Only the report title is a real `<a>` (placed inside the entry's `<h2>`). The whole `<article>` is made clickable by giving the article `position: relative` and the title's `<a>` an absolutely-positioned `::after` pseudo-element with `position: absolute; inset: 0; content: ""` that overlays the entire article. Screen readers announce only the title's link text — the overlay is invisible to assistive tech.

### 7.4 Interactive states

- **Hover** (title and row): color → `--accent`; `text-decoration: underline; text-underline-offset: 0.18em; text-decoration-thickness: 1px`; `transition: color 120ms ease`.
- **Focus** (`:focus-visible` on any link): `outline: 2px solid var(--accent); outline-offset: 2px`. Default focus styles disabled in favor of this consistent ring.

### 7.5 Font loading

Both Newsreader and JetBrains Mono are unlikely to be installed locally, so they are loaded from Google Fonts via a single CSS request in the `<head>`. `Noto Serif KR` is also requested so Korean entries render in the same family register as English ones.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+KR:wght@400;500&display=swap">
```

`display=swap` makes the page text-readable immediately using the fallback stack in §7.1, then swaps in the web fonts when they load — avoiding the "invisible text" pause. If Google Fonts is ever blocked or fails, the fallback stack keeps the page legible. Migrating to self-hosted WOFF2 (e.g., for privacy) is a future option and out of scope here.

## 8. Accessibility

- Semantic markup: `<header>`, `<main>`, `<article>` per report, `<footer>`.
- Contrast: see §7.2.
- Minimum font sizes: 17px body, 13px metadata — both above the 12px floor.
- Focus visible on all interactive elements (see §7.4).
- Korean content falls through `Noto Serif KR` so both languages stay legible at the same vertical rhythm.
- Skip-link is not added in v1 because the page has a single landmark; revisit if more nav arrives.

## 9. Link target transition (decided)

The new model says each per-report directory will eventually carry an `index.html` and be served at `https://sinban04.github.io/useless-knowledge/report/<dirname>/`. The current 5 reports do not yet have those files.

**Decision: ship with link target (b) — GitHub tree URLs.** Each report card's `href` is `https://github.com/sinban04/useless-knowledge/tree/main/report/<dirname>`, which renders today and never 404s. When a report grows its own `index.html` (via the `transfer-report` skill update, §11), that report's link flips to the Pages URL.

Rejected alternatives:
- (a) Pages URLs from day one — links would 404 in the interim.
- (c) Block the launch on per-report HTMLs — slowest path; loses the value of having the landing page exist now.

## 10. Hosting & deployment

- Enable GitHub Pages in repo settings → "Deploy from a branch" → `main` / `/` (root).
- Resulting URL: `https://sinban04.github.io/useless-knowledge/`.
- No Actions workflow. Pages serves the static files directly. Adding Actions later (e.g., when introducing a build step) is trivial and out of scope here.
- No custom domain in v1.

## 11. Maintenance and follow-ups (out of scope for v1)

Adding a report manually requires three edits, top of the list each time:

1. `index.html` — insert one `<article>` at the top of the reports list.
2. `README.md` — insert one bullet at the top of `## Reports` (existing convention).
3. The stats line in `index.html` — increment the count and update the date.

Two **follow-up tasks** (not part of this v1 spec, but should be planned next):

- **F1. `transfer-report` skill update.** Extend the skill to also (a) require an `index.html` inside the source probe-lab directory and copy it through, (b) insert a new `<article>` block into `useless-knowledge/index.html` at the top of the reports list, in addition to its existing `README.md` update, (c) flip that entry's `href` to the Pages URL (since the per-report `index.html` now exists).
- **F2. Backfill per-report `index.html`** for the 5 existing reports — either by retroactively adding HTML renderings of each in `useless-engineers/probe-lab/<name>/` and re-running `transfer-report`, or by hand-authoring the missing `index.html` in `useless-knowledge/report/<name>/`. Each flipped entry's `href` updates from the GitHub tree URL to the Pages URL.

## 12. Acceptance criteria for v1

- `index.html` exists at repo root and renders without console errors.
- `css/style.css` exists and is the only stylesheet linked.
- All five reports listed in reverse chronological order with date, chips, title, and dek.
- All chip / typography / color / spacing rules from §7 visibly match the spec.
- Dark mode auto-activates when the OS reports `prefers-color-scheme: dark`.
- Every report link resolves (per §9, currently to a GitHub tree URL).
- Keyboard navigation works — every link is tab-reachable, focus ring visible.
- Page passes WCAG AA contrast at body and metadata sizes.
- GitHub Pages is enabled and the site loads at `https://sinban04.github.io/useless-knowledge/`.
