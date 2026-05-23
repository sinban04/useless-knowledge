# Signal Transduction Cascades

This chapter walks three canonical kinase cascades end-to-end: a hormone hits the cell surface, a chain of kinases fires, and the cell's behavior changes. The point is not to enumerate every pathway — there are hundreds — but to show the **grammar** of phosphorylation cascades through three carefully chosen examples:

1. **The PKA pathway** — the original kinase cascade (Sutherland, Krebs/Fischer, 1950s\~60s) — adrenaline triggers glycogen breakdown.
2. **The MAPK pathway** — the textbook RTK cascade — growth factors → cell division.
3. **The PI3K-Akt pathway** — insulin → metabolism and survival.

Each illustrates a different architectural pattern: cyclic-nucleotide amplifier, three-tier kinase relay, and lipid-anchored membrane assembly.

---

## 1. PKA: Hormone → cAMP → Kinase → Glycogenolysis

### 1.1 The Story

In the late 1950s, **Earl Sutherland** was trying to figure out how adrenaline (epinephrine) caused liver and muscle to release glucose. He identified an intracellular "second messenger" that was made in response to adrenaline at the cell surface and spread the signal inside the cell. That messenger was **cyclic AMP** (cAMP), and Sutherland won the 1971 Nobel Prize for it.

A few years later, **Edmond Fischer** and **Edwin Krebs** showed that cAMP works by activating a kinase — what we now call **protein kinase A (PKA)** — which then phosphorylates downstream metabolic enzymes. They got the 1992 Nobel Prize. This was the **first kinase cascade ever decoded**, and it is still the cleanest pedagogical example.

### 1.2 The Cascade

```
   adrenaline (extracellular)
       │
       ▼
   ┌──────────────────────────────────────┐
   │  β-adrenergic receptor (GPCR, plasma│
   │  membrane, 7 transmembrane helices)  │
   └──────────────────────────────────────┘
       │  (conformational change)
       ▼
   Gαs (heterotrimeric G protein)
       │  swaps GDP for GTP, dissociates from Gβγ
       ▼
   ┌──────────────────────────────────────┐
   │  adenylyl cyclase                     │
   │  ATP ──────► cyclic AMP (cAMP) + PPᵢ │
   │                                       │
   │  ★ HERE IS WHERE ATP IS THE FUEL.     │
   │  This is not phosphorylation; the     │
   │  γ and β phosphates are dropped, and  │
   │  the α-phosphate cyclizes onto its    │
   │  own ribose 3'-OH. Pyrophosphate (PPᵢ)│
   │  is released. The energy of two       │
   │  phosphoanhydride bonds drives the    │
   │  formation of the cyclic structure.   │
   └──────────────────────────────────────┘
       │
       ▼
   cAMP (second messenger, diffuses in cytoplasm)
       │
       ▼
   ┌──────────────────────────────────────┐
   │  PKA: tetramer R₂C₂                   │
   │  R = regulatory, C = catalytic        │
   │                                       │
   │  cAMP binds R subunits (4 cAMP / PKA) │
   │  → R subunits release C subunits      │
   │  → free C subunits are active kinases │
   └──────────────────────────────────────┘
       │
       ▼
   Active PKA-C  (phosphorylates many substrates)
       │
       │  uses ATP → ADP, transfers γ-P
       │  ★ HERE IS WHERE ATP IS THE TRIGGER.
       │
       ├──► phosphorylates phosphorylase kinase
       │       │
       │       ▼  (also a kinase, now active)
       │     phosphorylates glycogen phosphorylase
       │       │
       │       ▼  (now active)
       │     glycogen → glucose-1-phosphate
       │       │
       │       ▼
       │     glucose-6-phosphate → glucose → blood
       │
       └──► phosphorylates glycogen synthase
               │
               ▼  (now INACTIVE — phosphorylation inhibits)
            no more glycogen synthesis
            (you don't want to be both making
             and breaking glycogen at once)
```

Adrenaline enters the bloodstream. A liver cell sees it. Within seconds, glucose pours out of the liver into the blood. The cell didn't need to "decide" anything — the cascade is mechanical.

### 1.3 The Amplification

This is the part that justifies all the architecture. Counting molecules:

| Stage | Molecules |
|-------|-----------|
| Adrenaline molecules at cell surface | \~10² |
| GPCRs activated | \~10² |
| G proteins activated (each receptor activates many G proteins while the ligand is bound) | \~10³ |
| Adenylyl cyclase activated | \~10³ |
| cAMP molecules made (each cyclase makes many cAMPs) | \~10⁵ |
| PKA-C subunits liberated (each cAMP binds one R, four cAMP per PKA tetramer) | \~10⁴ |
| Phosphorylase kinase molecules phosphorylated (each PKA-C phosphorylates many) | \~10⁶ |
| Glycogen phosphorylase molecules activated | \~10⁷ |
| Glucose-1-phosphate molecules produced (each phosphorylase processes thousands of glucose units before turnover) | \~10¹⁰ |

**About 10⁸-fold amplification** from hormone arrival to glucose released. This is why the cell can afford to use cascades — a tiny number of detection events triggers a metabolic flood.

The amplification is bought with **ATP**. Each kinase step consumes ATP. The cascade is, energetically, a cascade of ATP burns. In exchange, the cell gets a sharp, fast, high-gain signal.

### 1.4 Termination

A signal that can't be turned off is useless. The PKA cascade terminates by:

1. **GTPase activity of Gαs** — Gαs hydrolyzes its bound GTP back to GDP within \~10\~30 seconds, returning to the inactive form.
2. **Phosphodiesterases (PDEs)** — degrade cAMP back to AMP. Inhibited by caffeine, which is why caffeine prolongs adrenaline's effects.
3. **Phosphatases (PP1, PP2A)** — remove phosphates from glycogen phosphorylase, glycogen synthase, and other PKA targets.
4. **Receptor desensitization** — GRKs (GPCR-kinases) phosphorylate the activated receptor, recruiting **arrestins** that block further G-protein activation and trigger receptor internalization.

The cell maintains the cascade as a **pulse**, not a continuous output. Pulse width is set by the slowest of the off-switches, typically the phosphatases.

---

## 2. MAPK: Growth Factor → Three-Tier Kinase Relay → Cell Division

The MAPK (mitogen-activated protein kinase) cascade is the textbook example of a three-tier kinase chain, and is the pathway most often hijacked in cancer.

### 2.1 The Cascade

```
   EGF (epidermal growth factor)
       │
       ▼
   ┌──────────────────────────────────────┐
   │ EGFR (receptor tyrosine kinase, RTK) │
   │ single transmembrane helix             │
   │ extracellular ligand-binding domain   │
   │ intracellular kinase domain           │
   └──────────────────────────────────────┘
       │
       │  EGF binding → EGFR dimerizes
       │  → trans-autophosphorylation:
       │    each kinase domain phosphorylates
       │    multiple Tyrs on the OTHER monomer's
       │    cytoplasmic tail
       │
       ▼
   pY-EGFR  (cytoplasmic tail decorated with phospho-tyrosines)
       │
       │   Each pY is a docking site for SH2-domain proteins.
       │
       ▼
   ┌──────────────────────────────────────┐
   │ Grb2 (SH2 + SH3 adaptor)              │
   │   SH2 binds pY of EGFR                │
   │   SH3 binds proline-rich motif of SOS │
   └──────────────────────────────────────┘
       │
       ▼
   SOS (a guanine-nucleotide exchange factor, GEF)
       │
       │  SOS sits next to membrane-anchored Ras (a small GTPase)
       │  SOS pries GDP off Ras, lets GTP bind
       │
       ▼
   Ras-GTP (active)
       │
       │  Ras recruits Raf to the membrane and activates it
       │
       ▼
   Raf (also called MAP3K — first kinase tier)
       │  uses ATP, phosphorylates MEK on Ser/Thr
       ▼
   MEK (MAP2K — second tier; dual-specificity kinase)
       │  uses ATP, phosphorylates ERK on BOTH Thr202 and Tyr204
       │  (the famous "TEY motif" in the activation loop)
       ▼
   ERK (MAPK — third tier; Ser/Thr kinase)
       │  uses ATP, phosphorylates dozens of substrates:
       │
       ├──► nuclear: Elk-1, c-Myc, c-Fos → transcription
       ├──► cytoplasmic: RSK, MNK, MSK
       └──► structural: paxillin, MLCK
       │
       ▼
   Gene expression changes (cyclin D, etc.) → cell enters S phase → divides
```

### 2.2 Why Three Tiers?

A single kinase phosphorylating its target gives roughly linear amplification. The MAPK cascade has **three** sequential kinase steps. Why?

Answer: **switch-like (ultrasensitive) behavior**. Each tier acts as a low-pass filter on noise and as an amplifier on signal. Three tiers in series produce a sharp Hill coefficient of 4\~5 — the cascade switches from \~10% activated to \~90% activated over a narrow input range. Without this, weak random noise from the upstream RTK could trigger spurious cell division.

The cascade also distributes regulation: each tier can be tuned by different feedbacks. ERK feedback-phosphorylates SOS (negative feedback, terminating the signal) and feedback-phosphorylates the EGFR itself (slowing receptor activity). This is why MAPK is famous as a **dynamical system** — its output is a series of pulses, not a steady-state level, and the pulse pattern encodes information.

### 2.3 Cancer Hijack

The MAPK pathway is mutated in something like 30\~50% of all human cancers. The most common drivers:

- **EGFR** activating mutations (\~10\~15% of NSCLC; exon 19 deletions, L858R)
- **HER2** (ERBB2) amplification (\~20% of breast cancer)
- **KRAS** activating mutations — especially G12D, G12C, G12V (\~30% of colorectal, \~95% of pancreatic)
- **BRAF** V600E — (\~50% of melanoma, \~10% of colorectal)
- **NF1** loss (negative regulator of Ras)

Each of these locks one tier of the cascade in the "on" position, regardless of upstream signal. The cell behaves as if it is constantly receiving growth-factor stimulation. It divides without permission.

This is exactly what kinase inhibitor drugs target — see [Chapter 9](09-clinical-relevance-kinase-inhibitors.md).

---

## 3. PI3K-Akt: Insulin → Metabolism, Growth, Survival

The third canonical pathway shows a different architectural pattern: instead of a soluble kinase cascade, the signal is propagated through a **lipid second messenger** (PIP₃) that recruits kinases to the membrane.

### 3.1 The Cascade

```
   insulin (from pancreas, in bloodstream)
       │
       ▼
   ┌──────────────────────────────────────┐
   │ insulin receptor (IR) — RTK,         │
   │ already a covalent (αβ)₂ tetramer     │
   │ in the membrane                        │
   └──────────────────────────────────────┘
       │
       │  ligand binding → β-subunit kinase domains
       │   trans-autophosphorylate on activation-loop Tyrs
       │
       ▼
   active IR kinase
       │
       ▼
   IRS-1/IRS-2 (insulin receptor substrate)
       │  IR phosphorylates IRS on multiple Tyrs
       │  → IRS becomes a phospho-tyrosine-decorated platform
       │
       ▼
   p85 (regulatory) + p110 (catalytic) = PI3K
       │  p85 SH2 binds pY-IRS
       │  → PI3K is recruited to the inner leaflet
       │  → p110 lipid-kinase activity is unleashed
       │
       ▼
   ┌──────────────────────────────────────┐
   │ PI3K phosphorylates PIP₂ → PIP₃        │
   │ (a lipid kinase! It transfers ATP's    │
   │ γ-phosphate onto the 3' position of    │
   │ a membrane phosphoinositide.)          │
   │                                        │
   │  PIP₂ + ATP ──► PIP₃ + ADP             │
   └──────────────────────────────────────┘
       │
       ▼
   PIP₃ (membrane lipid second messenger)
       │  recruits PH-domain proteins:
       │
       ├──► PDK1 (kinase)
       └──► Akt (also called PKB)
              │
              │  PDK1 phosphorylates Akt on Thr308
              │  mTORC2 phosphorylates Akt on Ser473
              │  → both phosphorylations together fully activate Akt
              ▼
        active Akt  (Ser/Thr kinase, AGC family)
              │
              │  uses ATP, phosphorylates many targets:
              │
              ├──► GSK3β (inhibits it) → glycogen synthesis ↑
              ├──► AS160 (inhibits it) → GLUT4 transporter to surface → glucose uptake
              ├──► FOXO (excludes from nucleus) → less apoptosis, less gluconeogenesis
              ├──► TSC2 (inhibits it) → mTORC1 active → protein synthesis ↑
              └──► BAD (inhibits it) → less apoptosis (cell survives)
```

### 3.2 The Architectural Innovation

PI3K-Akt does something the PKA and MAPK cascades do not: it uses a **lipid as a second messenger**. PIP₃ is restricted to the membrane, so kinases that read it (PH-domain kinases like Akt and PDK1) are forced to work *at the membrane*. This means:

- The kinase is concentrated where it's needed (proximity catalysis).
- Diffusion is 2D rather than 3D, dramatically increasing local concentrations.
- The signal is naturally spatially localized — a single patch of activated receptor produces a local PIP₃ patch and a local pool of activated Akt.

This is a generalizable strategy. Any time the cell wants spatial control, it tends to use a membrane-bound second messenger (PIP₃, PIP₂, DAG) plus a domain that reads it (PH, C1, C2).

### 3.3 Termination

The off-switch for PI3K-Akt is the lipid phosphatase **PTEN**, which dephosphorylates PIP₃ back to PIP₂. PTEN is one of the most frequently mutated tumor suppressors in human cancer (loss → uncontrolled Akt activation → uncontrolled growth/survival).

---

## 4. Common Architectural Themes

Looking across all three cascades, the same patterns appear:

### 4.1 Detection → Amplification → Decision

Every cascade has the same three-act structure:

```
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │   Detect     │ →  │   Amplify    │ →  │   Execute    │
   │              │    │              │    │              │
   │   (receptor) │    │  (kinase     │    │  (gene       │
   │              │    │   cascade,   │    │   expression,│
   │              │    │   ATP burned)│    │   metabolism,│
   │              │    │              │    │   movement)  │
   └──────────────┘    └──────────────┘    └──────────────┘
```

### 4.2 Reversible Phosphorylation Carries the Signal

Each step is a covalent modification — phosphorylation — that lasts long enough to propagate but short enough (with phosphatase opposition) to be reversed when input stops. The cell's information processing rides on the same reaction we discussed in [Chapter 6](06-phosphorylation-as-switch.md), repeated thousands of times per second per cell.

### 4.3 ATP is Burned at Every Step

Each kinase step consumes one ATP. The cell pays for amplification with energy, exactly as predicted by Hopfield's kinetic-proofreading argument. The total bill for signaling is small — a few percent of cellular ATP — but it is the price of high-fidelity decision-making.

### 4.4 Off-Switches are Not Optional

Phosphatases, GTPase activity, ligand-receptor desensitization, lipid phosphatases (PTEN) — every cascade has dedicated machinery for shutting itself off. The "default" state of biology is to terminate, not to persist. Cancer is, more often than not, a failure of an off-switch.

### 4.5 Cross-Talk

We presented the three cascades as if they are separate, but they share substrates, share regulators, and feedback into each other. Akt is activated by PI3K but is also a downstream effector of mTORC2. ERK feedback-inhibits SOS, which is shared with the insulin receptor pathway. AMPK (energy sensor) inhibits mTORC1 (growth signal). The kinome is a network, not a set of pipelines, and modern systems biology spends much of its effort modeling that network as a dynamical system.

---

## 5. The AMPK Aside: When the Cell is the Sensor

We mentioned **AMPK** in [Chapter 3](03-atp-as-energy-currency.md). It deserves a brief return here because it ties this chapter back to the energy theme.

AMPK (AMP-activated protein kinase) is allosterically activated by the **AMP/ATP ratio**. When the cell is energy-poor (lots of AMP, less ATP), AMPK switches on and:

- Phosphorylates ACC (acetyl-CoA carboxylase), shutting off fatty-acid synthesis.
- Phosphorylates HMG-CoA reductase, shutting off cholesterol synthesis.
- Phosphorylates TSC2 *activating* it (opposite of Akt), shutting off mTORC1 and protein synthesis.
- Phosphorylates GLUT4 trafficking machinery, increasing glucose uptake.
- Phosphorylates many other targets that collectively shift the cell from anabolic to catabolic mode.

This is a beautiful self-referential feature of the kinase architecture: **the molecule that is the energy currency is also the input to the kinase that manages the energy budget**. The cell's metabolism is regulated by a kinase that *measures the cell's metabolism*.

Pharmacologically, **metformin** (the most-prescribed type 2 diabetes drug) activates AMPK indirectly. The clinical effects of metformin — improved insulin sensitivity, reduced hepatic glucose output, modest weight loss, possible cancer-protective effects — all run through AMPK signaling.

---

## 6. Summary

- **PKA cascade**: GPCR → cAMP → PKA → glycogen phosphorylase. The original kinase cascade; \~10⁸-fold amplification per hormone molecule.
- **MAPK cascade**: RTK → Ras → Raf → MEK → ERK → transcription. Three-tier relay; ultrasensitive; mutated in 30\~50% of cancers.
- **PI3K-Akt cascade**: RTK → IRS → PI3K → PIP₃ → Akt → metabolism, growth, survival. Lipid second messenger; spatially localized; opposed by PTEN.
- All three follow the same architecture: detect → amplify → execute → terminate.
- ATP is burned at every kinase step. Cells pay energy for fidelity.
- Cascades cross-talk; the kinome is a network. AMPK, the energy sensor, ties the whole architecture back to ATP.

The next chapter steps back and asks the question this entire report has been circling: **why one molecule for both jobs?**

---

[← Previous: Phosphorylation as Switch](06-phosphorylation-as-switch.md) | [Next: ATP as Trigger vs Fuel →](08-atp-as-trigger-vs-fuel.md)
