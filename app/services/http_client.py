"""基于 urllib 的极简 HTTP 客户端（零第三方依赖）。

统一设置超时与 User-Agent，并把非 2xx 响应转成带状态码的异常，
便于上层服务返回结构一致的 {ok:false, error:...}。
"""
from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional

DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " \
             "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"


class HttpError(Exception):
    """HTTP 请求失败（含状态码与响应片段）。"""


def get_text(url: str, headers: Optional[Dict[str, str]] = None, timeout: float = 12.0) -> str:
    req_headers = {"User-Agent": DEFAULT_UA}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, headers=req_headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        snippet = exc.read().decode("utf-8", errors="replace")[:200]
        raise HttpError(f"HTTP {exc.code} {snippet}") from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise HttpError(str(exc)) from exc


def get_json(url: str, headers: Optional[Dict[str, str]] = None,
             timeout: float = 12.0) -> Any:
    return json.loads(get_text(url, headers=headers, timeout=timeout))


def post_json(url: str, payload: Dict[str, Any],
              headers: Optional[Dict[str, str]] = None,
              timeout: float = 30.0) -> Any:
    req_headers = {"User-Agent": DEFAULT_UA, "Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=req_headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8", errors="replace"))
    except urllib.error.HTTPError as exc:
        snippet = exc.read().decode("utf-8", errors="replace")[:200]
        raise HttpError(f"HTTP {exc.code} {snippet}") from exc
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
        raise HttpError(str(exc)) from exc


def quote(value: str) -> str:
    """URL 编码工具。"""
    return urllib.parse.quote(str(value), safe="")
