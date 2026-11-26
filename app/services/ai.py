"""AI 对话服务。

- 配置了密钥：调用用户自己的 OpenAI 兼容接口（DeepSeek / 通义 / Kimi 等）。
- 未配置密钥：调用 Pollinations 公共模型，并以问题为 key 做 5 分钟内存缓存，
  规避限流；两个模型都失败时返回 ok:false + degrade:true，让前端内置分析接管。
密钥只从服务端配置读取，绝不出现在任何响应中。
"""
from __future__ import annotations

import re
import threading
import time
from typing import Any, Dict, List

from .http_client import HttpError, get_text, post_json, quote

LLM_CACHE_TTL = 5 * 60  # 秒
FREE_MODELS = ("openai", "mistral")

_cache: Dict[str, Dict[str, Any]] = {}
_cache_lock = threading.RLock()


def _cached(question: str):
    with _cache_lock:
        hit = _cache.get(question)
        if hit and time.time() - hit["t"] < LLM_CACHE_TTL:
            return hit
        return None


def _remember(question: str, text: str) -> None:
    with _cache_lock:
        _cache[question] = {"t": time.time(), "text": text}
        # 简单清理过期项，避免长期运行内存增长
        now = time.time()
        for key in [k for k, v in _cache.items() if now - v["t"] > LLM_CACHE_TTL]:
            _cache.pop(key, None)


def _facts_from_system(messages: List[Dict[str, Any]]) -> str:
    """从 system 上下文中抽取硬数据，压缩成极短提示词控制 URL 长度。"""
    sys_raw = " ".join(
        str(m.get("content") or "") for m in messages if m.get("role") == "system"
    )
    facts: List[str] = []

    def pick(pattern: str, label: str) -> None:
        match = re.search(pattern, sys_raw)
        if match:
            facts.append(label + match.group(1))

    pick(r"推荐品类[：:]([^，。\n]+)", "推荐:")
    pick(r"置信度\s*(\d+%)", "置信度")
    pick(r"视频\s*([\d.]+\s*万)", "视频")
    pick(r"涨\s*(\d+%)", "热度涨")
    pick(r"清洗困难\s*(\d+%)", "清洗难")
    pick(r"漏水\s*(\d+%)", "漏水")
    pick(r"¥?([\d.]+\/起订\d+)", "起订")
    pick(r"评分\s*([\d.]+)", "评分")
    pick(r"建议售价\s*¥?(\d+)", "售价")
    return ((" ".join(facts)) or "推荐便携咖啡套装")[:150]


def _free_chat(messages: List[Dict[str, Any]]) -> Dict[str, Any]:
    last_user = next((m for m in reversed(messages) if m.get("role") == "user"), None)
    question = str((last_user or {}).get("content") or "")[:120]
    if not question:
        return {"ok": False, "error": "缺少 messages"}
    if not messages:
        return {"ok": False, "error": "缺少 messages"}

    hit = _cached(question)
    if hit:
        return {"ok": True, "model": "cache", "content": hit["text"],
                "free": True, "cached": True}

    ctx = _facts_from_system(messages)
    q_short = re.sub(r"[，。？！?]", "", question)[:50]
    prompt = f"电商选品助手。{ctx}。问:{q_short}。依据数据中文简短答:"

    last_error = ""
    for model in FREE_MODELS:
        try:
            url = "https://text.pollinations.ai/" + quote(prompt) + "?model=" + model + "&seed=42"
            text = get_text(url, headers={"User-Agent": "Mozilla/5.0"}).strip()
            if text and not re.match(r"^4\d\d|^5\d\d", text):
                _remember(question, text)
                return {"ok": True, "model": "pollinations/" + model + " (免密钥)",
                        "content": text, "free": True}
            last_error = text[:80]
        except HttpError as exc:
            last_error = str(exc)
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)

    return {
        "ok": False,
        "code": 503,
        "degrade": True,
        "error": f"免密钥模型暂时不可用（{last_error}），已切换内置数据分析",
    }


def chat(payload: Dict[str, Any], cfg: Dict[str, Any]) -> Dict[str, Any]:
    """统一入口：优先密钥模型，其次免密钥公共模型。"""
    messages = payload.get("messages") or []
    if not isinstance(messages, list) or not messages:
        return {"ok": False, "error": "缺少 messages"}

    llm = cfg.get("llm") or {}
    key = str(llm.get("key") or "").strip()
    if not key:
        return _free_chat(messages)

    base_url = str(llm.get("baseUrl") or "https://api.openai.com/v1").rstrip("/")
    model = str(llm.get("model") or "gpt-4o-mini").strip()
    try:
        data = post_json(
            base_url + "/chat/completions",
            {
                "model": model,
                "messages": messages,
                "temperature": 0.5,
                "max_tokens": 700,
            },
            headers={"Authorization": "Bearer " + key},
            timeout=30.0,
        )
        content = ""
        choices = data.get("choices") or []
        if choices:
            content = (choices[0].get("message") or {}).get("content") or ""
        return {"ok": True, "model": model, "content": content, "usage": data.get("usage")}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": "大模型调用失败：" + str(exc)}
