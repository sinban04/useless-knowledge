# Democratizing AI Compute — 시리즈 정리 (별도 자료)

> 이 문서는 Chris Lattner가 Modular 블로그에 2025년 1–6월 연재한 11편짜리 시리즈 **"Democratizing AI Compute"** [11]–[21]를, 세미나 본문과 **별개로** 그 자체만 자기완결적으로 정리한 것이다. (세미나 본문의 개념에 얹어 읽는 통합판은 `09_epilogue.md`에 따로 있다.) 정리의 축은 세 가지 — **① 기술의 흐름, ② 기술의 실패와 교훈, ③ 기술의 의미**.
>
> ⚠️ **출처 신뢰도.** 이 시리즈는 동료심사 논문이 아니라 기술 블로그이며, 저자는 Modular라는 이해당사자다. 시장·경쟁사에 대한 *주장*과 자사(Modular) 서술([20][21])은 그 관점을 감안해 읽어야 하고, 권위 채널 교차검증을 권한다. 다만 CUDA·OpenCL·MLIR의 탄생 경위와 설계 의도에 대한 회고는 그 일을 직접 한 창시자(LLVM·Clang·Swift·MLIR, Apple OpenCL, Google TPU/XLA)의 1차 증언이라는 점에서 사료 가치가 있다.

---

## 한눈에 — 시리즈의 한 줄 논지

> AI 컴퓨트의 병목은 하드웨어가 아니라 **소프트웨어**다. CUDA는 기술이 우월해서가 아니라 *전략·생태계·모멘텀*으로 이겼고, 그것을 깨려던 모든 대안(OpenCL·TVM·XLA·Triton·MLIR)은 기술이 부족해서가 아니라 *시스템적(조직·인센티브·거버넌스) 이유*로 실패했다. 따라서 'AI compute의 민주화' — *누가 무엇을 만들 수 있는가*를 다시 여는 일 — 는 기술 하나를 더 만드는 것으로는 풀리지 않는다.

시리즈가 던지는 6개 질문 [11]: ① CUDA란 정확히 무엇인가 ② 왜 성공했는가 ③ 그래서 좋은 물건인가 ④ 다른 하드웨어 제조사는 왜 비슷한 AI 소프트웨어를 못 만드는가 ⑤ Triton·OpenCL 같은 기존 기술은 왜 이 문제를 못 풀었는가 ⑥ 산업은 어떻게 전진해야 하는가.

---

## 1. 기술의 흐름

GPU가 그래픽 전용 칩에서 AI 컴퓨트의 심장으로, 그리고 그 위의 소프트웨어 스택이 어떻게 쌓이고 갈라졌는지의 연대기다.

### 1.1 GPU 컴퓨팅의 탄생 (2001–2006) [12]

- **~2001년 이전**: GPU는 고정기능(fixed-function) 그래픽 전용 장치. 프로그래밍 대상이 아니었다.
- **2001 — GeForce3**: 최초의 programmable shaders(Shader Model 1.0) 도입. GPU에 "코드를 올린다"는 개념의 출발.
- **Stanford BrookGPU**: CPU 연산을 GPU로 offload하는 프로그래밍 모델의 개념적 토대 마련.
- **2006 — CUDA**: NVIDIA가 'Compute Unified Device Architecture'를 출시. 최초의 범용 GPU 프로그래밍 플랫폼. (Part 4는 "CUDA가 2007년, 딥러닝 이전에 설계됐다"고 적는다 [14] — 이 설계 시점이 뒤의 '노후 추상화' 논의의 근거가 된다.)

### 1.2 CUDA, '언어'에서 '플랫폼'으로 (2006–2014) [12]

CUDA는 흔한 오해와 달리 언어나 프레임워크가 아니라 **계층형 플랫폼**이다.

> "*[CUDA] is a huge, layered Platform — a collection of technologies, software libraries, and low-level optimizations that together form a massive parallel computing ecosystem.*" [12] *(원문은 "It's…"; 'It'의 선행사가 CUDA)*

그 계층(아래→위):

1. **NVIDIA driver** — CPU↔GPU 메모리 할당·전송·커널 실행 중개.
2. **PTX** — 가상 어셈블리. NVIDIA GPU가 지원하는 최하위 인터페이스.
3. **CUDA C++** — C++ 파생 병렬 프로그래밍 모델(kernel 단위). 포인터·magic number·warp당 스레드 수 같은 하드웨어 세부가 그대로 노출되는 극저수준.
4. **closed-source 라이브러리** — cuDNN(2014)·cuBLAS·cuFFT. 세대마다 손튜닝한 고성능 커널.
5. **턴키 수직 솔루션** — TensorRT(추론 최적화기)·TensorRT-LLM·Triton Serving.

저자는 이 전체를 "**The CUDA Platform**"이라 부르길 권한다 — Java 생태계나 운영체제에 가까운 규모이기 때문이다 [12]. 그리고 이 닫힌 계단에는 처음부터 균열이 있다 — **성능 이식성(performance portability)의 부재**:

> "*Most kernels written for generation N will 'keep working' on generation N+1, but often the performance is quite bad — far from the peak of what N+1 generation can deliver.*" [12]

세대가 바뀌면 누군가 커널을 다시 써야 한다. NVIDIA의 답이 바로 cuDNN — *그 재작성 부담을 벤더가 사람 손으로 흡수*하는 것이었다. 이 "사람이 흡수하느냐, 컴파일러가 흡수하느냐"가 이후 모든 대안의 분기점이 된다.

### 1.3 딥러닝이 점화한 수요 (2012–2016) [12][13]

- **2012 — AlexNet**: GeForce GTX 580 2장으로 학습. GPU가 딥러닝에 *더 빠른* 게 아니라 *필수*임을 입증. custom CUDA kernel(convolution·pooling·normalization)이 현대 딥러닝을 점화 [13].
- **2014 — cuDNN**: 프레임워크가 저수준을 몰라도 되게 함. TensorFlow(2015)·PyTorch(2016)의 탄생을 가능케 함.
- **NVIDIA의 결정적 수**: 프레임워크 팀에 CUDA 튜닝을 맡기지 않고 cuDNN·TensorRT를 *직접* 공격적으로 최적화해 부담을 떠안았다. 결과 — 프레임워크가 NVIDIA 하드웨어에 묶였다(hardware/software co-design) [13].

### 1.4 대안들의 계보 (2008–2018) — '계층'으로 본 지도

CUDA를 깨려는 시도는 추상화 높이가 제각각인 여러 층에서 나왔다.

| 시기 | 대안 | 접근 층위 | 한 줄 정체성 |
|------|------|-----------|--------------|
| 2008 | **OpenCL** / 이후 SYCL·oneAPI | C++ 기반 portable GPU 모델 | 위원회(Khronos) 표준 [15] |
| 1세대 | **hand-written CUDA kernels** (TF·PyTorch 1.0) | 사람이 직접 작성 | 확장 불가 [16] |
| 2016~ | **TVM**(UW), **XLA**(Google) | 2세대 AI 컴파일러 (kernel fusion 자동화) | 고정 op set [16] |
| 2018 | **MLIR**(Google) | 컴파일러 인프라(여러 컴파일러를 만드는 틀) | dialect [18] |
| 2020~ | **Triton**(OpenAI), Pallas, cuTile | Python eDSL (block 단위) | 생산성 [17] |

흐름의 핵심은 *추상화의 진자 운동*이다 — 사람이 다 짜던 1세대 → 컴파일러가 다 푸는 2세대(TVM·XLA) → 사람에게 제어를 일부 돌려주는 eDSL(Triton). 그리고 이 모든 것의 하부 인프라로 MLIR이 깔렸다(Triton·OpenXLA가 MLIR 기반).

### 1.5 GenAI 시대와 재구축 (2022–) [20][21]

ChatGPT(2022 말) 이후 컴퓨트 수요가 폭발하며 비용 압박이 극대화됐고, 2025년 초 **DeepSeek**가 *더 나은 하드웨어 활용만으로 고가 GPU 수요를 극적으로 줄일 수 있음*을 보이며 통념을 흔들었다 [11]. 같은 해 Lattner는 시리즈를 연재하며, 자신이 2022년 창업한 **Modular**의 스택(Mojo → MAX → Mammoth)을 "pre-GenAI 시대에 설계된 CUDA·OpenCL을 넘어, GenAI를 위해 처음부터 다시 지은" 답으로 제시한다 [21].

```
fixed-function GPU (~2000)
  → programmable shaders (2001) → BrookGPU → CUDA (2006)
  → cuDNN (2014) → TF (2015) / PyTorch (2016)        [딥러닝 점화]
  → [대안] OpenCL(2008) · TVM/XLA(2016~) · Triton(2020~) · MLIR(2018)
  → [GenAI] Modular: Mojo / MAX / Mammoth (2022~)
```

---

## 2. 기술의 실패와 교훈

시리즈의 가장 큰 부피는 *부검*이다. 각 대안이 왜 죽었는지, 그리고 거기서 무엇을 배워야 하는지.

### 2.1 OpenCL — 위원회의 속도, 그리고 "PDF로는 표준이 안 된다" [15]

Lattner 본인이 2008년 Apple에서 OpenCL 구현을 이끈 당사자다(Clang의 첫 production 사용처). 실패 원인:

- **Open coopetition** — 협력해야 할 벤더들이 동시에 경쟁자라, 개발 중인 하드웨어 기능을 위원회에 미리 알리지 않았다. 표준은 구조적으로 늘 하드웨어보다 뒤처졌다.
- **Reference implementation 부재** — Apple은 spec(PDF)만 기여하고 공유 런타임이 없었다. 벤더별 fork·확장의 패치워크가 되어, 목표였던 portability 자체가 분열로 붕괴했다.
- **정량적 결정타** — Tensor Core 표준 지원이 없어 CUDA 대비 **5–10배** 느리다. "*For GenAI … a 5x to 10x slowdown isn't just inconvenient — it's a complete dealbreaker.*" [15]
- **전략적 무력화** — NVIDIA는 자사 OpenCL 구현을 형식적으로만 유지하되 TensorCore를 못 쓰게 막아, CUDA가 항상 필요하도록 했다.

**교훈 (7가지)** [15] — 성공하는 시스템은: ① PDF 사양이 아니라 *동작하는 reference implementation*이 호환성을 정의한다, ② 그것을 유지하는 강한 리더십·비전, ③ 업계 1위 하드웨어에서 최고 성능(아니면 영원히 2등 대안), ④ AI 속도에 맞춘 빠른 진화, ⑤ 사용성·도구로 developer love 확보, ⑥ 열린 커뮤니티, ⑦ 분열 회피.

> "*A working, adoptable, and scalable implementation should define compatibility — not a PDF.*" [15]

이 교훈이 LLVM·Clang·MLIR이 위원회 표준이 아니라 *단일 코드베이스 + 강한 리더십*으로 운영되는 이유다.

### 2.2 TVM·XLA — 고정 연산자 집합의 배신 [16]

2세대 AI 컴파일러의 존재 이유는 **연산자 폭발**이었다 — 수천 개 op × datatype × 하드웨어 조합을 손으로 못 쓰니, kernel fusion(matmul+ReLU를 한 커널로 → 중간 행렬의 메모리 왕복 제거, 때로 2배 향상)을 자동화하자는 것. TVM은 autotuning을, XLA는 대규모 분산 학습을 성취했다. 그러나 둘 다 실패했다:

- **NVIDIA GPU를 못 풀었다** — "*Neither XLA nor TVM could fully unlock NVIDIA GPUs without calling into CUDA libraries.*" [16] 결국 CUDA 라이브러리를 호출해야 성능이 났다.
- **과추상화** — "*XLA abstracted away too much of the hardware. This worked for early AI models, but GenAI demands fine-grained control over accelerators — something XLA simply wasn't built to provide.*" [16] 고정 op set(HLO)이 FlashAttention류 커널·float8·하드웨어 밀착 통신을 못 따라갔다. TPU 위에서조차 핵심 워크로드가 XLA를 우회하는 Pallas로 작성된다.
- **인센티브 불일치** — "*Google engineers might want to build a great general-purpose AI compiler, but their paychecks are tied to making TPUs go brrr.*" [16] 범용성을 위한 변경은 한 번도 우선시되지 않았다.
- **파편화** — TVM은 벤더 fork 난립, XLA는 TPU 중심 폐쇄. (TVM 핵심 팀이 세운 OctoAI는 2024년 NVIDIA에 인수.)

**교훈**: "*They failed in the exact way CUDA alternatives were supposed to succeed!*" [16] — 차세대 시스템의 위시리스트 3가지: ① 완전한 프로그래머빌리티(추상화에 갇혀 실리콘을 못 쓰면 민주화가 아니다), ② AI 복잡성에 대한 지렛대(조합 폭발을 수작업 없이 스케일), ③ 대규모 응용 지원(수천 칩 분산 학습).

### 2.3 Triton·Python eDSL — 생산성의 값 [17]

Triton(OpenAI)은 스레드 단위 사고를 버리고 **block 단위 프로그래밍**으로 GPU 커널 작성의 접근성을 극적으로 높였다(`tl.dot` 한 줄로 Tensor Core, PyTorch와 매끄러운 통합). 개발자 사랑은 시리즈 채점표 만점. 하지만:

- **성능의 값** — H100에서조차 통상 ~20% 손실. "*a 20% difference is untenable in GenAI: at scale it is the difference between a $1B cloud bill and an $800M one!*" [17]
- **이식성 실패** — A100→H100 재작성 필요, 타 벤더 GPU는 사실상 불가. *Write once, run anywhere — but with significantly degraded performance.*
- **거버넌스** — "*Triton is open source, but OpenAI owns its roadmap.*" [17] — frontier model lab과 직접 경쟁하는 회사가 로드맵을 소유.
- **툴링 격차** — Nsight 등과 비호환, 개발자는 "*guessing what the compiler did*" 처지.
- **eDSL 난립** — Pallas·CUTLASS Python·cuTile까지. NVIDIA GTC의 "*There is no one tool*"을 두고 저자는 *자기 생태계를 스스로 파편화*한다고 비판: "*We need fewer tools that work better — not an ever-growing list of tradeoffs.*" [17]

**교훈**: eDSL의 본질적 약점 3가지 — ① Python처럼 보이나 Python이 아니다(시맨틱 괴리), ② 디버깅이 악몽(Python 디버거 미작동), ③ 표현력 한계(새 문법 도입 불가). 생산성과 성능·이식성을 동시에 주지 못하면 민주화에 도달하지 못한다.

### 2.4 MLIR — "인프라로는 이겼고, 민주화에는 실패했다" [18]

시리즈에서 가장 솔직한 자기 채점. 2018년 Jeff Dean(Lattner의 매니저, compiler PhD)의 제안으로 Google에서 태어났다. 창립 질문:

> "*Could we build a unified representation that could support every AI framework, every hardware backend, and every kind of optimization — from algebraic simplification to polyhedral analysis?*" [18]

dialect라는 돌파구로 "*a framework for building many compilers*"가 됐고 OpenXLA·Triton·CUDA 일부·양자컴퓨팅·CIRCT까지 침투 — **인프라로서는 대성공**. 그러나 *end-to-end AI 스택*의 통일에는 실패했다. 원인은 기술이 아니라 거버넌스:

- AI dialect(arith·linalg·tensor)가 코어가 굳기 전, '원칙 있는 no'를 말할 거버넌스 없이 조기 upstream → TF/OpenXLA 편향, PyTorch·GenAI 1급 지원 부재.
- 초기 개발자들이 경쟁 하드웨어 회사로 흩어져 공유 dialect 위에 *사유 스택*을 쌓음 → "OpenCL/Khronos 위원회의 재림".
- end-to-end MLIR 기반 AI 스택 경쟁의 승자: **"nobody"**.

> "*We got 'many things fast' at the expense of getting 'something great at each level,' and then fell prey to Hyrum's Law.*" [18]

**교훈**: ① 토대가 굳기 전의 조기 스케일링은 영구적 문제를 남긴다, ② 똑똑한 엔지니어가 제각각 달리면 나중에 배를 조종할 수 없다(원설계자의 영향력은 기여자의 고용주 월급을 못 이긴다), ③ 작은 팀이 비전 정렬에 최적이고, 정체성 확립 후에야 커뮤니티 확장이 의미 있다. (현재 LLVM에 MLIR Area Team·charter가 생겨 MLIR Core와 AI dialect를 거버넌스로 분리 중.)

### 2.5 하드웨어 회사들 — 구조의 덫 [19]

왜 *어떤 하드웨어 회사도* CUDA에 맞설 소프트웨어를 못 만드나. 무능이 아니라 구조다:

- **P&L 구조** — 칩이 제품이고 SW는 overhead. 그래서 "칩 런칭 → 커널 몇 개 → 벤치마크 → 화려한 keynote"의 demo-driven culture. 결과는 *기술적으로 인상적이지만 아무도 쓰고 싶지 않은 SW를 가진 칩*.
- **조합 폭발** — "*You're not building a 'stack' — you're building a cross product of models × quantization formats × batch sizes × inference/training × cloud/edge × framework-of-the-week.*" [19]
- **비대칭** — 경쟁 상대는 CUDA가 아니라 *NVIDIA에 최적화하는 산업 전체*(software gravity well). 호환(run)만으로는 부족하고, 이미 쓰이는 콤보보다 *더 나아야* 한다.
- **whale-chasing** — 거액 고객 특수 요구에 끌려 플랫폼이 아니라 consulting shop이 되고, 스택은 *a haunted forest of tech debt and tribal knowledge*가 된다.

가장 본질적인 진단:

> "*In the CPU era … build a backend for LLVM and your chip inherited an ecosystem — Linux, browsers, compiled applications all worked. AI has no such luxury. There's no central compiler or OS.*" [19]

CPU 시대엔 LLVM IR이라는 *수렴점*이 있어 backend 하나로 생태계를 상속받았다. AI엔 그 수렴점이 없다.

### 2.6 공통 패턴 — 시리즈가 반복 적용한 스코어카드와 실패 모델

시리즈는 모든 대안을 **7개 기준**(2.1의 교훈)으로 채점한다. 거의 모든 대안이 ③(업계 리더 하드웨어 최고 성능)과 ⑦(분열 회피)에서 떨어졌다. Part 10은 이 패턴을 **Lippitt-Knoster 복합 변화 관리 모델**로 일반화한다 — 성공적 변화엔 Vision·Consensus·Skills·Incentives·Resources·Action Plan 6요소가 모두 필요하며, 하나라도 빠지면 예측 가능하게 실패한다(비전 부재→혼란, 인센티브 불일치→지연, 합의 과잉→연구 정체…) [20]:

> "*The patterns are real — and the failures weren't technical, they were systemic.*" [20]

이 한 문장이 시리즈 전체의 결론이다 — **AI 컴퓨트 문제는 기술 부족이 아니라 조직·인센티브·거버넌스의 시스템 문제다.**

---

## 3. 기술의 의미

### 3.1 CUDA가 이긴 진짜 이유 — 전략이지 성능이 아니다 [13]

> "*CUDA's success isn't really about performance — it's about strategy, ecosystem, and momentum.*" [13]

세대 간 호환되는 단일 제품 라인(게이밍 install base를 데이터센터 개발자 통로로), 프레임워크 튜닝 부담의 직접 인수, GenAI 시대의 "CUDA에 최적화하거나 뒤처지거나" 강제 — 이 *자기강화 사이클*이 해자를 만들었다. "*a masterclass in long-term platform thinking.*" [13] 그러나 같은 힘이 비효율과 혁신 장벽이라는 *늪*이 되어간다(Jim Keller: "CUDA's a swamp, not a moat" [14]). CUDA는 "누구에게 좋은가"에 따라 답이 갈리는 **축복이자 짐**이다 [14].

### 3.2 "민주화"란 무엇인가 [20][21]

시리즈 제목의 '민주화'는 단순히 *더 많은 디바이스에서 돌리기*가 아니다. **누가(who) 무엇을(what) 어떻게(how) 만들 수 있는가를 다시 짜는 것** — 게이트키퍼(칩 벤더·컴파일러 구루)를 없애고 진입장벽을 낮추는 것이다.

> "*Success in AI isn't just about how powerful your hardware is, it's about how many people can use it.*" [21]

도구가 programmable·composable·understandable해야 한다는 요구, 그리고 "Swift가 iOS 개발을 일반 개발자에게 연 것처럼 GPU 프로그래밍의 게이트키핑을 끝내자"는 선언 [20]이 그 의미다.

### 3.3 MLIR의 의미 — "하나의 컴파일러"가 아니라 "컴파일러를 만드는 틀" [18]

> "*MLIR wasn't just another compiler: It was a framework for building many compilers.*" [18]

단일 경직 IR(LLVM식)을 강요하는 대신 도메인별 dialect를 정의하고 여러 추상화 수준이 공존·변환·상호운용하게 한 것 — 이것이 MLIR의 의미이자, 오늘날 적과 아군이 *모두 그 위에 서 있는* 이유다. 다만 그 의미는 양날이다: 같은 확장 자유가 AI 영역에서 표준 부재·dialect 난립을 낳았다. 인프라의 승리와 솔루션의 실패가 한 시스템 안에 공존한다.

### 3.4 성능 이식성, 그리고 자동화 vs 프로그래머 제어

시리즈를 관통하는 기술적 대립축 하나 — *세대·벤더가 바뀔 때 커널을 누가 다시 쓰는가*. 답은 세 갈래로 갈린다:

- **벤더가 사람 손으로** (cuDNN) — closed-source, lock-in의 원천.
- **컴파일러가 자동으로** (TVM/XLA의 polyhedral·auto-scheduling류) — 이론적으로 아름답지만 GenAI에서 hand-tuned를 못 이겼다.
- **사람이 프로그래밍하되 도구가 받쳐준다** (Triton, 그리고 Modular의 Mojo) — 절충.

주목할 것은, 시리즈의 최종 베팅(Modular)이 *자동 최적화 컴파일러("magic compiler")가 아니라* **사람이 쓴 hand-optimized 커널 + 전 층 programmability("No black boxes")** [21]로 기울었다는 점이다. 컴파일러 자동화의 야망이 산업 현실에서 한 발 물러선 기록이다.

### 3.5 산업의 의미 — 사라진 수렴점, 그리고 컨소시엄 [19][21]

CPU 시대의 LLVM IR 같은 *중심 수렴점*이 AI엔 없다는 것 [19] — 이것이 MLIR이 노린 빈자리였고, 동시에 단일 벤더로는 메울 수 없는 자리다. Part 11의 결론:

> "*It's time to move beyond legacy architectures — like OpenCL and CUDA — designed in a pre-GenAI era.*" [21]

하드웨어 다양성은 *문제(problem)가 아니라 현대 AI 우주의 기반(foundation)*이어야 하며, 민주화는 한 회사에 너무 큰 'galactic-scale mission'이라 **산업 컨소시엄**으로 풀어야 한다는 것이 시리즈가 남기는 산업적 메시지다. (성과·제품 주장은 이해당사자의 자기 서술임을 감안할 것 ⚠️.)

---

## 맺음 — 세 축의 한 줄 요약

- **흐름**: fixed-function GPU → CUDA 플랫폼(닫힌 계단) → 딥러닝 점화 → 대안의 진자 운동(사람↔컴파일러↔eDSL) → MLIR 인프라 → GenAI 시대 재구축.
- **실패와 교훈**: 모든 대안이 *기술이 아니라 시스템(인센티브·거버넌스·생태계)* 때문에 실패했다 — reference implementation·강한 리더십·업계 1위 HW 성능·분열 회피가 없으면 못 이긴다.
- **의미**: CUDA는 전략으로 이겼고, '민주화'는 *누가 무엇을 만들 수 있는가*의 문제이며, MLIR은 인프라 전쟁에선 이겼지만 그 위의 통일은 컴파일러 자동화가 아니라 programmability·거버넌스·컨소시엄의 문제로 남았다.

---

## References

⚠️ 아래 [11]–[21]은 동료심사 논문이 아닌 기술 블로그(Modular)이며 저자는 이해당사자다. 시장·경쟁사 주장은 권위 채널 교차검증을 권한다. 단, CUDA·OpenCL·MLIR 탄생·설계 회고는 창시자 본인의 1차 사료 성격. 시리즈 허브: https://www.modular.com/democratizing-ai-compute

**[11]** C. Lattner, "DeepSeek's Impact on AI (Democratizing AI Compute, Part 1)", Modular blog, 2025-01-30. https://www.modular.com/blog/democratizing-compute-part-1-deepseeks-impact-on-ai

**[12]** C. Lattner, "What exactly is 'CUDA'? (Part 2)", Modular blog, 2025-02-05. https://www.modular.com/blog/democratizing-compute-part-2-what-exactly-is-cuda

**[13]** C. Lattner, "How did CUDA succeed? (Part 3)", Modular blog, 2025-02-12. https://www.modular.com/blog/democratizing-ai-compute-part-3-how-did-cuda-succeed

**[14]** C. Lattner, "CUDA is the incumbent, but is it any good? (Part 4)", Modular blog, 2025-02-20. https://www.modular.com/blog/democratizing-ai-compute-part-4-cuda-is-the-incumbent-but-is-it-any-good

**[15]** C. Lattner, "What about OpenCL and CUDA C++ alternatives? (Part 5)", Modular blog, 2025-03-05. https://www.modular.com/blog/democratizing-ai-compute-part-5-what-about-cuda-c-alternatives

**[16]** C. Lattner, "What about TVM, XLA, and AI compilers? (Part 6)", Modular blog, 2025-03-12. https://www.modular.com/blog/democratizing-ai-compute-part-6-what-about-ai-compilers

**[17]** C. Lattner, "What about Triton and Python eDSLs? (Part 7)", Modular blog, 2025-03-26. https://www.modular.com/blog/democratizing-ai-compute-part-7-what-about-triton-and-python-edsls

**[18]** C. Lattner, "What about the MLIR compiler infrastructure? (Part 8)", Modular blog, 2025-04-08. https://www.modular.com/blog/democratizing-ai-compute-part-8-what-about-the-mlir-compiler-infrastructure

**[19]** C. Lattner, "Why do HW companies struggle to build AI software? (Part 9)", Modular blog, 2025-04-22. https://www.modular.com/blog/democratizing-ai-compute-part-9-why-do-hw-companies-struggle-to-build-ai-software

**[20]** C. Lattner, "Modular's bet to break out of the Matrix (Part 10)", Modular blog, 2025-05. https://www.modular.com/blog/modulars-bet-to-break-out-of-the-matrix-democratizing-ai-compute-part-10

**[21]** C. Lattner, "How is Modular Democratizing AI Compute? (Part 11)", Modular blog, 2025-06-20. https://www.modular.com/blog/how-is-modular-democratizing-ai-compute

---

[← 목차](README.md) | [에필로그(통합판)](09_epilogue.md)
