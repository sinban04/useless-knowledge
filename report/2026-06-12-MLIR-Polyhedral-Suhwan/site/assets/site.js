/* site.js — runtime for the MLIR seminar pages.
   (1) render mermaid (theme follows system light/dark, matching the useless-knowledge paper auto-dark theme)
   (2) mount polyhedral animations INLINE via PolyViz.mount when scrolled into view (no iframe). */
(function () {
  "use strict";

  // ---- mermaid ----
  if (window.mermaid && typeof window.mermaid.initialize === "function") {
    var dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose", // allow click->href in the index graph
        theme: dark ? "dark" : "neutral",
        themeVariables: { fontFamily: '"Noto Serif KR", "Newsreader", Georgia, serif', fontSize: "15px" },
        flowchart: { curve: "basis", htmlLabels: true, padding: 10, useMaxWidth: true }
      });
      if (document.querySelector("pre.mermaid") && typeof window.mermaid.run === "function") {
        // 웹폰트(Noto Serif KR) 로드 완료 후 렌더 — htmlLabels 라벨 폭/높이 측정이 실제 폰트로
        // 이뤄져, 폰트 로드 전 측정(fallback 폰트)으로 텍스트가 노드 박스에서 잘리는 현상을 방지.
        var runMermaid = function () { window.mermaid.run({ querySelector: "pre.mermaid" }).catch(function (e) { console.warn("mermaid:", e); }); };
        if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
          document.fonts.ready.then(runMermaid);
        } else { runMermaid(); }
      }
    } catch (e) { console.warn("mermaid init:", e); }
  }

  // ---- LaTeX math (KaTeX auto-render; pre/code ignored so MLIR/diagrams are untouched) ----
  if (typeof window.renderMathInElement === "function") {
    try {
      window.renderMathInElement(document.body, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"],
        throwOnError: false
      });
    } catch (e) { console.warn("katex:", e); }
  }

  // ---- inline polyhedral animations ----
  function mountViz(box) {
    if (box.dataset.mounted) return;
    box.dataset.mounted = "1";
    var slug = box.getAttribute("data-scene");
    var scene = window.POLY_SCENES && window.POLY_SCENES[slug];
    if (!scene || !window.PolyViz) { box.innerHTML = '<div class="vizph">애니메이션 로드 실패: ' + slug + "</div>"; return; }
    box.innerHTML = "";
    try { window.PolyViz.mount(box, scene); }
    catch (e) { console.warn("PolyViz.mount", slug, e); box.innerHTML = '<div class="vizph">로드 실패: ' + slug + "</div>"; }
  }
  var boxes = Array.prototype.slice.call(document.querySelectorAll(".vizbox[data-scene]"));
  if (boxes.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { mountViz(en.target); io.unobserve(en.target); } });
      }, { rootMargin: "240px 0px" });
      boxes.forEach(function (b) { io.observe(b); });
    } else {
      boxes.forEach(mountViz);
    }
  }
})();
