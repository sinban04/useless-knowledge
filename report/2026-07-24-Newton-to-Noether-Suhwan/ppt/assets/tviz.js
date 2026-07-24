/* tviz.js — Transformer 인터랙티브 애니메이션 엔진 (self-contained, no deps).
   계약: window.TVIZ.mount(box, scene) + window.TVIZ_SCENES[id] = scene.
   scene = { id, title, subtitle, intro, steps:[ { title, caption, paint(g,k) } ] }
   - g: 그리기 헬퍼 묶음 (g.ctx, g.W, g.H, 팔레트, token/bars/heat/arrow/text 등)
   - k: 0..1 스텝 진행도(애니메이션). 엔진이 스텝 진입 시 0→1로 보간하며 paint를 호출한다.
   markup 은 viz.css 의 pv-* 클래스를 재사용(다크 테마). */
(function (global) {
  'use strict';
  var LW = 960, LH = 440; // 캔버스 논리 좌표계

  var PAL = {
    bg: '#0e131f', panel: '#161d2e', panel2: '#1b2335',
    ink: '#e7ecf6', dim: '#93a0bb', faint: '#5d6884',
    line: '#2a3450', grid: '#222b42',
    accent: '#58d1ff', accent2: '#ffb454', accent3: '#7c8cff',
    good: '#5ce6a3', warn: '#ff7a8a'
  };

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // ---- drawing helper bundle passed to scene paint() ----
  function Helper(ctx) {
    this.ctx = ctx; this.W = LW; this.H = LH; this.col = PAL;
  }
  var H = Helper.prototype;
  H.lerp = function (a, b, t) { return a + (b - a) * t; };
  H.ease = easeInOut;
  H.clear = function (bg) {
    var c = this.ctx; c.save(); c.fillStyle = bg || PAL.bg; c.fillRect(0, 0, this.W, this.H); c.restore();
  };
  H.rrect = function (x, y, w, h, r, fill, stroke, lw) {
    var c = this.ctx; r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); }
  };
  H.text = function (str, x, y, o) {
    o = o || {}; var c = this.ctx;
    var size = o.size || 15, weight = o.weight || 400;
    var fam = o.mono ? 'ui-monospace,"SF Mono",Menlo,monospace' : 'system-ui,-apple-system,"Noto Sans KR",sans-serif';
    c.save();
    c.font = weight + ' ' + size + 'px ' + fam;
    c.fillStyle = o.col || PAL.ink;
    c.textAlign = o.align || 'left';
    c.textBaseline = o.baseline || 'alphabetic';
    if (o.alpha != null) c.globalAlpha = o.alpha;
    c.fillText(str, x, y);
    c.restore();
  };
  H.line = function (x1, y1, x2, y2, col, lw, dash) {
    var c = this.ctx; c.save(); c.strokeStyle = col || PAL.line; c.lineWidth = lw || 1.5;
    if (dash) c.setLineDash(dash);
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.restore();
  };
  H.arrow = function (x1, y1, x2, y2, col, lw, head) {
    var c = this.ctx; head = head == null ? 8 : head;
    c.save(); c.strokeStyle = col || PAL.dim; c.fillStyle = col || PAL.dim; c.lineWidth = lw || 2;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    var a = Math.atan2(y2 - y1, x2 - x1);
    c.beginPath(); c.moveTo(x2, y2);
    c.lineTo(x2 - head * Math.cos(a - 0.4), y2 - head * Math.sin(a - 0.4));
    c.lineTo(x2 - head * Math.cos(a + 0.4), y2 - head * Math.sin(a + 0.4));
    c.closePath(); c.fill(); c.restore();
  };
  // 토큰 박스 (라벨 가운데)
  H.token = function (x, y, w, h, label, o) {
    o = o || {};
    this.rrect(x, y, w, h, o.r || 8, o.fill || PAL.panel2, o.stroke || PAL.line, o.lw || 1.5);
    if (label != null) this.text(label, x + w / 2, y + h / 2 + (o.size || 14) * 0.34,
      { size: o.size || 14, col: o.tcol || PAL.ink, align: 'center', weight: o.weight || 600, mono: o.mono });
  };
  // 세로 막대그래프(확률/점수). vals: number[]; max for scale
  H.bars = function (x, y, w, h, vals, o) {
    o = o || {}; var n = vals.length, gap = o.gap == null ? 6 : o.gap;
    var bw = (w - gap * (n - 1)) / n;
    var mx = o.max != null ? o.max : Math.max.apply(null, vals.concat([1e-6]));
    for (var i = 0; i < n; i++) {
      var bh = h * clamp(vals[i] / mx, 0, 1);
      var col = (o.hi != null && o.hi === i) ? PAL.accent2 : (o.col || PAL.accent);
      this.rrect(x + i * (bw + gap), y + h - bh, bw, bh, 3, col, null);
      if (o.labels) this.text(o.labels[i], x + i * (bw + gap) + bw / 2, y + h + 16,
        { size: 12, col: PAL.dim, align: 'center', mono: true });
      if (o.vals) this.text(vals[i].toFixed(2), x + i * (bw + gap) + bw / 2, y + h - bh - 5,
        { size: 11, col: PAL.dim, align: 'center', mono: true });
    }
  };
  // 히트맵 격자. m: number[][] in [0,1]; (r,c) cell
  H.heat = function (x, y, cw, ch, m, o) {
    o = o || ''; var rows = m.length, cols = m[0].length;
    for (var r = 0; r < rows; r++) for (var cc = 0; cc < cols; cc++) {
      var v = clamp(m[r][cc], 0, 1);
      // 0=dark panel → 1=accent
      var c = this.mix(PAL.panel2, o.color || PAL.accent, v * (o.gain || 1));
      this.ctx.fillStyle = c;
      this.ctx.fillRect(x + cc * cw, y + r * ch, cw - 1.5, ch - 1.5);
    }
  };
  // color mix
  H.mix = function (a, b, t) {
    function h2(s) { return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]; }
    var A = h2(a), B = h2(b);
    var R = Math.round(A[0] + (B[0] - A[0]) * t), G = Math.round(A[1] + (B[1] - A[1]) * t), Bl = Math.round(A[2] + (B[2] - A[2]) * t);
    return 'rgb(' + R + ',' + G + ',' + Bl + ')';
  };
  H.vec = function (x, y, w, h, vals, o) { // 작은 세로 벡터(색칠된 셀들)
    o = o || {}; var n = vals.length, ch = h / n;
    for (var i = 0; i < n; i++) {
      var v = vals[i];
      this.ctx.fillStyle = this.mix(PAL.warn, PAL.accent, (v + 1) / 2); // -1..1
      this.ctx.fillRect(x, y + i * ch, w, ch - 1);
    }
    this.rrect(x, y, w, h, 4, null, o.stroke || PAL.line, 1.2);
  };
  H.softmax = function (arr, temp) {
    temp = temp || 1; var m = Math.max.apply(null, arr);
    var ex = arr.map(function (v) { return Math.exp((v - m) / temp); });
    var s = ex.reduce(function (a, b) { return a + b; }, 0);
    return ex.map(function (v) { return v / s; });
  };

  // ---- player ----
  var SPD_MIN = 0.1, SPD_MAX = 5; // 재생 속도 배율 범위 (0.1×~5×, 로그 슬라이더)
  function loadSpd() {
    try { var v = parseFloat(localStorage.getItem('tvizSpeed')); if (v >= SPD_MIN && v <= SPD_MAX) return v; } catch (e) {}
    return 1;
  }
  function Player(box, scene) {
    this.box = box; this.scene = scene; this.steps = scene.steps || [];
    this.idx = 0; this.playing = false; this.raf = 0; this.t0 = 0; this.dur = 900;
    this.spd = loadSpd();
    this.build();
    var self = this;
    // 마운트 시 1스텝만 가볍게 재생(즉시 생동감), 이후 정지
    this.goto(0, true, function () { self.playing = false; });
  }
  var P = Player.prototype;
  P.build = function () {
    var s = this.scene, box = this.box;
    box.classList.add('vizbox');
    box.innerHTML = '';
    var root = el('div', 'pv-root');
    var hdr = el('div', 'pv-header');
    hdr.innerHTML = '<h1>' + (s.title || '') + '</h1>' + (s.subtitle ? '<div class="sub">' + s.subtitle + '</div>' : '');
    root.appendChild(hdr);
    if (s.intro) { var intro = el('div', 'pv-intro'); intro.innerHTML = s.intro; root.appendChild(intro); }

    var stage = el('div', 'pv-stage');
    var wrap = el('div', 'pv-canvas-wrap');
    this.canvas = el('canvas', 'pv-canvas');
    this.canvas.width = LW; this.canvas.height = LH;
    wrap.appendChild(this.canvas); stage.appendChild(wrap); root.appendChild(stage);

    this.caption = el('div', 'pv-caption'); root.appendChild(this.caption);

    var ctr = el('div', 'pv-controls');
    this.bPrev = btn('◀'); this.bPlay = btn('▶ 재생', 'primary'); this.bNext = btn('▶▶'); this.bReset = btn('↺');
    this.scrub = document.createElement('input');
    this.scrub.type = 'range'; this.scrub.className = 'scrub'; this.scrub.min = 0; this.scrub.max = Math.max(0, this.steps.length - 1); this.scrub.step = 1; this.scrub.value = 0;
    this.count = el('span', 'stepcount');
    // 재생 속도 (0.1×~5×, 로그 스케일 · localStorage 공유 · 더블클릭 = 1×)
    var spdWrap = el('span', 'speed');
    spdWrap.title = '재생 속도 (더블클릭 = 1×)';
    var spdLbl = document.createElement('span'); spdLbl.textContent = '⏱';
    this.spdInput = document.createElement('input');
    this.spdInput.type = 'range';
    this.spdInput.min = String(Math.log10(SPD_MIN)); this.spdInput.max = String(Math.log10(SPD_MAX));
    this.spdInput.step = '0.01'; this.spdInput.value = String(Math.log10(this.spd));
    this.spdVal = document.createElement('b');
    this.spdVal.style.minWidth = '36px'; this.spdVal.style.textAlign = 'right';
    spdWrap.appendChild(spdLbl); spdWrap.appendChild(this.spdInput); spdWrap.appendChild(this.spdVal);
    ctr.appendChild(this.bPrev); ctr.appendChild(this.bPlay); ctr.appendChild(this.bNext); ctr.appendChild(this.bReset);
    ctr.appendChild(this.scrub); ctr.appendChild(spdWrap); ctr.appendChild(this.count);
    root.appendChild(ctr);

    this.rail = el('div', 'pv-steps');
    var self = this;
    this.steps.forEach(function (st, i) {
      var chip = el('div', 'pv-step-chip');
      chip.innerHTML = '<span class="n">' + (i + 1) + '</span>' + (st.title || ('스텝 ' + (i + 1)));
      chip.addEventListener('click', function () { self.stop(); self.goto(i, true); });
      self.rail.appendChild(chip);
    });
    root.appendChild(this.rail);
    box.appendChild(root);

    this.ctx = this.canvas.getContext('2d');
    this.g = new Helper(this.ctx);

    this.bPrev.onclick = function () { self.stop(); self.goto(Math.max(0, self.idx - 1), true); };
    this.bNext.onclick = function () { self.stop(); self.goto(Math.min(self.steps.length - 1, self.idx + 1), true); };
    this.bReset.onclick = function () { self.stop(); self.goto(0, true); };
    this.bPlay.onclick = function () { self.toggle(); };
    this.scrub.oninput = function () { self.stop(); self.goto(parseInt(self.scrub.value, 10) || 0, false); };
    this.spdInput.oninput = function () { self.setSpeed(Math.pow(10, parseFloat(self.spdInput.value))); };
    this.spdInput.ondblclick = function () { self.setSpeed(1); self.spdInput.value = '0'; };
    this.syncSpeedUI();
    box.addEventListener('click', function (e) { e.stopPropagation(); }); // 컨트롤 클릭이 슬라이드 넘김 안 되게
  };
  P.renderFrame = function (k) {
    var st = this.steps[this.idx]; if (!st) return;
    try { st.paint(this.g, k); } catch (e) { /* swallow per-frame */ }
  };
  P.setSpeed = function (v) {
    this.spd = clamp(v, SPD_MIN, SPD_MAX);
    try { localStorage.setItem('tvizSpeed', String(this.spd)); } catch (e) {}
    this.syncSpeedUI();
  };
  P.syncSpeedUI = function () {
    if (this.spdVal) this.spdVal.textContent = (Math.round(this.spd * 10) / 10).toFixed(1) + '×';
  };
  P.setMeta = function () {
    var st = this.steps[this.idx] || {};
    this.caption.innerHTML = '<span class="stepname">' + (st.title || '') + '</span>' + (st.caption || '');
    this.count.textContent = (this.idx + 1) + ' / ' + this.steps.length;
    this.scrub.value = this.idx;
    var chips = this.rail.querySelectorAll('.pv-step-chip');
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle('active', i === this.idx);
  };
  P.goto = function (i, animate, done) {
    this.idx = clamp(i, 0, this.steps.length - 1);
    this.setMeta();
    var self = this;
    cancelAnimationFrame(this.raf);
    if (!animate) { this.renderFrame(1); if (done) done(); return; }
    this.t0 = 0;
    var lastSpd = this.spd;
    function frame(ts) {
      if (!self.t0) self.t0 = ts;
      var dur = self.dur / self.spd;
      if (self.spd !== lastSpd) {
        // 트윈 중 속도 변경: 진행도 k를 보존한 채 시간축만 재기준
        var kPrev = clamp((ts - self.t0) / (self.dur / lastSpd), 0, 1);
        self.t0 = ts - kPrev * dur;
        lastSpd = self.spd;
      }
      var k = clamp((ts - self.t0) / dur, 0, 1);
      self.renderFrame(self.g.ease(k));
      if (k < 1) { self.raf = requestAnimationFrame(frame); }
      else if (done) done();
      else if (self.playing) {
        // auto-advance after a beat (속도 반영)
        self.raf = requestAnimationFrame(function () {
          setTimeout(function () {
            if (!self.playing) return;
            if (self.idx < self.steps.length - 1) self.goto(self.idx + 1, true);
            else { self.playing = false; self.bPlay.innerHTML = '▶ 재생'; }
          }, Math.max(80, Math.round(520 / self.spd)));
        });
      }
    }
    this.raf = requestAnimationFrame(frame);
  };
  P.toggle = function () {
    if (this.playing) { this.stop(); return; }
    this.playing = true; this.bPlay.innerHTML = '⏸ 정지';
    if (this.idx >= this.steps.length - 1) this.goto(0, true);
    else this.goto(this.idx, true);
  };
  P.stop = function () { this.playing = false; if (this.bPlay) this.bPlay.innerHTML = '▶ 재생'; cancelAnimationFrame(this.raf); };

  function btn(label, cls) { var b = el('button', 'pv-btn' + (cls ? ' ' + cls : '')); b.innerHTML = label; b.type = 'button'; return b; }

  global.TVIZ = {
    mount: function (box, scene) { return new Player(box, scene); },
    PAL: PAL, Helper: Helper
  };
})(window);
