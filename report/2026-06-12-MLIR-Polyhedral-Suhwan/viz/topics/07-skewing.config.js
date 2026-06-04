/* Topic 07 — Loop Skewing → Wavefront Parallelism (hand-authored showcase).
 * Stencil with deps (1,0) and (0,1): neither loop is parallel.
 * Skew schedule θ(i,j)=(i+j, j) pushes both deps strictly forward in time t=i+j,
 * so each wavefront (constant t) becomes dependence-free → inner loop parallel. */
window.POLY_SCENE = {
  id: '07-skewing',
  title: '스큐잉과 웨이브프론트 병렬성',
  subtitle: 'Loop Skewing → Wavefront Parallelism · 없던 병렬성을 만들어내기',
  intro:
    '두 축 모두에 의존성이 걸려 <b>어떤 루프도 그대로는 병렬화할 수 없는</b> 스텐실을 생각하자. ' +
    '폴리헤드럴 모델의 답은 <b>스케줄 행렬을 바꾸는 것</b>: <code>θ(i,j) = (i+j, j)</code>. ' +
    '새 시간축 <code>t = i+j</code>를 도입하면 의존성 벡터 <code>(1,0)</code>·<code>(0,1)</code>가 모두 ' +
    '<code>Δt ≥ 1</code>로 <b>시간상 앞으로</b> 향한다. 따라서 같은 <code>t</code>(한 wavefront, 원래의 반대각선) ' +
    '안에서는 의존성이 사라지고 — <b>원래 없던 병렬성</b>이 나타난다.',
  domain: { i: [1, 6], j: [1, 6] },
  axes: { x: 'j', y: 'i' },
  code: {
    before:
      'func.func @stencil(%A: memref<8x8xf32>) {\n' +
      '  %c = arith.constant 5.000000e-01 : f32\n' +
      '  affine.for %i = 1 to 7 {\n' +
      '    affine.for %j = 1 to 7 {\n' +
      '      %n = affine.load %A[%i - 1, %j] : memref<8x8xf32>   // dep (1,0)\n' +
      '      %w = affine.load %A[%i, %j - 1] : memref<8x8xf32>   // dep (0,1)\n' +
      '      %s = arith.addf %n, %w : f32\n' +
      '      %h = arith.mulf %s, %c : f32\n' +
      '      affine.store %h, %A[%i, %j] : memref<8x8xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}',
    after:
      'func.func @stencil_skewed(%A: memref<8x8xf32>) {\n' +
      '  %c = arith.constant 5.000000e-01 : f32\n' +
      '  // 스케줄 θ(i,j) = (i+j, j) ;  i = t - j\n' +
      '  affine.for %t = 2 to 13 {\n' +
      '    affine.parallel (%j) = (max(1, %t - 6)) to (min(7, %t)) {\n' +
      '      %i = affine.apply affine_map<(t, j) -> (t - j)>(%t, %j)\n' +
      '      %n = affine.load %A[%i - 1, %j] : memref<8x8xf32>\n' +
      '      %w = affine.load %A[%i, %j - 1] : memref<8x8xf32>\n' +
      '      %s = arith.addf %n, %w : f32\n' +
      '      %h = arith.mulf %s, %c : f32\n' +
      '      affine.store %h, %A[%i, %j] : memref<8x8xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}'
  },
  steps: [
    {
      title: '① 의존성 있는 스텐실',
      code: 'before', codeHi: [[5, 6]],
      showMatrix: false,
      color: { mode: 'none' },
      deps: [
        { di: 1, dj: 0, color: '#ff7a8a' },
        { di: 0, dj: 1, color: '#ffb454' }
      ],
      legend: [
        { color: '#ff7a8a', label: '의존성 (1,0): A[i-1][j]' },
        { color: '#ffb454', label: '의존성 (0,1): A[i][j-1]' }
      ],
      caption:
        '<code>A[i][j]</code>는 <b>A[i-1][j]</b>(빨강, 의존성 <code>(1,0)</code>)와 ' +
        '<b>A[i][j-1]</b>(주황, <code>(0,1)</code>)에 의존한다. 두 의존성 모두 0이 아니므로 ' +
        '<code>i</code> 루프도, <code>j</code> 루프도 <b>loop-carried 의존성</b>을 가진다.'
    },
    {
      title: '② 두 루프 모두 병렬 불가',
      code: 'before', codeHi: [[3, 4]],
      showMatrix: false,
      color: { mode: 'none' },
      deps: [
        { di: 1, dj: 0, color: '#ff7a8a' },
        { di: 0, dj: 1, color: '#ffb454' }
      ],
      play: { order: 'lexico', speedMs: 40 },
      caption:
        '기본 스케줄 <code>θ=(i,j)</code>는 <b>한 점씩 사전식</b>으로만 실행 가능하다. ' +
        '같은 행(<code>i</code> 고정)에서 <code>j</code>를 늘려도 의존성 <code>(0,1)</code>이 막고, ' +
        '같은 열에서도 <code>(1,0)</code>이 막는다. <b>어느 affine.for도 affine.parallel이 될 수 없다.</b>'
    },
    {
      title: '③ 스큐잉: θ = [[1,1],[0,1]]',
      code: 'after', codeHi: [[4, 4], [6, 6]],
      showMatrix: true, transform: [[1, 1], [0, 1]],
      matrixLabel: 'schedule θ (skew)', matrixVars: ['i', 'j'],
      axisLabels: { u: 't = i + j  (새 시간)', v: 'j' },
      deps: [
        { di: 1, dj: 0, color: '#ff7a8a' },
        { di: 0, dj: 1, color: '#ffb454' }
      ],
      color: { mode: 'none' },
      caption:
        '스케줄을 <code>θ(i,j)=(i+j, j)</code>로 바꾼다(단위행렬식 = 1인 unimodular 변환이라 반복 점이 보존됨). ' +
        '격자가 <b>평행사변형으로 기울고</b>, 세로축은 이제 <b>시간 <code>t=i+j</code></b>다. ' +
        '의존성 <code>(1,0)→Δt=1</code>(수직), <code>(0,1)→Δt=1</code>(대각) — <b>둘 다 아래로(미래로)</b> 향한다.'
    },
    {
      title: '④ wavefront = 병렬',
      code: 'after', codeHi: [[5, 5]],
      showMatrix: true, transform: [[1, 1], [0, 1]],
      matrixLabel: 'schedule θ (skew)', matrixVars: ['i', 'j'],
      axisLabels: { u: 't = i + j', v: 'j  (병렬 →)' },
      color: { mode: 'wavefront', by: 'i+j' },
      play: { order: 'wavefront', speedMs: 420 },
      aux: { type: 'speedup', title: '순차 vs wavefront makespan', cores: 6, work: 36, t1: 36, tp: 11 },
      caption:
        '같은 <code>t</code>(한 가로줄 = 한 wavefront)에 있는 점들 사이에는 의존성이 <b>전혀 없다</b> — ' +
        '한꺼번에 실행 가능. 안쪽 루프가 <code>affine.parallel</code>이 된다. ' +
        '<b>36개 순차 스텝 → 11개 wavefront</b>로, 없던 병렬성이 <code>≈3.3×</code> 속도로 드러난다.'
    },
    {
      title: '⑤ 결과 IR',
      code: 'after', codeHi: [[4, 5], [6, 6]],
      showMatrix: true, transform: [[1, 1], [0, 1]],
      matrixLabel: 'schedule θ (skew)', matrixVars: ['i', 'j'],
      axisLabels: { u: 't = i + j', v: 'j' },
      color: { mode: 'wavefront', by: 'i+j' },
      caption:
        '바깥 <code>affine.for %t</code>는 wavefront를 순서대로 훑고, 안쪽 <code>affine.parallel (%j)</code>는 ' +
        '<code>max/min</code> affine 경계로 그 wavefront의 폭만큼 펼쳐진다. <code>%i = affine.apply (t - j)</code>로 ' +
        '원래 인덱스를 복원한다. <b>의존성을 깨지 않고 스케줄만 바꿔</b> 병렬성을 합성한 것이 스큐잉의 핵심.'
    }
  ]
};
