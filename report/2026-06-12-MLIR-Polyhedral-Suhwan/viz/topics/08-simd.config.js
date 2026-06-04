/* Topic 08 — SIMD Vectorization (hand-authored showcase).
 * Elementwise A[i][j] = A[i][j] * s. Inner loop j is fully parallel (no
 * loop-carried dependence), so it can be vectorized: strip-mine j by the
 * hardware vector width VL=4, then map the VL consecutive inner iterations to
 * the lanes 0..3 of one vector op. Vectorization = inner-dim VL tile + lane map.
 * 64 scalar ops (8x8) collapse into 16 four-wide vector ops. */
window.POLY_SCENE = {
  id: '08-simd',
  title: 'SIMD 벡터화',
  subtitle: 'SIMD Vectorization — 안쪽 차원을 VL 타일 + 레인 매핑으로',
  intro:
    '벡터화는 <b>새 변환이 아니라 strip-mine의 특수형</b>이다. 의존성이 없는 안쪽 차원 <code>j</code>를 ' +
    '하드웨어 벡터 폭 <b>VL</b>(SSE는 <code>4xf32</code>, AVX는 <code>8xf32</code>)만큼 타일링하고, ' +
    '한 타일 안의 <b>연속 VL개 반복을 한 벡터 레지스터의 레인 0..VL-1</b>에 싣는다. ' +
    '그러면 스칼라 <code>arith.mulf : f32</code> VL개가 <b>단일 SIMD op <code>arith.mulf : vector&lt;4xf32&gt;</code></b>로 융합된다. ' +
    'elementwise 커널 <code>A[i][j] = A[i][j]·s</code>에서 <code>j</code>는 loop-carried 의존성이 없어 ' +
    '안쪽 루프를 그대로 레인에 펼칠 수 있다 — <b>64개 스칼라 op → 16개 4-wide 벡터 op</b>.',
  domain: { i: [0, 7], j: [0, 7] },
  axes: { x: 'j', y: 'i' },
  code: {
    before:
      'func.func @scale(%A: memref<8x8xf32>, %s: f32) {\n' +
      '  affine.for %i = 0 to 8 {\n' +
      '    affine.for %j = 0 to 8 {              // 병렬: loop-carried dep 없음\n' +
      '      %v = affine.load %A[%i, %j] : memref<8x8xf32>\n' +
      '      %r = arith.mulf %v, %s : f32         // 스칼라 곱 1개 / 반복\n' +
      '      affine.store %r, %A[%i, %j] : memref<8x8xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}',
    after:
      'func.func @scale_vec(%A: memref<8x8xf32>, %s: f32) {\n' +
      '  %sv = vector.broadcast %s : f32 to vector<4xf32>   // splat 스칼라 s\n' +
      '  affine.for %i = 0 to 8 {\n' +
      '    affine.for %j = 0 to 8 step 4 {        // strip-mine VL=4\n' +
      '      %v = affine.vector_load %A[%i, %j] : memref<8x8xf32>, vector<4xf32>\n' +
      '      %r = arith.mulf %v, %sv : vector<4xf32>         // 1 벡터 op = 4 레인\n' +
      '      affine.vector_store %r, %A[%i, %j] : memref<8x8xf32>, vector<4xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}'
  },
  steps: [
    {
      title: '① 스칼라 안쪽 루프',
      code: 'before', codeHi: [[3, 5]],
      showMatrix: false,
      color: { mode: 'none' },
      play: { order: 'lexico', speedMs: 45 },
      caption:
        '기본 스케줄은 <code>(i,j)</code> 사전식. 안쪽 <code>affine.for %j</code>의 각 반복이 ' +
        '<b>스칼라 op 한 개</b>(<code>arith.mulf : f32</code>)를 한 번에 한 원소씩 실행한다. ' +
        '<code>j</code>는 loop-carried 의존성이 없어 <b>본래 병렬</b>이지만, 아직은 한 레인만 쓰는 셈이다. ' +
        '도메인 <code>8×8 = 64</code>개 원소 → <b>64개 스칼라 op</b>.'
    },
    {
      title: '② 레인 후보 (VL=4 타일)',
      code: 'after', codeHi: [[4, 4]],
      showMatrix: false,
      color: { mode: 'lane', vl: 4, dim: 'j' },
      tiles: { ti: 1, tj: 4 },
      legend: [
        { color: '#58d1ff', label: 'vec-op 0: j ∈ [0,3]' },
        { color: '#ffb454', label: 'vec-op 1: j ∈ [4,7]' }
      ],
      caption:
        '안쪽 차원 <code>j</code>를 <b>VL=4</b>로 strip-mine한다(<code>affine.for %j = 0 to 8 step 4</code>). ' +
        '한 행의 <b>연속 4개 <code>j</code></b>가 한 벡터 레지스터 <code>vector&lt;4xf32&gt;</code>의 ' +
        '<b>레인 0..3</b>으로 묶인다 — 같은 색이 곧 한 벡터 op이 담당할 원소들이다. ' +
        '한 행(8칸)은 <code>8/4 = 2</code>개 벡터 op으로 쪼개진다. 색은 <code>floor(j / VL)</code> 그룹 id.'
    },
    {
      title: '③ 한 벡터 op = 4 반복',
      code: 'after', codeHi: [[5, 7]],
      showMatrix: false,
      color: { mode: 'lane', vl: 4, dim: 'j' },
      tiles: { ti: 1, tj: 4 },
      play: { order: 'by-tile', ti: 1, tj: 4, group: true, speedMs: 240 },
      aux: { type: 'vectorlanes', vl: 4, total: 64, title: '벡터 레지스터 — 64 스칼라 op → 16 벡터 op' },
      caption:
        '재생하면 <b>4개 반복이 한 틱에 동시에</b> 발사된다 — 그것이 곧 한 SIMD op이다. ' +
        '<code>affine.vector_load</code>가 <code>%A[%i, %j .. %j+3]</code>을 한 <code>vector&lt;4xf32&gt;</code>로 ' +
        '읽고, <code>arith.mulf : vector&lt;4xf32&gt;</code> 한 번이 레인 0..3을 병렬 곱하고, ' +
        '<code>affine.vector_store</code>가 되쓴다. <b>64개 스칼라 op → 16개 4-wide 벡터 op</b>: ' +
        'op 수가 <code>VL</code>배 줄어 명령 발사·메모리 대역폭이 그만큼 효율적이다.'
    },
    {
      title: '④ 결과 IR',
      code: 'after', codeHi: [[2, 2], [4, 8]],
      showMatrix: false,
      color: { mode: 'lane', vl: 4, dim: 'j' },
      tiles: { ti: 1, tj: 4 },
      caption:
        '벡터화된 IR: 스칼라 <code>s</code>는 <code>vector.broadcast</code>(splat)로 ' +
        '<code>%sv : vector&lt;4xf32&gt;</code>가 되고, 안쪽 루프는 <code>step 4</code>로 strip-mine된다. ' +
        '본문은 <code>affine.vector_load</code> → <code>arith.mulf : vector&lt;4xf32&gt;</code> → ' +
        '<code>affine.vector_store</code> 셋뿐. <b>벡터화 = 안쪽 차원 VL 타일 + 레인 매핑</b>이라는 점에 주목 — ' +
        '8을 VL=4가 나누어떨어지므로 잔여(epilogue) 루프가 필요 없다(<code>8 = 2·VL</code>). ' +
        'VL을 8(AVX)로 키우면 행당 벡터 op이 <code>1</code>개가 된다.'
    }
  ]
};
