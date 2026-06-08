/* cyto.js — render flowchart-style graphs with Cytoscape.js + dagre.
   Replaces the former mermaid pipeline for node-edge diagrams. Works for both the
   scroll-style report site and the slide-style PPT deck.

   Markup (a .cy container immediately followed by its JSON spec):
     <div class="cy" data-h="320"></div>
     <script type="application/json" class="cy-spec">
       { "rankDir":"TB", "elements":[ {data:{id,label,parent?,shape?,href?}, classes?}, ... ] }
     </script>
   Edge classes: "dashed"(dotted) "none"(no arrow / undirected) "bi"(bidirectional)
                 "rot"(rotate label to follow the edge; default labels stay horizontal).
   Node classes: "hi"(accent) "no"(de-emphasized). Node shape: data.shape="diamond".
   Node href: data.href → node navigates on click.

   Palette is read from the container's computed CSS custom properties (--paper/--ink/
   --accent/--rule/--muted), so it auto-adapts to light/dark and per-slide accents.

   API: window.SeminarCyto.renderAll()  — render every unmounted .cy (and refit mounted).
        window.SeminarCyto.renderIn(el) — same, scoped to a subtree (call on slide show). */
(function () {
  "use strict";
  if (typeof cytoscape === "undefined") return;
  if (typeof cytoscapeDagre !== "undefined") {
    try { cytoscape.use(cytoscapeDagre); } catch (e) { /* already registered */ }
  }

  function cssVar(el, name, fb) {
    try {
      var v = getComputedStyle(el).getPropertyValue(name).trim();
      return v || fb;
    } catch (e) { return fb; }
  }
  function palette(el) {
    return {
      paper: cssVar(el, "--paper", "#FBFBF9"),
      ink: cssVar(el, "--ink", "#1A1A1A"),
      accent: cssVar(el, "--accent", "#B5341F"),
      rule: cssVar(el, "--rule", cssVar(el, "--line", "#E3E1DC")),
      muted: cssVar(el, "--muted", "#6B6B6B")
    };
  }
  // Use the host page's resolved fonts so cytoscape MEASURES with the same font it
  // RENDERS with (a webfont hardcoded here but not loaded on a deck clips long labels).
  function fonts(el) {
    var serif = "";
    try { serif = getComputedStyle(el).fontFamily; } catch (e) {}
    return {
      serif: serif || cssVar(el, "--serif", '"Noto Serif KR",Georgia,serif'),
      mono: cssVar(el, "--mono", cssVar(el, "--mono-ui", '"JetBrains Mono",ui-monospace,monospace'))
    };
  }

  // Blend two CSS colors (hex or rgb/rgba) so derived tones (e.g. edge labels) track
  // the live theme palette instead of a hardcoded hex. t=0 → c1, t=1 → c2.
  function parseRGB(c) {
    if (!c) return null;
    c = ("" + c).trim();
    if (c.charAt(0) === "#") {
      var h = c.slice(1);
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      if (h.length < 6) return null;
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    var m = c.match(/rgba?\(([^)]+)\)/i);
    if (m) {
      var parts = m[1].split(",").map(function (s) { return parseFloat(s); });
      if (parts.length >= 3) return [parts[0], parts[1], parts[2]];
    }
    return null;
  }
  function mix(c1, c2, t) {
    var a = parseRGB(c1), b = parseRGB(c2);
    if (!a || !b) return c1;
    var ch = function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); };
    return "rgb(" + ch(0) + "," + ch(1) + "," + ch(2) + ")";
  }

  function styleSheet(p, f) {
    // edge-label color: a touch darker than muted, but still lighter than node text (ink)
    var edgeLabel = mix(p.muted, p.ink, 0.42);
    return [
      { selector: "node", style: {
        "background-color": p.paper, "border-color": p.rule, "border-width": 1,
        "shape": "round-rectangle", "label": "data(label)", "color": p.ink,
        "font-family": f.serif, "font-size": 13, "line-height": 1.35,
        "text-wrap": "wrap", "text-max-width": 160,
        "text-valign": "center", "text-halign": "center",
        "width": "label", "height": "label", "padding": "10px"
      } },
      { selector: 'node[shape = "diamond"]', style: {
        "shape": "round-diamond", "padding": "22px", "text-max-width": 120
      } },
      { selector: ":parent", style: {
        "background-color": p.muted, "background-opacity": 0.05,
        "border-color": p.rule, "border-width": 1, "border-style": "dashed",
        "shape": "round-rectangle", "label": "data(label)", "color": p.muted,
        "font-family": f.mono, "font-size": 11, "font-weight": 500,
        "text-valign": "top", "text-halign": "center", "text-margin-y": -4, "padding": "16px"
      } },
      { selector: "node.hi", style: {
        "background-color": p.accent, "background-opacity": 0.09,
        "border-color": p.accent, "border-width": 1.5, "color": p.accent
      } },
      { selector: "node.no", style: {
        "background-color": p.muted, "background-opacity": 0.06,
        "border-color": p.muted, "color": p.muted
      } },
      { selector: "node.hl", style: { "border-color": p.accent, "border-width": 1.6 } },
      { selector: "edge", style: {
        "width": 1.3, "line-color": p.muted,
        "target-arrow-color": p.muted, "target-arrow-shape": "triangle",
        "curve-style": "bezier", "arrow-scale": 0.85,
        "label": "data(label)", "font-family": f.mono, "font-size": 12, "color": edgeLabel,
        "text-wrap": "wrap", "text-max-width": 120,
        "text-background-color": p.paper, "text-background-opacity": 0.92,
        "text-background-padding": 2, "text-rotation": "none"
      } },
      { selector: "edge.dashed", style: { "line-style": "dashed" } },
      { selector: "edge.none", style: { "target-arrow-shape": "none" } },
      { selector: "edge.bi", style: { "source-arrow-shape": "triangle", "source-arrow-color": p.muted } },
      // opt-in per edge: add "rot" to its classes to rotate the label along the edge
      { selector: "edge.rot", style: { "text-rotation": "autorotate" } }
    ];
  }

  function findSpec(box) {
    var el = box.nextElementSibling;
    if (el && el.tagName === "SCRIPT" && el.classList.contains("cy-spec")) return el;
    return box.parentNode ? box.parentNode.querySelector("script.cy-spec") : null;
  }

  function buildOne(box) {
    if (box.__cy) { box.__cy.resize(); box.__refit && box.__refit(); return; }
    var specEl = findSpec(box);
    if (!specEl) return;
    // Create only after webfonts settle so `width: label` measures node boxes with the
    // real serif font (slide decks may call renderIn before fonts load → clipped labels).
    if (document.fonts && document.fonts.ready && document.fonts.status !== "loaded") {
      if (!box.__waitFonts) {
        box.__waitFonts = true;
        document.fonts.ready.then(function () { box.__waitFonts = false; buildOne(box); });
      }
      return;
    }
    // a definite, non-zero width is required for cytoscape to lay out; defer if hidden
    if (box.getBoundingClientRect().width < 2) return;

    var spec;
    try { spec = JSON.parse(specEl.textContent); }
    catch (e) { box.innerHTML = '<div class="cy-err">diagram spec parse error</div>'; return; }

    var graphmap = !!(box.closest && box.closest("figure.graphmap"));
    var hAttr = box.getAttribute("data-h") || spec.height;
    if (graphmap) box.style.height = Math.max(parseInt(hAttr || 0, 10), 760) + "px";
    else if (hAttr) box.style.height = (parseInt(hAttr, 10) || 320) + "px";
    // else: rely on CSS height (slide decks size .cy via CSS)

    // text-align:center 가 상속되면 cytoscape 의 absolute 캔버스가 left 미지정 상태에서
    // 정적 위치가 컨테이너 중앙(폭/2)으로 계산돼 그래프가 우측으로 잘리고 hit-test(클릭·드래그·줌)가
    // 빗나간다. 좌측 정렬로 캔버스를 원점에 고정한다.
    box.style.textAlign = "left";

    var p = palette(box);
    var fontsObj = fonts(box);
    var hasClickable = (spec.elements || []).some(function (el) { return el.data && el.data.href; });

    var cy = cytoscape({
      container: box,
      elements: spec.elements || [],
      style: styleSheet(p, fontsObj),
      layout: {
        name: "dagre", rankDir: spec.rankDir || "TB",
        nodeSep: spec.nodeSep || (graphmap ? 46 : 28),
        rankSep: spec.rankSep || (graphmap ? 84 : 46),
        edgeSep: graphmap ? 22 : 10, ranker: "network-simplex"
      },
      userZoomingEnabled: true, userPanningEnabled: true,
      minZoom: 0.4, maxZoom: 6,
      // drag on empty canvas = pan; drag on a node = move that node (both coexist)
      boxSelectionEnabled: false, autoungrabify: false
    });
    box.__cy = cy;

    if (hasClickable) {
      cy.nodes().forEach(function (n) {
        if (!n.data("href")) return;
        n.addClass("clickable");
        n.on("tap", function () { window.location.href = n.data("href"); });
        n.on("mouseover", function () { n.addClass("hl"); box.style.cursor = "pointer"; });
        n.on("mouseout", function () { n.removeClass("hl"); box.style.cursor = "default"; });
      });
    }

    var pad = graphmap ? 18 : 12;
    var layoutOpts = {
      name: "dagre", rankDir: spec.rankDir || "TB",
      nodeSep: spec.nodeSep || (graphmap ? 46 : 28),
      rankSep: spec.rankSep || (graphmap ? 84 : 46),
      edgeSep: graphmap ? 22 : 10, ranker: "network-simplex"
    };
    var refit = function () { cy.resize(); cy.fit(undefined, pad); };
    // re-measure label boxes once the real webfont is painted, then re-layout
    // (cytoscape caches label metrics; a stale pre-font measure clips long labels).
    var remeasure = function () {
      try { cy.style().update(); } catch (e) {}
      cy.layout(layoutOpts).run();
      refit();
    };
    box.__refit = refit;
    // double-click resets pan/zoom to fit (in-place zoom default per global convention)
    box.addEventListener("dblclick", function () { refit(); });
    refit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
    requestAnimationFrame(remeasure);
  }

  function renderIn(root) {
    var boxes = (root || document).querySelectorAll(".cy");
    Array.prototype.forEach.call(boxes, buildOne);
  }
  function renderAll() { renderIn(document); }

  function start() {
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
      document.fonts.ready.then(renderAll);
      setTimeout(renderAll, 1600);
    } else { renderAll(); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      document.querySelectorAll(".cy").forEach(function (b) { if (b.__refit) b.__refit(); });
    }, 140);
  });

  window.SeminarCyto = { renderAll: renderAll, renderIn: renderIn };
})();
