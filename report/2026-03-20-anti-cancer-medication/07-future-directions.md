# 7. Future Directions

The next frontier of anti-cancer medication is likely to involve convergence across generations and entirely new therapeutic modalities.

## 7.1 Combination Strategies
...
## 7.7 Radioligand Therapy (RLT) — Theranostics

Radioligand therapy (RLT) — also called targeted radionuclide therapy or theranostics — combines a tumor-targeting vector (small molecule, peptide, or antibody) with a radionuclide payload that delivers localized radiation directly to cancer cells expressing the target antigen.

### Core Concept: Theranostics

The defining feature of modern RLT is the **theranostic paradigm**: the same targeting molecule is paired with either a **diagnostic isotope** (for PET/SPECT imaging) or a **therapeutic isotope** (for treatment). This allows:

1. Patient selection: image first to confirm target expression, then treat
2. Dose optimization: quantitative PET imaging informs radiation dosimetry
3. Treatment monitoring: repeat imaging measures target downregulation during therapy

Example: PSMA-617 ligand paired with Ga-68 (PET imaging, diagnostic) or Lu-177 (therapy). A patient receives a Ga-68-PSMA PET scan first — if sufficient PSMA uptake is confirmed across all lesions, Lu-177-PSMA therapy proceeds.

### Radionuclide Physics: β vs. α Emitters

| Property | β-emitters (Lu-177) | α-emitters (Ac-225, Ra-223) |
|----------|--------------------|-----------------------------|
| Path length in tissue | 1–3 mm | 50–80 μm |
| Linear energy transfer (LET) | Low | Very High |
| Cell-killing mechanism | Indirect (OH radical) | Direct double-strand DNA breaks |
| Bystander effect | Moderate (can reach neighboring cells) | Minimal (very localized) |
| Best for | Large/bulky tumors with uniform uptake | Micrometastases, bone marrow disease |
| Key limitation | May spare very small lesions | Supply chain (Ac-225 production limited) |

### Approved Agents

| Drug | Target | Indication | Approval | Developer |
|------|--------|-----------|---------|-----------|
| Lutetium-177 DOTATATE (Lutathera) | SSTR2 (somatostatin receptor) | Somatostatin receptor–positive gastroenteropancreatic NETs | FDA 2018 | Novartis (Advanced Accelerator Applications) |
| Lutetium-177 PSMA-617 (Pluvicto) | PSMA (prostate-specific membrane antigen) | PSMA+ metastatic CRPC (post-AR inhibitor + taxane) | FDA March 2022 | Novartis |
| Radium-223 (Xofigo) | Bone hydroxyapatite (calcium mimetic) | CRPC with bone metastases | FDA 2013 | Bayer |

**Clinical impact of Pluvicto (VISION trial, N=831):** In patients with PSMA-positive mCRPC who had received prior AR-pathway inhibitor and taxane therapy:
- Overall survival: 15.3 vs. 11.3 months (HR 0.62; p<0.001)
- rPFS: 8.7 vs. 3.4 months
- PSA response rate: ~60%
- Grade 3–4 hematologic toxicity manageable; fatigue, dry mouth (xerostomia) due to PSMA expression in salivary glands

**NETTER-1 trial (Lutathera):** 177Lu-DOTATATE vs. high-dose octreotide in midgut NETs: 65.2% vs. 10.8% response rate; 79% reduction in risk of progression or death.

### Pipeline: Key Targets in Development

| Target | Biology | Cancer Type | Radionuclide | Status |
|--------|---------|------------|-------------|--------|
| **PSMA (α-emitter)** | Prostate-specific membrane antigen | Prostate | Ac-225 | Phase 2/3 (potentially >10x more potent than Lu-177) |
| **FAP (Fibroblast Activation Protein)** | Tumor stroma; expressed in cancer-associated fibroblasts | Multiple solid tumors (lung, pancreatic, colon) | Lu-177, Ac-225 | Phase 1/2; tumor-agnostic potential |
| **SSTR2 analogs** | Expanded beyond NETs | Meningioma, pheochromocytoma | Lu-177 | Phase 1/2 |
| **DLL3** | Delta-like ligand 3; neuroendocrine differentiation marker | SCLC, LCNEC | Lu-177 | Phase 1 |
| **GRP78** | ER stress chaperone; upregulated in aggressive tumors | Pancreatic, CRC | Lu-177 | Preclinical/Phase 1 |
| **CD38** | Plasma cell marker | Multiple myeloma | Lu-177, Ac-225 | Phase 1 |
| **HER2** | RLT version of HER2 targeting | Breast, gastric | Lu-177, Ac-225 | Phase 1 |

### Competitive Landscape and Acquisitions

The RLT sector has seen intense acquisition activity as large pharma recognized the theranostics platform potential:

| Acquirer | Target | Deal Value | Year | Asset |
|---------|--------|-----------|------|-------|
| Novartis | Advanced Accelerator Applications (AAA) | $3.9B | 2018 | Lutathera, PSMA-617 |
| Novartis | Endocyte | $2.1B | 2018 | PSMA-617 clinical development |
| Bristol-Myers Squibb | RayzeBio | ~$4.1B | 2024 | Ac-225 actinium platform across multiple targets |
| AstraZeneca | Fusion Pharmaceuticals | ~$2.0B | 2024 | Cu-64/Ac-225 theranostics |
| Eli Lilly | POINT Biopharma | ~$1.4B | 2023 | PNT2002 (Lu-177 PSMA) in CRPC |

The concentration of investment by top-5 pharma (Novartis, BMS, AZ, Lilly) within a 2-year window signals sector-wide conviction in the RLT platform. Key remaining question: supply chain for Ac-225 (currently produced in only a few nuclear reactors globally; production expansion is a bottleneck for α-emitter scale-up).

## 7.8 KRAS G12C/D Inhibitors — Breaking the "Undruggable" Oncogene

### Background: Why KRAS Was Undruggable for 40 Years

KRAS (Kirsten RAS) is the most frequently mutated oncogene in human cancer, present in:
- ~90% of pancreatic ductal adenocarcinoma (PDAC)
- ~40% of colorectal cancer (CRC)
- ~13% of non-small cell lung cancer (NSCLC)
- ~5% of other solid tumors

KRAS functions as a molecular switch, cycling between GDP-bound (inactive) and GTP-bound (active) states. Oncogenic mutations (G12C, G12D, G12V, etc.) lock KRAS in the constitutively active GTP-bound state, continuously driving downstream proliferation signals (MAPK, PI3K/AKT).

For four decades, KRAS was considered **undruggable** because:
1. The protein surface has few druggable pockets (high affinity for GTP leaves no accessible binding groove)
2. GTP concentration in cells is extremely high (mM range), making competitive inhibition impractical
3. KRAS has no intrinsic enzymatic activity to inhibit directly

**The breakthrough:** In 2013, researchers at UCSF identified a previously unrecognized cryptic binding pocket beneath the switch-II region of KRAS — the **switch-II pocket (S-IIP)** — that becomes accessible specifically in the GDP-bound (inactive) form of KRAS G12C. Crucially, the G12C mutation places a reactive cysteine residue adjacent to this pocket, enabling covalent irreversible binding of small molecules.

### KRAS G12C: Approved Inhibitors

| Drug | Company | Approval | Trial | Key Data |
|------|---------|---------|-------|----------|
| **Sotorasib (Lumakras)** | Amgen | FDA May 2021 (NSCLC) | CodeBreak100/200 | ORR 37%, mDOR 11.1 months; CodeBreak200: superior to docetaxel (PFS 5.6 vs 4.5 mo, HR 0.66) |
| **Adagrasib (Krazati)** | Mirati (acquired by BMS, $5.8B) | FDA Dec 2022 (NSCLC) | KRYSTAL-1/12 | ORR 43%, mDOR 8.5 months; CNS-penetrant (12.5% intracranial ORR in brain mets) |
| **Glecirasib (JAB-21822)** | Jacobio/BeiGene | NMPA (China) 2024 | — | First approval in China |
| **Divarasib (GDC-6036)** | Roche/Genentech | Phase 1/2 | — | ORR 53% in NSCLC (monotherapy); partner for combination with cetuximab in CRC |

**KRAS G12C in CRC:** Unlike NSCLC, colorectal tumors with KRAS G12C show poor single-agent response to G12C inhibitors (~10% ORR) due to feedback reactivation via EGFR. Combination of adagrasib + cetuximab (KRYSTAL-10) or sotorasib + panitumumab/cetuximab yielded ORR 30–46% in CRC — demonstrating that the EGFR bypass mechanism must be co-targeted.

### KRAS G12D: The Next Frontier

KRAS G12D is the most common KRAS mutation (especially in pancreatic cancer), but poses additional challenges:
- G12D substitutes glycine with aspartate (no reactive cysteine), so the G12C covalent strategy does not apply
- Requires non-covalent inhibitors that can outcompete GTP binding

| Drug | Company | Target | Status |
|------|---------|--------|--------|
| **MRTX1133** | Mirati/BMS | KRAS G12D (non-covalent) | Phase 1/2; PDAC focus |
| **RMC-9805** | Revolution Medicines | KRAS G12D (RAS(ON) inhibitor) | Phase 1; "tri-complex" mechanism |
| **HRS-4642** | Haihe Biopharma | KRAS G12D | Phase 1 (China) |

### Pan-KRAS and RAS(ON) Inhibitors

Moving beyond mutation-specific inhibitors, the next wave targets **all active (GTP-bound) KRAS states**:

| Drug | Company | Mechanism | Status |
|------|---------|----------|--------|
| **RMC-6236** | Revolution Medicines | Pan-KRAS RAS(ON) inhibitor (multi-selective) | Phase 1/2; activity in G12D, G12V, G12C PDAC/NSCLC |
| **BI-1823911** | Boehringer Ingelheim | KRAS G12C; designed for combos | Phase 1 |
| **LY3537982 (adagrasib backup)** | Eli Lilly | KRAS G12C | Phase 1/2 |

**RAS(ON) mechanism (Revolution Medicines):** Rather than covalently blocking the inactive GDP-bound form, RMC-6236 uses a "molecular glue" tri-complex mechanism — it recruits cyclophilin A (CYPA) to trap the *active* GTP-bound KRAS, regardless of mutation type. This represents a fundamentally different approach that could address the ~90% of KRAS mutations not covered by G12C-specific inhibitors.

### Resistance to KRAS G12C Inhibitors

Resistance emerges rapidly (median ~6 months) through multiple mechanisms:

1. **Acquired KRAS mutations:** Secondary mutations restoring GTP loading (e.g., KRAS Y96D disrupts the S-IIP pocket; amplification of KRAS G12C allele)
2. **Bypass pathway activation:** EGFR, MET, FGFR3, ALK — co-occurring RTK activation bypasses KRAS dependency
3. **Downstream MAPK reactivation:** NRAS mutations, BRAF amplification, MEK1 mutations
4. **Histological transformation:** KRAS G12C NSCLC → SCLC phenotype switch (loss of RB1, TP53)

**Implication:** Combination therapy is likely necessary from the start. Trials of KRAS G12C + SHP2 inhibitor (upstream RAS activator), + MEK inhibitor, or + checkpoint inhibitor are all active.

### Investment Landscape

| Company | KRAS Asset | Notes |
|---------|-----------|-------|
| Amgen | Sotorasib (Lumakras) | ~$500M peak sales projected; fighting for share vs. adagrasib |
| Bristol-Myers Squibb | Adagrasib (Krazati) via Mirati acquisition ($5.8B) | BMS bet heavily; CNS penetration differentiator |
| Revolution Medicines | RMC-6236, RMC-9805 | Public company; pan-KRAS approach; PDAC focus could be differentiated |
| Roche/Genentech | Divarasib + combination strategy | Combination with cetuximab (Roche also owns) in CRC |
| Boehringer Ingelheim | BI-1823911 | Private; combination-focused |

## 7.9 Emerging Platforms

- **TCR-T cell therapy:** Engineered T-cell receptors targeting intracellular tumor antigens
- **Natural killer (NK) cell therapies:** Innate immune cells with potential for "off-the-shelf" products
- **Oncolytic virus engineering:** Next-generation armed viruses carrying immunostimulatory transgenes
- **PROTAC/molecular glue degraders:** Targeted protein degradation as a novel mechanism

## 7.10 Investment Landscape: M&A Signals and Sector Momentum

The oncology drug development space has been the most active sector in biopharma M&A over the past five years. The acquisition patterns reveal where large pharma is placing conviction bets.

### Major Platform Acquisitions by Category (2018–2025)

#### ADC Platform
| Acquirer | Target | Value | Year | Rationale |
|---------|--------|-------|------|-----------|
| Pfizer | Seagen | $43B | 2023 | Vedotin platform (MMAE); 4 approved ADCs |
| Gilead | Immunomedics | $21B | 2020 | Sacituzumab govitecan (TROP-2) |
| AbbVie | ImmunoGen | $10.1B | 2023 | Mirvetuximab soravtansine (FRα); IMGN platform |
| AstraZeneca | Daiichi Sankyo partnership | Up to $6.9B | 2023 | 3 DXd-based ADCs (co-development + commercialization) |

#### Radioligand Therapy (RLT)
| Acquirer | Target | Value | Year | Rationale |
|---------|--------|-------|------|-----------|
| Novartis | AAA (Advanced Accelerator Applications) | $3.9B | 2018 | Lutathera + PSMA platform |
| Novartis | Endocyte | $2.1B | 2018 | PSMA-617 (became Pluvicto) |
| BMS | RayzeBio | ~$4.1B | 2024 | Ac-225 actinium α-emitter platform |
| AstraZeneca | Fusion Pharmaceuticals | ~$2.0B | 2024 | Cu-64/Ac-225 theranostics |
| Eli Lilly | POINT Biopharma | ~$1.4B | 2023 | Lu-177 PSMA (PNT2002) in CRPC |

#### KRAS / RAS
| Acquirer | Target | Value | Year | Rationale |
|---------|--------|-------|------|-----------|
| BMS | Mirati Therapeutics | $5.8B | 2024 | Adagrasib (Krazati); KRAS franchise |

#### Immunotherapy / CAR-T
| Acquirer | Target | Value | Year | Rationale |
|---------|--------|-------|------|-----------|
| BMS | Turning Point Therapeutics | $4.1B | 2022 | RET/TRK kinase inhibitors |
| Pfizer | Arena Pharmaceuticals | $6.7B | 2022 | Inflammation/oncology pipeline |
| AbbVie | Syndax | — | — | Revumenib (menin inhibitor) |
| Novartis | MorphoSys | $2.9B | 2024 | Pelabresib (BET inhibitor) + tafasitamab |

### Sector-Level Investment Signals

**ADC:** The single most active M&A theme in oncology. Daiichi Sankyo's DXd platform (Enhertu) has set a new technical benchmark — competitors are racing to replicate or surpass high-DAR, cleavable-linker, potent payload architecture. The DESTINY-Breast04 "HER2-low" readout expanded the addressable market by 3–5x relative to HER2+ alone.

**RLT:** Five acquisitions >$1B in 2023–2024 by Novartis, BMS, AstraZeneca, Lilly signal cross-industry conviction. The theranostic model (diagnose with same ligand, then treat) provides a durable competitive advantage: companies that own both the diagnostic agent and the therapy can create a "closed loop" patient pathway that is difficult for competitors to replicate.

**KRAS:** The first KRAS inhibitors are meaningful but modest in efficacy (~37–43% ORR). The real opportunity — and the reason for BMS's $5.8B Mirati bet — is combination regimens and pan-KRAS approaches. Revolution Medicines (public, ~$3B market cap as of 2025) represents the most differentiated pure-play with its pan-KRAS RAS(ON) platform.

**Unmet need map:**
| Cancer Type | Unmet Need | Relevant Platform |
|------------|-----------|------------------|
| Pancreatic PDAC | <5% 5-yr OS; no targeted therapy dominant | KRAS G12D, FAP-RLT, ADC (HER3, B7-H3) |
| MSS colorectal | 0% ICI response; chemo/anti-VEGF plateau | KRAS G12C combos, ADC (CEACAM5, TROP-2) |
| SCLC | <2yr median OS; no targetable driver | DLL3-RLT, DLL3-bispecific (tarlatamab), ADC |
| Prostate (post-PSMA RLT) | Resistance after Pluvicto | Ac-225 PSMA, FAP-RLT, ADC (PSMA-targeted) |
| Brain metastases (NSCLC) | Blood-brain barrier exclusion | Adagrasib (CNS-penetrant), HER3-DXd |

---

*Previous: [Comparative Analysis](./06-comparative-analysis.md) | Next: [Conclusion](./08-conclusion.md)*
