# System Synthesis

## 1. The Short Algorithm

The immune system can be compressed into a short algorithm:

```text
1. keep microbes out
2. detect conserved danger or tissue damage
3. tag suspicious targets
4. eat and destroy what can be eaten
5. display peptide evidence to lymphocytes
6. expand rare matching B and T cells
7. coat extracellular targets with antibody
8. kill infected, stressed, or abnormal host cells
9. shut down the response
10. remember useful specificity while preserving tolerance
```

Each step rests on a distinct molecular machine. It is worth naming the hardware explicitly, because the same ten steps reappear in every worked example below:

| Step | Molecular machinery doing the work |
|------|------------------------------------|
| Keep out | Epithelial tight junctions, mucus + secretory IgA, lysozyme, gastric acid, antimicrobial peptides (defensins, cathelicidins) |
| Detect | **PRRs**: Toll-like receptors (TLRs), NOD-like receptors (NLRs, including the NLRP3 inflammasome), RIG-I/MDA5 for viral RNA, cGAS-STING for cytosolic DNA |
| Tag | Complement C3b/iC3b opsonins, antibody Fc regions, soluble collectins/pentraxins (mannose-binding lectin, C-reactive protein) |
| Eat and destroy | FcγR- and CR3-triggered actin engulfment, phagolysosome acidified to pH \~4.5, NADPH-oxidase respiratory burst (reactive oxygen species), iNOS-derived nitric oxide |
| Display | Immunoproteasome -> TAP -> MHC I for endogenous (cytosolic) peptides; endosomal cathepsins -> MHC II via the invariant chain/CLIP/HLA-DM exchange for exogenous peptides |
| Expand | Clonal selection of one matching BCR/TCR specificity; IL-2 autocrine proliferation loop; germinal-center expansion |
| Coat | Class-switched antibody (IgG, IgA) secreted by plasma cells; drives neutralization, opsonization, and classical-pathway complement |
| Kill host cells | CD8 perforin/granzyme; Fas-FasL death signaling; NK missing-self killing; antibody-dependent ADCC through CD16 |
| Shut down | Treg suppression (IL-10, TGF-β, CTLA-4), inhibitory checkpoints (PD-1), effector-cell contraction, efferocytosis of apoptotic neutrophils |
| Remember | Long-lived memory B and T cells, bone-marrow plasma cells; tolerance preserved by thymic/marrow negative selection plus peripheral Tregs |

The four highlighted cell types map onto different steps. They do not each run the whole algorithm — they specialize. Reading the matrix by *column* shows what one cell can do; reading by *row* shows how the cells collaborate on a single step. The "No" entries are as informative as the capabilities: NK cells never eat or present peptide, and B cells never directly kill.

| Step | Macrophage | B cell | T cell | NK cell |
|------|------------|--------|--------|---------|
| Detect | PRRs, Fc receptors, complement receptors | BCR binds antigen | TCR binds peptide-MHC | Activating/inhibitory receptor balance |
| Eat | Strong phagocyte | Internalizes BCR-bound antigen | No | No |
| Display | MHC II | MHC II after antigen capture | Reads display | Reads stress/self state, not peptide-MHC |
| Expand | Local proliferation in some tissues, monocyte recruitment | Clonal expansion | Clonal expansion | Cytokine-driven expansion/activation |
| Kill | Intracellular killing after phagocytosis | Antibodies recruit killing | CD8 cytotoxicity, CD4 macrophage help | Cytotoxic granules and death pathways |
| Remember | Tissue training/state changes, not classic clonal memory | Memory B cells and plasma cells | Memory T cells | Limited memory-like behavior in some contexts |

The matrix has a structure. Recognition (detect) is universal — every cell carries a sensing receptor — but the *kind* of evidence differs: pattern (macrophage), free antigen (B cell), peptide-MHC (T cell), or self-status (NK cell). Killing is split by target: extracellular (antibody-guided phagocytosis and complement) versus host-cell (CD8 and NK cytotoxicity).

---

## 2. Why Macrophages Matter

Macrophages are the local interpreters. They are already in tissues when trouble begins. They recognize broad microbial and damage patterns, engulf particles, release cytokines, recruit help, and later clean up the battlefield.

Their unique position is this:

```text
tissue event -> macrophage interpretation -> inflammatory state
   |
   +-- PRRs (TLR/NLR) fire -> NF-kB program switched on
   +-- NLRP3 inflammasome -> caspase-1 -> mature IL-1-beta
   +-- secretes TNF-alpha, IL-6, IL-12 + chemokines
   +-- recruits neutrophils and monocytes along gradients
```

The conversion runs through named molecular machinery. When pattern-recognition receptors engage, signaling through the transcription factor **NF-κB** switches on inflammatory gene programs, while assembly of the **NLRP3 inflammasome** activates **caspase-1**, which cleaves pro-IL-1β into its mature, secreted form. The output cytokines reprogram the neighborhood: TNF-α and IL-1 activate local endothelium, IL-6 drives the hepatic acute-phase response, IL-12 pushes NK and TH1 cells toward IFN-γ, and chemokines lay down the gradients that pull neutrophils and monocytes to the site.

The failure modes are symmetric and clinically important:

- **Underreact** — too little sensing or cytokine output lets microbes establish before reinforcements arrive.
- **Overreact** — body-wide TNF-α release drives the vasodilation, capillary leak, and shock of sepsis; collateral damage then exceeds the threat.
- **Fail to resolve** — without efferocytosis of dying neutrophils and a switch to repair signals, the program never terminates, producing fibrosis, granulomas, and atherosclerotic plaques.

If macrophages underreact, microbes spread. If they overreact, tissue suffers. If they fail to resolve, inflammation becomes chronic.

---

## 3. Why B Cells Matter

B cells externalize specificity. Once a B cell becomes a plasma cell, its receptor becomes antibody that can travel through fluids.

```text
one BCR specificity
        |
        v
clonal expansion + germinal-center affinity maturation
        |   (somatic hypermutation, class switch)
        v
secreted antibody with the same binding specificity
        |
        v
neutralization, opsonization, complement, ADCC, mucosal protection
```

B cells solve a logistics problem: a receptor stuck on a membrane can only act where the cell sits, while a plasma cell **externalizes** that same receptor as soluble antibody that travels through every fluid compartment. Along the way the specificity is refined: inside germinal centers, **somatic hypermutation** of the rearranged immunoglobulin genes plus selection on antigen-presenting follicular dendritic cells produces **affinity maturation**, and **class switching** swaps the constant region (for example IgM -> IgG or IgA) to change effector function without changing specificity.

The five effector functions are not interchangeable:

- **Neutralization** physically blocks a pathogen or toxin from entering or binding host cells.
- **Opsonization** coats targets with antibody Fc, which FcγR-bearing phagocytes grip.
- **Complement** is triggered by clustered Fc through the classical pathway, depositing C3b and forming the membrane-attack complex.
- **ADCC** lets antibody-coated cells be killed by NK cells through CD16.
- **Secretory IgA** guards mucosal surfaces, the most common site of entry.

This is why antibodies are so important for vaccines. If antibody is present before exposure, the pathogen may be neutralized at the barrier — blocking step 1 of the algorithm before the slower clonal-expansion steps ever need to run.

---

## 4. Why T Cells Matter

T cells inspect the inside of cells indirectly. MHC molecules display peptide samples; T cells read them.

```text
cell interior -> peptide processing -> MHC display -> T-cell decision
   |                                       |
   +-- MHC I  (proteasome/TAP, all cells)  --> CD8 kills the infected cell
   +-- MHC II (endosome, APCs only)        --> CD4 chooses the program
```

The trick is indirect display. **MHC I** continuously samples the cytosol: the proteasome (the **immunoproteasome** in inflamed cells) degrades intracellular proteins, the **TAP** transporter pumps the peptides into the endoplasmic reticulum, and they are loaded onto MHC I for export to the surface of essentially every nucleated cell. **MHC II**, restricted to professional antigen-presenting cells, samples a different compartment: proteins taken up into endosomes are cleaved by cathepsins, and the resulting peptides displace the invariant-chain remnant CLIP from the MHC II groove with the help of HLA-DM.

The two T-cell lineages then answer two different problems:

- **CD8 — the executioner.** Solves the intracellular pathogen problem. A cell making viral protein loads viral peptide onto MHC I; the CD8 cell delivers **perforin/granzyme** and **Fas-FasL** death signals to kill the factory before it finishes producing virus.
- **CD4 — the conductor.** Solves the coordination problem by choosing which helper program dominates — TH1 (macrophage activation via IFN-γ and CD40L), TFH (antibody maturation), TH17 (neutrophil and barrier responses), or Treg (suppression).

CD8 T cells solve the intracellular pathogen problem by killing infected cells. CD4 T cells solve the coordination problem by choosing which immune program should dominate: macrophage activation, antibody maturation, neutrophil recruitment, barrier responses, or suppression.

T cells are the immune system's most powerful context-dependent decision layer: the same peptide can drive killing, antibody help, or tolerance depending on which T cell reads it and what costimulation accompanies the signal.

---

## 5. Why NK Cells Matter

NK cells cover a blind spot in T-cell surveillance. If a cell stops displaying MHC I, CD8 T cells may not see it. NK cells may see the loss of inhibition.

```text
normal self display present (MHC I high)
   -> inhibitory receptor engaged -> NK inhibition (spare the cell)

self display missing OR stress ligands high (MIC-A/B)
   -> activating signal wins the balance -> NK activation (kill)
```

The MHC-I display that CD8 cells depend on has an exploit: a virus or tumor that **downregulates MHC I** goes invisible to CD8 surveillance. NK cells close this gap by inverting the logic. Their inhibitory receptors read intact "self" MHC I and call off the attack; when MHC I is lost — the **missing-self** signal — that brake is released. In parallel, stress-induced ligands such as **MIC-A/MIC-B** engage activating receptors (NKG2D), so the kill decision is the net of activating minus inhibitory inputs.

NK cells also act early, before antigen-specific T-cell expansion peaks, and they can kill antibody-coated cells through **CD16** (the ADCC bridge back to the B-cell response). They are not a primitive version of T cells; they answer a different question — "does this cell still look like healthy self?" rather than "what peptide is this cell showing?"

---

## 6. Three Worked Mental Simulations

The real test of the model is running it forward on concrete threats. The same ten-step algorithm produces three very different choreographies depending on *where* the pathogen lives.

### Extracellular bacterium

```text
macrophage/complement detect
   -> neutrophils and inflammation contain
   -> B cells produce antibody
   -> antibody opsonizes (C3b + Fc tags)
   -> macrophages and neutrophils clear more efficiently
   -> memory B cells and plasma cells remain
```

Most important highlighted cell: B cell, with macrophages as early sentinels and antibody-guided effectors. The pathogen lives in fluids, so the fluid-borne weapon — antibody, with its C3b and Fc tags handing the target to phagocytes — dominates.

### Virus inside epithelial cells

```text
infected cells produce interferon
   -> NK cells kill stressed or MHC-low cells early
   -> dendritic cells prime CD8 and CD4 T cells
   -> CD8 T cells kill peptide-MHC I positive infected cells
   -> B cells make neutralizing antibodies against free virus
   -> memory B and T cells remain
```

Most important highlighted cells: T cells and NK cells, with B cells blocking spread outside cells. Because the threat hides inside host cells, the host-cell killers (NK early, CD8 once primed) lead while antibody mops up virus in transit.

### Intracellular bacterium in macrophages

```text
macrophage eats bacterium but cannot fully kill
   -> macrophage presents peptide on MHC II
   -> TH1 cell recognizes and releases IFN-gamma
   -> macrophage becomes more microbicidal (ROS, NO)
   -> chronic persistence can form granulomas
```

Most important highlighted cells: macrophages and CD4 TH1 cells. The eater cannot finish the kill alone — it needs a licensing signal (IFN-γ plus CD40L) from the decision layer. This is the clearest example of direct cell-to-cell collaboration in the whole report.

---

## 7. The Final Model

The immune system is not a single army with stronger and weaker soldiers. It is a layered evidence-processing system. Stepping all the way back, the report's central claim is architectural: each layer asks one question, and the answer decides whether the threat escalates to the next layer. The cells are simply the agents that staff these layers.

| Layer | Main question | Representative mechanisms |
|-------|---------------|---------------------------|
| Barrier | Can entry be prevented? | Skin, mucus, acid, cilia, microbiota |
| Innate sensor | Does this look like damage or conserved microbial pattern? | PRRs, complement, macrophages, dendritic cells |
| Innate effector | Can the threat be contained immediately? | Phagocytosis, inflammation, neutrophils, NK cells |
| Antigen presentation | What molecular evidence should lymphocytes inspect? | MHC I, MHC II, dendritic-cell migration |
| Adaptive selection | Which rare clone matches? | BCR/TCR clonal selection |
| Adaptive effector | What precise weapon should be expanded? | Antibody, CD8 killing, CD4 help |
| Regulation | How do we avoid host damage? | Tregs, checkpoints, contraction, resolution |
| Memory | How do we improve next time? | Memory B/T cells, plasma cells |

The same architecture, drawn as a single rail, shows how a threat flows from the outer barrier to long-term memory:

```text
BARRIER -- INNATE SENSOR -- INNATE EFFECTOR -- ANTIGEN PRESENTATION
                                                       |
                                                       v
   MEMORY <-- REGULATION <-- ADAPTIVE EFFECTOR <-- ADAPTIVE SELECTION
```

Macrophages, B cells, T cells, and NK cells make sense only in this layered architecture. Each cell type is incomplete by itself. Together they let the body respond quickly, specialize accurately, kill selectively, resolve damage, and remember.

## Summary

The immune system works by staging recognition. Macrophages and innate sensors detect broad danger and shape the tissue response. Antigen-presenting cells convert local events into peptide evidence. B cells turn receptor specificity into antibodies. T cells inspect peptide-MHC displays and coordinate or execute cellular responses. NK cells kill stressed or MHC-low cells before or alongside adaptive immunity. Memory improves the next response, and tolerance keeps the system from becoming self-destructive.

[<- Previous: Memory, Tolerance, and Failure](10-memory-tolerance-failure.md) | [Next: V(D)J Recombination and Germinal Centers ->](12-vdj-recombination-germinal-centers.md) | [Back to TOC](00-table-of-contents.md)
