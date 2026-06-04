# 3. MLIR 핵심 개념 — 모든 것이 Operation이다

[← 이전](02_background.md) | [목차](README.md) | [다음 →](04_design_philosophy.md)

---

## 모든 것이 Operation이다

MLIR을 처음 보면 용어가 많아 보이지만, 설계의 출발점은 놀라울 만큼 단순하다. MLIR의 코어(core)는 **단 하나의 추상(abstraction)만 안다 — Operation**. 함수도, 모듈도, 상수도, 루프도 전부 Operation이다 [2]. 이건 하드웨어로 치면 "ISA(instruction set architecture)에 명령어가 수백 개 있지만, 디코더가 보는 1차 단위는 결국 '하나의 instruction'이다"라는 것과 비슷한 발상이다. MLIR은 그 '하나의 단위'를 극단까지 일반화해서, 컴파일러가 다루는 모든 것을 같은 틀에 담는다.

이 장에서는 그 빌딩블록을 하나씩 본다. 미리 핵심을 요약하면: **작은 코어 + 사용자가 확장하는 어휘(dialect)**다. 논문은 이 철학을 *Parsimony*(절약, Occam의 면도날) — "코어를 작게, 모든 것을 속성으로" — 라고 부른다 [2].

### Operation(Op): 의미의 기본 단위

> **Operation** = 한 가지 일을 나타내는 IR(intermediate representation, 중간 표현 — 소스 코드와 기계어 사이에서 컴파일러가 다루는 프로그램의 내부 표현)의 기본 단위.

하나의 Op은 다음을 묶는다 [2]:

- **opcode** — 무엇을 하는지 (예: `addf` = 부동소수점 덧셈)
- **operands** — 입력으로 받는 값들
- **results** — 내보내는 값들
- **attributes** — 컴파일 타임 상수 정보 (뒤에서 설명)
- **regions** — 자기 안에 품는 하위 코드 블록 (뒤에서 설명)
- **traits** — 자기 능력 선언 (뒤에서 설명)
- **location** — 이 Op이 원래 소스의 어디서 왔는지

직관적으로, Op 하나는 "입력 → 출력 + 부가정보"를 가진 작은 상자다. 중요한 건 **함수도 Op, 모듈도 Op, 상수도 Op**이라는 점이다 [2]. 코어는 "이건 함수, 저건 명령어"를 구분하지 않는다. 전부 같은 Operation 구조체를 공유한다. 그래서 코어가 단순하고, 새 개념을 추가할 때 코어를 건드릴 필요가 없다.

### Dialect: 도메인별 어휘 묶음

> **Dialect** = 특정 도메인을 위한 Op·Type·Attribute·Trait·Interface를 모은 네임스페이스(namespace). 사용자가 직접 확장할 수 있다(user-extensible) [2].

비유하자면, 코어가 "문법"이라면 dialect는 "어휘집"이다. 같은 문법(Operation 구조) 위에, 도메인마다 자기 단어들을 정의한다. ML 연산용 어휘, 루프용 어휘, 산술용 어휘, 메모리용 어휘가 각각 dialect다. 코드에서 dialect는 Op 이름 앞의 점-접두사로 드러난다 — `affine.for`, `arith.addf`처럼 `점 앞`이 dialect, `점 뒤`가 그 dialect의 Op이다. MLIR이 다루는 프로그램은 추상화 수준에 따라 대략 세 층의 dialect를 거친다 [1][8]:

- **입구(고수준):** ML 프레임워크 그래프가 들어오는 층.
  - `stablehlo` — XLA HLO를 표준화한 ML 연산 dialect. JAX/TensorFlow/PyTorch가 XLA 경로로 진입하는 입구 [8][9].
  - `tosa` — Tensor Operator Set Architecture. 프레임워크 중립적인 텐서 연산 입력 표준 [8].
- **중간:** 최적화가 실제로 벌어지는 층.
  - `linalg` — 선형대수 연산(matmul 등)의 구조적 표현.
  - `affine` — 아핀(affine) 루프/맵. 폴리헤드럴(polyhedral) 분석·변환이 가능한 형태 (다음 장에서 집중적으로 다룬다).
  - `scf` — 구조적 제어 흐름(structured control flow): `for`, `if` 같은 구조.
  - `arith` — 산술 연산.
  - `memref` — 메모리 참조(memory reference): 실제 버퍼/주소.
  - `func` — 함수 정의와 호출.
  - `vector` — SIMD 폭의 벡터 연산.
- **저수준:** `llvm` — LLVM IR에 대응하는 dialect. 여기까지 내려오면 LLVM 백엔드로 넘어가 기계어가 된다 [1].

여기서 "affine", "polyhedral" 같은 단어는 다음 장에서 본격적으로 풀 것이니, 지금은 "고수준 의미 → 중간 루프 → 저수준 명령어"라는 큰 흐름만 잡으면 된다.

### Region & Block: 루프가 IR 그 자체다

> **Region** = Op이 자기 안에 품는, 코드 블록(Block)들의 컨테이너. **Block** = Op 리스트 + 맨 끝의 종결자(terminator).

Op이 region을 품을 수 있다는 건, Op 안에 또 Op들이 들어갈 수 있다는 뜻이다 — 즉 **중첩(nesting)**이 가능하다. 그래서 루프 구조나 구조적 제어 흐름이 **IR 그 자체로 명시**된다 [2]. 계층은 재귀적이다: Operation → Region → Block → Operation [1].

이 점이 LLVM과의 결정적 차이다. LLVM IR은 **flat CFG(control flow graph, 제어 흐름 그래프)** — 기본 블록들이 평면적으로 연결된 그래프 — 라서, "여기 루프가 있다"는 사실이 IR에 적혀 있지 않다. 컴파일러가 그래프를 *분석해서 루프를 추출(recover)*해야 한다. MLIR은 반대로, `affine.for` 같은 Op이 region 안에 루프 본문을 담아 루프 구조를 **처음부터 IR에 박아둔다**. 하드웨어 비유로 하면, LLVM은 "어셈블리만 보고 이게 루프인지 역추적"하는 것이고, MLIR은 "소스의 `for`문 구조를 그대로 들고 내려오는" 것이다.

논문은 이 철학을 *Progressivity*(점진성)라 부르며 한 문장으로 못 박는다 — "**Premature lowering is the root of all evil**"(섣부른 하강은 모든 악의 근원) [2]. 고수준 의미를 너무 빨리 지워버리면, 나중 분석이 그걸 *복원*하느라 고생하는데, 그 복원은 "fragile·expensive·invasive"(깨지기 쉽고·비싸고·침습적)하다는 것이다 [2].

### Functional SSA + Block Arguments

> **SSA(Static Single Assignment, 정적 단일 배정)** = 한 변수는 딱 한 번만 정의된다는 IR 규칙. 값의 "출처"가 유일해서 분석이 쉬워진다.

전통적 SSA는 분기가 합류하는 지점에서 $\phi$(phi) 노드라는 특수 장치로 "어느 경로에서 왔느냐에 따라 다른 값"을 표현한다. MLIR은 이 $\phi$ 노드를 없애고, 대신 **terminator(블록 종결자)가 다음 블록(successor)의 인자(block argument)로 값을 직접 넘긴다** [2]. 즉 블록도 함수처럼 "매개변수(block argument)"를 받고, 다른 블록으로 점프하는 terminator가 그 매개변수에 실제 값을 채워 넣는다. 함수 호출에서 인자를 넘기듯 블록 간 점프도 "인자를 넘기는 호출"처럼 다루는 것이다(그래서 *functional* SSA). $\phi$의 암묵적 마법 대신, 값이 어디서 오는지가 인자 전달로 명시되어 더 읽기 쉽다.

### Attributes & Type System

> **Attribute** = Op에 붙는 컴파일 타임 상수 정보 (실행 중 변하는 값이 아니라, 컴파일 시점에 이미 확정된 메타데이터).

예를 들어 루프의 상한, 텐서의 모양, 메모리 레이아웃 같은 "변하지 않는 사실"이 attribute다. operands(런타임 값)와 구분된다. 그리고 **Type system도 user-extensible** — dialect가 자기 타입(예: 특정 가속기의 텐서 타입)을 새로 정의할 수 있다 [2]. 더불어 MLIR은 *strict type equality*를 강제해서, 암묵적 형변환(implicit conversion)을 두지 않는다 — 모든 변환은 *명시적 Op*으로만 일어난다 [2].

### Traits / Interfaces: Op이 자기 능력을 선언한다

> **Trait/Interface** = Op이 "나는 이런 성질·능력이 있다"고 스스로 붙이는 꼬리표. 일반 패스(pass)는 Op이 뭔지 몰라도 이 꼬리표만 보고 동작한다.

예: `IsCommutative`(교환 가능), `NoSideEffects`(부작용 없음), `LoopLikeOpInterface`(루프처럼 행동함). 이게 왜 강력한가? 논문은 이를 **"inverting the common approach"**(통상적 접근의 역전)라 부른다 [2]. 보통은 패스가 모든 Op 종류를 일일이 알아야 하지만 — MLIR은 거꾸로 **Op이 자기 능력을 declare하고, 패스는 그 선언만 본다**. 논문의 표현: "*since there are more Ops than passes, it is easier for Ops to know about passes*"(Op이 패스보다 많으니, Op이 패스를 아는 편이 더 쉽다) [2].

덕분에 DCE(dead code elimination, 죽은 코드 제거)·CSE(common subexpression elimination, 공통 부분식 제거)·canonicalization·inlining 같은 **일반 패스가 어떤 dialect인지 몰라도** 작동한다 [2]. 새 dialect를 만들어도, "내 Op은 NoSideEffects"라고 선언만 하면 기존 최적화 패스들이 공짜로 적용된다. LLVM이 `InstCombine`·`PeepholeOptimizer` 같은 거대 패스에 모든 케이스를 욱여넣어 유지보수가 악명 높았던 부담을, MLIR은 Op 자체로 분산시킨다 [2].

### Isolated-from-Above: 병렬 컴파일을 위한 칸막이

> **Isolated-from-Above** = "위(상위 스코프)의 값을 함부로 끌어다 쓸 수 없다"는 scope barrier(스코프 칸막이) trait.

이 trait가 붙은 Op(대표적으로 함수)은 바깥 스코프의 SSA 값을 직접 참조하지 못한다. 즉 use-def chain(값의 정의-사용 사슬)이 이 경계를 **넘지 못하도록** 강제된다 [2]. 결과적으로 각 함수/모듈 단위가 서로 독립적이어서, **모듈을 멀티코어에서 동시에(concurrent) 컴파일**할 수 있다 [2]. LLVM은 whole-module use-def chain을 갖고 있어서 이런 병렬화가 어려웠는데, MLIR은 설계 단계부터 그 사슬을 **안 갖도록** 만들었다 [2]. 멀티코어 칩에서 작업을 코어별로 쪼개려면 의존성이 코어 경계를 안 넘어야 하는 것과 똑같은 원리다.

### TableGen ODS: Op을 선언하면 코드가 생성된다

> **ODS(Operation Definition Specification) / TableGen** = Op을 *선언적으로* 기술하면, 그에 필요한 C++ boilerplate(반복 코드)를 자동 생성하는 도구 [1][2][8].

새 Op을 추가할 때 검증 코드·접근자·빌더 같은 뻔한 C++ 코드를 손으로 다 짜는 대신, "이 Op은 이런 operands·results·attributes·traits를 가진다"고 한 번 선언하면 된다. 컴파일러를 확장하는 비용을 크게 낮추는 장치다. 논문의 *Traceability*(추적가능성) 원칙 — "retain / declare / verify"(보존하고·선언하고·검증한다) — 과도 맞닿는다: invariant를 한 번 선언하면 여러 곳에서 자동 검증된다 [2].

### 한 함수 안에 여러 dialect가 공존한다

이제 가장 중요한 그림 한 장. MLIR에서 **하나의 함수 안에 서로 다른 dialect의 Op들이 동시에 섞여 산다**. 논문이 이 특성을 직접 *"the most profound"*(가장 심오한) 라고 부른다 [2]:

> "*One of the most profound (but also most difficult to grok) aspects of MLIR is that it allows and encourages mixing operations from different dialects together within a single program.*" [2]

예를 들어 아래 코드는 한 함수 안에서 `func`·`affine`·`arith`·`memref` dialect가 함께 쓰인다:

```mlir
func.func @add_arrays(%A: memref<8xf32>, %B: memref<8xf32>) {
  affine.for %i = 0 to 8 {
    %a = affine.load %A[%i] : memref<8xf32>
    %b = affine.load %B[%i] : memref<8xf32>
    %s = arith.addf %a, %b : f32
    affine.store %s, %A[%i] : memref<8xf32>
  }
  func.return
}
```

한 줄씩 자연어로 읽으면: `func.func`로 함수를 열고(`func` dialect), `affine.for %i = 0 to 8`로 i를 0부터 7까지 도는 루프를 만든다(`affine`). 루프 안에서 `affine.load`로 배열 A·B의 i번째 원소를 메모리에서 읽고(`affine`+`memref` 타입), `arith.addf`로 둘을 더한 뒤(`arith`), `affine.store`로 결과를 A의 i번째 자리에 다시 쓴다. 마지막 `func.return`도 `func` dialect의 Op이다. 즉 "$A[i] = A[i] + B[i]$를 8번"이다. 네 dialect가 충돌 없이 같은 함수에 공존한다.

핵심은, **`arith` dialect는 `affine`이 뭔지 몰라도** 자기 덧셈 최적화를 적용할 수 있고, **`affine` dialect는 `arith`가 뭔지 몰라도** 루프 변환(다음 장의 주제)을 적용할 수 있다는 점이다. 각 dialect가 자기 일만 알고, interface로 추상화된 한에서 서로의 내부를 몰라도 협업한다 [2]. 바로 이 "어휘를 섞어 쓰되 코어는 하나"라는 구조가, MLIR이 ML 프레임워크부터 가속기 백엔드까지 하나의 인프라로 묶을 수 있는 비결이다 [1][2].

---

[← 이전](02_background.md) | [목차](README.md) | [다음 →](04_design_philosophy.md)
