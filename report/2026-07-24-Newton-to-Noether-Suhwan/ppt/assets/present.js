/* present.js — presenter overlay for html-ppt slide decks: whole-slide zoom + pen drawing.
   Reusable drop-in. Requires the deck to expose:
     window.SeminarDeck = { deck:<#deck el>, stage:<#stage el>, get cur(), next(), prev() }
   and to dispatch window event "deck:show" whenever the active slide changes.

   Behaviour
   - Wheel over slide BACKGROUND = zoom the whole slide toward the cursor (0.4–6×).
     Wheel over a graph/figure is left to that element's own zoom (cyto.js / zoom.js).
   - When zoomed in, dragging the background pans; double-click (or Esc) resets.
   - P = pen on/off · color swatches · pen width presets ([ / ] keys) · E = eraser ·
     X = clear slide · Ctrl+Z = undo. Strokes are stored per slide and repainted on
     slide change. Eraser width scales with the chosen pen width.
   - Touch: two-finger pinch on the slide background zooms (same clamp as wheel),
     one-finger drag pans when zoomed, tap advances. A pinch never flips the slide.
     Coarse-pointer devices get bigger toolbar targets, always-visible figure tools,
     a fullscreen button in #hud (with landscape lock where supported) and a touch hint.
   - Click-to-advance fires ONLY in nav mode, un-zoomed, off interactive media,
     not at the end of a drag, and not as the tail of a multi-touch gesture. */
(function () {
  "use strict";
  var D = window.SeminarDeck;
  if (!D || !D.deck || !D.stage) { console.warn("present.js: window.SeminarDeck missing"); return; }
  var deck = D.deck, stage = D.stage;

  // ---- state ----
  var mode = "nav", zs = 1, zx = 0, zy = 0, panning = false;
  var curColor = "#e23b2e", eraser = false, ann = {}, drawing = false, curStroke = null, strokePid = null;
  var PENW = [2, 3.4, 6, 10], curWidth = 3.4;
  try { var savedW = parseFloat(localStorage.getItem("presentjs.penw")); if (PENW.indexOf(savedW) >= 0) curWidth = savedW; } catch (_) {}
  var isCoarse = !!(window.matchMedia && matchMedia("(pointer:coarse)").matches);
  function cur() { return D.cur; }
  function interactive(t) { return t && t.closest && t.closest("a, button, input, select, textarea, .cy, figure, .vizwrap, .vizbox"); }

  // ---- injected styles ----
  var css = ""
    + "#stage{transform-origin:0 0;touch-action:none}"
    + "#penLayer{position:absolute;inset:0;z-index:30;pointer-events:none;touch-action:none}"
    + "body.pen #penLayer{pointer-events:auto;cursor:crosshair}"
    + "#prtools{position:fixed;bottom:54px;right:18px;z-index:60;display:flex;gap:7px;align-items:center;"
    + "background:rgba(0,0,0,.42);padding:7px 9px;border-radius:12px;font-family:var(--mono,ui-monospace,monospace);backdrop-filter:blur(4px)}"
    + "#prtools .grp{display:none;gap:7px;align-items:center}"
    + "body.pen #prtools .grp{display:flex}"
    + "#prtools .sw{width:21px;height:21px;border-radius:50%;cursor:pointer;border:2px solid rgba(255,255,255,.35)}"
    + "#prtools .sw.on{border-color:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.55)}"
    + "#prtools .wd{width:22px;height:22px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;"
    + "cursor:pointer;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22)}"
    + "#prtools .wd i{display:block;border-radius:50%;background:#fff}"
    + "#prtools .wd.on{background:rgba(255,255,255,.32);border-color:#fff}"
    + "#prtools .sep{width:1px;height:18px;background:rgba(255,255,255,.22)}"
    + "#prtools button{background:rgba(255,255,255,.1);color:#e8e3d8;border:1px solid rgba(255,255,255,.18);"
    + "height:26px;padding:0 9px;border-radius:7px;cursor:pointer;font-size:12px}"
    + "#prtools button:hover{background:rgba(255,255,255,.22)}"
    + "#prtools button.on{background:#b5341f;border-color:#b5341f;color:#fff}"
    + "#prtools .zl{color:#cfc9bd;font-size:12px;min-width:40px;text-align:center}"
    + "#prtools .zl.hide{display:none}"
    + "figure.diagram,figure.fig{position:relative}"
    + ".figtools{position:absolute;top:8px;right:8px;z-index:5;display:flex;gap:6px;opacity:0;transition:opacity .12s}"
    + "figure:hover .figtools{opacity:1}"
    + "body.figfocus .figtools{opacity:0}"
    + ".figtools button{width:28px;height:28px;border-radius:7px;border:1px solid rgba(0,0,0,.18);"
    + "background:rgba(255,255,255,.9);color:#333;cursor:pointer;font-size:14px;line-height:26px;text-align:center;padding:0}"
    + ".figtools button:hover{background:#fff}"
    + ".figtools .ffull{background:rgba(255,255,255,.66);color:#777;font-size:13px}"
    + "#figfocus{position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;"
    + "overflow:hidden;touch-action:none;user-select:none;background:rgba(12,12,15,.84);cursor:zoom-out}"
    + "#figfocus.on{display:flex}"
    + "#figfocus>figure{margin:0;width:auto;max-width:96vw;max-height:96vh;display:flex;align-items:center;"
    + "justify-content:center;background:transparent;cursor:default}"
    + "#figfocus img{max-width:94vw;max-height:94vh;width:auto;height:auto;-webkit-user-drag:none;user-drag:none;background:#fff;border-radius:8px;padding:8px}"
    + "#figfocus figcaption{display:none}"
    // ---- touch / small-screen adjustments (mobile) ----
    + "#hint{max-width:calc(100vw - 240px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
    + "@media (hover:none){.figtools{opacity:.8}}"
    + "@media (pointer:coarse){"
    +   "#prtools{bottom:72px;right:12px;gap:9px;padding:9px 11px;flex-wrap:wrap;max-width:calc(100vw - 24px);justify-content:flex-end}"
    +   "#prtools button{height:38px;padding:0 13px;font-size:14px}"
    +   "#prtools .sw{width:27px;height:27px}"
    +   "#prtools .wd{width:28px;height:28px}"
    +   ".figtools button{width:36px;height:36px;font-size:17px;line-height:34px}"
    +   "#hud button{height:42px;min-width:42px;font-size:18px}"
    + "}"
    + "@media (max-width:900px){.ovgrid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}}";
  var st = document.createElement("style"); st.id = "presentjs-style"; st.textContent = css; document.head.appendChild(st);

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
    + '<span class="sep"></span>'
    + '<span class="wd" data-w="2" title="가는 펜 ([ 로 얇게)"><i style="width:4px;height:4px"></i></span>'
    + '<span class="wd" data-w="3.4" title="보통 펜"><i style="width:7px;height:7px"></i></span>'
    + '<span class="wd" data-w="6" title="굵은 펜"><i style="width:11px;height:11px"></i></span>'
    + '<span class="wd" data-w="10" title="아주 굵은 펜 (] 로 굵게)"><i style="width:15px;height:15px"></i></span>'
    + '<span class="sep"></span>'
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
    // rect는 transform 적용 후 좌표 — 점화식은 비변환 원점 기준이라 +zx/+zy 로 되돌린다 (안 하면 줌 초점이 표류)
    var cx = e.clientX - r.left + zx, cy = e.clientY - r.top + zy;
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

  // ---- touch pinch: two-finger zoom/pan on the slide background (wheel equivalent) ----
  var tp = new Map(), pinchD = 0, pinchX = 0, pinchY = 0, pinching = false, gestured = false;
  stage.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "touch" || mode !== "nav" || interactive(e.target)) return;
    tp.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (tp.size === 2) {
      var a = Array.from(tp.values());
      pinching = true; gestured = true; panning = false;
      pinchD = Math.hypot(a[1].x - a[0].x, a[1].y - a[0].y) || 1;
      pinchX = (a[0].x + a[1].x) / 2; pinchY = (a[0].y + a[1].y) / 2;
    }
  });
  window.addEventListener("pointermove", function (e) {
    if (!tp.has(e.pointerId)) return;
    tp.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!pinching || tp.size < 2) return;
    var a = Array.from(tp.values());
    var d = Math.hypot(a[1].x - a[0].x, a[1].y - a[0].y) || 1;
    var mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
    var r = stage.getBoundingClientRect();
    var cx = mx - r.left + zx, cy = my - r.top + zy;
    var ns = Math.min(6, Math.max(1, zs * (d / pinchD))); pinchD = d;
    zx = cx - (cx - zx) * (ns / zs); zy = cy - (cy - zy) * (ns / zs); zs = ns;
    zx += mx - pinchX; zy += my - pinchY; pinchX = mx; pinchY = my;   // two-finger drag also pans
    if (zs <= 1.001) { zs = 1; zx = 0; zy = 0; }
    applyZoom();
  });
  function tpEnd(e) {
    if (!tp.delete(e.pointerId)) return;
    if (tp.size < 2) pinching = false;
    // keep `gestured` through this event's advance check (stage handlers fire first), then clear
    if (tp.size === 0) setTimeout(function () { gestured = false; }, 60);
  }
  window.addEventListener("pointerup", tpEnd);
  window.addEventListener("pointercancel", tpEnd);

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
  function eraserW() { return Math.max(16, curWidth * 8); }   // eraser scales with pen width (28 at the old 3.4 default)
  pen.addEventListener("pointerdown", function (e) {
    if (mode !== "pen" || drawing) return; e.preventDefault();   // ignore a second finger — one stroke at a time
    drawing = true; strokePid = e.pointerId;
    curStroke = { mode: eraser ? "erase" : "pen", color: curColor, width: eraser ? eraserW() : curWidth, pts: [toLogical(e)] };
    strokesFor(cur()).push(curStroke);
    try { pen.setPointerCapture(e.pointerId); } catch (_) {}
    redraw();
  });
  pen.addEventListener("pointermove", function (e) { if (drawing && e.pointerId === strokePid) { curStroke.pts.push(toLogical(e)); redraw(); } });
  function endStroke(e) { if (e.pointerId !== strokePid) return; drawing = false; curStroke = null; strokePid = null; }
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
  function setWidth(w) {
    curWidth = w;
    var wd = bar.querySelectorAll(".wd");
    for (var i = 0; i < wd.length; i++) wd[i].classList.toggle("on", parseFloat(wd[i].getAttribute("data-w")) === w);
    try { localStorage.setItem("presentjs.penw", String(w)); } catch (_) {}
  }
  function stepWidth(dir) { var i = PENW.indexOf(curWidth); setWidth(PENW[Math.max(0, Math.min(PENW.length - 1, i + dir))]); }
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
    var wd = bar.querySelectorAll(".wd");
    for (var j = 0; j < wd.length; j++) {
      (function (el) { el.onclick = function () { setWidth(parseFloat(el.getAttribute("data-w"))); setMode("pen"); }; })(wd[j]);
    }
  })();
  setWidth(curWidth);   // mark the active width dot (restored from localStorage when available)

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
    // entering fullscreen → clear any in-box zoom so the overlay starts clean
    fig.__zstep = 0;
    var im = fig.querySelector("img, svg"); if (im && im.__zoomReset) im.__zoomReset();
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
    var im = fig.querySelector("img, svg"); if (im && im.__zoomReset) im.__zoomReset();   // clear any leftover in-box transform
    fig.__zstep = 0;
    requestAnimationFrame(function () { refitCy(fig); });   // restore graph to slide-size
  }
  function toggleFocus(fig) { if (focused === fig) closeFocus(); else openFocus(fig); }
  // ---- DEFAULT: in-box zoom (graph = cytoscape native, image = zoom.js) — stays inside the figure box ----
  function inboxMedia(fig) {
    var c = fig.querySelector(".cy"); if (c && c.__zoomStep) return c;        // cytoscape graph
    var m = fig.querySelector("img, svg"); if (m && m.__zoomStep) return m;   // image / svg via zoom.js
    return null;
  }
  function inboxZoom(fig) {
    var m = inboxMedia(fig);
    if (!m) { toggleFocus(fig); return; }                 // no in-box engine loaded → fall back to fullscreen
    fig.__zstep = (fig.__zstep || 0) + 1;
    if (fig.__zstep > 3) { fig.__zstep = 0; if (m.__zoomReset) m.__zoomReset(); }   // cycle: 3 steps in, then back to fit
    else m.__zoomStep(1.6);
  }
  // focus-overlay zoom(wheel)+pan(drag) for image figures; graphs keep cytoscape's own zoom/pan.
  // capture phase + stopPropagation so the inner img/canvas handlers don't double-handle.
  // NOTE: close only on a genuine backdrop click (down+up on the backdrop, no drag) — never via the
  // synthetic `click`, which pointer-capture retargets to `fo` after an image drag and would close it.
  fo.addEventListener("wheel", function (e) {
    if (!focused || foIsGraph()) return;
    e.preventDefault(); e.stopPropagation();
    var r = focused.getBoundingClientRect();
    var cx = e.clientX - r.left + fx, cy = e.clientY - r.top + fy;   // 비변환 원점 보정 (stage zoom과 동일)
    var f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    var ns = Math.min(8, Math.max(1, fs * f));
    fx = cx - (cx - fx) * (ns / fs); fy = cy - (cy - fy) * (ns / fs); fs = ns;
    if (fs <= 1.001) { fs = 1; fx = 0; fy = 0; }
    foApply();
  }, { capture: true, passive: false });
  var ftp = new Map(), fpD = 0, fpX = 0, fpY = 0, fpinch = false;   // focus-overlay pinch (touch, image figures)
  fo.addEventListener("pointerdown", function (e) {
    if (!focused) return;
    if (e.pointerType === "touch" && !foIsGraph()) {
      ftp.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ftp.size === 2) {
        var a = Array.from(ftp.values());
        fpinch = true; fdrag = false; fdownbg = false;
        fpD = Math.hypot(a[1].x - a[0].x, a[1].y - a[0].y) || 1;
        fpX = (a[0].x + a[1].x) / 2; fpY = (a[0].y + a[1].y) / 2;
        e.preventDefault(); e.stopPropagation(); return;
      }
    }
    if (e.target === fo) { fdownbg = true; fbx = e.clientX; fby = e.clientY; return; }   // backdrop: maybe close on release
    if (foIsGraph()) return;                                                             // graph: cytoscape handles drag
    e.preventDefault(); e.stopPropagation(); fdrag = true; flx = e.clientX; fly = e.clientY;
    focused.style.cursor = "grabbing";
    try { fo.setPointerCapture(e.pointerId); } catch (_) {}
  }, { capture: true });
  fo.addEventListener("pointermove", function (e) {
    if (ftp.has(e.pointerId)) {
      ftp.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (fpinch && ftp.size >= 2 && focused) {
        e.preventDefault(); e.stopPropagation();
        var a = Array.from(ftp.values());
        var d = Math.hypot(a[1].x - a[0].x, a[1].y - a[0].y) || 1;
        var mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
        var r = focused.getBoundingClientRect();
        var cx = mx - r.left + fx, cy = my - r.top + fy;
        var ns = Math.min(8, Math.max(1, fs * (d / fpD))); fpD = d;
        fx = cx - (cx - fx) * (ns / fs); fy = cy - (cy - fy) * (ns / fs); fs = ns;
        fx += mx - fpX; fy += my - fpY; fpX = mx; fpY = my;
        if (fs <= 1.001) { fs = 1; fx = 0; fy = 0; }
        foApply(); return;
      }
    }
    if (!fdrag) return; e.stopPropagation();
    fx += e.clientX - flx; fy += e.clientY - fly; flx = e.clientX; fly = e.clientY; foApply();
  }, { capture: true });
  function foEndDrag(e) {
    if (ftp.delete(e.pointerId) && ftp.size < 2) fpinch = false;
    if (fdrag) { fdrag = false; if (focused) focused.style.cursor = "grab"; }
    if (fdownbg) { fdownbg = false; if (Math.hypot(e.clientX - fbx, e.clientY - fby) <= 6) closeFocus(); }   // backdrop click (not drag) closes
  }
  fo.addEventListener("pointerup", foEndDrag, { capture: true });
  fo.addEventListener("pointercancel", foEndDrag, { capture: true });
  fo.addEventListener("dragstart", function (e) { e.preventDefault(); }, { capture: true });   // kill native image drag (else pan stalls)
  fo.addEventListener("dblclick", function (e) { if (focused && !foIsGraph() && e.target !== fo) { e.stopPropagation(); foReset(); } }, { capture: true });
  (function () {                                            // inject enlarge buttons onto every figure
    var figs = document.querySelectorAll("figure.diagram, figure.fig");
    for (var i = 0; i < figs.length; i++) {
      (function (fig) {
        if (fig.__figbtn) return; fig.__figbtn = true;
        var tools = document.createElement("div"); tools.className = "figtools";
        // primary (default, ALL figures): in-box zoom — content scales inside the figure box
        var zin = document.createElement("button"); zin.type = "button"; zin.className = "fzin";
        zin.title = "박스 안에서 확대 (클릭=한 단계 확대 · 한 바퀴 돌면 원래대로 · 휠/드래그·더블클릭도 가능)";
        zin.innerHTML = "&#128269;";   // 🔍
        zin.addEventListener("click", function (e) { e.stopPropagation(); e.preventDefault(); inboxZoom(fig); });
        tools.appendChild(zin);
        // GLOBAL RULE: diagrams (figure.diagram, vector cytoscape) get NO full-screen overlay —
        // box-contained zoom only. The ⛶ full-viewport button is added for RASTER IMAGES
        // (figure.fig) only, where pixel detail can warrant full-screen.
        if (fig.classList.contains("fig")) {
          var full = document.createElement("button"); full.type = "button"; full.className = "ffull";
          full.title = "전체화면으로 크게 보기 (다시 누르거나 Esc로 닫기)";
          full.innerHTML = "&#9974;";    // ⛶
          full.addEventListener("click", function (e) { e.stopPropagation(); e.preventDefault(); toggleFocus(fig); });
          tools.appendChild(full);
        }
        fig.appendChild(tools);
        // double-click anywhere on the figure resets the in-box step counter (media itself
        // also resets via cyto.js/zoom.js dblclick handlers)
        fig.addEventListener("dblclick", function () { fig.__zstep = 0; });
      })(figs[i]);
    }
  })();

  // ---- fit to current screen: reset slide zoom + re-fit base scale to the viewport ----
  function fitScreen() { closeFocus(); resetZoom(); if (D.fit) D.fit(); }
  bar.querySelector("#pr_fit").onclick = fitScreen;
  document.addEventListener("fullscreenchange", function () { if (D.fit) D.fit(); });

  // ---- click-to-advance: nav mode · un-zoomed · off media · not a drag · not a multi-touch tail ----
  var dX = 0, dY = 0, down = false;
  stage.addEventListener("pointerdown", function (e) { down = true; dX = e.clientX; dY = e.clientY; });
  stage.addEventListener("pointerup", function (e) {
    if (!down) return; down = false;
    if (mode !== "nav" || zs > 1 || panning) return;
    if (gestured) return;                                          // a pinch just happened — don't flip the slide
    if (interactive(e.target)) return;
    var slop = e.pointerType === "touch" ? 12 : 6;                 // finger taps jitter more than mouse clicks
    if (Math.hypot(e.clientX - dX, e.clientY - dY) > slop) return; // it was a drag, not a click
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
      case "[": if (mode === "pen") stepWidth(-1); break;
      case "]": if (mode === "pen") stepWidth(1); break;
      case "0": fitScreen(); break;
      case "Escape": closeFocus(); setMode("nav"); resetZoom(); break;
    }
  });

  // ---- coarse-pointer (touch) extras: touch hint text + fullscreen button in #hud ----
  if (isCoarse) {
    var hintEl = document.getElementById("hint");
    if (hintEl) hintEl.textContent = "좌/우 탭 이동 · 두 손가락 확대 · 🔍 그림확대 · ✎ 펜";
    var hud = document.getElementById("hud");
    if (hud && document.documentElement.requestFullscreen) {
      var fsb = document.createElement("button"); fsb.id = "pr_fs"; fsb.title = "전체화면 (가로 고정)"; fsb.innerHTML = "&#9974;";
      fsb.onclick = function () {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().then(function () {
            try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function () {}); } catch (_) {}
          }).catch(function () {});
        } else {
          try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (_) {}
          document.exitFullscreen();
        }
      };
      hud.appendChild(fsb);
    }
  }

  // ---- state API: lets a host app (e.g. the notepad deck) persist / restore / reindex
  //      per-slide pen strokes. ann = { "<slideIndex>": [ {mode,color,width,pts:[{x,y}..]} .. ] } ----
  window.SeminarPresent = {
    getAnn: function () { return ann; },
    setAnn: function (a) { ann = a || {}; redraw(); },
    redraw: redraw,
    setMode: setMode
  };

  // ---- slide change → reset zoom, repaint this slide's strokes ----
  window.addEventListener("deck:show", function () { closeFocus(); resetZoom(); redraw(); });
  window.addEventListener("resize", function () { if (zs > 1) resetZoom(); });
  resetZoom(); redraw();
})();
