#!/usr/bin/env python3
"""Node-graph navigation deck builder (topic-agnostic) → ../index.html

Run inside a deck's build/ dir:   cd <deck>/build && python3 build_map.py
  - reads map.json (title/subtitle/footer/lskey/skin/groups/topics/edges),
  - inlines the chosen skin at <!--SKIN-->,
  - substitutes title/level/map-heading/topics/DATA in shell_map.html → ../index.html.

Landing = a Cytoscape concept map; click a node → that topic's page; the page's
"back to map" button marks the node done (localStorage, key = map.json.lskey).

map.json schema:
  title     : str — <title> + map heading.
  subtitle  : str — hint line under the heading.
  footer    : str — foot text on every topic page.
  lskey     : str — UNIQUE localStorage key for this deck's progress (e.g. "<slug>-map-done-v1").
  skin      : str — skin name in skins/<skin>.css (default "paper-dark").
  level     : str — deck-level pill text (default "MAP · 개념지도").
  groups    : { "<gid>": {"name": "<legend label>", "part": "p1|p2|p3|p4"}, ... }
  topics    : [ { id, g(=gid), label(\n-wrapped), kicker, title, lead,
                  bullets[], table?, image?, scene?, math[]?, note?, statement? }, ... ]
  edges     : [ ["<id>","<id>"], ... ]
"""
import json, html, sys
from pathlib import Path

BUILD = Path(__file__).resolve().parent
DECK = BUILD.parent


def esc(s): return html.escape(str(s), quote=False)

# ---------- slide body renderers ----------
def r_visual(t):
    if t.get("scene"):
        return f'<div class="vizwrap"><div class="vizbox" data-scene="{esc(t["scene"])}"></div></div>'
    if t.get("image"):
        cap = f'<figcaption>{t["image"]["caption"]}</figcaption>' if t["image"].get("caption") else ""
        return f'<figure class="fig"><img src="{esc(t["image"]["src"])}" alt="">{cap}</figure>'
    if t.get("table"):
        tb = t["table"]
        head = "".join(f"<th>{h}</th>" for h in tb["head"])
        rows = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in tb["rows"])
        return f'<table><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table>'
    if t.get("math") and not t.get("bullets"):
        return "".join(f'<div class="eq">$$ {esc(m)} $$</div>' for m in t["math"])
    return ""

def r_text(t):
    out = []
    if t.get("lead"): out.append(f'<p class="lead">{t["lead"]}</p>')
    if t.get("math") and t.get("bullets"):
        out += [f'<div class="eq">$$ {esc(m)} $$</div>' for m in t["math"]]
    if t.get("bullets"):
        out.append('<ul class="clean">' + "".join(f"<li>{b}</li>" for b in t["bullets"]) + "</ul>")
    if t.get("statement"): out.append(f'<div class="statement">{t["statement"]}</div>')
    if t.get("note"): out.append(f'<div class="note">{t["note"]}</div>')
    return "".join(out)

def topic_slide(t, foot):
    grp = t["g"]
    visual = r_visual(t)
    text = r_text(t)
    body = (f'<div class="cols c2"><div class="col">{text}</div><div class="col fig-col">{visual}</div></div>'
            if visual else f'<div class="single">{text}</div>')
    ret = ('<button class="ret" data-topic="' + esc(t["id"]) +
           '" title="지도로 돌아가기 (발표완료 표시)">← 지도로 돌아가기 · 발표완료</button>')
    return (f'<section class="slide topic" data-part="{grp}" data-topic="{esc(t["id"])}">'
            f'<div class="kicker">{esc(t["kicker"])}</div><h2 class="s">{t["title"]}</h2>'
            f'<div class="body"><div class="bodyinner">{body}</div></div>'
            f'{ret}<div class="foot"><span>{esc(foot)}</span><span class="pg"></span></div>'
            f'</section>')

# ---------- skin ----------
def load_skin(name):
    candidates = [DECK / 'skins' / f'{name}.css', DECK.parent / '_deck-kit' / 'skins' / f'{name}.css']
    for p in candidates:
        if p.exists():
            return p.read_text(encoding='utf-8')
    sys.exit(f"[build_map] skin '{name}' not found. looked in: " + ', '.join(str(c) for c in candidates))

# ---------- assemble ----------
cfg = json.loads((BUILD / "map.json").read_text(encoding="utf-8"))
title = cfg.get("title", "Concept Map")
subtitle = cfg.get("subtitle", "노드를 클릭 → 그 주제 설명. 다 보고 지도로 돌아가면 발표완료로 색칠된다.")
foot = cfg.get("footer", title)
lskey = cfg.get("lskey") or (cfg.get("slug", "deck") + "-map-done-v1")
level = cfg.get("level", "MAP · 개념지도")
skin_css = load_skin(cfg.get("skin", "paper-dark"))
groups = cfg["groups"]      # gid -> {name, part}
topics = cfg["topics"]
edges = cfg["edges"]

TOPIC_INDEX = {t["id"]: i + 1 for i, t in enumerate(topics)}   # map=0, topics start at 1
CY_NODES = [{"data": {"id": t["id"], "label": t["label"], "grp": t["g"]}} for t in topics]
CY_EDGES = [{"data": {"id": f"{a}_{b}", "source": a, "target": b}} for a, b in edges]

DATA = {
    "lskey": lskey,
    "topicIndex": TOPIC_INDEX,
    "nodes": CY_NODES,
    "edges": CY_EDGES,
    "groupName": {gid: g["name"] for gid, g in groups.items()},
    "groupPart": {gid: g.get("part", "p2") for gid, g in groups.items()},   # JS resolves color from --<part>
}

topics_html = "\n".join(topic_slide(t, foot) for t in topics)

TEMPLATE = (BUILD / "shell_map.html").read_text(encoding="utf-8")
out = (TEMPLATE
       .replace("/*SKIN*/<!--SKIN-->", skin_css)
       .replace("<!--TITLE-->", esc(title))
       .replace("<!--LEVEL-->", esc(level))
       .replace("<!--MAPTITLE-->", esc(title))
       .replace("<!--MAPSUB-->", subtitle)
       .replace("<!--TOPICS-->", topics_html)
       .replace("/*DATA*/null", json.dumps(DATA, ensure_ascii=False)))
(DECK / "index.html").write_text(out, encoding="utf-8")
print(f"map deck: {len(topics)} topics + 1 map = {len(topics)+1} slides → index.html "
      f"({len(out)} bytes) · skin={cfg.get('skin','paper-dark')} · lskey={lskey}")
