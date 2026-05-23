# 3. 5대 기본맛 — 4대에서 5대로

[← 이전: 미뢰와 신경 경로](02_taste-bud-and-pathway.md) · [README](README.md) · [→ 다음: 맛있다의 원리](04_deliciousness.md)

---

## 3.1 4대 기본맛 — 200년 통설

19세기부터 20세기 중반까지 미각 교과서는 4대 기본맛으로 정의했다:

> **단(sweet) · 짠(salty) · 신(sour) · 쓴(bitter)**

각 맛이 본유적 hedonic 신호를 가짐:
- **단** = 영양 (탄수화물) → 양의 신호
- **짠** = 미네랄·체액 항상성 → 농도 의존
- **신** = 익은 과일 / 부패 (양가)
- **쓴** = 식물 독 회피 → 음의 신호

진화적으로 깔끔한 그림이었다. 그러나 한 가지가 빠져 있었다.

---

## 3.2 1908년, 5번째 맛의 발견 — 池田菊苗 (Ikeda Kikunae)

도쿄제국대학 화학과 교수 **池田菊苗**가 1908년 다시마 국물에서 한 분자를 분리한다 — **글루탐산(glutamic acid)**의 sodium 염, 즉 **MSG (monosodium glutamate)**.

그는 이 맛을 다음 4가지가 아니라고 주장:
> **"うま味 (umami) — 旨い味 (맛있는 맛)"**

학계 반응은 차가웠다. "그건 다른 맛의 조합 아닐까?", "글루탐산은 단순한 자극일 뿐". 100년에 걸친 검증 끝에:

- **2000년**: T1R3 수용체 동정 (Hoon, Adler 등) [1]
- **2002년**: T1R1/T1R3 heterodimer가 글루타메이트에 응답 — Nelson et al. *Nature* [2]
- **2008년**: T1R1 VFT cleft에 Glu가 결합하고 5'-IMP가 인접 부위에서 안정화하는 협동 결합 모델 — Zhang et al. *PNAS* [3]

**5대 기본맛 인정의 4가지 기준** 모두 충족:

| 기준 | 충족 |
|---|---|
| 1. **지각 독립성** — 다른 맛의 조합으로 안 만들어짐 | ✓ (gLMS·매칭법으로 정량 측정) |
| 2. **전용 수용체** | ✓ T1R1/T1R3 |
| 3. **전용 신경 경로** | ✓ chorda tympani 응답 분석 |
| 4. **생물학적 의의** | ✓ 단백질·아미노산 신호 |

→ **2002년 *Nature* 논문 이후 "5대 기본맛"이 표준**.

> 100년의 검증을 견딘 분자는 결국 분자생물학 시대에 와서 "근거 있는 맛"이 됐다.

---

## 3.3 5대 modality 한눈에

| Modality | 본유 hedonic | 자극 분자 | 수용체 | 세포 | 진화 의미 |
|---|---|---|---|---|---|
| **단** | + (강) | sucrose, fructose, 인공감미료 | T1R2/T1R3 (Class C GPCR) | Type II | 영양·탄수화물 |
| **짠** | + (농도 의존, **0.9% 최대**) | NaCl 등 | ENaC (이온 채널) | (논쟁) | 미네랄·체액 |
| **신** | 양가 (맥락 의존) | citric, lactic, ascorbic, acetic | OTOP1 (proton channel) | Type III | 익은 과일 / 부패 |
| **쓴** | − (강) | quinine, caffeine 등 25+종 | T2R 25종 (Class A GPCR) | Type II | 식물 독 회피 |
| **감칠** | + (강) | glutamate, IMP, GMP | T1R1/T1R3 (Class C GPCR) | Type II | 단백질·아미노산 |

이제 각 modality의 분자·식품·메커니즘을 깊이 본다.

---

## 3.4 단맛 (Sweet)

### 분자

![Sucrose 분자 구조](https://upload.wikimedia.org/wikipedia/commons/9/9e/Sucrose.svg)
*Figure 3.1 Sucrose (자당, C₁₂H₂₂O₁₁) — 글루코스 + 프룩토스 1:1. 출처: Wikimedia Commons, Public Domain.*

대표 단맛 분자:
- **자연 당류**: sucrose, glucose, fructose, lactose, maltose
- **당알코올**: xylitol, erythritol, sorbitol
- **인공 감미료**: aspartame (200×), saccharin (300~500×), sucralose (600×)
- **단백질 감미료**: brazzein, monellin, thaumatin (수백~수천 배)

> 하나의 수용체(T1R2/T1R3)가 어떻게 이렇게 다양한 분자에 응답할까? **VFT(Venus Flytrap) 도메인**의 큰 cleft에 다양한 형태의 ligand가 들어갈 수 있기 때문 — 식충식물 잎이 곤충을 잡는 모양처럼 닫히는 구조. 정확한 결합 자리는 아래 절에서 분자 종류별로 분리한다.

### 어느 부분이 수용체에 결합하나? — T1R2/T1R3 정밀 결합

§2.4.1에서 다룬 단맛 수용체 **T1R2 + T1R3 heterodimer** (Class C GPCR). "VFT cleft에 sugar가 들어간다"는 한 마디 뒤에 의외로 정밀한 구조가 숨어 있다 — **단맛 분자 클래스마다 결합 자리가 다르다**.

#### T1R2/T1R3의 3층 구조

Class C GPCR은 일반 GPCR과 달리 막 바깥에 거대한 N-말단 도메인을 갖는다.

```
┌──────────────────────────────────────────┐
│  ATD/VFT — Venus Flytrap                 │ ← 외부, 두 lobe로 갈라진 큰 cleft (당이 들어감)
│  (식충식물 입처럼 여닫힘)                    │
├──────────────────────────────────────────┤
│  CRD — Cysteine-Rich Domain              │ ← 짧은 연결부, 신호 전달 도관
├──────────────────────────────────────────┤
│  TMD — 7개 막 관통 helix                  │ ← 일반 GPCR 본체, 세포막에 박힘
├──────────────────────────────────────────┤
│  C-tail (intracellular)                   │ ← 세포 안쪽, G-protein 결합
└──────────────────────────────────────────┘
```

T1R2와 T1R3는 dimer interface를 **세 층(VFT-VFT, CRD-CRD, TMD-TMD) 모두에서** 형성해 한 단위처럼 움직인다.

#### 단맛 분자 클래스마다 결합 자리가 다르다 — 5가지 사이트

"VFT cleft" 한 마디 안에 다섯 곳이 숨어 있다.

| 단맛 분자 클래스 | 정확한 결합 부위 | 결합 증거 |
|---|---|---|
| **자연 당류** (sucrose, glucose, fructose) | **T1R2 VFT cleft** 주 + T1R3 VFT 보조 | site-directed mutagenesis, homology modeling |
| **합성 감미료** (aspartame, sucralose, saccharin) | **T1R2 VFT cleft** (당과 같은 자리) | T1R2 vs T1R3 chimera 실험 |
| **Cyclamate, NHDC** | **T1R3 TMD heptahelical pocket** ← 완전히 다른 위치 | T1R3 TMD 잔기 mutation으로 활성 소실 |
| **단백질 감미료** (brazzein, monellin, thaumatin) | **T1R3 ATD 외부 표면 + CRD wedge** | 단백질이 너무 커서 cleft 못 들어감 — 표면 도킹 |
| **Lactisole** (단맛 차단제) | **T1R3 TMD allosteric site** (antagonist) | 사람에선 막지만 마우스에선 안 막음 — 종간 차이 |

→ **인공 감미료마다 cooking·내열성·뒤끝(after-taste)이 다른 이유**가 결국 결합 자리 분리에서 비롯된다. cyclamate가 가열에도 안정한 이유 — VFT 안쪽 sugar 자리와 무관한 TMD pocket에 작용하기 때문.

#### Sucrose의 정확한 결합 — AH-B-X 모델

자연 당의 경우 **Shallenberger-Acree (1967) + Kier (1972) AH-B-X 모델**이 정량적으로 잘 들어맞는다 — 화학자가 분자 구조만 보고 "단맛일까?"를 예측할 수 있게 한 최초의 정량 모델.

```
       AH ────── B
        │  ~3 Å  │
        │        │
        └─ ~5 Å ─ X

   AH = H-bond donor (–OH, –NH₂)         ← 단맛 분자가 수용체에게 H를 줌
   B  = H-bond acceptor (=O, –O–, sp² N) ← 단맛 분자가 수용체에서 H를 받음
   X  = 소수성 그룹 (ring, –CH₂–)         ← van der Waals 접촉
```

이 AH/B/X 삼각형이 T1R2 VFT cleft 내벽의 **상보적 잔기 세 자리**에 동시에 맞물려야 단맛 신호가 켜진다.

**Sucrose 분자에서의 AH/B/X**:

```
     HO     OH                          OH
       \   /                            /
        \ /                            /
   HOCH₂─C ────── O ──────── C─CH₂OH
        │      glycosidic       │
        │       (B 후보)         │
        ring                    ring
       (glucose)              (fructose)

   AH 후보:  글루코스 C6-OH, C3-OH
   B  후보:  글리코시딕 산소, 프룩토스 C5-OH
   X        : 두 ring의 탄소 골격 (소수성)
```

cleft 내부에서 sugar와 H-bond + van der Waals 네트워크를 형성하는 T1R2 잔기 (mouse 기준, 사람도 유사):
- **Ser144, Tyr103, Asp142, Glu302** — sugar OH와 H-bond
- **Phe35, Phe186** — sugar ring과 소수성 접촉
- 총 **~4~6 H-bond + 2~3 hydrophobic 접촉**으로 sucrose가 cleft 안에 안정 결합

→ **Sucrose의 결합 친화도 K_d ≈ 50 mM**. 비교적 약한 결합. 그래서 단맛을 느끼려면 음식의 sucrose 농도가 ~50~500 mM (1.7~17%)는 되어야 한다 — 일상에서 설탕을 한 스푼씩 넣는 이유.

#### Venus Flytrap closure → TMD를 거친 신호 전달

```
[열린 VFT]                       [닫힌 VFT — sugar 결합 후]

   ┌─────┐                           ┌─────┐
   │      ╲                          │ ▲    │   ▲ = sucrose
   │       ╲                         │ ▲ ▲  │
   │   open cleft                    │ ▲    │   닫혀서 갇힘
   │       ╱                         │      │
   │      ╱                          │      │
   └─────┘                           └─────┘
        │                                 │
   (대기 상태)                   (closed → CRD → TMD → Gα)
```

VFT 두 lobe가 sugar를 둘러싸 닫힘 → CRD를 거쳐 TMD로 conformation 변화 전달 → 세포 안쪽 면의 G-protein 결합 부위 모양 변화 → §2.4.1 cascade 시작.

#### 왜 인공 감미료가 sucrose보다 훨씬 단가?

| 감미료 | sucrose 대비 강도 | 결합 자리 | K_d (대략) | 강한 이유 |
|---|---|---|---|---|
| Sucrose | × 1 | T1R2 VFT | ~50 mM | (기준) |
| Aspartame | × 200 | T1R2 VFT | ~수 μM | AH-B-X 삼각형이 cleft에 sucrose보다 정확히 맞음 |
| Sucralose | × 600 | T1R2 VFT | ~수 μM | sucrose의 일부 -OH가 -Cl로 치환되어 더 강한 hydrophobic + H-bond 패턴 |
| Saccharin | × 300 | T1R2 VFT | ~10 μM | sulfonyl-imide의 강한 H-bond + 작은 소수성 ring |
| Cyclamate | × 30 | **T1R3 TMD** ← 다른 자리 | ~수 mM | TMD pocket에 직접 binding, VFT 우회 |
| Thaumatin (단백질) | × 2000~3000 | **T1R3 ATD 외부 표면** | ~nM 영역 | 큰 단백질 표면이 receptor 표면과 광범위 접촉 |

**강도 ∝ 1 / K_d** — 결합 친화도가 강할수록 적은 농도로 단맛 활성화. 인공 감미료가 천 배 더 단 이유는 분자가 본질적으로 "더 달기" 때문이 아니라, **수용체에 더 강하게 들러붙기** 때문이다.

#### 한 줄 정리

> **Sucrose는 T1R2 VFT cleft 안쪽 ~6개 잔기와 AH-B-X 삼각형 기반의 H-bond + van der Waals 네트워크로 결합한다. 단, 모든 단맛 분자가 같은 자리에 결합하지는 않는다 — cyclamate는 T1R3 TMD에, thaumatin 같은 단백질은 T1R3 외부 표면에 도킹한다. "단맛 수용체에 결합한다" 한 마디 안에 5가지 다른 결합 자리가 숨어 있다.**

### 식품

| 식품 | 단맛 분자 |
|---|---|
| 사탕수수·사탕무 | sucrose |
| 과일 | fructose + glucose + sucrose |
| 꿀 | fructose 38% + glucose 31% |
| 우유 | lactose |
| 감주·식혜 | maltose |

### 단맛은 어떻게 만들어지나?

식물의 **광합성 → Calvin cycle**:
```
6 CO₂ + 6 H₂O + 빛 → C₆H₁₂O₆ (glucose) + 6 O₂
glucose + fructose ─(효소)→ sucrose
```

거의 모든 자연 단맛은 결국 **광합성의 산물**이다.

---

## 3.5 짠맛 (Salty)

### 분자

| 양이온 | 짠맛 강도 | 비고 |
|---|---|---|
| **Na⁺** | **표준** | 진화적으로 가장 추구되는 양이온 |
| Li⁺ | Na⁺와 거의 같음 | ENaC가 구별 못 함 |
| K⁺ | 짠 + 쓴 | 저나트륨 소금의 단점 |
| NH₄⁺, Mg²⁺, Ca²⁺ | 약 짠 + 다른 맛 | 거의 쓴/금속 |

음이온도 영향: 같은 Na 농도에서 **NaCl > NaBr > Na아세테이트**. **Cl⁻이 가장 깨끗한 짠맛**.

### 0.9%의 비밀 — 혈장 등장액

인간이 가장 맛있게 느끼는 NaCl 농도는 **0.9% (= 154 mM = 혈장 등장액)**.

```
혈장 NaCl 농도        ≈  0.9% (생리식염수)
인간 짠맛 최대 쾌감    ≈  0.9%
바닷물                ≈  3.5% (포유류 거부)
```

**우연이 아니다** — 진화가 **체액과 같은 농도가 가장 자연스러운 짠맛**으로 느껴지도록 미각계와 항상성을 일치시킨 결과. 우리 몸이 NaCl을 가장 효율적으로 흡수·이용할 수 있는 농도가 그 농도다.

> 짠맛 hedonic 곡선은 0.9% 부근에서 최고점, 그 위로 빠르게 거부 — 종 모양.

### 메커니즘

저농도 NaCl에서 ENaC 채널이 Na⁺을 직접 통과시킴 → 즉시 탈분극. 5대 modality 중 가장 단순. (자세히는 §2.4.3)

---

## 3.6 신맛 (Sour)

### 분자

신맛 자극 = **H⁺**. 그러나 같은 pH에서도 약산 종류에 따라 강도가 다르다.

![Citric acid 분자 구조](https://upload.wikimedia.org/wikipedia/commons/9/92/Citric_acid.svg)
*Figure 3.2 시트르산 (C₆H₈O₇) — 트라이카르복실산. 회로 첫 안정 중간체. 출처: Wikimedia Commons, Public Domain.*

| 산 | pKa₁ | 식품 |
|---|---|---|
| Citric | 3.13 | 레몬·라임·오렌지 |
| Malic | 3.40 | 사과·체리 |
| Lactic | 3.86 | 요거트·김치 |
| Acetic | 4.76 | 식초 |
| **Ascorbic (비타민 C)** | **4.17** | **감귤·딸기·키위** |
| Tartaric | 2.98 | 포도·와인 |
| HCl (강산) | <0 | 위산 |

**비타민 C도 명확히 신맛**을 낸다 — 영장류는 GULO 결손으로 합성 불가, 식이 의존 → 약 신맛 = 비타민 C 풍부 신호로 진화.

### TCA cycle — 신맛 분자의 생화학적 기원

흥미로운 사실: **신맛 분자 다수가 미토콘드리아의 TCA cycle 중간체**다.

![Krebs cycle 8단계](https://upload.wikimedia.org/wikipedia/commons/4/43/Krebs_cycle.png)
*Figure 3.3 TCA(Krebs) cycle. citric → ... → malic → succinic 등 중간체가 식품 신맛 분자. 출처: Wikimedia Commons, Public Domain.*

```
glucose → glycolysis → pyruvate → acetyl-CoA → TCA cycle:
  citrate → α-KG → succinate → fumarate → malate → OAA
```

**굵은 글씨**가 자유 산성 형태로 식품에 존재할 수 있는 분자 — 식물·미생물이 회로 일부에서 산을 축적하면 그것이 식품 신맛.

> 산업적 시트르산은 *Aspergillus niger* 곰팡이가 TCA를 일부 차단해 citrate를 분비하도록 발효 — 연 200만 톤. **식품의 신맛 = 모든 호기성 생명체의 핵심 대사 회로의 부산물**.

### 메커니즘 — OTOP1 + 세포 내 산성화

```
약산 HA / 강산 H⁺
  ├─ HA → 막 통과 → 세포 내 해리 → 세포 내 H⁺↑
  └─ H⁺ → OTOP1 (Type III 정점) → 세포 내 H⁺↑
                ↓
        KIR K⁺ 채널 차단 → 막 탈분극 → 5-HT 방출 → 미각신경
```

**약산이 강산보다 더 신맛**: 비해리 분자(HA)가 막을 통과해 세포 안에서 산성화 추가. 자연식품 산은 거의 모두 약산이라 미각계가 이걸 우선 검출.

### 흥미 — 글루탐산은 산인데 왜 감칠?

글루타메이트는 화학적 약산이지만 식품에서 sodium salt(중성 pH)로 존재해 carboxylate 형태가 우세 → **T1R1/T1R3가 carboxylate에 결합 → 감칠**. 자유 산 형태에서는 신맛도 같이 활성. → 부록 E에서 자세히.

---

## 3.7 쓴맛 (Bitter)

### 분자 — 자연의 독 회피 신호

![Caffeine 분자 구조](https://upload.wikimedia.org/wikipedia/commons/8/8c/Caffeine_structure.svg)
*Figure 3.4 Caffeine — alkaloid의 대표 예. 출처: Wikimedia Commons, Public Domain.*

![Quinine 분자 구조](https://upload.wikimedia.org/wikipedia/commons/1/16/Quinine.svg)
*Figure 3.5 Quinine (키니네) — 토닉워터의 쓴맛 성분, 한때 말라리아 치료제. 출처: Wikimedia Commons, CC BY-SA.*

쓴맛 분자는 거의 모두 **식물 secondary metabolite**:

| 클래스 | 예 | 식품 |
|---|---|---|
| **Alkaloid** (질소 함유) | quinine, caffeine, nicotine, morphine, theobromine | 토닉워터, 커피, 다크초콜릿 |
| **Glucosinolate** (황 함유) | sinigrin | 브로콜리, 양배추, 겨자 |
| **Polyphenol** | tannin, catechin, flavonoid | 차, 와인, 다크초콜릿 |
| **Terpenoid** | menthol, cucurbitacin | 박하, 오이 끝 |
| **Saponin** | ginsenoside | 인삼 |
| **Cardenolide** | digitoxin | 디기탈리스 (강심배당체) |

→ **쓴맛 = 자연의 화학 방어 분자 검출 시스템**. 인간이 인지하는 가장 쓴 분자(denatonium)는 **검지역치 ~1 nM** — 1조분의 1.

### T2R 25종 — combinatorial coding

인간은 **T2R 25종**을 가지고 다양한 쓴 분자에 광범위 응답.
- 한 분자 → 여러 T2R 활성
- 한 T2R → 여러 분자 응답
- 한 쓴맛 세포 → **여러 T2R 동시 발현** (단·감칠 세포가 한 수용체만 발현하는 것과 다름)

**진화 논리**:
> 자연 독은 분자 다양성이 매우 크다. 정확 식별보다 **광범위 검출**이 적응적 → "어떤 독이 와도 같은 경고 (뱉어라)".

따라서 인간이 quinine·caffeine·denatonium을 모두 **단일 "쓴맛"**으로 인지하고 어느 T2R이 활성됐는지 의식적으로 구분하지 못한다. (자세히는 부록 D)

### 약 절반이 쓴 이유

FDA 승인 약물의 약 50%가 식물 alkaloid 또는 그 유도체 — 식물이 자기 방어용으로 만든 분자가 인간에게 약리 활성. 그래서 약은 거의 다 쓰다. (부록 D)

---

## 3.8 감칠맛 (Umami)

### 분자

![L-Glutamic acid 분자 구조](https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=33032&t=l)
*Figure 3.6 L-Glutamic acid — α-COOH·γ-COOH·α-NH₃⁺ 세 ionizable 그룹. 출처: [PubChem CID 33032](https://pubchem.ncbi.nlm.nih.gov/compound/33032), NCBI/NIH (Public Domain).*

| 분자 | 식품 |
|---|---|
| **L-Glutamic acid** | 다시마, 토마토, 치즈, 모유, 발효식품 |
| **5'-IMP** (이노신산) | 가다랑어 포(가쓰오부시), 멸치, 고기 |
| **5'-GMP** (구아닐산) | 표고버섯 (말린) |
| **5'-AMP** | 다양한 식품 (낮음) |

### 감칠맛 분자는 언제 만들어지나? — 생성 원리

핵심 통찰 한 줄: **감칠맛은 "한때 생명이었던 것"의 화학 흔적을 감지한다**. 단백질이 분해되거나(글루타메이트), 세포가 죽거나 핵산이 분해될 때(IMP/GMP/AMP) 만들어지는 분자들이 모두 감칠맛 ligand다. 진화가 미각계에 "양질의 단백질·핵산 source가 여기 있다"는 알람을 박아넣은 결과.

#### 1. Free glutamate (L-Glu) — 단백질 분해 + 식물 축적의 산물

단백질에는 글루타메이트가 평균 ~10~20% 차지한다. 하지만 **단백질 안에 갇혀 있는 Glu는 감칠맛이 안 난다** — peptide 결합으로 묶인 Glu는 T1R1/T1R3가 인식 못함. **자유로운 free Glu**만 감칠. 그래서 free Glu가 풀려나는 상황 = 감칠맛 생성 상황.

**(A) 단백질 분해(proteolysis) — protease가 peptide 결합을 자른다**

```
   단백질 사슬:  ...─Glu─Ala─Lys─Glu─Phe─...
                       │
                       │ protease (Glu의 양옆 peptide 결합 절단)
                       ↓
   자유 아미노산:  free Glu, free Ala, free Lys, free Glu, free Phe ...
                       │
                       │ 입에서 T1R1/T1R3가 인식
                       ↓
                   감칠맛!
```

단백질 분해가 일어나는 5가지 상황:

| 상황 | 일어나는 일 | 대표 식품 |
|---|---|---|
| **숙성·aging** | 미생물·자가 protease가 단백질을 천천히 분해 | 파르메산 치즈 (24개월 숙성), 잠봉, 프로슈토, 김치 |
| **발효** | 곰팡이·세균(koji, lactobacillus)이 외부 protease 분비 | 간장, 된장, 어간장, 청국장, 멸치액젓 |
| **자가소화 (autolysis)** | 세포 자체 protease가 자기 단백질 분해 (효소가 갇혀 있다가 세포 죽으면 풀려남) | 가쓰오부시 (말리며 자가소화), 안초비 페이스트, 멸치 액젓 |
| **느린 가열** | 열로 단백질 변성 + 시간이 지나며 peptide 결합 일부 가수분해 | 곰탕, 사골국, 슬로우쿡 스튜, 토마토 소스 |
| **외부 효소 첨가** | papain (파파야), bromelain (파인애플), ficin (무화과) | 고기 연육 처리 |

→ **"숙성된 것, 발효한 것, 오래 끓인 것" = 감칠맛 식품**의 분자적 정의.

**(B) 식물의 자체 free Glu 축적 — 단백질 분해와 무관한 경로**

식물은 단백질로 묶이지 않은 **free Glu를 세포질에 축적**한다. 용도:
- **질소 저장고**(free amino acid pool — 광합성으로 만든 질소 부산물 보관)
- **삼투압 조절제(osmoregulator)**
- **스트레스 신호 분자**

이게 누적되는 식물:
- **다시마/켈프**: 바닷물의 높은 염도에 적응하느라 free Glu를 osmoprotectant로 축적 → 건다시마 100g당 ~2000~3200 mg
- **토마토**: 성숙(ripening) 과정에서 free Glu가 폭증 → 푸른 토마토 ~40 mg/100g, 잘 익은 빨간 토마토 ~250 mg/100g
- **마늘·양파·버섯**: 평소부터 베이스라인이 높음

→ **"잘 익은 토마토가 안 익은 것보다 맛있는 이유"가 분자 수준에서 설명된다**. 광합성·질소대사가 free Glu를 천천히 끌어올림.

#### 2. 5'-IMP — 세포 사후 ATP 분해의 산물

**핵심 사실**: **살아 있는 세포에는 IMP가 거의 없다**. 모두 ATP 상태로 존재(세포질 [ATP] ≈ 1~5 mM). **세포가 죽은 뒤** ATP가 분해되면서 단계적으로 만들어진다.

```
   살아 있는 세포:    ATP (대부분)
                      │
                      │ 세포 죽음 (도축, 어획)
                      ↓
   사후 분해 cascade:  ATP → ADP → AMP → IMP → inosine → hypoxanthine
                                    └─AMP deaminase─┘
                                    (이 단계가 핵심)
```

- 도축 직후 동물 근육: 거의 모두 ATP
- 사후 시간 경과: ATP가 빠르게 분해되어 IMP가 누적
- 시간이 더 지나면 IMP → inosine → hypoxanthine으로 진행 → 감칠맛 사라지고 **불쾌한 쓴맛/오래 묵은 맛**으로 변질

**5'-IMP가 풍부한 식품의 공통점**:
- **사후 시간이 적절히 경과한 단백질 source**
- 또는 **그 IMP를 농축한 가공품**

| 식품 | 5'-IMP 농도 (mg/100g) | 이유 |
|---|---|---|
| **가쓰오부시 (말린 가다랑어)** | ~700 | 어획 → 자가소화 + 건조로 IMP 농축 |
| **멸치 (말린)** | ~280 | 같은 원리 |
| **닭** | ~230 | 도축 후 24~48h에 IMP peak |
| **돼지** | ~200 | 마찬가지 |
| **소** | ~90 | 마찬가지, 발효 부족 부위는 낮음 |
| **신선한 활어** | 거의 0 | ATP 아직 안 분해됨 — 회는 IMP 적음, 대신 ATP가 단맛 |
| **24~48h 숙성 생선** | ~150 | "회를 하루 묵히면 더 맛있다"의 분자 기반 |

→ **숙성 회, 드라이에이징 비프, 가쓰오부시 — 모두 같은 원리** (사후 ATP→IMP 변환).

#### 3. 5'-GMP — RNA 분해의 산물

GMP는 **RNA의 구성 nucleotide 중 G(guanosine)**. 세포가 죽고 **RNA가 분해되면서** 풀려난다. RNase(RNA 분해 효소)가 세포 안에 갇혀 있다가 세포 사후 활성화되는 게 핵심.

**5'-GMP 폭증 조건**: 세포가 RNA를 많이 갖고 있고 + 건조 등으로 RNase가 활성화되는 식품.

| 식품 | 5'-GMP 농도 (mg/100g) | 이유 |
|---|---|---|
| **건조 표고버섯 (말린)** | ~150 | 건조 과정에서 세포 lysis + RNase 활성화 → RNA가 GMP까지 분해 |
| **건조 모렐버섯** | ~40 | |
| **건조 포르치니** | ~10 | |
| **생 표고버섯** | ~70 (낮음) | 세포가 살아 있으면 RNase가 작동 안 함 |
| **건조 토마토** | 약간 | RNase 효과 일부 |

→ **"표고버섯은 말려야 진가가 나온다"의 분자적 이유**. 생 표고는 GMP 적음 → 건조하면 ~2배 이상. 한식·중식에서 마른 표고가 육수 핵심인 이유.

#### 4. 5'-AMP — 보조 역할

ATP → ADP → **AMP** → IMP의 중간 단계 분자. 단독으론 감칠맛 약함 (T1R1/T1R3 affinity가 IMP·GMP보다 낮음). 그러나 합산해서 감칠맛 풍부함에 기여. 모든 동·식물·곰팡이 식품에 소량 존재.

#### 5. 통합 매핑 — 식품별 감칠맛 분자 출처

세 분자가 식품에 어떻게 분포하는지 한눈에:

| 식품 카테고리 | Free Glu | 5'-IMP | 5'-GMP | 통합 감칠 |
|---|---|---|---|---|
| **건다시마** | 매우 높음 | ─ | ─ | 강 (Glu 단독) |
| **잘 익은 토마토** | 높음 | ─ | ─ | 중 |
| **숙성 치즈 (파르메산)** | 높음 | ─ | ─ | 강 |
| **간장·된장·어간장** | 높음 | 낮음 | ─ | 강 |
| **가쓰오부시** | 약간 | 매우 높음 | ─ | 강 |
| **멸치 (말린)** | 약간 | 높음 | ─ | 강 |
| **건표고버섯** | 약간 | ─ | 높음 | 강 |
| **숙성 소고기** | 약간 | 중간 | ─ | 중 |
| **활어 회** | 약간 | 거의 없음 | ─ | 약 |

→ **세 종류 분자가 다 다른 source에서 온다**. 그래서 요리는 의도적으로 **여러 source를 조합**해야 폭발적 감칠 (다음 절의 시너지).

#### 6. 진화적 정리 — 왜 미각이 이런 분자들을 다 감지하나?

미각 입장에서 보면:

| 분자 | 무슨 신호? |
|---|---|
| Free Glu | "여기 양질의 단백질이 분해되고 있다" 또는 "잘 익은 식물 재료" |
| 5'-IMP | "신선한 동물 단백질" (사후 단계 적절) — 부패 직전 IMP 농도 최대 |
| 5'-GMP | "버섯·곰팡이성 식품" (RNA 풍부 + 사후 분해) |

→ **세 분자 모두 "한때 생명이었던, 지금 우리가 안전하게 먹을 수 있는" 분자 상태**. 진화가 만든 식품 품질 센서. 부패 직전(IMP가 inosine·hypoxanthine으로 더 가면)에는 신호가 다른 modality로 넘어가 거부감 유발. 시너지(다음 절)는 이 신호들이 동시에 잡힐 때 = "최상급 식품 발견"으로 인지되는 합산 효과.

### 시너지 — Yamaguchi 1967

야마구치는 글루타메이트(MSG) + IMP 또는 GMP 조합이 **단순 합산보다 8배 이상 강한 감칠**을 만든다는 것을 정량 보고:

```
y = u + γ·u·v
```
- u, v: 각 분자 농도
- γ: 시너지 계수 (IMP γ = 1218, GMP γ = 2800)

**한국·일본 식문화의 핵심**: 다시마(Glu) + 가쓰오부시(IMP) = "감칠 폭탄". 한식에서 멸치(IMP) + 다시마(Glu), 김치(Glu + lactic) 등 이 시너지가 일상에 깊이 박혀 있다. (부록 A)

### 메커니즘 — VFT 협동 결합

T1R1/T1R3 heterodimer의 VFT cleft에 글루타메이트가 결합하면 5'-IMP가 인접 allosteric 부위에서 closed conformation을 안정화 — Zhang 2008 *PNAS* [3].

```
Glu가 cleft에 들어감 → VFT 닫힘 → 7TM 활성 → gustducin → ATP 신호
       ↑
   IMP가 옆에서 "clip"으로 잡아줌
```

→ Glu만 있을 때보다 IMP 함께 있으면 **closed conformation이 안정** = 신호 증폭.

---

## 3.9 5대 기본맛 비교 표

| | 단 | 짠 | 신 | 쓴 | 감칠 |
|---|---|---|---|---|---|
| **자극** | 다양 분자 | Na⁺ | H⁺ | 다양 분자 | Glu, IMP, GMP |
| **수용체** | T1R2/T1R3 | ENaC | OTOP1 | T2R 25종 | T1R1/T1R3 |
| **수용체 종류** | Class C GPCR | 이온채널 | 이온채널 | Class A GPCR | Class C GPCR |
| **세포** | Type II | (논쟁) | Type III | Type II | Type II |
| **시냅스** | channel synapse | ? | 전통 | channel synapse | channel synapse |
| **본유 hedonic** | + (강) | + (0.9%★) | 양가 | − (강) | + (강) |
| **검지역치** | ~10 mM | ~10 mM | pH ~4 | ~10 μM (denatonium 1 nM) | ~0.5 mM |

**놀라운 사실**:
- 단·쓴·감칠은 **같은 backbone** (gustducin → PLCβ2 → ... → ATP)
- 분기점은 **수용체와 G단백질 사이** — 입력만 다르고 하류는 같다
- 신·짠은 완전히 다른 회로 (이온 채널 직접)

---

## 3.10 6번째 맛 후보?

학계에서 활발히 논의되는 후보:

| 후보 | 자극 | 상태 |
|---|---|---|
| **Fat (지방맛)** | 긴 사슬 지방산 | CD36, GPR120 후보 — 강한 증거 (2026 시점) |
| Calcium | Ca²⁺ | 약 |
| Kokumi (코쿠미) | γ-glutamyl peptides | CaSR 매개 — 일본 학계 강조 |
| Starch | 다당류 | 약 |
| Carbonation | CO₂ | carbonic anhydrase IV — 일부 |
| Metallic | 금속 | 매우 약 |

지방맛이 가장 유력. 100년에 한 번 5대 → 6대로 갈 수도.

---

## 3.11 핵심 정리

1. **5대 기본맛 = 단·짠·신·쓴·감칠**. 1908년 Ikeda의 umami 발견 → 2002년 분자 동정으로 100년 만에 5대 인정.
2. 단·쓴·감칠은 **GPCR + 같은 backbone**, 신·짠은 **이온 채널 직접**.
3. 진화가 각 modality에 본유 hedonic 새김 — 영양은 +, 독은 −, 항상성은 농도 의존.
4. 신맛 분자는 거의 다 **TCA cycle 중간체** = 모든 호기성 생명체의 핵심 대사 부산물.
5. **0.9% 짠맛 = 혈장 등장액** = 미각계와 체액 항상성의 일치.
6. **감칠 시너지(글루타메이트 + IMP/GMP)**가 한국·일본 식문화의 분자적 핵심.

---

## References

[1] Adler E et al. A novel family of mammalian taste receptors. *Cell* 2000, 100(6), 693–702.

[2] Nelson G et al. An amino-acid taste receptor. *Nature* 2002, 416, 199–202.

[3] Zhang F et al. Molecular mechanism for the umami taste synergism. *PNAS* 2008, 105(52), 20930–20934.

[4] Ikeda K. New seasonings. *J Chem Soc Tokyo* 1909, 30, 820–836.

[5] Yamaguchi S. The synergistic taste effect of monosodium glutamate and disodium 5'-inosinate. *J Food Sci* 1967, 32(4), 473–478.

[6] Tu YH et al. *Science* 2018, 359, 1047–1050. (OTOP1)

[7] Chandrashekar J et al. The cells and peripheral representation of sodium taste in mice. *Nature* 2010, 464, 297–301.


---

[← 이전: 미뢰와 신경 경로](02_taste-bud-and-pathway.md) · [README](README.md) · [→ 다음: 맛있다의 원리](04_deliciousness.md)
