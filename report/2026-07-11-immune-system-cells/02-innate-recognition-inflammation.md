# Innate Recognition and Inflammation

## 1. Innate Immunity Starts Before Cells Arrive

**Innate immunity** is the set of inherited defenses that operate without waiting for a new B-cell or T-cell clone to expand. It begins with physical and chemical barriers:

| Barrier | Defensive role |
|---------|----------------|
| Skin | Dry, keratinized surface that blocks entry |
| Mucus | Traps particles and microbes |
| Cilia | Moves mucus out of airways |
| Stomach acid | Kills many swallowed microbes |
| Antimicrobial peptides | Damage microbial membranes |
| Normal microbiota | Competes with pathogens for space and nutrients |

Once a microbe crosses a barrier, the immune system needs a fast way to decide whether tissue has been invaded. That decision is made by cells and soluble proteins that recognize patterns common to microbes or damaged host cells.

![Innate immune cell types](https://commons.wikimedia.org/wiki/Special:FilePath/Innate_Immune_cells.svg)

*Figure: Innate immunity uses multiple cell families rather than one generic first responder: mast cells, NK cells, monocytes, macrophages, dendritic cells, neutrophils, eosinophils, and basophils. Source: Wikimedia Commons file page, [Innate Immune Cells](https://commons.wikimedia.org/wiki/File:Innate_Immune_cells.svg), Fred the Oyster; license: [Public domain](https://creativecommons.org/publicdomain/mark/1.0/).*

---

## 2. Pattern Recognition: PAMPs and DAMPs

A **pathogen-associated molecular pattern (PAMP)** is a conserved microbial feature that host cells can recognize. A **damage-associated molecular pattern (DAMP)** is a host-derived signal that appears when tissue is injured or cells die abnormally.

| Signal | Example | Why it suggests danger |
|--------|---------|------------------------|
| PAMP | Lipopolysaccharide from Gram-negative bacteria | Mammalian cells do not make LPS |
| PAMP | Flagellin | Indicates motile bacteria |
| PAMP | Double-stranded RNA | Often indicates viral replication |
| PAMP | Unmethylated CpG DNA | Common in microbial DNA |
| DAMP | Extracellular ATP | ATP belongs mostly inside healthy cells |
| DAMP | Uric acid crystals | Can appear after cell damage |
| DAMP | Nuclear or mitochondrial contents outside cells | Misplaced intracellular material signals injury |

Cells detect these patterns with **pattern-recognition receptors (PRRs)**. Toll-like receptors are the classic example. A macrophage does not need to know the exact bacterial strain to respond to LPS; it only needs to recognize that LPS is a microbial surface pattern. The PRRs are *germline-encoded* — written directly into the genome rather than rearranged per cell — so the response is instant but restricted to a fixed menu of conserved signatures.

PRRs are not a single receptor but several structurally distinct families, each watching a different cellular compartment. Where the sensor sits is itself a clue: nucleic acids loose in the cytosol almost always mean an intruder, because the cell's own DNA stays in the nucleus and its RNA is processed and capped.

| PRR family | Location | Ligand class it reads | What it signals |
|------------|----------|-----------------------|-----------------|
| Toll-like receptors — surface (TLR4, TLR5, TLR2/1/6) | Plasma membrane | LPS (TLR4 with MD-2/CD14), flagellin (TLR5), lipopeptides (TLR2 heterodimers) | Extracellular bacteria/fungi at the cell surface |
| Toll-like receptors — endosomal (TLR3, 7, 8, 9) | Endosome membrane | dsRNA (TLR3), ssRNA (TLR7/8), unmethylated CpG DNA (TLR9) | Nucleic acids of engulfed viruses/bacteria |
| NOD-like receptors (NLRs) | Cytosol | Peptidoglycan fragments (NOD1/NOD2); danger signals that trigger the inflammasome (NLRP3) | Cytosolic invasion or sterile damage |
| RIG-I-like receptors (RLRs) | Cytosol | Viral RNA — RIG-I reads short 5'-triphosphate RNA, MDA5 reads long dsRNA | Active viral replication in the cytosol |
| cGAS–STING | Cytosol | Cytosolic double-stranded DNA — cGAS makes the messenger cGAMP, which activates STING | DNA virus, intracellular bacterium, or leaked self DNA |
| C-type lectin receptors / soluble lectins | Surface / secreted | Microbial carbohydrates (mannose, beta-glucan); mannose-binding lectin in plasma | Fungal and bacterial sugar coats |

A particularly important cytosolic device is the **inflammasome**, which works on a two-signal rule. Signal 1 (a TLR firing) primes the cell to transcribe pro-IL-1β. Signal 2 (a DAMP such as extracellular ATP or uric acid crystals, sensed by NLRP3) assembles the inflammasome, which activates **caspase-1**. Caspase-1 cleaves pro-IL-1β into mature, secreted IL-1β and can trigger **pyroptosis**, an inflammatory cell death that releases more alarm signals. This is why PAMPs and DAMPs together produce a much louder response than either alone.

The downstream wiring also splits by compartment. Most surface and endosomal TLRs signal through the adaptors MyD88 (and TRIF for TLR3/TLR4) and the IRAK/TRAF6 kinases to activate the master inflammatory transcription factor **NF-κB**. The cytosolic nucleic-acid sensors (RLRs and cGAS–STING) route instead toward **type I interferon** (IFN-α/β) genes, the antiviral program.

This gives innate immunity speed. It also gives it a limitation: pathogens that hide conserved patterns, live inside host cells, or mimic host surfaces can evade broad detection.

---

## 3. Complement: Soluble Pattern Recognition in Blood

The **complement system** is a cascade of about thirty plasma proteins, made mostly by the liver and circulating as inactive precursors. When triggered, each component cleaves the next, so a small initiating event amplifies into a large surface coating — the same proteolytic-amplification logic as blood clotting. It can be activated by several routes:

| Pathway | Trigger | Initiator molecules | Typical meaning |
|---------|---------|---------------------|-----------------|
| Alternative | Spontaneous C3 "tickover" stabilized on microbial surfaces | C3(H2O), Factor B, Factor D, properdin | A surface lacks host complement regulators |
| Lectin | Mannose-binding lectin (MBL) or ficolins bind microbial carbohydrates | MBL with MASP-1/MASP-2 proteases | A microbial sugar pattern is exposed |
| Classical | Antibody (IgM/IgG) or C-reactive protein binds a surface | C1q–C1r–C1s complex | Adaptive or acute-phase recognition has tagged the target |

All three routes converge on C3 cleavage. **C3** is the central, abundant complement protein in blood. It circulates inactive, but once it is cut the large fragment, **C3b**, exposes a reactive chemical group that can stick covalently to nearby surfaces. If that surface is a bacterium, C3b becomes an "eat me" coat. If that surface is a host cell, complement regulators usually remove it immediately.

![Classical, lectin, and alternative complement pathways converging on C3 cleavage and the membrane attack complex](https://commons.wikimedia.org/wiki/Special:FilePath/Complement_pathway.svg)

*Figure: The complement pathways are three recognition routes that converge on C3 cleavage, then on C5 cleavage and terminal membrane-attack-complex formation. Source: Wikimedia Commons file page, [Complement pathway](https://commons.wikimedia.org/wiki/File:Complement_pathway.svg), Perhelion, public-domain dedication.*

Each route builds a **C3 convertase** — an enzyme complex bolted to the target surface — and that convertase splits every C3 it meets into C3a and C3b. The classical and lectin pathways build **C4b2a**; the alternative pathway builds **C3bBb**. The names are ugly but the idea is simple: a surface-bound enzyme repeatedly cuts soluble C3 from the blood. Every new C3b molecule that lands nearby can help build more alternative-pathway convertase, so C3 is the system's amplifier.

The three pathways are like **regulated tripwires**, not uncontrolled mines. Each pathway asks a different detection question:

- **Alternative pathway:** is this a surface that cannot prove it is host? Low-level C3 activation is constantly sampled; host regulators stop it, microbial surfaces let it grow.
- **Lectin pathway:** is there a repeated microbial sugar pattern? Mannose-binding lectin or ficolins bind carbohydrates that are common on microbes.
- **Classical pathway:** has antibody or C-reactive protein already tagged this surface? C1q binds clustered Fc or CRP, then starts the cascade.

```text
alternative / lectin / classical detection
        |
        v
surface C3 convertase (C3bBb or C4b2a)
        |
        +--> C3a released       -> inflammation
        +--> C3b sticks nearby  -> opsonization + more amplification
                 |
                 v
          C5 convertase forms when C3b accumulates
                 |
                 +--> C5a released       -> strong neutrophil recruitment
                 +--> C5b starts C6-C9   -> membrane attack complex pore
```

**C3 tickover** means a tiny fraction of C3 spontaneously hydrolyzes in plasma all the time. That produces C3(H2O), which can start the alternative pathway. On host cells, Factor H, Factor I, CD55, and related regulators dismantle the reaction. On a microbial surface with no host regulators, deposited C3b persists, recruits Factor B and Factor D, and becomes the alternative C3 convertase. So the alternative pathway is a continuous surface test: "prove you are host, or the C3b coating will grow."

The component names become easier if you group them by job:

| Name | What it is | Plain-English role |
|------|------------|--------------------|
| C3 | Central soluble complement protein | Hub that gets split into inflammatory C3a and sticky C3b |
| C3a | Small C3 fragment | Alarm signal; contributes to inflammation |
| C3b | Large sticky C3 fragment | Coats target surfaces; helps phagocytes grip; helps build more convertase |
| Factor B / D | Alternative-pathway proteins | Join and cut C3b to form the alternative C3 convertase, C3bBb |
| Properdin | Convertase stabilizer | Helps the alternative convertase stay assembled on microbial surfaces |
| C5 | Downstream complement protein | Gets split when enough C3b has accumulated |
| C5a | Small C5 fragment | Very strong neutrophil chemoattractant and activator |
| C5b | Large C5 fragment | Starter scaffold for the terminal membrane attack complex |
| C6, C7, C8 | Terminal pathway proteins | Bind C5b and insert the growing complex into the membrane |
| C9 | Pore-forming terminal protein | Polymerizes into the ring of the MAC pore |
| CD55 / CD59 / Factor H | Host regulators | Break convertases or block MAC formation so normal cells are spared |

The most important product is often **C3b**, an opsonin. An **opsonin** is a molecular "eat me" tag that helps phagocytes bind and engulf a target. C3b binds covalently to the microbial surface, and phagocyte complement receptors **CR1** (binds C3b) and **CR3** (binds the cleaved form iC3b) grip it, dramatically improving engulfment. Complement also generates **C3a and C5a**, the **anaphylatoxins**: small fragments that diffuse away, trigger mast-cell degranulation, raise vascular permeability, and form a chemotactic gradient that pulls neutrophils and monocytes toward the target (C5a is the most potent). The terminal pathway assembles the **membrane attack complex (MAC)**: C5b nucleates C6, C7, C8, and many C9 molecules into a ring-shaped pore (C5b-C9) that lyses some Gram-negative bacteria directly.

Host cells protect themselves with regulators — CD55, CD59, and Factor H — that disassemble convertases and block the MAC. A microbial surface lacks exactly these regulators, which is why the always-on alternative pathway kills foreign surfaces by default: spontaneous C3 tickover is shut down instantly on host cells but runs unchecked on a bare microbe.

Complement shows a recurring immune principle: recognition and killing are separable. A protein tag can mark the target; a macrophage or neutrophil can execute the cleanup.

---

## 4. Inflammation Is a Controlled Tissue Program

**Inflammation** is not just swelling. It is a coordinated tissue state that changes blood vessels, endothelial adhesion, local chemistry, and cell recruitment.

```text
macrophage detects microbe
        |
        +--> TNF-alpha, IL-1, IL-6
        |       -> endothelial activation, fever, acute-phase response
        |
        +--> chemokines
        |       -> neutrophils and monocytes follow gradient
        |
        +--> prostaglandins and other mediators
                -> pain, vascular changes
```

The classic signs are heat, pain, redness, and swelling. Mechanistically, they reflect vasodilation, vascular leak, endothelial activation, leukocyte entry, and nerve sensitization. The local goal is to concentrate plasma proteins and immune cells at the site where they are needed.

The cytokine program above is driven by **NF-κB**, which normally sits inactive in the cytoplasm bound to its inhibitor IκB. PRR signaling activates the IKK kinase, which phosphorylates IκB and marks it for degradation; the freed NF-κB enters the nucleus and switches on the inflammatory gene set. The main outputs and their jobs:

| Cytokine | Main effect |
|----------|-------------|
| TNF-alpha | Activates endothelium and supports local containment; drives systemic shock if released body-wide |
| IL-1 (β) | Inflammation, fever, endothelial activation — matured by the inflammasome/caspase-1 |
| IL-6 | Acute-phase protein production by the liver (CRP, MBL); lymphocyte differentiation |
| IL-12 | Pushes NK and TH1 cells toward IFN-γ |
| Type I interferon (IFN-α/β) | Antiviral state in neighboring cells — driven by RLR and cGAS–STING sensing |
| Chemokines (e.g. CXCL8) | Recruit neutrophils, monocytes, and lymphocytes along gradients |

Inflammation becomes dangerous when it spreads systemically or fails to resolve. The same TNF-alpha that helps contain local infection can contribute to shock when released throughout the body — the core of septic shock.

---

## 5. Chemokines Turn Tissue Into a Map

**Chemokines** are cytokines specialized for cell movement. They form gradients that tell leukocytes where to go. A neutrophil leaving the bloodstream does not know the pathogen's identity; it follows adhesion signals and chemokine gradients created by infected tissue and resident immune cells.

```text
infected tissue
   high chemokine concentration
      ^
      |
neutrophils crawl from blood toward signal
      |
      v
blood vessel with activated endothelium
```

The crawl out of the bloodstream is a defined sequence — the **leukocyte adhesion cascade**: *rolling* (selectins make the neutrophil tumble along the vessel wall) -> *activation* (chemokines signal the cell to firm up) -> *firm arrest* (integrins lock onto endothelial ICAM-1) -> *transmigration* (the cell squeezes between endothelial cells into tissue).

This matters because the immune system is spatial. A lymphocyte clone that recognizes an antigen is useless if it never meets the antigen. An antibody is useless if it cannot reach the infected compartment. Chemokines and adhesion molecules give immune responses location.

---

## 6. Innate Signals Gate Adaptive Immunity

Adaptive immunity is powerful enough to damage the host. Therefore a receptor match alone is not always enough. A naive T cell generally needs antigen plus costimulation plus cytokine context. A B cell that binds antigen often needs T-cell help. Dendritic cells become effective activators only after they sense microbial or inflammatory signals.

The logic is:

```text
antigen without danger context
        -> tolerance, deletion, anergy, or weak response

antigen with innate danger context
        -> costimulation, cytokines, lymphocyte expansion
```

Mechanistically, PRR signaling matures the dendritic cell: it upregulates the costimulatory molecules B7 (CD80/CD86) and migrates to the draining lymph node, where it can deliver both antigen and the "second signal" a naive T cell requires.

This prevents the immune system from treating every harmless self protein or food protein as an emergency. It also explains why vaccines use adjuvants. An antigen teaches specificity; an adjuvant supplies innate context — often by directly triggering PRRs so the dendritic cell matures.

---

## 7. What Is Interferon?

**Interferons (IFNs)** are cytokines that warn cells about infection, especially viral infection. The name comes from the original observation that a virus-infected cell can release a factor that "interferes" with viral replication in neighboring cells. In immune-system terms, interferon is not the kill shot; it is the broadcast that changes nearby cells into a harder place for viruses to replicate.

```text
viral RNA or cytosolic DNA detected
        |
        v
RIG-I / MDA5 or cGAS-STING activates IRF transcription factors
        |
        v
infected cell releases type I interferon (IFN-alpha / IFN-beta)
        |
        v
neighboring cells switch on antiviral genes
        |
        v
slower viral replication + better antigen presentation + stronger NK/CD8 response
```

There are three major interferon families worth separating:

| Interferon family | Main examples | Main source | Main job |
|-------------------|---------------|-------------|----------|
| Type I | IFN-alpha, IFN-beta | Virus-infected cells, plasmacytoid dendritic cells | Puts nearby cells into an antiviral state; raises MHC I expression; supports NK and CD8 responses |
| Type II | IFN-gamma | NK cells, TH1 CD4 cells, CD8 T cells | Activates macrophages; strengthens antigen presentation; pushes cell-mediated immunity |
| Type III | IFN-lambda | Epithelial and immune cells, especially at barriers | Antiviral protection at mucosal surfaces with more localized effects |

The type I interferon program makes a cell more hostile to viruses by inducing hundreds of **interferon-stimulated genes (ISGs)**. Some block viral RNA translation, some degrade viral nucleic acids, some slow protein synthesis, and some make antigen presentation more visible by increasing MHC I. This is why chapter 9's viral timeline starts with infected cells producing interferon before the adaptive response has expanded.

IFN-gamma is different. It is not mainly the early "warn the neighbors" antiviral alarm. It is a macrophage-licensing cytokine: NK cells and TH1 cells release IFN-gamma to make macrophages more microbicidal, with more reactive oxygen/nitrogen chemistry and stronger antigen-presentation machinery. The same word "interferon" therefore covers two related but distinct immune messages: **type I interferon spreads an antiviral state; IFN-gamma licenses cellular killing and macrophage activation**.

## Summary

Innate immunity uses inherited receptors, soluble cascades, and tissue-level programs to detect broad danger patterns. Complement tags microbes, macrophages and dendritic cells interpret local signals, cytokines and chemokines recruit help, and inflammation changes the tissue environment. These signals do more than buy time; they determine whether adaptive B and T cells should be activated.

[<- Previous: Introduction](01-introduction.md) | [Next: Macrophages ->](03-macrophages.md)
