# 4. Chris Lattner의 설계 철학 — 세 원칙

[← 이전](03_concepts.md) | [목차](README.md) | [다음 →](05_progressive_lowering.md)

---

## 왜 "원칙"부터 보는가

대부분의 컴파일러 책은 *기법*(SSA, register allocation, loop tiling 같은 구체 테크닉)을 가르친다. 그런데 MLIR 논문은 특이하게도 *기법*보다 *원칙*에서 출발한다. 저자들 — Chris Lattner(LLVM/Clang/Swift, 그리고 MLIR의 창시자) 외 — 은 "*the 'art' of compiler IR and abstraction design is not well understood*"(컴파일러 IR과 추상화를 설계하는 '기예'는 아직 잘 이해되지 않았다)라고 솔직히 인정하면서 [2], 그 공백을 메우려고 *세 가지 설계 원칙*으로 모든 결정을 정당화한다. 인물의 아크는 이 논문에서 끝나지 않는다 — Lattner는 이후 2022년 Modular를 창업했고, 2025년 "Democratizing AI Compute" 시리즈 [11]–[21]에서 이 원칙들의 실전 성적을 본인이 직접 채점한다. 그 회고는 9장(에필로그)에서 다룬다.

> 용어 한 줄 정의 — **IR(Intermediate Representation, 중간 표현)**: 소스 코드와 기계어 사이에서 컴파일러가 다루는 프로그램의 내부 형태. **Dialect(다이얼렉트)**: 특정 도메인(예: 텐서 연산, 루프, GPU)에 맞춘 연산(Op)·타입의 묶음, 일종의 "방언". **Lowering(로워링)**: 고수준 표현을 더 저수준 표현으로 한 단계 내리는 변환.

이게 왜 중요한가. MLIR은 *누구나 자기 dialect를 추가*할 수 있는 시스템이다. 새 하드웨어를 만든 사람이 자기 가속기용 dialect를 정의할 수 있다. 그러면 이 세 원칙은 *코어 설계자만의 규약*이 아니라 *모든 확장 작성자가 따라야 할 가이드라인*이 된다. ISA(Instruction Set Architecture)를 한 번 잘 정의해두면 그 위에 수많은 구현이 일관되게 올라오는 것과 비슷하다 — 원칙이 곧 생태계의 합의 규약이다.

세 원칙은 **Parsimony(절약)**, **Traceability(추적가능성)**, **Progressivity(점진성)**다. 이들은 서로 공명하기도 하고 충돌하기도 한다. 그리고 이 발표에서 강조하고 싶은 부분 — 저자들이 *충돌을 직접 인정한다*.

## 원칙 1 — Parsimony (절약, Occam의 면도날)

> "*Apply Occam's razor to builtin semantics, concepts, and programming interface. ... Specify invariants once, but verify correctness throughout.*" [2]

한 줄로: **"코어는 최대한 작게 만들고, 나머지는 전부 *속성*으로 일반화하라."**

전통적 컴파일러 IR은 내장 개념이 많다 — function 클래스, module 클래스, instruction 클래스, phi 노드, branch, switch, call, return… 각각이 고유 타입에 고유 메서드를 가진다. MLIR은 정반대 길을 택했다. **모든 것이 Op(Operation, 연산 하나의 단위)다.**

- 함수도 Op이다 (`func.func`)
- 모듈도 Op이다 (`builtin.module`)
- 상수도 Op이다 (`arith.constant`)
- 함수 호출도 Op이다 (`func.call`)

> "*Functions and Modules ... are not separate concepts in MLIR: they are implemented as Ops in the builtin dialect, again an illustration of parsimony in the design.*" [2]

즉 코어는 단 하나의 추상 — Operation — 만 알면 된다. 나머지는 Op + 속성(attribute) + 영역(region) + 특성(trait)의 조합이다. 하드웨어로 비유하면, 복잡한 CISC 명령을 잔뜩 넣는 대신 소수의 단순 primitive로 모든 것을 조립하는 RISC 철학에 가깝다.

### 핵심 기법 — "inverting"

코어가 작아도 *일반 패스*(공통 최적화: 죽은 코드 제거 DCE, 공통 부분식 제거 CSE, 정규화 canonicalization, 인라이닝 등)는 작동해야 한다. 어떻게? MLIR은 *특성/인터페이스(trait/interface) 시스템*으로 해결한다. Op이 "나는 교환법칙이 성립한다(`IsCommutative`)"거나 "나는 부작용이 없다(`NoSideEffects`)"고 *선언*하면, 일반 패스는 그 선언만 보고 자동으로 작동한다.

여기서 발표에서 강조할 가장 결정적인 한 문장:

> "*MLIR handles extensibility by inverting the common approach: since there are more Ops than passes, it is easier for Ops to know about passes.*" [2]

핵심 단어는 **"inverting"(뒤집기)**다. LLVM의 `InstCombine`이나 `PeepholeOptimizer`는 *모든 opcode를 알아야* 했다 — 패스 하나가 세상의 모든 연산을 알아야 하니, 새 연산이 추가될 때마다 이 거대한 패스를 손봐야 했고 유지보수가 악명 높았다. MLIR은 거꾸로 *Op이 자기 능력을 선언*하고 패스는 그 선언만 본다. "Op은 패스보다 수가 많으니, Op이 패스를 아는 편이 더 쉽다"는 논리다. 결과적으로 그 유지보수 부담이 코어의 한 거대 패스에 몰리지 않고 *각 Op으로 분산*된다 [2].

### 효과

- Op·Type·Attribute가 모두 user-extensible — 코어를 안 건드리고 새 연산 추가
- 암시적 타입 변환 없음 — 모든 변환은 명시적 Op이라 디버깅이 쉽다
- whole-module use-def chain을 안 가짐 → 모듈 단위 *병렬 컴파일* 가능 [2]
- 패턴 재작성 도구조차 MLIR 자신의 dialect로 표현 (도그푸딩)

## 원칙 2 — Traceability (추적가능성)

> "*Retain rather than recover information. Declare rules and properties to enable transformation, rather than step wise imperative specification. ... Composable abstractions stem from 'glassboxing' their properties ...*" [2]

핵심 동사 셋: **retain / declare / verify** (보존 / 선언 / 검증).

**(a) Retain — 정보를 *복원*하지 말고 *보존*하라.** 모든 Op은 자기가 어디서 왔는지(소스 파일의 line:col, AST 노드 등) 알아야 한다. MLIR은 모든 Op에 *Location(위치)* 정보를 붙이고 변환 내내 전파한다 [2]. 흥미로운 점: Location도 *attribute의 한 종류*라서 — 즉 Traceability를 Parsimony의 메커니즘(단 하나의 attribute 체계)으로 구현한 셈이다. 두 원칙이 드물게 공명하는 지점이다.

**(b) Declare — 변환은 *명령형 코드*로 짜지 말고 *선언적 규칙*으로 작성하라.** Op의 이름·입출력·속성·검증기를 TableGen(ODS)으로 *선언*하면 C++ boilerplate가 자동 생성된다. IR 변환은 "이 패턴 → 저 패턴"의 선언적 규칙으로 쓴다.

> "*This design separates generic logic from Op-specific logic and puts the latter in the Op itself, reducing the well-known maintenance and complexity burden of 'InstCombine', 'PeepholeOptimizer' and the likes in LLVM.*" [2]

**(c) Verify — 선언된 불변식(invariant)은 곳곳에서 검증한다.** "이 Op의 피연산자는 같은 타입이어야 한다" 같은 규칙을 *한 번 선언*하면, MLIR은 매 패스 뒤 자동으로 verifier를 돌려 *여러 곳에서* 검증할 수 있다.

### 왜 — 디버깅과 보안

복잡한 다단계 컴파일에서 "최종 코드가 *왜* 이렇게 생성됐는가"는 종종 불가해하다. Traceability는 모든 Op에 기원을 붙여 최종 IR에서 원본을 역추적 가능하게 한다. 더 절실한 동기는 *보안·안전*이다. 저자들은 **WYSINWYX** — "What You See Is Not What You eXecute"(당신이 보는 것은 실행되는 것이 아니다) — 문제를 든다. 소스에서 보호하려던 보안 속성(예: 사이드채널 회피를 위한 상수 시간 비교)을 컴파일러가 최적화로 깨버리는 일이 실제로 일어난다. Traceability는 이런 변환을 *감사(audit) 가능*하게 만들어 소프트웨어 인증을 돕는다 [2].

### Glassboxing

전통 OOP의 캡슐화는 내부를 *숨긴다*(blackbox). **Glassboxing(유리상자화)**은 정반대 — 내부 속성을 *명시적으로 노출*해 외부에서 *질의(query)* 가능하게 한다. C++ 비유가 정확하다: `std::is_trivially_copyable<T>` 같은 *타입 특성(type trait)* 은 타입의 속성을 컴파일 타임에 질의하게 노출하는데, MLIR의 Op trait/interface가 바로 이 패턴이다. Op이 `LoopLikeOpInterface`를 구현하면 루프 불변 코드 이동(LICM) 패스가 그걸 질의해 자동 작동하는 식이다.

## 원칙 3 — Progressivity (점진성)

> "**Premature lowering is the root of all evil.** Beyond representation layers, allow multiple transformation paths that lower individual regions on demand. ..." [2]

슬로건: **"조기 로워링은 모든 악의 근원이다."**

한 줄로: **"고수준 의미를 너무 빨리 잃지 마라. *영역(region) 단위로*, *수요에 따라* 내려가라."**

### 왜 "조기 로워링"이 악인가

고수준 정보 — 텐서 shape, 루프 중첩 구조, affine 의존성, 메모리 layout 의도 — 는 분석과 최적화의 핵심 재료다. 이게 컴파일 초반에 사라지면 후속 분석은 그것을 *역공학*해야 하는데, 역공학은 fragile(잘 안 됨)·expensive(분석 코드 비대)·invasive(모든 패스를 다시 손봐야 함)하다 [2].

> 용어 — **affine(아핀)**: 인덱스에 대해 일차식(곱·합)으로 표현되는 형태. 루프 인덱스 `i, j`에 대해 `2*i + j + 3` 같은 식. 배열 접근과 루프 경계가 이 형태면 수학적으로 의존성·재배치를 정밀 분석할 수 있다. **polyhedral(폴리헤드럴)**: 루프 반복 공간을 다면체로 보고 affine 변환으로 최적화하는 이론.

산업적 실사례: LLVM의 폴리헤드럴 최적화기 **Polly**는 LLVM IR로부터 SCoP(정적 제어 영역)을 *다시 검출*해야 한다. LLVM IR이 폴리헤드럴 구조를 너무 일찍 지워버렸기 때문이다. Progressivity는 애초에 그 구조를 IR에 *보존*해 이 문제를 피하자는 것이다 [2].

### MLIR의 해법 — 다층 dialect 공존 + region first-class

LLVM의 CFG(제어 흐름 그래프)는 *평평*하다 — 함수는 기본 블록의 단순 리스트라, 루프 구조는 별도 분석으로 *추출*해야 한다. MLIR은 *region을 IR의 1급 시민*으로 둔다. `affine.for`는 region을 가진 Op이고 그 안에 body가 중첩된다 — 루프 구조가 분석 결과가 아니라 *IR 그 자체*다.

```mlir
affine.for %i = 0 to %N {
  affine.for %j = 0 to %M {
    %v = affine.load %A[%i, %j] : memref<?x?xf32>   // A[i][j]를 읽고
    affine.store %v, %B[%i, %j] : memref<?x?xf32>   // B[i][j]에 쓴다
  }
}
```
*해설: 두 겹 루프 구조가 코드에 그대로 남아 있다. 컴파일러가 "이게 루프다"를 추측할 필요 없이, 루프 중첩이 IR에 명시되어 있어 타일링·교환 같은 변환을 바로 적용할 수 있다.*

이 선택에는 비용도 있다. 저자들은 LLVM이 *정규화(normalization)로 복잡성을 제어*한 길을 MLIR이 *의식적으로 포기*했다고 명시한다 [2]. 대신 고수준 구조 보존을 얻었다 — trade-off에 대한 의도적 선택이다.

### "the most profound"

저자들이 직접 *가장 심오한*(most profound) 특징이라 부른 것:

> "*One of the most profound (but also most difficult to grok) aspects of MLIR is that it allows and encourages mixing operations from different dialects together within a single program.*" [2]

서로 다른 dialect의 Op이 *한 프로그램 안에 공존*한다. `affine.for`(고수준 루프), `arith.addf`(산술), `llvm.call`(저수준 ABI)이 같은 함수에 섞일 수 있다. 한 dialect는 다른 dialect의 의미를 *몰라도* (interface로 추상화된 한) 자기 변환을 적용한다. 부분 변환(partial conversion)이 가능해, 패턴이 매칭되는 Op만 내리고 나머지는 그대로 둔다.

## 원칙들의 충돌 — 그리고 저자들의 정직함

발표에서 가장 강조하고 싶은 대목. 저자들은 §II에서 *원칙들이 서로 충돌한다*고 직접 인정한다:

> "*While these principles are well established, one of them is often implemented at the expense of another; e.g., layering in network and operating system stacks aligns with the progressivity principle but breaks parsimony. ... following these principles may hurt expressiveness and effectiveness; e.g., traceability in safety-critical and secure systems involves limiting optimizations or design aggressivity.*" [2]

가장 직관적인 예가 본문에 박혀 있다 — **OSI 7계층 비유**다. 네트워크 스택의 7계층은 *점진성(progressivity)* 의 모범(각 계층이 다음 계층을 추상화)이지만 *절약(parsimony)* 과는 정반대다 — 7개 계층의 어휘를 모두 알아야 한다. dialect를 늘릴수록 시스템 어휘가 늘어 parsimony가 깨지는 것과 똑같은 긴장이다.

| 충돌 쌍 | 충돌의 본질 | MLIR의 대처 | 근본 해소? |
|---|---|---|---|
| Progressivity $\leftrightarrow$ Parsimony | layer가 늘면 시스템 어휘가 늘어난다 (OSI 7계층 비유) | dialect는 opt-in, 일반 패스는 trait/interface로만 작동 | 부분만 |
| Traceability $\leftrightarrow$ 최적화 공격성 | 최적화는 본질적으로 정보를 버린다 (DCE/CSE/folding) | Location은 항상 보존, 나머지는 dialect가 결정 | 트레이드오프 |
| Parsimony $\leftrightarrow$ Expressiveness | 코어가 작으면 사용자가 직접 많이 정의해야 → 비호환 난립 위험 | 공통 dialect 표준 제공 + 거버넌스 | 사회적 문제, 미해소 |
| Traceability $\leftrightarrow$ Parsimony | 추적 정보가 메타 필드를 늘린다 | Location도 attribute 메커니즘에 흡수 | 공명 (해소) |

특히 Parsimony $\leftrightarrow$ Expressiveness 충돌에 대해 저자들은 "순수 *기술적* 해결책은 없다(there is unlikely to be a purely technical solution)"고까지 명시한다 [2] — 거버넌스와 커뮤니티 표준화로 풀어야 할 영역이라는 인정이다.

이 자기 인정이 핵심이다. MLIR은 자신을 *완성된 답*이 아니라 *균형 잡힌 절충*, 더 나아가 *새 연구의 시작*으로 자리매김한다.

> "*MLIR catalyzes new areas of research, as well as new approaches to teaching the art of compiler and IR design.*" [2]

세 원칙은 *지향점*이고 현실은 트레이드오프다. 풀려던 fragmentation 문제가 *한 단계 위에서 dialect 폭발로 재발*할 수 있으며 이를 막을 기술적 솔루션은 없다는 자기 인정 — 바로 이 점이 이 논문을 *예외적으로 정직한 시스템 논문*으로 만든다. 이것이 Chris Lattner 류 설계 철학의 정수다: 원칙을 세우되, 그 원칙의 한계까지 함께 문서화한다.

그리고 그 한계 문서화는 예언이 됐다 — "기술로는 못 막는다"던 dialect 파편화가 실제로 어떻게 전개됐는지, 같은 저자의 2025년 회고 [18]가 9장(에필로그)에서 답한다.

---

[← 이전](03_concepts.md) | [목차](README.md) | [다음 →](05_progressive_lowering.md)
