/* Topic 10 — Software Pipelining (hand-authored showcase).
 * One 1D loop whose body splits into staged ops Ld→Mul→Add→St, each 1 cycle,
 * with intra-iteration latency. Overlapping successive iterations at an
 * initiation interval II turns a latency-bound schedule into a throughput-bound
 * one. NOTE (honesty for experts): software pipelining is NOT an affine-dialect
 * transform — it is instruction/modulo scheduling on the hardware pipeline. The
 * polyhedral connection is only the "schedule = time-stamp assignment" view: we
 * give each (iteration, stage) a cycle, then choose II to overlap. The `after`
 * block is therefore commented pseudo-IR of the overlapped schedule, not a real
 * affine rewrite. */
window.POLY_SCENE = {
  id: '10-pipeline',
  title: '소프트웨어 파이프라이닝',
  subtitle: 'Software Pipelining — II 간격으로 반복을 겹쳐 발사하기',
  intro:
    '한 루프 본문이 지연(latency)을 가진 <b>스테이지 체인</b> <code>Load → Mul → Add → Store</code>로 쪼개진다고 하자. ' +
    '한 반복 안에서 <code>Mul</code>은 <code>Load</code>의 결과를, <code>Add</code>는 <code>Mul</code>의 결과를… 차례로 기다리는 ' +
    '<b>intra-iteration 의존</b>이 있다. 순진하게 한 반복을 끝까지 마치고 다음을 시작하면 파이프라인이 대부분 idle이다. ' +
    'Software pipelining은 <b>연속 반복의 스테이지를 겹쳐</b> 새 반복을 <b>II(initiation interval)</b> 간격으로 발사한다. ' +
    '주의(전문가용): 이는 affine dialect 고유 변환이 아니라 일반 <b>명령 스케줄링/모듈로 스케줄링</b> 개념이다 — ' +
    '다만 <b>“스케줄 = 각 (반복,스테이지)에 사이클을 배정”</b>이라는 관점은 폴리헤드럴 모델과 동일하다.',
  domain: { i: [0, 7], j: [0, 0] },
  axes: { x: '', y: 'iter i' },
  code: {
    before:
      'func.func @saxpy_body(%X: memref<8xf32>, %Y: memref<8xf32>, %a: f32) {\n' +
      '  affine.for %i = 0 to 8 {\n' +
      '    %x = affine.load %X[%i] : memref<8xf32>          // Ld   (stage 0)\n' +
      '    %m = arith.mulf %x, %a : f32                      // Mul  (stage 1, needs %x)\n' +
      '    %y = affine.load %Y[%i] : memref<8xf32>\n' +
      '    %s = arith.addf %m, %y : f32                      // Add  (stage 2, needs %m)\n' +
      '    affine.store %s, %Y[%i] : memref<8xf32>           // St   (stage 3, needs %s)\n' +
      '  }\n' +
      '  return\n' +
      '}',
    after:
      '// software-pipelined schedule (II = 1) — NOT an affine rewrite, but a\n' +
      '// cycle assignment: stage s of iter i fires at cycle  t = i*II + s.\n' +
      '// prologue: 단계적으로 채우기 (iter 0..2 가 부분 진입)\n' +
      'Ld(0)\n' +
      'Mul(0) ; Ld(1)\n' +
      'Add(0) ; Mul(1) ; Ld(2)\n' +
      '// steady state: 매 cycle 4 스테이지가 모두 바쁘다 — throughput 1 iter/cycle\n' +
      'St(0) ; Add(1) ; Mul(2) ; Ld(3)\n' +
      'St(1) ; Add(2) ; Mul(3) ; Ld(4)\n' +
      '// ... 매 II=1 사이클마다 새 반복(Ld(i)) 발사 ...\n' +
      'St(4) ; Add(5) ; Mul(6) ; Ld(7)\n' +
      '// epilogue: 마지막 반복들을 비워내기 (새 Ld 없음)\n' +
      'St(5) ; Add(6) ; Mul(7)\n' +
      'St(6) ; Add(7)\n' +
      'St(7)\n' +
      '// makespan = (N-1)*II + stages = 7*1 + 4 = 11  (vs 8*4 = 32 비파이프라인)',
  },
  steps: [
    {
      title: '① 스테이지 체인 (II=4, 겹침 없음)',
      code: 'before', codeHi: [[3, 7]],
      showMatrix: false,
      color: { mode: 'none' },
      play: { order: 'lexico', speedMs: 240 },
      aux: { type: 'pipeline', stages: ['Ld', '×', '+', 'St'], iters: 8, ii: 4,
             title: '비파이프라인 스케줄 (한 반복을 끝까지)' },
      caption:
        '본문이 4 스테이지 <code>Ld → × → + → St</code>로 쪼개지고 각 스테이지는 <b>1 cycle</b>이다. ' +
        '한 반복 안에는 <b>intra-iteration 의존</b>이 있다 — <code>×</code>는 <code>Ld</code>한 <code>%x</code>를, ' +
        '<code>+</code>는 <code>×</code>한 <code>%m</code>을 기다린다. 순진한 스케줄은 한 반복을 ' +
        '<b>스테이지 0→3까지 모두 끝낸 뒤</b> 다음 반복을 시작하므로 <code>II = 4</code>, ' +
        'aux의 각 줄(반복)이 서로 <b>겹치지 않는다</b>. 8 반복 makespan = <code>(8-1)·4 + 4 = 32</code> cycle.'
    },
    {
      title: '② 왜 느린가 (자원 75% idle)',
      code: 'before', codeHi: [[3, 7]],
      showMatrix: false,
      color: { mode: 'none' },
      play: { order: 'lexico', speedMs: 240 },
      aux: { type: 'pipeline', stages: ['Ld', '×', '+', 'St'], iters: 8, ii: 4,
             title: '한 cycle에 스테이지 1개만 활성 → 75% idle' },
      caption:
        '같은 <code>II=4</code> 스케줄을 가만히 보면 문제가 드러난다: 임의의 한 cycle에 ' +
        '<b>4개 스테이지 유닛 중 단 1개만</b> 일하고 있다. 즉 파이프라인 점유율이 <code>1/4 = 25%</code>, ' +
        '<b>자원의 75%가 idle</b>이다. 이는 스케줄이 한 반복의 <b>지연(latency)에 묶여</b> 있기 때문 — ' +
        '다음 반복의 <code>Ld</code>는 자원이 비어 있는데도 <b>앞 반복이 끝나길 불필요하게 기다린다</b>. ' +
        '여기서 II를 줄일 여지가 보인다.'
    },
    {
      title: '③ 파이프라이닝 II=1 (steady state)',
      code: 'after', codeHi: [[8, 11]],
      showMatrix: false,
      color: { mode: 'none' },
      play: { order: 'lexico', speedMs: 240 },
      aux: { type: 'pipeline', stages: ['Ld', '×', '+', 'St'], iters: 8, ii: 1,
             title: 'II=1 — 매 cycle 새 반복 발사, steady state 강조' },
      caption:
        '스테이지 유닛이 서로 독립이므로(서로 다른 반복의 다른 스테이지는 충돌하지 않음) ' +
        '발사 간격을 <code>II = 1</code>까지 줄일 수 있다 — <b>매 cycle 새 반복</b>의 <code>Ld</code>를 발사. ' +
        'aux의 점선 박스가 <b>steady state</b>: 4 스테이지가 <b>모두 동시에</b> 바쁜 구간(throughput <code>1 iter/cycle</code>). ' +
        '앞쪽 삼각형은 <b>prologue</b>(채우기), 뒤쪽 삼각형은 <b>epilogue</b>(비우기)다. ' +
        '8 반복 makespan = <code>(8-1)·1 + 4 = 11</code> cycle — intra-iteration 의존은 그대로 지켜진다 ' +
        '(<code>×(i)</code>는 여전히 <code>Ld(i)</code> 다음 cycle).'
    },
    {
      title: '④ throughput / speedup',
      code: 'after', codeHi: [[1, 2], [16, 16]],
      showMatrix: false,
      color: { mode: 'none' },
      play: { order: 'lexico', speedMs: 240 },
      aux: { type: 'speedup', cores: 4, work: 32, t1: 32, tp: 11,
             seqLabel: 'II=4', parLabel: 'II=1',
             title: 'makespan: II=4 (32) vs II=1 (11), 8 반복 기준' },
      caption:
        '같은 일을(8 반복 × 4 스테이지 = 32 스테이지-사이클) <b>II=4면 32 cycle</b>, ' +
        '<b>II=1이면 11 cycle</b>에 끝낸다 — <code>≈2.9×</code>. (멀티코어가 아니라 ' +
        '<b>단일 반복 스트림</b>을 4-스테이지 파이프라인에 겹친 것이다.) ' +
        '일반화하면 makespan <code>= (N-1)·II + L</code> (L = 스테이지 수/총 지연). N이 클수록 고정 비용 <code>L</code>(prologue+epilogue)이 ' +
        '묻혀 throughput이 <code>1/II</code>로 수렴한다. 핵심: <b>스케줄=시간배정을 바꿔</b> 같은 의존성을 지키면서 ' +
        '지연-바운드를 throughput-바운드로 옮긴 것 — 폴리헤드럴 스케줄링과 같은 사고, 다만 무대는 affine 영역이 아니라 ' +
        '<b>하드웨어 파이프라인의 시간축</b>이다.'
    }
  ]
};
