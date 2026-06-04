/* shell.js — builds the page chrome (nav, header, intro, prev/next) from
   window.POLY_TOPICS + window.POLY_SCENE, then mounts the scene.
   Every topic HTML is identical except for which *.config.js it loads. */
(function () {
  var topics = window.POLY_TOPICS || [];
  var scene = window.POLY_SCENE;
  if (!scene) { document.body.innerHTML = '<p style="color:#ff7a8a;padding:40px">POLY_SCENE 없음 — config 로드 실패</p>'; return; }

  var idx = -1;
  for (var k = 0; k < topics.length; k++) if (topics[k].id === scene.id) { idx = k; break; }
  var cur = (idx >= 0) ? topics[idx] : { n: '', title: scene.title || '', en: scene.subtitle || '' };
  var prev = (idx > 0) ? topics[idx - 1] : null;
  var next = (idx >= 0 && idx < topics.length - 1) ? topics[idx + 1] : null;

  document.title = (cur.n ? cur.n + '. ' : '') + (scene.title || '') + ' · affine-MLIR 폴리헤드럴 시각화';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var wrap = document.getElementById('wrap') || document.body;
  var html = '';
  html += '<nav class="pv-nav">';
  html += '<a href="../index.html">← 전체 목록</a><span class="sep">/</span>';
  html += '<span>' + esc(cur.n) + '. ' + esc(scene.title) + '</span>';
  html += '<span class="badge">polyhedral · affine dialect</span>';
  html += '</nav>';
  html += '<header class="pv-header"><h1>' + esc(cur.n ? cur.n + '. ' : '') + esc(scene.title) + '</h1>';
  html += '<p class="sub">' + esc(scene.subtitle || cur.en || '') + '</p></header>';
  if (scene.intro) html += '<div class="pv-intro">' + scene.intro + '</div>';
  html += '<div id="stage"></div>';

  html += '<nav class="pv-topicnav">';
  if (prev) html += '<a href="' + prev.file + '"><span class="k">← 이전 · ' + esc(prev.n) + '</span>' + esc(prev.title) + '</a>';
  else html += '<a class="disabled"><span class="k">이전</span>—</a>';
  if (next) html += '<a class="next" href="' + next.file + '"><span class="k">다음 · ' + esc(next.n) + ' →</span>' + esc(next.title) + '</a>';
  else html += '<a class="next disabled"><span class="k">다음</span>—</a>';
  html += '</nav>';

  wrap.innerHTML = html;
  window.__scene = PolyViz.mount('#stage', scene);
})();
