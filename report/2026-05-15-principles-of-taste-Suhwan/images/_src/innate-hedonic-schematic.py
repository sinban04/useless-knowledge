# /// script
# requires-python = ">=3.10"
# dependencies = ["matplotlib", "numpy"]
# ///
"""
Innate Hedonic Baselines — schematic of the 5 basic taste hedonic shapes.

Purpose: qualitative companion to Figure 4.1 (§4.7 quantitative curves).
This figure shows the *shape* of each modality's evolved hedonic response
without committing to specific concentrations — useful when introducing
the idea that each modality has a distinct evolutionary signal profile.

Shapes are schematic but constrained by:
  Sweet/Umami     — sigmoidal rise (monotone +) — nutrition signals
  Salty           — inverted-U with peak at homeostatic concentration
                    (~0.9% NaCl = plasma isotonic), sharp decline above
  Sour            — ambivalent: shown as dashed declining baseline; in
                    context (with sugar) the curve shifts; here we just
                    indicate the negative bias of the baseline
  Bitter          — sigmoidal decline (monotone -) — toxin avoidance

Usage:
  uv run --quiet innate-hedonic-schematic.py
Output:
  ../innate-hedonic-schematic.png
"""
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['DejaVu Sans', 'Arial'],
    'font.size': 11,
    'axes.spines.top': False,
    'axes.spines.right': False,
    'axes.linewidth': 1.0,
    'xtick.direction': 'out',
    'ytick.direction': 'out',
    'figure.dpi': 100,
    'savefig.dpi': 300,
})

fig, ax = plt.subplots(figsize=(10, 5.8))

x = np.linspace(0, 10, 500)

# Sweet / Umami: sigmoid rising (monotone +)
sweet = 3.5 / (1 + np.exp(-(x - 3.0) * 0.9))
umami = 3.0 / (1 + np.exp(-(x - 3.8) * 0.85))

# Salty: shifted Gaussian-like inverted-U around x = 4.5,
# then a fast aversive decline tail
peak_x = 4.5
salty_base = 3.5 * np.exp(-((x - peak_x) ** 2) / 4.5)
tail = -3.0 * np.clip((x - 6.8) / 3.0, 0, None) ** 2
salty = salty_base + tail

# Sour: ambivalent baseline -- gentle decline (single curve, dashed to mark ambivalence)
sour = -2.5 * (1 - np.exp(-(x - 0.5) / 2.0))
sour = np.where(x < 0.5, 0, sour)

# Bitter: sigmoid declining (monotone -)
bitter = -3.7 / (1 + np.exp(-(x - 1.7) * 1.3)) - 0.2

# Plot
ax.plot(x, sweet,  color='#E89F50', linewidth=3.0)
ax.plot(x, umami,  color='#A85AAA', linewidth=3.0)
ax.plot(x, salty,  color='#5B9BD5', linewidth=3.0)
ax.plot(x, sour,   color='#7CB342', linewidth=3.0, linestyle='--', alpha=0.9)
ax.plot(x, bitter, color='#8B4513', linewidth=3.0)

# Mark Salty peak
ax.scatter([peak_x], [salty_base.max()], s=110, c='#5B9BD5',
           zorder=5, edgecolor='white', linewidth=2)
ax.annotate('peak ≈ 0.9% NaCl\n(plasma isotonic)',
            xy=(peak_x, salty_base.max()),
            xytext=(peak_x - 2.6, salty_base.max() + 0.8),
            fontsize=9, color='#3074a6',
            arrowprops=dict(arrowstyle='->', color='#3074a6', lw=1))

# Neutral baseline
ax.axhline(y=0, color='gray', linewidth=0.8, linestyle='-', alpha=0.4)

# End-of-line labels with evolutionary meaning (right-edge group)
ax.text(10.15, sweet[-1] + 0.05, 'Sweet\n— nutrition ↑',
        color='#9a6630', fontsize=9.5, va='center', fontweight='bold')
ax.text(10.15, umami[-1] - 0.30, 'Umami\n— protein ↑',
        color='#7a3f7c', fontsize=9.5, va='center', fontweight='bold')
ax.text(10.15, sour[-1] + 0.1, 'Sour\n— ambivalent\n(context-dep.)',
        color='#5a8a30', fontsize=9.5, va='center', fontweight='bold')
ax.text(10.15, bitter[-1] + 0.05, 'Bitter\n— toxin →\navoid',
        color='#6b3410', fontsize=9.5, va='center', fontweight='bold')

# Salty label placed inline along the descent (avoids collision with Bitter at right edge)
ax.text(7.6, -0.7, 'Salty\n— homeostasis\n(narrow window)',
        color='#3074a6', fontsize=9.5, va='center', fontweight='bold',
        bbox=dict(boxstyle='round,pad=0.35', fc='white',
                  ec='#5B9BD5', alpha=0.92))

# Background regions
ax.axhspan(0, 4.5, alpha=0.04, color='#22aa22')
ax.axhspan(-4.5, 0, alpha=0.04, color='#aa2222')
ax.text(0.1, 4.3, 'attraction (+)', fontsize=9, color='#22aa22',
        ha='left', va='top', alpha=0.7, fontweight='bold')
ax.text(0.1, -4.3, 'aversion (−)', fontsize=9, color='#aa2222',
        ha='left', va='bottom', alpha=0.7, fontweight='bold')

# Axes
ax.set_xlabel('Concentration  →', fontsize=12)
ax.set_ylabel('Innate hedonic  ( − / + )', fontsize=12)
ax.set_title('Innate Hedonic Baselines — the 5 Basic Tastes\n'
             '(schematic: shape, not measurement)',
             fontsize=13, pad=12)

ax.set_xlim(-0.3, 13.5)
ax.set_ylim(-4.5, 4.5)
ax.set_xticks([])  # schematic — no specific concentration units
ax.set_yticks([-4, -2, 0, 2, 4])

ax.grid(True, alpha=0.18, linestyle=':')

# Footnote
fig.text(0.5, 0.01,
         'Schematic. For quantitative values see Figure 4.1 (§4.7). '
         'Shapes encode the evolutionary survival value of each chemical signal.',
         fontsize=8, color='gray', ha='center', style='italic')

plt.subplots_adjust(left=0.07, right=0.84, top=0.90, bottom=0.13)

out = Path(__file__).resolve().parent.parent / 'innate-hedonic-schematic.png'
plt.savefig(out, dpi=300, bbox_inches='tight')
print(f'Saved: {out}')
