# Appendix B: MLIR 자체 지원 기능 (Built-in Passes)

[← Appendix A](06_appendix_a_mlir_dialects.md) | [목차](README.md) | [다음: Appendix C →](08_appendix_c_mlir_extras.md)

---

## B.1 CSE (Common Subexpression Elimination)

```mlir
// Before CSE
%a = arith.addi %x, %y : i32
%b = arith.addi %x, %y : i32    // %a와 동일한 연산!
%c = arith.muli %a, %b : i32

// After CSE
%a = arith.addi %x, %y : i32
%c = arith.muli %a, %a : i32    // %b 제거, %a 재사용
```

- **동일한 연산을 한 번만 수행**하도록 중복 제거
- Pass: `-cse`
- 거의 모든 Pass 이후에 실행하면 좋음

## B.2 DCE (Dead Code Elimination)

```mlir
// Before DCE
%a = arith.addi %x, %y : i32
%b = arith.muli %x, %y : i32    // %b는 아무 데서도 사용되지 않음
return %a

// After DCE
%a = arith.addi %x, %y : i32
return %a                        // %b 제거
```

- **사용되지 않는 연산을 제거**
- SSA 기반이라 사용 여부 판별이 간단 (use-def chain)

## B.3 Canonicalization

```mlir
// Before Canonicalize
%a = arith.addi %x, %c0 : i32     // x + 0 → x
%b = arith.muli %y, %c1 : i32     // y * 1 → y
%c = arith.subi %z, %z : i32      // z - z → 0

// After Canonicalize
// %a → %x, %b → %y, %c → 0
```

- 각 Op이 자체적으로 정의한 **정규화 규칙**을 적용
- 항등 연산 제거, 상수 폴딩, 패턴 단순화
- Pass: `-canonicalize`
- **CSE와 함께 가장 빈번하게 사용**되는 Pass

## B.4 Inlining

```mlir
// Before Inlining
func.func @add(%a: f32, %b: f32) -> f32 {
  %r = arith.addf %a, %b : f32
  return %r : f32
}
func.func @main(%x: f32, %y: f32) -> f32 {
  %r = func.call @add(%x, %y) : (f32, f32) -> f32
  return %r : f32
}

// After Inlining — @add가 @main에 인라인됨
func.func @main(%x: f32, %y: f32) -> f32 {
  %r = arith.addf %x, %y : f32
  return %r : f32
}
```

- 함수 호출을 본문으로 대체 → 호출 오버헤드 제거 + 추가 최적화 기회
- Pass: `-inline`

## B.5 LICM (Loop-Invariant Code Motion)

```mlir
// Before LICM
affine.for %i = 0 to 128 {
  %c = arith.addi %x, %y : i32    // 루프 불변!
  %v = memref.load %buf[%i] : memref<128xi32>
  %r = arith.addi %v, %c : i32
  memref.store %r, %out[%i] : memref<128xi32>
}

// After LICM
%c = arith.addi %x, %y : i32      // 루프 밖으로 이동
affine.for %i = 0 to 128 {
  %v = memref.load %buf[%i] : memref<128xi32>
  %r = arith.addi %v, %c : i32
  memref.store %r, %out[%i] : memref<128xi32>
}
```

- 루프 내에서 **값이 변하지 않는 연산**을 루프 밖으로 이동
- Pass: `-loop-invariant-code-motion`

## B.6 SCCP (Sparse Conditional Constant Propagation)

일반 Constant Propagation은 직선 코드에서 상수를 대체하지만, SCCP는 **조건 분기의 도달 가능성까지 분석**하여 상수 전파와 죽은 분기 제거를 동시에 수행한다.

```mlir
// Before SCCP
func.func @example() -> i32 {
  %c1 = arith.constant 1 : i32
  %c10 = arith.constant 10 : i32
  %c0 = arith.constant 0 : i32
  %flag = arith.constant true

  %val = scf.if %flag -> i32 {       // flag는 항상 true
    scf.yield %c10 : i32              // → 이 경로만 도달 가능
  } else {
    scf.yield %c0 : i32               // → 도달 불가능, 무시
  }
  %result = arith.addi %val, %c1 : i32
  return %result : i32
}

// After SCCP — 함수 전체가 상수로 축소
func.func @example() -> i32 {
  %c11 = arith.constant 11 : i32
  return %c11 : i32
}
```

### 동작 원리

1. **조건 분기를 평가** — 조건이 상수이면 한쪽 경로만 "도달 가능"으로 판정
2. **도달 불가능한 블록은 무시** — 거기서 오는 값은 분석에서 제외
3. **여러 경로에서 오는 값을 합침**:
   - 모든 도달 가능 경로에서 같은 상수 → **상수 확정**
   - 경로마다 다른 값 → 상수 아님 (포기)
   - 도달 가능 경로가 하나뿐 → 그 값이 상수

### 일반 Constant Propagation과의 차이

| | Constant Propagation | SCCP |
|---|---|---|
| 분석 범위 | 직선 코드 | **조건 분기 포함** |
| 도달 불가능 코드 | 모름 | **식별하여 무시** |
| 효과 | 상수 대체 | 상수 대체 **+ 죽은 분기 제거** |

### "Sparse"의 의미

모든 블록을 순회하는 대신 **SSA의 def-use chain**을 따라 관련된 값만 추적한다. 불필요한 블록을 건너뛰어 효율적.

- Pass: `-sccp`

## B.7 Symbol DCE

- 사용되지 않는 **함수, 글로벌 변수** 등 심볼 수준 dead code 제거
- Pass: `-symbol-dce`

---

## B.8 표준 최적화 파이프라인 패턴

실전에서는 Pass를 **조합**하여 반복 적용한다:

```
커스텀 변환 Pass
  → canonicalize    (패턴 정규화)
  → cse             (중복 제거)

커스텀 변환 Pass
  → canonicalize
  → cse

... 반복
```

> **매 변환 후 canonicalize + cse**를 습관적으로 적용하면 IR이 깨끗하게 유지된다.

---

[← Appendix A](06_appendix_a_mlir_dialects.md) | [목차](README.md) | [다음: Appendix C →](08_appendix_c_mlir_extras.md)
