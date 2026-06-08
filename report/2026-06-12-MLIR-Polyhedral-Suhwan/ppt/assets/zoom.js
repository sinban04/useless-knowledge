/* zoom.js — in-place wheel/pinch zoom + drag pan for NON-cytoscape diagram media
   (figure <img> SVG illustrations, inline <svg>, mermaid-rendered <svg>).
   Cytoscape graphs (.cy) use their own native zoom (cyto.js: userZoomingEnabled).
   - wheel zooms toward the cursor; drag pans; double-click resets.
   - the wheel is consumed (preventDefault) ONLY while the pointer is over the media,
     so page scroll passes through everywhere else (scroll-type page friendly).
   Per global diagram convention: every graph must be enlargeable; this is the shared
   zoom asset for media that cytoscape's native zoom doesn't cover. */
(function () {
  "use strict";
  function attach(el) {
    if (!el || el.__zoom) return;
    el.__zoom = true;
    var s = 1, x = 0, y = 0, dragging = false, px = 0, py = 0;
    el.style.transformOrigin = "0 0";
    el.style.cursor = "grab";
    el.style.touchAction = "none";
    var host = el.closest("figure") || el.parentNode;
    if (host) host.style.overflow = "hidden";
    function apply() {
      el.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")";
      el.style.cursor = s > 1 ? "grab" : "zoom-in";
    }
    el.addEventListener("wheel", function (e) {
      e.preventDefault();
      var r = el.getBoundingClientRect();
      var cx = e.clientX - r.left, cy = e.clientY - r.top;
      var f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      var ns = Math.min(8, Math.max(1, s * f));
      // keep the point under the cursor fixed while scaling
      x = cx - (cx - x) * (ns / s);
      y = cy - (cy - y) * (ns / s);
      s = ns;
      if (s <= 1.001) { s = 1; x = 0; y = 0; }
      apply();
    }, { passive: false });
    el.addEventListener("pointerdown", function (e) {
      if (s <= 1) return; // only pan when zoomed in
      dragging = true; px = e.clientX; py = e.clientY;
      el.style.cursor = "grabbing";
      if (el.setPointerCapture) try { el.setPointerCapture(e.pointerId); } catch (_) {}
    });
    el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      x += e.clientX - px; y += e.clientY - py; px = e.clientX; py = e.clientY;
      apply();
    });
    function endDrag() { dragging = false; el.style.cursor = s > 1 ? "grab" : "zoom-in"; }
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
