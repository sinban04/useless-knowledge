# poly.js scene API — authoring guide

A **scene** is a pure-data object assigned to `window.POLY_SCENE` inside a
`topics/NN-slug.config.js` file (a classic `<script>`, **not** an ES module).
The engine (`assets/poly.js`) renders it. The matching `topics/NN-slug.html`
is identical for every topic except the one `<script src>` line.

The engine validates every scene (`PolyViz.validateScene`) and the repo's
`selftest.cjs` drives it headless — so **a config that passes `node selftest.cjs topics/NN-slug.config.js` is structurally correct**.

---

## Coordinate & matrix convention (read this first)

- A point is a loop iteration `(i, j)` — integers.
- A step's `transform` is a **2×2 schedule matrix `M`** that maps loop coords to
  plane coords: `M·(i,j) = (u, v)`.
- **`u` is the vertical axis (drawn downward); `v` is the horizontal axis (drawn rightward).**
- Default (no transform) = identity `[[1,0],[0,1]]` → `u=i` (rows, vertical),
  `v=j` (cols, horizontal). Outer loop `i` goes down, inner loop `j` goes right.
- This matrix **is the schedule θ** the user thinks in. Examples:
  - Interchange: `[[0,1],[1,0]]` → `u=j, v=i` (axes swapped).
  - Skew (time = i+j): `[[1,1],[0,1]]` → `u=i+j, v=j` (square → parallelogram).
- Use a **unimodular** matrix (integer entries, `det = ±1`) for schedule changes
  so the lattice points are preserved. `det=0` is rejected (lattice collapses).
- The engine auto-frames the union of all steps' transformed domains, so the
  view is stable across a morph. Don't worry about scaling.

---

## Top-level scene fields

```js
window.POLY_SCENE = {
  id:       '02-interchange',          // MUST equal the id in topics/topics.js
  title:    '루프 순서 교환',           // Korean title
  subtitle: 'Loop Interchange — ...',  // shown under the title
  intro:    '…HTML string…',           // one paragraph; <b>, <code> allowed
  domain:   { i: [0, 6], j: [0, 6] },  // inclusive integer bounds. optional mask (below)
  axes:     { x: 'j', y: 'i' },        // default axis labels (x=horizontal, y=vertical)
  code:     { before: '…MLIR…', after: '…MLIR…' },  // multiline strings
  steps:    [ /* step objects, in order */ ]
};
```

- **`domain.mask`** (optional): restrict to a triangular domain. One of
  `'tri-upper'` (i≤j), `'tri-lower'` (i≥j), `'tri-strict-upper'` (i<j),
  `'tri-strict-lower'` (i>j). Use for triangular nests (e.g. solver). Most topics
  use a full rectangle (no mask).
- Keep the domain small (roughly 5×5 … 8×8) so points are legible.

---

## Step object

Every step is one "slide". Fields (all optional except you'll usually set
`title`, `caption`, `code`):

| field | type | meaning |
|---|---|---|
| `title` | string | short step title (e.g. `'① 순서 교환 전'`) — appears in caption + rail chip |
| `caption` | HTML string | the narration shown below the stage. `<b>`, `<code>` allowed |
| `code` | `'before'` \| `'after'` | which `scene.code` block to show this step |
| `codeHi` | array | lines to highlight, 1-based; `[3]` or ranges `[[3,5]]` or mixed `[[2,3],[7,7]]`. Highlighted lines glow; others dim |
| `transform` | 2×2 array | the schedule matrix `M` for this step (morphs from the previous step). Default identity |
| `showMatrix` | bool | force-show (`true`) / hide (`false`) the floating θ widget. Default: shown iff transform ≠ identity |
| `matrixLabel` | string | label above the matrix widget (default `'schedule θ'`) |
| `matrixVars` | `[string,string]` | variable names in the matrix readout (default `['i','j']`) |
| `axisLabels` | `{u, v}` | override axis labels for this step (e.g. `{u:'t = i+j', v:'j'}`) |
| `color` | object | how to color points (see **Coloring**) |
| `legend` | array | explicit legend `[{color, label}, …]` (overrides auto-legend) |
| `tiles` | `{ti, tj}` | draw a tile grid of `ti×tj` blocks over the lattice (shears with the transform) |
| `deps` | array | dependence vectors to draw (see **Dependences**) |
| `play` | object | intra-step execution animation (see **Play orders**) |
| `aux` | object | auxiliary panel below the lattice (see **Aux panels**) |

### Coloring (`step.color`)

```js
color: { mode: 'none' }                              // single accent color
color: { mode: 'wavefront', by: 'i+j' }              // color by schedule time (rainbow)
color: { mode: 'expr', by: 'i' }                     // color by a linear expr of i,j
color: { mode: 'tile', ti: 2, tj: 2 }                // color by tile id
color: { mode: 'lane', vl: 4, dim: 'j' }             // color by vector-op group (SIMD)
color: { mode: 'core', cores: 4, distribution: 'block', dim: 'i' }   // color by assigned core
color: { mode: 'core', cores: 4, distribution: 'cyclic', ti: 2, tj: 2 } // tiles → cores
```
- `by` accepts: `'i'`, `'j'`, `'i+j'`, `'i-j'`, `'j-i'`, `'2i+j'`, `'i+2j'`.
- `distribution`: `'block'` (contiguous chunks) or `'cyclic'` (round-robin).
- `dim`: `'i'` or `'j'` — which loop axis the lane/core grouping runs along.

### Dependences (`step.deps`)

Loop-space dependence vectors `(di, dj)`. The engine draws an arrow from each
point `(i,j)` to `(i+di, j+dj)`, mapped through the current transform (so after
a skew you can SEE the deps point forward in time).

```js
deps: [
  { di: 1, dj: 0, color: '#ff7a8a' },   // A[i-1][j]
  { di: 0, dj: 1, color: '#ffb454' }    // A[i][j-1]
]
```
Pair with an explicit `legend` to name each arrow color.

### Play orders (`step.play`)

Animates which points "fire" and when. `speedMs` = ms per tick (default 120).

| `order` | behavior | use for |
|---|---|---|
| `'lexico'` | one point at a time, lexicographic in plane coords | sequential default schedule |
| `'parallel'` | **all** points fire at once | a fully parallel loop (no deps) |
| `'wavefront'` | all points sharing the same `u` (time) fire together, sweeping `u` | skew / wavefront parallelism |
| `'by-tile'` | sweep tile-by-tile, lexico within a tile (needs `ti`,`tj`) | tiling locality |
| `'by-core'` | each core sweeps its share concurrently (needs `cores`, + `dim` or `ti`/`tj`, `distribution`) | multicore makespan |

- `play.group: true` (with `order:'by-tile'`): each tile fires **as one tick**
  (all its points light simultaneously). Use `ti:1, tj:VL, group:true` for SIMD —
  one vector op lights `VL` consecutive inner iterations at once.

```js
play: { order: 'wavefront', speedMs: 400 }
play: { order: 'by-tile', ti: 2, tj: 2, speedMs: 90 }
play: { order: 'by-tile', ti: 1, tj: 4, group: true, speedMs: 260 }   // SIMD: 4-wide vector op
play: { order: 'by-core', cores: 4, dim: 'i', distribution: 'block', speedMs: 120 }
```

### Aux panels (`step.aux`)

A second canvas under the lattice. Its fill animates with the step's `play` progress.

```js
// speedup bars: sequential makespan vs parallel makespan
aux: { type: 'speedup', cores: 4, work: 36, t1: 36, tp: 11, title: '…' }

// SIMD vector register + op counters
aux: { type: 'vectorlanes', vl: 4, total: 16, title: '…' }

// explicit Gantt timeline (you supply the rows)
aux: { type: 'gantt', maxTime: 12, makespan: 9, title: '…',
       rows: [ { label: 'core 0', segments: [ {start:0, len:3, color:'#58d1ff', label:'T0'}, … ] }, … ] }

// software-pipeline diagram — engine computes the staggered stages
aux: { type: 'pipeline', stages: ['Ld','×','+','St'], iters: 6, ii: 1, title: '…' }

// memory/paging grid for a rows×cols array with page boundaries; counts faults
aux: { type: 'memory', rows: 8, cols: 8, page: {r:4, c:4},
       order: 'rowmajor'|'colmajor'|'tiled', ti: 4, tj: 4, note: '…' }
```
- `gantt` colors: reuse `PolyViz.PALETTE` hues (`#58d1ff #ffb454 #7c8cff #5ce6a3 #ff7a8a …`).
- `memory.order` controls the synthetic access sequence; `tiled` needs `ti,tj`.
  Compare a `rowmajor`/`colmajor` step (many faults) vs a `tiled` step (few faults)
  across two steps to make the paging point.

---

## MLIR correctness rules (the audience is an expert)

- Use **real affine-dialect syntax**: `affine.for %i = 0 to N { … }`,
  `affine.parallel (%i, %j) = (0, 0) to (N, M) { … }`,
  `affine.load/store %A[%i, %j] : memref<NxMxf32>`,
  `affine.apply affine_map<(d0,d1)->(…)>(%a,%b)`, `affine.if`, `affine.yield`.
- Affine bounds may use `min`/`max` and symbols; index exprs may use `%i + 1`, `%i - 1`.
- `affine.parallel` is the marker of a parallel loop; reductions use
  `affine.parallel (...) reduce ("addf") -> (f32) { … affine.yield %x : f32 }`.
- Tiling pretty-form: an outer loop over tile origins with `step T` and an inner
  loop bounded by `affine.min(%ii + T, N)`.
- Keep `before`/`after` consistent with the transformation the steps show.
- It's fine to add `// comments` (they're dimmed) to point at deps / bounds.

---

## Authoring checklist

1. `id` matches `topics/topics.js`.
2. 4–6 steps that tell a story: *before → the transform → the payoff (parallelism/locality) → resulting IR*.
3. Put the **schedule matrix** front-and-center for any reordering (`transform` + `showMatrix:true`).
4. The `after` MLIR must be valid and must match what the animation shows.
5. Run `node selftest.cjs topics/NN-slug.config.js` — must print `ALL GREEN`.
6. Also write the near-identical `topics/NN-slug.html` (copy `01-iteration-space.html`,
   change only the `*.config.js` src line).

See `topics/01-iteration-space.config.js` (foundations) and
`topics/07-skewing.config.js` (transform morph + wavefront + deps + speedup aux)
as worked references.
