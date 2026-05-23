# AI Compiler 세미나

> 컴파일러 기초를 아는 사람들을 위한 AI Compiler 입문  
> 약 20~30분 분량

---

## 목차

### [1. 컴파일러에서 AI Compiler로](01_from_compiler_to_ai_compiler.md)
- 전통 컴파일러 3줄 요약
- AI 워크로드의 등장과 새로운 N×M 문제
- 전통 컴파일러의 한계

### [2. MLIR — AI Compiler의 게임 체인저](02_mlir.md)
- MLIR이 해결하는 문제
- Dialect 시스템과 Progressive Lowering
- 실제 Lowering 예시: `linalg.matmul` → LLVM IR

### [3. 주요 AI Compiler 도구들](03_ai_compiler_tools.md)
- XLA / StableHLO
- torch.compile (TorchDynamo + Inductor)
- TVM
- Triton
- IREE

### [4. torch.compile 깊이 보기](04_torch_compile_deep_dive.md)
- 동적 그래프 vs 정적 그래프, 그리고 두 장점을 모두
- TorchDynamo → FX Graph → AOT Autograd → Inductor
- Graph Break와 실전 팁

### [5. 정리 및 Q&A](05_summary.md)
- AI Compiler 생태계 한눈에 보기
- 더 알아보기 좋은 자료들

### [Appendix A: MLIR 주요 Dialect 소개](06_appendix_a_mlir_dialects.md)
- Affine Dialect (철학, Ops, Pass, Affine Map)
- SCF Dialect (affine vs scf, iter_args)
- Tensor vs MemRef (Bufferization)
- Arith / Math Dialect

### [Appendix B: MLIR 자체 지원 기능](07_appendix_b_mlir_builtin.md)
- Built-in Passes (CSE, DCE, Canonicalize, Inlining, LICM, SCCP)
- 표준 최적화 파이프라인 패턴

### [Appendix C: 추가로 많이 활용되는 MLIR 기능들](08_appendix_c_mlir_extras.md)
- Linalg, Vector, Func, GPU, Transform Dialect
- 자주 사용하는 유틸리티 Pass
- mlir-opt 실전 사용법

### [Appendix D: 폴리헤드럴 모델 상세](09_appendix_d_polyhedral.md)
- 3가지 핵심 요소 (Iteration Domain, Dependence, Schedule)
- 변환 행렬로 표현하는 루프 변환 (Identity, Interchange, Skewing, Tiling)
- Farkas Lemma — 무한을 유한으로
- Loop Skewing과 Wavefront 병렬화
- MLIR Affine Dialect과의 관계
- 역사와 주요 도구
