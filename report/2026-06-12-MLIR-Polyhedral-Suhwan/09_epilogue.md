# 9. 에필로그 — 창시자의 2025년 회고: Democratizing AI Compute

[← 이전](08_synthesis.md) | [목차](README.md) | [다음 →](10_references.md)

---

## 같은 사람이 쓴 두 개의 텍스트

이 세미나의 본문은 2020–21년의 두 MLIR 논문 [1][2]을 기반으로 했다. 그 1저자 Chris Lattner는 2022년 Modular를 공동 창업했고, 2025년 1월부터 6월까지 **"Democratizing AI Compute"** 라는 11편짜리 블로그 시리즈 [11]–[21]를 연재했다 — CUDA란 무엇이고 왜 이겼는지, OpenCL·TVM·XLA·Triton 같은 대안들이 왜 번번이 실패했는지, 그리고 **자기가 만든 MLIR이 어떻게 됐는지**를 직접 채점하는 글이다.

논문이 *원칙*(무엇을, 왜 만들려 했는가)이라면 시리즈는 *채점표*(그래서 5년 뒤 어떻게 됐는가)다. 특히 8편 [18]은 시스템의 창시자가 자기 시스템의 성공과 실패를 공개적으로 평가하는, 컴파일러 역사에서 흔치 않은 1차 회고 사료다. 4장에서 우리는 "이 논문은 원칙의 한계까지 함께 문서화한다"는 정직함을 봤다 — 이 에필로그는 그 정직함의 5년 후 속편이다.

> ⚠️ **출처 신뢰도에 관해.** 이 시리즈는 동료심사 논문이 아니라 기술 블로그이고, 저자는 Modular라는 이해당사자다. 시장·경쟁사에 대한 *주장*은 그 관점을 감안해 읽어야 한다(특히 [20][21]의 자사 서술). 다만 MLIR의 탄생 경위와 설계 의도에 대한 회고는 창시자 본인의 증언이라는 점에서 1차 사료 성격을 가진다. 본 장의 인용은 사실 서술과 저자 주장을 구분해 표기한다.

시리즈의 6개 질문이 곧 목차다 [11]: ① CUDA란 정확히 무엇인가 ② 왜 성공했는가 ③ 그래서 좋은 물건인가 ④ 다른 하드웨어 제조사는 왜 비슷한 AI 소프트웨어를 못 만드는가 ⑤ Triton·OpenCL 같은 기존 기술은 왜 이 문제를 못 풀었는가 ⑥ 산업은 어떻게 전진해야 하는가.

## CUDA의 실체 — 언어가 아니라 계층 플랫폼

시리즈의 첫 번째 교정은 용어부터다. CUDA는 프로그래밍 언어도, 프레임워크도 아니다 [12]:

> "*[CUDA] is a huge, layered Platform — a collection of technologies, software libraries, and low-level optimizations that together form a massive parallel computing ecosystem.*" [12]

그 계층을 해부하면 — 맨 아래 NVIDIA **driver**, 그 위 **PTX**(가상 어셈블리; 컴파일된 커널이 내려가는 NVIDIA GPU의 최하위 지원 인터페이스), 그 위 **CUDA C++**(병렬 프로그래밍 모델), 그 위 **cuDNN·cuBLAS·cuFFT**(closed-source 고성능 라이브러리), 맨 위 **TensorRT-LLM·Triton Serving**(턴키 수직 솔루션). Lattner는 "The CUDA Platform"이라 부르기를 권한다 — Java 생태계나 운영체제에 가까운 규모라서다 [12].

이 그림을 본 세미나의 눈으로 다시 보자. **이것은 산업이 손으로 굳혀 놓은 progressive lowering이다.** 프레임워크 그래프 → 라이브러리 호출 → C++ 커널 → 가상 ISA → 드라이버라는 추상화 계단이, 5장의 `StableHLO → linalg → affine → scf → LLVM` 계단과 정확히 같은 역할을 한다. 차이는 한 가지 — MLIR은 각 층의 계약을 *열린 IR*로 명시하고(4장의 glassboxing), CUDA 플랫폼은 각 층을 *닫힌 라이브러리 경계*로 굳혔다는 점이다. 같은 다층 구조의 두 가지 통치 방식인 셈이다.

그리고 이 닫힌 계단에는 세미나 주제 2와 직결되는 균열이 있다 — **성능 이식성(performance portability)의 부재**:

> "*Most kernels written for generation N will 'keep working' on generation N+1, but often the performance is quite bad — far from the peak of what N+1 generation can deliver.*" [12]

세대가 바뀔 때마다 누군가 커널을 다시 써야 한다. NVIDIA의 답은 cuDNN — 그 재작성 부담을 *벤더가 사람 손으로* 흡수하는 것이었다 [12]. 6–7장에서 본 polyhedral·affine 자동 변환은 정확히 같은 문제에 대한 반대편 답이다 — *컴파일러가 스케줄을 자동으로 재유도*하자는 것. "사람이 흡수하느냐, 컴파일러가 흡수하느냐"라는 이 대립축은 아래 실패 박물관에서 계속 등장한다.

## CUDA는 왜 이겼나 — 그리고 누구에게 좋은가

Part 3 [13]의 진단은 명료하다. CUDA의 지배는 기술적 우월함만의 산물이 아니다:

> "*CUDA's success isn't really about performance — it's about strategy, ecosystem, and momentum.*" [12]

핵심 전략 세 가지. 첫째, **세대 간 호환되는 단일 GPU 제품 라인** — 게이밍 GPU install base가 그대로 개발자 유입 통로가 됐다(저가 데스크톱에서 CUDA를 배워 데이터센터로 확장). 둘째, **프레임워크의 저수준 튜닝 부담을 직접 인수** — TensorFlow(2015)·PyTorch(2016)가 등장하자 NVIDIA는 cuDNN·TensorRT를 공격적으로 최적화해 프레임워크를 자사 하드웨어에 묶었다(hardware/software co-design). 셋째, GenAI 폭발 이후 **"CUDA에 최적화하거나 뒤처지거나"** 라는 선택을 산업 전체에 강제 — 그 결과 *GenAI 수요 → 최대 install base → CUDA 타깃 연구 → 세대마다 재작성 → 더 깊은 의존*이라는 자기강화 사이클이 돈다 [13].

그러나 Part 4 [14]는 "그래서 좋은가?"에 관점별로 다른 답을 내놓는다 — 프레임워크 위에서 일하는 엔지니어에게는 성숙한 생태계이자 버전 지옥이고, 커널을 직접 쓰는 성능 엔지니어에게는 *2007년에 설계된* 노후 추상화이며(Tensor Core 시대의 성능을 내려면 CUDA 아래 PTX로 내려가야 한다), 멀티벤더 이식성을 원하는 개발자에게는 장애물, NVIDIA 자신에게도 후방호환성이라는 기술부채다. 결론은 "축복이자 짐(a blessing and a burden)".

여기서 8장의 ISA 경계 논의에 보탤 **1급 실증 사례**가 나온다. PTX는 오랫동안 'NVIDIA의 안정적 가상 ISA'로 통했다 — 기능 호환의 경계로서는 실제로 그랬다. 그런데:

> "*NVIDIA's commitment to backward compatibility — one of CUDA's early selling points — has now become 'technical debt' that hinders their own ability to innovate rapidly.*" [14]

Blackwell 세대는 성능 목표를 위해 **Hopper PTX 일부와의 호환을 깼다** [14] — 구체적으로 깨진 것은 sm_90a 전용 wgmma 계열로, Blackwell에서 tcgen05로 대체됐다(이 특정은 [14]가 아니라 NVIDIA Blackwell Compatibility Guide 기준). CUDA를 우회해 PTX에 직접 베팅했던 고급 사용자들(DeepSeek가 유명한 사례 [11][12])은 차세대에서 코드를 다시 써야 했다. 즉 — *경계는 기능 호환을 지켜도 성능 호환은 못 지키고(세대 N→N+1 peak 손실), 하드웨어 진화 압력이 충분히 세지면 기능 호환마저 흔들린다.* 8장의 명제 — 경계의 높이가 곧 일감 배분 — 에 이 사례는 시간축을 더한다. **경계는 한 번 긋고 끝나는 선이 아니라, 하드웨어의 진화 속도를 견디도록 그어야 하는 선이다.**

## 실패 박물관 — 대안들은 왜 CUDA를 못 뚫었나

시리즈의 가운데 세 편(Parts 5–7)은 CUDA 대안들의 부검 보고서다. 각 실패가 본 세미나의 개념 하나씩과 정확히 맞물린다.

### ① OpenCL — 위원회의 속도, PDF로는 표준이 안 된다 [15]

Lattner 본인이 2008년 Apple에서 OpenCL 구현을 이끌었던 당사자다(Clang의 첫 production 사용처). 실패 요인: 협력해야 할 벤더들이 동시에 경쟁자인 **"open coopetition"** 구조에서 위원회(Khronos) 합의는 항상 하드웨어보다 뒤처졌고, **공유 reference implementation 없이 사양(spec)만** 기여돼 벤더별 fork·확장의 패치워크가 됐으며 — 정작 목표였던 portability가 그 분열로 무너졌다. 결정타는 정량적이다. OpenCL은 지금도 Tensor Core에 대한 표준화된 지원이 없어 **CUDA 대비 5–10배 느리다**:

> "*For GenAI, where compute costs are already astronomical, a 5x to 10x slowdown isn't just inconvenient — it's a complete dealbreaker.*" [15]

추상화 경계가 하드웨어의 핵심 유닛(Tensor Core)을 표현하지 못하면 그 경계 위의 모든 것이 죽는다 — 8장 ISA 경계 논의의 음화(陰畵)다. 그리고 일곱 가지 교훈 중 첫째:

> "*A working, adoptable, and scalable implementation should define compatibility — not a PDF.*" [15]

LLVM·MLIR이 위원회 표준이 아니라 *단일 코드베이스 + 강한 리더십*으로 운영되는 이유가 이 경험에서 나왔다.

### ② TVM·XLA — 고정 연산자 집합의 배신 [16]

2세대 AI 컴파일러의 존재 이유는 **연산자 폭발**이었다 — 수천 개 연산자 × datatype × 하드웨어의 조합을 손으로 다 쓸 수 없으니, kernel fusion(예: matmul+ReLU를 한 커널로 — 중간 행렬의 메모리 왕복 제거, 때로 2배 향상)을 컴파일러가 자동화하자는 것. TVM은 autotuning 연구를, XLA는 대규모 분산 학습을 성취했다. 그러나:

> "*The core reason is that in its efforts to simplify AI compilation, XLA abstracted away too much of the hardware. This worked for early AI models, but GenAI demands fine-grained control over accelerators — something XLA simply wasn't built to provide.*" [16]

이것은 4장 Progressivity의 거울상이다. premature *lowering*(너무 일찍 내려가 고수준 의미를 잃음)의 반대편에 **premature abstraction**(너무 높은 추상화로 한 번에 점프해 저수준 제어를 잃음)이 있고, XLA의 고정 연산자 집합(HLO)이 그 사례다 — FlashAttention류 커널, float8 같은 새 datatype, 하드웨어 밀착 통신 전략이 필요한 GenAI 앞에서 굳은 op set은 배신이 됐다(TPU 위에서조차 핵심 워크로드가 XLA를 우회하는 Pallas로 작성된다 [16]). 인센티브 문제도 솔직하게 짚는다:

> "*Google engineers might want to build a great general-purpose AI compiler, but their paychecks are tied to making TPUs go brrr.*" [16]

TVM은 반대편에서 — spec이 아니라 구현체였기에 — 벤더들이 fork해 비호환 변경을 가했고, 파편화로 같은 결말에 도달했다. "*They failed in the exact way CUDA alternatives were supposed to succeed!*" [16]

### ③ Triton — 생산성과 20%의 값 [17]

Triton(OpenAI)은 스레드 단위 사고를 버리고 **block 단위 프로그래밍**으로 GPU 커널 작성의 접근성을 극적으로 높였다 — `tl.dot` 한 줄로 Tensor Core를 쓰고, PyTorch와 매끄럽게 통합되며, 개발자 사랑은 시리즈 채점표 만점이다. 비용은 성능과 이식성이다. NVIDIA H100에서조차 통상 ~20% 손실:

> "*a 20% difference is untenable in GenAI: at scale it is the difference between a $1B cloud bill and an $800M one!*" [17]

A100에 최적화한 Triton 코드는 H100에서 다시 써야 하고, 타 벤더 GPU로는 사실상 못 간다. 툴링 격차도 있다 — CUDA의 Nsight 같은 도구가 안 통해 개발자는 "*guessing what the compiler did*" [17] 처지가 된다(4장 Traceability의 부재 비판으로 읽을 수 있다). 그리고 흥미로운 사실 — **Triton 자체가 MLIR 기반이다**(Python AST → Triton IR → TritonGPU IR → LLVM/PTX, 모두 MLIR dialect). 7장의 "어디까지 내려갈 것인가" 스펙트럼 위에 놓으면, Triton은 *타일 단위는 사람이 쓰고 그 아래(memory coalescing·Tensor Core 매핑·layout)는 컴파일러가 자동화*하는 중간 절충이다 — 6장 polyhedral의 완전 자동화와 cuDNN의 완전 수작업 사이 어딘가.

## MLIR 회고 — "인프라로는 이겼고, 민주화에는 실패했다" [18]

시리즈의 정점이자, 이 세미나가 에필로그를 붙인 이유다.

**탄생 비화.** 2018년, AI 프레임워크들(TensorFlow·PyTorch·JAX·Glow·ONNX·XLA·TVM…)이 각자 "AI graph"와 op를 재발명하며 사일로화하던 시기 — 다수 프레임워크에는 SSA 같은 기본 컴파일러 기법조차 없었다. 당시 Lattner의 매니저였던 Jeff Dean(compiler PhD)이 1:1에서 새 컴파일러를 제안했고, Lattner와 동료 네 명이 며칠간 화이트보드 앞에서 던진 창립 질문이 이것이다:

> "*Could we build a unified representation that could support every AI framework, every hardware backend, and every kind of optimization — from algebraic simplification to **polyhedral analysis**?*" [18]

주목 — **polyhedral analysis가 day-one 설계 목표로 명시돼 있다.** 6–7장에서 다룬 affine dialect는 MLIR에 나중에 얹힌 액세서리가 아니라 창립 질문의 일부였다는, 창시자 본인의 증언이다.

**인프라로서의 성공.** "*MLIR wasn't just another compiler: It was a framework for building many compilers.*" [18] — 2장에서 본 채택 증거(16개 대학, 14개 기업, 26+ dialect)의 후일담은 압도적이다. OpenXLA·Triton·CUDA의 일부·양자컴퓨팅 컴파일러·CIRCT(하드웨어 설계)까지, 거의 모든 주요 AI 스택의 기반이 됐다. 컴파일러 인프라 전쟁에서 MLIR은 이겼다.

**그러나 AI 민주화는 실패했다 — 원인은 기술이 아니라 거버넌스.** AI 특화 dialect들(arith·linalg·tensor)이 코어 설계가 굳기 전에, 원칙 있게 "no"를 말할 거버넌스가 없는 채로 대거 upstream됐다. 초기 작업은 TensorFlow·OpenXLA 지향이어서 PyTorch·GenAI 1급 지원이 설계에 없었고, 초기 개발자들은 Google을 떠나 경쟁 하드웨어 회사들에서 공유 dialect 위에 *사유* 스택을 쌓았다 — 중앙 조정 없이 비전이 분열됐다("OpenCL/Khronos 위원회의 재림"이라고 본인이 부른다 [18]). end-to-end MLIR 기반 AI 스택 경쟁의 승자는, 수년 뒤 돌아보면 — **"nobody"** [18].

> "*We got 'many things fast' at the expense of getting 'something great at each level,' and then fell prey to Hyrum's Law.*" [18]

**8장과의 수미상관.** 우리는 8장 한계표 #2에서 논문의 자기 인정을 봤다 — dialect 폭발은 "*순수 기술적 해결책이 없으며*" 거버넌스·커뮤니티 표준화의 영역이라는 것 [2 §II.B]. 그리고 dialect 폭발 = ISA 파편화라는 비유도. **Part 8은 그 예언의 실현 보고서다.** 2021년에 저자들이 "기술로는 못 막는다"고 적은 바로 그 파편화가, 2025년 같은 저자의 펜으로 "실제로 일어났다"고 확정됐다. 예언과 채점이 같은 사람의 글이라는 것 — 이것이 이 시리즈를 세미나의 에필로그로 읽는 이유다.

현재진행형의 후속도 있다. LLVM 커뮤니티에 MLIR Area Team·charter가 생겨 **MLIR Core(도메인 독립 인프라)와 AI dialect들을 별도 거버넌스로 분리**하는 작업이 진행 중이고, Lattner의 소원은 'MLIR'이라는 이름이 도메인 독립 인프라만을 지칭하게 되는 것이다 [18].

이 회고의 실용적 함의 — upstream의 AI dialect 표준이 정리되는 동안에는 linalg·affine처럼 성숙하고 널리 쓰이는 공통분모 dialect를 보수적으로 따라가는 편이, custom dialect를 서둘러 쌓는 것보다 파편화 위험('many things fast')을 줄인다.

## 구조 진단, 그리고 창시자의 다음 베팅

**왜 하드웨어 회사들은 번번이 실패하는가** — Part 9 [19]는 이것을 무능이 아니라 구조의 문제로 진단한다. 칩이 제품이고 소프트웨어는 overhead인 P&L 구조(그 결과가 "칩 런칭 → 커널 몇 개 → 벤치마크 → keynote"의 demo-driven culture), GenAI 소프트웨어의 조합 폭발("*models × quantization formats × batch sizes × inference/training × cloud/edge × framework-of-the-week*" [19]), 그리고 경쟁 상대가 CUDA가 아니라 *NVIDIA에 최적화하는 산업 전체*라는 비대칭. 가장 세미나와 공명하는 문장은 이것이다:

> "*In the CPU era, software was simpler: build a backend for LLVM and your chip inherited an ecosystem — Linux, browsers, compiled applications all worked. AI has no such luxury. There's no central compiler or OS.*" [19]

CPU 시대에는 LLVM IR이라는 수렴점이 있어 backend 하나로 생태계를 상속받았다 — AI에는 그 수렴점이 없고, MLIR이 노린 빈자리가 정확히 그 자리였다. 8장 ISA 경계 논의의 산업 버전이기도 하다. NVIDIA는 경계(PTX) *위의 전 층* — 라이브러리, 프레임워크 연동, 서빙까지 — 을 자기가 소유함으로써 해자를 쌓았다. 경계를 어디에 긋느냐만이 아니라 *경계 위층을 누가 채우느냐*가 승부였던 것이다.

**다음 베팅(요약만).** Parts 10–11 [20][21]에서 Lattner는 실패의 패턴을 "기술이 아니라 시스템"으로 정리하고("*the failures weren't technical, they were systemic*" [20]), OpenCL과 MLIR에서 배운 교훈 — "*consensus kills research*" [20] — 에 따라 3년 이상 비공개로 개발한 Modular 스택(Mojo 언어 → MAX 서빙 → Mammoth 오케스트레이션)을 공개한다. 본 세미나 관점에서 흥미로운 설계 선택 하나만 짚는다: 성능 전략이 *자동 최적화 컴파일러*가 아니라 **Mojo로 사람이 쓴 hand-optimized 커널 + 전 층 programmability("No black boxes")** [21]라는 점 — 6장 polyhedral이 표방한 "컴파일러가 스케줄을 자동 합성한다"는 야망과 정확히 반대 방향의 베팅이다. 자동화 vs 프로그래머 제어라는 이 장의 대립축이, MLIR의 가장 큰 production 사용자의 손에서 후자로 기울었다는 사실은 기록할 가치가 있다. (성과 주장 자체는 이해당사자의 자기 채점임을 감안하고 읽을 것 ⚠️.)

## 다시, ISA 경계로 — 에필로그가 본문에 보태는 것

시리즈의 사실들을 본문의 개념 위에 얹으면 이렇게 정리된다.

| 시리즈의 사실 | 본문의 개념 | 보태지는 것 |
|---|---|---|
| PTX 성능 비이식성 + Blackwell의 Hopper PTX 파기 [12][14] | 8장 ISA 경계 = 책임 분담선 | 경계에는 **시간축**이 있다 — 진화 속도를 견디게 그어야 한다 |
| OpenCL의 Tensor Core 부재 → 5–10x [15] | ISA 경계의 음화 | 경계가 HW 핵심 유닛을 표현 못 하면 경계 위 전부가 죽는다 |
| XLA의 과추상화 — 고정 op set [16] | 4장 Progressivity | premature lowering의 거울상, **premature abstraction** |
| Triton의 절충과 ~20% [17] | 7장 "어디까지 내려갈 것인가" | 그 스펙트럼의 실측점 — 타일은 사람, 아래는 컴파일러 |
| MLIR 자기 채점 — 승자는 nobody [18] | 8장 한계 #1·#2 | 2021년 예언의 2025년 실현 — 거버넌스가 기술을 결정 |
| "no central compiler or OS" [19] | 1장 one true IR infrastructure | 인프라는 수렴했으나 그 위 *스택*은 여전히 파편 |

1장에서 심은 질문을 회수하자 — *하나의 진정한 IR은 없어도, 하나의 진정한 IR 인프라는 가능하지 않을까?* 2025년의 답: **인프라는 가능했다.** MLIR은 그 전쟁에서 이겼고, 오늘날 적과 아군이 모두 그 위에 서 있다. 그러나 그 인프라 위에서 *AI compute를 민주화하는 일*은 기술이 아니라 인센티브·거버넌스·생태계의 문제로 남았다 — 그리고 그것이, 8장의 ISA 경계가 단순한 기술 선택이 아니라 **비즈니스의 책임 분담선이기도 한** 이유다. 경계를 긋는 자가 아니라, 경계 위층을 채우는 자가 이겨 왔다.

---

[← 이전](08_synthesis.md) | [목차](README.md) | [다음 →](10_references.md)
