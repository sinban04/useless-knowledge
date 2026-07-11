# Macrophages

## 1. What a Macrophage Is

A **macrophage** is a tissue-resident phagocytic immune cell. The name literally means "big eater," but eating is only one part of its job. Macrophages also sense danger, release cytokines, present antigen, shape tissue repair, clear dead cells, and help decide whether inflammation continues or resolves.

Two developmental origins coexist. Many macrophages begin as **monocytes** from bone marrow, circulate, enter tissues, and differentiate locally; these reinforcements dominate during active infection. But many resident populations are seeded before birth from **yolk-sac and fetal-liver progenitors** and **maintain themselves by local proliferation**, largely independent of bone marrow — a standing garrison rather than imported troops. Their names often reflect location:

| Tissue | Macrophage-like population |
|--------|----------------------------|
| Liver | Kupffer cells |
| Brain | Microglia |
| Lung alveoli | Alveolar macrophages |
| Bone | Osteoclasts |
| Spleen and lymph node | Sinus macrophages |
| Skin and connective tissue | Resident macrophages and related phagocytes |

This tissue specialization matters. A lung macrophage must tolerate harmless inhaled particles while remaining ready for infection. A microglial cell must support nervous-system homeostasis while responding to injury. Macrophages are immune cells, but they are also tissue cells.

---

## 2. The Macrophage Job List

Macrophages sit at the intersection of innate immunity, adaptive immunity, and repair.

| Job | Mechanism | Result |
|-----|-----------|--------|
| Sentinel | PRRs detect microbial or damage patterns | Local alarm |
| Phagocyte | Engulf microbes, debris, apoptotic cells | Cleanup and killing |
| Cytokine source | TNF-alpha, IL-1, IL-6, IL-12, chemokines | Inflammation and recruitment |
| Antigen presenter | MHC II plus costimulatory molecules | T-cell activation or restimulation |
| Effector cell | Reactive oxygen/nitrogen species, lysosomal enzymes | Microbial killing |
| Repair organizer | Growth factors, matrix remodeling, efferocytosis | Resolution and tissue rebuilding |

The same cell can move across these states. A macrophage that is quietly clearing apoptotic cells is not equivalent to one activated by bacterial products plus interferon-gamma.

---

## 3. Phagocytosis: Eat, Seal, Kill, Display

**Phagocytosis** is the engulfment of a particle into an intracellular vesicle. Macrophages phagocytose microbes, antibody-coated particles, complement-coated particles, dead cells, and debris.

```text
1. recognition
      PRR, Fc receptor, complement receptor, scavenger receptor

2. engulfment
      actin-driven membrane wraps around target

3. phagosome formation
      target is enclosed inside vesicle

4. phagolysosome fusion
      vesicle fuses with lysosomes

5. killing and degradation
      acidification, proteases, antimicrobial molecules, reactive species

6. antigen processing
      peptide fragments can be loaded onto MHC II
```

Two recognition routes are especially important:

| Tag on target | Macrophage receptor | Meaning |
|---------------|--------------------|---------|
| Antibody Fc region | Fc receptor | Adaptive immunity has marked this target |
| C3b or related complement fragment | Complement receptor | Complement has marked this target |

Antibody and complement do not just label targets. They change macrophage behavior. A weakly recognized bacterium can become easy prey after opsonization.

The same six steps have well-defined molecular machinery. Recognition through an **Fc receptor (FcgammaR)** triggers phosphorylation of its **ITAM** motifs; **complement receptors CR1/CR3** bind C3b/iC3b. Downstream, **Rho-family GTPases (Rac, Cdc42)** and the **Arp2/3 complex** drive the actin polymerization that pushes pseudopods around the particle. As the phagosome matures it exchanges **Rab5 for Rab7** markers and fuses with lysosomes, while a **V-ATPase** pumps protons to drop the internal pH to roughly 4.5. Killing then uses the **NADPH oxidase (phox) respiratory burst** to make reactive oxygen species and **iNOS** to make nitric oxide, alongside proteases and antimicrobial peptides.

### Why Macrophages Do Not Simply Eat Free Antibody

Blood contains huge amounts of free IgG, and macrophages express Fc receptors, so the safety question is real: why are macrophages not constantly swallowing ordinary antibody? The answer is that phagocytosis needs **surface clustering**, not a single antibody molecule touching one receptor.

```text
free IgG in plasma
        |
        v
one weak Fc-FcgammaR contact
        |
        v
no receptor cluster, no actin cup, no particle to wrap

antibody-coated microbe
        |
        v
many Fc stems fixed on the same surface
        |
        v
FcgammaR clustering + ITAM signaling
        |
        v
actin zipper and phagosome formation
```

Several safety layers make that distinction robust:

| Safety layer | What it prevents |
|--------------|------------------|
| Low effective signaling from monomeric IgG | A single floating antibody does not cross-link enough Fc receptors to trigger engulfment |
| Particle-size requirement | Phagocytosis needs a surface the membrane can wrap around; soluble IgG has no such geometry |
| Host Fc handling | **FcRn** binds IgG inside acidic endosomes and rescues many molecules from degradation, recycling them back to blood and extending IgG half-life |
| Complement and Fc regulation | Host cells carry complement regulators and inhibitory receptor tuning that prevent accidental escalation on self surfaces |

There is one important exception: if many antibodies bind the same soluble antigen, they can form large **immune complexes**. Those complexes may activate complement and be cleared by macrophages in the liver and spleen. That is normal cleanup when controlled, but excessive immune-complex deposition can drive disease. It is different from a macrophage eating ordinary free antibody one molecule at a time.

---

## 4. Cytokines: Macrophages as Local Broadcasters

When macrophages detect microbial patterns, PRR signaling activates **NF-kappaB**, which switches on inflammatory gene programs, while the **inflammasome** matures **IL-1beta** from its precursor. The result is a set of cytokines and chemokines that change nearby tissue.

| Macrophage signal | Main effect |
|-------------------|-------------|
| TNF-alpha | Activates endothelium, supports local containment, can drive systemic shock if widespread |
| IL-1 | Promotes inflammation, fever, endothelial activation |
| IL-6 | Supports acute-phase response and lymphocyte differentiation |
| IL-12 | Promotes NK-cell and TH1 interferon-gamma responses |
| Chemokines | Recruit neutrophils, monocytes, and lymphocytes |

This is why macrophages are often the first explanatory cell in infection. They translate "I found bacteria here" into "blood vessels, plasma proteins, neutrophils, monocytes, and lymphocytes should behave differently here."

---

## 5. Macrophages and T Cells Form a Feedback Loop

Macrophages can present peptides from engulfed material on MHC II molecules. A CD4 T cell whose receptor matches that peptide-MHC complex can then activate the macrophage further.

The classic loop is TH1 activation:

```text
macrophage engulfs intracellular bacterium
        |
        v
presents bacterial peptide on MHC II
        |
        v
TH1 cell recognizes peptide-MHC II
        |
        v
TH1 cell releases IFN-gamma and CD40L signal
        |
        v
macrophage increases microbicidal activity
```

This loop is essential for pathogens that survive inside macrophage vesicles, such as mycobacteria. The macrophage can ingest the pathogen but may need T-cell help to become fully activated for killing.

---

## 6. The M1/M2 Shortcut Is Useful but Dangerous

You will often see macrophages divided into **M1** and **M2** states.

| Shorthand | Typical induction | Typical behavior |
|-----------|-------------------|------------------|
| M1-like | Microbial products plus IFN-gamma | Inflammatory, microbicidal, high IL-12 |
| M2-like | IL-4, IL-13, repair environments | Tissue repair, parasite-associated responses, remodeling |

This is a useful teaching axis, not a complete taxonomy. Real tissue macrophages exist in many mixed and dynamic states. A tumor-associated macrophage, an alveolar macrophage, and a healing-wound macrophage may all share some "M2-like" markers but behave differently. Treat M1/M2 as a coordinate system, not as two species of cells.

---

## 7. Macrophages Must Also End Inflammation

An immune response that cannot stop becomes pathology. Macrophages help resolve inflammation by clearing apoptotic neutrophils, releasing repair-associated mediators, and supporting extracellular matrix remodeling. **Efferocytosis**, the engulfment of dying cells, is often anti-inflammatory because it removes cellular debris before it spills DAMPs into tissue.

```text
infection controlled
        |
        v
neutrophils die by apoptosis
        |
        v
macrophages engulf apoptotic cells
        |
        v
inflammatory signals fall, repair signals rise
```

This repair role is why macrophages are double-edged in chronic disease. They can help heal tissue, but persistent activation can drive fibrosis, granulomas, atherosclerotic plaques, or tumor-supportive environments.

## Summary

Macrophages are not just eating cells. They are resident tissue sentinels that detect danger, engulf targets, broadcast inflammation, present antigen, receive T-cell help, kill microbes, clear dead cells, and coordinate repair. Their central role is conversion: they convert local damage or infection into both immediate effector action and signals that guide the rest of the immune system.

[<- Previous: Innate Recognition and Inflammation](02-innate-recognition-inflammation.md) | [Next: Antigen Presentation ->](04-antigen-presentation.md)
