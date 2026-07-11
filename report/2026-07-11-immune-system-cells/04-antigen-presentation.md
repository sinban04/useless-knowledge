# Antigen Presentation

## 1. Why Antigen Presentation Exists

A **T cell** cannot usually recognize a whole bacterium, viral particle, or toxin floating in tissue. T cells recognize short peptide fragments displayed on host molecules called **major histocompatibility complex (MHC)** proteins.

That solves a deep problem: many important pathogens live inside cells. Antibodies can bind extracellular targets, but they cannot inspect the cytosol of an infected cell. MHC molecules solve this by sampling proteins from cellular compartments and displaying peptide fragments at the cell surface.

```text
inside a cell
   proteins are degraded into peptides
        |
        v
peptides load onto MHC molecules
        |
        v
peptide-MHC complexes appear on cell surface
        |
        v
T cells inspect the display
```

This makes every nucleated cell a kind of molecular billboard.

![Activation of T and B cells through antigen presentation and costimulation](https://commons.wikimedia.org/wiki/Special:FilePath/Activation_of_T_and_B_cells.png)

*Figure: Antigen presentation and costimulation link APC context, helper T-cell activation, B-cell help, CD28/B7 signaling, and CD40/CD40L licensing. Source: Wikimedia Commons file page, [Activation of T and B Cells](https://commons.wikimedia.org/wiki/File:Activation_of_T_and_B_cells.png), Immcarle105, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).*

---

## 2. MHC Class I Versus MHC Class II

The two major MHC classes sample different compartments and talk to different T-cell types.

| Feature | MHC class I | MHC class II |
|---------|-------------|--------------|
| Expressed on | Most nucleated cells | Professional antigen-presenting cells: dendritic cells, macrophages, B cells |
| Peptide source | Cytosolic proteins | Proteins taken into vesicles |
| Typical peptide length | Shorter, often 8-10 amino acids | Longer, often 13-25 amino acids |
| T-cell partner | CD8 T cells | CD4 T cells |
| Main message | "This is what is being made inside me" | "This is what I have engulfed or bound" |
| Typical response | Cytotoxic killing of infected or abnormal cell | Help, macrophage activation, B-cell help, cytokine direction |

![MHC class I and class II expression pattern](https://commons.wikimedia.org/wiki/Special:FilePath/MHC_expression.svg)

*Figure: MHC expression overview: class I is broadly expressed, while class II is concentrated on professional antigen-presenting cells. Source: Wikimedia Commons file page, [MHC expression](https://commons.wikimedia.org/wiki/File:MHC_expression.svg), Zionlion77 derived from Atropos235 MHC class I/II diagrams, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).*

| Cell type | MHC I | MHC II | Why that pattern makes sense |
|-----------|-------|--------|------------------------------|
| Epithelial cell, liver cell, neuron, muscle cell | Yes | Usually no | Any nucleated cell can be infected by a virus and must report cytosolic peptides to CD8 cells |
| Dendritic cell | Yes | Yes | Best at priming naive T cells; can also cross-present extracellular antigen on MHC I |
| Macrophage | Yes | Yes | Presents engulfed material to CD4 TH1 cells and receives macrophage-activation help |
| B cell | Yes | Yes | Presents BCR-captured antigen on MHC II to helper T cells |
| Red blood cell | No | No | Mature human red cells lack a nucleus and do not run normal protein-synthesis/display machinery |

The distinction is not perfect. Dendritic cells can perform **cross-presentation**, where extracellular material is presented on MHC I to activate CD8 T cells. That exception is crucial for antiviral and antitumor responses, because a naive CD8 T cell usually needs professional activation by a dendritic cell before it can kill infected tissue cells.

---

## 3. The Molecules Themselves: MHC Structure

Sections 1 and 2 described what MHC *does*. The structure explains *why* it behaves that way. In humans, MHC molecules are also called **HLA (human leukocyte antigen)**, encoded by a dense, extraordinarily variable gene cluster on chromosome 6. Both classes do the same basic job — clamp a peptide in a surface groove so a T cell can read it — but they are assembled from different parts, and that difference decides everything downstream.

**MHC class I** is one long **alpha (heavy) chain** plus a small, separate, invariant partner called **beta-2 microglobulin**. The heavy chain folds into three domains (alpha-1, alpha-2, alpha-3). The peptide groove sits on top, built from alpha-1 and alpha-2, and it is **closed at both ends** like a sealed bun. That closure caps peptide length at roughly 8 to 10 amino acids. The membrane-proximal alpha-3 domain is where the **CD8** co-receptor docks, which is what ties class I to cytotoxic T cells.

**MHC class II** is **two similar-sized chains, alpha and beta**, both crossing the membrane. Its groove is built from alpha-1 and beta-1 and is **open at both ends**, so a longer peptide threads through with its ends hanging out — roughly 13 to 25 amino acids. The **CD4** co-receptor docks on the beta-2 domain, which is what ties class II to helper T cells.

![MHC class I molecular schematic](https://commons.wikimedia.org/wiki/Special:FilePath/MHC_Class_1.svg)

*Figure: MHC class I has one heavy alpha chain plus beta-2 microglobulin; alpha-1/alpha-2 form a closed peptide-binding groove. Source: Wikimedia Commons file page, [MHC Class 1](https://commons.wikimedia.org/wiki/File:MHC_Class_1.svg), Atropos235, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).*

![MHC class II molecular schematic](https://commons.wikimedia.org/wiki/Special:FilePath/MHC_Class_2.svg)

*Figure: MHC class II has alpha and beta chains together forming an open peptide-binding groove. Source: Wikimedia Commons file page, [MHC Class 2](https://commons.wikimedia.org/wiki/File:MHC_Class_2.svg), Atropos235, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).*

```text
   MHC class I                          MHC class II
   peptide ~8-10 aa (ends capped)       peptide ~13-25 aa (ends open)

      [ peptide ]                          [ == peptide == ]
   +-------------+                      +-------------------+
   |  a1     a2  |  <- closed groove    |  a1           b1  |  <- open groove
   +-------------+                      +-------------------+
   |     a3      |                      |   a2     |   b2   |
   +------+------+                      +----------+--------+
   | b2m  |  <- beta-2 microglobulin    |  alpha   |  beta  |
   +------+                             +----------+--------+
   ====== membrane ======               ======== membrane ========
         |                                        |
   CD8 binds a3 domain                      CD4 binds b2 domain
```

> **The "rule of 8."** MHC **I** partners with CD**8** (1 x 8 = 8); MHC **II** partners with CD**4** (2 x 4 = 8). The co-receptor binds an invariant MHC domain (alpha-3 for class I, beta-2 for class II), so it behaves like a hardwired switch: class I recognition routes toward killing, class II recognition routes toward help.

| Structural feature | MHC class I | MHC class II |
|--------------------|-------------|--------------|
| Chains | 1 heavy (alpha) chain + beta-2 microglobulin | alpha chain + beta chain |
| Groove formed by | alpha-1 + alpha-2 | alpha-1 + beta-1 |
| Groove ends | Closed | Open |
| Peptide length | About 8 to 10 amino acids | About 13 to 25 amino acids |
| Co-receptor | CD8 (binds alpha-3) | CD4 (binds beta-2) |
| Human gene names (HLA) | HLA-A, HLA-B, HLA-C | HLA-DP, HLA-DQ, HLA-DR |

A single MHC allele is not a lock for one key. The groove floor carries deep **pockets** (conventionally labeled A through F) that grip the side chains of specific **anchor residues** in the peptide. For many class I alleles the dominant anchors are peptide position 2 and the C-terminal residue, whose side chains plug into the B and F pockets while the middle of the peptide bulges upward where the T-cell receptor reads it; class II grooves, being open-ended, instead use anchor residues spaced along the threaded peptide. Each allele therefore enforces a **binding motif** — a loose sequence rule, not a single sequence — so one molecule can present thousands of different peptides while still being selective. This is why having the HLA locus be so polymorphic matters at the population level: between them, different alleles can present almost any pathogen's peptides.

One principle the rest of immunology depends on is **MHC restriction**: a T-cell receptor never sees a free peptide. It sees the **combined shape of peptide plus MHC**, so a given T cell recognizes its peptide only when displayed on a particular MHC molecule (shown by Zinkernagel and Doherty, Nobel Prize 1996). Because the HLA genes are the most polymorphic in the human genome, almost everyone's MHC molecules differ slightly. That is precisely why donor and recipient MHC must be matched for transplants, and why the system was named for *histocompatibility* long before its peptide-display role was understood.

---

## 4. How Peptides Get Loaded: The Two Pathways

The structural split has a matching split in *machinery*. Each class is fed by its own assembly line, differing in where the peptide comes from and where the loading happens.

![MHC class I endogenous pathway and MHC class II exogenous pathway for antigen processing and presentation](https://commons.wikimedia.org/wiki/Special:FilePath/MHC_Endogenous_and_Exogenous_Pathways.png)

*Figure: The endogenous (MHC class I) and exogenous (MHC class II) antigen-processing pathways. Class I samples cytosolic proteins through the proteasome and the TAP transporter into the ER; class II samples endocytosed proteins in the lysosomal compartment. Source: Wikimedia Commons file page, [MHC Endogenous and Exogenous Pathways](https://commons.wikimedia.org/wiki/File:MHC_Endogenous_and_Exogenous_Pathways.png), author credited on Commons as סתו כסלו, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).*

**Class I: the endogenous (cytosolic) pathway.** This reports on what the cell is making right now, including viral proteins built by a hijacked cell. A few details make the line work:

- **Ubiquitin is the disposal tag.** Defective, old, or viral proteins are marked with chains of ubiquitin, which is the signal that routes them into the proteasome — so class I presentation is fed partly by the cell's normal protein-quality-control garbage stream, including short-lived "defective ribosomal products" made fresh during translation.
- **The immunoproteasome tunes the cut.** Under interferon-gamma, cells swap in alternative proteasome subunits (the immunoproteasome) that favor cleaving after hydrophobic or basic residues — exactly the C-terminal anchors class I grooves prefer. The cell does not just shred proteins; it shreds them into surface-ready shapes.
- **The peptide-loading complex is a quality gate.** In the ER, tapasin tethers an empty MHC I (with beta-2 microglobulin) near TAP, while calreticulin and the oxidoreductase ERp57 stabilize it; ERAP trims overlong peptides from the N-terminus to the right length. Tapasin "edits" by holding the groove open until a high-affinity peptide arrives, so weak peptides are not exported.

```text
cytosolic proteins (including viral) tagged with ubiquitin
        |
        v
PROTEASOME shreds them into short peptides
        |
        v
TAP transporter pumps peptides into the endoplasmic reticulum (ER)
   (TAP = transporter associated with antigen processing)
        |
        v
ER peptide-loading complex (tapasin, calreticulin, ERp57)
   holds an empty MHC I + beta-2 microglobulin and loads a good-fit peptide;
   ERAP trims peptides to the right length
        |
        v
loaded MHC I travels ER -> Golgi -> cell surface
        |
        v
CD8 T cell inspects -> kills the cell if the peptide looks foreign
```

**Class II: the exogenous (endocytic) pathway.** This reports on material the APC swallowed from outside.

```text
APC engulfs extracellular material -> endosome
        |
        v
endosome fuses with lysosome; cathepsin proteases chop cargo into peptides

   -- in parallel, in the ER --
MHC II is made with its groove PLUGGED by the INVARIANT CHAIN (Ii / CD74),
   which blocks premature loading and routes MHC II to the endosome
        |
        v
proteases trim the invariant chain down to a small remnant called CLIP,
   still sitting in the groove
        |
        v
HLA-DM catalyzes the swap: CLIP out, real antigenic peptide in
        |
        v
loaded MHC II -> cell surface
        |
        v
CD4 helper T cell inspects -> provides help, activates macrophages, helps B cells
```

The two lines reach the same goal from opposite sources:

```text
MHC I:  protein from INSIDE  -> proteasome -> TAP -> ER -> surface -> CD8   (endogenous)
MHC II: protein from OUTSIDE -> lysosome -> CLIP / HLA-DM swap -> surface -> CD4   (exogenous)
```

Two consequences are worth holding onto:

- **The invariant chain is a "do not load yet" cap.** MHC II is born in the same ER that is full of class I peptides; without the plug it would grab the wrong cargo. The cell physically blocks the groove until MHC II reaches the right compartment — clean traffic control against cross-contamination.
- **HLA-DM is a peptide editor, not just a swapper.** Beyond ejecting CLIP, HLA-DM keeps catalyzing release and rebinding in the acidic compartment, so unstable low-affinity peptides keep falling out and only high-affinity peptides survive to reach the surface. In some cell types HLA-DO binds HLA-DM and restrains this editing, fine-tuning which peptides win — a built-in dial on the class II repertoire.
- **MHC I is read by two surveillance systems at once.** It is both a billboard for CD8 T cells and a "self" inhibitory signal that holds **NK cells** back. A virus or tumor that lowers MHC I to dodge CD8 killers simultaneously removes the NK brake, so NK cells destroy it for the very absence that hid it — the missing-self logic covered in [chapter 8](08-nk-cells.md) and the third loop in the [introduction](01-introduction.md).

This is also where **cross-presentation** (section 2) breaks the rule: dendritic cells can route some exogenous antigen into the class I pathway, so they can prime CD8 killers against viruses and tumors that never infected the dendritic cell itself.

---

## 5. Professional Antigen-Presenting Cells

Three cell types are especially important as **professional antigen-presenting cells (APCs)**:

| APC | Specialty |
|-----|-----------|
| Dendritic cell | Best at activating naive T cells in lymph nodes |
| Macrophage | Presents engulfed material to already primed CD4 T cells and receives activation signals |
| B cell | Presents antigen it bound through its B-cell receptor to helper T cells |

Dendritic cells deserve special attention even though this report focuses on macrophages, B cells, T cells, and NK cells. They are the bridge from local infection to adaptive activation. A typical dendritic cell looks **stellate**: a central cell body with long, thin, branching membrane processes. Those "dendrites" increase surface area for sampling tissue and making contact with T cells. They are not neurons; the name is about shape.

![Dendritic cell presenting antigen to a T cell](https://commons.wikimedia.org/wiki/Special:FilePath/Antigen_presentation_by_dendritic_cell.jpg)

*Figure: A dendritic cell presenting antigen to a T cell. Notice the branched, probing shape: dendritic cells are built to sample tissue and make many cell contacts. Source: Wikimedia Commons file page, [Antigen presentation by dendritic cell](https://commons.wikimedia.org/wiki/File:Antigen_presentation_by_dendritic_cell.jpg), Suraj at Malayalam Wikipedia, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).*

An immature dendritic cell samples tissue. After pathogen sensing, it matures, migrates to a lymph node, raises costimulatory molecules, and displays peptides to rare naive T cells.

```text
infected tissue
   dendritic cell samples antigen and senses danger
        |
        v
lymphatic vessel
        |
        v
draining lymph node
        |
        v
naive T cells scan dendritic-cell peptide-MHC displays
```

The working sequence is:

```text
immature dendritic cell samples tissue
        |
        v
PRR signal says "danger here"
        |
        v
dendritic cell matures: B7 high, CCR7 high, MHC-peptide display high
        |
        v
migrates through lymphatic vessel to draining lymph node
        |
        v
naive T cells scan peptide-MHC plus costimulation
```

One naming trap: a classical dendritic cell is a bone-marrow-derived APC that presents peptide-MHC to T cells. A **follicular dendritic cell (FDC)** is a stromal cell in B-cell follicles that holds intact antigen for B cells in germinal centers. Similar names, different jobs.

---

## 6. Lymph Nodes Are Matching Engines

The frequency of a naive T cell specific for any one peptide-MHC complex is low. A lymph node solves this search problem by organizing traffic. Dendritic cells bring antigen from tissues. Naive T cells continuously circulate through lymph nodes. Chemokines and adhesion molecules put them in the same zone.

```text
many naive T cells enter lymph node
        |
        v
each scans many dendritic cells
        |
        v
rare matching TCR binds peptide-MHC
        |
        v
activation if costimulation and cytokine context agree
```

This is a biological search index. Tissue infection becomes antigen plus context in a draining lymph node.

---

## 7. The Three-Signal Model

Naive T-cell activation is often summarized as three signals.

| Signal | Molecular example | Meaning |
|--------|-------------------|---------|
| Signal 1 | TCR binds peptide-MHC | Specific recognition |
| Signal 2 | CD28 on T cell binds B7/CD80/CD86 on APC | Permission: the APC sensed danger |
| Signal 3 | Cytokines such as IL-12, type I interferon, IL-4, IL-6, TGF-beta | Instruction: what kind of effector cell to become |

Signal 1 without sufficient signal 2 can lead to anergy, deletion, or tolerance rather than immunity. That is a feature, not a bug. T-cell receptors are generated by random DNA rearrangement; some will recognize self. The immune system therefore asks not only "does this T cell bind?" but also "is this antigen being presented by an activated APC in the right context?"

A few mechanistic points sharpen this:

- **The co-receptor is part of signal 1.** CD8 (on the killer) or CD4 (on the helper) binds the invariant MHC domain (alpha-3 or beta-2) alongside the TCR, recruiting the kinase Lck to start the signal. This is the molecular face of the "rule of 8": which co-receptor fits decides which T-cell program the same display triggers.
- **Costimulation is licensed by danger.** B7 (CD80/CD86) on the APC is upregulated only after pattern-recognition receptors sense microbial or damage signals, so signal 2 is literally a report that the innate system saw something dangerous. The inhibitory receptor **CTLA-4** later outcompetes CD28 for the same B7 ligands, providing an off-switch.
- **Anergy is an active brake.** A T cell that gets signal 1 alone does not simply ignore it; it enters a hyporesponsive state that resists later activation, which is one way the body tolerates self antigens displayed by resting tissue cells.

---

## 8. Antigen Presentation Gives Context to B Cells Too

B cells recognize native antigen through their B-cell receptor. But for many protein antigens, full B-cell activation needs T-cell help. The B cell internalizes the antigen it bound, processes it, and presents peptide fragments on MHC II. A T follicular helper cell that recognizes the same antigenic source provides CD40L and cytokines.

```text
BCR binds protein antigen
        |
        v
B cell internalizes and processes antigen
        |
        v
peptide displayed on MHC II
        |
        v
T follicular helper cell recognizes peptide-MHC II
        |
        v
CD40L + cytokines drive class switching and germinal-center response
```

This is called linked recognition. The B cell and T cell do not need to recognize the same epitope, but their epitopes must come from the same captured antigenic object. That constraint helps prevent unrelated bystander B cells from receiving dangerous help.

## Summary

Antigen presentation converts hidden molecular information into a surface display that T cells can inspect. MHC I samples cytosolic proteins for CD8 T cells; MHC II samples vesicular proteins for CD4 T cells. Structurally, class I is a heavy chain plus beta-2 microglobulin with a closed groove (CD8, about 8 to 10 amino acids), while class II is an alpha-beta pair with an open groove (CD4, about 13 to 25 amino acids), and the two are fed by separate machinery: the proteasome-TAP-ER route loads class I, while the invariant-chain and HLA-DM route loads class II in the endosomal compartment. Dendritic cells activate naive T cells, macrophages present to effector CD4 T cells, and B cells present captured antigen to helper T cells. Specificity alone is not enough; costimulation and cytokine context decide whether recognition becomes immunity.

[<- Previous: Macrophages](03-macrophages.md) | [Next: B Cells and Antibodies ->](05-b-cells-antibodies.md)
