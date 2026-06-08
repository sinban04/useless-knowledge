#!/usr/bin/env python3
"""MLIR PPT 덱 렌더러.

slide-spec JSON(프레임 frame.json + 챕터 ch-01..08.json)을 읽어, v3 슬라이드 엔진 위에
mermaid·KaTeX·폴리헤드럴 애니메이션을 통합한 self-contained index.html 로 렌더한다.

슬라이드 spec 필드(모두 optional, kind 기본 content):
  kind: "divider"|"content"
  part: "mlir"|"poly"|"synth"      # accent 색
  num,title,subtitle               # divider
  kicker,title,lead                # content 헤더
  bullets:[..], numbered:[..]      # 리스트 (inline HTML/ $math$ 허용)
  note, noteKind:"info"|"opinion"|"q"
  code (str|{"text","lang"})       # 코드블록 (자동 escape)
  math:[..]                        # display 수식 (자동 escape, $$로 감쌈)
  mermaid (str)                    # 다이어그램 (자동 escape)
  scene (str)                      # 애니메이션 data-scene id
  image:{"src","caption"}
  table:{"head":[..],"rows":[[..]]}
  statement (str)                  # 큰 인용
  layout:"single"|"split"          # split: 텍스트(좌) + 비주얼(우)
"""
import json, html, re
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
    label = '💡 발표자(Suhwan) 개인 의견<br>' if kind == 'opinion' else ''
    return f'<div class="{cls}">{label}{text}</div>'

def r_code(code):
    txt = code.get('text', '') if isinstance(code, dict) else code
    # markdown 펜스 줄(```·```mlir 등) 전부 제거 — 한 필드에 여러 블록(Before/After)이어도 안전
    lines = [ln for ln in txt.split('\n') if not ln.strip().startswith('```')]
    return f'<pre class="codeblock"><code>{esc(chr(10).join(lines).strip())}</code></pre>'

def r_math(items):
    return ''.join(f'<div class="eq">$$ {esc(m)} $$</div>' for m in items)

def r_mermaid(src):
    # 16:9 가로 슬라이드용: 세로(TD/TB) 흐름을 가로(LR)로 재배치 — 폭을 활용해 안 잘리고 크게.
    src = re.sub(r'^\s*(flowchart|graph)\s+(TD|TB)\b', r'\1 LR', src.strip())
    src = src.replace('direction TB', 'direction LR').replace('direction TD', 'direction LR')
    # node-edge 그래프 → Cytoscape.js(+dagre)로 렌더. (메인 다이어그램 도구; 높이는 .cy CSS가 결정)
    block = mmd2cyto.mermaid_to_block(src, with_height=False)
    if block is not None:
        return f'<figure class="diagram">{block}</figure>'
    return f'<pre class="mermaid">{esc(src)}</pre>'  # 비-그래프(seq/timeline 등)는 그대로

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

VISUAL_KEYS = ['mermaid', 'scene', 'image', 'table', 'code']

def visual_html(s):
    if s.get('mermaid'): return r_mermaid(s['mermaid'])
    if s.get('scene'):   return r_scene(s['scene'])
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
    if s.get('note'):      out.append(r_note(s['note'], s.get('noteKind')))
    return ''.join(out)

# ---------- slide renderers ----------
PART_GRAD = {
    'mlir':  'linear-gradient(140deg,#3a1d1a,#5a241c)',
    'poly':  'linear-gradient(140deg,#16242f,#1f3a4d)',
    'synth': 'linear-gradient(140deg,#2c2820,#3f3722)',
}

def render_divider(s):
    part = s.get('part', 'mlir')
    grad = PART_GRAD.get(part, PART_GRAD['mlir'])
    sub = f'<div class="d-sub">{s["subtitle"]}</div>' if s.get('subtitle') else ''
    num = f'<div class="num">{esc(s.get("num",""))}</div>' if s.get('num') else ''
    return (f'<section class="slide divider" data-part="{part}" style="background:{grad}">'
            f'{num}<h1>{s.get("title","")}</h1>{sub}<div class="rule"></div></section>')

def render_content(s):
    part = s.get('part', 'mlir')
    kicker = f'<div class="kicker">{s["kicker"]}</div>' if s.get('kicker') else ''
    title = f'<h2 class="s">{s["title"]}</h2>' if s.get('title') else ''
    has_visual = any(s.get(k) for k in VISUAL_KEYS)
    if s.get('layout') == 'split' and has_visual:
        body = (f'<div class="cols c2"><div class="col">{text_html(s)}</div>'
                f'<div class="col fig-col">{visual_html(s)}</div></div>')
    else:
        body = text_html(s) + visual_html(s)
    foot = f'<div class="foot"><span>{s.get("footer","MLIR · Polyhedral / Affine — Suhwan")}</span><span class="pg"></span></div>'
    return (f'<section class="slide" data-part="{part}">{kicker}{title}'
            f'<div class="body"><div class="bodyinner">{body}</div></div>{foot}</section>')

def render_cover(s):
    tags = ''.join(f'<span class="tag t-{t.get("k","mlir")}">{t["label"]}</span>' for t in s.get('tags', []))
    return (f'<section class="slide cover active">'
            f'<div class="wrap"><div class="eyebrow">{s.get("eyebrow","")}</div>'
            f'<h1>{s.get("title","")}</h1>'
            f'<div class="en">{s.get("subtitle","")}</div>'
            f'<div class="tags">{tags}</div>'
            f'<div class="meta">{s.get("meta","")}</div></div>'
            f'<div class="strip"><span class="b-mlir"></span><span class="b-poly"></span><span class="b-synth"></span></div>'
            f'</section>')

def _cont(s, key):
    """비주얼 1개만 담는 '(계속)' 슬라이드 — 큰 비주얼이 슬라이드를 거의 다 차지."""
    return {'kind': 'content', 'part': s.get('part'), 'kicker': s.get('kicker'),
            'title': (s.get('title', '') + ' <span class="small">(계속)</span>'),
            'footer': s.get('footer', 'MLIR · Polyhedral / Affine — Suhwan'), key: s.get(key)}

def _split_multi(s):
    """비주얼 ≥2면 첫 슬라이드=텍스트+비주얼1, 나머지 비주얼은 각자 '(계속)' 슬라이드."""
    present = [k for k in VISUAL_KEYS if s.get(k)]
    if len(present) <= 1:
        return [s]
    first = dict(s)
    for k in present[1:]:
        first.pop(k, None)
    return [first] + [_cont(s, k) for k in present[1:]]

def split_visuals(s):
    """① 한 슬라이드에 비주얼 1개(조용한 누락·과밀 방지). ② 애니메이션(scene)은 항상 전용
    슬라이드로 분리(가장 키 큰 요소 → 글머리표·다른 비주얼은 앞 슬라이드, scene은 풀슬라이드).
    scene+image 동시면 image 제거(애니메이션이 주 비주얼)."""
    if s.get('kind', 'content') != 'content':
        return [s]
    s = dict(s)
    present = [k for k in VISUAL_KEYS if s.get(k)]
    if 'scene' in present and 'image' in present:
        s.pop('image', None)
        present = [k for k in VISUAL_KEYS if s.get(k)]
    has_text = any(s.get(k) for k in ('lead', 'bullets', 'numbered', 'note', 'math', 'statement'))
    if 'scene' in present:
        others = [k for k in present if k != 'scene']
        if has_text or others:
            first = dict(s)
            first.pop('scene', None)
            return _split_multi(first) + [_cont(s, 'scene')]   # 텍스트/기타 비주얼 → 앞, 애니 → 전용
        return [s]
    return _split_multi(s)

def render_slide(s):
    k = s.get('kind', 'content')
    if k == 'cover':   return render_cover(s)
    if k == 'divider': return render_divider(s)
    return render_content(s)

# ---------- assemble ----------
def load(name):
    p = BUILD / name
    if not p.exists(): return None
    return json.loads(p.read_text(encoding='utf-8'))

def resolve_pool(ch_slides, n):
    """슬라이드 spec 의 mermaid:"@K" 를 pool-0N.json 의 실제 소스로 치환."""
    pool = load(f'pool-{n:02d}.json') or {'mermaid': []}
    mm = pool.get('mermaid', [])
    for s in ch_slides:
        v = s.get('mermaid')
        if isinstance(v, str) and v.startswith('@'):
            idx = int(v[1:])
            if idx < 0 or idx >= len(mm):
                raise SystemExit(f'ch-{n:02d}: mermaid {v} 인덱스 범위 초과 (pool {len(mm)}개)')
            s['mermaid'] = mm[idx]
    return ch_slides

frame = load('frame.json') or {}
slides = []
slides.append(frame['cover'])
slides.extend(frame.get('agenda', []))
for n in range(1, 9):
    ch = load(f'ch-{n:02d}.json')
    if ch is None:
        raise SystemExit(f'missing ch-{n:02d}.json')
    slides.extend(resolve_pool(ch, n))
slides.extend(frame.get('closing', []))

expanded = []
for s in slides:
    expanded.extend(split_visuals(s))
sections = '\n'.join(render_slide(s) for s in expanded)
n_slides = len(expanded)

TEMPLATE = (BUILD / 'shell.html').read_text(encoding='utf-8')
out = TEMPLATE.replace('<!--SLIDES-->', sections)
(DECK / 'index.html').write_text(out, encoding='utf-8')
print(f'rendered {n_slides} slides → index.html ({len(out)} bytes)')
