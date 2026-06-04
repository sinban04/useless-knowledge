/* Topic 05 — Tiling for Paging & TLB (memory-aux showcase).
 * Array A 8x8, row-major. A virtual page = 2 rows = 16 contiguous f32 (page {r:2,c:8}),
 * so the 8x8 array spans exactly 4 pages. The iteration (i,j) touches A[i][j].
 *  - colmajor schedule θ=[[0,1],[1,0]] walks down a column: each 2-row stride lands in a
 *    new page → a page switch (~TLB miss) on almost every access (31/64).
 *  - tiling the iteration space into 2x8 blocks that COINCIDE with pages keeps a full page
 *    resident before moving on → page switches collapse to ~(#pages - 1) = 3.
 * Distinguish page fault (physical frame absent) vs TLB miss (translation cache absent):
 * both shrink as the simultaneously-active working set shrinks. The aux 'page switch'
 * counter is the headline metric. */
window.POLY_SCENE = {
  id: '05-paging',
  title: '타일링과 페이징 / TLB',
  subtitle: 'Tiling for Paging & TLB — 반복 타일을 데이터 페이지에 정렬하기',
  intro:
    '타일링은 캐시 라인뿐 아니라 <b>가상 메모리 페이지</b>와 <b>TLB</b>에도 똑같이 작동한다. ' +
    '배열 <code>A</code>가 <b>8×8 row-major</b>로 누우면 연속한 <b>2개 행 = 16개 <code>f32</code> = 한 페이지</b>이고, ' +
    '배열 전체는 정확히 <b>4개 페이지</b>를 차지한다(<code>page = {r:2, c:8}</code>). ' +
    '반복 <code>(i,j)</code>가 <code>A[i][j]</code>를 건드릴 때, <b>접근 순서가 페이지 경계와 어긋나면</b> ' +
    '매 접근마다 다른 페이지로 건너뛰어 <b>page fault·TLB miss</b>가 폭증한다. ' +
    '폴리헤드럴 모델의 처방은 동일하다 — <b>반복 영역을 페이지에 맞춰 다시 분할</b>해 ' +
    '동시에 활성인 페이지 수(<b>working set</b>)를 최소화하는 것.',
  domain: { i: [0, 7], j: [0, 7] },
  axes: { x: 'j', y: 'i' },
  code: {
    before:
      'func.func @scale(%A: memref<8x8xf32>, %s: f32) {\n' +
      '  // row-major A: 연속 2개 행(16xf32) = 한 페이지, 총 4페이지\n' +
      '  affine.for %j = 0 to 8 {            // 바깥 = 열 (column-major 순회)\n' +
      '    affine.for %i = 0 to 8 {          // 안쪽 = 행 → 페이지를 가로질러 내려감\n' +
      '      %v = affine.load %A[%i, %j] : memref<8x8xf32>\n' +
      '      %r = arith.mulf %v, %s : f32\n' +
      '      affine.store %r, %A[%i, %j] : memref<8x8xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}',
    after:
      'func.func @scale_tiled(%A: memref<8x8xf32>, %s: f32) {\n' +
      '  // 타일 = 페이지: 한 타일(2x8) 안의 16xf32가 정확히 한 페이지\n' +
      '  affine.for %ii = 0 to 8 step 2 {              // 페이지(타일) 순회\n' +
      '    affine.for %i = #map(%ii) to min(%ii + 2, 8) {\n' +
      '      affine.for %j = 0 to 8 {                  // 페이지 안 16개를 모두 소진\n' +
      '        %v = affine.load %A[%i, %j] : memref<8x8xf32>\n' +
      '        %r = arith.mulf %v, %s : f32\n' +
      '        affine.store %r, %A[%i, %j] : memref<8x8xf32>\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}'
  },
  steps: [
    {
      title: '① 배열·페이지 구조',
      code: 'before', codeHi: [[1, 2]],
      showMatrix: false,
      color: { mode: 'tile', ti: 2, tj: 8 },
      legend: [
        { color: '#58d1ff', label: 'page 0 : A[0..1][·]' },
        { color: '#ffb454', label: 'page 1 : A[2..3][·]' },
        { color: '#7c8cff', label: 'page 2 : A[4..5][·]' },
        { color: '#5ce6a3', label: 'page 3 : A[6..7][·]' }
      ],
      aux: { type: 'memory', rows: 8, cols: 8, page: { r: 2, c: 8 }, order: 'rowmajor',
        title: 'A[8][8] — page = 2×8 (16xf32), 총 4 페이지',
        note: 'row-major 저장. 연속 2개 행 = 한 페이지. 같은 색 = 같은 페이지 = 같은 TLB 엔트리로 커버됨.' },
      caption:
        '<code>memref&lt;8x8xf32&gt;</code>는 row-major로 누워, <b>연속한 2개 행(16개 <code>f32</code>)이 한 페이지</b>를 ' +
        '채운다. 따라서 격자의 <b>가로 띠 하나가 한 페이지</b>(4색 = 4페이지)다. ' +
        '핵심 구분: <b>page fault</b>는 물리 프레임이 없을 때, <b>TLB miss</b>는 주소변환 캐시에 엔트리가 없을 때 발생한다 — ' +
        '둘 다 <b>동시에 활성인 페이지 수가 적을수록</b> 줄어든다. 아래 aux의 <b>페이지 전환 ≈ TLB miss</b> 카운터가 핵심 지표다.'
    },
    {
      title: '② 열 방향 접근 → 전환 폭증',
      code: 'before', codeHi: [[3, 4]],
      showMatrix: true, transform: [[0, 1], [1, 0]],
      matrixLabel: 'schedule θ (열 우선, j outer)', matrixVars: ['i', 'j'],
      axisLabels: { u: 'j  (시간 1순위 = 열)', v: 'i  (시간 2순위 = 행)' },
      color: { mode: 'tile', ti: 2, tj: 8 },
      play: { order: 'lexico', speedMs: 45 },
      aux: { type: 'memory', rows: 8, cols: 8, page: { r: 2, c: 8 }, order: 'colmajor',
        title: 'column-major 순회 — 페이지를 세로로 가로지름',
        note: '한 열을 내려가면 2행마다 다른 페이지로 점프 → 거의 매 접근이 페이지 전환. 작은 TLB는 매번 miss.' },
      caption:
        '스케줄 <code>θ(i,j)=(j,i)</code>(행렬 <code>[[0,1],[1,0]]</code>) — 바깥 루프가 <code>j</code>라 ' +
        '<b>한 열을 위에서 아래로</b> 훑는다. row-major 배열에서 열을 내려가면 <b>매 2행마다 다른 페이지</b>로 건너뛰므로, ' +
        '한 열(8접근) 동안 <b>4페이지를 모두 들락거린다</b>. 활성 페이지가 4개로 벌어져 ' +
        'TLB 엔트리가 작으면 <b>전환마다 miss</b> — 64접근에 <b>≈31회 전환</b>(거의 매 접근). ' +
        'working set이 페이지 4개 전체로 부풀어 page fault·TLB miss가 함께 폭증한다.'
    },
    {
      title: '③ 페이지 정렬 타일링 → 전환 급감',
      code: 'after', codeHi: [[2, 4]],
      showMatrix: false,
      color: { mode: 'tile', ti: 2, tj: 8 },
      tiles: { ti: 2, tj: 8 },
      play: { order: 'by-tile', ti: 2, tj: 8, speedMs: 38 },
      aux: { type: 'memory', rows: 8, cols: 8, page: { r: 2, c: 8 }, order: 'tiled', ti: 2, tj: 8,
        title: 'tiled 2×8 = 한 타일이 정확히 한 페이지',
        note: '한 페이지 16개를 모두 소진한 뒤에야 다음 페이지로. 전환은 페이지 경계에서만 ≈(페이지 수 − 1) = 3회.' },
      caption:
        '반복 영역을 <b>2×8 타일</b>로 다시 분할한다 — 한 타일(<code>ti:2, tj:8</code>)의 16개 점이 <b>정확히 한 페이지</b>에 대응한다. ' +
        'by-tile 순서는 <b>한 페이지를 완전히 소진</b>한 뒤에야 다음 페이지로 넘어가므로, 동시에 활성인 페이지는 <b>사실상 1개</b>다. ' +
        '페이지 전환은 <b>타일 경계에서만</b> 일어나 <b>64접근에 ≈3회</b>(페이지 수 − 1)로 급감 — ' +
        '열 접근의 <code>31</code>회 대비 <b>약 10×</b> 감소. 점 색(페이지 id)이 ①과 같지만, ' +
        '이제 <b>실행 순서가 색을 따라간다</b>는 점이 다르다.'
    },
    {
      title: '④ TLB reach / working set 정리',
      code: 'after', codeHi: [[2, 8]],
      showMatrix: false,
      color: { mode: 'tile', ti: 2, tj: 8 },
      tiles: { ti: 2, tj: 8 },
      aux: { type: 'memory', rows: 8, cols: 8, page: { r: 2, c: 8 }, order: 'tiled', ti: 2, tj: 8,
        title: 'TLB reach = (TLB 엔트리 수) × (페이지 크기)',
        note: '타일 working set이 TLB reach 안에 들어가면 정상 상태에서 TLB miss는 cold(첫 접근)만 남는다.' },
      caption:
        '결과 IR: 바깥 <code>affine.for %ii = 0 to 8 step 2</code>가 <b>페이지(=타일) 원점</b>을 훑고, ' +
        '안쪽 <code>%i ... to min(%ii + 2, 8)</code> · <code>%j</code>가 <b>그 한 페이지를 모두 소진</b>한다 ' +
        '(<code>affine.min</code>으로 가장자리 타일 처리). ' +
        '<b>활성 페이지 수 = TLB가 커버해야 할 엔트리 수</b>이므로, 핵심은 ' +
        '<b>타일을 TLB reach</b>(<code>엔트리 수 × 페이지 크기</code>)<b>에 맞추는 것</b>이다 — ' +
        '타일 working set이 reach 안에 들면 정상 상태의 TLB miss는 <b>cold miss(첫 접근)만</b> 남고, ' +
        '같은 원리로 page fault도 working set만큼만 발생한다. ' +
        '폴리헤드럴 변환 하나(<b>영역 재분할</b>)가 캐시·TLB·페이징의 <b>지역성을 한꺼번에</b> 잡는다.'
    }
  ]
};
