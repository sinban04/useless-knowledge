/* =====================================================================
 * poly.js — declarative animation engine for the polyhedral / affine-MLIR
 * loop-transformation visualizer.
 *
 * A "scene" is pure data (see API.md). The engine renders a 2D iteration
 * domain as an integer lattice, morphs it through schedule (transformation)
 * matrices, colors points by tile/lane/core/wavefront, draws dependence
 * vectors, animates several execution orders, and shows synced MLIR code
 * plus optional auxiliary panels (gantt / pipeline / vector lanes /
 * speedup / memory pages).
 *
 * No external dependencies. Works from file://. Designed to also run under
 * a headless DOM stub (node selftest) — all "now" comes from rAF timestamps,
 * no Date.now / Math.random.
 * ===================================================================== */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------- palette
  var PALETTE = [
    '#58d1ff', '#ffb454', '#7c8cff', '#5ce6a3', '#ff7a8a', '#c792ea',
    '#ffd166', '#4dd0e1', '#f78c6c', '#a3e635', '#ff9ecb', '#80cbc4',
    '#b388ff', '#ffd54f', '#69f0ae', '#ff8a65'
  ];
  var IDLE_COLOR = '#3b455f';
  var ACCENT = '#58d1ff';

  // ---------------------------------------------------------------- timing
  var MORPH_MS = 760;
  var REST_MS = 1000;
  var DEFAULT_TICK_MS = 120;

  // ---------------------------------------------------------------- utils
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function isFiniteNum(x) { return typeof x === 'number' && isFinite(x); }

  function applyMat(M, x, y) {
    // M maps loop coords (i,j) -> plane coords (u,v); u is vertical, v horizontal.
    return [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];
  }
  function lerpMat(A, B, t) {
    return [
      [lerp(A[0][0], B[0][0], t), lerp(A[0][1], B[0][1], t)],
      [lerp(A[1][0], B[1][0], t), lerp(A[1][1], B[1][1], t)]
    ];
  }
  var ID = [[1, 0], [0, 1]];

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function rgba(hex, a) { var c = hexToRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  // affine-map row formatting, e.g. (1,1) over [i,j] -> "i + j"
  function fmtRow(a, b, vars) {
    vars = vars || ['i', 'j'];
    var parts = [];
    function term(c, v) {
      if (c === 0) return null;
      if (c === 1) return v;
      if (c === -1) return '-' + v;
      return c + v;
    }
    var t0 = term(a, vars[0]), t1 = term(b, vars[1]);
    if (t0) parts.push(t0);
    if (t1) parts.push(t1.charAt(0) === '-' ? '- ' + t1.slice(1) : '+ ' + t1);
    if (parts.length === 0) return '0';
    return parts.join(' ');
  }

  // ---------------------------------------------------------- MLIR highlight
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  var HL_RE = /(\/\/[^\n]*)|(%[A-Za-z0-9_]+)|(#[A-Za-z0-9_]+)|\b(affine_map|affine_set)\b|((?:affine|scf|memref|arith|func|vector|gpu|cf|tensor|linalg|math)\.[A-Za-z_][A-Za-z0-9_.]*)|\b(index|i1|i8|i16|i32|i64|f16|f32|f64|memref|vector|tensor)\b|\b(func|for|to|step|in|return|reduce|iter_args|constant|private)\b|\b(\d+(?:\.\d+)?)\b/g;
  function highlightLine(escaped) {
    return escaped.replace(HL_RE, function (m, cmt, ssa, hash, mapkw, op, ty, kw, num) {
      if (cmt != null) return '<span class="tok-cmt">' + cmt + '</span>';
      if (ssa != null) return '<span class="tok-ssa">' + ssa + '</span>';
      if (hash != null) return '<span class="tok-map">' + hash + '</span>';
      if (mapkw != null) return '<span class="tok-map">' + mapkw + '</span>';
      if (op != null) return '<span class="tok-op">' + op + '</span>';
      if (ty != null) return '<span class="tok-ty">' + ty + '</span>';
      if (kw != null) return '<span class="tok-kw">' + kw + '</span>';
      if (num != null) return '<span class="tok-num">' + num + '</span>';
      return m;
    });
  }
  function renderCode(src) {
    var lines = String(src == null ? '' : src).replace(/\t/g, '  ').split('\n');
    // trim a single leading/trailing blank line for tidiness
    if (lines.length && lines[0].trim() === '') lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    var out = '';
    for (var k = 0; k < lines.length; k++) {
      var h = highlightLine(escapeHtml(lines[k]));
      if (h === '') h = ' ';
      out += '<span class="ln" data-line="' + (k + 1) + '">' + h + '</span>';
    }
    return out;
  }

  // -------------------------------------------------------------- masks
  var MASKS = {
    'tri-upper': function (i, j) { return i <= j; },
    'tri-lower': function (i, j) { return i >= j; },
    'tri-strict-lower': function (i, j) { return i > j; },
    'tri-strict-upper': function (i, j) { return i < j; }
  };

  // ------------------------------------------------------ coloring / groups
  // Returns an integer group key for a point given the step's color spec.
  function groupKey(spec, p, dom) {
    if (!spec || spec.mode === 'none' || !spec.mode) return 0;
    var i = p.i, j = p.j;
    var i0 = dom.i[0], j0 = dom.j[0];
    switch (spec.mode) {
      case 'wavefront': {
        var by = spec.by || 'i+j';
        return evalExpr(by, i, j);
      }
      case 'expr': return evalExpr(spec.by || 'i+j', i, j);
      case 'tile': {
        var ti = spec.ti || 2, tj = spec.tj || 2;
        var tr = Math.floor((i - i0) / ti), tc = Math.floor((j - j0) / tj);
        var njt = Math.ceil((dom.j[1] - j0 + 1) / tj);
        return tr * njt + tc;
      }
      case 'lane': {
        var vl = spec.vl || 4;
        var dim = spec.dim || 'j';
        var base = (dim === 'i') ? (i - i0) : (j - j0);
        return Math.floor(base / vl);
      }
      case 'core': {
        var cores = spec.cores || 4;
        var unit;
        if (spec.ti || spec.tj) {
          var cti = spec.ti || 1, ctj = spec.tj || 1;
          var ctr = Math.floor((i - i0) / cti), ctc = Math.floor((j - j0) / ctj);
          var cnjt = Math.ceil((dom.j[1] - j0 + 1) / ctj);
          unit = ctr * cnjt + ctc;
        } else {
          var dimc = spec.dim || 'i';
          unit = (dimc === 'i') ? (i - i0) : (j - j0);
        }
        if (spec.distribution === 'cyclic') return unit % cores;
        // block
        var total = spec.units || 0;
        if (!total) {
          // estimate total units
          if (spec.ti || spec.tj) {
            var ni = Math.ceil((dom.i[1] - i0 + 1) / (spec.ti || 1));
            var nj = Math.ceil((dom.j[1] - j0 + 1) / (spec.tj || 1));
            total = ni * nj;
          } else {
            total = (spec.dim === 'j' ? (dom.j[1] - j0 + 1) : (dom.i[1] - i0 + 1));
          }
        }
        var per = Math.ceil(total / cores);
        return Math.min(cores - 1, Math.floor(unit / per));
      }
      default: return 0;
    }
  }
  // tiny safe linear-expr evaluator for keys: supports i, j, i+j, i-j, j-i, 2i+j etc.
  function evalExpr(expr, i, j) {
    if (typeof expr === 'function') return expr(i, j);
    switch (expr) {
      case 'i': return i;
      case 'j': return j;
      case 'i+j': return i + j;
      case 'i-j': return i - j;
      case 'j-i': return j - i;
      case '2i+j': return 2 * i + j;
      case 'i+2j': return i + 2 * j;
      default: return i + j;
    }
  }
  function groupColor(key) {
    var k = ((Math.round(key) % PALETTE.length) + PALETTE.length) % PALETTE.length;
    return PALETTE[k];
  }

  // ------------------------------------------------------ execution ordering
  // Build "ticks": array of arrays of point indices that fire together.
  function buildTicks(points, play, dom, step) {
    if (!play) return null;
    var order = play.order || 'lexico';
    var idx = points.map(function (_, k) { return k; });
    function uOf(k) { var p = points[k]; var t = applyMat(step._M, p.i, p.j); return t[0]; }
    function vOf(k) { var p = points[k]; var t = applyMat(step._M, p.i, p.j); return t[1]; }
    function lexSort(arr) {
      return arr.slice().sort(function (a, b) {
        var ua = uOf(a), ub = uOf(b);
        if (ua !== ub) return ua - ub;
        return vOf(a) - vOf(b);
      });
    }
    if (order === 'parallel') return [idx.slice()];
    if (order === 'lexico') return lexSort(idx).map(function (k) { return [k]; });
    if (order === 'wavefront') {
      var sorted = lexSort(idx);
      var groups = [], cur = [], curU = null, EPS = 1e-6;
      for (var n = 0; n < sorted.length; n++) {
        var u = uOf(sorted[n]);
        if (curU === null || Math.abs(u - curU) < EPS) { cur.push(sorted[n]); curU = u; }
        else { groups.push(cur); cur = [sorted[n]]; curU = u; }
      }
      if (cur.length) groups.push(cur);
      return groups;
    }
    if (order === 'by-tile') {
      var ti = play.ti || 2, tj = play.tj || 2;
      var i0 = dom.i[0], j0 = dom.j[0];
      var njt = Math.ceil((dom.j[1] - j0 + 1) / tj);
      function tileId(k) {
        var p = points[k];
        return Math.floor((p.i - i0) / ti) * njt + Math.floor((p.j - j0) / tj);
      }
      var byTile = idx.slice().sort(function (a, b) {
        var ta = tileId(a), tb = tileId(b);
        if (ta !== tb) return ta - tb;
        var pa = points[a], pb = points[b];
        if (pa.i !== pb.i) return pa.i - pb.i;
        return pa.j - pb.j;
      });
      if (play.group) {
        // each tile fires as a single tick (e.g. one SIMD vector op covers ti×tj points)
        var groups = [], cur = [], curT = null;
        for (var g = 0; g < byTile.length; g++) {
          var tid = tileId(byTile[g]);
          if (curT === null || tid === curT) { cur.push(byTile[g]); curT = tid; }
          else { groups.push(cur); cur = [byTile[g]]; curT = tid; }
        }
        if (cur.length) groups.push(cur);
        return groups;
      }
      return byTile.map(function (k) { return [k]; });
    }
    if (order === 'by-core') {
      var cores = play.cores || 4;
      var seqs = [];
      for (var c = 0; c < cores; c++) seqs.push([]);
      var spec = { mode: 'core', cores: cores, distribution: play.distribution || 'block',
        ti: play.ti, tj: play.tj, dim: play.dim };
      var ordered = lexSort(idx);
      for (var m = 0; m < ordered.length; m++) {
        var ck = groupKey(spec, points[ordered[m]], dom);
        ck = clamp(ck, 0, cores - 1);
        seqs[ck].push(ordered[m]);
      }
      var maxLen = 0;
      seqs.forEach(function (s) { if (s.length > maxLen) maxLen = s.length; });
      var ticks = [];
      for (var t = 0; t < maxLen; t++) {
        var slice = [];
        for (var cc = 0; cc < cores; cc++) if (seqs[cc][t] != null) slice.push(seqs[cc][t]);
        ticks.push(slice);
      }
      return ticks;
    }
    return lexSort(idx).map(function (k) { return [k]; });
  }

  // ============================================================= Scene class
  function Scene(container, data) {
    this.container = container;
    this.data = data;
    this.curIdx = 0;
    this.phase = 'rest';
    this.morphP = 1;
    this.playTick = 0;
    this.ticks = null;
    this.autoplay = false;
    this.running = false;
    this.raf = 0;
    this.lastTs = 0;
    this.phaseStart = 0;
    this.dispM = ID;        // currently displayed matrix
    this.prevM = ID;
    this.speedScale = 1;    // user speed multiplier
    this._frameBound = this._frame.bind(this);
    this._build();
    this._precompute();
    this.gotoStep(0, { animate: false, replay: false });
  }

  Scene.prototype._build = function () {
    var d = this.data;
    var c = this.container;
    c.innerHTML = '';
    c.className = (c.className ? c.className + ' ' : '') + 'pv-root';

    var stage = el('div', 'pv-stage');
    var canvasWrap = el('div', 'pv-canvas-wrap');
    this.canvas = el('canvas', 'pv-canvas');
    this.aux = el('canvas', 'pv-aux hidden');
    var matrix = el('div', 'pv-matrix');
    this.matrixBox = matrix;
    canvasWrap.appendChild(this.canvas);
    canvasWrap.appendChild(matrix);
    stage.appendChild(canvasWrap);
    stage.appendChild(this.aux);
    this.legend = el('div', 'pv-legend');
    stage.appendChild(this.legend);

    var side = el('div', 'pv-side');
    var card = el('div', 'pv-codecard');
    var head = el('div', 'head');
    this.codeDot = el('span', 'dot');
    this.codeDot.style.background = ACCENT;
    var hlabel = el('span', '');
    hlabel.textContent = 'MLIR';
    this.codeTag = el('span', 'tag before');
    this.codeTag.textContent = 'before';
    head.appendChild(this.codeDot); head.appendChild(hlabel); head.appendChild(this.codeTag);
    this.pre = el('pre', 'pv-code');
    card.appendChild(head); card.appendChild(this.pre);
    side.appendChild(card);

    var main = el('div', 'pv-main');
    main.appendChild(stage); main.appendChild(side);

    this.caption = el('div', 'pv-caption');

    var controls = el('div', 'pv-controls');
    this.btnPrev = btn('◀ 이전', '');
    this.btnPlay = btn('▶ 재생', 'primary');
    this.btnNext = btn('다음 ▶', '');
    this.btnReset = btn('↺ 처음', '');
    this.scrub = document.createElement('input');
    this.scrub.type = 'range'; this.scrub.className = 'scrub'; this.scrub.min = '0'; this.scrub.step = '1';
    this.stepCount = el('span', 'stepcount');
    var speedWrap = el('label', 'speed');
    var slabel = el('span', ''); slabel.textContent = '속도';
    this.speed = document.createElement('input');
    this.speed.type = 'range'; this.speed.min = '0.3'; this.speed.max = '2.5'; this.speed.step = '0.1'; this.speed.value = '1';
    speedWrap.appendChild(slabel); speedWrap.appendChild(this.speed);
    controls.appendChild(this.btnPrev); controls.appendChild(this.btnPlay);
    controls.appendChild(this.btnNext); controls.appendChild(this.btnReset);
    controls.appendChild(this.scrub); controls.appendChild(this.stepCount);
    controls.appendChild(speedWrap);

    this.rail = el('div', 'pv-steps');

    c.appendChild(main);
    c.appendChild(this.caption);
    c.appendChild(controls);
    c.appendChild(this.rail);

    // events
    var self = this;
    this.btnPrev.addEventListener('click', function () { self.pause(); self.gotoStep(self.curIdx - 1, { animate: true, replay: true }); });
    this.btnNext.addEventListener('click', function () { self.pause(); self.gotoStep(self.curIdx + 1, { animate: true, replay: true }); });
    this.btnReset.addEventListener('click', function () { self.pause(); self.gotoStep(0, { animate: true, replay: true }); });
    this.btnPlay.addEventListener('click', function () { self.togglePlay(); });
    this.scrub.addEventListener('input', function () { self.pause(); self.gotoStep(parseInt(self.scrub.value, 10) || 0, { animate: false, replay: false }); });
    this.speed.addEventListener('input', function () { self.speedScale = parseFloat(self.speed.value) || 1; });

    // build rail chips
    (d.steps || []).forEach(function (s, i) {
      var chip = el('div', 'pv-step-chip');
      chip.innerHTML = '<span class="n">' + (i + 1) + '</span>' + escapeHtml(s.title || ('스텝 ' + (i + 1)));
      chip.addEventListener('click', function () { self.pause(); self.gotoStep(i, { animate: true, replay: true }); });
      self.rail.appendChild(chip);
      s._chip = chip;
    });
    this.scrub.max = String(Math.max(0, (d.steps || []).length - 1));
  };

  Scene.prototype._precompute = function () {
    var d = this.data;
    var dom = d.domain || { i: [0, 6], j: [0, 6] };
    this.dom = dom;
    // build points (respect optional mask)
    var pts = [];
    var maskFn = dom.mask ? MASKS[dom.mask] : null;
    for (var i = dom.i[0]; i <= dom.i[1]; i++) {
      for (var j = dom.j[0]; j <= dom.j[1]; j++) {
        if (maskFn && !maskFn(i, j)) continue;
        pts.push({ i: i, j: j });
      }
    }
    this.points = pts;
    // resolve each step's matrix + ticks, and compute union plane bbox for stable framing
    var minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
    (d.steps || []).forEach(function (s) {
      s._M = s.transform || ID;
    });
    for (var s = 0; s < (d.steps || []).length; s++) {
      var M = d.steps[s]._M;
      for (var p = 0; p < pts.length; p++) {
        var t = applyMat(M, pts[p].i, pts[p].j);
        if (t[0] < minU) minU = t[0]; if (t[0] > maxU) maxU = t[0];
        if (t[1] < minV) minV = t[1]; if (t[1] > maxV) maxV = t[1];
      }
    }
    if (!isFinite(minU)) { minU = 0; maxU = 1; minV = 0; maxV = 1; }
    this.bbox = { minU: minU, maxU: maxU, minV: minV, maxV: maxV };
  };

  Scene.prototype._sizeCanvas = function () {
    var cw = this.canvas.clientWidth || this.canvas.parentNode && this.canvas.parentNode.clientWidth || 720;
    if (!cw || cw < 10) cw = 720;
    var W = cw, H = Math.round(Math.min(560, Math.max(380, cw * 0.74)));
    var dpr = global.devicePixelRatio || 1;
    this.canvas.width = Math.round(W * dpr); this.canvas.height = Math.round(H * dpr);
    this.canvas.style.height = H + 'px';
    this._W = W; this._H = H; this._dpr = dpr;
    // aux
    var hasAux = this.data.steps[this.curIdx] && this.data.steps[this.curIdx].aux;
    if (hasAux) {
      this.aux.classList.remove('hidden');
      var AH = 210;
      this.aux.width = Math.round(W * dpr); this.aux.height = Math.round(AH * dpr);
      this.aux.style.height = AH + 'px';
      this._AW = W; this._AH = AH;
    } else {
      this.aux.classList.add('hidden');
    }
  };

  // ---- screen mapping
  Scene.prototype._geom = function () {
    var W = this._W, H = this._H, bb = this.bbox;
    var mL = 48, mR = 22, mT = 26, mB = 40;
    var availW = W - mL - mR, availH = H - mT - mB;
    var spanV = (bb.maxV - bb.minV) + 1.4;
    var spanU = (bb.maxU - bb.minU) + 1.4;
    var cell = Math.min(availW / Math.max(spanV, 1), availH / Math.max(spanU, 1));
    var originX = mL + (availW - (bb.maxV - bb.minV) * cell) / 2 - bb.minV * cell;
    var originY = mT + (availH - (bb.maxU - bb.minU) * cell) / 2 - bb.minU * cell;
    return { cell: cell, ox: originX, oy: originY, mL: mL, mT: mT, mB: mB, mR: mR };
  };

  Scene.prototype.gotoStep = function (idx, opts) {
    opts = opts || {};
    var n = (this.data.steps || []).length;
    if (n === 0) return;
    idx = clamp(idx, 0, n - 1);
    this.prevM = this.dispM;
    this.curIdx = idx;
    var step = this.data.steps[idx];
    this.curM = step._M || ID;
    this._sizeCanvas();
    this.ticks = buildTicks(this.points, step.play, this.dom, step);
    this.playTick = 0;
    if (opts.animate) {
      this.phase = 'morph'; this.morphP = 0; this.phaseStart = this.lastTs;
    } else {
      this.phase = 'rest'; this.morphP = 1; this.prevM = this.curM;
      this.dispM = this.curM;
      this.playTick = this.ticks ? this.ticks.length : 0;
    }
    if (opts.replay && this.ticks) this.playTick = 0;
    this._updateDOM(step, idx);
    this._ensureLoop();
    if (!opts.animate && !this.running) this.draw(); // static paint
  };

  Scene.prototype._updateDOM = function (step, idx) {
    // code
    var which = step.code || 'before';
    var codeSrc = (this.data.code && this.data.code[which] != null) ? this.data.code[which] : (this.data.code && this.data.code.before) || '';
    if (this._lastCodeWhich !== which || this._lastCodeIdx == null) {
      this.pre.innerHTML = renderCode(codeSrc);
      this._lastCodeWhich = which;
    } else if (this._lastRenderedCode !== codeSrc) {
      this.pre.innerHTML = renderCode(codeSrc);
    }
    this._lastRenderedCode = codeSrc;
    this.codeTag.textContent = which;
    this.codeTag.className = 'tag ' + which;
    this.codeDot.style.background = (which === 'after') ? '#5ce6a3' : '#93a0bb';
    // line highlight
    var hi = normalizeHi(step.codeHi);
    var lns = this.pre.querySelectorAll ? this.pre.querySelectorAll('.ln') : [];
    for (var k = 0; k < lns.length; k++) {
      var ln = parseInt(lns[k].getAttribute('data-line'), 10);
      var on = hi.indexOf(ln) >= 0;
      lns[k].classList.toggle('hi', on);
      lns[k].classList.toggle('dimln', hi.length > 0 && !on);
    }
    // caption
    var name = step.title ? '<span class="stepname">' + escapeHtml(step.title) + '</span>' : '';
    this.caption.innerHTML = name + (step.caption || '');
    // matrix widget
    this._renderMatrix(step);
    // chips + scrubber + count
    var steps = this.data.steps;
    for (var s = 0; s < steps.length; s++) steps[s]._chip.classList.toggle('active', s === idx);
    this.scrub.value = String(idx);
    this.stepCount.textContent = (idx + 1) + ' / ' + steps.length;
    this.btnPrev.disabled = (idx === 0);
    this.btnNext.disabled = (idx === steps.length - 1);
    // legend
    this._renderLegend(step);
  };

  Scene.prototype._renderMatrix = function (step) {
    var M = step._M;
    var show = step.showMatrix !== false && M && !(M[0][0] === 1 && M[0][1] === 0 && M[1][0] === 0 && M[1][1] === 0) || step.showMatrix === true;
    if (!show) { this.matrixBox.style.opacity = '0'; return; }
    this.matrixBox.style.opacity = '1';
    var vars = (step.matrixVars) || ['i', 'j'];
    var lbl = step.matrixLabel || 'schedule θ';
    var html = '<span class="lbl">' + escapeHtml(lbl) + '</span>';
    html += '<table><tr><td class="bracket" rowspan="2">[</td><td>' + M[0][0] + '</td><td>' + M[0][1] + '</td><td class="bracket" rowspan="2">]</td></tr>';
    html += '<tr><td>' + M[1][0] + '</td><td>' + M[1][1] + '</td></tr></table>';
    var u = fmtRow(M[0][0], M[0][1], vars), v = fmtRow(M[1][0], M[1][1], vars);
    html += '<div style="margin-top:5px;font-size:11px;color:#93a0bb">(' + vars[0] + ',' + vars[1] + ') &rarr; (' + u + ', ' + v + ')</div>';
    this.matrixBox.innerHTML = html;
  };

  Scene.prototype._renderLegend = function (step) {
    var spec = step.color;
    var leg = step.legend;
    this.legend.innerHTML = '';
    var items = [];
    if (leg && leg.length) {
      items = leg;
    } else if (spec && spec.mode && spec.mode !== 'none') {
      // derive distinct keys
      var keys = {};
      for (var p = 0; p < this.points.length; p++) {
        var kk = groupKey(spec, this.points[p], this.dom);
        keys[Math.round(kk)] = true;
      }
      var ks = Object.keys(keys).map(Number).sort(function (a, b) { return a - b; });
      var labelFor = spec.mode === 'core' ? 'core ' : (spec.mode === 'lane' ? 'vec-op ' : (spec.mode === 'tile' ? 'tile ' : (spec.mode === 'wavefront' ? 't=' : 'g')));
      if (ks.length <= 10) {
        items = ks.map(function (k) { return { color: groupColor(k), label: labelFor + k }; });
      } else {
        items = [{ color: groupColor(ks[0]), label: labelFor + ks[0] }, { color: groupColor(ks[ks.length - 1]), label: '… ' + labelFor + ks[ks.length - 1] }];
      }
    }
    for (var n = 0; n < items.length; n++) {
      var it = el('span', 'item');
      it.innerHTML = '<span class="sw" style="background:' + (it2c(items[n].color)) + '"></span>' + escapeHtml(items[n].label);
      this.legend.appendChild(it);
    }
  };
  function it2c(c) { return c || '#888'; }

  // ------------------------------------------------------------ play control
  Scene.prototype.togglePlay = function () {
    if (this.autoplay) { this.pause(); return; }
    this.autoplay = true;
    this.btnPlay.innerHTML = '❚❚ 정지';
    this.btnPlay.classList.remove('primary');
    // if at last step and already rested, restart
    if (this.curIdx >= this.data.steps.length - 1 && this.phase === 'rest') {
      this.gotoStep(0, { animate: true, replay: true });
    } else {
      this.gotoStep(this.curIdx, { animate: true, replay: true });
    }
  };
  Scene.prototype.pause = function () {
    this.autoplay = false;
    if (this.btnPlay) { this.btnPlay.innerHTML = '▶ 재생'; this.btnPlay.classList.add('primary'); }
  };

  Scene.prototype._ensureLoop = function () {
    if (this.running) return;
    this.running = true;
    this.raf = global.requestAnimationFrame(this._frameBound);
  };

  Scene.prototype._frame = function (ts) {
    if (typeof ts !== 'number') ts = this.lastTs + 16;
    this.lastTs = ts;
    var step = this.data.steps[this.curIdx];
    var el = ts - this.phaseStart;
    var keepGoing = true;

    if (this.phase === 'morph') {
      var p = clamp(el / MORPH_MS, 0, 1);
      this.morphP = ease(p);
      this.dispM = lerpMat(this.prevM, this.curM, this.morphP);
      if (p >= 1) {
        this.dispM = this.curM;
        if (this.ticks) { this.phase = 'play'; this.playTick = 0; }
        else { this.phase = 'rest'; }
        this.phaseStart = ts;
      }
    } else if (this.phase === 'play') {
      this.dispM = this.curM; this.morphP = 1;
      if (!this.ticks) { this.phase = 'rest'; this.phaseStart = ts; this.draw(ts); if (keepGoing) this.raf = global.requestAnimationFrame(this._frameBound); else this.running = false; return; }
      var tickMs = ((step.play && step.play.speedMs) || DEFAULT_TICK_MS) / this.speedScale;
      var advanced = Math.floor(el / tickMs);
      this.playTick = Math.min(advanced, this.ticks.length);
      if (this.playTick >= this.ticks.length) { this.phase = 'rest'; this.phaseStart = ts; }
    } else { // rest
      this.dispM = this.curM; this.morphP = 1;
      if (this.ticks) this.playTick = this.ticks.length;
      if (this.autoplay && el > REST_MS / this.speedScale) {
        if (this.curIdx < this.data.steps.length - 1) {
          this.gotoStep(this.curIdx + 1, { animate: true, replay: true });
        } else {
          this.pause();
          keepGoing = false;
        }
      } else if (!this.autoplay) {
        keepGoing = false; // settle
      }
    }

    this.draw(ts);

    if (keepGoing) this.raf = global.requestAnimationFrame(this._frameBound);
    else { this.running = false; }
  };

  // ----------------------------------------------------------------- drawing
  Scene.prototype.draw = function (ts) {
    if (typeof ts !== 'number') ts = this.lastTs;
    var ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    var dpr = this._dpr || 1;
    ctx.setTransform ? ctx.setTransform(dpr, 0, 0, dpr, 0, 0) : null;
    var W = this._W, H = this._H;
    ctx.clearRect(0, 0, W, H);
    var g = this._geom();
    var step = this.data.steps[this.curIdx];
    var M = this.dispM;

    this._drawGridAndAxes(ctx, g, M, step);
    if (step.tiles) this._drawTiles(ctx, g, M, step.tiles);
    if (step.deps) this._drawDeps(ctx, g, M, step.deps);
    this._drawPoints(ctx, g, M, step, ts);

    if (step.aux) this._drawAux(step, ts);
  };

  Scene.prototype._sx = function (g, u, v) { return g.ox + v * g.cell; };
  Scene.prototype._sy = function (g, u, v) { return g.oy + u * g.cell; };

  Scene.prototype._drawGridAndAxes = function (ctx, g, M, step) {
    var dom = this.dom;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(120,140,180,0.10)';
    // image of i = const lines (rows) and j = const lines (cols)
    var i, j, a, b;
    for (i = dom.i[0]; i <= dom.i[1]; i++) {
      ctx.beginPath();
      a = applyMat(M, i, dom.j[0]); b = applyMat(M, i, dom.j[1]);
      ctx.moveTo(this._sx(g, a[0], a[1]), this._sy(g, a[0], a[1]));
      ctx.lineTo(this._sx(g, b[0], b[1]), this._sy(g, b[0], b[1]));
      ctx.stroke();
    }
    for (j = dom.j[0]; j <= dom.j[1]; j++) {
      ctx.beginPath();
      a = applyMat(M, dom.i[0], j); b = applyMat(M, dom.i[1], j);
      ctx.moveTo(this._sx(g, a[0], a[1]), this._sy(g, a[0], a[1]));
      ctx.lineTo(this._sx(g, b[0], b[1]), this._sy(g, b[0], b[1]));
      ctx.stroke();
    }
    // axis labels
    var labels = step.axisLabels || {};
    var vLabel = labels.v || (this.data.axes && this.data.axes.x) || 'j';
    var uLabel = labels.u || (this.data.axes && this.data.axes.y) || 'i';
    ctx.fillStyle = 'rgba(180,195,225,0.7)';
    ctx.font = '13px ui-monospace, monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(vLabel + ' →', W_right(this, g) - 30, this._H - 12);
    ctx.save();
    ctx.translate(12, this._geom().mT + 6);
    ctx.rotate(0);
    ctx.fillText('↓ ' + uLabel, 0, 0);
    ctx.restore();
  };
  function W_right(scene, g) { return scene._W - g.mR; }

  Scene.prototype._drawTiles = function (ctx, g, M, tiles) {
    var dom = this.dom;
    var ti = tiles.ti || 2, tj = tiles.tj || 2;
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(124,140,255,0.55)';
    var i, j, a, b;
    for (i = dom.i[0]; i <= dom.i[1] + 1; i += ti) {
      var ii = Math.min(i, dom.i[1] + 1);
      ctx.beginPath();
      a = applyMat(M, ii - 0.5, dom.j[0] - 0.5); b = applyMat(M, ii - 0.5, dom.j[1] + 0.5);
      ctx.moveTo(this._sx(g, a[0], a[1]), this._sy(g, a[0], a[1]));
      ctx.lineTo(this._sx(g, b[0], b[1]), this._sy(g, b[0], b[1]));
      ctx.stroke();
    }
    for (j = dom.j[0]; j <= dom.j[1] + 1; j += tj) {
      var jj = Math.min(j, dom.j[1] + 1);
      ctx.beginPath();
      a = applyMat(M, dom.i[0] - 0.5, jj - 0.5); b = applyMat(M, dom.i[1] + 0.5, jj - 0.5);
      ctx.moveTo(this._sx(g, a[0], a[1]), this._sy(g, a[0], a[1]));
      ctx.lineTo(this._sx(g, b[0], b[1]), this._sy(g, b[0], b[1]));
      ctx.stroke();
    }
  };

  Scene.prototype._drawDeps = function (ctx, g, M, deps) {
    var pts = this.points;
    // limit clutter
    var stride = pts.length > 90 ? 2 : 1;
    ctx.lineWidth = 1.8;
    for (var dd = 0; dd < deps.length; dd++) {
      var dep = deps[dd];
      var col = dep.color || '#ff7a8a';
      // loop-space dependence vector (di along i, dj along j); fall back to dy/dx
      var vi = (dep.di != null) ? dep.di : (dep.dy != null ? dep.dy : 0);
      var vj = (dep.dj != null) ? dep.dj : (dep.dx != null ? dep.dx : 0);
      ctx.strokeStyle = rgba(col, 0.72);
      ctx.fillStyle = rgba(col, 0.72);
      for (var p = 0; p < pts.length; p += stride) {
        var P = pts[p];
        var Qi = P.i + vi;
        var Qj = P.j + vj;
        if (!this._inDomain(Qi, Qj)) continue;
        var ap = applyMat(M, P.i, P.j), bp = applyMat(M, Qi, Qj);
        var x1 = this._sx(g, ap[0], ap[1]), y1 = this._sy(g, ap[0], ap[1]);
        var x2 = this._sx(g, bp[0], bp[1]), y2 = this._sy(g, bp[0], bp[1]);
        this._arrow(ctx, x1, y1, x2, y2, g.cell * 0.16);
      }
    }
    // legend-ish: draw representative labeled arrows is handled via step.legend
  };
  Scene.prototype._inDomain = function (i, j) {
    var d = this.dom;
    if (i < d.i[0] || i > d.i[1] || j < d.j[0] || j > d.j[1]) return false;
    if (d.mask && MASKS[d.mask] && !MASKS[d.mask](i, j)) return false;
    return true;
  };
  Scene.prototype._arrow = function (ctx, x1, y1, x2, y2, head) {
    var ang = Math.atan2(y2 - y1, x2 - x1);
    var len = Math.hypot(x2 - x1, y2 - y1);
    var sx = x1 + Math.cos(ang) * Math.min(11, len * 0.32);
    var ex = x2 - Math.cos(ang) * Math.min(11, len * 0.32);
    var sy = y1 + Math.sin(ang) * Math.min(11, len * 0.32);
    var ey = y2 - Math.sin(ang) * Math.min(11, len * 0.32);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    head = head || 5;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - head * Math.cos(ang - 0.4), ey - head * Math.sin(ang - 0.4));
    ctx.lineTo(ex - head * Math.cos(ang + 0.4), ey - head * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill();
  };

  Scene.prototype._drawPoints = function (ctx, g, M, step, ts) {
    var pts = this.points;
    // active set from ticks/playTick
    var activeSet = null, doneSet = null;
    if (this.ticks) {
      doneSet = {}; activeSet = {};
      var n;
      for (n = 0; n < this.playTick && n < this.ticks.length; n++) {
        var grp = this.ticks[n];
        for (var q = 0; q < grp.length; q++) doneSet[grp[q]] = true;
      }
      if (this.phase === 'play' && this.playTick < this.ticks.length) {
        var cur = this.ticks[this.playTick];
        for (var r = 0; r < cur.length; r++) { activeSet[cur[r]] = true; }
      }
    }
    var pulse = 0.5 + 0.5 * Math.sin((ts || 0) / 180);
    var spec = step.color;
    var baseR = clamp(g.cell * 0.16, 3, 11);

    for (var p = 0; p < pts.length; p++) {
      var P = pts[p];
      var t = applyMat(M, P.i, P.j);
      var x = this._sx(g, t[0], t[1]), y = this._sy(g, t[0], t[1]);
      var col, R = baseR, alpha = 1, glow = 0, ring = false;
      var revealed = !this.ticks || doneSet[p] || (activeSet && activeSet[p]);
      var isActive = activeSet && activeSet[p];

      if (spec && spec.mode && spec.mode !== 'none') {
        col = groupColor(groupKey(spec, P, this.dom));
      } else {
        col = revealed ? ACCENT : IDLE_COLOR;
      }
      if (this.ticks && !revealed) { col = IDLE_COLOR; alpha = 0.5; R = baseR * 0.7; }
      if (isActive) { R = baseR * (1.25 + 0.28 * pulse); glow = 16; ring = true; }
      else if (revealed) { glow = (spec && spec.mode && spec.mode !== 'none') ? 5 : 3; }

      ctx.globalAlpha = alpha;
      ctx.shadowBlur = glow; ctx.shadowColor = rgba(col, 0.9);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      if (ring) {
        ctx.globalAlpha = 0.9; ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x, y, R + 3, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.shadowBlur = 0;
  };

  // ---------------------------------------------------------------- aux panels
  Scene.prototype._auxProgress = function () {
    if (!this.ticks || !this.ticks.length) return 1;
    if (this.phase === 'rest') return 1;
    return clamp(this.playTick / this.ticks.length, 0, 1);
  };
  Scene.prototype._drawAux = function (step, ts) {
    var ctx = this.aux.getContext('2d');
    if (!ctx) return;
    var dpr = this._dpr || 1;
    ctx.setTransform ? ctx.setTransform(dpr, 0, 0, dpr, 0, 0) : null;
    var W = this._AW, H = this._AH;
    ctx.clearRect(0, 0, W, H);
    var a = step.aux, prog = this._auxProgress();
    if (a.type === 'speedup') auxSpeedup(ctx, W, H, a, prog);
    else if (a.type === 'vectorlanes') auxVectorLanes(ctx, W, H, a, prog);
    else if (a.type === 'gantt') auxGantt(ctx, W, H, a, prog);
    else if (a.type === 'pipeline') auxPipeline(ctx, W, H, a, prog);
    else if (a.type === 'memory') auxMemory(ctx, W, H, a, prog);
  };

  function auxTitle(ctx, W, txt) {
    ctx.fillStyle = '#93a0bb'; ctx.font = '12px ui-monospace, monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(txt, 6, 6);
  }
  function auxSpeedup(ctx, W, H, a, prog) {
    auxTitle(ctx, W, a.title || 'makespan  (sequential vs parallel)');
    var cores = a.cores || 4, work = a.work || 16;
    var t1 = a.t1 || work, tp = a.tp || Math.ceil(work / cores);
    var x0 = 60, maxW = W - x0 - 70, unit = maxW / Math.max(t1, 1);
    var y1 = 56, y2 = 110, bh = 30;
    ctx.font = '12px ui-monospace, monospace'; ctx.fillStyle = '#93a0bb';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(a.seqLabel || '1 core', x0 - 8, y1 + bh / 2);
    ctx.fillText(a.parLabel || (cores + ' cores'), x0 - 8, y2 + bh / 2);
    // seq bar
    ctx.fillStyle = 'rgba(147,160,187,0.35)';
    ctx.fillRect(x0, y1, t1 * unit, bh);
    ctx.strokeStyle = 'rgba(147,160,187,0.6)'; ctx.lineWidth = 1; ctx.strokeRect(x0, y1, t1 * unit, bh);
    // par bar (animated)
    var w = tp * unit * prog;
    var grd = ctx.createLinearGradient(x0, 0, x0 + tp * unit, 0);
    grd.addColorStop(0, '#58d1ff'); grd.addColorStop(1, '#5ce6a3');
    ctx.fillStyle = grd; ctx.fillRect(x0, y2, w, bh);
    // labels
    ctx.fillStyle = '#e7ecf6'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(t1 + ' steps', x0 + t1 * unit + 8, y1 + bh / 2);
    ctx.fillText(tp + ' steps', x0 + tp * unit + 8, y2 + bh / 2);
    ctx.fillStyle = '#ffb454'; ctx.font = 'bold 15px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('≈ ' + (t1 / tp).toFixed(1) + '× 빠름', W - 12, H - 18);
  }
  function auxVectorLanes(ctx, W, H, a, prog) {
    auxTitle(ctx, W, a.title || 'vector register');
    var vl = a.vl || 4, total = a.total || 16;
    var ops = Math.ceil(total / vl);
    var bx = 60, by = 50, cw = Math.min(64, (W - bx - 120) / vl), ch = 46, gap = 6;
    var filledOps = Math.round(ops * prog);
    var lanesFilled = Math.min(vl, Math.max(0, total - (filledOps - 1) * vl));
    if (filledOps <= 0) lanesFilled = 0;
    for (var k = 0; k < vl; k++) {
      var x = bx + k * (cw + gap);
      ctx.fillStyle = (k < lanesFilled && filledOps > 0) ? PALETTE[k % PALETTE.length] : 'rgba(120,140,180,0.13)';
      ctx.fillRect(x, by, cw, ch);
      ctx.strokeStyle = 'rgba(147,160,187,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(x, by, cw, ch);
      ctx.fillStyle = '#0e131f'; ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (k < lanesFilled && filledOps > 0) ctx.fillText('lane ' + k, x + cw / 2, by + ch / 2);
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.font = '12.5px ui-monospace, monospace';
    ctx.fillStyle = '#93a0bb';
    ctx.fillText('스칼라 op: ' + total, bx, by + ch + 18);
    ctx.fillStyle = '#5ce6a3';
    ctx.fillText('벡터 op: ' + ops + '   (' + vl + '-wide)', bx, by + ch + 38);
    ctx.fillStyle = '#ffb454'; ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(Math.min(filledOps, ops) + ' / ' + ops + ' vector ops', W - 12, by + ch + 30);
  }
  function auxGantt(ctx, W, H, a, prog) {
    auxTitle(ctx, W, a.title || 'execution timeline  (core × time)');
    var rows = a.rows || [];
    var maxTime = a.maxTime || 1;
    rows.forEach(function (r) { (r.segments || []).forEach(function (s) { maxTime = Math.max(maxTime, s.start + s.len); }); });
    var x0 = 70, y0 = 34, rowH = Math.min(28, (H - y0 - 24) / Math.max(rows.length, 1)), gap = 4;
    var unit = (W - x0 - 24) / Math.max(maxTime, 1);
    var nowT = maxTime * prog;
    ctx.font = '11.5px ui-monospace, monospace';
    for (var r = 0; r < rows.length; r++) {
      var y = y0 + r * (rowH + gap);
      ctx.fillStyle = '#93a0bb'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(rows[r].label || ('core ' + r), x0 - 8, y + rowH / 2);
      ctx.fillStyle = 'rgba(120,140,180,0.08)'; ctx.fillRect(x0, y, maxTime * unit, rowH);
      var segs = rows[r].segments || [];
      for (var s = 0; s < segs.length; s++) {
        var seg = segs[s];
        var vis = clamp(nowT - seg.start, 0, seg.len);
        if (vis <= 0) continue;
        ctx.fillStyle = seg.color || PALETTE[r % PALETTE.length];
        ctx.fillRect(x0 + seg.start * unit + 1, y + 2, vis * unit - 2, rowH - 4);
        if (seg.label && seg.len * unit > 22) {
          ctx.fillStyle = '#0e131f'; ctx.textAlign = 'center';
          ctx.fillText(seg.label, x0 + (seg.start + seg.len / 2) * unit, y + rowH / 2);
        }
      }
    }
    // makespan marker
    if (a.makespan) {
      var mx = x0 + a.makespan * unit;
      ctx.strokeStyle = '#ffb454'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(mx, y0 - 4); ctx.lineTo(mx, H - 18); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#ffb454'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('makespan ' + a.makespan, mx + 4, H - 6);
    }
  }
  function auxPipeline(ctx, W, H, a, prog) {
    var stages = a.stages || ['Ld', '×', '+', 'St'];
    var iters = a.iters || 6, ii = a.ii || 1;
    var S = stages.length;
    var totalCycles = (iters - 1) * ii + S;
    auxTitle(ctx, W, (a.title || 'software pipeline') + '   II=' + ii + ', stages=' + S);
    var x0 = 64, y0 = 30, rowH = Math.min(24, (H - y0 - 26) / Math.max(iters, 1)), gap = 3;
    var unit = (W - x0 - 20) / Math.max(totalCycles, 1);
    var nowC = totalCycles * prog;
    ctx.font = '11px ui-monospace, monospace';
    for (var n = 0; n < iters; n++) {
      var y = y0 + n * (rowH + gap);
      ctx.fillStyle = '#93a0bb'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('iter ' + n, x0 - 8, y + rowH / 2);
      for (var s = 0; s < S; s++) {
        var cyc = n * ii + s;
        if (cyc + 1 > nowC + 0.001) continue;
        ctx.fillStyle = PALETTE[s % PALETTE.length];
        ctx.fillRect(x0 + cyc * unit + 1, y + 1, unit - 2, rowH - 2);
        if (unit > 20) {
          ctx.fillStyle = '#0e131f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.font = '10px ui-monospace, monospace';
          ctx.fillText(stages[s], x0 + cyc * unit + unit / 2, y + rowH / 2);
          ctx.font = '11px ui-monospace, monospace';
        }
      }
    }
    // steady-state region (where all stages overlap): cycles [S-1 .. (iters-1)*ii]
    if (ii < S && iters >= S) {
      var a0 = (S - 1), a1 = (iters - 1) * ii;
      var rx = x0 + a0 * unit, rw = (a1 - a0) * unit;
      ctx.strokeStyle = 'rgba(255,180,84,0.6)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.2;
      ctx.strokeRect(rx, y0 - 2, rw, iters * (rowH + gap) - gap + 4); ctx.setLineDash([]);
      ctx.fillStyle = '#ffb454'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.font = '10.5px ui-monospace, monospace';
      ctx.fillText('steady state (all stages busy)', rx + rw / 2, y0 - 4);
    }
  }
  function auxMemory(ctx, W, H, a, prog) {
    var rows = a.rows || 8, cols = a.cols || 8;
    var pr = (a.page && a.page.r) || rows, pc = (a.page && a.page.c) || 4;
    var orderMode = a.order || 'rowmajor'; // rowmajor | colmajor | tiled
    var ti = a.ti || 4, tj = a.tj || 4;
    auxTitle(ctx, W, a.title || ('array A[' + rows + '][' + cols + '] — page = ' + pr + '×' + pc));
    // access sequence
    var seq = [];
    var i, j;
    if (orderMode === 'rowmajor') { for (i = 0; i < rows; i++) for (j = 0; j < cols; j++) seq.push([i, j]); }
    else if (orderMode === 'colmajor') { for (j = 0; j < cols; j++) for (i = 0; i < rows; i++) seq.push([i, j]); }
    else { // tiled
      for (var bi = 0; bi < rows; bi += ti) for (var bj = 0; bj < cols; bj += tj)
        for (i = bi; i < Math.min(bi + ti, rows); i++) for (j = bj; j < Math.min(bj + tj, cols); j++) seq.push([i, j]);
    }
    var upto = Math.round(seq.length * prog);
    // page id helper (page grid laid row-major over pages)
    var pcols = Math.ceil(cols / pc);
    function pageId(i, j) { return Math.floor(i / pr) * pcols + Math.floor(j / pc); }
    // cold misses (distinct pages) + page switches (consecutive accesses in different
    // pages ≈ TLB misses under a tiny TLB). Switches separate row/col/tiled order.
    var faults = 0, switches = 0, lastPage = -999, prevPage = -999, touched = {};
    for (var k = 0; k < upto; k++) {
      var pid = pageId(seq[k][0], seq[k][1]);
      if (!touched[pid]) { touched[pid] = true; faults++; }
      if (prevPage !== -999 && pid !== prevPage) switches++;
      prevPage = pid; lastPage = pid;
    }
    // grid layout
    var gx = 16, gy = 30, avail = Math.min(W * 0.5, H - gy - 30);
    var cell = Math.min((avail) / rows, (W * 0.46) / cols, 22);
    var lit = {}; for (var m = 0; m < upto; m++) lit[seq[m][0] + ',' + seq[m][1]] = m;
    for (i = 0; i < rows; i++) for (j = 0; j < cols; j++) {
      var x = gx + j * cell, y = gy + i * cell;
      var key = i + ',' + j;
      var on = lit[key] != null;
      var isCur = on && lit[key] >= upto - 1;
      ctx.fillStyle = on ? (pageId(i, j) === lastPage ? '#5ce6a3' : 'rgba(88,209,255,0.55)') : 'rgba(120,140,180,0.10)';
      ctx.fillRect(x, y, cell - 1.5, cell - 1.5);
      if (isCur) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, cell - 1.5, cell - 1.5); }
    }
    // page boundaries
    ctx.strokeStyle = 'rgba(255,180,84,0.7)'; ctx.lineWidth = 1.4;
    for (i = 0; i <= rows; i += pr) { ctx.beginPath(); ctx.moveTo(gx, gy + i * cell); ctx.lineTo(gx + cols * cell, gy + i * cell); ctx.stroke(); }
    for (j = 0; j <= cols; j += pc) { ctx.beginPath(); ctx.moveTo(gx + j * cell, gy); ctx.lineTo(gx + j * cell, gy + rows * cell); ctx.stroke(); }
    // stats
    var tx = gx + cols * cell + 28;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = '12.5px ui-monospace, monospace';
    ctx.fillStyle = '#93a0bb'; ctx.fillText('접근: ' + upto + ' / ' + seq.length, tx, gy + 4);
    ctx.fillStyle = '#93a0bb'; ctx.fillText('방문 페이지(cold): ' + faults, tx, gy + 24);
    ctx.fillStyle = '#ff7a8a'; ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillText('페이지 전환 ≈ TLB miss: ' + switches, tx, gy + 46);
    ctx.font = '12px ui-monospace, monospace';
    ctx.fillStyle = '#5ce6a3'; ctx.fillText('■ 현재 페이지', tx, gy + 72);
    ctx.fillStyle = 'rgba(88,209,255,0.55)'; ctx.fillText('■ 이전 접근', tx, gy + 90);
    if (a.note) { ctx.fillStyle = '#ffb454'; ctx.font = '11.5px ui-monospace, monospace';
      wrapText(ctx, a.note, tx, gy + 116, W - tx - 10, 15); }
  }
  function wrapText(ctx, text, x, y, maxW, lh) {
    var words = String(text).split(' '), line = '', yy = y;
    for (var n = 0; n < words.length; n++) {
      var test = line + words[n] + ' ';
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = words[n] + ' '; yy += lh; }
      else line = test;
    }
    ctx.fillText(line, x, yy);
  }

  // ------------------------------------------------------------------ helpers
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function btn(label, cls) { var b = el('button', 'pv-btn ' + (cls || '')); b.innerHTML = label; b.type = 'button'; return b; }
  function normalizeHi(hi) {
    if (!hi) return [];
    var out = [];
    for (var k = 0; k < hi.length; k++) {
      var h = hi[k];
      if (Array.isArray(h)) { for (var n = h[0]; n <= h[1]; n++) out.push(n); }
      else out.push(h);
    }
    return out;
  }

  // ----------------------------------------------------------- scene validation
  function validateScene(scene) {
    var errors = [], warnings = [];
    function err(m) { errors.push(m); }
    function warn(m) { warnings.push(m); }
    if (!scene || typeof scene !== 'object') { return { ok: false, errors: ['scene is not an object'], warnings: [] }; }
    if (!scene.title) warn('missing title');
    var dom = scene.domain;
    if (!dom || !Array.isArray(dom.i) || !Array.isArray(dom.j)) err('domain.i and domain.j must be [lo,hi] arrays');
    else {
      if (dom.i[0] > dom.i[1]) err('domain.i lo > hi');
      if (dom.j[0] > dom.j[1]) err('domain.j lo > hi');
      if (dom.mask && !MASKS[dom.mask]) err('unknown domain.mask: ' + dom.mask);
    }
    if (scene.code) {
      if (scene.code.before == null && scene.code.after == null) warn('code present but neither before nor after set');
    }
    var steps = scene.steps;
    if (!Array.isArray(steps) || steps.length === 0) { err('steps must be a non-empty array'); return { ok: errors.length === 0, errors: errors, warnings: warnings }; }
    var ORDERS = { lexico: 1, wavefront: 1, parallel: 1, 'by-tile': 1, 'by-core': 1 };
    var MODES = { none: 1, wavefront: 1, expr: 1, tile: 1, lane: 1, core: 1 };
    var AUX = { speedup: 1, vectorlanes: 1, gantt: 1, pipeline: 1, memory: 1 };
    steps.forEach(function (s, i) {
      var tag = 'step[' + i + ']';
      if (!s || typeof s !== 'object') { err(tag + ' not an object'); return; }
      if (s.transform) {
        var M = s.transform;
        if (!Array.isArray(M) || M.length !== 2 || !Array.isArray(M[0]) || M[0].length !== 2 || M[1].length !== 2)
          err(tag + '.transform must be a 2x2 array');
        else if (![M[0][0], M[0][1], M[1][0], M[1][1]].every(isFiniteNum)) err(tag + '.transform has non-numeric entries');
        else { var det = M[0][0] * M[1][1] - M[0][1] * M[1][0]; if (det === 0) warn(tag + '.transform is singular (det=0) — lattice will collapse'); }
      }
      if (s.code && s.code !== 'before' && s.code !== 'after') err(tag + ".code must be 'before' or 'after'");
      if (s.color) {
        if (!MODES[s.color.mode]) err(tag + '.color.mode unknown: ' + s.color.mode);
        if (s.color.mode === 'lane' && !s.color.vl) warn(tag + '.color lane without vl (defaults 4)');
      }
      if (s.play) {
        if (!ORDERS[s.play.order]) err(tag + '.play.order unknown: ' + s.play.order);
      }
      if (s.deps) {
        if (!Array.isArray(s.deps)) err(tag + '.deps must be an array');
        else s.deps.forEach(function (dp, k) {
          var hasV = isFiniteNum(dp.di) || isFiniteNum(dp.dj) || isFiniteNum(dp.dx) || isFiniteNum(dp.dy);
          if (!hasV) err(tag + '.deps[' + k + '] needs di/dj (loop-space dependence vector)');
        });
      }
      if (s.tiles && (!isFiniteNum(s.tiles.ti) || !isFiniteNum(s.tiles.tj))) warn(tag + '.tiles should have numeric ti,tj');
      if (s.aux) {
        if (!AUX[s.aux.type]) err(tag + '.aux.type unknown: ' + s.aux.type);
        if (s.aux.type === 'gantt' && !Array.isArray(s.aux.rows)) err(tag + '.aux gantt needs rows[]');
      }
      if (s.codeHi && !Array.isArray(s.codeHi)) err(tag + '.codeHi must be an array');
    });
    return { ok: errors.length === 0, errors: errors, warnings: warnings };
  }

  // ------------------------------------------------------------------- mount
  var PolyViz = {
    version: '1.0',
    PALETTE: PALETTE,
    validateScene: validateScene,
    _Scene: Scene,
    mount: function (selector, sceneData) {
      var container = (typeof selector === 'string') ? document.querySelector(selector) : selector;
      if (!container) throw new Error('PolyViz.mount: container not found: ' + selector);
      var v = validateScene(sceneData);
      if (!v.ok) {
        if (global.console && console.error) console.error('PolyViz scene invalid:', v.errors);
      }
      if (v.warnings.length && global.console && console.warn) console.warn('PolyViz scene warnings:', v.warnings);
      var scene = new Scene(container, sceneData);
      // re-layout on resize
      if (global.addEventListener) {
        global.addEventListener('resize', function () {
          scene._sizeCanvas(); scene.draw();
        });
      }
      return scene;
    }
  };

  global.PolyViz = PolyViz;
  if (typeof module !== 'undefined' && module.exports) module.exports = PolyViz;

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
