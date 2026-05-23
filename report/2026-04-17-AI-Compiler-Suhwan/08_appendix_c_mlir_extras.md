# Appendix C: 추가로 많이 활용되는 MLIR 기능들

[← Appendix B](07_appendix_b_mlir_builtin.md) | [목차](README.md) | [다음: Appendix D →](09_appendix_d_polyhedral.md)

---

## C.1 Linalg Dialect

고수준 선형대수 연산을 표현하며, **Tiling과 Fusion의 주요 대상**.

| Op | 설명 |
|---|---|
| `linalg.matmul` | 행렬 곱셈 |
| `linalg.conv_2d_nhwc_hwcf` | 2D Convolution (다양한 layout 변형) |
| `linalg.generic` | **범용 Op** — indexing_maps로 임의 연산 표현 |
| `linalg.fill` | 텐서/버퍼를 상수로 채우기 |
| `linalg.dot` | 벡터 내적 |
| `linalg.batch_matmul` | 배치 행렬 곱셈 |

### linalg.generic — 핵심

```mlir
// 요소별 덧셈을 generic으로 표현
linalg.generic {
    indexing_maps = [
        affine_map<(d0, d1) -> (d0, d1)>,  // A
        affine_map<(d0, d1) -> (d0, d1)>,  // B
        affine_map<(d0, d1) -> (d0, d1)>   // C
    ],
    iterator_types = ["parallel", "parallel"]
} ins(%A, %B : tensor<4x4xf32>, tensor<4x4xf32>)
  outs(%C : tensor<4x4xf32>) {
    ^bb0(%a: f32, %b: f32, %c: f32):
        %sum = arith.addf %a, %b : f32
        linalg.yield %sum : f32
} -> tensor<4x4xf32>
```

- `indexing_maps`: 각 인자가 루프 인덱스에 어떻게 매핑되는지 (아핀 맵)
- `iterator_types`: 각 차원이 `parallel`(병렬) 또는 `reduction`(축소)인지

## C.2 Vector Dialect

**SIMD/벡터 연산**을 명시적으로 표현.

| Op | 설명 |
|---|---|
| `vector.transfer_read` | 메모리에서 벡터로 읽기 (패딩, 마스킹 지원) |
| `vector.transfer_write` | 벡터를 메모리에 쓰기 |
| `vector.contract` | 벡터 축소 연산 (matmul의 벡터 버전) |
| `vector.broadcast` | 스칼라/작은 벡터를 큰 벡터로 확장 |
| `vector.fma` | Fused Multiply-Add |
| `vector.reduction` | 벡터 원소 축소 (sum, max, ...) |
| `vector.mask` | 조건부 벡터 연산 |

- Linalg → Vector로 lowering하면 **자동 벡터화** 효과
- CPU의 SSE/AVX, ARM NEON 등에 매핑

## C.3 Func Dialect

함수 정의와 호출.

| Op | 설명 |
|---|---|
| `func.func` | 함수 정의 |
| `func.call` | 함수 호출 |
| `func.return` | 함수 반환 |

## C.4 GPU Dialect

GPU 실행 모델을 표현.

| Op | 설명 |
|---|---|
| `gpu.launch` | GPU 커널 런치 (grid/block 크기 지정) |
| `gpu.thread_id` | 스레드 ID |
| `gpu.block_id` | 블록 ID |
| `gpu.barrier` | 동기화 배리어 |
| `gpu.alloc` / `gpu.dealloc` | GPU 메모리 할당/해제 |
| `gpu.memcpy` | Host ↔ Device 메모리 복사 |

## C.5 Transform Dialect

**컴파일러 변환 전략을 IR로 표현** — 변환을 데이터처럼 다룬다.

```mlir
transform.sequence failures(propagate) {
^bb0(%arg0: !transform.any_op):
  // matmul을 찾아서 타일링
  %matmul = transform.structured.match ops{["linalg.matmul"]} in %arg0
  %tiled, %loops = transform.structured.tile_using_for %matmul [32, 32, 16]
}
```

- 최적화 전략 자체를 IR로 기술 → **재현 가능하고 디버깅 가능한 변환**
- PolyMorphous 논문의 Schedule Dialect도 이 아이디어에 기반

## C.6 자주 사용하는 유틸리티 Pass

| Pass | 설명 |
|---|---|
| `-convert-linalg-to-loops` | linalg → scf.for 루프로 변환 |
| `-convert-linalg-to-affine-loops` | linalg → affine.for 루프로 변환 (memref 필요) |
| `-convert-scf-to-cf` | 구조적 제어흐름 → 기본 제어흐름 (branch/cond_branch) |
| `-convert-arith-to-llvm` | arith → LLVM dialect |
| `-convert-func-to-llvm` | func → LLVM dialect |
| `-convert-memref-to-llvm` | memref → LLVM dialect |
| `-one-shot-bufferize` | tensor → memref 자동 변환 |
| `-buffer-deallocation` | 메모리 해제 자동 삽입 |
| `-buffer-hoisting` | 버퍼 할당을 상위 스코프로 이동 |
| `-buffer-loop-hoisting` | 루프 내 버퍼 할당을 루프 밖으로 이동 |
| `-test-linalg-transform-patterns` | linalg 변환 패턴 테스트 |

## C.7 mlir-opt 실전 사용

```bash
# 파이프라인 예시: linalg matmul → 타일링 → bufferization → affine 루프 → LLVM
mlir-opt input.mlir \
  -linalg-tile="tile-sizes=32,32,16" \
  -one-shot-bufferize \
  -convert-linalg-to-affine-loops \
  -affine-loop-tile="tile-sizes=4,4" \
  -lower-affine \
  -canonicalize -cse \
  -convert-scf-to-cf \
  -convert-arith-to-llvm \
  -convert-memref-to-llvm \
  -convert-func-to-llvm \
  -reconcile-unrealized-casts
```

- `mlir-opt`으로 Pass를 순서대로 적용
- 중간 결과를 `-o` 또는 stdout으로 확인하며 디버깅 가능

---

[← Appendix B](07_appendix_b_mlir_builtin.md) | [목차](README.md) | [다음: Appendix D →](09_appendix_d_polyhedral.md)
