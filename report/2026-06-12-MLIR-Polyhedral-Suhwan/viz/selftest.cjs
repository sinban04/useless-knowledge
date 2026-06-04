/* selftest.cjs — headless verification of poly.js + every scene config.
 *
 * Provides a minimal DOM/canvas stub, loads the engine, then for each scene:
 *   - runs PolyViz.validateScene (schema)
 *   - mounts it
 *   - drives the animation state machine through EVERY step (morph→play→rest)
 *     while calling draw() — catching any runtime error in rendering / aux panels.
 *
 * Usage:
 *   node selftest.cjs                 # synthetic aux scenes + all topics/*.config.js
 *   node selftest.cjs path/to/x.config.js [...]   # only the given config(s) + synthetics
 *
 * Exit code 0 = all good; 1 = at least one error.
 */
'use strict';
const fs = require('fs');
const path = require('path');

/* ----------------------------- DOM / canvas stub ----------------------------- */
function makeCtx() {
  const store = {};
  return new Proxy(store, {
    get(t, p) {
      if (p === 'measureText') return (s) => ({ width: String(s).length * 7 });
      if (p === 'createLinearGradient') return () => ({ addColorStop() {} });
      if (p === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (p in t) return t[p];
      return () => {};               // any drawing method → no-op
    },
    set(t, p, v) { t[p] = v; return true; }
  });
}
function styleProxy() {
  return new Proxy({}, { get: (t, p) => (p in t ? t[p] : ''), set: (t, p, v) => { t[p] = v; return true; } });
}
function makeEl(tag) {
  const listeners = {};
  const children = [];
  const e = {
    tagName: String(tag).toUpperCase(), nodeName: String(tag).toUpperCase(),
    className: '', innerHTML: '', textContent: '', value: '', type: '',
    min: '', max: '', step: '',
    width: 720, height: 360, clientWidth: 720, clientHeight: 360,
    style: styleProxy(),
    dataset: {},
    children,
    _attrs: {},
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); },
      toggle(c, on) { if (on === undefined) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); } else if (on) this._s.add(c); else this._s.delete(c); }
    },
    appendChild(c) { children.push(c); c._parent = e; return c; },
    setAttribute(k, v) { e._attrs[k] = String(v); if (String(k).indexOf('data-') === 0) e.dataset[String(k).slice(5)] = String(v); },
    getAttribute(k) { return e._attrs[k] != null ? e._attrs[k] : null; },
    addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    removeEventListener() {},
    getContext() { return e._ctx || (e._ctx = makeCtx()); },
    getBoundingClientRect() { return { width: e.clientWidth || 720, height: e.clientHeight || 360, left: 0, top: 0, right: 720, bottom: 360 }; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    focus() {}, blur() {},
    get parentNode() { return e._parent; }, set parentNode(p) { e._parent = p; }
  };
  return e;
}
const g = globalThis;
g.window = g;
g.document = { createElement: (t) => makeEl(t), querySelector: () => makeEl('div'), body: makeEl('body') };
g.requestAnimationFrame = () => 0;
g.cancelAnimationFrame = () => {};
g.devicePixelRatio = 1;
g.addEventListener = () => {};

/* ----------------------------- load engine ----------------------------- */
const PolyViz = require('./assets/poly.js');

/* ----------------------------- synthetic aux scenes ----------------------------- */
const SYNTH = [
  {
    id: 'synth-aux-speedup', title: 'synth speedup',
    domain: { i: [0, 5], j: [0, 5] },
    steps: [{ title: 's', color: { mode: 'core', cores: 4, dim: 'i' },
      play: { order: 'by-core', cores: 4, dim: 'i' },
      aux: { type: 'speedup', cores: 4, work: 36, t1: 36, tp: 9 } }]
  },
  {
    id: 'synth-aux-vec', title: 'synth vector',
    domain: { i: [0, 1], j: [0, 7] },
    steps: [{ title: 's', color: { mode: 'lane', vl: 4, dim: 'j' },
      play: { order: 'lexico' },
      aux: { type: 'vectorlanes', vl: 4, total: 16 } }]
  },
  {
    id: 'synth-aux-gantt', title: 'synth gantt',
    domain: { i: [0, 3], j: [0, 3] },
    steps: [{ title: 's', play: { order: 'parallel' },
      aux: { type: 'gantt', maxTime: 10, makespan: 8, rows: [
        { label: 'core 0', segments: [{ start: 0, len: 4, color: '#58d1ff', label: 't0' }, { start: 4, len: 4, color: '#5ce6a3' }] },
        { label: 'core 1', segments: [{ start: 0, len: 6, color: '#ffb454' }] }
      ] } }]
  },
  {
    id: 'synth-aux-pipeline', title: 'synth pipeline',
    domain: { i: [0, 5], j: [0, 0] },
    steps: [{ title: 's', play: { order: 'lexico' },
      aux: { type: 'pipeline', stages: ['Ld', '×', '+', 'St'], iters: 6, ii: 1 } }]
  },
  {
    id: 'synth-aux-mem-row', title: 'synth mem rowmajor',
    domain: { i: [0, 7], j: [0, 7] },
    steps: [{ title: 's', tiles: { ti: 4, tj: 4 }, play: { order: 'lexico', speedMs: 5 },
      aux: { type: 'memory', rows: 8, cols: 8, page: { r: 8, c: 4 }, order: 'rowmajor', note: 'row major' } }]
  },
  {
    id: 'synth-aux-mem-tiled', title: 'synth mem tiled',
    domain: { i: [0, 7], j: [0, 7] },
    steps: [{ title: 's', tiles: { ti: 4, tj: 4 }, color: { mode: 'tile', ti: 4, tj: 4 },
      play: { order: 'by-tile', ti: 4, tj: 4, speedMs: 5 },
      aux: { type: 'memory', rows: 8, cols: 8, page: { r: 4, c: 4 }, order: 'tiled', ti: 4, tj: 4 } }]
  },
  {
    id: 'synth-simd-group', title: 'synth simd group play',
    domain: { i: [0, 3], j: [0, 7] },
    steps: [{ title: 's', color: { mode: 'lane', vl: 4, dim: 'j' }, tiles: { ti: 1, tj: 4 },
      play: { order: 'by-tile', ti: 1, tj: 4, group: true, speedMs: 10 },
      aux: { type: 'vectorlanes', vl: 4, total: 32 } }]
  },
  {
    id: 'synth-mask-interchange', title: 'synth mask + interchange + deps',
    domain: { i: [0, 6], j: [0, 6], mask: 'tri-upper' },
    code: { before: 'affine.for %i = 0 to 7 {\n  affine.for %j = 0 to 7 { }\n}', after: 'after' },
    steps: [
      { title: 'a', code: 'before', codeHi: [[1, 2]], color: { mode: 'wavefront', by: 'i+j' },
        deps: [{ di: 0, dj: 1 }], play: { order: 'wavefront' } },
      { title: 'b', code: 'after', transform: [[0, 1], [1, 0]], showMatrix: true,
        color: { mode: 'expr', by: 'i' }, play: { order: 'lexico' } }
    ]
  }
];

/* ----------------------------- drive a scene ----------------------------- */
function driveScene(scene, label, problems) {
  // validate
  const v = PolyViz.validateScene(scene);
  if (!v.ok) { v.errors.forEach((e) => problems.push(`[${label}] VALIDATE: ${e}`)); }
  // mount
  let s;
  try {
    s = PolyViz.mount(makeEl('div'), scene);
  } catch (e) {
    problems.push(`[${label}] MOUNT threw: ${e && e.stack || e}`);
    return v;
  }
  // drive every step through the state machine
  const n = (scene.steps || []).length;
  for (let k = 0; k < n; k++) {
    try {
      s.lastTs = 0;
      s.gotoStep(k, { animate: true, replay: true });
      s.phaseStart = 0;
      const stamps = [0, 100, 500, 780, 820, 1000, 1400, 2200, 4000, 9000, 20000];
      for (let t = 0; t < stamps.length; t++) s._frame(stamps[t]);
      // also force a static (non-animated) jump + draw
      s.gotoStep(k, { animate: false, replay: false });
      s.draw(25000);
      // geometry assertions: every point must land on-canvas with a sane cell size
      const geo = s._geom();
      if (!(geo.cell >= 2.5 && geo.cell < 400)) problems.push(`[${label}] step[${k}] bad cell size ${geo.cell.toFixed(2)}`);
      const M = scene.steps[k]._M || [[1, 0], [0, 1]];
      let off = 0;
      for (let p = 0; p < s.points.length; p++) {
        const P = s.points[p];
        const u = M[0][0] * P.i + M[0][1] * P.j, v = M[1][0] * P.i + M[1][1] * P.j;
        const sx = geo.ox + v * geo.cell, sy = geo.oy + u * geo.cell;
        if (!isFinite(sx) || !isFinite(sy)) { problems.push(`[${label}] step[${k}] non-finite screen coord`); break; }
        if (sx < -1 || sx > s._W + 1 || sy < -1 || sy > s._H + 1) off++;
      }
      if (off > 0) problems.push(`[${label}] step[${k}] ${off}/${s.points.length} points fall OFF-CANVAS (framing bug)`);
    } catch (e) {
      problems.push(`[${label}] step[${k}] "${(scene.steps[k] || {}).title || ''}" threw: ${e && e.stack || e}`);
    }
  }
  return v;
}

/* ----------------------------- collect configs ----------------------------- */
function loadConfig(file) {
  const abs = path.resolve(file);
  delete require.cache[abs];
  g.POLY_SCENE = undefined;
  require(abs);
  const sc = g.POLY_SCENE;
  if (!sc) throw new Error('config did not set window.POLY_SCENE');
  return sc;
}

const args = process.argv.slice(2);
let configFiles;
if (args.length) {
  configFiles = args;
} else {
  const tdir = path.join(__dirname, 'topics');
  configFiles = fs.existsSync(tdir)
    ? fs.readdirSync(tdir).filter((f) => /\.config\.js$/.test(f)).sort().map((f) => path.join(tdir, f))
    : [];
}

/* ----------------------------- run ----------------------------- */
const problems = [];
let warnCount = 0;
let count = 0;

console.log('— synthetic aux/feature scenes —');
SYNTH.forEach((sc) => {
  const v = driveScene(sc, sc.id, problems);
  warnCount += v.warnings.length;
  count++;
  console.log(`  ✓ ${sc.id}${v.warnings.length ? '  (warn: ' + v.warnings.length + ')' : ''}`);
});

console.log('— topic configs —');
configFiles.forEach((file) => {
  let sc;
  try { sc = loadConfig(file); }
  catch (e) { problems.push(`[${path.basename(file)}] LOAD: ${e.message}`); console.log(`  ✗ ${path.basename(file)} (load failed)`); return; }
  const v = driveScene(sc, path.basename(file), problems);
  warnCount += v.warnings.length;
  count++;
  const wtxt = v.warnings.length ? '  (warn: ' + v.warnings.map((w) => w).join('; ') + ')' : '';
  console.log(`  ${v.ok ? '✓' : '✗'} ${path.basename(file)} — ${(sc.steps || []).length} steps${wtxt}`);
});

console.log('\n──────────────────────────────────────────');
console.log(`scenes driven: ${count}   warnings: ${warnCount}   errors: ${problems.length}`);
if (problems.length) {
  console.log('\nPROBLEMS:');
  problems.forEach((p) => console.log('  • ' + p));
  process.exit(1);
} else {
  console.log('ALL GREEN ✅  (engine + all scenes render headless without error)');
}
