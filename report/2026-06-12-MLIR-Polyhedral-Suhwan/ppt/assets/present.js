/* present.js — presenter overlay for html-ppt slide decks: whole-slide zoom + pen drawing.
   Reusable drop-in. Requires the deck to expose:
     window.SeminarDeck = { deck:<#deck el>, stage:<#stage el>, get cur(), next(), prev() }
   and to dispatch window event "deck:show" whenever the active slide changes.

   Behaviour
   - Wheel over slide BACKGROUND = zoom the whole slide toward the cursor (0.4–6×).
     Wheel over a graph/figure is left to that element's own zoom (cyto.js / zoom.js).
   - When zoomed in, dragging the background pans; double-click (or Esc) resets.
   - P = pen on/off · color swatches · E = eraser · X = clear slide · Ctrl+Z = undo.
     Strokes are stored per slide and repainted on slide change.
   - Click-to-advance fires ONLY in nav mode, un-zoomed, off interactive media,
     and not at the end of a drag — so node-drag / figure-zoom no longer flip the slide. */
(function () {
  "use strict";
  var D = window.SeminarDeck;
  if (!D || !D.deck || !D.stage) { console.warn("present.js: window.SeminarDeck missing"); return; }
  var deck = D.deck, stage = D.stage;

  // ---- state ----
  var mode = "nav", zs = 1, zx = 0, zy = 0, panning = false;
  var curColor = "#e23b2e", eraser = false, ann = {}, drawing = false, curStroke = null;
  function cur() { return D.cur; }
  function interactive(t) { return t && t.closest && t.closest(".cy, figure, .vizwrap, .vizbox"); }

  // ---- injected styles ----
  var css = ""
    + "#stage{transform-origin:0 0}"
    + "#penLayer{position:absolute;inset:0;z-index:30;pointer-events:none;touch-action:none}"
    + "body.pen #penLayer{pointer-events:auto;cursor:crosshair}"
    + "#prtools{position:fixed;bottom:54px;right:18px;z-index:60;display:flex;gap:7px;align-items:center;"
    + "background:rgba(0,0,0,.42);padding:7px 9px;border-radius:12px;font-family:var(--mono,ui-monospace,monospace);backdrop-filter:blur(4px)}"
    + "#prtools .grp{display:none;gap:7px;align-items:center}"
    + "body.pen #prtools .grp{display:flex}"
    + "#prtools .sw{width:21px;height:21px;border-radius:50%;cursor:pointer;border:2px solid rgba(255,255,255,.35)}"
    + "#prtools .sw.on{border-color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.55)}"
    + "#prtools button{background:rgba(255,255,255,.1);color:#e8e3d8;border:1px solid rgba(255,255,255,.18);"
    + "height:26px;padding:0 9px;border-radius:7px;cursor:pointer;font-size:12px}"
    + "#prtools button:hover{background:rgba(255,255,255,.22)}"
    + "#prtools button.on{background:#b5341f;border-color:#b5341f;color:#fff}"
    + "#prtools .zl{color:#cfc9bd;font-size:12px;min-width:40px;text-align:center}"
    + "#prtools .zl.hide{display:none}"
    + "figure.diagram,figure.fig{position:relative}"
    + ".figzoom{position:absolute;top:8px;right:8px;z-index:5;width:28px;height:28px;border-radius:7px;"
    + "border:1px solid rgba(0,0,0,.18);background:rgba(255,255,255,.88);color:#333;cursor:pointer;"
    + "font-size:14px;line-height:26px;text-align:center;padding:0;opacity:0;transition:opacity .12s}"
    + "figure:hover .figzoom{opacity:1}"
    + "body.figfocus .figzoom{opacity:0}"
    + "#figfocus{position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;"
    + "overflow:hidden;touch-action:none;user-select:none;background:rgba(12,12,15,.84);cursor:zoom-out}"
    + "#figfocus.on{display:flex}"
    + "#figfocus>figure{margin:0;width:auto;max-width:96vw;max-height:96vh;display:flex;align-items:center;"
    + "justify-content:center;background:transparent;cursor:default}"
    + "#figfocus img{max-width:94vw;max-height:94vh;width:auto;height:auto;-webkit-user-drag:none;user-drag:none;background:#fff;border-radius:8px;padding:8px}"
    + "#figfocus figcaption{display:none}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // ---- floating toolbar ----
  var bar = document.createElement("div"); bar.id = "prtools";
  bar.innerHTML =
      '<button id="pr_fit" title="화면에 맞춤 (0)">&#9974;</button>'
    + '<button id="pr_pen" title="펜 (P)">&#9998;</button>'
    + '<span class="grp">'
    + '<span class="sw on" data-c="#e23b2e" style="background:#e23b2e"></span>'
    + '<span class="sw" data-c="#2f6f9f" style="background:#2f6f9f"></span>'
    + '<span class="sw" data-c="#e8a93a" style="background:#e8a93a"></span>'
    + '<span class="sw" data-c="#16181f" style="background:#16181f"></span>'
    + '<button id="pr_erase" title="지우개 (E)">지우개</button>'
    + '<button id="pr_undo" title="실행취소 (Ctrl+Z)">&#8624;</button>'
    + '<button id="pr_clear" title="슬라이드 지우기 (X)">삭제</button>'
    + '</span>'
    + '<span class="zl hide" id="pr_zl">100%</span>';
  document.body.appendChild(bar);
  var btnPen = bar.querySelector("#pr_pen"), btnErase = bar.querySelector("#pr_erase"), zlEl = bar.querySelector("#pr_zl");

  // ---- pen canvas (logical 1280×720, lives inside #deck so it follows fit + zoom) ----
  var DPR = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  var pen = document.createElement("canvas"); pen.id = "penLayer";
  pen.width = 1280 * DPR; pen.height = 720 * DPR; deck.appendChild(pen);
  var pctx = pen.getContext("2d"); pctx.scale(DPR, DPR); pctx.lineCap = "round"; pctx.lineJoin = "round";

  // ---- zoom ----
  function applyZoom() {
    stage.style.transform = (zs === 1 && zx === 0 && zy === 0) ? "none" : "translate(" + zx + "px," + zy + "px) scale(" + zs + ")";
    document.body.classList.toggle("zoomed", zs > 1);
    zlEl.textContent = Math.round(zs * 100) + "%"; zlEl.classList.toggle("hide", zs <= 1);
  }
  function resetZoom() { zs = 1; zx = 0; zy = 0; applyZoom(); }
  stage.addEventListener("wheel", function (e) {
    if (interactive(e.target)) return;            // graph/figure keep their own zoom
    e.preventDefault();
    var r = stage.getBoundingClientRect();
    var cx = e.clientX - r.left, cy = e.clientY - r.top;
    var f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    var ns = Math.min(6, Math.max(1, zs * f));
    zx = cx - (cx - zx) * (ns / zs); zy = cy - (cy - zy) * (ns / zs); zs = ns;
    if (zs <= 1.001) { zs = 1; zx = 0; zy = 0; }
    applyZoom();
  }, { passive: false });
  var plx = 0, ply = 0;
  stage.addEventListener("pointerdown", function (e) {
    if (mode === "nav" && zs > 1 && !interactive(e.target)) {
      panning = true; plx = e.clientX; ply = e.clientY;
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    }
  });
  window.addEventListener("pointermove", function (e) {
    if (!panning) return; zx += e.clientX - plx; zy += e.clientY - ply; plx = e.clientX; ply = e.clientY; applyZoom();
  });
  window.addEventListener("pointerup", function () { panning = false; });
  stage.addEventListener("dblclick", function (e) { if (!interactive(e.target) && zs > 1) resetZoom(); });

  // ---- pen drawing ----
  function strokesFor(i) { return ann[i] || (ann[i] = []); }
  function redraw() {
    pctx.clearRect(0, 0, 1280, 720);
    var arr = ann[cur()] || [];
    for (var i = 0; i < arr.length; i++) {
      var s = arr[i];
      pctx.globalCompositeOperation = s.mode === "erase" ? "destination-out" : "source-over";
      pctx.strokeStyle = s.color; pctx.lineWidth = s.width;
      pctx.beginPath();
      for (var j = 0; j < s.pts.length; j++) { var p = s.pts[j]; j ? pctx.lineTo(p.x, p.y) : pctx.moveTo(p.x, p.y); }
      if (s.pts.length === 1) pctx.lineTo(s.pts[0].x + 0.1, s.pts[0].y + 0.1); // lone tap = dot
      pctx.stroke();
    }
    pctx.globalCompositeOperation = "source-over";
  }
  function toLogical(e) { var r = pen.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 1280, y: (e.clientY - r.top) / r.height * 720 }; }
  pen.addEventListener("pointerdown", function (e) {
    if (mode !== "pen") return; e.preventDefault();
    drawing = true;
    curStroke = { mode: eraser ? "erase" : "pen", color: curColor, width: eraser ? 28 : 3.4, pts: [toLogical(e)] };
    strokesFor(cur()).push(curStroke);
    try { pen.setPointerCapture(e.pointerId); } catch (_) {}
    redraw();
  });
  pen.addEventListener("pointermove", function (e) { if (drawing) { curStroke.pts.push(toLogical(e)); redraw(); } });
  function endStroke() { drawing = false; curStroke = null; }
  pen.addEventListener("pointerup", endStroke);
  pen.addEventListener("pointercancel", endStroke);

  // ---- modes / tools ----
  function setMode(m) { mode = m; document.body.classList.toggle("pen", m === "pen"); btnPen.classList.toggle("on", m === "pen"); }
  function setColor(c) {
    curColor = c; eraser = false; btnErase.classList.remove("on");
    var sw = bar.querySelectorAll(".sw");
    for (var i = 0; i < sw.length; i++) sw[i].classList.toggle("on", sw[i].getAttribute("data-c") === c);
  }
  function toggleErase() { eraser = !eraser; btnErase.classList.toggle("on", eraser); if (eraser) setMode("pen"); }
  function undo() { var a = ann[cur()]; if (a && a.length) { a.pop(); redraw(); } }
  function clearSlide() { ann[cur()] = []; redraw(); }
  btnPen.onclick = function () { setMode(mode === "pen" ? "nav" : "pen"); };
  btnErase.onclick = toggleErase;
  bar.querySelector("#pr_undo").onclick = undo;
  bar.querySelector("#pr_clear").onclick = clearSlide;
  (function () {
    var sw = bar.querySelectorAll(".sw");
    for (var i = 0; i < sw.length; i++) {
      (function (el) { el.onclick = function () { setColor(el.getAttribute("data-c")); setMode("pen"); }; })(sw[i]);
    }
  })();

  // ---- enlarge ONLY a figure: move it into a full-viewport focus overlay ----
  var fo = document.createElement("div"); fo.id = "figfocus"; document.body.appendChild(fo);
  var focused = null, foHome = null, foNext = null, foCyCss = null;
  var fs = 1, fx = 0, fy = 0, fdrag = false, flx = 0, fly = 0, fdownbg = false, fbx = 0, fby = 0;   // focus-overlay zoom/pan (non-graph figures)
  function figCy(fig) { return fig.querySelector(".cy"); }
  function refitCy(fig) { var c = figCy(fig); if (c && c.__cy) { try { c.__cy.resize(); } catch (_) {} if (c.__refit) c.__refit(); } }
  function foIsGraph() { var c = focused && figCy(focused); return !!(c && c.__cy); }   // graphs keep cytoscape native zoom/pan
  function foApply() { if (focused) focused.style.transform = (fs === 1 && fx === 0 && fy === 0) ? "" : "translate(" + fx + "px," + fy + "px) scale(" + fs + ")"; }
  function foReset() { fs = 1; fx = 0; fy = 0; foApply(); }
  function openFocus(fig) {
    if (focused) closeFocus();
    focused = fig; foHome = fig.parentNode; foNext = fig.nextSibling;
    var c = figCy(fig); if (c) { foCyCss = c.style.cssText; c.style.width = "90vw"; c.style.height = "86vh"; }
    fs = 1; fx = 0; fy = 0; fig.style.transformOrigin = "0 0"; fig.style.transform = "";
    fo.appendChild(fig); document.body.classList.add("figfocus"); fo.classList.add("on");
    if (!foIsGraph()) fig.style.cursor = "grab";
    requestAnimationFrame(function () { refitCy(fig); });   // re-fit graph to the big container
    setTimeout(function () { refitCy(fig); }, 60);
  }
  function closeFocus() {
    if (!focused) return;
    var fig = focused, c = figCy(fig);
    fig.style.transform = ""; fig.style.transformOrigin = ""; fig.style.cursor = ""; fs = 1; fx = 0; fy = 0; fdrag = false;
    if (c) c.style.cssText = foCyCss || "";
    if (foNext && foNext.parentNode === foHome) foHome.insertBefore(fig, foNext); else if (foHome) foHome.appendChild(fig);
    fo.classList.remove("on"); document.body.classList.remove("figfocus");
    focused = null; foHome = null; foNext = null; foCyCss = null;
    requestAnimationFrame(function () { refitCy(fig); });   // restore graph to slide-size
  }
  function toggleFocus(fig) { if (focused === fig) closeFocus(); else openFocus(fig); }
  // focus-overlay zoom(wheel)+pan(drag) for image figures; graphs keep cytoscape's own zoom/pan.
  // capture phase + stopPropagation so the inner img/canvas handlers don't double-handle.
  // NOTE: close only on a genuine backdrop click (down+up on the backdrop, no drag) — never via the
  // synthetic `click`, which pointer-capture retargets to `fo` after an image drag and would close it.
  fo.addEventListener("wheel", function (e) {
    if (!focused || foIsGraph()) return;
    e.preventDefault(); e.stopPropagation();
    var r = focused.getBoundingClientRect();
    var cx = e.clientX - r.left, cy = e.clientY - r.top;
    var f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    var ns = Math.min(8, Math.max(1, fs * f));
    fx = cx - (cx - fx) * (ns / fs); fy = cy - (cy - fy) * (ns / fs); fs = ns;
    if (fs <= 1.001) { fs = 1; fx = 0; fy = 0; }
    foApply();
  }, { capture: true, passive: false });
  fo.addEventListener("pointerdown", function (e) {
    if (!focused) return;
    if (e.target === fo) { fdownbg = true; fbx = e.clientX; fby = e.clientY; return; }   // backdrop: maybe close on release
    if (foIsGraph()) return;                                                             // graph: cytoscape handles drag
    e.preventDefault(); e.stopPropagation(); fdrag = true; flx = e.clientX; fly = e.clientY;
    focused.style.cursor = "grabbing";
    try { fo.setPointerCapture(e.pointerId); } catch (_) {}
  }, { capture: true });
  fo.addEventListener("pointermove", function (e) {
    if (!fdrag) return; e.stopPropagation();
    fx += e.clientX - flx; fy += e.clientY - fly; flx = e.clientX; fly = e.clientY; foApply();
  }, { capture: true });
  function foEndDrag(e) {
    if (fdrag) { fdrag = false; if (focused) focused.style.cursor = "grab"; }
    if (fdownbg) { fdownbg = false; if (Math.hypot(e.clientX - fbx, e.clientY - fby) <= 6) closeFocus(); }   // backdrop click (not drag) closes
  }
  fo.addEventListener("pointerup", foEndDrag, { capture: true });
  fo.addEventListener("pointercancel", foEndDrag, { capture: true });
  fo.addEventListener("dragstart", function (e) { e.preventDefault(); }, { capture: true });   // kill native image drag (else pan stalls)
  fo.addEventListener("dblclick", function (e) { if (focused && !foIsGraph() && e.target !== fo) { e.stopPropagation(); foReset(); } }, { capture: true });
  (function () {                                            // inject an enlarge button onto every figure
    var figs = document.querySelectorAll("figure.diagram, figure.fig");
    for (var i = 0; i < figs.length; i++) {
      (function (fig) {
        if (fig.__figbtn) return; fig.__figbtn = true;
        var b = document.createElement("button"); b.className = "figzoom"; b.type = "button";
        b.title = "그림만 확대 (다시 누르거나 Esc로 닫기)"; b.innerHTML = "&#128269;";
        b.addEventListener("click", function (e) { e.stopPropagation(); e.preventDefault(); toggleFocus(fig); });
        fig.appendChild(b);
      })(figs[i]);
    }
  })();

  // ---- fit to current screen: reset slide zoom + re-fit base scale to the viewport ----
  function fitScreen() { closeFocus(); resetZoom(); if (D.fit) D.fit(); }
  bar.querySelector("#pr_fit").onclick = fitScreen;
  document.addEventListener("fullscreenchange", function () { if (D.fit) D.fit(); });

  // ---- click-to-advance: nav mode · un-zoomed · off media · not a drag ----
  var dX = 0, dY = 0, down = false;
  stage.addEventListener("pointerdown", function (e) { down = true; dX = e.clientX; dY = e.clientY; });
  stage.addEventListener("pointerup", function (e) {
    if (!down) return; down = false;
    if (mode !== "nav" || zs > 1 || panning) return;
    if (interactive(e.target)) return;
    if (Math.hypot(e.clientX - dX, e.clientY - dY) > 6) return;   // it was a drag, not a click
    var r = stage.getBoundingClientRect();
    if ((e.clientX - r.left) / r.width > 0.5) D.next(); else D.prev();
  });

  // ---- keys (coexists with the deck's own arrow/space/O/F handler) ----
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) { undo(); e.preventDefault(); return; }
    switch (e.key) {
      case "p": case "P": setMode(mode === "pen" ? "nav" : "pen"); e.preventDefault(); break;
      case "e": case "E": if (mode === "pen") toggleErase(); break;
      case "x": case "X": if (mode === "pen") clearSlide(); break;
      case "0": fitScreen(); break;
      case "Escape": closeFocus(); setMode("nav"); resetZoom(); break;
    }
  });

  // ---- slide change → reset zoom, repaint this slide's strokes ----
  window.addEventListener("deck:show", function () { closeFocus(); resetZoom(); redraw(); });
  window.addEventListener("resize", function () { if (zs > 1) resetZoom(); });
  resetZoom(); redraw();
})();
