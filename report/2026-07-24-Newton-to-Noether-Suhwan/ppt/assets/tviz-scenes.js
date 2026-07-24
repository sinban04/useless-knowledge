/* tviz-scenes.js — per-topic animation scene registry (TOPIC SLOT).
   The deck kit ships this EMPTY. Each topic supplies its own scenes here.

   Contract (engine = tviz.js, neutral): each scene is
     window.TVIZ_SCENES[id] = { id, title, subtitle, intro, steps:[ { title, caption, paint(g,k) } ] }
   where in paint(g,k):  g = drawing-helper bundle (g.ctx, g.W, g.H, g.col palette,
   g.token/g.bars/g.heat/g.arrow/g.text ...),  k = 0..1 step progress (engine tweens it).

   To author scenes for a new topic, copy examples/tviz-scenes.transformer-example.js
   as a worked reference and replace its scene bodies. A slide opts in with "scene":"<id>".
   If a deck uses no animations, leaving this empty registry is fine. */
(function () {
  'use strict';
  window.TVIZ_SCENES = {};
})();
