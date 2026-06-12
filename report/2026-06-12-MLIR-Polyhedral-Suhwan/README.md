# MLIR · Polyhedral / Affine (2026-06-12)

심화 세미나의 **사실 종합판** — 개인 의견을 제외하고 사실만 정리했다. 두 주제 + 에필로그로 구성된다.

- **주제 1 · MLIR** — 개념(Operation·Dialect·Region), Chris Lattner의 설계 철학(Parsimony·Traceability·Progressivity), progressive lowering 파이프라인(linalg → affine → scf → LLVM), StableHLO 진입, custom dialect로의 졸업.
- **주제 2 · Polyhedral Model & Affine** — 루프를 수학으로: 반복 공간(정수 다면체)·의존성·스케줄 $\theta$, 그리고 그 MLIR 구현인 affine dialect의 변환(타일링·융합·스큐잉 등).

두 주제는 `affine` dialect에서 만나고, ISA 경계 — 어느 추상 단계를 ISA로 삼느냐가 컴파일러와 하드웨어의 책임을 가르는지 — 로 종합된다. 종합 뒤에는 **에필로그** — Chris Lattner의 2025년 블로그 시리즈 *Democratizing AI Compute*(CUDA 해부, 대안들의 실패사, MLIR 자기 채점)를 본문의 개념 위에 얹어 읽는 후일담 — 가 붙는다.

## 읽기

- **`site/index.html`** — 멀티페이지 인터랙티브 사이트. 챕터별 페이지가 그래프로 연결되고, 폴리헤드럴 변환 애니메이션이 인라인으로 들어가며, 수식은 KaTeX로 렌더된다. 자체완결 — 브라우저로 바로 열린다.
- **`seminar-2026-06-12.md`** — 같은 본문의 단일 문서판. 수식은 LaTeX(`$…$` / `$$…$$`).

## 구성

- 본문 8개 챕터 + 에필로그 1편 + 심화(부록) 2편: **SCoP**(`site/aside-scop.html`), **Farkas Lemma**(`site/aside-farkas.html`).
- 폴리헤드럴 변환 인터랙티브 애니메이션 10편 — `viz/`.

## 챕터별 문서

단일 문서(`seminar-2026-06-12.md`)를 챕터별로 나눈 판. 본문은 동일하다.

1. [도입](01_intro.md)
2. [MLIR 탄생 배경](02_background.md)
3. [MLIR 핵심 개념](03_concepts.md)
4. [설계 철학 (세 원칙)](04_design_philosophy.md)
5. [Progressive Lowering](05_progressive_lowering.md)
6. [Polyhedral 모델](06_polyhedral_model.md)
7. [Affine Dialect 변환](07_affine_transforms.md)
8. [종합 (ISA 경계)](08_synthesis.md)
9. [에필로그 — 창시자의 2025년 회고: Democratizing AI Compute](09_epilogue.md)
- [참고문헌 (References)](10_references.md) — 전 챕터 공유 `[1]`–`[22]`

## 별도 자료 (세미나 본문과 독립)

- [**Democratizing AI Compute — 시리즈 정리**](democratizing-ai-compute-series.md) — Lattner의 11편 시리즈를 세미나 본문과 별개로 그 자체만 정리한 자기완결 문서. 세 축(**기술의 흐름 / 기술의 실패와 교훈 / 기술의 의미**)으로 구성.

## 기반 논문

- [1] *MLIR: A Compiler Infrastructure for the End of Moore's Law*, arXiv:2002.11054, 2020.
- [2] *MLIR: Scaling Compiler Infrastructure for Domain Specific Computation*, IEEE/ACM CGO 2021.
- [11]–[21] C. Lattner, *Democratizing AI Compute* 시리즈 (Parts 1–11), Modular blog, 2025. — 에필로그의 기반 자료 (⚠️ 기술 블로그·이해당사자, 단 MLIR 회고는 창시자 1차 사료)
