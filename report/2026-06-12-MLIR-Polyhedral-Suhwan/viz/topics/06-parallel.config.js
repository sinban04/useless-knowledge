/* Topic 06 — Dependence Analysis → affine.parallel.
 * Kernel A (elementwise add): each (i,j) writes C[i][j] from A[i][j]+B[i][j].
 * The dependence (distance) set is EMPTY → no loop-carried dependence on any
 * axis → affine.for nest is promoted to a single affine.parallel (%i, %j).
 * Kernel B (row reduction): s += A[i][j] carries a distance vector (0,1) along
 * the j axis (RAW on the accumulator) → j cannot be a plain parallel loop; it
 * needs affine.parallel ... reduce("addf"). The i axis stays parallel. */
window.POLY_SCENE = {
  id: '06-parallel',
  title: '의존성 분석과 병렬화',
  subtitle: 'Dependence Analysis → affine.parallel · 언제 affine.for를 병렬로 승격할 수 있나',
  intro:
    '폴리헤드럴 모델에서 <b>병렬화 가능성은 의존성 분석으로 결정</b>된다. ' +
    '어떤 루프 축에 <b>loop-carried dependence</b>(그 축을 따라 거리가 0이 아닌 거리벡터)가 없으면, ' +
    '그 <code>affine.for</code>는 의미를 바꾸지 않고 <code>affine.parallel</code>로 승격할 수 있다. ' +
    '커널A <code>C[i][j] = A[i][j] + B[i][j]</code>는 각 <code>(i,j)</code>가 서로 다른 원소만 읽고 쓰므로 ' +
    '거리벡터 집합이 <b>공집합</b> — 두 축 모두 병렬이다. 반면 커널B <code>s += A[i][j]</code>는 누산기 ' +
    '<code>s</code>에 RAW 의존성이 걸려 <code>j</code>축에 거리벡터 <code>(0,1)</code>이 생긴다 — ' +
    '그 축은 직접 병렬화 불가, <code>affine.parallel … reduce</code>가 필요하다.',
  domain: { i: [0, 7], j: [0, 7] },
  axes: { x: 'j', y: 'i' },
  code: {
    before:
      'func.func @add(%A: memref<8x8xf32>, %B: memref<8x8xf32>, %C: memref<8x8xf32>) {\n' +
      '  affine.for %i = 0 to 8 {\n' +
      '    affine.for %j = 0 to 8 {\n' +
      '      %a = affine.load %A[%i, %j] : memref<8x8xf32>\n' +
      '      %b = affine.load %B[%i, %j] : memref<8x8xf32>\n' +
      '      %c = arith.addf %a, %b : f32\n' +
      '      affine.store %c, %C[%i, %j] : memref<8x8xf32>   // write set {(i,j)} 서로 disjoint\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}',
    after:
      'func.func @add(%A: memref<8x8xf32>, %B: memref<8x8xf32>, %C: memref<8x8xf32>,\n' +
      '               %sum: memref<8xf32>) {\n' +
      '  // 거리벡터 집합 = {} → i,j 모두 loop-carried dep 없음 → 한 번에 승격\n' +
      '  affine.parallel (%i, %j) = (0, 0) to (8, 8) {\n' +
      '    %a = affine.load %A[%i, %j] : memref<8x8xf32>\n' +
      '    %b = affine.load %B[%i, %j] : memref<8x8xf32>\n' +
      '    %c = arith.addf %a, %b : f32\n' +
      '    affine.store %c, %C[%i, %j] : memref<8x8xf32>\n' +
      '    affine.yield\n' +
      '  }\n' +
      '\n' +
      '  // ── 별도 커널 B(행별 reduction): sum[i] = Σ_j A[i][j] — 결과는 %sum 인자에 저장 ──\n' +
      '  // j축은 누산기 RAW(거리 (0,1))라 reduce가 필요. i축은 행마다 독립이라 바깥은 그대로 parallel.\n' +
      '  affine.parallel (%i) = (0) to (8) {\n' +
      '    %s = affine.parallel (%j) = (0) to (8) reduce ("addf") -> (f32) {\n' +
      '      %v = affine.load %A[%i, %j] : memref<8x8xf32>\n' +
      '      affine.yield %v : f32\n' +
      '    }\n' +
      '    affine.store %s, %sum[%i] : memref<8xf32>\n' +
      '  }\n' +
      '  return\n' +
      '}'
  },
  steps: [
    {
      title: '① 의존성 테스트 (커널A)',
      code: 'before', codeHi: [[4, 7]],
      showMatrix: false,
      color: { mode: 'none' },
      caption:
        '커널A <code>C[i][j] = A[i][j] + B[i][j]</code>의 의존성 테스트. 각 인스턴스 <code>S(i,j)</code>는 ' +
        '<code>A[i,j]</code>·<code>B[i,j]</code>를 읽고 <code>C[i,j]</code>에 쓴다 — 서로 다른 점은 <b>겹치지 않는 메모리</b>를 건드린다. ' +
        '따라서 거리벡터 집합 <code>D = {}</code> (<b>공집합</b>) — 어느 축에도 <b>loop-carried dependence가 없다</b>. ' +
        '그려진 의존성 화살표가 하나도 없다는 점이 곧 양쪽 축 병렬화의 근거다.'
    },
    {
      title: '② 병렬 실행 (affine.for → affine.parallel)',
      code: 'after', codeHi: [[4, 4], [9, 9]],
      showMatrix: false,
      color: { mode: 'none' },
      play: { order: 'parallel' },
      aux: { type: 'speedup', title: '순차 64 스텝 vs 8코어 병렬 makespan', cores: 8, work: 64, t1: 64, tp: 8 },
      caption:
        '의존성이 없으므로 64개 인스턴스를 <b>한꺼번에</b> 발사할 수 있다 — 동시에 점등하는 격자가 곧 ' +
        '<code>affine.parallel (%i, %j) = (0, 0) to (8, 8)</code>의 의미다. 중첩 두 <code>affine.for</code>가 ' +
        '하나의 2차원 병렬 루프로 <b>합쳐져 승격</b>된다. <code>affine.yield</code>로 본문을 닫는다. ' +
        '8코어에 나누면 <b>64 순차 스텝 → 8 스텝</b>으로 <code>≈8×</code> 이상적 speedup.'
    },
    {
      title: '③ reduction 대비 (커널B)',
      code: 'after', codeHi: [[14, 19]],
      /* 새 줄 번호: 14 바깥 affine.parallel(%i) … 19 affine.store %s, %sum[%i] (커널B 전체) */
      showMatrix: false,
      color: { mode: 'expr', by: 'i' },
      deps: [
        { di: 0, dj: 1, color: '#ff7a8a' }
      ],
      legend: [
        { color: '#ff7a8a', label: '누산기 RAW 의존성 (0,1): s += A[i][j]' },
        { color: '#58d1ff', label: 'i축은 행마다 독립 (색 = i)' }
      ],
      caption:
        '커널B <code>s += A[i][j]</code>는 같은 <code>s</code>를 계속 갱신한다 — <code>S(i,j)</code> → <code>S(i,j+1)</code>로 ' +
        '거리벡터 <code>(0,1)</code>의 <b>RAW(read-after-write)</b> 의존성이 <code>j</code>축에 걸린다(빨강 화살표). ' +
        '따라서 <code>j</code>는 그대로 병렬화 불가 — <code>affine.parallel … reduce("addf")</code>로 결합법칙을 명시해야 한다. ' +
        '반면 행끼리(색 = <code>i</code>)는 서로 독립이라 <code>i</code>축은 여전히 병렬이다.'
    },
    {
      title: '④ 결과 IR',
      code: 'after', codeHi: [[4, 4], [14, 19]],
      showMatrix: false,
      color: { mode: 'expr', by: 'i' },
      caption:
        '두 결론을 IR로 적는다. <b>커널A</b>: 거리벡터 집합이 공집합이므로 ' +
        '<code>affine.parallel (%i, %j) = (0, 0) to (8, 8)</code> 단일 병렬 루프. ' +
        '<b>커널B</b>: <code>j</code>축은 <code>affine.parallel (%j) = (0) to (8) reduce ("addf") -&gt; (f32)</code>로 ' +
        '누산을 reduction으로 표현하고, 행 사이의 <code>i</code>축은 바깥 <code>affine.parallel</code>로 그대로 병렬화한다. ' +
        '<b>의존성 분석이 병렬화의 형태(plain vs reduce vs 다른 축)를 정확히 지시</b>한다는 것이 핵심.'
    }
  ]
};
