# 8. 종합 — 한계, ISA 경계, 그리고 컴파일러 vs 하드웨어

[← 이전](07_affine_transforms.md) | [목차](README.md)

---

## 종합 — MLIR의 정직한 한계, 그리고 ISA 경계라는 책임 분담선

지금까지 우리는 MLIR(Multi-Level Intermediate Representation; *컴파일러가 코드를 변환하기 위해 내부에서 쓰는 중간 표현*을 여러 추상 레벨로 쌓아 올린 인프라)의 세 원칙(Parsimony·Traceability·Progressivity)과 progressive lowering(고수준 의미를 한 번에 버리지 않고 *단계적으로* 낮은 추상 레벨로 내리는 변환)을 따라왔다. 마지막으로, 이 시스템이 *정직하게 인정하는 약점*을 정리하고, **ISA 경계를 어디에 긋느냐가 컴파일러와 하드웨어의 책임을 어떻게 가르는지**로 마무리한다.

### 1. MLIR은 자기 한계를 숨기지 않는다

좋은 시스템 논문의 미덕은 "무엇이 안 되는지"를 솔직하게 적는 것이다. MLIR 논문은 한계를 §II, §V.F, §V.G, §VII에 흩어 두었는데 [2], 이를 한자리에 모으면 다음과 같다.

| # | 한계 | 핵심 |
|---|------|------|
| 1 | 추상화 설계가 아직 "art"다 | "*the 'art' of compiler IR and abstraction design is not well understood*" [2 §V.F] — 좋은 dialect의 판단 기준이 미정, 과학적 가이드라인 없음 |
| 2 | Dialect 폭발(proliferation) 위험 | 누구나 dialect를 만들 수 있다 = 비호환 dialect도 만들 수 있다. fragmentation이 *한 단계 위*에서 재발 가능, "*순수 기술적 해결책은 없다(unlikely to be a purely technical solution)*" [2 §II.B] |
| 3 | Pass 순서·스케줄링 방법론 부재 | 추상 레벨이 여럿이라 패스 순서 공간이 폭발. 어떤 순서가 optimal인지 체계적 방법 없음 — 대부분 heuristic |
| 4 | 형식 의미·증명 부재 | dialect 간 conversion의 정확성은 *개발자 책임*. verification *인프라*는 주지만 증명 자동화는 미제공 |
| 5 | Compile-time / memory 비용 | 여러 추상 레벨을 동시에 유지하면 메모리·변환 비용 발생 (IR copying 감소로 일부 상쇄된다는 반박은 있음) |
| 6 | JIT · 정밀 GC 미약 | 현재는 AOT(Ahead-of-Time) 중심. JIT·precise garbage collection 지원은 약함 [2 §V.G] |
| 7 | Parser·AST 없음 | "*MLIR currently does not have a general parser generator, no AST construction or modeling functionality*" [2 §VI] — 소스→AST 프론트엔드는 별도 도구 몫 |
| 8 | Out-of-tree dialect API 불안정 | mainline이 바뀌면 외부 dialect가 따라잡아야 함. API가 fairly volatile |

여기서 청중(하드웨어·시스템 쪽)이 직관적으로 받아들일 비유 하나. **dialect 폭발은 ISA 파편화와 똑같은 병이다.** 모두가 자기 명령어 확장을 마구 추가하면, 결국 "공통 ISA"라는 약속이 깨지고 툴체인이 분열한다. MLIR이 컴파일러 파편화를 풀려고 dialect라는 *확장 메커니즘*을 줬는데, 그 메커니즘 자체가 *남용되면* 같은 파편화가 한 층 위에서 다시 생긴다. 저자들은 이걸 알면서도 "기술로는 못 막는다, 거버넌스·커뮤니티 표준화의 영역이다"라고 적는다 — 이 정직함이 이 논문을 예외적으로 신뢰할 만한 시스템 논문으로 만든다 [2 §II.B].

### 2. 그래서 MLIR은 "완성품"이 아니라 "연구 프로그램의 시작"

이 한계 목록의 결론은 의외로 긍정적이다. MLIR은 자기를 *도구*가 아니라 **새 연구 프로그램의 개시**로 자리매김한다.

> "*MLIR catalyzes new areas of research, as well as new approaches to teaching the art of compiler and IR design.*" [2 §VII]

즉 "우리가 모든 추상화를 정답으로 정해 줬다"가 아니라 "*무엇이 좋은 추상화인지 묻는 공통의 장*을 깔았으니, 다음 세대가 그 위에서 답을 찾아라"는 위임이다. 한계 #1·#2가 미해결로 남는 것도 이 정체성과 일치한다 — 답을 다 줬다면 연구 프로그램이 아니다.

### 3. ISA 경계 = 컴파일러와 하드웨어의 책임 분담선

S4에서 제시했던 baseline 파이프라인을 다시 소환한다.

```
model (ONNX / PyTorch)
  → XLA / StableHLO        (프레임워크 그래프 수준)
  → linalg                 (구조화된 텐서 연산: linalg.matmul 등)
  → affine                 (명시적 loop nest: affine.for, affine.load/store)
  → scf / 기본 MLIR        (구조적 제어 흐름)
  → LLVM / backend MLIR    (저수준, 타겟 명령에 근접)
```

용어 정리: ISA(Instruction Set Architecture)는 *하드웨어가 직접 해석하는 명령어 계약*, 즉 소프트웨어와 하드웨어가 만나는 약속된 경계다. progressive lowering이 만드는 이 단계들은 각각 *서로 다른 추상 높이*를 가진다 — 위로 갈수록 "무엇을 계산하는가"(matmul 한 방), 아래로 갈수록 "어떻게 계산하는가"(루프·주소·레지스터)에 가깝다.

progressive lowering의 각 단계(linalg → affine → scf → LLVM)는 ISA 경계를 그을 수 있는 후보 지점들이다. 경계를 *높은 쪽(고수준)* 에 그으면 — 예컨대 linalg.matmul 수준을 하드웨어가 직접 받으면 — 하드웨어가 행렬곱의 의미를 통째로 처리해야 해 복잡해지는 대신 컴파일러가 풀 일은 줄고, *낮은 쪽(저수준)* 에 그으면 — load/store/MAC 수준만 받으면 — 하드웨어는 단순해지지만 컴파일러가 타일링·스케줄링·주소 계산까지 풀어 내려야 한다. 즉 어느 추상 단계를 ISA로 삼느냐가 컴파일러와 하드웨어의 책임 경계를 가른다. 공개된 가속기들도 경계 높이가 제각각이다 — Gemmini는 RoCC custom 명령으로 GEMM 타일을 비교적 높은 수준에서 받고, RISC-V 기반 Snitch+RedMule은 더 일반적인 명령 수준에서 컴파일러가 많이 풀어 내려야 한다.

### 4. 마무리 — 왜 MLIR인가, 그리고 각자에게

한 문장으로: **MLIR이 중요한 이유는 "하나의 진정한 IR"을 강요하지 않으면서도 "하나의 진정한 IR 인프라"를 제공해 [1][2], 소프트웨어와 하드웨어의 경계를 *고정된 한 점*이 아니라 *설계자가 선택하는 눈금*으로 바꿔 놓았기 때문이다.**

각자에게 남기는 한 줄. 컴퓨터 아키텍트에게 — progressive lowering 단계는 당신이 ISA 경계를 시험해 볼 수 있는 눈금자다. 하드웨어 개발자에게 — 경계를 높이면 HW가 무거워지고 낮추면 컴파일러가 무거워진다, 그 트레이드오프를 의식하고 그어라. 서버레벨 소프트웨어 엔지니어에게 — dialect는 곧 ISA 파편화와 같은 위험을 안고 있으니, 공통 표준(linalg, affine 등)을 따르는 것이 장기적으로 당신의 툴체인을 지킨다 [2].

---

[← 이전](07_affine_transforms.md) | [목차](README.md)
