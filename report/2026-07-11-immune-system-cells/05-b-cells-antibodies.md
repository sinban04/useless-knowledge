# B Cells and Antibodies

## 1. What a B Cell Recognizes

A **B cell** is an adaptive lymphocyte whose receptor is a membrane-bound antibody. This **B-cell receptor (BCR)** can bind native antigen: proteins, polysaccharides, lipids, toxins, viral surface proteins, bacterial capsules, and other extracellular structures.

This is the first major contrast with T cells:

| Feature | B cell | T cell |
|---------|--------|--------|
| Receptor | BCR, a membrane immunoglobulin | TCR, a T-cell receptor |
| Antigen form | Native molecular shape | Peptide-MHC complex |
| Main effector output | Secreted antibodies | Cellular help, killing, regulation |
| Secreted receptor? | Yes, as antibody | No |

**Lymphocyte** is the family name, not a separate cell competing with B cells. A lymphocyte is a white blood cell lineage specialized for immune recognition. **B cells** and **T cells** are the two major adaptive lymphocyte classes; **NK cells** are lymphocyte-lineage cells too, but they use innate-style receptor logic rather than a unique V(D)J-built receptor. So every B cell is a lymphocyte, but not every lymphocyte is a B cell.

When activated, a B cell can become a **plasma cell**, a specialized antibody factory. That is the unique contribution of B cells: they turn a cell-surface recognition molecule into a soluble molecule that can patrol blood, mucus, and tissue fluid.

---

## 2. How One Body Makes So Many BCRs

BCR diversity comes from DNA rearrangement. Developing B cells assemble immunoglobulin genes from variable (V), diversity (D), and joining (J) gene segments. This is **V(D)J recombination**.

This section gives the B-cell version. The dedicated mechanism page, [V(D)J Recombination and Germinal Centers](12-vdj-recombination-germinal-centers.md), walks through RAG cutting, junctional diversity, receptor checkpoints, and how germinal centers differ from V(D)J recombination.

```text
germline gene segments
   many V + many D + many J
        |
        v
random segment choice and joining
        |
        v
unique heavy-chain variable region
        |
        v
paired with unique light-chain variable region
        |
        v
one B cell with one dominant antigen specificity
```

Additional diversity comes from imprecise joining and pairing heavy and light chains. The result is a huge receptor repertoire generated before the immune system knows which pathogens it will meet.

The molecular machinery is worth naming, because V(D)J recombination is the only deliberate, programmed genome editing in normal vertebrate development:

- **RAG1/RAG2 recombinase** makes the cuts. It recognizes **recombination signal sequences (RSS)** flanking each gene segment and introduces double-strand breaks. The **12/23 rule** (segments are joined only when their RSS spacers are 12 vs 23 base pairs apart) enforces the correct order: heavy chain joins D-to-J first, then V-to-DJ.
- **Allelic exclusion** ensures a B cell uses only one productively rearranged heavy-chain allele, so it expresses a single specificity.
- **The light chain** (κ or λ) rearranges next, using V and J segments only (no D), and pairs with the heavy chain. Any heavy chain can pair with any light chain, so pairing multiplies diversity combinatorially.

Three independent sources of diversity stack:

| Source | Mechanism | Where it acts |
|--------|-----------|---------------|
| Combinatorial | Which V, D, J segments are chosen and joined | Heavy and light loci independently |
| Heavy/light pairing | Any heavy chain can pair with any light chain | At chain assembly |
| **Junctional** | Exonuclease nibbling of cut ends, plus palindromic **P-nucleotides** and template-independent **N-nucleotides** added by **TdT** (terminal deoxynucleotidyl transferase) | Concentrated at the CDR3 join |

**Junctional diversity is the crown jewel.** Because TdT and exonuclease activity randomly add and remove bases exactly where the third complementarity-determining region (**CDR3**) forms — and CDR3 sits at the center of the antigen-binding surface — two B cells using identical V, D, and J segments can still bind completely different antigens. The cost of this randomness is that roughly two of every three joins are out of frame, and those cells die.

The cost is also self-reactivity. B-cell development includes checkpoints that **delete** strongly self-reactive cells, force **receptor editing** (a fresh light-chain rearrangement to escape self-binding), or render them **anergic** before they become mature naive B cells.

---

## 3. Clonal Selection

**Clonal selection** is the central operating principle of adaptive immunity. A naive B cell already has its receptor before antigen appears. Antigen does not instruct the B cell to invent a matching receptor; it selects the rare cell that already matches.

```text
large pool of naive B cells
        |
        v
antigen binds rare matching BCR
        |
        v
that B-cell clone proliferates
        |
        v
progeny differentiate into plasma cells and memory B cells
```

The receptor specificity is inherited by the clone's descendants. A matching B cell can therefore expand from rarity to dominance during an immune response.

### What If No BCR Matches the Antigen?

This is a real possibility in principle. V(D)J recombination gives the body an enormous **statistical search library**, not a mathematically complete catalog of every possible antigen. The system works because several things stack:

- The naive B-cell repertoire is very large.
- BCRs are **cross-reactive**: a receptor does not need a perfect engineered fit to bind weakly enough to start.
- A pathogen carries many possible epitopes, so the immune system can often respond to some accessible part even if it misses another part.
- Once a low-to-moderate starting match enters a germinal center, somatic hypermutation can improve that selected clone.

But a germinal center cannot rescue a clone that never bound antigen at all. It is an **improvement workshop**, not the first generator. A B cell must first capture antigen through its existing BCR, present peptide on MHC II, and receive help. If no B cell captures enough antigen, if the epitope is hidden, if the antigen resembles self and the matching clones were deleted or silenced, or if T-cell help is missing, the antibody response can be weak, delayed, or absent. Vaccines help by presenting antigen with adjuvant and sometimes carrier proteins so rare clones and matching helper T cells are easier to activate.

---

## 4. T-Dependent B-Cell Activation

Many protein antigens require help from CD4 T cells, especially T follicular helper cells.

```text
1. BCR binds antigen.
2. B cell internalizes the antigen.
3. B cell digests antigen and displays peptide on MHC II.
4. T follicular helper cell recognizes peptide-MHC II.
5. CD40L-CD40 and cytokines activate the B cell.
6. B cell proliferates, class-switches, mutates, and differentiates.
```

This is not usually "macrophage gives antigen to helper T cell, then helper T cell gives antigen to B cell." The more precise split is:

- A dendritic cell usually primes the naive CD4 T cell first.
- A macrophage can later receive help from a TH1 cell if it presents microbial peptide on MHC II.
- A B cell receives Tfh help only after the **B cell itself** captures antigen through its BCR and presents peptide from that captured antigen on MHC II.

This coupling is important. The B cell proves it bound antigen. The helper T cell proves that a professional antigen-presenting pathway has generated a T-cell response to the same antigenic source. The two cells do not need to see the exact same epitope, but their epitopes must be physically linked in the same antigenic object. This **linked-recognition** rule reduces the chance that a random self-reactive B cell receives full activation.

Some antigens can activate B cells with less T-cell help, especially repetitive polysaccharides that strongly cross-link BCRs. These T-independent responses can be fast and useful against encapsulated bacteria, but they usually produce weaker memory and less affinity maturation than T-dependent germinal-center responses.

---

## 5. Germinal Centers: Mutation Plus Selection

A **germinal center** is a specialized, transient structure inside secondary lymphoid tissue (lymph node, spleen, tonsil) where activated B cells improve their antibodies over days to weeks. It is physically split into two zones that B cells cycle between:

- **Dark zone** — rapid proliferation and somatic hypermutation. The fast-dividing B cells here are called centroblasts.
- **Light zone** — selection. Centrocytes compete to capture limited antigen displayed on **follicular dendritic cells (FDCs)** and to win help from **T follicular helper (Tfh)** cells. A better-binding BCR captures more antigen, presents more peptide-MHC II to Tfh, and wins more survival and CD40L/IL-21 help; poor binders fail to compete and die by apoptosis. Survivors either recycle to the dark zone for another round of mutation or exit as plasma or memory cells.

A single enzyme drives both germinal-center processes: **activation-induced cytidine deaminase (AID)**. AID deaminates cytosine to uracil in single-stranded DNA exposed during transcription; error-prone repair then converts that lesion into either point mutations or double-strand breaks, depending on where AID acts.

Two processes matter:

| Process | Where AID acts | What changes | What it accomplishes |
|---------|----------------|--------------|----------------------|
| Somatic hypermutation (SHM) | V-region exon (variable region) | Point mutations at roughly a million times the background rate | Creates BCR variants with different affinities to select among |
| Class-switch recombination (CSR) | Switch (S) regions in the heavy-chain constant locus | Deletes one constant-region exon set and joins another | Changes effector function (the Fc) without changing antigen specificity (the Fab) |

**Affinity maturation** is Darwinian selection inside a lymphoid organ. B cells mutate their BCR genes in the dark zone; variants that bind antigen better capture more antigen in the light zone and so receive more survival and Tfh help signals. Over repeated dark-zone/light-zone cycles, the average affinity of the antibody response climbs.

Class switching changes what the antibody does after binding. The antigen-binding variable region can stay the same while the constant region changes from IgM to IgG, IgA, or IgE. Because SHM and CSR are both run by AID, the same controlled mutator that powers antibody quality is dangerous if mistargeted: off-target AID activity at non-immunoglobulin genes is implicated in the chromosomal translocations behind several B-cell lymphomas — the price of letting a cell deliberately damage its own DNA.

---

## 6. What Antibodies Do

An **antibody** is not only a binding molecule. It is a bridge between antigen recognition and effector mechanisms. Its Y shape splits the labor cleanly: the two **Fab arms** (variable region, built from heavy + light pairing, with the hypervariable CDR loops at the tip) decide *what* to grab, while the **Fc stem** (heavy-chain constant region) decides *what happens next* by recruiting effector partners — complement C1q, Fc receptors on phagocytes (FcγR), CD16 on NK cells, and transport receptors such as FcRn and pIgR. Tagging and action are separable, the same design principle seen with complement opsonization.

| Antibody function | Mechanism | Example result |
|-------------------|-----------|----------------|
| Neutralization | Blocks toxin or viral entry site | Virus cannot enter cell |
| Opsonization | Fc region binds Fc receptors on phagocytes | Macrophage engulfs coated microbe |
| Complement activation | Classical pathway starts on antibody-coated surface | C3b deposition and inflammation |
| Agglutination | Multivalent binding clumps particles | Easier clearance |
| ADCC | NK cell CD16 binds antibody Fc on target | NK cell kills coated cell |
| Mucosal protection | Secretory IgA binds pathogens in mucus | Reduced attachment and entry |

The five major antibody classes tune these functions.

| Class | Heavy chain / form | Effector role |
|-------|--------------------|---------------|
| IgM | μ / secreted pentamer | First secreted antibody; ten binding sites give strong agglutination and the most potent classical-pathway complement activation (C1q binding). Low affinity, high avidity |
| IgG | γ / monomer (4 subclasses) | Blood and tissue workhorse: neutralization, opsonization (binds FcγR on phagocytes), complement fixation, and ADCC. The only isotype actively transported across the placenta, via FcRn, to protect the newborn |
| IgA | α / monomer in blood, dimer in secretions | Mucosal surfaces and secretions; secretory IgA is transported across epithelium by the polymeric Ig receptor (pIgR) into gut, airway, tears, and breast milk, where it blocks pathogen attachment |
| IgE | ε / monomer | Parasite (helminth) defense and allergy; binds FcεRI on mast cells and basophils, and cross-linking triggers degranulation |
| IgD | δ / monomer | Mostly a B-cell receptor role, co-expressed with IgM on mature naive B cells; little secreted |

---

## 7. How Antibodies and Neutrophils Work Together

A **neutrophil** is a short-lived, fast-arriving phagocyte specialized for acute bacterial and fungal inflammation. Under the microscope it has a **segmented, multi-lobed nucleus** and many granules packed with antimicrobial enzymes. That lobed nucleus is why neutrophils are often called **polymorphonuclear leukocytes** or PMNs.

![Neutrophil schematic](https://commons.wikimedia.org/wiki/Special:FilePath/Neutrophil.svg)

*Figure: Neutrophil schematic. Source: Wikimedia Commons file page, [Neutrophil](https://commons.wikimedia.org/wiki/File:Neutrophil.svg), extracted from a hematopoiesis diagram by A. Rad, Mikael Häggström, Spacebirdy, RexxS, and domdomegg, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).*

![Neutrophil migration and phagocytosis](https://commons.wikimedia.org/wiki/Special:FilePath/NeutrophilerAktion.svg)

*Figure: Neutrophil action: migration out of a blood vessel, enzyme release, and phagocytosis of bacteria. Source: Wikimedia Commons file page, [NeutrophilerAktion](https://commons.wikimedia.org/wiki/File:NeutrophilerAktion.svg), original Dr. med. Mario Schubert, vector Mrmw, [CC0](https://creativecommons.org/publicdomain/zero/1.0/).*

Antibody does not usually kill a bacterium by itself. It turns the bacterium into a better target for neutrophils and macrophages. The Fab arms bind the microbial antigen; the Fc stems point outward as handles for immune cells.

```text
Fab binds microbial surface
        |
        v
Fc stems cluster outside the microbe
        |
        v
neutrophil Fc receptors grip IgG Fc
and complement receptors grip C3b / iC3b
        |
        v
phagocytosis, respiratory burst, granule enzymes, NETs
```

| Neutrophil step | Main mechanism | Why antibody helps |
|-----------------|----------------|--------------------|
| Recruitment | CXCL8/IL-8, C5a, leukotriene B4, endothelial selectins/integrins | Complement activated by antibody can generate C5a, a strong neutrophil attractant |
| Recognition | Fcgamma receptors bind IgG Fc; CR1/CR3 bind C3b/iC3b | Antibody and complement coat the surface with many handles |
| Phagocytosis | Actin wraps the target into a phagosome | Clustered Fc/complement receptors give a strong "eat this" signal |
| Killing | Respiratory burst, granule enzymes, antimicrobial peptides | Opsonization focuses killing on the tagged target |
| NETs | Neutrophil extracellular traps can ensnare microbes | Useful in some infections, but excessive NETs can damage host tissue |

Macrophages and neutrophils overlap but are not the same. Neutrophils arrive fast from blood, kill aggressively, and often die at the site. Macrophages live longer in tissue, coordinate cytokines and repair, and present antigen more meaningfully.

---

## 8. What Dendritic Cells Look Like and Do

A **dendritic cell** is the professional scout of adaptive immunity. It has a branched, star-like shape with long membrane projections that probe tissue and make contacts with T cells. Its job is not to secrete antibody; its job is to carry antigen plus danger context from tissue to the lymph node.

![Dendritic cell presenting antigen to a T cell](https://commons.wikimedia.org/wiki/Special:FilePath/Antigen_presentation_by_dendritic_cell.jpg)

*Figure: A dendritic cell presenting antigen to a T cell. The branched shape supports tissue sampling and cell-cell contact. Source: Wikimedia Commons file page, [Antigen presentation by dendritic cell](https://commons.wikimedia.org/wiki/File:Antigen_presentation_by_dendritic_cell.jpg), Suraj at Malayalam Wikipedia, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).*

```text
immature dendritic cell samples tissue
        |
        v
PRR signal says "danger here"
        |
        v
dendritic cell matures: MHC high, B7 high, CCR7 high
        |
        v
migrates through lymphatic vessel to draining lymph node
        |
        v
naive T cells scan peptide-MHC plus costimulation
```

The clean division is: a B cell is the antibody specialist; a dendritic cell is the naive-T-cell activation specialist. A B cell can present antigen too, but mainly after its BCR captures a matching antigen. A dendritic cell is built to start the T-cell response in the first place.

---

## 9. Plasma Cells and Memory B Cells

After activation, B-cell progeny diverge.

| Fate | Function |
|------|----------|
| Short-lived plasma cell | Rapid antibody production during acute response |
| Long-lived plasma cell | Persistent antibody secretion, often from bone marrow niches |
| Memory B cell | Rapid recall response after re-exposure |

Memory B cells are not just leftovers. Many have undergone class switching and affinity maturation. On re-exposure, they can reactivate faster than naive B cells and generate higher-quality antibody responses.

## Summary

B cells solve the extracellular specificity problem. Each B cell carries a unique BCR made by gene rearrangement. Antigen selects rare matching clones. With T-cell help, those clones form germinal centers, improve affinity by somatic hypermutation, change antibody class by class-switch recombination, and produce plasma cells and memory B cells. Antibodies then neutralize, opsonize, activate complement, recruit phagocytes, and enable NK-cell antibody-dependent killing. Neutrophils read antibody and complement tags to phagocytose microbes quickly, while dendritic cells handle the separate job of starting naive T-cell responses.

[<- Previous: Antigen Presentation](04-antigen-presentation.md) | [Next: T Cells ->](06-t-cells.md)
