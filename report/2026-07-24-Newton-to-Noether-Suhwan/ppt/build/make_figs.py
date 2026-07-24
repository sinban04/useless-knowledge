# /// script
# requires-python = ">=3.10"
# dependencies = ["matplotlib==3.9.2", "numpy==2.1.1"]
# ///
"""Transformer 덱용 publication-quality 그래프 생성 → ../assets/fig-*.png
라벨은 영문/수식(폰트 누락 회피). 밝은 배경(슬라이드 paper 위)."""
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets"
ACC = "#2f6f9f"; ACC2 = "#b5341f"; ACC3 = "#7c5fc7"; GOOD = "#2e8b6f"
plt.rcParams.update({
    "figure.dpi": 150, "savefig.dpi": 150,
    "font.family": "DejaVu Sans", "font.size": 12,
    "axes.edgecolor": "#cdc8bd", "axes.linewidth": 1.0,
    "axes.titlesize": 14, "axes.titleweight": "bold",
    "axes.labelcolor": "#3a3e4d", "text.color": "#3a3e4d",
    "xtick.color": "#6b7180", "ytick.color": "#6b7180",
    "axes.grid": True, "grid.color": "#ece8df", "grid.linewidth": 0.8,
    "figure.facecolor": "white", "savefig.facecolor": "white", "savefig.bbox": "tight",
})

def save(fig, name):
    fig.savefig(OUT / name, facecolor="white"); plt.close(fig); print("wrote", name)

# 1) positional encoding: curves + heatmap
def posenc():
    L, D = 64, 64
    pos = np.arange(L)[:, None]; i = np.arange(D)[None, :]
    angle = pos / np.power(10000, (2 * (i // 2)) / D)
    pe = np.where(i % 2 == 0, np.sin(angle), np.cos(angle))
    fig, ax = plt.subplots(1, 2, figsize=(10.5, 4.0))
    for d, c in zip([0, 4, 12, 24], [ACC, ACC3, ACC2, GOOD]):
        ax[0].plot(pe[:, d], color=c, lw=2, label=f"dim {d}")
    ax[0].set_title("Positional encoding — per-dimension sinusoids")
    ax[0].set_xlabel("position"); ax[0].set_ylabel("value"); ax[0].legend(fontsize=9, framealpha=.9)
    im = ax[1].imshow(pe, aspect="auto", cmap="RdYlBu", origin="lower")
    ax[1].set_title("PE matrix  (position × dimension)")
    ax[1].set_xlabel("dimension"); ax[1].set_ylabel("position"); ax[1].grid(False)
    fig.colorbar(im, ax=ax[1], fraction=.046, pad=.04)
    fig.tight_layout(); save(fig, "fig-posenc.png")

# 2) example attention heatmap
def attn_heat():
    toks = ["The", "cat", "sat", "on", "the", "mat", "."]
    n = len(toks); rng = np.random.default_rng(7)
    A = np.zeros((n, n))
    for r in range(n):
        base = rng.random(n) * 0.3
        base[r] += 0.6
        if r > 0: base[r - 1] += 0.8
        if toks[r] == "mat": base[1] += 1.0  # mat -> cat
        A[r] = np.exp(base) / np.exp(base).sum()
    fig, ax = plt.subplots(figsize=(6.2, 5.4))
    im = ax.imshow(A, cmap="Blues", vmin=0)
    ax.set_xticks(range(n)); ax.set_yticks(range(n))
    ax.set_xticklabels(toks, rotation=40, ha="right"); ax.set_yticklabels(toks)
    ax.set_xlabel("key  (attended to)"); ax.set_ylabel("query  (attending)")
    ax.set_title("Attention weights  A = softmax(QKᵀ/√dₖ)")
    ax.grid(False)
    for r in range(n):
        for c in range(n):
            if A[r, c] > .18:
                ax.text(c, r, f"{A[r,c]:.2f}", ha="center", va="center",
                        color="white" if A[r, c] > .4 else "#1f3a4d", fontsize=8)
    fig.colorbar(im, fraction=.046, pad=.04)
    fig.tight_layout(); save(fig, "fig-attn-heatmap.png")

# 3) complexity O(n^2) vs O(n log n) vs O(n)
def complexity():
    n = np.linspace(1, 4096, 400)
    fig, ax = plt.subplots(figsize=(7.6, 4.4))
    ax.plot(n, n**2, color=ACC2, lw=2.5, label="Self-Attention  $O(n^2)$")
    ax.plot(n, n * np.log2(n + 1) * 30, color=ACC3, lw=2.2, label="Sparse / FlashAttn IO  $O(n\\,\\log n)$")
    ax.plot(n, n * 60, color=GOOD, lw=2.2, label="Linear attention  $O(n)$")
    ax.set_yscale("log"); ax.set_xlabel("sequence length  n"); ax.set_ylabel("cost  (log scale)")
    ax.set_title("Attention cost vs sequence length")
    ax.legend(fontsize=10, framealpha=.92)
    ax.axvspan(2048, 4096, color="#f6d9d3", alpha=.5)
    ax.text(3072, ax.get_ylim()[1] * .25, "long-context\nbottleneck", ha="center", color=ACC2, fontsize=9, fontweight="bold")
    fig.tight_layout(); save(fig, "fig-complexity.png")

# 4) Noam LR warmup schedule
def lr_warmup():
    step = np.arange(1, 40000)
    dmodel = 512
    for wu, c in [(4000, ACC), (8000, ACC3), (16000, ACC2)]:
        lr = dmodel**-0.5 * np.minimum(step**-0.5, step * wu**-1.5)
        plt.plot(step, lr, lw=2, color=c, label=f"warmup={wu}")
    fig = plt.gcf(); fig.set_size_inches(7.6, 4.2)
    ax = plt.gca()
    ax.set_title("Noam learning-rate schedule  (warmup → inverse-sqrt decay)")
    ax.set_xlabel("training step"); ax.set_ylabel("learning rate")
    ax.legend(fontsize=10, framealpha=.92)
    fig.tight_layout(); save(fig, "fig-lr-warmup.png")

# 5) scaling laws sketch (loss vs compute, log-log)
def scaling():
    C = np.logspace(2, 9, 200)
    L = 2.0 + 12.0 * C**-0.07
    fig, ax = plt.subplots(figsize=(7.4, 4.2))
    ax.plot(C, L, color=ACC, lw=2.6)
    ax.set_xscale("log")
    ax.set_xlabel("compute  (FLOPs, log)"); ax.set_ylabel("test loss")
    ax.set_title("Scaling law — loss falls as a power law in compute")
    ax.annotate("bigger model + data + compute\n→ predictably lower loss",
                xy=(1e7, L[150]), xytext=(1e3, 4.0),
                arrowprops=dict(arrowstyle="->", color=ACC2), color=ACC2, fontsize=9.5, fontweight="bold")
    fig.tight_layout(); save(fig, "fig-scaling.png")

if __name__ == "__main__":
    posenc(); attn_heat(); complexity(); lr_warmup(); scaling()
    print("done")
