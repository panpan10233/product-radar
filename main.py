"""选品雷达 · 工程化 Python 后端唯一入口。

运行方式：
    python main.py

监听 0.0.0.0:8787，同源托管静态页面并提供全部 /api/* 接口。
仅依赖 Python 标准库。
"""
from app.api.server import run

if __name__ == "__main__":
    run()
