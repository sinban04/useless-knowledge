# Glossary: Drug Mechanisms and Pharmacology

> Auxiliary reference for understanding the drug mechanism concepts used throughout the research paper.

---

## Chemotherapy Mechanisms

### Alkylation
A chemical reaction where an **alkyl group** is added to DNA, creating abnormal chemical bonds (cross-links) between or within DNA strands. This prevents the DNA from separating during replication, blocking cell division and triggering cell death. Alkylating agents (e.g., cyclophosphamide, cisplatin) were among the first chemotherapy drugs.

### DNA Cross-Linking
The formation of covalent chemical bonds between two strands of the DNA double helix (**interstrand cross-links**) or within the same strand (**intrastrand cross-links**). Cross-linked DNA cannot be properly replicated or transcribed, leading to cell death. This is the primary mechanism of platinum-based drugs (cisplatin, carboplatin, oxaliplatin).

### Antimetabolite
A drug that mimics a natural molecule needed for DNA/RNA synthesis, "tricking" the cell into incorporating it. Once incorporated, it blocks further synthesis or produces non-functional DNA. Examples:
- **Methotrexate:** Mimics folic acid, blocking the enzyme dihydrofolate reductase (DHFR)
- **5-Fluorouracil (5-FU):** Mimics the nucleotide uracil, blocking thymidylate synthase
- **Gemcitabine:** Mimics the nucleoside deoxycytidine

### Topoisomerase
An enzyme that manages DNA topology by cutting and re-joining DNA strands during replication and transcription. DNA must be unwound to be read, and topoisomerases relieve the tension created by unwinding:
- **Topoisomerase I:** Makes a single-strand cut to relax DNA. Inhibited by irinotecan, topotecan
- **Topoisomerase II:** Makes a double-strand cut to untangle DNA. Inhibited by etoposide, doxorubicin

Topoisomerase inhibitors trap the enzyme on the DNA, creating permanent breaks that kill the cell.

### Microtubule
A structural protein filament inside cells that forms the **mitotic spindle** -- the apparatus that pulls chromosomes apart during cell division. Disrupting microtubules prevents cells from dividing:
- **Vinca alkaloids** (vincristine, vinblastine): Prevent microtubule assembly (depolymerization)
- **Taxanes** (paclitaxel, docetaxel): Prevent microtubule disassembly (stabilization)

Both approaches block mitosis, causing cell death.

### Intercalation
The insertion of a flat molecule between the stacked base pairs of DNA, distorting its structure. This interferes with DNA replication and transcription. Doxorubicin and other anthracycline antibiotics use this mechanism.

---

## Targeted Therapy Mechanisms

### Tyrosine Kinase
An enzyme that transfers a phosphate group to the amino acid **tyrosine** on a protein, activating it. Many growth factor receptors (EGFR, HER2, BCR-ABL) are tyrosine kinases. When mutated or overactive, they send continuous "grow" signals. **Tyrosine Kinase Inhibitors (TKIs)** are small molecules that block the ATP-binding site of these kinases, shutting down the signal.

### ATP-Binding Site
The pocket on a kinase enzyme where **ATP** (the cell's energy molecule) normally binds to provide the phosphate group for signaling. Most small-molecule kinase inhibitors work by occupying this pocket, competitively preventing ATP from binding and thus blocking the kinase's activity.

### Monoclonal Antibody
A laboratory-made antibody designed to bind to one specific target (antigen). In cancer therapy, monoclonal antibodies can:
- **Block receptors:** Prevent growth signals (e.g., trastuzumab blocks HER2)
- **Mark cells for destruction:** Trigger ADCC or CDC (see below)
- **Deliver payloads:** Carry drugs or radiation directly to tumor cells (ADCs)

Named with the suffix **-mab** (e.g., trastuzu*mab*, nivolu*mab*).

### ADCC (Antibody-Dependent Cell-Mediated Cytotoxicity)
A mechanism where an antibody bound to a target cell recruits **NK cells** or other immune effectors via their Fc receptors, leading to killing of the target cell. This is one way therapeutic monoclonal antibodies (e.g., trastuzumab, rituximab) eliminate cancer cells.

### CDC (Complement-Dependent Cytotoxicity)
A mechanism where antibodies bound to a cell surface activate the **complement system** (a cascade of blood proteins), leading to formation of a pore in the cell membrane and cell lysis.

### PARP (Poly ADP-Ribose Polymerase)
An enzyme that repairs single-strand DNA breaks. When PARP is inhibited in cells that already have defective **BRCA-mediated** double-strand break repair, the cell accumulates unrepaired DNA damage and dies. This is the principle of **synthetic lethality** exploited by PARP inhibitors (olaparib, niraparib, rucaparib).

---

## Advanced Therapy Mechanisms

### Chimeric Antigen Receptor (CAR)
An engineered receptor placed on the surface of T cells to redirect them against cancer. A CAR combines:
- An **extracellular domain** (usually a single-chain antibody fragment) that recognizes a tumor antigen (e.g., CD19)
- A **transmembrane domain** that anchors the receptor
- **Intracellular signaling domains** (CD3ζ + co-stimulatory domains like 4-1BB or CD28) that activate the T cell when the receptor binds its target

### Bispecific Antibody
An engineered antibody with two different binding sites -- one targeting a tumor antigen and the other targeting an immune cell activator (typically **CD3** on T cells). This physically bridges T cells to tumor cells, forcing immune killing regardless of whether the T cell would naturally recognize the tumor. **BiTE** (Bispecific T-cell Engager) is one format (e.g., blinatumomab).

### Antibody-Drug Conjugate (ADC)
A three-component drug consisting of:
1. **Monoclonal antibody:** Targets a specific antigen on tumor cells
2. **Chemical linker:** Connects the antibody to the payload; designed to be stable in blood but release the drug inside the cell
3. **Cytotoxic payload:** A highly potent chemotherapy drug (too toxic to give systemically alone)

The antibody delivers the payload directly to antigen-expressing cells, providing targeted chemotherapy. The **bystander effect** occurs when the released drug also kills neighboring tumor cells that may not express the target antigen.

### Drug-to-Antibody Ratio (DAR)
The average number of cytotoxic drug molecules attached to each antibody in an ADC. Higher DAR (e.g., ~8 for trastuzumab deruxtecan vs. ~3.5 for T-DM1) can increase potency but must be balanced against stability and toxicity.

### PROTAC (Proteolysis Targeting Chimera)
A bifunctional molecule that simultaneously binds a target protein and an **E3 ubiquitin ligase**, bringing them together. This causes the target protein to be tagged with ubiquitin and degraded by the cell's proteasome. Unlike traditional inhibitors that block a protein's function, PROTACs destroy the protein entirely.

### Molecular Glue Degrader
Similar to PROTACs but simpler -- small molecules that stabilize an interaction between a target protein and a ubiquitin ligase that would not normally occur, leading to degradation of the target. Thalidomide derivatives (lenalidomide, pomalidomide) used in multiple myeloma are examples.

---

## Drug Resistance Mechanisms

### Efflux Pump (P-glycoprotein)
A protein in the cell membrane that actively pumps drugs out of the cell, reducing their intracellular concentration below effective levels. **P-glycoprotein (MDR1)** is the most well-known efflux pump associated with **multidrug resistance** in cancer. Cancer cells can upregulate these pumps to resist chemotherapy.

### T790M Resistance Mutation
A specific point mutation in the **EGFR gene** (threonine to methionine at position 790) that is the most common cause of acquired resistance to first- and second-generation EGFR inhibitors in lung cancer. The mutation alters the drug-binding pocket. **Osimertinib** (a third-generation EGFR TKI) was designed to overcome this resistance mutation.

### Antigen Downregulation
A resistance mechanism where cancer cells reduce or stop expressing the target antigen on their surface, making them invisible to targeted therapies, CAR-T cells, or ADCs. This is a major challenge in CD19-targeted CAR-T therapy for leukemia.

---

[&larr; Back to Table of Contents](00-table-of-contents.md)
