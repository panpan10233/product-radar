"""HTTP 服务器：ThreadingHTTPServer + 静态托管 + CORS + 安全拦截 + 错误处理。

安全要点：
- 静态文件只从 app/static/ 提供，且仅允许白名单文件名；
- 任何 .env* 路径、.py 文件、隐藏文件与目录穿越请求一律 403；
- 密钥文件位于项目根目录，静态路径永远无法访问到。
"""
from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict
from urllib.parse import parse_qs, unquote, urlparse

from .. import config
from . import router

HOST = "0.0.0.0"
PORT = 8787
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

ALLOWED_STATIC = {"index.html", "styles.css", "app.js"}
MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
}

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
}


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "ProductRadarPython/1.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        """保留访问日志，但输出到 stdout 便于后台启动观察。"""
        super().log_message(fmt, *args)

    # ---------- 响应工具 ----------
    def _send(self, code: int, body: bytes, content_type: str,
              extra_headers: Dict[str, str] | None = None) -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        if extra_headers:
            for key, value in extra_headers.items():
                self.send_header(key, value)
        self.end_headers()
        if self.command != "HEAD" and body:
            self.wfile.write(body)

    def send_json(self, code: int, data: Dict[str, Any]) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self._send(code, body, "application/json; charset=utf-8")

    def read_body(self) -> Dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            parsed = json.loads(raw.decode("utf-8"))
            return parsed if isinstance(parsed, dict) else {}
        except (ValueError, UnicodeDecodeError):
            return {}

    # ---------- 请求入口 ----------
    def do_OPTIONS(self) -> None:  # noqa: N802
        self._send(204, b"", "text/plain; charset=utf-8")

    def do_GET(self) -> None:  # noqa: N802
        self._handle("GET")

    def do_POST(self) -> None:  # noqa: N802
        self._handle("POST")

    def do_HEAD(self) -> None:  # noqa: N802
        self._handle("HEAD")

    def _handle(self, method: str) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        try:
            if path.startswith("/api/"):
                cfg = config.load_config()
                body = self.read_body() if method == "POST" else {}
                code, data = router.dispatch(
                    method, path, parse_qs(parsed.query), body, cfg
                )
                return self.send_json(code, data)
            if path not in ("/", "") and not path.startswith("/"):
                return self.send_json(403, {"error": "forbidden"})
            return self._serve_static(path)
        except Exception as exc:  # noqa: BLE001
            return self.send_json(500, {"ok": False, "error": str(exc)})

    def _serve_static(self, path: str) -> None:
        decoded = unquote(path)
        # 安全拦截：目录穿越、密钥文件、源码文件、隐藏文件
        if (
            ".." in decoded
            or decoded.lower().startswith("/.env")
            or decoded.lower().endswith(".py")
            or "/." in decoded
        ):
            return self.send_json(403, {"error": "forbidden"})

        name = "index.html" if decoded in ("/", "") else decoded.lstrip("/")
        # 只允许白名单文件；其余（含 app/ 包内文件）一律 404
        if name not in ALLOWED_STATIC:
            return self.send_json(404, {"error": "not found"})

        file_path = STATIC_DIR / name
        if not file_path.is_file():
            return self.send_json(404, {"error": "not found"})

        content = file_path.read_bytes()
        suffix = file_path.suffix.lower()
        self._send(200, content, MIME_TYPES.get(suffix, "application/octet-stream"))


def run() -> None:
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print("\n  选品雷达 Agent（Python 版）已启动")
    print(f"  ➜  本地访问: http://localhost:{PORT}")
    print(f"  ➜  密钥文件: {config.CONFIG_FILE}（仅存服务端，不下发前端）")
    print(f"  ➜  静态目录: {STATIC_DIR}")
    print("  ➜  按 Ctrl+C 停止\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
