/* Topic 03 — Loop Fusion (3-stage producer→consumer chain).
 * Three separate elementwise loops over the same index range write/read
 * intermediate arrays B, C. Modeling the program in a (stage, index) space:
 *   axis i = statement/loop stage s ∈ {0,1,2},  axis j = index ∈ [0,7].
 *   stage0: B[j] = A[j] + 1   (producer of B)
 *   stage1: C[j] = B[j] * 2   (consumer of B, producer of C)
 *   stage2: D[j] = C[j] - 3   (consumer of C)
 * BEFORE schedule θ = identity → stage-major (each stage runs its full j-sweep
 * before the next): B and C are fully materialized; reuse distance is O(N).
 * FUSION = re-schedule to index-major by the permutation θ = [[0,1],[1,0]]
 * (interchange of the stage and index loops): for each j, stages 0→1→2 fire
 * back-to-back, so B[j],C[j] are produced-then-consumed immediately. Reuse
 * distance collapses to O(1) → B,C drop to scalars (scalar replacement).
 * The producer→consumer dependence is (di=1, dj=0) in (stage,index) loop space
 * (stage s-1 → s at the same j); fusion keeps the per-j stage order, so the
 * dependence stays forward (Δ along the new minor axis) → legal. */
window.POLY_SCENE = {
  id: '03-fusion',
  title: '루프 융합',
  subtitle: 'Loop Fusion — producer→consumer 3단 체인을 한 루프로',
  intro:
    '같은 인덱스 영역을 도는 <b>연속된 elementwise 루프들</b>을 생각하자: ' +
    '<code>B[j]=A[j]+1</code> → <code>C[j]=B[j]*2</code> → <code>D[j]=C[j]-3</code>. ' +
    '이 프로그램을 <b>(stage, index) 2D 공간</b>으로 본다 — 세로축 <code>i</code>는 문장/루프 단계 ' +
    '<code>stage∈{0,1,2}</code>, 가로축 <code>j</code>는 인덱스 <code>[0,7]</code>. ' +
    '분리된 루프의 기본 스케줄은 <b>stage-major</b>(한 stage의 <code>j</code> 전체를 끝낸 뒤 다음 stage)라 ' +
    '중간배열 <code>B,C</code>가 <b>통째로 materialize</b>되고 재사용 거리가 <code>O(N)</code>이다. ' +
    '융합은 스케줄을 <b>index-major로 치환</b>(<code>θ=[[0,1],[1,0]]</code>, stage↔index 루프 교환)하는 것 — ' +
    '각 <code>j</code>마다 stage 0→1→2가 연속 실행되어 <code>B[j],C[j]</code>를 <b>즉시 소비</b>한다.',
  domain: { i: [0, 2], j: [0, 7] },
  axes: { x: 'j (index)', y: 'i (stage)' },
  code: {
    before:
      'func.func @chain(%A: memref<8xf32>, %D: memref<8xf32>) {\n' +
      '  %B = memref.alloc() : memref<8xf32>   // 중간 버퍼 B\n' +
      '  %C = memref.alloc() : memref<8xf32>   // 중간 버퍼 C\n' +
      '  %c1 = arith.constant 1.000000e+00 : f32\n' +
      '  %c2 = arith.constant 2.000000e+00 : f32\n' +
      '  %c3 = arith.constant 3.000000e+00 : f32\n' +
      '  affine.for %j = 0 to 8 {            // stage 0: producer of B\n' +
      '    %a = affine.load %A[%j] : memref<8xf32>\n' +
      '    %b = arith.addf %a, %c1 : f32\n' +
      '    affine.store %b, %B[%j] : memref<8xf32>\n' +
      '  }\n' +
      '  affine.for %j = 0 to 8 {            // stage 1: B → C\n' +
      '    %b = affine.load %B[%j] : memref<8xf32>\n' +
      '    %c = arith.mulf %b, %c2 : f32\n' +
      '    affine.store %c, %C[%j] : memref<8xf32>\n' +
      '  }\n' +
      '  affine.for %j = 0 to 8 {            // stage 2: C → D\n' +
      '    %c = affine.load %C[%j] : memref<8xf32>\n' +
      '    %d = arith.subf %c, %c3 : f32\n' +
      '    affine.store %d, %D[%j] : memref<8xf32>\n' +
      '  }\n' +
      '  return\n' +
      '}',
    after:
      'func.func @chain_fused(%A: memref<8xf32>, %D: memref<8xf32>) {\n' +
      '  %c1 = arith.constant 1.000000e+00 : f32\n' +
      '  %c2 = arith.constant 2.000000e+00 : f32\n' +
      '  %c3 = arith.constant 3.000000e+00 : f32\n' +
      '  // 융합: stage↔index 루프 교환, θ(i,j) = (j, i) → index-major\n' +
      '  affine.for %j = 0 to 8 {\n' +
      '    %a = affine.load %A[%j] : memref<8xf32>\n' +
      '    %b = arith.addf %a, %c1 : f32          // stage 0: B[j] (scalar)\n' +
      '    %c = arith.mulf %b, %c2 : f32          // stage 1: C[j] (scalar)\n' +
      '    %d = arith.subf %c, %c3 : f32          // stage 2: D[j]\n' +
      '    affine.store %d, %D[%j] : memref<8xf32>\n' +
      '  }\n' +
      '  return\n' +
      '}'
  },
  steps: [
    {
      title: '① 분리된 3 루프 (stage-major)',
      code: 'before', codeHi: [[7, 7], [12, 12], [17, 17]],
      showMatrix: true, transform: [[1, 0], [0, 1]],
      matrixLabel: 'schedule θ (identity)', matrixVars: ['i', 'j'],
      axisLabels: { u: 'i = stage  (시간 1순위)', v: 'j = index  (시간 2순위)' },
      color: { mode: 'expr', by: 'i' },
      play: { order: 'lexico', speedMs: 60 },
      legend: [
        { color: '#58d1ff', label: 'stage 0: B[j]=A[j]+1' },
        { color: '#ffb454', label: 'stage 1: C[j]=B[j]*2' },
        { color: '#7c8cff', label: 'stage 2: D[j]=C[j]-3' }
      ],
      caption:
        '세 개의 <code>affine.for %j = 0 to 8</code>이 차례로 돈다. (stage, index) 공간에서 ' +
        '기본 스케줄 <code>θ(i,j)=(i,j)</code>는 <b>stage-major</b> — <code>i</code>(stage)가 시간 1순위라 ' +
        '<b>한 가로행(=한 stage의 <code>j</code> 전체)</b>을 통째로 실행한 뒤 다음 stage로 내려간다. ' +
        'stage 0이 <code>B[0..7]</code>을 <b>전부 채운 뒤</b>에야 stage 1이 시작 → <code>B</code>가 ' +
        '<b>통째로 materialize</b>되고, 마찬가지로 <code>C</code>도 그렇다.'
    },
    {
      title: '② producer→consumer 의존성',
      code: 'before', codeHi: [[10, 10], [13, 13], [15, 15], [18, 18]],
      showMatrix: true, transform: [[1, 0], [0, 1]],
      matrixLabel: 'schedule θ (identity)', matrixVars: ['i', 'j'],
      axisLabels: { u: 'i = stage', v: 'j = index' },
      color: { mode: 'expr', by: 'i' },
      deps: [{ di: 1, dj: 0, color: '#ff7a8a' }],
      legend: [
        { color: '#ff7a8a', label: '의존성 (1,0): stage s−1 → s, 같은 j' }
      ],
      caption:
        'consumer stage는 <b>같은 <code>j</code></b>에서 producer stage의 결과를 읽는다: ' +
        '<code>C[j]</code>는 <code>B[j]</code>에, <code>D[j]</code>는 <code>C[j]</code>에 의존. ' +
        '(stage, index) 루프 공간에서 이 흐름 의존성은 벡터 <b><code>(di=1, dj=0)</code></b> — ' +
        '<b>세로(stage)로만</b> 1, 가로(index)로는 0이다. <code>j</code>축으로는 의존성이 없으므로 ' +
        '<b>이 의존성을 깨지 않는 한 stage들의 j-순회를 자유롭게 섞을 수 있다</b>(융합의 합법성 근거).'
    },
    {
      title: '③ 융합 = index-major 재스케줄',
      code: 'after', codeHi: [[5, 6]],
      showMatrix: true, transform: [[0, 1], [1, 0]],
      matrixLabel: 'schedule θ (fusion = interchange)', matrixVars: ['i', 'j'],
      axisLabels: { u: 'j = index  (시간 1순위)', v: 'i = stage  (시간 2순위)' },
      color: { mode: 'expr', by: 'i' },
      deps: [{ di: 1, dj: 0, color: '#ff7a8a' }],
      legend: [
        { color: '#ff7a8a', label: '의존성 (1,0): 같은 j 안 stage 순서로 보존' }
      ],
      caption:
        '스케줄을 <b>치환행렬 <code>θ=[[0,1],[1,0]]</code></b>으로 바꾼다 — stage 루프와 index 루프의 ' +
        '<b>교환</b>(<code>det=−1</code>인 unimodular이라 점 보존). 격자가 <b>전치(transpose)</b>되어 ' +
        '세로축이 이제 <code>j</code>(index), 가로축이 <code>i</code>(stage)다. ' +
        '의존성 <code>(1,0)</code>은 변환 후 <b>가로(stage 축)로 향하는 화살표</b>가 된다 — ' +
        '<b>각 <code>j</code> 안에서 stage 0→1→2 순서가 그대로 유지</b>되므로 <code>Δ&gt;0</code>(미래로) → ' +
        '<b>의존성이 보존되어 융합이 합법</b>이다.'
    },
    {
      title: '④ 즉시 재사용 + scalar replacement',
      code: 'after', codeHi: [[8, 11]],
      showMatrix: true, transform: [[0, 1], [1, 0]],
      matrixLabel: 'schedule θ (fused)', matrixVars: ['i', 'j'],
      axisLabels: { u: 'j = index', v: 'i = stage  (연속 0→1→2)' },
      color: { mode: 'expr', by: 'i' },
      play: { order: 'lexico', speedMs: 110 },
      legend: [
        { color: '#58d1ff', label: 'stage 0: %b = A[j]+1' },
        { color: '#ffb454', label: 'stage 1: %c = %b*2' },
        { color: '#7c8cff', label: 'stage 2: %d = %c-3' }
      ],
      caption:
        '전치 후 화면에서 한 <code>j</code>의 세 stage는 <b>같은 세로 위치(<code>u=j</code>)</b>에 모여 ' +
        '<b>가로행(=stage축 <code>v=i</code>를 따라 나란히, 3칸)</b>을 이룬다(반대로 한 stage 전체 8개 <code>j</code>는 이제 세로열). ' +
        '그래서 lexico 실행이 <b>한 가로행 = 한 <code>j</code>의 stage 0→1→2</b>를 왼쪽→오른쪽으로 연속으로 훑은 뒤 다음 <code>j</code> 행으로 내려간다: ' +
        '<code>B[j]</code>를 만든 직후 <b>바로 <code>C[j]</code>가 소비</b>하고, 또 바로 <code>D[j]</code>가 소비한다. ' +
        '재사용 거리가 <b><code>O(N)</code> → <code>O(1)</code></b>로 붕괴 — <code>B[j],C[j]</code>는 다음 <code>j</code> ' +
        '전에 죽으므로 <b>배열이 필요 없다</b>. <code>memref&lt;8xf32&gt;</code> 버퍼 <code>%B,%C</code>는 SSA ' +
        '스칼라 <code>%b,%c</code>로 <b>축약(scalar replacement)</b>되고 두 <code>memref.alloc</code>이 제거된다. ' +
        '결과: 단일 <code>affine.for</code> 안에 세 문장이 들어가고 중간 버퍼 트래픽이 사라진다.'
    }
  ]
};
