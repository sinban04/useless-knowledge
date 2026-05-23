# ATP Synthesis

## 1. The Three Routes to ATP

A cell can phosphorylate ADP into ATP in three ways:

1. **Substrate-level phosphorylation** — a phosphate is transferred directly from a metabolic intermediate onto ADP. Happens in glycolysis (cytoplasm) and in the TCA cycle (mitochondrial matrix). Yields a small but immediate amount of ATP, no oxygen needed.
2. **Oxidative phosphorylation (OXPHOS)** — electrons stripped from food are passed down the electron transport chain (ETC), pumping protons across the inner mitochondrial membrane. The resulting proton gradient drives **ATP synthase**, a rotary motor that makes ATP. Yields the bulk of ATP, requires oxygen.
3. **Photophosphorylation** — same logic as OXPHOS but the electron source is light. Plants, algae, cyanobacteria. Not relevant in animals; mentioned for completeness.

In humans, oxidative phosphorylation produces **\>90%** of the ATP. The exceptions are tissues that run anaerobically (e.g., skeletal muscle in a sprint, or red blood cells, which have no mitochondria).

---

## 2. Big Picture: Glucose to ATP

```
   Glucose (C₆H₁₂O₆)
         │
         │   GLYCOLYSIS  (cytoplasm, anaerobic)
         │   net: 2 ATP, 2 NADH, 2 pyruvate
         ▼
   2 Pyruvate
         │
         │   PYRUVATE DEHYDROGENASE (mitochondrial matrix)
         │   makes: 2 acetyl-CoA, 2 NADH, 2 CO₂
         ▼
   2 Acetyl-CoA
         │
         │   TCA / KREBS CYCLE  (mitochondrial matrix)
         │   per acetyl-CoA: 3 NADH, 1 FADH₂, 1 GTP/ATP, 2 CO₂
         │   per glucose:    6 NADH, 2 FADH₂, 2 GTP/ATP, 4 CO₂
         ▼
   NADH, FADH₂  (reducing equivalents — basically packaged electrons)
         │
         │   ELECTRON TRANSPORT CHAIN  (inner mitochondrial membrane)
         │   electrons from NADH/FADH₂ flow through complexes I-IV
         │   to O₂; protons pumped from matrix to intermembrane space
         ▼
   Proton gradient (Δμ_H⁺)
         │
         │   ATP SYNTHASE  (rotary motor in inner mitochondrial membrane)
         │   protons flow down gradient, rotor turns,
         │   ADP + Pᵢ → ATP
         ▼
   30\~32 ATP per glucose
```

The accounting:

| Stage | ATP yield (per glucose) |
|-------|-------------------------|
| Glycolysis (substrate-level) | +2 |
| Pyruvate dehydrogenase | 0 |
| TCA cycle (substrate-level) | +2 |
| OXPHOS from 10 NADH (\~2.5 ATP each) | +25 |
| OXPHOS from 2 FADH₂ (\~1.5 ATP each) | +3 |
| **Total** | **\~30\~32 ATP** |

The bulk of yield comes from oxidative phosphorylation, not from the metabolic steps that visibly write "ATP" in the textbook diagram. Most of the ATP is downstream of NADH, made by the rotary motor.

---

## 3. The Chemiosmotic Hypothesis

The 1961 insight by **Peter Mitchell** (Nobel 1978) was that the link between food oxidation and ATP synthesis is *not* a high-energy chemical intermediate, but a **proton gradient across a membrane**.

The inner mitochondrial membrane is impermeable to protons. The ETC pumps H⁺ from the matrix (inside) to the intermembrane space (outside), producing:

- A pH difference: matrix pH \~8.0, intermembrane space pH \~7.0 → ΔpH ≈ 1.0
- A membrane potential: inside \~-150 to -200 mV (negative)

Together these form the **proton-motive force (Δp)**:

```
    Δp = ΔΨ - 2.303 × (RT/F) × ΔpH
       ≈ -180 mV - (60 mV × -1)
       ≈ -180 mV - 60 mV     (sign depends on direction; total ≈ \~220-240 mV)
```

This electrochemical gradient is the cell's true reservoir of energy. ATP synthase taps it.

---

## 4. The Mitochondrion: The ATP Factory

A mitochondrion is not just a bag of enzymes. Its architecture is what makes oxidative phosphorylation possible. The key trick is **compartmentalization**: the organelle separates the place where electrons are harvested from food from the place where protons are allowed to return.

![Labeled mitochondrion structure showing the outer membrane, inner membrane, cristae, matrix, and intermembrane space](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Mitochondrion_structure.svg/960px-Mitochondrion_structure.svg.png)

*Web figure 4-A. Mitochondrion structure. Image URL embedded from Wikimedia Commons; source page: [Mitochondrion structure.svg](https://commons.wikimedia.org/wiki/File:Mitochondrion_structure.svg).*

```
                 CYTOSOL
                    │
        ┌───────────────────────────────┐
        │ Outer membrane                │  porous to many small molecules
        │  ┌─────────────────────────┐  │
        │  │ Intermembrane space     │  │  high H⁺ during respiration
        │  │  ┌───────────────────┐  │  │
        │  │  │ Inner membrane    │  │  │  ETC + ATP synthase live here
        │  │  │  folded cristae   │  │  │
        │  │  └───────┬───────────┘  │  │
        │  │          │              │  │
        │  │      Matrix             │  │  TCA cycle, mtDNA, ribosomes
        │  └─────────────────────────┘  │
        └───────────────────────────────┘
```

The parts matter:

- **Outer membrane** — contains porins, so many small metabolites can cross it relatively easily. It is more like a sieve than a battery wall.
- **Intermembrane space** — the narrow space between the two membranes. During respiration, this becomes the high-proton side of the system.
- **Inner membrane** — the energy-conserving membrane. It is highly impermeable to ions and houses complexes I-IV of the electron transport chain, ATP synthase, and metabolite carriers. Its folds, called **cristae**, increase surface area and help organize respiratory machinery.
- **Matrix** — the inside compartment. Pyruvate oxidation, the TCA cycle, fatty-acid β-oxidation, mitochondrial DNA replication/transcription, and many biosynthetic reactions happen here.

![Electron-tomography rendering of mitochondrial cristae and inner-membrane compartments](https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Mitochondrion_cristae_tomogram.png/960px-Mitochondrion_cristae_tomogram.png)

*Web figure 4-B. Cristae are three-dimensional membrane compartments, not just simple folds in a flat cartoon. Image URL embedded from Wikimedia Commons; source page: [Mitochondrion cristae tomogram.png](https://commons.wikimedia.org/wiki/File:Mitochondrion_cristae_tomogram.png).*

### 4.1 How Food Electrons Become a Proton Gradient

After glycolysis, [pyruvate](https://www.webqc.org/3d-molecular-structure-of-Pyruvate.html) enters the mitochondrial matrix. Pyruvate dehydrogenase turns it into acetyl-CoA, and the TCA cycle oxidizes acetyl-CoA. Most of the captured energy does **not** appear immediately as ATP. It appears as reduced electron carriers: NADH and FADH₂.

Those carriers donate electrons to the inner-membrane electron transport chain:

```
 Matrix side

 NADH ─► Complex I ─► CoQ ─► Complex III ─► cytochrome c ─► Complex IV ─► O₂
             │                    │                         │
             │ pumps H⁺           │ pumps H⁺                │ pumps H⁺
             ▼                    ▼                         ▼
       Intermembrane space / crista lumen  (high H⁺)

 FADH₂ ─► Complex II ─► CoQ   (Complex II feeds electrons in but does not pump H⁺)
```

![OpenStax oxidative phosphorylation diagram showing electron transport chain, proton pumping, ATP synthase, and chemiosmosis](https://openstax.org/apps/image-cdn/v1/f%3Dwebp/apps/archive/20260407.195030/resources/51448a57b43ca03f026f8d69fe0e788b3cf7e559)

*Web figure 4-C. Oxidative phosphorylation: electron transport builds the proton gradient, then ATP synthase lets protons flow back to make ATP. Image URL embedded from OpenStax; source page: [Biology 2e, §7.4 Oxidative Phosphorylation](https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation).*

For each pair of electrons:

- **NADH route:** Complex I pumps 4 H⁺, complex III pumps 4 H⁺, complex IV pumps 2 H⁺ → about **10 H⁺** moved per NADH.
- **FADH₂ route:** electrons enter through complex II, which does not pump. Complex III and IV still pump → about **6 H⁺** moved per FADH₂.
- **Oxygen** ([O₂](https://www.webqc.org/3d-molecular-structure-of-Oxygen.html)) is the final electron acceptor. Complex IV reduces it to [water](https://www.webqc.org/3d-molecular-structure-of-Water.html). Without oxygen, electrons back up, proton pumping stops, and mitochondrial ATP synthesis collapses.

That is why oxygen is not "used to make ATP" directly. Oxygen keeps the electron chain drain open. The immediate stored energy is the proton-motive force across the inner membrane.

### 4.2 How ATP Leaves the Mitochondrion

ATP synthase makes ATP on the **matrix side** of the inner membrane:

```
      Intermembrane space / crista lumen
                 high H⁺
                    │
                    ▼
      H⁺ returns through ATP synthase
                    │
                    ▼
      Matrix: ADP + Pᵢ ─────► ATP
```

[ADP](https://www.webqc.org/3d_molecular_viewer.php?compound=Adenosine+diphosphate) and inorganic phosphate have to enter the matrix before ATP synthase can use them. Newly made [ATP](https://www.webqc.org/3d_molecular_viewer.php?compound=Adenosine+triphosphate) then exits through dedicated inner-membrane carriers, especially the **adenine nucleotide translocase** (ADP/ATP carrier), which swaps cytosolic ADP for matrix ATP. A phosphate carrier brings Pᵢ in, coupled to proton movement.

So the full mitochondrial ATP workflow is:

```
  1. Carbon fuel is oxidized in the matrix.
  2. NADH and FADH₂ deliver electrons to the inner membrane.
  3. Complexes I, III, and IV pump H⁺ into the intermembrane space.
  4. The inner membrane stores that separation as proton-motive force.
  5. ATP synthase lets H⁺ flow back into the matrix and converts ADP + Pᵢ to ATP.
  6. Transporters export ATP and import fresh ADP + Pᵢ.
```

Cristae make this more efficient by packing many respiratory complexes and ATP synthases into a small volume. ATP synthase dimers often sit along crista ridges, while electron-transport complexes occupy neighboring membrane regions. The geometry is not decorative; it helps the organelle maintain local proton circuits at high flux.

---

## 5. ATP Synthase: A Rotary Motor

ATP synthase (also called Complex V, F₀F₁-ATPase) is a beautiful piece of nanomachinery and is, by mass, the world's most abundant rotary engine — it runs in every mitochondrion, every chloroplast, and every aerobic bacterium.

**Animation:** [ATP synthase rotary-motor animation](https://youtu.be/kXpzp4RDGJI?si=aPu_DRncPC8b-G40). This video is useful before reading the static diagrams because it shows the same idea in motion: proton flow turns the F₀ rotor, the γ shaft rotates, and the F₁ head cycles through ATP-binding, ATP-forming, and ATP-releasing states.

![ATP synthase diagram showing proton flow through F0, rotation of the central shaft, and ATP production in F1](https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/ATP_synthase.svg/960px-ATP_synthase.svg.png)

*Web figure 5-A. ATP synthase as a rotor/stator machine: F₀ sits in the membrane, proton flow drives the rotor, and F₁ is the catalytic head where ATP is released. Image URL embedded from Wikimedia Commons; source page: [ATP synthase.svg](https://commons.wikimedia.org/wiki/File:ATP_synthase.svg).*

### 5.1 Architecture

```
                            INTERMEMBRANE SPACE  (high H⁺)
                                       │
                                       │  protons enter
                                       ▼
                  ┌────────────────────────────┐
                  │           a-subunit        │      ┐
                  │  ────────────────────────  │      │
                  │   c-ring (8\~15 subunits)    │      │ F₀  (membrane-embedded)
                  │   protons walk around as   │      │ "rotor in stator"
                  │   the ring rotates         │      │
                  │  ────────────────────────  │      ┘
                  │           γ-subunit        │   ┐
                  │      (rotates with c-ring) │   │
                  │              │             │   │
                  │      α₃β₃ hexamer          │   │ F₁  (catalytic head)
                  │      (3 catalytic sites    │   │ "stator with rotating shaft"
                  │       on β subunits)       │   │
                  │       held still by        │   │
                  │       b-subunit stator     │   ┘
                  └────────────────────────────┘
                                       │
                                       ▼
                            MATRIX  (low H⁺)
                            ADP + Pᵢ  →  ATP
```

Two main pieces:

- **F₀** ("F-zero", embedded in the membrane) — a ring of 8 to 15 c-subunits forming a ring-shaped rotor, plus an a-subunit stator with two half-channels. As protons enter from the intermembrane space, walk around the ring, and exit on the matrix side, the c-ring rotates.
- **F₁** ("F-one", in the matrix) — a head made of three α and three β subunits in alternating arrangement. The β subunits are the catalytic ones — they bind ADP + Pᵢ and make ATP. The γ-subunit is a central rotating shaft connected to the c-ring.

![Nobel Prize ATP synthase machine figure showing F0, F1, c-ring, gamma shaft, and alpha/beta catalytic head](https://www.nobelprize.org/uploads/2018/06/machine.gif)

*Web figure 5-B. The same machine from the 1997 Nobel Prize explanation: proton flow turns the c-ring and attached γ shaft, while the α₃β₃ head is held still by the stator. Image URL embedded from NobelPrize.org; source page: [Press release: The 1997 Nobel Prize in Chemistry](https://www.nobelprize.org/prizes/chemistry/1997/press-release/).*

### 5.1.1 Figure: The c-Ring Is Not a Simple Hole

The F₀ motor is easy to misunderstand. Protons do **not** flow straight through the middle like water through a pipe. They enter one half-channel in the a-subunit, bind a conserved acidic residue on one c-subunit, ride around the lipid-facing ring, and exit through a second half-channel on the matrix side.

Top-down view of the membrane-embedded F₀ ring:

```
                         a-subunit stator
                  ┌──────────────────────────┐
                  │ IMS half-channel         │
                  │ H⁺ in                    │
                  │     ▼                    │
                  │   [c]--[c]--[c]          │
                  │  /             \         │
                  │ [c]     γ       [c]      │   c-ring rotor
                  │  \             /         │   (8\~15 c-subunits)
                  │   [c]--[c]--[c]          │
                  │             ▲            │
                  │          H⁺ out          │
                  │      matrix half-channel │
                  └──────────────────────────┘

                 IMS side: high H⁺
                 matrix:   low H⁺
```

One proton-driven step looks like this:

```
1. H⁺ enters from IMS side.
2. H⁺ protonates an acidic side chain on a c-subunit.
3. That neutralized c-subunit can move into the hydrophobic membrane.
4. The ring rotates one notch.
5. The c-subunit reaches the matrix half-channel.
6. H⁺ leaves into the matrix; the acidic side chain is charged again.
```

The two offset half-channels enforce direction. A proton can only enter from the high-H⁺ side and leave on the low-H⁺ side after the ring has physically moved. That is how an electrochemical gradient becomes mechanical rotation.

### 5.2 The Three-State Catalytic Cycle (Boyer's Binding-Change Mechanism)

Each of the three β subunits cycles through three states as the γ-shaft rotates 120° at a time:

![Nobel Prize binding-change mechanism figure showing open, loose, and tight beta-subunit states during ATP synthesis](https://www.nobelprize.org/uploads/2018/06/synthesis.gif)

*Web figure 5-C. Boyer's binding-change mechanism: the asymmetric γ shaft forces each β site through open, loose, and tight states, so ATP can be released and new ADP + Pᵢ can bind. Image URL embedded from NobelPrize.org; source page: [The Binding Change Mechanism](https://www.nobelprize.org/prizes/chemistry/1997/boyer/25946-the-binding-change-mechanism/).*

```
    State                     β1          β2          β3
    ─────                    ─────       ─────       ─────
    Initial                   O           L           T
                              empty       loose       tight
                              (open)      (binds      (catalysis,
                                          ADP+Pᵢ)     ATP formed
                                                      but trapped)

    γ rotates 120°           T           O           L
                              (releases   empty       (binds
                              ATP)                    ADP+Pᵢ)

    γ rotates 120° more      L           T           O
                              (binds      (catalysis) (releases ATP)
                              ADP+Pᵢ)
```

### 5.2.1 Figure: The Catalytic Cycle Around ATP

The α₃β₃ head is a three-site ring. The central γ-shaft is asymmetric, like a camshaft: whichever β subunit it presses on changes shape. One 120° turn forces all three β sites to advance to the next state.

Top-down view of the catalytic head:

```
                          β_T
                    ATP formed,
                    held tightly
                            ▲
                            │
             β_L  ◄────── γ-shaft ──────►  β_O
        ADP + Pᵢ bound        cam           open,
          loosely                          ATP leaving

                 α subunits sit between the β sites
                 and help hold the head together.
```

For any one β site, the cycle is:

```
                 bind ADP + Pᵢ
        ┌──────────────────────────┐
        │                          ▼
   ┌─────────┐                ┌─────────┐
   │ O state │                │ L state │
   │ open,   │                │ loose,  │
   │ empty   │                │ loaded  │
   └─────────┘                └─────────┘
        ▲                          │
        │                          │ γ turns 120°
        │                          ▼
        │                    ┌─────────────┐
        │                    │ T state     │
        │                    │ tight, ATP  │
        │                    │ trapped     │
        │                    └─────────────┘
        │                          │
        └──── release ATP ◄────────┘
              as γ turns 120°
```

The key point is not "the protein squeezes ADP and phosphate until chemistry happens" in the ordinary solution sense. The tight site makes ATP readily, but then holds it too tightly. Rotation pays the cost of opening that site and releasing ATP into solution.

The mechanical rotation of γ inside the α₃β₃ head physically reshapes the β subunits. **The β subunit doesn't catalyze ATP formation by chemistry alone** — formation of the β–γ phosphoanhydride bond on the bound substrate is roughly *isoenergetic* in the active site. The energy goes into the **mechanical step** that ejects ATP from the tight site once it has formed. This is the inverse of the usual mental model: in solution, ATP synthesis is uphill; in the F₁ pocket, the synthesis itself is easy, and the rotary motor pays the cost of *releasing* the bound product.

This is the kind of thing that took decades to figure out. **Paul Boyer** proposed the binding-change mechanism in the 1970s; **John Walker** solved the F₁ crystal structure in 1994. They shared the 1997 Nobel Prize.

### 5.3 Stoichiometry and Numbers

- One full rotation (360°) of the c-ring → 3 ATP made.
- Number of c-subunits varies: bovine = 8 (so 8 H⁺ per rotation = 8/3 ≈ 2.7 H⁺ per ATP), yeast = 10, plant chloroplast = 14, *E. coli* = 10. Different organisms run their motors with different "gear ratios".
- Rotation rate: \~100\~300 rev/s under physiological load.
- One mitochondrion contains thousands of ATP synthase complexes. A typical liver cell has \>10⁶ ATP synthases distributed across hundreds of mitochondria.

Direct visualization: in 1997, Hiroyuki Noji and colleagues attached a fluorescent actin filament to the γ-subunit of an isolated F₁ unit, fed it ATP, and *watched it rotate under a microscope*, in 120° steps, with ATP hydrolysis (running in reverse). This is one of the cleanest direct demonstrations of a single-molecule rotary motor.

---

## 6. Substrate-Level Phosphorylation: A Cleaner Mechanism

Outside the mitochondrial membrane, the cell makes a smaller share of its ATP by ordinary chemistry. The mechanism is the same one we saw in [Chapter 3, §4](03-atp-as-energy-currency.md): a metabolic intermediate carries a phosphate that is *more* reactive than the one in ATP, and an enzyme transfers it onto ADP.

Two clean examples from glycolysis:

### 6.1 1,3-Bisphosphoglycerate → 3-Phosphoglycerate

```
  1,3-BPG  +  ADP  ─────►  3-PG  +  ATP
                  (phosphoglycerate kinase)

  ΔG°' ≈ \~-18.5 kJ/mol
```

1,3-BPG is an *acyl-phosphate*, a higher-energy phosphate carrier than ATP itself. The reaction runs forward because handing the phosphate off to ADP releases the cell from the more strained acyl-phosphate.

### 6.2 Phosphoenolpyruvate → Pyruvate

```
  PEP  +  ADP  ─────►  Pyruvate  +  ATP
              (pyruvate kinase)

  ΔG°' ≈ \~-31 kJ/mol
```

PEP is the highest-energy phosphate compound in the cell — its hydrolysis releases more free energy than ATP's. This is why pyruvate kinase can make ATP without any membrane gradient or rotary motor: the substrate itself carries enough free energy.

Note that **pyruvate kinase** is a kinase, but it is one of a small handful that runs the kinase reaction *in reverse* (substrate → ADP) for energy production rather than substrate phosphorylation. It is named "kinase" because the chemistry is reversible; thermodynamics decide direction in any given context. For the rest of this report when we say "kinase" we mean the protein-modifying ones, which run the forward direction (ATP → substrate).

---

## 7. Why a Rotary Motor and Not Pure Chemistry?

A reasonable question: why does the cell go to such lengths to build a mechanical rotary motor instead of just stringing together more substrate-level phosphorylations? Three reasons:

1. **Energy density.** Glucose oxidation releases \~2,870 kJ/mol total. Substrate-level phosphorylation captures only \~120 kJ/mol of that as ATP (4 ATP × \~30). The rest is in the NADH and FADH₂. Without OXPHOS, the cell would dump >95% of glucose's free energy as heat.
2. **Universality.** The proton gradient is a *general* energy currency in its own right — any process that can pump or use protons (e.g., bacterial flagellar motors, secondary active transporters) can plug into it. Pure substrate chemistry cannot be pooled this way.
3. **Tunability.** The cell can make more or less ATP by adjusting the proton gradient, the c-ring count, or by uncoupling (e.g., **brown adipose tissue** uses UCP1 to short-circuit the gradient and dissipate it as heat — that is how mammals do non-shivering thermogenesis). Pure chemistry has no such knob.

The proton gradient is, in effect, an analog energy bus. ATP synthase is the primary digital-to-analog converter on that bus. We will not return to ATP synthesis after this chapter — but everything we discuss from here on assumes the cell is delivering ATP at \~10⁻³ M concentration, which is what this rotary motor does for a living.

---

## 8. Summary

- Glycolysis (cytoplasm) and the TCA cycle (matrix) make small amounts of ATP by substrate-level phosphorylation, but most of the energy from food is captured as NADH and FADH₂.
- The mitochondrion's double-membrane structure is central to ATP synthesis: the inner membrane holds the ETC and ATP synthase, while the intermembrane space/crista lumen becomes the high-H⁺ compartment.
- The electron transport chain pumps protons across the inner mitochondrial membrane, building a proton-motive force of \~220 mV.
- ATP synthase is a rotary motor: protons flow through F₀, the c-ring rotates, the γ-shaft rotates inside F₁, and the three β catalytic sites cycle through bind/catalyze/release states (Boyer's binding-change mechanism).
- One full rotation produces 3 ATP. Synthases run at \~100\~300 rev/s.
- A human turns over \~50\~75 kg of ATP per day from a steady-state pool of only \~50 g.

We now have ATP delivered at millimolar concentration in every cell. The next four chapters use it.

---

[← Previous: ATP as Energy Currency](03-atp-as-energy-currency.md) | [Next: Kinase Fundamentals →](05-kinase-fundamentals.md)
