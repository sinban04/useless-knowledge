# Glossary: Technologies and Platforms

> Auxiliary reference for understanding the advanced technologies and therapeutic platforms discussed in the research paper.

---

## Cell-Based Therapies

### CAR-T Cell Therapy
A treatment where a patient's own T cells are collected, genetically modified in a laboratory to express a **chimeric antigen receptor (CAR)**, expanded to billions of cells, and infused back into the patient. The CAR allows T cells to recognize and kill cancer cells expressing a specific surface antigen (e.g., CD19 on B-cell cancers). The entire process takes 3--4 weeks and costs $300K--$500K per treatment.

### Autologous vs. Allogeneic Cell Therapy
- **Autologous:** Uses the patient's own cells. Current standard for CAR-T. Personalized but slow and expensive to manufacture
- **Allogeneic ("Off-the-shelf"):** Uses cells from a healthy donor. Faster availability and lower cost, but risks **graft-versus-host disease**. CRISPR gene editing is used to remove the donor T-cell receptor to mitigate this risk

### TIL Therapy (Tumor-Infiltrating Lymphocyte Therapy)
A form of adoptive cell therapy where T cells that have naturally infiltrated a patient's tumor are extracted, expanded to large numbers in the laboratory, and reinfused. Unlike CAR-T, TILs are not genetically engineered -- they already recognize tumor antigens. Lifileucel was approved in 2024 for melanoma.

### TCR-T Cell Therapy (T-Cell Receptor Therapy)
Similar to CAR-T, but instead of adding an artificial receptor (CAR), the T cell is engineered to express a **natural T-cell receptor** that recognizes a specific peptide-MHC complex on the tumor surface. The advantage: TCRs can target **intracellular** tumor antigens (presented on MHC), while CARs can only target surface antigens.

---

## Antibody Engineering

### Bispecific T-cell Engager (BiTE)
A specific format of bispecific antibody consisting of two single-chain variable fragments (scFvs) connected by a flexible linker. One scFv binds a tumor antigen, the other binds **CD3** on T cells, physically bringing them together. Blinatumomab (targeting CD19 and CD3) was the first approved BiTE.

### Antibody-Drug Conjugate (ADC) Generations
ADCs have evolved significantly:
- **First-generation (early 2000s):** Unstable linkers, inconsistent drug-to-antibody ratios. Gemtuzumab ozogamicin was withdrawn due to toxicity (later re-approved with modified dosing)
- **Second-generation (2010s):** Improved linker stability and consistent DAR. T-DM1 (trastuzumab emtansine) for HER2+ breast cancer
- **Third-generation (2020s):** Novel linkers, higher DAR, membrane-permeable payloads enabling the **bystander effect**. Trastuzumab deruxtecan (Enhertu) represents the current state of the art

### Fc Receptor
A receptor on immune cells (NK cells, macrophages) that binds the **Fc region** (the "tail") of antibodies. This interaction is essential for **ADCC** -- when a therapeutic antibody binds a cancer cell, its Fc region recruits immune effector cells via their Fc receptors, triggering killing.

---

## Genetic Engineering Tools

### CRISPR-Cas9
A gene-editing technology that allows precise modification of DNA sequences. In cancer therapy, CRISPR is used to:
- Remove the **endogenous TCR** from donor T cells in allogeneic CAR-T products (preventing GvHD)
- Knock out genes that cancer uses to evade the immune system
- Create gene-edited NK cells and other "off-the-shelf" cell therapies
- Investigate new drug targets through genome-wide knockout screens

### Ex Vivo
Literally "out of the living body." Refers to procedures performed on cells outside the patient's body. In CAR-T therapy, T cells are modified and expanded **ex vivo** before being returned to the patient. In dendritic cell vaccines, dendritic cells are loaded with tumor antigens **ex vivo**.

---

## Vaccine Platforms

### mRNA Cancer Vaccine
A vaccine that delivers **messenger RNA** encoding tumor-specific neoantigens into the patient's cells. The cells produce the neoantigen proteins, which are displayed to the immune system, triggering an anti-tumor immune response. Unlike traditional vaccines that prevent disease, cancer mRNA vaccines are **therapeutic** -- designed to treat existing cancer. mRNA-4157/V940 (in combination with pembrolizumab) has shown promising results in melanoma.

### Oncolytic Virus
A virus that has been engineered or naturally selected to preferentially infect and kill cancer cells while sparing normal cells. The virus replicates inside the tumor cell, causing it to burst (**oncolysis**), releasing new virus particles and tumor antigens that stimulate an immune response. **T-Vec (talimogene laherparepvec)** is a modified herpes simplex virus approved for melanoma.

### BCG (Bacillus Calmette-Guerin)
A live attenuated strain of *Mycobacterium bovis* originally developed as a tuberculosis vaccine. When instilled directly into the bladder, BCG stimulates a local immune response that attacks bladder cancer cells. It has been used since the 1970s and remains the standard treatment for non-muscle-invasive bladder cancer -- one of the earliest successful cancer immunotherapies.

---

## Emerging Drug Modalities

### Radioligand Therapy
A treatment that combines a **targeting molecule** (ligand) with a **radioactive isotope** (radionuclide) to deliver radiation directly to cancer cells. The ligand binds to a specific receptor on the tumor, and the attached radionuclide irradiates the cancer cell from within. **Lutetium-177 PSMA (Pluvicto)** targets PSMA-expressing prostate cancer cells.

### PROTAC (Proteolysis Targeting Chimera)
A bifunctional small molecule with two ends:
1. One end binds the **target protein** (e.g., a cancer-driving protein)
2. The other end binds an **E3 ubiquitin ligase** (part of the cell's protein disposal system)

By bringing these together, the PROTAC causes the target protein to be tagged for destruction by the proteasome. Unlike traditional inhibitors that merely block a protein, PROTACs eliminate it entirely -- potentially overcoming resistance mutations that alter the drug-binding site.

### Molecular Glue Degrader
A simpler version of PROTACs -- small molecules that create a new interaction between a target protein and an E3 ligase. The classic examples are **immunomodulatory drugs (IMiDs)** like lenalidomide and pomalidomide, which "glue" the transcription factors Ikaros and Aiolos to the cereblon E3 ligase, leading to their degradation. This mechanism was discovered retroactively -- thalidomide derivatives were used for years before the molecular glue mechanism was understood.

---

## Drug Discovery

### AI-Driven Drug Discovery
The application of **machine learning** and **artificial intelligence** to accelerate pharmaceutical research:
- **Target identification:** Analyzing genomic and proteomic data to find new drug targets
- **Molecular design:** Generating and optimizing drug candidate structures using generative AI models
- **Binding prediction:** Predicting how well a drug candidate will bind to its target using 3D protein structure models
- **Clinical trial optimization:** Using synthetic control arms and patient stratification to design more efficient trials
- **Combination prediction:** Identifying synergistic multi-drug combinations from large screening datasets

---

[&larr; Back to Table of Contents](00-table-of-contents.md)
