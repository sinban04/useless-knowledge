/* Topic 02 — Loop Interchange (hand-authored).
 * Kernel: B[i][j] = A[i][j], row-major memref<8x8xf32>.
 * No loop-carried dependence → the nest is freely permutable; interchange is a
 * pure schedule permutation θ = [[0,1],[1,0]] (det = -1, unimodular).
 * BEFORE (j outer, i inner): A[i][j] swept column-wise → stride 8 (= row length),
 * every access lands on a new cache line. AFTER (i outer, j inner): row-wise,
 * unit stride → one cache line serves a whole inner sweep.
 * Engine convention: vertical axis u = schedule's 1st coordinate (outer loop). */
window.POLY_SCENE = {
  id: '02-interchange',
  title: '루프 순서 교환',
  subtitle: 'Loop Interchange — 스케줄의 치환으로 stride를 줄이고 캐시라인을 재사용',
  intro:
    'row-major <code>memref&lt;8x8xf32&gt;</code> 위의 단순 복사 <code>B[i][j] = A[i][j]</code>를 보자. ' +
    '본문은 자기 인스턴스만 읽고 쓰므로 <b>loop-carried 의존성이 없고</b>, 두 루프는 <b>자유롭게 교환 가능</b>하다. ' +
    '교환은 스케줄 행렬에 <b>치환(permutation) <code>θ = [[0,1],[1,0]]</code></b>을 곱하는 것 — 반복 점 집합은 그대로 두고 ' +
    '<b>방문 순서만</b> 바꾼다(det = -1인 unimodular 변환). ' +
    '문제는 메모리 stride다. row-major 저장에서 <code>A[i][j]</code>의 선형 주소는 <code>8·i + j</code>이므로, ' +
    '<b>안쪽 루프가 <code>i</code>면 stride 8</b>(행 길이)로 열 방향을 뛰어 매 접근이 새 캐시라인을 건드린다. ' +
    '안쪽을 <code>j</code>로 바꾸면 <b>unit stride</b>가 되어 한 캐시라인이 안쪽 순회 전체를 덮는다.',
  domain: { i: [0, 7], j: [0, 7] },
  axes: { x: 'j', y: 'i' },
  code: {
    before:
      'func.func @copy(%A: memref<8x8xf32>, %B: memref<8x8xf32>) {\n' +
      '  affine.for %j = 0 to 8 {              // 바깥 루프 = j  (schedule 1순위)\n' +
      '    affine.for %i = 0 to 8 {            // 안쪽 루프 = i\n' +
      '      %v = affine.load %A[%i, %j] : memref<8x8xf32>   // 주소 8*i + j → stride 8\n' +
      '      affine.store %v, %B[%i, %j] : memref<8x8xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}',
    after:
      'func.func @copy(%A: memref<8x8xf32>, %B: memref<8x8xf32>) {\n' +
      '  affine.for %i = 0 to 8 {              // 바깥 루프 = i  (schedule 1순위)\n' +
      '    affine.for %j = 0 to 8 {            // 안쪽 루프 = j\n' +
      '      %v = affine.load %A[%i, %j] : memref<8x8xf32>   // 주소 8*i + j → unit stride\n' +
      '      affine.store %v, %B[%i, %j] : memref<8x8xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}'
  },
  steps: [
    {
      title: '① 열 방향 순회 (나쁨)',
      code: 'before', codeHi: [[2, 3]],
      showMatrix: true, transform: [[0, 1], [1, 0]],
      matrixLabel: 'schedule θ (j outer)', matrixVars: ['i', 'j'],
      axisLabels: { u: 'j (1순위)', v: 'i' },
      color: { mode: 'none' },
      play: { order: 'lexico', speedMs: 38 },
      caption:
        '바깥 루프가 <code>%j</code>, 안쪽이 <code>%i</code>인 초기 스케줄. ' +
        '세로축 <code>u = j</code>가 시간 1순위라, 사전식 순회는 <b>한 열(<code>j</code> 고정)을 따라 <code>i</code>를 내려가며</b> 진행한다. ' +
        '즉 <code>A</code>를 <b>열 방향</b>으로 읽는다 — row-major 배열에서는 최악의 패턴이다.'
    },
    {
      title: '② stride 8 = 캐시라인 매번 교체',
      code: 'before', codeHi: [[4, 5]],
      showMatrix: true, transform: [[0, 1], [1, 0]],
      matrixLabel: 'schedule θ (j outer)', matrixVars: ['i', 'j'],
      axisLabels: { u: 'j (1순위)', v: 'i' },
      color: { mode: 'expr', by: 'j' },
      legend: [{ color: '#58d1ff', label: '같은 열 = 같은 stride-8 사슬' }],
      play: { order: 'lexico', speedMs: 30 },
      aux: { type: 'memory', rows: 8, cols: 8, page: { r: 1, c: 8 }, order: 'colmajor',
        note: '열 방향: 캐시라인 매번 교체' },
      caption:
        'row-major에서 한 캐시라인 = <b>배열의 한 행</b>(여기선 page <code>1×8</code>으로 모델링). ' +
        '안쪽 <code>%i</code>가 1 늘 때마다 주소는 <code>8</code>씩 뛰므로(<b>stride 8</b>), 연속 접근이 <b>매번 다른 행 = 다른 캐시라인</b>에 떨어진다. ' +
        '아래 패널: 열 방향 순서는 접근마다 페이지를 갈아타 <b>TLB miss·캐시라인 교체가 64회 가까이</b> 누적된다.'
    },
    {
      title: '③ 순서 교환 = 치환행렬',
      code: 'after', codeHi: [[2, 3]],
      showMatrix: true, transform: [[1, 0], [0, 1]],
      matrixLabel: 'θ′ = P·θ (교환 후)', matrixVars: ['i', 'j'],
      axisLabels: { u: 'i (1순위)', v: 'j' },
      color: { mode: 'none' },
      caption:
        '의존성이 없으니 <b>치환행렬 <code>P = [[0,1],[1,0]]</code></b>를 곱해 두 루프를 맞바꿔도 결과는 동일하다. ' +
        '스케줄이 <code>(j,i)</code>에서 <code>(i,j)</code>로 돌아오며 격자가 <b>전치(transpose)되어</b> 세로축이 다시 <code>i</code>가 된다. ' +
        '점 집합은 보존되고(unimodular, det = ±1) <b>오직 순회 순서만</b> 바뀐 것 — 이것이 interchange의 본질이다.'
    },
    {
      title: '④ 행 방향 순회 (좋음) + 결과 IR',
      code: 'after', codeHi: [[3, 4]],
      showMatrix: true, transform: [[1, 0], [0, 1]],
      matrixLabel: 'schedule θ (i outer)', matrixVars: ['i', 'j'],
      axisLabels: { u: 'i (1순위)', v: 'j' },
      color: { mode: 'expr', by: 'i' },
      legend: [{ color: '#58d1ff', label: '같은 행 = 한 캐시라인 재사용' }],
      play: { order: 'lexico', speedMs: 30 },
      aux: { type: 'memory', rows: 8, cols: 8, page: { r: 1, c: 8 }, order: 'rowmajor',
        note: '행 방향: unit stride, 캐시라인 재사용' },
      caption:
        '교환 후 바깥 <code>%i</code>, 안쪽 <code>%j</code> — 사전식 순회가 <b>한 행을 따라 <code>j</code>를 훑은 뒤</b> 다음 행으로 내려간다. ' +
        '안쪽 <code>%j</code>가 1 늘 때 주소는 <code>1</code>씩(<b>unit stride</b>) 증가하므로 한 번 적재한 캐시라인(한 행)이 ' +
        '안쪽 8회 접근을 모두 덮는다. 아래 패널: 페이지 전환이 <b>행마다 1회(총 7회)</b>로 급감 — ' +
        '<b>같은 본문·같은 데이터, 스케줄 치환만으로 지역성을 회복</b>했다.'
    }
  ]
};
