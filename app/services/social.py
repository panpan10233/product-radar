"""社交热榜服务：抖音热榜与百度热搜（均为免密钥公开接口）。"""
from __future__ import annotations

from typing import Any, Dict

from .http_client import get_json, quote
from . import news

DOUYIN_URL = "https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/"
BAIDU_URL = "https://top.baidu.com/api/board?platform=pc&tab=realtime"


def douyin() -> Dict[str, Any]:
    try:
        data = get_json(DOUYIN_URL, headers={"User-Agent": "Mozilla/5.0"})
        items = [
            {
                "word": x.get("word") or "",
                "hot": x.get("hot_value") or 0,
                "url": "https://www.douyin.com/search/" + quote(x.get("word") or ""),
            }
            for x in (data.get("word_list") or [])[:12]
        ]
        return {"ok": True, "source": "抖音热榜", "count": len(items), "items": items}
    except Exception as exc:  # noqa: BLE001 - 网络错误统一转成降级响应
        return {"ok": False, "source": "抖音热榜", "count": 0, "items": [],
                "error": "抖音热榜获取失败：" + str(exc)}


def baidu() -> Dict[str, Any]:
    try:
        data = get_json(BAIDU_URL, headers={"User-Agent": "Mozilla/5.0"})
        cards = ((data.get("data") or {}).get("cards") or [])
        items = []
        for card in cards:
            for x in (card.get("content") or []):
                items.append({
                    "word": x.get("word") or "",
                    "url": x.get("url") or x.get("appUrl") or "",
                    "hot": x.get("hotScore") or "",
                })
        items = items[:15]
        return {"ok": True, "source": "百度热搜", "count": len(items), "items": items}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "source": "百度热搜", "count": 0, "items": [],
                "error": "百度热搜获取失败：" + str(exc)}


def social_signal(platform: str | None = None) -> Dict[str, Any]:
    """YouTube / Twitter 无免密钥 API：用 Bing News 的公开报道作代理信号。"""
    platform = (platform or "youtube").strip().lower()
    q_map = {
        "youtube": "youtube camping coffee viral video",
        "twitter": "twitter camping coffee trending",
    }
    result = news.fetch(q_map.get(platform, q_map["youtube"]))
    if not result.get("ok"):
        return result
    return {
        "ok": True,
        "source": "Bing News 社媒报道（代理信号）",
        "platform": platform,
        "count": result.get("count", 0),
        "items": result.get("items", []),
        "note": "YouTube/Twitter 官方 API 需密钥，此处使用公开媒体报道作为替代信号",
    }
