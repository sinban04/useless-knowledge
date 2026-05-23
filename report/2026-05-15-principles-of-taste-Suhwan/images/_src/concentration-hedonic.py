# /// script
# requires-python = ">=3.10"
# dependencies = ["matplotlib"]
# ///
"""
Concentration-Hedonic curves for the 5 basic tastes.

X-axis: log10(concentration / detection threshold)
        — normalizes so each modality's threshold sits at x = 0
        — allows direct comparison of curve shape across modalities
        whose absolute concentrations differ by orders of magnitude
        (e.g., sucrose threshold ~15 mM vs quinine ~5 uM).

Y-axis: subjective hedonic rating (-4 = strong aversion ... +4 = strong attraction)

Data sources (approximated from published intensity- / acceptance-rating curves):
  [Mos71] Moskowitz HR. Sweetness and pungency. Percept Psychophys 1971, 9(1), 1-6.
  [BC85]  Beauchamp GK, Cowart BJ. Congenital and experiential factors in the
          development of human flavor preferences. Appetite 1985, 6(4), 357-372.
  [Pan68] Pangborn RM. Affective and acceptance responses. Am J Clin Nutr 1968,
          21(7), 650-655.
  [Yam67] Yamaguchi S. The synergistic taste effect of monosodium glutamate and
          disodium 5'-inosinate. J Food Sci 1967, 32(4), 473-478.
  [CB92]  Conner MT, Booth DA. Insipidity from sucrose taste interactions with
          food's sour or salty taste. Appetite 1992, 19(3), 271-282.

Usage:
  uv run --quiet concentration-hedonic.py
Output:
  ../concentration-hedonic.png  (300 dpi)
"""
import matplotlib.pyplot as plt
from pathlib import Path

# ---------- style ----------
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

# ---------- data ----------
# x = log10(concentration / threshold). Threshold ~= "just detectable".
modalities = {
    'Sweet (sucrose)':   {
        'x': [0.0, 0.6, 1.0, 1.3, 1.6, 1.9],
        'y': [0.5, 1.5, 2.5, 3.0, 3.2, 1.5],
        'color': '#E89F50',
        'marker': 'o',
        'src': '[Mos71][CB92]',
    },
    'Salty (NaCl)':      {
        'x': [0.0, 0.6, 1.0, 1.3, 1.5, 1.8],
        'y': [0.3, 1.5, 2.5, 3.0, 1.0, -2.5],
        'color': '#5B9BD5',
        'marker': 's',
        'src': '[BC85][Pan68]',
    },
    'Umami (MSG)':       {
        'x': [0.0, 0.7, 1.3, 1.7, 2.1, 2.5],
        'y': [0.3, 1.5, 2.0, 2.5, 1.5, -0.5],
        'color': '#A85AAA',
        'marker': '^',
        'src': '[Yam67]',
    },
    'Sour (citric)':     {
        'x': [0.0, 0.7, 1.0, 1.5, 2.0],
        'y': [0.0, -0.5, -1.5, -2.5, -3.5],
        'color': '#7CB342',
        'marker': 'D',
        'src': '[Pan68]',
    },
    'Bitter (quinine)':  {
        'x': [0.0, 1.0, 1.5, 2.0, 2.5],
        'y': [-1.5, -3.0, -3.5, -4.0, -4.0],
        'color': '#8B4513',
        'marker': 'v',
        'src': '[Pan68]',
    },
}

# ---------- plot ----------
fig, ax = plt.subplots(figsize=(10, 6))

for name, d in modalities.items():
    ax.plot(d['x'], d['y'],
            color=d['color'],
            marker=d['marker'],
            markersize=8,
            linewidth=2.5,
            label=name)

# neutral hedonic baseline
ax.axhline(y=0, color='gray', linewidth=0.8, linestyle='--', alpha=0.5)

# peak annotations
ax.annotate('peak (0.9% NaCl =\nplasma isotonic)',
            xy=(1.3, 3.0), xytext=(0.45, 3.7),
            fontsize=9, color='#3074a6',
            arrowprops=dict(arrowstyle='->', color='#3074a6', lw=1))
ax.annotate('peak (~0.3% MSG)',
            xy=(1.7, 2.5), xytext=(2.0, 3.4),
            fontsize=9, color='#7a3f7c',
            arrowprops=dict(arrowstyle='->', color='#7a3f7c', lw=1))
ax.annotate('sweetness plateau\n(no clear peak)',
            xy=(1.6, 3.2), xytext=(0.05, 2.0),
            fontsize=9, color='#9a6630',
            arrowprops=dict(arrowstyle='->', color='#9a6630', lw=1))

# axes / labels
ax.set_xlabel(r'Concentration  $\log_{10}$(c / detection threshold)', fontsize=12)
ax.set_ylabel('Hedonic rating  (− aversion  ·  + attraction)', fontsize=12)
ax.set_title('Concentration-Hedonic Curves for the Five Basic Tastes',
             fontsize=14, pad=14)

ax.set_ylim(-4.7, 4.4)
ax.set_xlim(-0.2, 2.8)

ax.legend(loc='lower left', frameon=False, fontsize=10, ncol=1,
          handlelength=2.4, borderaxespad=0.4)
ax.grid(True, alpha=0.22, linestyle=':')

# evolutionary-priority labels on the right
ax.text(2.78, 3.0,
        'Sweet / Umami\n→ monotone ↑\n(nutrition signal)',
        fontsize=8.5, color='#444', ha='right', va='top',
        bbox=dict(boxstyle='round,pad=0.4', fc='#fafafa', ec='#ddd'))
ax.text(2.78, 0.7,
        'Salt\n→ inverted-U\n(homeostasis)',
        fontsize=8.5, color='#444', ha='right', va='top',
        bbox=dict(boxstyle='round,pad=0.4', fc='#fafafa', ec='#ddd'))
ax.text(2.78, -2.2,
        'Sour / Bitter\n→ monotone ↓\n(risk signal)',
        fontsize=8.5, color='#444', ha='right', va='top',
        bbox=dict(boxstyle='round,pad=0.4', fc='#fafafa', ec='#ddd'))

# x-axis intuition under-bar
intuitions = [
    (0.0,  'threshold'),
    (0.6,  '× 4'),
    (1.0,  '× 10'),
    (1.5,  '× 30'),
    (2.0,  '× 100'),
    (2.5,  '× 300'),
]
for x, lab in intuitions:
    ax.text(x, -4.55, lab, ha='center', va='top', fontsize=8.5, color='#666')

# source footnote
fig.text(0.5, 0.01,
         'Sources: Moskowitz 1971, Beauchamp & Cowart 1985, '
         'Pangborn 1968, Yamaguchi 1967, Conner & Booth 1992  '
         '(values approximated from acceptance / intensity-rating curves)',
         fontsize=8, color='gray', ha='center', style='italic')

plt.subplots_adjust(left=0.08, right=0.95, top=0.92, bottom=0.13)

out = Path(__file__).resolve().parent.parent / 'concentration-hedonic.png'
plt.savefig(out, dpi=300, bbox_inches='tight')
print(f'Saved: {out}')
