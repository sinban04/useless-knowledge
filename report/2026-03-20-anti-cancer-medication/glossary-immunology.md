# Glossary: Immunology Terms

> Auxiliary reference for understanding the immunology concepts used throughout the research paper.

---

## Immune Cells

### T Cell (T Lymphocyte)
A type of white blood cell central to the adaptive immune system. T cells are produced in the bone marrow and mature in the thymus. Key subtypes:
- **Cytotoxic T cells (CD8+):** Directly kill infected or cancerous cells by recognizing foreign antigens on their surface
- **Helper T cells (CD4+):** Coordinate immune responses by releasing cytokines that activate other immune cells
- **Regulatory T cells (Tregs):** Suppress immune responses to prevent autoimmunity -- tumors can exploit Tregs to evade immune attack

### B Cell (B Lymphocyte)
A white blood cell that produces **antibodies**. In cancer therapy, B cells are relevant as targets -- many blood cancers (lymphomas, leukemias) arise from B cells and express markers like **CD19** and **CD20** that can be targeted by CAR-T cells and monoclonal antibodies.

### Natural Killer (NK) Cell
An innate immune cell that can kill tumor cells and virus-infected cells without prior exposure. Unlike T cells, NK cells do not need to recognize a specific antigen. They are being explored as "off-the-shelf" alternatives to CAR-T cells for cancer therapy.

### Dendritic Cell
A specialized antigen-presenting cell that acts as a "messenger" between the innate and adaptive immune systems. Dendritic cells capture tumor antigens, process them, and present them to T cells to initiate an immune response. Sipuleucel-T (Provenge) is a dendritic cell-based cancer vaccine.

### Tumor-Infiltrating Lymphocytes (TILs)
Immune cells (mainly T cells) that have migrated from the bloodstream into a tumor. A high number of TILs often indicates the immune system is trying to fight the cancer. TIL therapy involves extracting these cells, expanding them in the laboratory, and reinfusing them in large numbers.

---

## Immune Checkpoints

### Immune Checkpoint
A regulatory mechanism that acts as a "brake" on the immune system, preventing it from attacking the body's own cells. Cancer cells exploit these checkpoints to avoid immune destruction. **Checkpoint inhibitors** release these brakes, allowing the immune system to attack the tumor.

### PD-1 (Programmed Death-1)
A receptor on the surface of T cells. When PD-1 binds its ligand **PD-L1** (often expressed by tumor cells), it sends a "stop" signal to the T cell, preventing it from attacking. Anti-PD-1 drugs (nivolumab, pembrolizumab) block this interaction, re-activating T cells against cancer.

### PD-L1 (Programmed Death-Ligand 1)
A protein found on the surface of many cancer cells (and some normal cells) that binds to PD-1 on T cells. By expressing PD-L1, tumors effectively "turn off" the immune cells trying to kill them. PD-L1 expression levels in tumors are used as a **biomarker** to predict response to immunotherapy.

### CTLA-4 (Cytotoxic T-Lymphocyte-Associated Protein 4)
A receptor on T cells that competes with the co-stimulatory receptor **CD28** for binding to **B7 ligands** on antigen-presenting cells. When CTLA-4 wins this competition, T cell activation is suppressed. Ipilimumab blocks CTLA-4, enhancing T cell activation at an earlier stage than PD-1 inhibitors.

### LAG-3 (Lymphocyte Activation Gene-3)
A next-generation immune checkpoint receptor found on T cells. LAG-3 suppresses T cell function through a different mechanism than PD-1 or CTLA-4. Relatlimab (anti-LAG-3) was approved in 2022 in combination with nivolumab for melanoma.

### TIGIT (T-cell Immunoreceptor with Ig and ITIM Domains)
An inhibitory receptor on T cells and NK cells currently being investigated as a new checkpoint target. Multiple anti-TIGIT antibodies are in Phase III clinical trials.

### TIM-3 (T-cell Immunoglobulin and Mucin-domain Containing-3)
Another emerging checkpoint receptor associated with T cell exhaustion, particularly in hematological malignancies. Currently in early clinical development.

---

## Immune Processes and Concepts

### Antigen
A molecule (usually a protein) that the immune system can recognize and respond to. In cancer, tumor antigens are abnormal proteins on the surface of cancer cells that can trigger an immune response.

### Antigen-Presenting Cell (APC)
A cell that displays antigens on its surface using **MHC molecules**, allowing T cells to recognize them. Dendritic cells are the most important APCs. The process is essential for initiating adaptive immune responses against tumors.

### Cytokine
A small signaling protein released by immune cells that affects the behavior of other cells. Important cytokines in cancer:
- **IL-2 (Interleukin-2):** Stimulates T cell growth; used as a cancer therapy
- **Interferon-alpha:** Activates immune cells and has direct anti-tumor effects
- **TNF (Tumor Necrosis Factor):** Can kill tumor cells but also drives inflammation

### Cytokine Release Syndrome (CRS)
A potentially life-threatening inflammatory response that occurs when large numbers of immune cells are activated rapidly, releasing massive amounts of cytokines into the bloodstream. Common side effect of CAR-T cell therapy and bispecific antibodies. Symptoms range from fever and fatigue to organ failure. Managed with **tocilizumab** (anti-IL-6 receptor antibody) and steroids.

### Immune-Related Adverse Events (irAEs)
Side effects of checkpoint immunotherapy caused by the overactivated immune system attacking healthy tissues. Can affect virtually any organ:
- **Skin:** Rash, vitiligo
- **GI tract:** Colitis, hepatitis
- **Endocrine:** Thyroiditis, adrenal insufficiency, hypophysitis
- **Lungs:** Pneumonitis
- **Nervous system:** Neuropathy, encephalitis

### Tumor Microenvironment (TME)
The cellular ecosystem surrounding a tumor, including immune cells, blood vessels, fibroblasts, and signaling molecules. The TME can be **immunosuppressive** (preventing immune cells from attacking the tumor) or **immunogenic** (facilitating immune attack). Understanding the TME is crucial for predicting immunotherapy response.

### Graft-versus-Host Disease (GvHD)
A condition where donor immune cells attack the recipient's tissues, recognizing them as foreign. A concern in allogeneic (donor-derived) cell therapies. CRISPR gene editing is used to remove the alloreactive T-cell receptor (TCR) from donor CAR-T cells to prevent GvHD.

---

[&larr; Back to Table of Contents](00-table-of-contents.md)
