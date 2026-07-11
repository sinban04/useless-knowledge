# Immune Response Timeline

## 1. Why Timelines Matter

The immune system is easier to understand as a sequence than as a cell list. Different mechanisms dominate at different times.

```text
minutes
   barriers, complement, resident macrophages, mast cells

hours
   inflammation, cytokines, chemokines, neutrophil recruitment, NK activation

days
   dendritic-cell migration, naive T-cell activation, B-cell activation, clonal expansion

week and beyond
   antibodies improve, effector T cells peak, memory forms, inflammation resolves
```

The exact timing varies by tissue, dose, pathogen, prior immunity, age, and host condition. The sequence is still useful because it shows why fast innate responses and slower adaptive responses are both necessary.

The deeper reason there are two clocks is a trade-off between speed and specificity:

- **Innate cells are instant because their receptors are germline-encoded.** Pattern-recognition receptors (PRRs) such as Toll-like receptors (TLR4 for LPS, TLR2 for lipopeptides) and NLRs are inherited ready-to-use, so for an innate cell recognition equals action — no new genes, no new clones.
- **Adaptive cells lag because their receptors are somatically rearranged.** Each B-cell receptor (BCR) and T-cell receptor (TCR) is assembled by V(D)J recombination, so the clone that matches a given antigen may start as roughly one cell in a million. That clone must first be *found*, then *licensed*, then *expanded* on the order of a thousandfold before its output can dent the pathogen.

Speed and specificity therefore pull in opposite directions, which is exactly why the body keeps both arms rather than choosing one.

### The Whole System in One Map

```text
PATHOGEN OR DAMAGED CELL
        |
        +--> barriers / complement / resident macrophages
        |        fast containment, inflammation, phagocytosis
        |
        +--> dendritic cell captures antigen + danger context
        |        migrates to lymph node
        |
        v
LYMPH NODE: adaptive decision point
        |
        +--> CD4 T cells
        |        TH1 helps macrophages
        |        Tfh helps B cells
        |        Treg restrains response
        |
        +--> CD8 T cells
        |        kill infected cells showing peptide-MHC I
        |
        +--> B cells
                 make antibody, germinal centers, plasma cells, memory
        |
        v
EFFECTOR PHASE
        |
        +--> antibody neutralizes free toxin/virus
        +--> antibody/complement opsonize bacteria for neutrophils/macrophages
        +--> NK cells kill stressed, MHC-low, or IgG-coated target cells
        +--> CD8 T cells kill peptide-MHC-I-positive infected cells
        |
        v
RESOLUTION AND MEMORY
        macrophages clear dead cells, inflammation resolves,
        long-lived plasma cells + memory B/T cells remain
```

The key is that the immune system is not one linear pipe. It is a loop: innate sensing tells adaptive immunity what is worth expanding; adaptive products then feed back into innate effectors. Antibody is a good example: it is made by B cells, but its Fc tail recruits complement, macrophages, neutrophils, and NK cells.

---

## 2. Scenario A: A Bacterial Splinter Wound

Imagine bacteria enter skin through a splinter.

### Minute to hour scale

Damaged cells release DAMPs (damage-associated molecular patterns — ATP, uric acid, HMGB1, mitochondrial DNA). Resident macrophages and tissue mast cells detect both these danger signals and bacterial PAMPs (pathogen-associated molecular patterns — LPS sensed via TLR4, lipopeptides via TLR2). PRR firing drives two intracellular programs: NF-kB switches on inflammatory genes, and the inflammasome matures IL-1beta. In parallel, the alternative and lectin complement pathways deposit C3b directly on bacterial surfaces within seconds, no antibody required. Blood vessels dilate and become more permeable, partly because mast cells release histamine.

The cytokines and complement fragments released here each have a job:

- **TNF-alpha, IL-1beta, IL-6** activate endothelium, drive fever, and prime the tissue for cell influx.
- **CXCL8 and other chemokines** lay down the gradient neutrophils follow.
- **Complement C3a and C5a** are anaphylatoxins that sharpen the chemotactic gradient; **C5b-9** assembles the membrane-attack complex that punches pores in the bacterial envelope; **C3b/iC3b** opsonize bacteria for complement-receptor (CR1/CR3) uptake.

The four cardinal signs of inflammation — redness, heat, swelling, pain (*rubor, calor, tumor, dolor*) — are the visible side effects of vasodilation, plasma-protein leak, and nerve sensitization by bradykinin and prostaglandins.

```text
skin breach
        |
        v
resident macrophage detects bacteria
        |
        +--> phagocytosis
        +--> TNF-alpha, IL-1, IL-6
        +--> chemokines
        |
        v
neutrophils enter tissue
```

The first goal is containment: keep microbes local, recruit phagocytes, and prevent bloodstream spread.

Within the first hours to day 1, neutrophils dominate. They are the most numerous early responders: they phagocytose opsonized bacteria, discharge antimicrobial granules, and extrude NETs (neutrophil extracellular traps — webs of chromatin studded with enzymes) to snare bacteria. Pus is largely spent neutrophils. They are short-lived by design, because a cell that floods tissue with oxidants and proteases must self-destruct quickly to avoid harming the host.

**What is a neutrophil?** A neutrophil is a short-lived **myeloid granulocyte** made in the bone marrow and released into blood. It is not a lymphocyte. Under a microscope it has a segmented multi-lobed nucleus and many granules, which is why it is also called a **polymorphonuclear leukocyte (PMN)**. Its job is fast, aggressive phagocyte work:

```text
bone marrow granulopoiesis
        |
        v
neutrophil released into blood
        |
        v
CXCL8 / C5a / bacterial products create a chemotactic gradient
        |
        v
rolling -> adhesion -> diapedesis into tissue
        |
        v
Fc receptors grip IgG; complement receptors grip C3b/iC3b
        |
        v
phagocytosis + respiratory burst + granule enzymes + NETs
        |
        v
apoptosis; macrophages clear the spent neutrophils
```

So when antibody coats a bacterium, the most direct "antibody partner" is often a neutrophil or macrophage, not an NK cell.

### Day scale

Dendritic cells carrying antigen reach draining lymph nodes. Naive T cells scan peptide-MHC displays. B cells whose BCRs bind bacterial antigens internalize them, present the peptides on MHC II, and seek help from follicular helper T cells (Tfh). If the bacteria are extracellular, antibodies and complement become increasingly important. The decisive adaptive output for an extracellular pathogen is antibody: IgM first, then class-switched IgG, which opsonizes bacteria for FcgammaR-mediated phagocytosis, activates the classical complement pathway, and neutralizes secreted toxins.

### Resolution

If the infection is cleared, macrophages engulf apoptotic neutrophils and debris — a process called efferocytosis, which is actively anti-inflammatory and switches macrophages toward a repair (M2-like) program. Lipid mediators also shift from pro-inflammatory prostaglandins and leukotrienes to specialized pro-resolving mediators (resolvins, lipoxins, protectins). Inflammatory signals fall. Repair signals rise. Some B and T cells become memory cells.

---

## 3. Scenario B: A Viral Respiratory Infection

Viruses replicate inside host cells, so antibodies alone cannot solve the problem once infection is intracellular.

### Early phase

Infected epithelial cells and dendritic cells detect viral nucleic acids through dedicated sensors: cytosolic double-stranded RNA via RIG-I/MDA5, endosomal RNA via TLR3/7/8, and foreign DNA via the cGAS-STING pathway. The shared output is type I interferon (IFN-alpha/beta), which signals neighboring cells through the JAK-STAT pathway to switch on hundreds of interferon-stimulated genes (ISGs) — degrading viral RNA, blocking translation, and raising the alarm before the virus arrives. Type I interferons therefore create an antiviral state in nearby cells and, together with IL-12 and IL-18, help activate NK cells by raising their cytotoxicity and IFN-gamma output.

```text
virus enters epithelial cell
        |
        v
viral RNA/DNA sensed
        |
        +--> type I interferons
        +--> inflammatory cytokines
        |
        v
NK cells kill stressed or MHC-low cells
```

NK cells can contain spread before virus-specific CD8 T cells are numerous. Their licensing is also tied to a clever logic: many viruses downregulate MHC I to hide infected-cell peptides from CD8 T cells, but that very loss removes the inhibitory signal NK cells depend on, tripping the missing-self alarm. The two cytotoxic arms are thus complementary — a virus that hides MHC I to escape CD8 T cells walks straight into NK-cell killing.

### Adaptive phase

Dendritic cells present viral peptides on MHC I and MHC II in lymph nodes. Importantly, dendritic cells can load peptides from engulfed material onto MHC I by cross-presentation, so CD8 cells can be primed against a virus that never infected the dendritic cell itself. CD8 T cells expand and become cytotoxic T lymphocytes that kill via perforin pores and granzyme proteases (and via the Fas-FasL death pathway). CD4 helper cells (Th1 and Tfh) license dendritic cells, sustain CD8 responses, and drive B-cell antibody production. B cells make antibodies against viral surface proteins, which can neutralize free virus and prevent new cell entry.

```text
free virus outside cells
   -> antibody neutralization

infected cells producing viral proteins
   -> MHC I display
   -> CD8 T-cell killing

MHC-low stressed infected cells
   -> NK-cell killing
```

### Does Antibody Automatically Recruit NK Cells?

Not always. Antibody can recruit several effector systems, and which one dominates depends on what the antibody is stuck to.

| Antibody-coated target | Main partner | Typical result |
|------------------------|--------------|----------------|
| Free virus or toxin | Antibody itself | Neutralization: blocks entry or active site |
| Bacterium or fungal particle | Neutrophil, macrophage, complement | Opsonization and phagocytosis; complement inflammation |
| Infected host cell with viral proteins on its surface | NK cell via CD16, sometimes complement | ADCC: NK releases perforin/granzyme into the antibody-coated cell |
| Tumor cell coated by therapeutic IgG | NK cell via CD16, macrophage, complement | ADCC or antibody-dependent phagocytosis, depending on antibody and tissue |

The important correction is that NK cells do not usually kill a free antigen or swallow an antibody-coated bacterium. NK cells are cytotoxic lymphocytes: they kill **cells**. In antibody-dependent cellular cytotoxicity (**ADCC**), the Fab arms bind antigen on a target-cell surface and the Fc stems point outward; NK-cell **CD16 (Fc gamma RIIIa)** binds those Fc stems and triggers a focused cytotoxic synapse. For antibody-coated microbes, neutrophils and macrophages are usually the cleaner fit because they can engulf the particle.

### Memory

After clearance, memory B cells, long-lived plasma cells (which home to the bone marrow and secrete antibody for years), central- and effector-memory CD4 cells, and memory CD8 cells — including lung-resident memory T cells that stay in the tissue — remain. On re-exposure, pre-existing mucosal antibody may block infection at the airway surface entirely, and memory T cells respond in hours rather than days.

T-cell memory is therefore real, but it looks different from B-cell memory. A memory B response can leave antibody already floating in serum. A memory T cell does not secrete a soluble receptor. Instead, the body keeps more antigen-specific T cells than before, in a primed state: **central memory T cells** refill the response from lymph nodes, **effector memory T cells** patrol blood and tissues, and **tissue-resident memory T cells** stay at barrier sites such as lung, gut, and skin. Memory CD8 cells also survive by homeostatic cytokines such as IL-7 and IL-15 and can regain killing function faster than naive CD8 cells.

---

## 4. Scenario C: Vaccination

A vaccine tries to teach adaptive immunity without causing the full disease.

The core ingredients are:

| Ingredient | Role | Molecular handle |
|------------|------|------------------|
| Antigen | Teaches BCR/TCR specificity | Protein, polysaccharide, mRNA-encoded spike, or attenuated organism |
| Innate stimulus or adjuvant | Tells APCs the antigen matters | Alum (NLRP3 inflammasome), MPL (TLR4 agonist), CpG (TLR9 agonist), lipid-nanoparticle ionizable lipid |
| Delivery route and formulation | Shapes tissue location and immune bias | Intramuscular vs. intranasal; depot vs. rapid release; antigen size and stability |
| Booster schedule | Expands and improves memory | Re-entry into germinal centers; affinity maturation; isotype switching |

For a protein antigen vaccine:

```text
antigen enters tissue
        |
        v
dendritic cells capture antigen and sense adjuvant context
        |
        v
T cells activate in draining lymph node
        |
        v
B cells bind antigen and receive Tfh help
        |
        v
germinal centers improve antibody quality
        |
        v
plasma cells and memory B/T cells persist
```

The vaccine's success depends on more than antigen identity. It depends on whether the antigen is delivered in a way that creates the right innate context, reaches the right lymphoid tissues, and drives durable memory.

Concretely, naive T-cell activation requires three independent signals: signal 1 (peptide-MHC engaging the TCR), signal 2 (costimulation, CD80/CD86 on the dendritic cell engaging CD28 on the T cell), and signal 3 (instructive cytokines). An antigen delivered without an adjuvant often supplies signal 1 but not signals 2 and 3, so it is ignored or even tolerized. The adjuvant supplies the artificial "danger" — PRR engagement that upregulates MHC and CD80/86 — that the absent pathogen would otherwise provide. This is why a bare protein is a poor vaccine and why boosters matter: a second dose re-enters memory B cells into germinal centers, where another round of somatic hypermutation and selection raises antibody affinity and broadens the response, deliberately exploiting the faster, higher-titer secondary response curve.

---

## 5. Where the Four Highlighted Cells Fit

| Time | Macrophage | B cell | T cell | NK cell |
|------|------------|--------|--------|---------|
| Minutes-hours | Senses, eats, releases cytokines | Usually not yet dominant | Usually not yet dominant except tissue-resident memory | Responds to cytokines and abnormal cells |
| Day 1-3 | Recruits cells, presents antigen, contains damage | Antigen binding and early activation may begin | Dendritic-cell priming begins | Early cytotoxicity and IFN-gamma |
| Day 4-7 | Receives T-cell help, clears debris | Clonal expansion, early antibody | Effector differentiation and expansion | Continues support, may decline as T cells dominate |
| Week+ | Resolution and repair | Germinal centers, plasma cells, memory | Effector peak, contraction, memory | Surveillance and tissue-specific roles |

This table is approximate. Secondary immune responses can move faster because memory cells and antibodies already exist.

---

## 6. Why the System Does Not Immediately Use the Strongest Weapon

It would be dangerous to activate every cytotoxic T cell or plasma cell at the first hint of inflammation. The strongest weapons are also the least discriminating in aggregate: cytotoxic killing destroys host cells, high antibody titers can form immune complexes that lodge in vessels and kidneys, and a runaway cytokine response can itself kill the host (a cytokine storm). The system therefore escalates — spending the cheapest, safest, most reversible options first and committing to the expensive, dangerous ones only after the threat is confirmed and localized:

```text
local broad response
        |
        v
evidence gathering and antigen transport
        |
        v
specific clonal expansion
        |
        v
targeted effector response
        |
        v
contraction and memory
```

Each step is a checkpoint that makes commitment progressively harder to trigger by accident. T cells need all three signals to commit; B cells need T-cell help to make high-affinity antibody; effector responses contract sharply once antigen is cleared. The escalation logic in one line: fire the broadest, safest, fastest tool first; confirm the threat; then commit narrow, powerful, slow weapons only against a verified target — and tear them down the moment the threat is gone.

This staged escalation explains many clinical patterns. Early symptoms often reflect innate inflammation. Later improvement may coincide with adaptive control. Severe disease can come from three distinct failures: overwhelming pathogen burden, immune-mediated tissue damage, or failure to resolve inflammation and stand down.

## Summary

Immune responses unfold over time. Macrophages, complement, cytokines, neutrophils, and NK cells act early. Dendritic cells carry antigen and context to lymph nodes. B and T cells then expand, specialize, and return with precise effector functions. Vaccination works by deliberately feeding this sequence antigen plus innate context so memory can form without full disease.

[<- Previous: NK Cells](08-nk-cells.md) | [Next: Memory, Tolerance, and Failure ->](10-memory-tolerance-failure.md)
