# MLIR · Polyhedral / Affine (2026-06-12)

심화 세미나의 **사실 종합판** — 개인 의견을 제외하고 사실만 정리했다. 두 주제로 구성된다.

- **주제 1 · MLIR** — 개념(Operation·Dialect·Region), Chris Lattner의 설계 철학(Parsimony·Traceability·Progressivity), progressive lowering 파이프라인(linalg → affine → scf → LLVM), StableHLO 진입, custom dialect로의 졸업.
- **주제 2 · Polyhedral Model & Affine** — 루프를 수학으로: 반복 공간(정수 다면체)·의존성·스케줄 $\theta$, 그리고 그 MLIR 구현인 affine dialect의 변환(타일링·융합·스큐잉 등).

두 주제는 `affine` dialect에서 만나고, ISA 경계 — 어느 추상 단계를 ISA로 삼느냐가 컴파일러와 하드웨어의 책임을 가르는지 — 로 종합된다.

## 읽기

- **`site/index.html`** — 멀티페이지 인터랙티브 사이트. 챕터별 페이지가 그래프로 연결되고, 폴리헤드럴 변환 애니메이션이 인라인으로 들어가며, 수식은 KaTeX로 렌더된다. 자체완결 — 브라우저로 바로 열린다.
- **`seminar-2026-06-12.md`** — 같은 본문의 단일 문서판. 수식은 LaTeX(`$…$` / `$$…$$`).

## 구성

- 본문 8개 챕터 + 심화(부록) 2편: **SCoP**(`site/aside-scop.html`), **Farkas Lemma**(`site/aside-farkas.html`).
- 폴리헤드럴 변환 인터랙티브 애니메이션 10편 — `viz/`.

## 기반 논문

- [1] *MLIR: A Compiler Infrastructure for the End of Moore's Law*, arXiv:2002.11054, 2020.
- [2] *MLIR: Scaling Compiler Infrastructure for Domain Specific Computation*, IEEE/ACM CGO 2021.
