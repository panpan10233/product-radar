"""电商服务：淘宝搜索建议（免密钥公开接口）。"""
from __future__ import annotations

from typing import Any, Dict

from .http_client import get_json, quote

SUGGEST_URL = "https://suggest.taobao.com/sug?code=utf-8&q={q}"
SEARCH_URL = "https://s.taobao.com/search?q={q}"


def taobao(query: str | None = None) -> Dict[str, Any]:
    q = (query or "咖啡").strip() or "咖啡"
    try:
        data = get_json(
            SUGGEST_URL.format(q=quote(q)),
            headers={"User-Agent": "Mozilla/5.0", "Referer": "https://s.taobao.com/"},
        )
        items = [
            {
                "word": str(x[0]) if x else "",
                "weight": int(x[1]) if len(x) > 1 and str(x[1]).isdigit() else 0,
                "url": SEARCH_URL.format(q=quote(str(x[0]) if x else "")),
            }
            for x in (data.get("result") or [])
        ]
        return {"ok": True, "source": "淘宝搜索建议", "query": q,
                "count": len(items), "items": items}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "source": "淘宝搜索建议", "query": q,
                "count": 0, "items": [], "error": "淘宝建议获取失败：" + str(exc)}
