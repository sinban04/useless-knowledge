# poly-mlir-viz — affine-MLIR 폴리헤드럴 모델 시각화

루프와 iteration space가 **폴리헤드럴 모델**(affine MLIR)에서 어떻게 변형되는지 — 스케줄 행렬 θ를
바꾸거나 반복 영역을 다시 분할하는 것만으로 **없던 병렬성이 생기고**, SIMD·페이징·파이프라인에 맞춰
**타일링**되고 **코어에 분배**되는 과정을 단계별 애니메이션으로 보여주는 인터랙티브 사이트.

## 보는 법

브라우저로 **`index.html`** 을 그냥 연다 (file:// 동작, 서버·빌드·의존성 없음).
각 주제 페이지: 좌측 격자(iteration space) + 우측 MLIR + 스케줄 행렬 θ + 보조 패널.
**재생 ▶** 으로 자동 재생, 단계 칩으로 한 스텝씩, 속도 슬라이더로 조절.

## 10편

| # | 주제 | 핵심 |
|---|---|---|
| 01 | 반복 공간과 스케줄 | domain · schedule θ · access function |
| 02 | 루프 순서 교환 | 치환행렬 → stride/지역성 |
| 03 | 루프 융합 | (stage,index) 재스케줄 → 즉시 재사용 |
| 04 | 루프 타일링 | strip-mine + interchange → 캐시 워킹셋 |
| 05 | 타일링과 페이징/TLB | 페이지 정렬 → page fault·TLB miss 감소 |
| 06 | 의존성 분석과 병렬화 | dependence 없음 → `affine.parallel` |
| 07 | 스큐잉과 웨이브프론트 | θ=[[1,1],[0,1]] → **없던 병렬성** ★ |
| 08 | SIMD 벡터화 | VL-wide 벡터 op = VL개 반복 |
| 09 | 멀티코어 분배 | block/cyclic → makespan·speedup |
| 10 | 소프트웨어 파이프라이닝 | II 간격 발사 → prologue/steady/epilogue |

## 구조

```
poly-mlir-viz/
├── index.html                 # 랜딩(폴리헤드럴 primer + 10개 카드). topics.js로 카드 생성
├── assets/
│   ├── poly.js                # 선언적 애니메이션 엔진 (scene 데이터 → 렌더)
│   ├── poly.css               # 다크 테마 + 레이아웃
│   └── shell.js               # 모든 토픽 HTML 공통 chrome(헤더/nav) + mount
├── topics/
│   ├── topics.js              # 10편 순서·메타 레지스트리 (index·nav가 사용)
│   ├── NN-slug.config.js      # 주제별 scene 데이터 (window.POLY_SCENE), 순수 데이터
│   └── NN-slug.html           # 거의 동일한 shell — config.js src 한 줄만 다름
├── API.md                     # scene config 작성 규칙 (좌표/행렬 규약, 필드, aux 타입)
├── selftest.cjs               # 의존성 없는 headless 검증 (DOM stub로 엔진+모든 scene 구동)
└── screenshot.mjs             # (선택) puppeteer로 실제 렌더 PNG 캡처 — `npm i puppeteer` 필요
```

## 검증

```bash
node selftest.cjs                              # 전체: 엔진 + 모든 토픽 (geometry 검사 포함)
node selftest.cjs topics/07-skewing.config.js  # 한 파일만
```
`ALL GREEN` + `errors: 0` 이면 구조·스키마·런타임·프레이밍이 정상. (브라우저 불필요.)

## 새 주제 추가

1. `topics/topics.js` 에 한 줄 등록.
2. `topics/NN-slug.config.js` 작성 — `API.md` 규약을 따른다.
3. `topics/01-iteration-space.html` 을 복사해 config src 한 줄만 교체.
4. `node selftest.cjs topics/NN-slug.config.js` 로 검증.

## 좌표·행렬 규약 (요약)

점 = 반복 `(i,j)`. step의 `transform`은 2×2 **스케줄 행렬 θ**: `θ·(i,j)=(u,v)`,
`u`=세로(아래로), `v`=가로(오른쪽). 항등=`i` 세로/`j` 가로. 스큐 `[[1,1],[0,1]]`→`u=i+j`(=시간 t).
unimodular(det=±1)면 반복 점이 보존된다. 자세한 내용은 `API.md`.
