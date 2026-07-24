#!/usr/bin/env python3
"""Deck-kit slide renderer (topic-agnostic, all levels).

Run inside a deck's build/ dir:   cd <deck>/build && python3 render.py
  - reads frame.json (cover/agenda/closing + level/title/footer/skin) + ch-*.json (sorted),
  - inlines the chosen skin (skins/<skin>.css :root token block) at <!--SKIN-->,
  - substitutes <!--TITLE--> / <!--LEVEL--> / <!--SLIDES--> in shell.html → ../index.html.

frame.json (all optional except cover):
  level   : str shown in the deck-level pill (e.g. "L3 · Standard").
  title   : str for <title> + default footer (else falls back to cover.title).
  footer  : str shown on every content slide's foot (else = title).
  skin    : skin name in skins/<skin>.css (default "paper-dark").
  cover / agenda[] / closing[] : slide specs (cover required).

slide spec fields (all optional, kind defaults to content):
  kind: "cover"|"divider"|"content"
  part: "p1"|"p2"|"p3"|"p4"                 # 4 thematic accent buckets (p1 = intro by convention)
  num,title,subtitle                        # divider
  kicker,title,lead                         # content header
  bullets:[..], numbered:[..]               # lists (inline HTML / $math$ allowed)
  note, noteKind:"info"|"opinion"|"q"
  code (str|{"text","lang"})
  math:[..]                                 # display math ($$ wrapped automatically)
  mermaid (str)                             # diagram → Cytoscape
  scene (str)                               # animation id (tviz-scenes.js registry)
  image:{"src","caption"}
  table:{"head":[..],"rows":[[..]]}
  statement (str)
  layout:"single"|"split"
"""
import json, html, re, sys
from pathlib import Path
import mmd2cyto

BUILD = Path(__file__).resolve().parent
DECK = BUILD.parent


def esc(s):
    return html.escape(str(s), quote=False)

# ---------- block renderers ----------
def r_bullets(items):
    return '<ul class="clean">' + ''.join(f'<li>{x}</li>' for x in items) + '</ul>'

def r_numbered(items):
    return '<ol class="num">' + ''.join(f'<li>{x}</li>' for x in items) + '</ol>'

def r_note(text, kind):
    cls = {'opinion': 'note op', 'q': 'note q', 'info': 'note'}.get(kind or 'info', 'note')
    label = '💡 발표자 개인 의견<br>' if kind == 'opinion' else ''
    return f'<div class="{cls}">{label}{text}</div>'

def r_code(code):
    txt = code.get('text', '') if isinstance(code, dict) else code
    lines = [ln for ln in txt.split('\n') if not ln.strip().startswith('```')]
    return f'<pre class="codeblock"><code>{esc(chr(10).join(lines).strip())}</code></pre>'

def r_math(items):
    return ''.join(f'<div class="eq">$$ {esc(m)} $$</div>' for m in items)

def r_mermaid(src):
    src = re.sub(r'^\s*(flowchart|graph)\s+(TD|TB)\b', r'\1 LR', src.strip())
    src = src.replace('direction TB', 'direction LR').replace('direction TD', 'direction LR')
    block = mmd2cyto.mermaid_to_block(src, with_height=False)
    if block is not None:
        return f'<figure class="diagram">{block}</figure>'
    return f'<pre class="mermaid">{esc(src)}</pre>'

def r_scene(scene):
    return (f'<div class="vizwrap"><div class="vizbox" data-scene="{esc(scene)}">'
            f'<div class="vizph">▶ 애니메이션 {esc(scene)}</div></div></div>')

def r_image(img):
    cap = f'<figcaption>{img["caption"]}</figcaption>' if img.get('caption') else ''
    return f'<figure class="fig"><img src="{esc(img["src"])}" alt="">{cap}</figure>'

def r_table(t):
    head = ''.join(f'<th>{h}</th>' for h in t.get('head', []))
    rows = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in row) + '</tr>'
                   for row in t.get('rows', []))
    cls = 'sm' if len(t.get('rows', [])) <= 6 else 'xs'
    return f'<table class="{cls}"><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table>'

def r_statement(s):
    return f'<div class="statement">{s}</div>'

VISUAL_KEYS = ['scene', 'mermaid', 'image', 'table', 'code']

def _code_lines(s):
    c = s.get('code') or ''
    c = c.get('text', '') if isinstance(c, dict) else c
    return len([l for l in c.split('\n') if not l.strip().startswith('```')])

def _demote_short_code(present, s):
    if 'code' in present and len(present) > 1 and _code_lines(s) <= 5:
        return [k for k in present if k != 'code']
    return present

def visual_html(s):
    if s.get('scene'):   return r_scene(s['scene'])
    if s.get('mermaid'): return r_mermaid(s['mermaid'])
    if s.get('image'):   return r_image(s['image'])
    if s.get('table'):   return r_table(s['table'])
    if s.get('code'):    return r_code(s['code'])
    return ''

def text_html(s, include_lead=True):
    out = []
    if include_lead and s.get('lead'): out.append(f'<p class="lead">{s["lead"]}</p>')
    if s.get('statement'): out.append(r_statement(s['statement']))
    if s.get('bullets'):   out.append(r_bullets(s['bullets']))
    if s.get('numbered'):  out.append(r_numbered(s['numbered']))
    if s.get('math'):      out.append(r_math(s['math']))
    if s.get('code') and _code_lines(s) <= 5 and any(s.get(k) for k in VISUAL_KEYS if k != 'code'):
        out.append(r_code(s['code']))
    if s.get('note'):      out.append(r_note(s['note'], s.get('noteKind')))
    return ''.join(out)

# ---------- slide renderers ----------
def render_divider(s):
    part = s.get('part', 'p1')
    sub = f'<div class="d-sub">{s["subtitle"]}</div>' if s.get('subtitle') else ''
    num = f'<div class="num">{esc(s.get("num",""))}</div>' if s.get('num') else ''
    return (f'<section class="slide divider" data-part="{part}">'
            f'{num}<h1>{s.get("title","")}</h1>{sub}<div class="rule"></div></section>')

def render_content(s, foot_default):
    part = s.get('part', 'p2')
    kicker = f'<div class="kicker">{s["kicker"]}</div>' if s.get('kicker') else ''
    title = f'<h2 class="s">{s["title"]}</h2>' if s.get('title') else ''
    has_visual = any(s.get(k) for k in VISUAL_KEYS)
    has_text = any(s.get(k) for k in ('lead', 'bullets', 'numbered', 'note', 'math', 'statement'))
    vizonly = ' vizonly' if (has_visual and not has_text) else ''
    if s.get('layout') == 'split' and has_visual:
        body = (f'<div class="cols c2"><div class="col">{text_html(s)}</div>'
                f'<div class="col fig-col">{visual_html(s)}</div></div>')
    else:
        body = text_html(s) + visual_html(s)
    foot = f'<div class="foot"><span>{s.get("footer", foot_default)}</span><span class="pg"></span></div>'
    return (f'<section class="slide{vizonly}" data-part="{part}">{kicker}{title}'
            f'<div class="body"><div class="bodyinner">{body}</div></div>{foot}</section>')

def render_cover(s):
    tags = ''.join(f'<span class="tag t-{t.get("k","p2")}">{t["label"]}</span>' for t in s.get('tags', []))
    return (f'<section class="slide cover active">'
            f'<div class="wrap"><div class="eyebrow">{s.get("eyebrow","")}</div>'
            f'<h1>{s.get("title","")}</h1>'
            f'<div class="en">{s.get("subtitle","")}</div>'
            f'<div class="tags">{tags}</div>'
            f'<div class="meta">{s.get("meta","")}</div></div>'
            f'<div class="strip"><span class="b-p1"></span><span class="b-p2"></span><span class="b-p3"></span><span class="b-p4"></span></div>'
            f'</section>')

def _cont(s, key, foot_default):
    return {'kind': 'content', 'part': s.get('part'), 'kicker': s.get('kicker'),
            'title': (s.get('title', '') + ' <span class="small">(계속)</span>'),
            'footer': s.get('footer', foot_default), key: s.get(key)}

def _split_multi(s, foot_default):
    present = _demote_short_code([k for k in VISUAL_KEYS if s.get(k)], s)
    if len(present) <= 1:
        return [s]
    first = dict(s)
    for k in present[1:]:
        first.pop(k, None)
    return [first] + [_cont(s, k, foot_default) for k in present[1:]]

def split_visuals(s, foot_default):
    if s.get('kind', 'content') != 'content':
        return [s]
    s = dict(s)
    present = _demote_short_code([k for k in VISUAL_KEYS if s.get(k)], s)
    if 'scene' in present and 'image' in present:
        s.pop('image', None)
        present = _demote_short_code([k for k in VISUAL_KEYS if s.get(k)], s)
    has_text = any(s.get(k) for k in ('lead', 'bullets', 'numbered', 'note', 'math', 'statement'))
    if 'scene' in present:
        others = [k for k in present if k != 'scene']
        if has_text or others:
            first = dict(s)
            first.pop('scene', None)
            return _split_multi(first, foot_default) + [_cont(s, 'scene', foot_default)]
        return [s]
    return _split_multi(s, foot_default)

def render_slide(s, foot_default):
    k = s.get('kind', 'content')
    if k == 'cover':   return render_cover(s)
    if k == 'divider': return render_divider(s)
    return render_content(s, foot_default)

# ---------- skin ----------
def load_skin(name):
    candidates = [DECK / 'skins' / f'{name}.css', DECK.parent / '_deck-kit' / 'skins' / f'{name}.css']
    for p in candidates:
        if p.exists():
            return p.read_text(encoding='utf-8')
    sys.exit(f"[render] skin '{name}' not found. looked in: " + ', '.join(str(c) for c in candidates))

# ---------- assemble ----------
def load(name):
    p = BUILD / name
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding='utf-8'))

frame = load('frame.json') or {}
cover = frame.get('cover') or {}
title = frame.get('title') or cover.get('title') or 'Seminar'
foot_default = frame.get('footer') or title
skin_name = frame.get('skin') or 'paper-dark'
skin_css = load_skin(skin_name)

slides = []
if frame.get('cover'):
    slides.append(frame['cover'])
slides.extend(frame.get('agenda', []))
for ch in sorted(BUILD.glob('ch-*.json')):
    data = json.loads(ch.read_text(encoding='utf-8'))
    slides.extend(data)
slides.extend(frame.get('closing', []))

expanded = []
for s in slides:
    expanded.extend(split_visuals(s, foot_default))
sections = '\n'.join(render_slide(s, foot_default) for s in expanded)
n_slides = len(expanded)

TEMPLATE = (BUILD / 'shell.html').read_text(encoding='utf-8')
out = (TEMPLATE
       .replace('/*SKIN*/<!--SKIN-->', skin_css)
       .replace('<!--TITLE-->', esc(title))
       .replace('<!--LEVEL-->', esc(frame.get('level', '')))
       .replace('<!--SLIDES-->', sections))
(DECK / 'index.html').write_text(out, encoding='utf-8')
print(f'rendered {n_slides} slides → {DECK.name}/index.html ({len(out)} bytes) · skin={skin_name}')
