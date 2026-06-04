/* Topic 04 — Loop Tiling for Cache Locality (hand-authored showcase).
 * Kernel: matvec y[i] += A[i][j]*x[j].  x[j] reused across i, y[i] reused across j.
 * Tiling = strip-mine each loop into (outer tile-origin, inner intra-tile) + interchange
 * the tile-origin loops outward. Points DON'T move (no schedule morph) — tiling just
 * ADDS tile dimensions to the schedule: θ(i,j) = (i/T, j/T, i, j). We show this as a
 * tile overlay + by-tile traversal so the working set of one tile fits in cache. */
window.POLY_SCENE = {
  id: '04-tiling',
  title: '루프 타일링',
  subtitle: 'Loop Tiling (Cache Locality) · 워킹셋을 캐시에 가두기',
  intro:
    '<code>matvec</code> <code>y[i] += A[i][j]*x[j]</code>에서 <code>x[j]</code>는 모든 <code>i</code>에 걸쳐, ' +
    '<code>y[i]</code>는 모든 <code>j</code>에 걸쳐 <b>재사용</b>된다. 그러나 기본 순회는 한 행을 ' +
    '<code>j</code> 전체로 쓸어 가므로 한 행을 끝낼 때쯤 <code>x[]</code> 전체가 캐시를 한 바퀴 돌아 ' +
    '재사용 거리가 너무 멀어진다. 타일링은 반복 공간을 <code>ti×tj</code> 타일로 쪼개 ' +
    '<b>한 타일의 워킹셋만 캐시에 가둔다</b>. 핵심은 점을 옮기는 것이 아니라(스케줄에 타일 차원을 ' +
    '<b>추가</b>) — <b>strip-mine + interchange</b>의 합성이다: 각 루프를 ' +
    '<code>(바깥 타일 원점, 안쪽 타일 내부)</code>로 strip-mine한 뒤 타일 원점 루프를 바깥으로 ' +
    'interchange한다. 영역도 θ도 affine으로 남으므로 unimodular 변환 없이 합법이다.',
  domain: { i: [0, 7], j: [0, 7] },
  axes: { x: 'j', y: 'i' },
  code: {
    before:
      'func.func @matvec(%A: memref<8x8xf32>, %x: memref<8xf32>, %y: memref<8xf32>) {\n' +
      '  affine.for %i = 0 to 8 {\n' +
      '    affine.for %j = 0 to 8 {\n' +
      '      %a = affine.load %A[%i, %j] : memref<8x8xf32>\n' +
      '      %xj = affine.load %x[%j] : memref<8xf32>      // x[j]: i에 걸쳐 재사용\n' +
      '      %yi = affine.load %y[%i] : memref<8xf32>      // y[i]: j에 걸쳐 재사용\n' +
      '      %p = arith.mulf %a, %xj : f32\n' +
      '      %s = arith.addf %yi, %p : f32\n' +
      '      affine.store %s, %y[%i] : memref<8xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}',
    after:
      'func.func @matvec_tiled(%A: memref<8x8xf32>, %x: memref<8xf32>, %y: memref<8xf32>) {\n' +
      '  // strip-mine + interchange: θ(i,j) = (i floordiv 4, j floordiv 4, i, j)\n' +
      '  affine.for %ii = 0 to 8 step 4 {                  // 타일 원점 (i)\n' +
      '    affine.for %jj = 0 to 8 step 4 {                // 타일 원점 (j)\n' +
      '      affine.for %i = %ii to min(%ii + 4, 8) {       // 타일 내부 (i)\n' +
      '        affine.for %j = %jj to min(%jj + 4, 8) {     // 타일 내부 (j)\n' +
      '          %a = affine.load %A[%i, %j] : memref<8x8xf32>\n' +
      '          %xj = affine.load %x[%j] : memref<8xf32>\n' +
      '          %yi = affine.load %y[%i] : memref<8xf32>\n' +
      '          %p = arith.mulf %a, %xj : f32\n' +
      '          %s = arith.addf %yi, %p : f32\n' +
      '          affine.store %s, %y[%i] : memref<8xf32>\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}'
  },
  steps: [
    {
      title: '① 원래 순회 (행 전체)',
      code: 'before', codeHi: [[2, 3]],
      showMatrix: false,
      color: { mode: 'none' },
      play: { order: 'lexico', speedMs: 42 },
      aux: { type: 'memory', rows: 8, cols: 8, page: { r: 4, c: 4 }, order: 'rowmajor',
        note: '한 행을 j 전체로 sweep — x[0..7] 전체가 워킹셋이라 페이지 경계를 매 행마다 다시 넘는다.' },
      caption:
        '기본 스케줄 <code>θ(i,j)=(i,j)</code>는 <b>한 행을 <code>j</code> 전체로 sweep</b>한다. ' +
        '한 행이 <code>x[0..7]</code> 전부를 건드리므로 워킹셋이 배열 전체 폭만큼 크고, ' +
        '다음 행에서 <code>x[]</code>를 처음부터 다시 읽을 땐 이미 캐시에서 밀려나 있다. ' +
        '아래 <b>memory 패널</b>이 <code>A</code> 접근을 row-major로 재생하며 페이지 전환(≈TLB miss)을 센다.'
    },
    {
      title: '② 타일로 분할 (오버레이)',
      code: 'after', codeHi: [[3, 6]],
      showMatrix: false,
      tiles: { ti: 4, tj: 4 },
      color: { mode: 'tile', ti: 4, tj: 4 },
      caption:
        '반복 공간 위에 <code>4×4</code> <b>타일 격자</b>를 덮는다 — 64개 점이 <b>2×2 = 4개 타일</b>로 묶인다. ' +
        '점은 <b>전혀 움직이지 않는다</b>. 타일링은 θ에 타일 차원을 <b>추가</b>할 뿐이다: ' +
        '<code>θ(i,j) = (i&nbsp;floordiv&nbsp;4, j&nbsp;floordiv&nbsp;4, i, j)</code>. ' +
        '각 루프를 <code>step&nbsp;4</code>의 바깥 <b>strip-mine</b>과 <code>0..3</code>의 안쪽 잔여로 쪼갠 뒤, ' +
        '타일 원점 루프(<code>%ii, %jj</code>)를 바깥으로 <b>interchange</b>한 것이다.'
    },
    {
      title: '③ 타일 단위 순회 (by-tile)',
      code: 'after', codeHi: [[3, 4]],
      showMatrix: false,
      tiles: { ti: 4, tj: 4 },
      color: { mode: 'tile', ti: 4, tj: 4 },
      play: { order: 'by-tile', ti: 4, tj: 4, speedMs: 46 },
      caption:
        '새 순회 순서: <b>한 타일을 끝까지 비운 뒤</b> 다음 타일로 — <code>(ii, jj)</code>가 바깥, ' +
        '<code>(i, j)</code>가 안쪽이다. 한 타일을 처리하는 동안 워킹셋은 ' +
        '<code>x[jj..jj+3]</code>(4원소)와 <code>y[ii..ii+3]</code>(4원소) 그리고 ' +
        '<code>A</code>의 <code>4×4</code> 블록뿐 — 행 전체가 아니라 <b>한 타일</b>만 살아있다. ' +
        '같은 타일 안에서 <code>x[jj..jj+3]</code>는 4개 행에 걸쳐 곧바로 재사용된다.'
    },
    {
      title: '④ 캐시에 갇힌 워킹셋',
      code: 'after', codeHi: [[5, 7]],
      showMatrix: false,
      tiles: { ti: 4, tj: 4 },
      color: { mode: 'tile', ti: 4, tj: 4 },
      play: { order: 'by-tile', ti: 4, tj: 4, speedMs: 46 },
      aux: { type: 'memory', rows: 8, cols: 8, page: { r: 4, c: 4 }, order: 'tiled', ti: 4, tj: 4,
        note: '한 타일(4x4)을 다 쓴 뒤 다음으로 — 페이지 안에 머무는 시간이 길어 페이지 전환이 급감한다.' },
      caption:
        '같은 <code>A</code> 접근을 이번엔 <b>tiled 순서</b>로 재생한다. 타일 하나가 정확히 한 ' +
        '<code>4×4</code> 페이지 안에 들어맞아, 그 타일을 처리하는 16번의 접근이 <b>같은 페이지에 머문다</b>. ' +
        'row-major(①)는 매 행마다 페이지 경계를 넘었지만, tiled는 타일을 다 비운 뒤에만 페이지를 바꾼다 — ' +
        '<b>페이지 전환 ≈ TLB miss가 급감</b>한다. 이것이 워킹셋을 캐시·TLB에 <b>가두는</b> 효과다.'
    },
    {
      title: '⑤ 결과 IR',
      code: 'after', codeHi: [[2, 6]],
      showMatrix: false,
      tiles: { ti: 4, tj: 4 },
      color: { mode: 'tile', ti: 4, tj: 4 },
      caption:
        '결과는 <b>4중 중첩</b>이다: 바깥 두 <code>affine.for %ii/%jj</code>는 <code>step 4</code>로 ' +
        '타일 원점을 훑고(strip-mine된 바깥), 안쪽 두 <code>affine.for %i/%j</code>는 ' +
        '<code>affine.min(%ii + 4, 8)</code> 상한으로 타일 내부를 채운다(<code>8 % 4 = 0</code>이라 ' +
        '여기선 모든 타일이 꽉 차지만, <code>min</code>은 나누어떨어지지 않는 잔여 타일을 위한 일반형이다). ' +
        '<code>θ</code>는 여전히 affine — <b>점을 움직이지 않고 차원만 추가</b>한 <b>strip-mine + interchange</b>가 ' +
        '루프 타일링의 전부다.'
    }
  ]
};
