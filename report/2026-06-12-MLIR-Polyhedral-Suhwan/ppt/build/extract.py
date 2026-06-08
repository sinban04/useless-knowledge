#!/usr/bin/env python3
"""site 페이지에서 mermaid 다이어그램 소스를 디코딩해 챕터별 pool-0N.json 으로 뽑는다.
(mermaid 는 site HTML 에만 있고 엔티티 인코딩돼 있어, 에이전트가 재작성하다 깨지지 않도록
 여기서 클린 소스로 추출 → 슬라이드 spec 에서 "@K" 인덱스로 참조한다.)
코드·수식은 챕터 md 에 클린하게 있으므로 pool 대상 아님(에이전트가 md 에서 복사)."""
import re, html, json
from pathlib import Path

SITE = Path("/home/hwan/workspace/useless-engineers/probe-lab/2026-06-12-MLIR-Polyhedral-Suhwan/site")
BUILD = Path(__file__).resolve().parent

# 챕터 → 소스 site 페이지(들). ch6(폴리헤드럴)은 본문 05 + 부록(scop/farkas) 다이어그램 포함.
CH_PAGES = {
    1: ["00-intro"], 2: ["01-background"], 3: ["02-concepts"], 4: ["03-philosophy"],
    5: ["04-lowering"], 6: ["05-polyhedral", "aside-scop", "aside-farkas"],
    7: ["06-affine"], 8: ["07-synthesis"],
}

def mermaids(page):
    t = (SITE / f"{page}.html").read_text(encoding="utf-8")
    return [html.unescape(m).strip() for m in re.findall(r'<pre class="mermaid">(.*?)</pre>', t, re.S)]

for ch, pages in CH_PAGES.items():
    pool = {"mermaid": []}
    for p in pages:
        pool["mermaid"].extend(mermaids(p))
    (BUILD / f"pool-{ch:02d}.json").write_text(json.dumps(pool, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"ch{ch:02d}: {len(pool['mermaid'])} mermaid  (pages: {', '.join(pages)})")
    for i, m in enumerate(pool["mermaid"]):
        print(f"    @{i}: {m.splitlines()[0][:60]}")
