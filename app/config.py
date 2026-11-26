"""服务端配置：读写项目根目录下的 .env.local.json，并生成对外的健康状态。

安全约定：密钥只存在于服务端配置文件中。health() 返回的所有字段均不包含
任何密钥明文，前端只能看到「是否已配置」以及模型名称等非敏感信息。
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict

# 项目根目录（product-radar/），config.py 位于 app/ 下
ROOT = Path(__file__).resolve().parent.parent
CONFIG_FILE = ROOT / ".env.local.json"

DEFAULT_CONFIG: Dict[str, Any] = {
    "youtube": "",
    "twitter": "",
    "llm": {
        "baseUrl": "https://api.openai.com/v1",
        "key": "",
        "model": "gpt-4o-mini",
    },
}


def load_config() -> Dict[str, Any]:
    """读取配置；文件缺失或损坏时返回结构完整的默认值。"""
    try:
        raw = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        raw = {}

    cfg = dict(DEFAULT_CONFIG)
    cfg["youtube"] = str(raw.get("youtube") or "").strip()
    cfg["twitter"] = str(raw.get("twitter") or "").strip()

    llm_raw = raw.get("llm") or {}
    if not isinstance(llm_raw, dict):
        llm_raw = {}
    cfg["llm"] = {
        "baseUrl": str(llm_raw.get("baseUrl") or DEFAULT_CONFIG["llm"]["baseUrl"]).strip(),
        "key": str(llm_raw.get("key") or "").strip(),
        "model": str(llm_raw.get("model") or DEFAULT_CONFIG["llm"]["model"]).strip(),
    }
    return cfg


def save_config(cfg: Dict[str, Any]) -> None:
    """保存配置到服务端文件。尽力设置为仅当前用户可读写。"""
    payload = {
        "youtube": str(cfg.get("youtube") or "").strip(),
        "twitter": str(cfg.get("twitter") or "").strip(),
        "llm": {
            "baseUrl": str((cfg.get("llm") or {}).get("baseUrl") or "").strip(),
            "key": str((cfg.get("llm") or {}).get("key") or "").strip(),
            "model": str((cfg.get("llm") or {}).get("model") or "").strip(),
        },
    }
    CONFIG_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    try:
        os.chmod(CONFIG_FILE, 0o600)
    except OSError:
        # Windows 上 chmod 支持有限，忽略即可（文件仍在项目目录内，且不对外提供下载）
        pass


def update_config(payload: Dict[str, Any]) -> Dict[str, Any]:
    """把 /api/config 收到的字段合并进现有配置并落盘。空字符串表示保持原值。"""
    cfg = load_config()
    if "youtube" in payload:
        cfg["youtube"] = str(payload.get("youtube") or "").strip()
    if "twitter" in payload:
        cfg["twitter"] = str(payload.get("twitter") or "").strip()

    llm_in = payload.get("llm")
    if isinstance(llm_in, dict):
        llm = dict(cfg["llm"])
        if "baseUrl" in llm_in:
            llm["baseUrl"] = str(llm_in.get("baseUrl") or llm["baseUrl"]).strip()
        if "model" in llm_in:
            llm["model"] = str(llm_in.get("model") or llm["model"]).strip()
        if "key" in llm_in:
            value = str(llm_in.get("key") or "").strip()
            # 留空表示保持原值，与前端输入框的 placeholder 约定一致
            if value:
                llm["key"] = value
        cfg["llm"] = llm

    save_config(cfg)
    return cfg


def health(cfg: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """生成 /api/health 返回体。字段结构严格对齐前端 SOURCE_KEY_MAP。"""
    cfg = cfg or load_config()
    has_key = bool(cfg.get("llm", {}).get("key"))
    model = cfg.get("llm", {}).get("model") or "免密钥模型"
    return {
        "ok": True,
        "sources": {
            "news": {
                "configured": True,
                "kind": "public",
                "label": "Bing News RSS",
                "note": "公开源，无需密钥",
            },
            "youtube": {
                "configured": bool(cfg.get("youtube")),
                "kind": "key" if cfg.get("youtube") else "free",
                "label": "YouTube Data API v3",
                "note": "已配置密钥" if cfg.get("youtube") else "用公开媒体报道作代理信号",
            },
            "twitter": {
                "configured": bool(cfg.get("twitter")),
                "kind": "token" if cfg.get("twitter") else "free",
                "label": "Twitter API v2",
                "note": "已配置 Bearer Token" if cfg.get("twitter") else "用公开媒体报道作代理信号",
            },
            "llm": {
                "configured": True,
                "kind": "key" if has_key else "free",
                "label": model if has_key else "免密钥模型",
                "note": "使用你配置的模型" if has_key else "Pollinations 公共模型，无需密钥",
            },
            "ecommerce": {
                "configured": True,
                "kind": "free",
                "label": "电商平台后台",
                "note": "淘宝搜索建议 + 百度热搜实时数据",
            },
            "reviews": {
                "configured": True,
                "kind": "free",
                "label": "商品评论接口",
                "note": "基于公开数据的痛点分析（演示样本）",
            },
            "supplier1688": {
                "configured": True,
                "kind": "link",
                "label": "1688 供应商",
                "note": "会场跳转 + 比价清单导入",
            },
        },
        # 任务契约要求顶层也给出 llm 摘要（仍不含密钥）
        "llm": {
            "configured": has_key,
            "kind": "key" if has_key else "free",
            "model": model,
            "baseUrl": cfg.get("llm", {}).get("baseUrl", ""),
        },
    }
