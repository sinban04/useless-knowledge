# Ribosomes And Protein Traffic

The **ribosome** is the cell's protein-synthesis machine. It reads messenger RNA in codons and links amino acids into a polypeptide. Ribosomes are found in all cells, including bacteria, plant cells, and animal cells. They are not bounded by a membrane, so they are better described as ribonucleoprotein machines than as membrane-bound organelles.

OpenStax's translation chapter describes ribosomes as large and small subunits that translate mRNA into protein. NCBI Bookshelf's *Molecular Biology of the Cell* describes the ribosome as a catalytic machine made of ribosomal RNAs and many proteins, with protein synthesis taking place in the cytoplasm.

## Ribosome Logic

```
mRNA:       AUG  GCU  UUU  GGA  UAA
             |    |    |    |    |
tRNA:       Met  Ala  Phe  Gly  stop
             \    \    \    \
              +----+----+----+--> growing polypeptide

ribosome roles:
  small subunit -> reads mRNA codons
  large subunit -> catalyzes peptide-bond formation
```

![Ribosome translation diagram showing mRNA, tRNA, amino acids, and growing polypeptide chain.](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Ribosome_mRNA_translation_en.svg/1280px-Ribosome_mRNA_translation_en.svg.png)

*Figure 1. Translation is easier to read visually: mRNA moves through the ribosome, tRNAs match codons, and the growing polypeptide exits as the protein product. Source: [Wikimedia Commons, LadyofHats, public domain](https://commons.wikimedia.org/wiki/File:Ribosome_mRNA_translation_en.svg).*

The ribosome is not simply a platform. Its RNA component performs core catalytic work, which is why ribosomes are often discussed as ribozymes.

## Where Ribosomes Work

Eukaryotic ribosomes work in two major visible contexts:

| Ribosome location | Typical products |
|-------------------|------------------|
| Free in cytosol | Cytosolic proteins, nuclear proteins, many mitochondrial proteins, peroxisomal proteins |
| Bound to rough ER | Secreted proteins, plasma membrane proteins, lysosomal proteins, many ER/Golgi/endosomal proteins |

The same ribosome can be free or ER-bound depending on the protein being translated. Binding to the ER is usually driven by a signal peptide emerging from the nascent polypeptide, not by a permanent ribosome identity.

## Protein Targeting Is An Address System

New proteins need addresses. A protein's amino-acid sequence can contain targeting information that routes it to a compartment.

```
new protein starts on ribosome
        |
        v
does it contain a targeting signal?
        |
        +-- no obvious signal -> stays in cytosol
        |
        +-- nuclear localization signal -> nucleus
        |
        +-- mitochondrial targeting sequence -> mitochondrion
        |
        +-- ER signal peptide -> ER -> Golgi -> membrane/secreted/lysosome
        |
        +-- peroxisomal targeting signal -> peroxisome
```

NCBI Bookshelf's compartmentalization chapter emphasizes that organelle proteins follow specific pathways guided by signal sequences or signal patches. This is one of the most important ideas in cell structure: organelles are not just containers; they are destinations in a traffic network.

## Ribosomes And The Nucleus

Ribosomes depend on the nucleus in two ways.

First, mRNA is transcribed from nuclear genes. Second, ribosomal subunits are assembled from ribosomal RNA and ribosomal proteins. Ribosomal RNA is made in the nucleolus, ribosomal proteins are imported into the nucleus after cytosolic synthesis, and partially assembled subunits are exported back to the cytoplasm.

```
nucleus:
  rRNA transcription in nucleolus
  ribosomal protein import
  subunit assembly
      |
      v
nuclear pore export
      |
      v
cytoplasm:
  mature ribosomes translate mRNA
```

This loop is a good example of cell interdependence. The nucleus makes the RNA parts of ribosomes, but cytoplasmic ribosomes make the protein parts that the nucleus needs.

## Ribosomes And Mitochondria

Mitochondria have their own ribosomes, reflecting their bacterial ancestry. However, mitochondrial ribosomes make only a limited subset of mitochondrial proteins. Many proteins required for mitochondrial structure, DNA replication, transcription, translation, import, metabolism, and dynamics are encoded in the nucleus and made on cytosolic ribosomes.

```
mitochondrial protein origins:

  nuclear genome -> cytosolic ribosome -> imported protein
  mitochondrial genome -> mitochondrial ribosome -> local protein
```

That split requires coordination. The cell must match nuclear and mitochondrial gene expression so respiratory-chain complexes assemble correctly. If one side fails, mitochondria cannot simply compensate by making everything themselves.

## Rough ER Is A Ribosome-Studded Gateway

The **rough endoplasmic reticulum** looks rough under electron microscopy because ribosomes bind to its cytosolic surface. Proteins entering the ER can be folded, modified, and routed through the Golgi to the plasma membrane, secretion, or lysosomes.

![Secretory pathway diagram showing nucleus, rough ER, smooth ER, transport vesicles, Golgi apparatus, secretory vesicles, and plasma membrane release.](https://upload.wikimedia.org/wikipedia/commons/8/81/Nucleus_ER_golgi_ex.jpg)

*Figure 2. The rough-ER route connects translation to folding, Golgi processing, vesicle transport, and membrane or secretory destinations. Source: [Wikimedia Commons, Magnus Manske, public domain](https://commons.wikimedia.org/wiki/File:Nucleus_ER_golgi_ex.jpg).*

This creates a major distinction:

| Protein class | Common route |
|---------------|--------------|
| Cytosolic enzyme | Free ribosome -> cytosol |
| Nuclear transcription factor | Free ribosome -> nucleus |
| Mitochondrial enzyme | Free ribosome -> mitochondrion |
| Secreted hormone | ER-bound ribosome -> ER -> Golgi -> secretion |
| Plasma membrane receptor | ER-bound ribosome -> ER -> Golgi -> plasma membrane |
| Lysosomal enzyme | ER-bound ribosome -> ER -> Golgi -> lysosome |

## Summary

- Ribosomes translate mRNA into protein and are ribonucleoprotein machines, not membrane-bound organelles.
- Free and ER-bound ribosomes are functional states, not separate permanent species.
- Protein targeting is an address system based on amino-acid signals.
- The nucleus supplies mRNA and ribosomal RNA; ribosomes supply proteins that the nucleus and organelles need.
- Mitochondria contain their own ribosomes but depend heavily on cytosolic ribosomes for imported nuclear-encoded proteins.

---

[Back: Nucleus, Genome, And Control](03-nucleus-genome-and-control.md) | [Next: Mitochondria And Cellular Energy ->](05-mitochondria-and-cellular-energy.md)
