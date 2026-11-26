"""数据模型：把前端 app.js 中出现的每一类记录都定义为 dataclass。

字段命名与前端 DATA 完全一致（例如 listing 使用 feeRate），
因此 dataclasses.asdict() 的结果可以直接作为 JSON 下发给前端。
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List


@dataclass
class DataSource:
    key: str
    name: str
    note: str
    status: str


@dataclass
class Signal:
    platform: str
    color: str
    tag: str
    title: str
    desc: str
    views: str
    growth: int
    mention: str
    heat: int
    keyword: str
    date: str


@dataclass
class TrendSeries:
    label: str
    data: List[int]
    color: str


@dataclass
class HotWord:
    word: str
    heat: int
    growth: int
    orders: str
    diff: str


@dataclass
class HotProduct:
    name: str
    price: str
    sales: str
    growth: int
    rating: float
    img: str


@dataclass
class Competitor:
    brand: str
    product: str
    price: str
    sales: str
    rating: float
    selling: str
    reviews: str


@dataclass
class PriceDist:
    labels: List[str]
    data: List[int]


@dataclass
class Pain:
    label: str
    value: int
    color: str


@dataclass
class Sentiment:
    labels: List[str]
    neg: List[int]
    pos: List[int]


@dataclass
class Review:
    stars: int
    src: str
    date: str
    text: str
    tags: List[str]


@dataclass
class Score:
    name: str
    value: int


@dataclass
class Decision:
    category: str
    confidence: int
    scores: List[Score]
    reasons: List[str]
    risks: List[str]


@dataclass
class Supplier:
    name: str
    product: str
    price: float
    moq: int
    rating: float
    sales: str
    repeat: int
    location: str
    tags: List[str]
    score: int
    note: str


@dataclass
class Listing:
    title: str
    bullets: List[str]
    desc: str
    cost: float
    price: float
    feeRate: float
    shipping: float


# 便于类型标注的组合别名
DataDict = Dict[str, Any]
