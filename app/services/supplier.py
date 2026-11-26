"""1688 供应商服务。

1688 没有面向个人的公开 API。这里如实返回会场链接与人工比价说明，
items 恒为空，绝不伪造供应商报价数据。
"""
from __future__ import annotations

from typing import Any, Dict

VENUE_URL = "https://www.1688.com/zw/hamlet.html?scene=6&cosite=bingjj_pz"


def venue(query: str | None = None) -> Dict[str, Any]:
    q = (query or "便携咖啡器具").strip() or "便携咖啡器具"
    return {
        "ok": True,
        "source": "1688 会场（需人工比价）",
        "query": q,
        "url": VENUE_URL,
        "note": "1688 无公开 API，请打开会场人工比价后导入结果",
        "items": [],
    }
