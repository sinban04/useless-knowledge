# useless-knowledge landing page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single static HTML landing page (`index.html` + `css/style.css`) at the root of `sinban04/useless-knowledge`, served via GitHub Pages, that lists the 5 published reports in a "modern arXiv" academic/journal style.

**Architecture:** Two files only — `index.html` at repo root, `css/style.css` for styling. Zero JS, zero build tooling, zero frameworks. CSS variables + `@media (prefers-color-scheme: dark)` handle theming. Web fonts loaded from Google Fonts CDN. Each task ends with a `git add` + `commit` + `push` per the repo's standing auto-upload rule (`CLAUDE.md`).

**Tech Stack:** HTML5, CSS3 (vanilla, no preprocessor), Google Fonts CDN (Newsreader + JetBrains Mono + Noto Serif KR), GitHub Pages (deploy from `main` / `/`).

**Spec reference:** `docs/superpowers/specs/2026-05-23-useless-knowledge-pages-design.md` — read it before starting Task 1.

**Verification approach (per task):** small inline `python3 -c "…"` scripts that grep/parse the HTML and CSS files to assert specific content is present. No committed test files (the repo is for research content, not tests). Final task includes a live-deploy check on GitHub Pages.

**Working directory:** `/home1/irteam/play/injung/useless-knowledge/` for all bash commands. Use absolute paths when in doubt.

---

## Task 1: Page skeleton + base CSS + enable GitHub Pages

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Settings change: enable GitHub Pages in repo settings (manual step)

After this task you'll have a deploying-but-nearly-empty page at `https://sinban04.github.io/useless-knowledge/` showing the wordmark + a github link.

- [ ] **Step 1: Write the verification check.** Save this as a one-liner you can re-run; it asserts the file structure + header content we're about to create:

```bash
python3 -c "
from pathlib import Path
html = Path('index.html').read_text()
css  = Path('css/style.css').read_text()
checks = [
    ('<!doctype html>'                            in html.lower(), 'doctype'),
    ('<html lang=\"en\">'                         in html,         'html[lang=en]'),
    ('<meta charset=\"utf-8\">'                   in html,         'meta charset'),
    ('viewport'                                    in html,         'viewport meta'),
    ('<title>useless-knowledge</title>'           in html,         'title element'),
    ('href=\"css/style.css\"'                     in html,         'stylesheet link'),
    ('<header'                                     in html,         'header element'),
    ('useless-knowledge'                           in html,         'wordmark text'),
    ('https://github.com/sinban04/useless-knowledge' in html,      'github link'),
    ('--paper'                                     in css,          'css var --paper'),
    ('--ink'                                       in css,          'css var --ink'),
    ('--accent'                                    in css,          'css var --accent'),
    ('--rule'                                      in css,          'css var --rule'),
    ('Newsreader'                                  in css,          'Newsreader font stack'),
    ('JetBrains Mono'                              in css,          'JetBrains Mono stack'),
    ('max-width: 720px'                            in css,          '720px content width'),
]
fails = [name for ok, name in checks if not ok]
assert not fails, f'FAILS: {fails}'
print('OK')
"
```

- [ ] **Step 2: Run the check and confirm it FAILS.**

```bash
cd /home1/irteam/play/injung/useless-knowledge
python3 -c "from pathlib import Path; Path('index.html').read_text()"
```
Expected: `FileNotFoundError: [Errno 2] No such file or directory: 'index.html'`. This confirms we're starting clean.

- [ ] **Step 3: Create `index.html` at repo root.**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>useless-knowledge</title>
  <meta name="description" content="Curiosity-driven deep dives by three engineers.">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <span class="wordmark">useless-knowledge</span>
    <a class="github-link" href="https://github.com/sinban04/useless-knowledge">[ github ↗ ]</a>
  </header>
</body>
</html>
```

- [ ] **Step 4: Create `css/style.css`.** Create the `css/` directory first:

```bash
mkdir -p css
```

Then write `css/style.css`:

```css
/* ─── reset ─────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }
body, h1, h2, h3, p, ol, ul { margin: 0; padding: 0; }
ol, ul { list-style: none; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }

/* ─── light-mode palette ────────────────────────────────── */
:root {
  --paper:  #FBFBF9;
  --ink:    #1A1A1A;
  --accent: #B5341F;
  --rule:   #E3E1DC;
  --muted:  #6B6B6B;
}

/* ─── base body & layout ────────────────────────────────── */
html { background: var(--paper); }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: "Newsreader", "Source Serif Pro", "Source Serif 4",
               Georgia, "Noto Serif KR", serif;
  font-size: 1.0625rem;     /* 17px */
  line-height: 1.6;
  max-width: 720px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem;
}

/* ─── header ────────────────────────────────────────────── */
header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid var(--rule);
  margin-bottom: 2rem;
}
.wordmark {
  font-family: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: -0.005em;
}
.github-link {
  font-family: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.8125rem;
  color: var(--accent);
  letter-spacing: 0.01em;
}
.github-link:hover {
  text-decoration: underline;
  text-underline-offset: 0.18em;
  text-decoration-thickness: 1px;
}
```

- [ ] **Step 5: Run the check from Step 1 and confirm it PASSES.**

```bash
python3 -c "
from pathlib import Path
html = Path('index.html').read_text()
css  = Path('css/style.css').read_text()
checks = [
    ('<!doctype html>'                            in html.lower(), 'doctype'),
    ('<html lang=\"en\">'                         in html,         'html[lang=en]'),
    ('<meta charset=\"utf-8\">'                   in html,         'meta charset'),
    ('viewport'                                    in html,         'viewport meta'),
    ('<title>useless-knowledge</title>'           in html,         'title element'),
    ('href=\"css/style.css\"'                     in html,         'stylesheet link'),
    ('<header'                                     in html,         'header element'),
    ('useless-knowledge'                           in html,         'wordmark text'),
    ('https://github.com/sinban04/useless-knowledge' in html,      'github link'),
    ('--paper'                                     in css,          'css var --paper'),
    ('--ink'                                       in css,          'css var --ink'),
    ('--accent'                                    in css,          'css var --accent'),
    ('--rule'                                      in css,          'css var --rule'),
    ('Newsreader'                                  in css,          'Newsreader font stack'),
    ('JetBrains Mono'                              in css,          'JetBrains Mono stack'),
    ('max-width: 720px'                            in css,          '720px content width'),
]
fails = [name for ok, name in checks if not ok]
assert not fails, f'FAILS: {fails}'
print('OK')
"
```
Expected: `OK`

- [ ] **Step 6: Commit and push.**

```bash
git add index.html css/style.css
git commit -m "$(cat <<'EOF'
feat(pages): scaffold landing page with header and base styles

Adds index.html at repo root with the wordmark and a github link, plus
css/style.css with the modern-arXiv palette as CSS vars (light mode
only for now — dark mode comes in Task 5), the base body / measure /
typography, and the header layout.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

- [ ] **Step 7: Enable GitHub Pages (one-time manual step).**

Open `https://github.com/sinban04/useless-knowledge/settings/pages` in a browser. Under **Build and deployment** → **Source**, choose **Deploy from a branch**. Then **Branch** = `main`, **Folder** = `/ (root)`. Click **Save**.

Wait ~60 seconds, then verify deployment:

```bash
curl -sI https://sinban04.github.io/useless-knowledge/ | head -5
```
Expected: an `HTTP/2 200` (or `HTTP/1.1 200 OK`) status line.

If it returns 404, wait another minute and retry — Pages can take a few minutes on first enable.

---

## Task 2: About blurb + stats line + double-rule separator

**Files:**
- Modify: `index.html` (add `<main>` with about + stats; after `</header>`)
- Modify: `css/style.css` (add `.about`, `.stats`, `.double-rule` rules)

- [ ] **Step 1: Write the verification check.**

```bash
python3 -c "
from pathlib import Path
html = Path('index.html').read_text()
css  = Path('css/style.css').read_text()
checks = [
    ('<main' in html, 'main element'),
    ('class=\"about\"' in html, '.about section'),
    ('A reading room for curiosity-driven deep dives' in html, 'about p1 text'),
    ('probe-lab' in html, 'probe-lab mention'),
    ('class=\"stats\"' in html, '.stats element'),
    ('5 reports' in html, 'report count in stats'),
    ('2026-05-15' in html, 'updated-date in stats'),
    ('class=\"double-rule\"' in html, '.double-rule element'),
    ('.about' in css, '.about rule in css'),
    ('.stats' in css, '.stats rule in css'),
    ('.double-rule' in css, '.double-rule rule in css'),
]
fails = [n for ok, n in checks if not ok]
assert not fails, f'FAILS: {fails}'
print('OK')
"
```

- [ ] **Step 2: Run the check and confirm it FAILS** (none of these elements exist yet — expect a long FAILS list).

- [ ] **Step 3: Edit `index.html`.** Insert a `<main>` after `</header>`:

Replace the closing `</body>` section so the body becomes:

```html
<body>
  <header>
    <span class="wordmark">useless-knowledge</span>
    <a class="github-link" href="https://github.com/sinban04/useless-knowledge">[ github ↗ ]</a>
  </header>

  <main>
    <section class="about">
      <p>A reading room for curiosity-driven deep dives by three engineers who couldn't stop pulling threads. The name is self-deprecating; the work is not.</p>
      <p>Published from <a class="inline-link" href="https://github.com/sinban04/useless-engineers/tree/main/probe-lab">probe-lab</a>, the private research notebook we keep alongside this public face.</p>
    </section>

    <div class="stats">5 reports · updated 2026-05-15</div>

    <hr class="double-rule" aria-hidden="true">
  </main>
</body>
```

- [ ] **Step 4: Add CSS rules to `css/style.css`.** Append at the end of the file:

```css
/* ─── about ─────────────────────────────────────────────── */
.about p {
  margin-bottom: 1em;
}
.about p:last-child {
  margin-bottom: 0;
}
.inline-link {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 0.18em;
  text-decoration-thickness: 1px;
}

/* ─── stats line ────────────────────────────────────────── */
.stats {
  margin-top: 1.5rem;
  font-family: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.8125rem;
  letter-spacing: 0.01em;
  color: var(--muted);
}

/* ─── double-rule (the one decorative element) ──────────── */
.double-rule {
  border: 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  height: 3px;       /* the 3px gap between the two 1px lines */
  margin: 2rem 0 1rem;
}
```

- [ ] **Step 5: Re-run the verification check** from Step 1. Expected: `OK`.

- [ ] **Step 6: Commit and push.**

```bash
git add index.html css/style.css
git commit -m "$(cat <<'EOF'
feat(pages): add about blurb, stats line, double-rule separator

The about section reuses the README's opening paragraph and adds a
second paragraph linking to probe-lab as the source repo. The stats
line is rendered in JetBrains Mono small and the double-rule (two
1px hairlines with a 3px gap) is the only decorative rule on the
page.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

- [ ] **Step 7: Verify live (after ~60s Pages redeploy).**

```bash
curl -s https://sinban04.github.io/useless-knowledge/ | grep -E "(reading room|5 reports)" | head -3
```
Expected: both strings appear in the curl output.

---

## Task 3: Reports list — full HTML + CSS for all 5 entries

**Files:**
- Modify: `index.html` (add `<ol class="reports">` with 5 `<article>` entries inside `<main>`, after the `<hr class="double-rule">`)
- Modify: `css/style.css` (add `.reports`, `.reports article`, `.meta`, `.chip`, title, dek rules)

This is the biggest task — it lands the actual content the page is for. Take it in two halves: HTML first, then CSS.

- [ ] **Step 1: Write the verification check.**

```bash
python3 -c "
from pathlib import Path
html = Path('index.html').read_text()
css  = Path('css/style.css').read_text()
expected_dates  = ['2026-05-15','2026-05-01','2026-04-17','2026-03-20','2026-03-06']
expected_titles = ['Principles of Taste','ATP, Energy, and Kinases','AI Compiler','Anti-Cancer Medication Generations','Wireless Power Transfer']
expected_hrefs  = [
    'report/2026-05-15-principles-of-taste-Suhwan',
    'report/2026-05-01-atp-energy-kinase',
    'report/2026-04-17-AI-Compiler-Suhwan',
    'report/2026-03-20-anti-cancer-medication',
    'report/2026-03-06-Wireless-Power-Transfer-Suhwan',
]
checks  = [(html.count('<article') == 5, '5 article elements')]
checks += [(d in html, f'date {d}') for d in expected_dates]
checks += [(t in html, f'title \"{t}\"') for t in expected_titles]
checks += [('tree/main/' + h in html, f'href ends with {h}') for h in expected_hrefs]
checks += [
    (html.count('class=\"chip\">KR<') == 3, '3 KR chips'),
    (html.count('class=\"chip\">EN<') == 2, '2 EN chips'),
    (html.count('class=\"chip\">Suhwan<') == 3, '3 Suhwan chips'),
    ('class=\"reports\"' in html, 'reports list class'),
    ('class=\"meta\"' in html, 'meta row class'),
    ('class=\"dek\"' in html, 'dek class'),
    ('.reports' in css, '.reports rule'),
    ('.chip' in css, '.chip rule'),
    ('.meta' in css, '.meta rule'),
    ('.dek' in css, '.dek rule'),
]
fails = [n for ok, n in checks if not ok]
assert not fails, f'FAILS: {fails}'
print('OK')
"
```

- [ ] **Step 2: Run the check and confirm it FAILS.**

- [ ] **Step 3: Edit `index.html` — add the reports list inside `<main>`.** Replace the `<main>` block (everything from `<main>` to `</main>` inclusive) with this expanded version:

```html
<main>
  <section class="about">
    <p>A reading room for curiosity-driven deep dives by three engineers who couldn't stop pulling threads. The name is self-deprecating; the work is not.</p>
    <p>Published from <a class="inline-link" href="https://github.com/sinban04/useless-engineers/tree/main/probe-lab">probe-lab</a>, the private research notebook we keep alongside this public face.</p>
  </section>

  <div class="stats">5 reports · updated 2026-05-15</div>

  <hr class="double-rule" aria-hidden="true">

  <ol class="reports">
    <li>
      <article>
        <div class="meta">
          <time datetime="2026-05-15">2026-05-15</time>
          <span class="chips"><span class="chip">KR</span> <span class="chip">Suhwan</span></span>
        </div>
        <h2><a href="https://github.com/sinban04/useless-knowledge/tree/main/report/2026-05-15-principles-of-taste-Suhwan">Principles of Taste</a></h2>
        <p class="dek">A seminar from molecule to perception — papillae anatomy, the five canonical tastes, what we mean by "delicious," nine self-experiments, five appendices. Roughly 1–1.5 hours of reading.</p>
      </article>
    </li>
    <li>
      <article>
        <div class="meta">
          <time datetime="2026-05-01">2026-05-01</time>
          <span class="chips"><span class="chip">EN</span></span>
        </div>
        <h2><a href="https://github.com/sinban04/useless-knowledge/tree/main/report/2026-05-01-atp-energy-kinase">ATP, Energy, and Kinases</a></h2>
        <p class="dek">ATP as energy currency and signaling substrate, the ~518-member kinase family, cascades, and the modern kinase-inhibitor pharmacopeia.</p>
      </article>
    </li>
    <li>
      <article>
        <div class="meta">
          <time datetime="2026-04-17">2026-04-17</time>
          <span class="chips"><span class="chip">KR</span> <span class="chip">Suhwan</span></span>
        </div>
        <h2><a href="https://github.com/sinban04/useless-knowledge/tree/main/report/2026-04-17-AI-Compiler-Suhwan">AI Compiler</a></h2>
        <p class="dek">A 20–30 minute walk through MLIR, XLA, torch.compile, TVM, Triton, and IREE — what each one actually does and why they coexist.</p>
      </article>
    </li>
    <li>
      <article>
        <div class="meta">
          <time datetime="2026-03-20">2026-03-20</time>
          <span class="chips"><span class="chip">EN</span></span>
        </div>
        <h2><a href="https://github.com/sinban04/useless-knowledge/tree/main/report/2026-03-20-anti-cancer-medication">Anti-Cancer Medication Generations</a></h2>
        <p class="dek">Five generations of oncology drugs — cytotoxic, targeted, immuno, cell, mRNA — with five glossaries for the unfamiliar reader.</p>
      </article>
    </li>
    <li>
      <article>
        <div class="meta">
          <time datetime="2026-03-06">2026-03-06</time>
          <span class="chips"><span class="chip">KR</span> <span class="chip">Suhwan</span></span>
        </div>
        <h2><a href="https://github.com/sinban04/useless-knowledge/tree/main/report/2026-03-06-Wireless-Power-Transfer-Suhwan">Wireless Power Transfer</a></h2>
        <p class="dek">Faraday, Ampère, and Maxwell, then magnetic-flux-based transfer in practice. Fundamentals, not product reviews.</p>
      </article>
    </li>
  </ol>
</main>
```

- [ ] **Step 4: Append CSS rules to `css/style.css`.**

```css
/* ─── reports list ──────────────────────────────────────── */
.reports {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-top: 1.5rem;
}
.reports li {
  position: relative;        /* anchor the title's ::after overlay (Task 4) */
}
/* hairline divider between entries (not after the last) */
.reports li + li::before {
  content: "";
  display: block;
  width: 50%;
  border-top: 1px solid var(--rule);
  margin-top: -1.25rem;      /* offset against the flex gap so it sits centered */
  margin-bottom: 1.25rem;
}

.reports article {
  /* nothing yet — interactive states arrive in Task 4 */
}

/* meta row: date + chips */
.meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.8125rem;
  letter-spacing: 0.01em;
  color: var(--muted);
  margin-bottom: 0.4rem;
}
.chips { display: inline-flex; gap: 0.5rem; }
.chip {
  /* typographic chip — brackets render via CSS so the HTML stays clean */
  font-family: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.8125rem;
}
.chip::before { content: "[ "; }
.chip::after  { content: " ]"; }

/* report title */
.reports h2 {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.25;
  margin: 0 0 0.4rem;
}
.reports h2 a {
  color: var(--ink);
}

/* dek (1-line summary) */
.dek {
  color: var(--ink);
  font-size: 1.0625rem;
  line-height: 1.6;
}
```

- [ ] **Step 5: Re-run the verification check** from Step 1. Expected: `OK`.

- [ ] **Step 6: Commit and push.**

```bash
git add index.html css/style.css
git commit -m "$(cat <<'EOF'
feat(pages): render all 5 reports in the landing list

Adds an ordered list of <article> entries — one per report — with
date, language/author chips, h2 title link (to the GitHub tree URL
per the spec's link-target transition decision), and a one-line dek
reused verbatim from README.md's Reports section. CSS supplies the
meta row, monospaced typographic chips ([ KR ], [ Suhwan ]),
serif titles, and the 50%-width hairline rule between entries.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

- [ ] **Step 7: Verify live.** After Pages redeploys (~60s):

```bash
curl -s https://sinban04.github.io/useless-knowledge/ | grep -c "<article"
```
Expected: `5`

---

## Task 4: Interactions — hover, focus-visible, whole-row click target

**Files:**
- Modify: `css/style.css` (append interactive states for `.reports h2 a`, `.inline-link`, `.github-link`, and the `::after` overlay)

- [ ] **Step 1: Write the verification check.**

```bash
python3 -c "
from pathlib import Path
css = Path('css/style.css').read_text()
checks = [
    ('.reports h2 a::after' in css or '.reports article a::after' in css, 'overlay ::after pseudo for whole-row click'),
    ('position: absolute' in css, 'absolute positioning (for overlay)'),
    ('inset: 0' in css, 'inset:0 spans the article'),
    (':hover' in css, ':hover state defined'),
    (':focus-visible' in css, ':focus-visible state defined'),
    ('outline: 2px' in css, 'focus outline width'),
    ('outline-offset: 2px' in css, 'focus outline offset'),
    ('transition' in css, 'transition declaration'),
]
fails = [n for ok, n in checks if not ok]
assert not fails, f'FAILS: {fails}'
print('OK')
"
```

- [ ] **Step 2: Run the check and confirm it FAILS.**

- [ ] **Step 3: Append CSS rules to `css/style.css`.**

```css
/* ─── interactive states ────────────────────────────────── */

/* whole-row click target for each report (JS-free overlay) */
.reports h2 a {
  transition: color 120ms ease;
}
.reports h2 a::after {
  content: "";
  position: absolute;
  inset: 0;                  /* covers the entire .reports li (position: relative above) */
}

/* hover: title color → accent, underline appears */
.reports li:hover h2 a,
.reports h2 a:hover {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 0.18em;
  text-decoration-thickness: 1px;
}

/* focus-visible: unified focus ring across all interactive elements */
a:focus { outline: none; }
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 1px;
}

/* inline-link hover (about paragraph) */
.inline-link:hover {
  color: var(--ink);
}
```

- [ ] **Step 4: Re-run the verification check** from Step 1. Expected: `OK`.

- [ ] **Step 5: Verify visually (manual).** Once the next push redeploys, open the live URL (or `index.html` locally), then:
  - **Mouse:** hover anywhere inside a report row → title goes red and gets underlined.
  - **Mouse:** click anywhere inside a report row → navigates to the GitHub tree URL.
  - **Keyboard:** press <kbd>Tab</kbd> through the page → every focusable link gets a visible 2px red focus ring with a 2px gap to the text.
  - **Keyboard:** press <kbd>Enter</kbd> on a focused report title → navigates.
  - **Mouse, no keyboard:** clicking a link should *not* leave a focus ring (verifies `:focus-visible`, not `:focus`).

- [ ] **Step 6: Commit and push.**

```bash
git add css/style.css
git commit -m "$(cat <<'EOF'
feat(pages): whole-row click target + hover/focus interactions

Each report's <h2> link grows an absolute ::after overlay (inset: 0)
that sits over the parent li (made position: relative in Task 3),
making the entire row clickable while keeping the title as the only
announced link for screen readers — a JS-free pattern.

Hover shifts the title to var(--accent) with a 1px underline; a
unified :focus-visible ring (2px outline, 2px offset) replaces the
default browser focus styles. mouse-only clicks no longer leave a
focus ring, matching modern interaction expectations.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 5: Dark mode via prefers-color-scheme

**Files:**
- Modify: `css/style.css` (append a `@media (prefers-color-scheme: dark)` block with the dark palette overrides)

- [ ] **Step 1: Write the verification check.**

```bash
python3 -c "
from pathlib import Path
css = Path('css/style.css').read_text()
# extract the dark-mode @media block so we can assert chip border is INSIDE it
import re
dark_block = re.search(r'@media \(prefers-color-scheme: dark\) \{.*?\n\}\n', css, re.DOTALL)
assert dark_block, 'dark-mode media query block not found'
dark = dark_block.group(0)
checks = [
    ('--paper:  #14171A' in dark or '--paper: #14171A' in dark, 'dark paper override'),
    ('#E6E4DF' in dark, 'dark ink'),
    ('#E07A5F' in dark, 'dark accent'),
    ('#2A2E33' in dark, 'dark rule'),
    ('#8A8F95' in dark, 'dark muted'),
    ('.chip' in dark, '.chip rule inside dark block'),
    ('border: 1px solid var(--rule)' in dark, 'chip border inside dark block'),
]
fails = [n for ok, n in checks if not ok]
assert not fails, f'FAILS: {fails}'
print('OK')
"
```

- [ ] **Step 2: Run the check and confirm it FAILS.**

- [ ] **Step 3: Append CSS to `css/style.css`.**

```css
/* ─── dark mode (auto via system preference) ────────────── */
@media (prefers-color-scheme: dark) {
  :root {
    --paper:  #14171A;
    --ink:    #E6E4DF;
    --accent: #E07A5F;
    --rule:   #2A2E33;
    --muted:  #8A8F95;
  }
  /* chips get a faint border in dark mode to separate from the darker paper;
     brackets stay so light/dark chips share their typographic register. */
  .chip {
    border: 1px solid var(--rule);
    padding: 0.05em 0.4em;
    border-radius: 1px;
  }
}
```

- [ ] **Step 4: Re-run the verification check** from Step 1. Expected: `OK`.

- [ ] **Step 5: Verify visually (manual).** Toggle your OS's system theme between light and dark. The page should re-color without a refresh on modern browsers. Light mode → paper-white background, near-black ink, cinnabar accent. Dark mode → cool-slate background, warm off-white ink, terracotta accent. The double rule, hairlines, chip brackets, and focus ring should all remain visible.

- [ ] **Step 6: Commit and push.**

```bash
git add css/style.css
git commit -m "$(cat <<'EOF'
feat(pages): add dark mode via prefers-color-scheme

A single @media (prefers-color-scheme: dark) block overrides the five
CSS palette variables. Because every color reference goes through the
variables, the dark scheme cascades through the whole page (paper,
ink, accent, rule, muted) without any per-component dark-mode rules.

Light contrast ~14:1 paper/ink; dark contrast ~12:1 — both above
WCAG AAA for body text.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 6: Footer

**Files:**
- Modify: `index.html` (add `<footer>` after `</main>`)
- Modify: `css/style.css` (append `footer` rule)

- [ ] **Step 1: Write the verification check.**

```bash
python3 -c "
from pathlib import Path
html = Path('index.html').read_text()
css  = Path('css/style.css').read_text()
checks = [
    ('<footer' in html, 'footer element'),
    ('sinban04 · Jaehoss · sedie1234' in html, 'contributors line'),
    ('useless-engineers / probe-lab' in html, 'probe-lab link text'),
    ('https://github.com/sinban04/useless-engineers/tree/main/probe-lab' in html, 'probe-lab href'),
    ('footer' in css, 'footer rule in css'),
]
fails = [n for ok, n in checks if not ok]
assert not fails, f'FAILS: {fails}'
print('OK')
"
```

- [ ] **Step 2: Run the check and confirm it FAILS.**

- [ ] **Step 3: Edit `index.html` — add `<footer>` after `</main>`.**

```html
  </main>

  <footer>
    <span class="contributors">sinban04 · Jaehoss · sedie1234</span>
    <a class="inline-link" href="https://github.com/sinban04/useless-engineers/tree/main/probe-lab">useless-engineers / probe-lab</a>
  </footer>
</body>
```

- [ ] **Step 4: Append CSS to `css/style.css`.**

```css
/* ─── footer ────────────────────────────────────────────── */
footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 4rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--rule);
  font-family: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.8125rem;
  letter-spacing: 0.01em;
  color: var(--muted);
}
footer .contributors { color: var(--muted); }
```

- [ ] **Step 5: Re-run the verification check** from Step 1. Expected: `OK`.

- [ ] **Step 6: Commit and push.**

```bash
git add index.html css/style.css
git commit -m "$(cat <<'EOF'
feat(pages): add footer with contributors and probe-lab link

Mirrors the README's contributors line on the left, and a right-
aligned link back to the private companion repo for readers who want
to see where the source research lives. Same JetBrains Mono register
as the stats line at the top, so the page bookends in a consistent
voice.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 7: Web font loading via Google Fonts CDN

**Files:**
- Modify: `index.html` (insert `<link>` tags for fonts before `<link rel="stylesheet" href="css/style.css">`)

- [ ] **Step 1: Write the verification check.**

```bash
python3 -c "
from pathlib import Path
html = Path('index.html').read_text()
checks = [
    ('rel=\"preconnect\" href=\"https://fonts.googleapis.com\"' in html, 'preconnect googleapis'),
    ('rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin' in html, 'preconnect gstatic w/ crossorigin'),
    ('family=Newsreader' in html, 'Newsreader family'),
    ('family=JetBrains+Mono' in html or 'family=JetBrains%20Mono' in html, 'JetBrains Mono family'),
    ('family=Noto+Serif+KR' in html or 'family=Noto%20Serif%20KR' in html, 'Noto Serif KR family'),
    ('display=swap' in html, 'display=swap'),
]
fails = [n for ok, n in checks if not ok]
assert not fails, f'FAILS: {fails}'
print('OK')
"
```

- [ ] **Step 2: Run the check and confirm it FAILS.**

- [ ] **Step 3: Edit `index.html` — add the three font `<link>` tags inside `<head>`, immediately before `<link rel="stylesheet" href="css/style.css">`.**

The `<head>` block should look like this once edited:

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>useless-knowledge</title>
  <meta name="description" content="Curiosity-driven deep dives by three engineers.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+KR:wght@400;500&display=swap">
  <link rel="stylesheet" href="css/style.css">
</head>
```

- [ ] **Step 4: Re-run the verification check** from Step 1. Expected: `OK`.

- [ ] **Step 5: Verify visually (manual).** After Pages redeploys, open the live URL in a browser with network access:
  - Page text should render in **Newsreader** (a contemporary serif with slight optical variation) — not your system default like Times or Georgia.
  - The wordmark `useless-knowledge` and chips like `[ KR ]` `[ Suhwan ]` should render in **JetBrains Mono** (geometric monospace with the distinctive ligatures).
  - On the Korean reports (Principles of Taste, AI Compiler, Wireless Power Transfer), if you click through and any Korean characters appear in the title or dek, they should render in **Noto Serif KR** — same vertical weight as the English serif body.

- [ ] **Step 6: Commit and push.**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat(pages): load Newsreader, JetBrains Mono, Noto Serif KR from Google Fonts

A single CSS request brings in the three families the design depends
on, with preconnect hints to start the TLS handshake early.
display=swap keeps the page text-readable using the fallback stack
during the font download, avoiding the "invisible text" flash.

Korean entries fall through to Noto Serif KR via the body's
font-family cascade, giving KR and EN content one shared register.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 8: Acceptance check against the spec

**Files:**
- No file modifications expected unless something fails.

Run the acceptance criteria from spec §12 against the live site and the source files. Each item maps to a verification command or a manual check.

- [ ] **Step 1: Files exist at the expected paths.**

```bash
test -f index.html && test -f css/style.css && echo "OK: files exist"
```
Expected: `OK: files exist`

- [ ] **Step 2: All five reports are listed.**

```bash
python3 -c "
from pathlib import Path
html = Path('index.html').read_text()
assert html.count('<article') == 5, f'expected 5 articles, found {html.count(chr(60)+chr(34)+\"article\")}'
print('OK: 5 articles')
"
```
Expected: `OK: 5 articles`

- [ ] **Step 3: Reverse chronological order.**

```bash
python3 -c "
import re
from pathlib import Path
html = Path('index.html').read_text()
dates = re.findall(r'datetime=\"(\d{4}-\d{2}-\d{2})\"', html)
assert dates == sorted(dates, reverse=True), f'order broken: {dates}'
print('OK: reverse-chronological order')
"
```
Expected: `OK: reverse-chronological order`

- [ ] **Step 4: All report links resolve.** (Per spec §9, links currently point to GitHub tree URLs — those resolve today.)

```bash
python3 -c "
import re, urllib.request
from pathlib import Path
html = Path('index.html').read_text()
hrefs = re.findall(r'href=\"(https://github.com/sinban04/useless-knowledge/tree/main/report/[^\"]+)\"', html)
for h in hrefs:
    req = urllib.request.Request(h, method='HEAD')
    try:
        urllib.request.urlopen(req, timeout=10)
        print('OK', h.rsplit('/',1)[-1])
    except Exception as e:
        print('FAIL', h, e); raise
"
```
Expected: 5 `OK` lines, one per report.

- [ ] **Step 5: Site is live at the Pages URL.**

```bash
curl -sI https://sinban04.github.io/useless-knowledge/ | head -3
```
Expected: `HTTP/2 200` (or `HTTP/1.1 200 OK`) on the first line.

- [ ] **Step 6: Manual visual check (open the live URL in a browser).** Confirm each:
  - **Light mode** (default OS theme): paper-white background, near-black ink, no decorative color except the cinnabar `[ github ↗ ]` link in the header. Double rule under the about/stats block. Hairline 50%-width rules between report entries.
  - **Dark mode** (switch OS to dark): cool-slate background, warm off-white ink, terracotta accent. Chip brackets still legible. Hairline rules still visible.
  - **Hover** any report row: title color → accent, underline appears with a 1px line offset slightly from the baseline.
  - **Click** anywhere in a report row (not just on the title): navigates to the GitHub tree URL.
  - **Tab** through the page: every link gets a visible 2px accent focus ring with a 2px gap. Mouse-only clicks should not leave a focus ring after release.
  - **Resize** the window narrow (~400px): content remains readable; the header's wordmark/github link wrap or stay on one line without overflow; reports list remains aligned.
  - **Korean rendering**: characters (if you click into a Korean report's tree URL on GitHub) render consistently with English.

- [ ] **Step 7: Final commit if any fixes were needed.** Otherwise no commit.

```bash
git status --short
```
Expected: clean working tree, no pending changes. If there are any from Step 6 fixes, commit & push them with a `fix(pages): …` message.

---

## What's deliberately NOT in this plan (kept for the follow-up)

These are the **F1** and **F2** follow-ups recorded in spec §11. They are not implemented here.

- **F1.** Updating the `transfer-report` skill to (a) require an `index.html` inside the source probe-lab directory and copy it through, (b) insert a new `<article>` block into `index.html` at the top of the reports list, and (c) flip that entry's `href` from the GitHub tree URL to the Pages URL. Picked up after v1 is shipped.
- **F2.** Backfilling per-report `index.html` files for the 5 existing reports so their landing-page entries can flip to Pages URLs.

Both can ship in a separate plan once this one is done.
