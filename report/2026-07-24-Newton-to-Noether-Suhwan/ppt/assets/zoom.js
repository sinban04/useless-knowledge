/* zoom.js — in-place wheel/pinch zoom + drag pan for NON-cytoscape diagram media
   (figure <img> SVG illustrations, inline <svg>, mermaid-rendered <svg>).
   Cytoscape graphs (.cy) use their own native zoom (cyto.js: userZoomingEnabled).
   - wheel zooms toward the cursor; drag pans; double-click resets.
   - touch: two-finger pinch zooms toward the midpoint (and pans with the midpoint);
     one-finger drag pans when zoomed in — same clamps as the wheel path.
   - the wheel is consumed (preventDefault) ONLY while the pointer is over the media,
     so page scroll passes through everywhere else (scroll-type page friendly).
   Per global diagram convention: every graph must be enlargeable; this is the shared
   zoom asset for media that cytoscape's native zoom doesn't cover. */
(function () {
  "use strict";
  function attach(el) {
    if (!el || el.__zoom) return;
    el.__zoom = true;
    var s = 1, x = 0, y = 0, dragging = false, px = 0, py = 0, dragScale = 1;
    el.style.transformOrigin = "0 0";
    el.style.cursor = "grab";
    el.style.touchAction = "none";
    // Kill the browser's native image/SVG drag-and-drop. Without this, mousedown+move over an
    // <img> starts a native drag → 🚫 (no-drop) cursor + it steals our pointer pan gesture → jank.
    // (Diagrams are <canvas> so they never had this; only images/SVG did.)
    el.style.userSelect = "none";
    el.style.webkitUserDrag = "none";
    el.setAttribute("draggable", "false");
    el.addEventListener("dragstart", function (e) { e.preventDefault(); });
    var host = el.closest("figure") || el.parentNode;
    if (host) host.style.overflow = "hidden";
    // Effective ancestor scale S (e.g. a fit-scaled slide #stage): the translate lives in
    // element-local px, but ancestors map local→screen by ×S, so screen px ÷ S = local px.
    // The host (figure) is NOT transformed by the element's own transform → rect/offset gives S.
    // Without this, drag/wheel use raw client px and the image lags (S<1) or overshoots (S>1)
    // the cursor on a scaled slide — janky pan. (On the scroll site S=1, so behavior is unchanged.)
    function scaleOf() {
      if (!host) return 1;
      var ow = host.offsetWidth, w = host.getBoundingClientRect().width;
      return (ow > 0 && w > 0) ? w / ow : 1;
    }
    function apply() {
      el.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")";
      el.style.cursor = s > 1 ? "grab" : "zoom-in";
    }
    // scale toward a fixed anchor point (cx,cy in element-local px), clamped to [1,8]
    function zoomAbout(cx, cy, ns) {
      ns = Math.min(8, Math.max(1, ns));
      x = cx - (cx - x) * (ns / s);
      y = cy - (cy - y) * (ns / s);
      s = ns;
      if (s <= 1.001) { s = 1; x = 0; y = 0; }
      apply();
    }
    // in-box (in-place) zoom API for the figure toolbar's "확대" button — zoom about the
    // element center so a button click (no cursor position) still scales sensibly.
    el.__zoomStep = function (factor) {
      var r = el.getBoundingClientRect(), S = scaleOf();
      zoomAbout((r.width / 2) / S, (r.height / 2) / S, s * factor);
    };
    el.__zoomReset = function () { s = 1; x = 0; y = 0; apply(); };
    el.addEventListener("wheel", function (e) {
      e.preventDefault();
      var r = el.getBoundingClientRect(), S = scaleOf();
      var f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      // keep the point under the cursor fixed while scaling (screen offset → local ÷ S)
      zoomAbout((e.clientX - r.left) / S, (e.clientY - r.top) / S, s * f);
    }, { passive: false });
    // two-finger pinch (touch): zoom about the finger midpoint, midpoint drift pans
    var tp = new Map(), pd = 0, pmx = 0, pmy = 0, pinch = false;
    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") {
        tp.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (tp.size === 2) {
          var a = Array.from(tp.values());
          pinch = true; dragging = false;
          pd = Math.hypot(a[1].x - a[0].x, a[1].y - a[0].y) || 1;
          pmx = (a[0].x + a[1].x) / 2; pmy = (a[0].y + a[1].y) / 2;
          e.preventDefault();
          return;
        }
      }
      if (s <= 1) return; // only pan when zoomed in
      e.preventDefault();  // suppress native image drag / text selection so the pan is smooth
      dragging = true; px = e.clientX; py = e.clientY; dragScale = scaleOf();
      el.style.cursor = "grabbing";
      if (el.setPointerCapture) try { el.setPointerCapture(e.pointerId); } catch (_) {}
    });
    el.addEventListener("pointermove", function (e) {
      if (tp.has(e.pointerId)) {
        tp.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch && tp.size >= 2) {
          var a = Array.from(tp.values());
          var d = Math.hypot(a[1].x - a[0].x, a[1].y - a[0].y) || 1;
          var mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
          var r = el.getBoundingClientRect(), S = scaleOf();
          x += (mx - pmx) / S; y += (my - pmy) / S;   // midpoint drift = pan (screen→local ÷S)
          zoomAbout((mx - r.left) / S, (my - r.top) / S, s * (d / pd));
          pd = d; pmx = mx; pmy = my;
          return;
        }
      }
      if (!dragging) return;
      // convert cursor's screen-px delta to element-local px (÷S) so the image tracks the
      // cursor 1:1 on a fit-scaled slide instead of lagging/overshooting.
      x += (e.clientX - px) / dragScale; y += (e.clientY - py) / dragScale;
      px = e.clientX; py = e.clientY;
      apply();
    });
    function endDrag(e) {
      if (e && tp.delete(e.pointerId) && tp.size < 2) pinch = false;
      dragging = false; el.style.cursor = s > 1 ? "grab" : "zoom-in";
    }
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("dblclick", function (e) { e.preventDefault(); s = 1; x = 0; y = 0; apply(); });
    apply();
  }
  function run() {
    var sel = "figure img, figure > svg, pre.mermaid > svg, .mermaid > svg";
    document.querySelectorAll(sel).forEach(attach);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  // mermaid / late media render asynchronously — re-scan after full load
  window.addEventListener("load", run);
})();
