/* Topic 09 — Multicore Distribution & Speedup (hand-authored showcase).
 * Outer loop i carries no loop-carried dependence (rows independent) → affine.parallel.
 * Distribute the 8 independent rows over P=4 cores. block = contiguous chunks (each
 * core owns 2 consecutive rows, good spatial locality); cyclic = round-robin (each core
 * owns rows {c, c+4}, better load balance under irregular work). 64 iterations / 4 cores
 * → 16 per core → makespan 16, ideal speedup ≈ 4×. */
window.POLY_SCENE = {
  id: '09-multicore',
  title: '멀티코어 분배',
  subtitle: 'Multicore Distribution & Speedup — 병렬 루프를 P개 코어에 나눠 makespan을 줄인다',
  intro:
    '의존성 분석으로 바깥 <code>i</code> 루프가 <b>loop-carried 의존성이 없음</b>이 증명되면(행 <code>i</code>끼리 독립), ' +
    '<code>affine.for</code>는 <code>affine.parallel</code>이 된다(→ 6번 주제). ' +
    '남은 일은 이 <b>독립 반복들을 <code>P=4</code>개 코어에 나누는 것</b>: 폴리헤드럴 용어로는 ' +
    '병렬 차원을 코어 인덱스 <code>p</code>로 <b>strip-mine</b>하는 분배 정책이다. ' +
    '<b>block</b>(연속 청크)은 <b>지역성</b>을, <b>cyclic</b>(번갈아)은 <b>부하 균형</b>을 노린다. ' +
    '척도는 <b>makespan</b>(가장 늦게 끝나는 코어의 완료 시각)과 그로부터 나오는 <b>speedup</b> ' +
    '<code>S(P) = T&#8321; / T&#8346;</code>다. 여기선 <code>i:[0,7] × j:[0,7]</code> = 64 작업.',
  domain: { i: [0, 7], j: [0, 7] },
  axes: { x: 'j', y: 'i' },
  code: {
    before:
      'func.func @map(%A: memref<8x8xf32>, %C: memref<8x8xf32>) {\n' +
      '  affine.for %i = 0 to 8 {              // 행 i — 서로 독립\n' +
      '    affine.for %j = 0 to 8 {\n' +
      '      %a = affine.load %A[%i, %j] : memref<8x8xf32>\n' +
      '      %r = arith.mulf %a, %a : f32      // C[i][j] = f(A[i][j])\n' +
      '      affine.store %r, %C[%i, %j] : memref<8x8xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}',
    after:
      'func.func @map(%A: memref<8x8xf32>, %C: memref<8x8xf32>) {\n' +
      '  // 행 i 에 loop-carried 의존성 없음 → 바깥 루프가 병렬\n' +
      '  affine.parallel (%i) = (0) to (8) {\n' +
      '    affine.for %j = 0 to 8 {\n' +
      '      %a = affine.load %A[%i, %j] : memref<8x8xf32>\n' +
      '      %r = arith.mulf %a, %a : f32\n' +
      '      affine.store %r, %C[%i, %j] : memref<8x8xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  // 코어 매핑은 scheduling/lowering 단계의 일:\n' +
      '  //   affine.parallel → scf.parallel → omp.wsloop (schedule(static))  ≈ block\n' +
      '  //   또는  gpu.launch (%i = blockIdx·blockDim + threadIdx)\n' +
      '  return\n' +
      '}'
  },
  steps: [
    {
      title: '① 병렬 루프',
      code: 'after', codeHi: [[2, 3]],
      showMatrix: false,
      color: { mode: 'none' },
      caption:
        '바깥 <code>affine.parallel (%i) = (0) to (8)</code> — <code>C[i][j] = f(A[i][j])</code>는 ' +
        '같은 <code>(i,j)</code>만 읽고 쓰므로 <b>서로 다른 행 <code>i</code> 사이에 의존성이 없다</b>. ' +
        '64개 반복 인스턴스는 <b>임의의 순서·동시</b>에 실행해도 결과가 같다. ' +
        '이제 이 64개를 어떤 코어가 맡을지 — <b>분배 정책</b>만 정하면 된다.'
    },
    {
      title: '② block 분배 (P=4)',
      code: 'after', codeHi: [[2, 2]],
      showMatrix: false,
      color: { mode: 'core', cores: 4, dim: 'i', distribution: 'block' },
      play: { order: 'by-core', cores: 4, dim: 'i', distribution: 'block', speedMs: 120 },
      aux: {
        type: 'gantt', maxTime: 64, makespan: 16,
        title: 'block: core p ← 연속 2행  (makespan = 16)',
        rows: [
          { label: 'core 0', segments: [{ start: 0, len: 16, color: '#58d1ff', label: 'i∈{0,1}' }] },
          { label: 'core 1', segments: [{ start: 0, len: 16, color: '#ffb454', label: 'i∈{2,3}' }] },
          { label: 'core 2', segments: [{ start: 0, len: 16, color: '#7c8cff', label: 'i∈{4,5}' }] },
          { label: 'core 3', segments: [{ start: 0, len: 16, color: '#5ce6a3', label: 'i∈{6,7}' }] }
        ]
      },
      caption:
        '<b>block</b> 정책: 병렬 차원 <code>i</code>를 <code>P=4</code> 코어에 <b>연속 청크</b>로 자른다 — ' +
        '코어 <code>p</code>는 <code>⌈8/4⌉ = 2</code>개의 <b>인접한 행</b>을 맡는다(core 0 → 행 0·1, core 1 → 2·3, …). ' +
        '64개 작업이 <b>코어당 16개</b>로 균등 분배되어 모든 코어가 동시에 끝난다 → <b>makespan = 16</b>. ' +
        '인접 행을 같은 코어가 잡으므로 <code>A</code>의 캐시 라인·페이지 <b>재사용(지역성)</b>이 좋다.'
    },
    {
      title: '③ cyclic 분배',
      code: 'after', codeHi: [[2, 2]],
      showMatrix: false,
      color: { mode: 'core', cores: 4, dim: 'i', distribution: 'cyclic' },
      play: { order: 'by-core', cores: 4, dim: 'i', distribution: 'cyclic', speedMs: 120 },
      caption:
        '<b>cyclic</b> 정책: 행을 <b>번갈아(round-robin)</b> 나눈다 — 코어 <code>p</code>는 ' +
        '<code>i ≡ p (mod 4)</code>인 행, 즉 core 0 → 행 {0,4}, core 1 → {1,5}, … . ' +
        '균질한 이 커널에선 두 정책 모두 makespan 16이지만, 핵심은 <b>트레이드오프</b>다: ' +
        'block은 <b>지역성</b>(인접 데이터 같은 코어)에 유리하고, cyclic은 행마다 일량이 ' +
        '다를 때(예: 삼각 도메인 <code>j ≤ i</code>) <b>부하 균형</b>에 유리하다 — 무거운/가벼운 행이 ' +
        '코어에 골고루 섞이기 때문. 폴리헤드럴 스케줄러는 의존성·재사용 비용으로 둘 중 하나를 고른다.'
    },
    {
      title: '④ speedup',
      code: 'after', codeHi: [[2, 3]],
      showMatrix: false,
      color: { mode: 'core', cores: 4, dim: 'i', distribution: 'block' },
      play: { order: 'by-core', cores: 4, dim: 'i', distribution: 'block', speedMs: 120 },
      aux: { type: 'speedup', cores: 4, work: 64, t1: 64, tp: 16, title: '순차 vs 4-core makespan' },
      caption:
        '순차 makespan <code>T&#8321; = 64</code> 스텝, 4코어 makespan <code>T&#8324; = 16</code> 스텝 → ' +
        '<b>speedup ≈ 4×</b>(이상적 선형, <code>S(P) = P</code>). 단 이는 상한이다: 실제로는 ' +
        '<b>동기화(barrier)·스레드 생성·false sharing</b>과 <b>메모리 대역폭 포화</b>로 ' +
        '<code>S(P) &lt; P</code>로 떨어진다. 또한 직렬 구간 비율 <code>f</code>가 있으면 ' +
        'Amdahl 한계 <code>S(P) = 1 / (f + (1-f)/P)</code>에 막힌다. 그래서 분배 정책(block/cyclic)과 ' +
        '입도(행 vs 타일)를 골라 <b>통신·동기화 대 부하 균형</b>을 맞추는 것이 멀티코어 매핑의 본질이다.'
    }
  ]
};
