# NK Cells

## 1. What an NK Cell Is

A **natural killer (NK) cell** is an innate lymphocyte that can kill abnormal host cells without first undergoing antigen-specific clonal expansion. NK cells are especially important early in viral infection and in surveillance against cells that reduce MHC class I expression.

An NK cell does not use a rearranged T-cell receptor or B-cell receptor. Instead, it integrates signals from germline-encoded inhibitory and activating receptors.

```text
NK-cell decision
        |
        +--> inhibitory receptors detect normal self signals, often MHC I
        |
        +--> activating receptors detect stress ligands, infection signals, antibody Fc
        |
        v
kill only if activating signals outweigh inhibitory signals
```

The decision is analog, not a single on/off receptor.

The two arms are built from named, germline-encoded receptor families:

- **Inhibitory receptors** — **KIRs** (killer-cell immunoglobulin-like receptors) in humans and **Ly49** receptors in mice, plus the **CD94/NKG2A** lectin. KIRs and Ly49 read classical MHC I (HLA-A/B/C); NKG2A reads the non-classical **HLA-E**. Their cytoplasmic tails carry **ITIMs** (immunoreceptor tyrosine-based inhibitory motifs) that recruit the phosphatase **SHP-1** (and SHP-2).
- **Activating receptors** — **NKG2D**; the natural cytotoxicity receptors **NKp46, NKp44, NKp30**; **CD16** (FcγRIIIa) for antibody Fc; and activating KIRs. They lack their own signaling tails and instead pair with **ITAM**-bearing adaptors (**DAP12, CD3ζ, FcRγ**) or the YINM adaptor **DAP10**, recruiting Syk/ZAP-70-family kinases.
- **Inhibition actively erases activation.** SHP-1 dephosphorylates the very kinases the activating ITAMs are switching on, so inhibition is not a passive lack of signal — it subtracts. This is why a healthy cell with abundant MHC I is spared even when it carries a little stress ligand.

---

## 2. Missing-Self Recognition

Many viruses and tumors reduce MHC I expression to evade CD8 T cells. That creates a vulnerability. NK cells can detect the absence of normal inhibitory MHC I signals. This is the **missing-self** principle.

```text
healthy nucleated cell
   normal MHC I -> inhibitory NK receptor engaged -> no killing

virus-infected or tumor cell
   low MHC I -> inhibitory signal reduced
   stress ligands -> activating signals increased
   result -> NK killing
```

This complements CD8 T-cell immunity:

| Target strategy | CD8 T-cell problem | NK-cell advantage |
|-----------------|--------------------|-------------------|
| Normal MHC I with viral peptide | CD8 T cell can recognize | NK inhibition may dominate unless stress signals are strong |
| Reduced MHC I | CD8 T cell loses peptide-MHC target | NK cell loses inhibitory signal |
| Stress ligand expression | May or may not produce a known peptide target | NK activating receptors can respond |

The system creates a trap for pathogens: keep MHC I and risk CD8 T-cell detection; reduce MHC I and risk NK-cell detection.

- **Mechanically**, lost MHC I means inhibitory **KIR / NKG2A** receptors no longer find ligand, so SHP-1 is no longer recruited and the activating signal is no longer subtracted.
- **Some viruses attempt a third path.** Human cytomegalovirus, for example, encodes decoys that keep the non-classical **HLA-E** on the surface to keep **NKG2A** engaged, even while shutting down classical HLA-A/B/C — an explicit attempt to satisfy the inhibitory checkpoint without re-exposing itself to CD8 T cells. The arms race between viral immune evasion and NK recognition is one of the clearest in immunology.

---

## 3. Induced-Self Recognition

NK cells also respond to **induced-self** signals: host molecules upregulated by stress, DNA damage, infection, or transformation. These ligands engage activating NK receptors — chiefly **NKG2D**, whose ligands **MICA/MICB** and **ULBP1-6** are nearly absent on healthy cells but are driven up by the DNA-damage response and oncogenic stress.

The logic is different from PAMP recognition. NK cells are not necessarily detecting a microbial molecule. They are detecting a host cell whose surface says, "I am stressed, infected, transformed, or damaged."

```text
cell stress
        |
        v
stress ligand expression rises
        |
        v
NK activating receptor engaged
        |
        v
kill if inhibition is insufficient
```

This is useful for cancer surveillance and antiviral defense, but it requires restraint. Too little NK activity allows abnormal cells to escape; too much can contribute to inflammatory damage.

- **Tumors counter-attack at the ligand level.** Many tumors proteolytically **shed soluble MICA/MICB**. Soluble ligand binds and occupies NKG2D and even drives the receptor off the NK-cell surface, blunting induced-self recognition — a reason this surveillance arm is not foolproof.

---

## 4. NK-Cell Effector Mechanisms

NK cells use several outputs.

| Output | Mechanism | Result |
|--------|-----------|--------|
| Cytotoxic granules | Perforin and granzymes | Target-cell apoptosis |
| Death receptors | FasL or TRAIL-related pathways | Apoptosis in susceptible targets |
| IFN-gamma | Cytokine secretion | Macrophage activation and TH1 shaping |
| TNF-family signals | Inflammatory and cytotoxic effects | Context-dependent |
| ADCC | CD16 binds antibody Fc on target | Antibody-coated target is killed |

Granule killing is **directed**, not sprayed: the NK cell forms a stable conjugate (integrin **LFA-1** gripping ICAM on the target), polarizes its microtubule-organizing center and lytic granules toward the contact — the **immunological synapse** — and secretes **perforin** and **granzymes** only into the narrow synaptic cleft. Perforin permeabilizes the target membrane; **granzyme B** then enters and activates caspases (and cleaves Bid), so the target dies by apoptosis without spilling its contents. The NK cell detaches, re-arms its granules, and can serially kill further targets.

**Antibody-dependent cellular cytotoxicity (ADCC)** connects B cells to NK cells. If antibodies bind a target cell surface, NK-cell **CD16 (FcγRIIIa)** can bind the antibody Fc region and trigger killing. CD16 signals through ITAM-bearing adaptors (CD3ζ / FcRγ), and uniquely among NK triggers, CD16 engagement alone is strong enough to override inhibition and force a kill.

```text
target cell coated with IgG
        |
        v
NK CD16 binds Fc portion of IgG
        |
        v
NK cell releases cytotoxic granules
        |
        v
target cell dies
```

This is one reason therapeutic antibodies can recruit immune killing even when they do not directly poison the target — and why antibody Fc regions are engineered for higher CD16 affinity to strengthen ADCC.

---

## 5. Cytokines Activate NK Cells Early

NK cells respond to cytokines made by infected tissue, macrophages, and dendritic cells. Important activators include type I interferons, IL-12, IL-15, and IL-18, each with a distinct role:

- **Type I IFN (alpha/beta)** — made by infected cells and plasmacytoid dendritic cells; boosts cytotoxicity and NK survival.
- **IL-12** — made by macrophages and dendritic cells; the dominant driver of NK **IFN-gamma** output, synergizing strongly with IL-18.
- **IL-15** — trans-presented by dendritic cells and stroma; supports NK survival, proliferation, and priming/arming.
- **IL-18** — released by macrophages via the inflammasome; amplifies IFN-gamma together with IL-12.

Cytokine "priming" raises the cell's baseline, so the same surface-receptor balance reaches the kill threshold faster — the activation arm starts pre-charged.

```text
virus infects tissue
        |
        v
infected cells and dendritic cells produce type I interferons
macrophages/dendritic cells produce IL-12, IL-15, IL-18
        |
        v
NK cells increase cytotoxicity and IFN-gamma production
        |
        v
early containment before CD8 T-cell expansion peaks
```

NK cells can therefore act during the gap between initial infection and adaptive clonal expansion.

---

## 6. NK Cells Are Educated

NK cells must avoid killing every normal cell. During development and maturation, NK cells undergo a process often called **education** or **licensing**. Cells whose inhibitory receptors can engage self MHC become functionally competent, while cells lacking such interactions are tuned differently.

The broad idea is **calibration**, not classroom-style learning. NK receptors are mostly germline-encoded; the NK cell is not rearranging a new receptor the way a T cell or B cell does. Education tunes the response threshold according to the self-MHC signals the NK cell actually experiences.

```text
immature NK cell expresses a random mix of inhibitory receptors
        |
        v
does one inhibitory receptor bind this body's self MHC I?
        |
   +----+----------------------+
   |                           |
   v                           v
yes                         no useful self-MHC match
licensed / educated          unlicensed / hyporesponsive
fully responsive             activation threshold raised for safety
        |                           |
        v                           v
loss of that self-MHC        loss of a signal it never relied on
now means "missing self"     is not enough to trigger strong killing
```

Two ideas matter:

- **Licensed (educated)** — an inhibitory receptor (for example a KIR) found a matching self-MHC I ligand during development or maturation, so the cell is set fully responsive. These are the cells that react most strongly to missing-self.
- **Unlicensed (hyporesponsive)** — no inhibitory receptor matched a self-MHC ligand, so the cell is tuned down for safety; the absence of an inhibition it could never sense does not provoke autoreactive killing.

This is often called a **rheostat** rather than a yes/no switch: the more strongly an NK cell has been calibrated through self-MHC-specific inhibitory receptors, the more responsive it can become when those self-MHC signals disappear. Education is also at least partly adjustable over time. If the self-MHC environment changes, NK responsiveness can be re-tuned rather than being fixed forever at birth.

Education is therefore the safety counterpart of missing-self: only a cell that was taught to depend on a specific self-MHC signal can treat the loss of that signal as a kill cue, which keeps NK cells from attacking healthy tissue that simply never expressed a matching ligand.

---

## 7. NK Cells Versus CD8 T Cells

NK cells and CD8 T cells can both kill host cells, and they are complementary lymphocyte-lineage killers. A **CD8 T cell** is an adaptive T lymphocyte with a rearranged TCR. An **NK cell** is an innate lymphocyte / innate lymphoid cell with germline-encoded receptor sets. They share the cytotoxic granule toolkit, but they decide when to use it by opposite information rules.

| Feature | NK cell | CD8 T cell |
|---------|---------|------------|
| Receptor source | Germline-encoded receptor set | Rearranged TCR |
| Specificity | Stress, missing-self, antibody Fc, receptor balance | Specific peptide-MHC I |
| First-response speed | Hours to early days | Several days for primary response |
| Memory | Limited and context-dependent innate memory-like behavior | Classic antigen-specific memory |
| Best against | MHC-low, stressed, antibody-coated, early infected cells | Cells displaying known foreign or abnormal peptide on MHC I |

The immune system uses both because each covers the other's blind spot.

```text
                    same dangerous host cell?
                              |
         +--------------------+--------------------+
         |                                         |
         v                                         v
  MHC I is present                         MHC I is missing / low
  and displays peptide                     or stress ligands are high
         |                                         |
         v                                         v
  CD8 T cell can read                      NK inhibition is lost;
  peptide-MHC I with TCR                   activating receptors can win
         |                                         |
         v                                         v
  antigen-specific kill                    missing-self / induced-self kill

  pathogen trap:
  keep MHC I -> CD8 T cells see peptide
  lose MHC I -> NK cells see missing self
```

Both arms often finish with the same execution method — a focused synapse, perforin, granzymes, and apoptosis — but the trigger logic differs. CD8 T cells ask "does this self-MHC I display my peptide?" NK cells ask "does this cell still look like normal self, or has inhibition disappeared while stress rose?"

## Summary

NK cells are innate lymphocytes that kill through a balance of inhibitory and activating signals. They detect missing self when MHC I is reduced, induced self when stress ligands rise, and antibody-coated targets through CD16-mediated ADCC. NK cells provide early antiviral and antitumor pressure, produce IFN-gamma, and complement CD8 T cells by targeting cells that try to escape peptide-MHC recognition.

[<- Previous: T-Cell Immunotherapy](07-t-cell-immunotherapy.md) | [Next: Immune Response Timeline ->](09-immune-response-timeline.md)
