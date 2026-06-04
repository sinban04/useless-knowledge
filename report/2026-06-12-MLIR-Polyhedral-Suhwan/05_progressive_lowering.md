# 5. Progressive Lowering과 현대 컴파일러 파이프라인 — MLIR은 어떻게 쓰이는가

[← 이전](04_design_philosophy.md) | [목차](README.md) | [다음 →](06_polyhedral_model.md)

---

## MLIR은 결국 "한 번에 안 내려간다"

앞 섹션까지 MLIR이 *무엇인지*(여러 dialect가 공존하는 IR 인프라)를 봤다면, 이번 섹션은 *실제로 어떻게 쓰이는지*다. 핵심 키워드는 **progressive lowering(점진적 하강)** 이다.

여기서 잠깐 용어 정리. **IR**(intermediate representation, 중간 표현)은 소스 코드와 기계어 사이에서 컴파일러가 다루는 프로그램의 내부 표현이다. **dialect**(방언)는 MLIR 안에서 특정 추상화 수준·도메인을 담당하는 op(연산) 묶음이다. **lowering**(하강)은 높은 추상화의 표현을 더 낮은(기계에 가까운) 표현으로 바꾸는 것이다.

비유하자면 ISA 설계에서 "한 명령으로 모든 걸 하는 CISC 거대 명령"을 만들지 않고, 마이크로옵(micro-op)으로 쪼개 단계적으로 실행하는 것과 같다. MLIR은 고수준 의미를 단번에 기계어로 떨어뜨리지 않고, *추상화 계단을 한 칸씩* 내려간다. 각 계단에서 그 계단에 맞는 분석·최적화를 끝낸 뒤 결과만 다음 계단으로 넘긴다 [1][2].

## 한 dialect가 두 단계의 하강을 가진다

progressive lowering을 정확히 이해하는 열쇠는, **하나의 dialect가 두 종류의 "내려가기"를 가진다**는 점이다 [8].

### (1) 내부 lowering — 같은 dialect 안에서 더 기본적인 op으로

같은 dialect 안에 머무르되, 추상도가 높은 op을 더 fundamental한(원시적인) op들로 풀어쓴다. 예를 들어 affine dialect의 `--affine-expand-index-ops` pass는 다중 결과를 내는 고수준 인덱스 op을 여러 개의 기본 인덱스 계산 op으로 분해한다. 결과물은 *여전히 affine.\* op*이다 — 분석 영역을 떠나지 않는다.

```mlir
// 입력: 평탄한 인덱스 %t를 (4,3,2) 모양으로 풀어내는 고수준 op
%i, %j, %k = affine.delinearize_index %t into (%c4, %c3, %c2) : index, index, index
// 출력: 여전히 affine — 나눗셈/나머지로 풀어쓴 기본 affine.apply 3개
%0 = affine.apply affine_map<()[s0] -> (s0 floordiv 6)>()[%t]
%1 = affine.apply affine_map<()[s0] -> ((s0 mod 6) floordiv 2)>()[%t]
%2 = affine.apply affine_map<()[s0] -> (s0 mod 2)>()[%t]
```
한 줄 해설: 인덱스 하나를 다차원 좌표로 푸는 "편한 op"을, 사람이 손으로 쓰던 floordiv/mod 산식 3개로 바꾸되 여전히 affine 영역 안에 있다. (3,2 모양에서 첫 좌표는 `t floordiv 6`, 다음은 `(t mod 6) floordiv 2`, 마지막은 `t mod 2`.)

### (2) 경계 졸업 — 다른 dialect로 넘어가기

이제 해당 dialect에서 할 일을 다 했으면, 다른 dialect로 *완전히 이전*한다. affine dialect의 `--lower-affine` pass가 대표적이다. affine의 루프·조건·메모리 접근 op을 scf(structured control flow, 구조적 제어 흐름) + arith(arithmetic, 산술) + memref(memory reference, 메모리 참조) dialect로 바꾼다. 이 변환은 **ConversionPattern**(변환 패턴)이라는 프레임워크로 구현된다 — 출력에는 더 이상 affine.\*가 남지 않는다 [8].

```mlir
// 입력 (affine 영역)
affine.for %i = 0 to 32 { affine.load %A[%i] }
// 출력 (affine 졸업: scf + arith + memref)
%c0 = arith.constant 0 : index
%c32 = arith.constant 32 : index
%c1 = arith.constant 1 : index
scf.for %arg1 = %c0 to %c32 step %c1 {
  memref.load %arg0[%arg1] : memref<32xf32>
}
```
한 줄 해설: affine 전용 루프가 일반적인 구조적 for 루프와 평범한 메모리 load로 "졸업"한다. 루프 경계도 더 이상 affine 속성이 아닌 평범한 `arith.constant`가 된다. 여기서부터는 affine 분석 도구가 더 이상 관여하지 않는다.

정리하면 — **내부 lowering**은 같은 영역에서 더 원시적으로(분석 영역 유지), **경계 졸업**은 다른 영역으로 완전 이전(layer 이동)이다 [8].

## 4단계 추상화 계단

이 두 가지 하강을 쌓으면, ML 컴파일러의 전형적인 4단계 계단이 나온다 [8].

```
[계단 1] linalg     — 고수준 의미 (예: linalg.matmul = "행렬곱"이라는 뜻 그대로)
   │  --convert-linalg-to-affine-loops   (경계 졸업)
   ▼
[계단 2] affine     — 폴리헤드럴 분석 영역 (루프 변환·타일링·병렬화가 자연스러운 곳)
   │     ├─ [내부] --affine-expand-index-ops
   │  --lower-affine                       (경계 졸업)
   ▼
[계단 3] scf + arith + memref   — imperative(명령형) 저수준: 일반 루프·산술·메모리
   │  --convert-scf-to-llvm + --convert-arith-to-llvm + ...   (경계 졸업)
   ▼
[계단 4] LLVM IR    — codegen(코드 생성) 대상
```

여기서 잠깐 용어. **affine**(아핀)은 인덱스가 루프 변수들의 *1차 결합*(상수배의 합)으로만 표현되는 영역을 말한다. **폴리헤드럴**(polyhedral)은 그 루프 반복 공간을 다면체(부등식 집합)로 모델링해 변환을 수학적으로 다루는 분석 기법이다 [4][6]. 이 계단의 핵심은 — **폴리헤드럴 분석은 계단 2(affine)에서 자연스럽게 일어나고**, 그 변환 결과만 계단 3으로 졸업한다는 점이다. 각 계단이 자기 영역에서 할 일을 끝내고 결과만 넘긴다 [1][8]. (계단 2의 affine/폴리헤드럴 변환이 실제로 뭘 하는지는 다음 섹션에서 애니메이션으로 본다.)

이게 왜 강점인가? LLVM 같은 전통적 IR은 추상화 차이를 기껏해야 pass 순서로만 흉내 낼 뿐 *dialect 시스템 자체가 없다*. Polly는 LLVM IR 한 종류 안에서 분석하고 다시 LLVM IR로 돌아온다 [5][10]. Pluto/CLooG류는 소스→IR→소스로 회귀할 뿐 progressive lowering이 없다 [4]. MLIR만이 dialect 시스템 + ConversionPattern으로 *자유로운 다단계 하강*을 한다 [1][2].

## 입구는 어디인가 — ML 프레임워크 그래프가 MLIR로 들어오는 길

계단 꼭대기(계단 1보다 더 위)에는 ML 프레임워크의 연산 그래프가 들어오는 입구 dialect가 있다. 대표가 **StableHLO**다. 원래 XLA(Google의 ML 컴파일러) 내부 IR이던 HLO를 OpenXLA 거버넌스로 분리·표준화해, frontend(프레임워크)와 compiler 사이의 portable interface로 만든 MLIR dialect다 [9]. (HLO = High-Level Optimizer IR. XLA = Accelerated Linear Algebra.) 비슷한 입구로 tosa도 있다.

실무에서 모델이 MLIR로 들어오는 대표적인 producer 경로 한 예:

```
ONNX → onnx2torch → torch.export → torch_xla → StableHLO
```

ONNX(개방형 모델 포맷)를 PyTorch로 받아 export하고, torch_xla를 거쳐 StableHLO로 떨군다. 이런 경로가 선호되는 이유는 QDQ(양자화) 패턴을 완전히 제어할 수 있고, weight 매핑(MLIR arg와 원본 parameter의 정확한 연결)과 디버깅이 쉽기 때문이다.

## 예시 — 전형적인 NPU 백엔드가 upstream affine pass를 재사용하는 방식

이 계단 모델이 책상 위 이론이 아님을 보여주는, 전형적인 NPU 백엔드 lowering 시나리오를 예로 든다. StableHLO를 입력으로 받아 NPU(neural processing unit, 신경망 가속기) 하드웨어에 맞게 내려보내는 경로는 대략 다음과 같이 짤 수 있다.

- **spatial tiling (예: $32\times 32$)**: NPU의 on-chip SRAM(예: Unified Buffer) 크기 제한 때문에 feature map을 타일 단위로 쪼갠다. 출력 기준으로 타일을 나누고 입력 receptive field를 역산하며, 버퍼 예산 안에서 최대 타일 크기를 탐색한다(adaptive tiling). — 캐시 크기에 맞춰 blocking하는 것과 같은 발상이다.
- **custom bufferization**: tensor(값 의미) 표현을 memref(실제 메모리 버퍼)로 바꾼다. upstream의 one-shot bufferize가 백엔드 고유의 custom op까지는 다루지 못하는 경우, 그 부분만 직접 작성해 보완한다.
- **scf.forall → affine.for**: 타일 루프를 affine 영역으로 끌어올려 폴리헤드럴 분석 대상으로 만든다.
- **멀티코어 분배**: 그리고 **MLIR upstream의 affine pass를 그대로 재사용**한다 — `affine-loop-coalescing`(2D 루프를 1D로 합침) + `affine-loop-tile`(strip-mining으로 코어 수만큼 타일을 나눠 분배, 예: 8-core면 `tile-size=8`). 멀티코어에 일감을 쪼개 나눠주는 작업을, 컴파일러 인프라가 공짜로 제공하는 셈이다.

핵심은 — *upstream의 범용 affine pass를 NPU 백엔드가 자기 파이프라인에 그대로 끼워 재사용*할 수 있다는 점이다. 이게 MLIR 재사용 철학의 실증이다 [1][2].

## Custom dialect로 졸업하기 — MLIR의 진짜 강점

마지막 한 가지. `--lower-affine`은 target이 scf/arith/memref로 **hard-coded(고정)** 되어 있다. 그러면 "내 NPU dialect로 내리고 싶은데?" 싶을 텐데 — 바로 여기가 MLIR의 핵심 강점이다. **본인이 ConversionPattern을 작성하면 affine을 임의의 dialect로 졸업시킬 수 있다** [8].

```cpp
struct AffineForToMyNPUPattern : OpConversionPattern<affine::AffineForOp> {
  LogicalResult matchAndRewrite(affine::AffineForOp op, OpAdaptor adaptor,
      ConversionPatternRewriter &rewriter) const override {
    // affine.for → my_npu.parallel_loop 로 직접 변환
    auto npuLoop = rewriter.create<my_npu::ParallelLoopOp>(
        op.getLoc(), op.getLowerBound(), op.getUpperBound(), op.getStep());
    rewriter.inlineRegionBefore(op.getRegion(), npuLoop.getRegion(),
                                npuLoop.getRegion().end());
    rewriter.eraseOp(op);
    return success();
  }
};
// 등록: target.addLegalDialect<my_npu::MyNPUDialect>();
//       target.addIllegalDialect<affine::AffineDialect>();
```
한 줄 해설: affine 루프를 표준 scf 대신 *내가 정의한 NPU 전용 루프 op*으로 바꾸는 변환 규칙. target을 내 dialect로 지정(addLegalDialect)하면 끝이다.

즉 **affine 영역에서 폴리헤드럴 분석·변환을 다 마친 결과를, 내 가속기 dialect로 졸업**시킬 수 있다. 이것이 새 하드웨어 백엔드를 만들 때 MLIR을 고르는 가장 큰 이유다. 실제로 Gemmini·NVDLA·Tenstorrent 같은 오픈 HW 타겟을 겨냥한 컴파일러들도, 바로 이 "기존 상위 계단을 재사용하고 마지막 졸업만 내 타겟으로" 전략을 전제로 한다.

> 한 가지 예고: "그럼 어느 계단부터를 내 하드웨어 ISA가 책임지고, 어디까지를 컴파일러가 책임지나?" 하는 *경계 책임 분담* 문제는 발표 마지막 종합 섹션에서 더 깊이 다룬다.

---

[← 이전](04_design_philosophy.md) | [목차](README.md) | [다음 →](06_polyhedral_model.md)
