"""API 路由分发。

每个 handler 返回 (HTTP 状态码, JSON 可序列化字典)，由 server.py 统一写出。
所有接口的响应结构与前端 app.js 的调用约定严格一致。
"""
from __future__ import annotations

from typing import Any, Dict, Tuple

from .. import catalog, config, engine
from ..services import ai, ecommerce, http_client, news, social, supplier

Response = Tuple[int, Dict[str, Any]]


def _q(query: Dict[str, list], key: str, default: str = "") -> str:
    values = query.get(key)
    return values[0] if values else default


def _youtube(query: Dict[str, list], cfg: Dict[str, Any]) -> Dict[str, Any]:
    key = cfg.get("youtube")
    if not key:
        return {
            "ok": False, "code": 501,
            "error": "未配置 YouTube API Key。请在「数据源配置」中填入 Google Cloud 的 "
                     "YouTube Data API v3 密钥。",
        }
    q = _q(query, "q", "camping coffee") or "camping coffee"
    try:
        enc_q = http_client.quote(q)
        enc_key = http_client.quote(key)
        search_url = (
            "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video"
            "&order=viewCount&maxResults=10&q=" + enc_q + "&key=" + enc_key
        )
        data = http_client.get_json(search_url)
        raw_items = data.get("items") or []
        ids = [x.get("id", {}).get("videoId") for x in raw_items]
        ids = [i for i in ids if i]
        views: Dict[str, str] = {}
        if ids:
            stats_url = (
                "https://www.googleapis.com/youtube/v3/videos?part=statistics&id="
                + http_client.quote(",".join(ids)) + "&key=" + enc_key
            )
            stats = http_client.get_json(stats_url)
            for x in (stats.get("items") or []):
                views[x.get("id")] = str((x.get("statistics") or {}).get("viewCount") or "0")
        items = []
        for x in raw_items:
            video_id = (x.get("id") or {}).get("videoId") or ""
            snippet = x.get("snippet") or {}
            items.append({
                "title": snippet.get("title") or "",
                "channel": snippet.get("channelTitle") or "",
                "published": snippet.get("publishedAt") or "",
                "videoId": video_id,
                "url": "https://www.youtube.com/watch?v=" + video_id,
                "views": views.get(video_id, "0"),
            })
        return {"ok": True, "source": "YouTube Data API v3", "query": q, "items": items}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": "YouTube 调用失败：" + str(exc)}


def _twitter(query: Dict[str, list], cfg: Dict[str, Any]) -> Dict[str, Any]:
    token = cfg.get("twitter")
    if not token:
        return {
            "ok": False, "code": 501,
            "error": "未配置 Twitter Bearer Token。Twitter API v2 的 recent search "
                     "需要申请（免费层额度有限）。",
        }
    q = _q(query, "q", "camping coffee") or "camping coffee"
    try:
        url = (
            "https://api.twitter.com/2/tweets/search/recent?query=" + http_client.quote(q)
            + "&max_results=20&tweet.fields=created_at,public_metrics,author_id"
        )
        data = http_client.get_json(url, headers={"Authorization": "Bearer " + token})
        items = []
        for x in (data.get("data") or []):
            metrics = x.get("public_metrics") or {}
            items.append({
                "text": x.get("text") or "",
                "created": x.get("created_at") or "",
                "url": "https://twitter.com/i/web/status/" + str(x.get("id") or ""),
                "likes": metrics.get("like_count") or 0,
                "retweets": metrics.get("retweet_count") or 0,
            })
        return {"ok": True, "source": "Twitter API v2", "query": q,
                "count": (data.get("meta") or {}).get("result_count") or 0,
                "items": items}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": "Twitter 调用失败：" + str(exc)}


def _evaluation_overrides(body: Dict[str, Any], query: Dict[str, list]) -> Dict[str, float]:
    overrides: Dict[str, float] = {}
    for key in engine.OVERRIDE_KEYS:
        raw = body.get(key)
        if raw is None and key in query:
            raw = query[key][0]
        if raw is None:
            continue
        try:
            overrides[key] = float(raw)
        except (TypeError, ValueError):
            continue
    return overrides


def dispatch(method: str, path: str, query: Dict[str, list],
             body: Dict[str, Any], cfg: Dict[str, Any]) -> Response:
    """按路径分发 API 请求。"""
    if path == "/api/health" and method == "GET":
        return 200, config.health(cfg)

    if path == "/api/config" and method == "POST":
        updated = config.update_config(body)
        return 200, {"ok": True, "health": config.health(updated)}

    if path == "/api/bootstrap" and method == "GET":
        data = catalog.build_catalog()
        # 决策分数实时计算后覆盖目录中的回退值
        data["decision"] = engine.evaluate(data)
        return 200, data

    if path == "/api/news" and method == "GET":
        result = news.fetch(_q(query, "q", "camping coffee"))
        return result.get("code", 200), result

    if path == "/api/douyin" and method == "GET":
        result = social.douyin()
        return result.get("code", 200), result

    if path == "/api/taobao" and method == "GET":
        result = ecommerce.taobao(_q(query, "q", "咖啡"))
        return result.get("code", 200), result

    if path == "/api/baidu" and method == "GET":
        result = social.baidu()
        return result.get("code", 200), result

    if path == "/api/social" and method == "GET":
        result = social.social_signal(_q(query, "platform", "youtube"))
        return result.get("code", 200), result

    if path == "/api/1688" and method == "GET":
        result = supplier.venue(_q(query, "q", "便携咖啡器具"))
        return result.get("code", 200), result

    if path == "/api/youtube" and method == "GET":
        result = _youtube(query, cfg)
        return result.get("code", 200), result

    if path == "/api/twitter" and method == "GET":
        result = _twitter(query, cfg)
        return result.get("code", 200), result

    if path == "/api/chat" and method == "POST":
        result = ai.chat(body, cfg)
        return result.get("code", 200), result

    if path == "/api/decision/evaluate" and method in ("GET", "POST"):
        data = catalog.build_catalog()
        overrides = _evaluation_overrides(body, query)
        decision = engine.evaluate(data, overrides)
        return 200, decision

    return 404, {"ok": False, "error": "not found"}
