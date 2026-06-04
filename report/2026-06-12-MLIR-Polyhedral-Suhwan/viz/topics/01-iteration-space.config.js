/* Topic 01 — Iteration Domain & Schedule (hand-authored reference scene). */
window.POLY_SCENE = {
  id: '01-iteration-space',
  title: '반복 공간과 스케줄',
  subtitle: 'Iteration Domain & Schedule — 폴리헤드럴 모델의 세 재료',
  intro:
    '폴리헤드럴 모델은 루프 중첩을 <b>세 가지 affine 객체</b>로 본다. ' +
    '① <b>반복 영역(iteration domain)</b> — 루프 인덱스가 만족하는 부등식들이 정의하는 정수 다면체 <code>Z²</code>의 점 집합. ' +
    '② <b>스케줄(schedule) θ</b> — 각 반복 인스턴스에 논리적 시간(timestamp)을 주는 affine 사상. 사실상 <b>변환행렬</b>이다. ' +
    '③ <b>접근 함수(access function)</b> — 반복 <code>(i,j)</code>가 건드리는 메모리 위치를 주는 affine 사상. ' +
    '뒤이은 모든 변환(교환·타일·스큐·병렬·벡터화)은 결국 <b>이 영역을 다시 쪼개거나 θ를 바꾸는 것</b>일 뿐이다.',
  domain: { i: [0, 6], j: [0, 6] },
  axes: { x: 'j', y: 'i' },
  code: {
    before:
      'func.func @scale(%A: memref<7x7xf32>, %s: f32) {\n' +
      '  affine.for %i = 0 to 7 {            // 바깥 루프 (i)\n' +
      '    affine.for %j = 0 to 7 {          // 안쪽 루프 (j)\n' +
      '      %v = affine.load %A[%i, %j] : memref<7x7xf32>\n' +
      '      %r = arith.mulf %v, %s : f32\n' +
      '      affine.store %r, %A[%i, %j] : memref<7x7xf32>\n' +
      '    }\n' +
      '  }\n' +
      '  return\n' +
      '}'
  },
  steps: [
    {
      title: '① 반복 영역',
      code: 'before', codeHi: [[2, 3]],
      showMatrix: false,
      color: { mode: 'none' },
      caption:
        '두 <code>affine.for</code>의 경계 <code>0 ≤ i,j ≤ 6</code>가 정의하는 <b>정수 다면체</b>. ' +
        '각 점 하나가 루프 본문의 <b>한 번의 실행 인스턴스</b> <code>S(i,j)</code>다. ' +
        '여기서는 49개 인스턴스가 격자를 이룬다.'
    },
    {
      title: '② 스케줄 θ (lexicographic)',
      code: 'before', codeHi: [[2, 3]],
      showMatrix: true, transform: [[1, 0], [0, 1]],
      matrixLabel: 'schedule θ', matrixVars: ['i', 'j'],
      axisLabels: { u: 'i  (시간 1순위)', v: 'j  (시간 2순위)' },
      play: { order: 'lexico', speedMs: 55 },
      caption:
        '기본 스케줄 <code>θ(i,j) = (i, j)</code> — 항등 행렬. 사전식(lexicographic) 순서로 ' +
        '<b>한 번에 한 점씩</b> 실행된다(소스 코드 순서 그대로). θ의 첫 좌표 <code>i</code>가 시간의 1순위라 ' +
        '한 행을 다 채운 뒤 다음 행으로 내려간다.'
    },
    {
      title: '③ 접근 함수',
      code: 'before', codeHi: [[4, 4], [6, 6]],
      showMatrix: false,
      color: { mode: 'expr', by: 'i' },
      legend: [{ color: '#58d1ff', label: 'A[i][j] 읽고-쓰는 점' }],
      caption:
        '<code>affine.load/store %A[%i, %j]</code>의 인덱스가 <b>접근 함수</b> ' +
        '<code>f(i,j) = (i, j)</code>다. 반복 영역 × 스케줄 × 접근 함수 — 이 셋이 affine이면 ' +
        '의존성·재사용·병렬성을 <b>정확히 계산</b>할 수 있다. 여기선 한 점이 자기 자신만 건드려 ' +
        'loop-carried 의존성이 없다(→ 6번 주제).'
    },
    {
      title: '④ 변환의 무대',
      code: 'before',
      showMatrix: false,
      color: { mode: 'wavefront', by: 'i+j' },
      caption:
        '같은 영역을 <b>대각선(<code>i+j</code> 일정)</b>으로 색칠해 보면, 스케줄을 바꾸면 다른 순서·다른 ' +
        '병렬성이 가능함이 보인다. 다음 주제들은 모두 <b>이 49점 무대 위에서</b> θ를 바꾸거나(② 교환, ⑦ 스큐) ' +
        '영역을 타일·레인·코어로 <b>다시 분할</b>(④⑤⑧⑨)하는 이야기다.'
    }
  ]
};
