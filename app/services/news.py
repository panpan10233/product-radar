"""新闻服务：Bing News RSS（经 rss2json 代理）+ 直连 RSS 回退 + XML 解析。"""
from __future__ import annotations

import html
import re
from typing import Any, Dict, List

from .http_client import HttpError, get_json, get_text, quote

RSS_TEMPLATE = "https://www.bing.com/news/search?q={q}&format=rss"
RSS2JSON_TEMPLATE = "https://api.rss2json.com/v1/api.json?rss_url={rss}&count=12"
DEFAULT_QUERY = "camping coffee"


def decode(value: str) -> str:
    """反转义 HTML 实体并去掉标签（对齐 Node server.js 的 decode）。"""
    text = str(value or "")
    text = re.sub(r"<!\[CDATA\[|\]\]>", "", text)
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", "", text)
    return text.strip()


def parse_rss(xml: str, limit: int = 12) -> List[Dict[str, str]]:
    """用正则解析 RSS <item>，避免引入第三方 XML 库。"""
    items: List[Dict[str, str]] = []

    def pick(block: str, tag: str) -> str:
        match = re.search(
            r"<" + tag + r"(?:\s[^>]*)?>([\s\S]*?)</" + tag + r">", block
        )
        return decode(match.group(1)) if match else ""

    for match in re.finditer(r"<item>[\s\S]*?</item>", xml):
        if len(items) >= limit:
            break
        block = match.group(0)
        items.append({
            "title": pick(block, "title"),
            "link": pick(block, "link"),
            "pubDate": pick(block, "pubDate"),
            "source": pick(block, "source"),
            "desc": pick(block, "description")[:180],
        })
    return items


def fetch(query: str | None = None, limit: int = 12) -> Dict[str, Any]:
    """抓取实时新闻；代理失败时回退直连 RSS。"""
    q = (query or DEFAULT_QUERY).strip() or DEFAULT_QUERY
    rss = RSS_TEMPLATE.format(q=quote(q))
    proxy_url = RSS2JSON_TEMPLATE.format(rss=quote(rss))

    proxy_error = ""
    try:
        data = get_json(proxy_url, headers={"User-Agent": "Mozilla/5.0"})
        if data.get("status") != "ok":
            raise HttpError("RSS 代理返回 " + str(data.get("status")))
        items = []
        for x in (data.get("items") or [])[:limit]:
            items.append({
                "title": x.get("title") or "",
                "link": x.get("link") or "",
                "pubDate": x.get("pubDate") or "",
                "source": x.get("author") or "Bing News",
                "desc": re.sub(r"<[^>]+>", "", x.get("description") or "")[:180],
            })
        return {
            "ok": True,
            "source": "Bing News RSS (via rss2json)",
            "query": q,
            "count": len(items),
            "items": items,
        }
    except (HttpError, ValueError, TypeError) as exc:
        proxy_error = str(exc)

    try:
        items = parse_rss(get_text(rss, headers={"User-Agent": "Mozilla/5.0"}), limit)
        if items:
            return {
                "ok": True,
                "source": "Bing News RSS",
                "query": q,
                "count": len(items),
                "items": items,
            }
        direct_error = "无结果"
    except HttpError as exc:
        direct_error = str(exc)

    return {
        "ok": False,
        "query": q,
        "count": 0,
        "items": [],
        "error": f"新闻抓取失败：{proxy_error}；直连回退：{direct_error}",
    }
