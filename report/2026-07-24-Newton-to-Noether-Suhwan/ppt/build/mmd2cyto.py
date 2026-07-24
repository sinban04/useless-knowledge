#!/usr/bin/env python3
"""Transpile the mermaid `flowchart`/`graph` subset used in the MLIR seminar decks
into Cytoscape.js element specs, and rewrite the HTML to use the cytoscape stack.

Handles: nodes ["..."],[..],(..),{..}(diamond); edges --> --- -.-> -.- ==> <-->;
pipe labels |"x"| and inline-dot labels -. "x" .->; :::class ; classDef ; click;
subgraph/end (compound parents); HTML entities and <br/> -> newline.
Only node-edge graphs are converted; other mermaid types are left untouched.
"""
import re, json, sys, html as htmllib

GRAPH_HEAD = re.compile(r'^\s*(flowchart|graph)\s+(TD|TB|BT|LR|RL)\b', re.I)

# any edge operator with optional inline-dot / pipe label
OP_RE = re.compile(r'''
  (?P<bi><)?
  (?:
     -\.\s*"(?P<dotlabel>[^"]*)"\s*\.->
   | (?P<dotted>-\.->|-\.-)
   | (?P<thick>==+>)
   | (?P<solid>-->|---)
  )
  (?:\s*\|\s*"?(?P<pipelabel>[^"|]*?)"?\s*\|)?
''', re.X)

NODE_RE = re.compile(
    r'^\s*(?P<id>[A-Za-z0-9_]+)\s*'
    r'(?:(?P<open>\(\(|\[|\(|\{)(?P<label>.*?)(?:\)\)|\]|\)|\}))?\s*'
    r'(?::::(?P<cls>[A-Za-z0-9_]+))?\s*$', re.S)

def decode(s):
    s = s.replace('<br/>', '\n').replace('<br>', '\n').replace('<br />', '\n')
    s = htmllib.unescape(s)
    s = s.strip()
    if len(s) >= 2 and s[0] == '"' and s[-1] == '"':
        s = s[1:-1].strip()  # strip mermaid label delimiter quotes
    return s

def parse_node_token(tok, nodes, order, parent):
    tok = tok.strip()
    if not tok:
        return None
    m = NODE_RE.match(tok)
    if not m:
        # fall back: bare id
        nid = re.sub(r'[^A-Za-z0-9_].*$', '', tok).strip()
        if not nid:
            return None
        m = None
    nid = m.group('id') if m else nid
    if nid not in nodes:
        nodes[nid] = {'id': nid}
        order.append(nid)
        if parent:
            nodes[nid]['parent'] = parent
    nd = nodes[nid]
    if m and m.group('open') is not None:
        raw = m.group('label')
        nd['label'] = decode(raw) if raw is not None else nid
        if m.group('open') == '{':
            nd['shape'] = 'diamond'
    if m and m.group('cls'):
        nd['cls'] = m.group('cls')
    return nid

def edge_kind(m):
    dashed = bool(m.group('dotted') or m.group('dotlabel') is not None)
    bi = bool(m.group('bi'))
    no_arrow = (m.group('solid') == '---') or (m.group('dotted') == '-.-')
    label = m.group('dotlabel')
    if label is None:
        label = m.group('pipelabel')
    return dashed, bi, no_arrow, (decode(label) if label else None)

def transpile(src, rankdir):
    src = htmllib.unescape(src)  # decode &gt; &lt; &amp; so arrows (--&gt;) & <br/> parse
    nodes, order, edges = {}, [], []
    clicks = {}
    parent_stack = []
    for raw in src.split('\n'):
        line = raw.strip()
        if not line:
            continue
        if GRAPH_HEAD.match(raw):
            continue
        low = line.lower()
        if low.startswith('classdef') or low.startswith('style ') or low.startswith('linkstyle'):
            continue
        if low.startswith('direction'):
            continue
        if low == 'end':
            if parent_stack:
                parent_stack.pop()
            continue
        if low.startswith('subgraph'):
            rest = line[len('subgraph'):].strip()
            mm = re.match(r'^([A-Za-z0-9_]+)?\s*(?:(\[|\(|\{|")(.*?)(\]|\)|\}|"))?\s*$', rest, re.S)
            sid = (mm.group(1) if mm and mm.group(1) else None)
            slabel = (mm.group(3) if mm and mm.group(3) else (sid or ''))
            if not sid:
                sid = 'sg_%d' % (len(nodes) + 1)
            if sid not in nodes:
                nodes[sid] = {'id': sid}
                order.append(sid)
            nodes[sid]['label'] = decode(slabel)
            nodes[sid]['is_parent'] = True
            if parent_stack:
                nodes[sid]['parent'] = parent_stack[-1]
            parent_stack.append(sid)
            continue
        if low.startswith('click'):
            cm = re.match(r'click\s+([A-Za-z0-9_]+)\s+"([^"]+)"', line)
            if cm:
                clicks[cm.group(1)] = cm.group(2)
            continue
        # statement: node/edge chain
        cur_parent = parent_stack[-1] if parent_stack else None
        pos = 0
        prev_id = None
        ops = list(OP_RE.finditer(line))
        if not ops:
            parse_node_token(line, nodes, order, cur_parent)
            continue
        for m in ops:
            seg = line[pos:m.start()]
            nid = parse_node_token(seg, nodes, order, cur_parent)
            if prev_id and nid:
                dashed, bi, no_arrow, label = prev_op_kind
                edges.append((prev_id, nid, dashed, bi, no_arrow, label))
            if nid:
                prev_id = nid
            prev_op_kind = edge_kind(m)
            pos = m.end()
        # trailing node after last op
        tail = line[pos:]
        nid = parse_node_token(tail, nodes, order, cur_parent)
        if prev_id and nid:
            dashed, bi, no_arrow, label = prev_op_kind
            edges.append((prev_id, nid, dashed, bi, no_arrow, label))

    # build elements
    elements = []
    for nid in order:
        nd = nodes[nid]
        data = {'id': nid, 'label': nd.get('label', nid)}
        if nd.get('parent'):
            data['parent'] = nd['parent']
        if nd.get('shape'):
            data['shape'] = nd['shape']
        if nid in clicks:
            data['href'] = clicks[nid]
        el = {'data': data}
        if nd.get('cls'):
            el['classes'] = nd['cls']
        elements.append(el)
    for (s, t, dashed, bi, no_arrow, label) in edges:
        data = {'source': s, 'target': t}
        if label:
            data['label'] = label
        cls = []
        if dashed:
            cls.append('dashed')
        if no_arrow:
            cls.append('none')
        if bi:
            cls.append('bi')
        el = {'data': data}
        if cls:
            el['classes'] = ' '.join(cls)
        elements.append(el)

    n_real = sum(1 for nid in order if not nodes[nid].get('is_parent'))
    return elements, {'nodes': n_real, 'parents': len(order) - n_real, 'edges': len(edges)}, rankdir

def height_for(stats, rankdir):
    n = stats['nodes']
    if rankdir in ('LR', 'RL'):
        return max(200, min(520, 120 + 70 * stats['parents'] + 26 * n))
    return max(220, min(560, 120 + 70 * n))

PRE_RE = re.compile(r'<pre class="mermaid">(.*?)</pre>', re.S)

def make_block(elements, rankdir, height):
    spec = {'rankDir': rankdir, 'elements': elements}
    j = json.dumps(spec, ensure_ascii=False, separators=(',', ':'))
    hattr = (' data-h="%d"' % height) if height else ''
    return ('<div class="cy"%s></div>'
            '<script type="application/json" class="cy-spec">%s</script>' % (hattr, j))

def mermaid_to_block(src, with_height=True):
    """Public entry for build pipelines: raw mermaid flowchart/graph source ->
    cytoscape .cy block. Returns None if the source is not a node-edge graph."""
    head = GRAPH_HEAD.match(src)
    if not head:
        return None
    rankdir = head.group(2).upper()
    elements, stats, rankdir = transpile(src, rankdir)
    height = height_for(stats, rankdir) if with_height else 0
    return make_block(elements, rankdir, height)

def convert_html(text):
    n_conv = 0
    skipped = []
    def repl(m):
        nonlocal n_conv
        src = m.group(1)
        head = GRAPH_HEAD.match(src)
        if not head:
            skipped.append(src.strip().split('\n')[0][:40])
            return m.group(0)  # not a flowchart/graph: leave untouched
        rankdir = head.group(2).upper()
        elements, stats, rankdir = transpile(src, rankdir)
        n_conv += 1
        return make_block(elements, rankdir, height_for(stats, rankdir))
    out = PRE_RE.sub(repl, text)
    if n_conv > 0:
        # swap script include (mermaid -> cytoscape stack) once
        if 'assets/cyto.js' not in out:
            out = out.replace(
                '<script src="assets/mermaid.min.js"></script>',
                '<script src="assets/cytoscape.min.js"></script>\n'
                '<script src="assets/dagre.min.js"></script>\n'
                '<script src="assets/cytoscape-dagre.min.js"></script>\n'
                '<script src="assets/cyto.js"></script>')
    return out, n_conv, skipped

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'dump':
        for f in sys.argv[2:]:
            text = open(f, encoding='utf-8').read()
            for i, m in enumerate(PRE_RE.finditer(text)):
                src = m.group(1)
                head = GRAPH_HEAD.match(src)
                if not head:
                    print(f"\n## {f} [{i}] SKIP (non-flowchart): {src.strip().splitlines()[0][:50]}")
                    continue
                elements, stats, rd = transpile(src, head.group(2).upper())
                print(f"\n## {f} [{i}] rankDir={rd} stats={stats} h={height_for(stats, rd)}")
                print(json.dumps({'rankDir': rd, 'elements': elements}, ensure_ascii=False, indent=1))
    elif mode == 'apply':
        for f in sys.argv[2:]:
            text = open(f, encoding='utf-8').read()
            out, n, skipped = convert_html(text)
            if n:
                open(f, 'w', encoding='utf-8').write(out)
            print(f"{f}: converted {n} diagram(s)" + (f" | skipped {skipped}" if skipped else ""))
