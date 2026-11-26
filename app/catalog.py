"""静态目录数据：完整搬运前端 app.js 中 const DATA / DATA_SOURCES / trendLabels。

这里的数据是演示样本（对应前端「演示数据」模式）。决策的分数与置信度由
engine.py 基于这些底层指标实时计算，catalog 里的 decision 仅提供品类、
理由与风险等叙述性内容，并作为无输入时的回退值。
"""
from __future__ import annotations

from dataclasses import asdict
from typing import Any, Dict, List

from .models import (
    Competitor,
    DataSource,
    Decision,
    HotProduct,
    HotWord,
    Listing,
    Pain,
    PriceDist,
    Review,
    Score,
    Sentiment,
    Signal,
    Supplier,
    TrendSeries,
)

DATA_SOURCES: List[DataSource] = [
    DataSource("YT", "YouTube Data API v3", "视频搜索 / 播放量增速 / 关键词趋势", "demo"),
    DataSource("TW", "Twitter API v2", "Hashtag 热度 / 推文量 / 情感倾向", "demo"),
    DataSource("TT", "TikTok / 抖音热点", "短视频话题播放量与增长率", "demo"),
    DataSource("NE", "新闻与资讯聚合", "媒体报道 / 行业快讯 / 事件捕获", "demo"),
    DataSource("EC", "电商平台后台", "热搜词 / 热卖榜 / 竞品上架", "demo"),
    DataSource("CM", "商品评论接口", "差评抓取 / 痛点聚类 / 情感分析", "demo"),
    DataSource("1688", "1688 供应商", "价格 / 起订量 / 评分 / 回头率", "demo"),
]

TREND_LABELS: List[str] = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "今天"]

SIGNALS: List[Signal] = [
    Signal(
        platform="YouTube", color="#ff4b4b", tag="YT",
        title='"The Ultimate Camping Coffee Setup" 爆火',
        desc="@OutdoorBrew 发布的露营咖啡装备视频 72 小时内冲到 240 万播放，评论区高频询问器具链接。",
        views="242万", growth=342, mention="1.8万", heat=96,
        keyword="便携咖啡器具", date="3 天前",
    ),
    Signal(
        platform="Twitter", color="#1d9bf0", tag="TW",
        title="#CampingCoffee 话题周环比 +520%",
        desc='欧美露营咖啡话题进入趋势榜，配合 "portable espresso" 相关讨论同步走高，情绪以正面为主。',
        views="1.86万帖", growth=520, mention="4.2万", heat=92,
        keyword="portable coffee", date="持续 5 天",
    ),
    Signal(
        platform="新闻资讯", color="#7a5cf0", tag="NE",
        title="户外咖啡消费升温，便携器具成新宠",
        desc="多家媒体报道露营+咖啡场景融合趋势，行业分析指出便携器具搜索量同比翻倍。",
        views="18家媒体", growth=180, mention="—", heat=84,
        keyword="户外咖啡", date="2 天前",
    ),
    Signal(
        platform="TikTok", color="#111827", tag="TT",
        title='"camping coffee hack" 播放量 890 万',
        desc="短视频展示折叠手冲器具的一秒收纳与免清洗卖点，带货转化信号明显。",
        views="890万", growth=265, mention="2.6万", heat=89,
        keyword="折叠手冲", date="4 天前",
    ),
    Signal(
        platform="Reddit", color="#ff4500", tag="RD",
        title="r/camping 讨论量环比 +210%",
        desc='"best portable coffee maker for camping" 成为本周热帖，用户集中吐槽现有产品笨重、难洗。',
        views="3,420帖", growth=210, mention="8,900", heat=78,
        keyword="portable coffee maker", date="6 天前",
    ),
]

TREND_SERIES: List[TrendSeries] = [
    TrendSeries("便携咖啡器具", [18, 24, 31, 42, 58, 76, 96], "#4f46e5"),
    TrendSeries("portable coffee", [12, 16, 22, 35, 49, 68, 92], "#e5484d"),
    TrendSeries("户外咖啡", [9, 13, 17, 25, 38, 52, 71], "#e89320"),
    TrendSeries("折叠手冲", [5, 8, 12, 19, 33, 51, 74], "#16a06a"),
]

HOT_WORDS: List[HotWord] = [
    HotWord("便携咖啡机", 9820, 280, "2.4万", "高"),
    HotWord("手冲咖啡套装", 8460, 190, "1.8万", "中"),
    HotWord("户外咖啡器具", 7310, 165, "1.2万", "中"),
    HotWord("折叠咖啡杯", 5240, 118, "9,600", "低"),
    HotWord("摩卡壶", 3980, 38, "7,100", "高"),
    HotWord("胶囊咖啡机", 3120, 12, "5,800", "高"),
    HotWord("咖啡研磨器", 2870, 64, "4,300", "中"),
]

HOT_PRODUCTS: List[HotProduct] = [
    HotProduct("折叠手冲咖啡套装", "¥ 89", "3.2万/月", 186, 4.6, "☕"),
    HotProduct("便携式意式咖啡机", "¥ 259", "1.8万/月", 142, 4.4, "⚙️"),
    HotProduct("露营咖啡收纳包", "¥ 69", "1.1万/月", 98, 4.8, "🎒"),
    HotProduct("不锈钢摩卡壶 2杯装", "¥ 119", "8,900/月", 31, 4.5, "🫖"),
]

COMPETITORS: List[Competitor] = [
    Competitor("山野集 OUTLAND", "折叠手冲套装 Pro", "¥ 129", "3.2万", 4.6, "一秒折叠 · 全铝轻量", "8,421"),
    Competitor("咖途 COFFEEGO", "便携咖啡机 M2", "¥ 259", "1.8万", 4.4, "15Bar 高压萃取", "5,103"),
    Competitor("野杯 WILDCUP", "露营咖啡基础套装", "¥ 79", "1.1万", 4.8, "高颜值 · 收纳包", "3,276"),
    Competitor("北山 BEISHAN", "手冲入门套装", "¥ 99", "9,800", 4.3, "低价引流", "2,914"),
]

PRICE_DIST = PriceDist(
    labels=["0-50", "50-80", "80-120", "120-180", "180-260", "260+"],
    data=[8, 19, 34, 22, 11, 6],
)

PAINS: List[Pain] = [
    Pain("清洗困难", 32, "#e5484d"),
    Pain("容易漏水", 24, "#e89320"),
    Pain("体积笨重", 18, "#4f46e5"),
    Pain("研磨不均", 14, "#2b8fd6"),
    Pain("配件易丢", 12, "#16a06a"),
]

SENTIMENT = Sentiment(
    labels=["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "今天"],
    neg=[38, 40, 44, 51, 58, 64, 71],
    pos=[41, 39, 36, 31, 26, 23, 19],
)

REVIEWS: List[Review] = [
    Review(1, "淘宝", "2 天前",
           "冲完咖啡滤杯特别难洗，咖啡渣卡在角落，刷子伸不进去，用几次就不想带了。",
           ["清洗困难", "结构设计"]),
    Review(2, "京东", "4 天前",
           "壶盖密封做得差，放进背包里一路渗水，衣服全湿了，露营直接废了。",
           ["容易漏水", "密封性"]),
    Review(1, "小红书", "5 天前",
           "看着小巧实际上和保温杯一样重，徒步背一整天肩膀很酸。",
           ["体积笨重", "材质"]),
    Review(2, "京东", "6 天前",
           "磨出来的粉粗细差太多，萃取不稳定，有的酸有的苦。",
           ["研磨不均", "配件"]),
    Review(1, "淘宝", "1 周前",
           "滤纸和量勺没有收纳位，第二次出门就找不到了，得单独买配件。",
           ["配件易丢", "收纳"]),
    Review(2, "Amazon", "1 周前",
           "Hard to clean after use, and it leaks in my bag. Not worth the price.",
           ["清洗困难", "容易漏水"]),
]

DECISION = Decision(
    category="便携折叠手冲咖啡套装",
    confidence=87,
    scores=[
        Score("舆论热度", 92),
        Score("市场需求", 85),
        Score("竞争空间", 78),
        Score("利润空间", 82),
        Score("供应链成熟", 88),
    ],
    reasons=[
        "三路信号在近 7 天同步走强：社媒出现 240 万播放的爆款视频，电商热搜词「便携咖啡机」周涨 280%，评论区差评集中在可改进的结构痛点。",
        "主流竞品定价带集中在 ¥79–259，¥89–129 区间存在明显空档，既有利润又能避开低价内卷。",
        "差评中 56% 指向「清洗困难」与「容易漏水」，这两点恰好可通过快拆结构与硅胶密封圈解决，容易形成差异化卖点。",
        "1688 上有 5 家以上成熟供应商支持小批量起订与一件代发，供应链验证成本低，试错周期短。",
    ],
    risks=[
        "舆情热度由短视频驱动，存在 2–4 周衰减风险，建议小批量快速验证。",
        "头部品牌已占据「折叠手冲」关键词，需以「易清洗 + 不漏水」作为主差异化表达。",
        "咖啡器具季节性明显，秋冬季为旺季，需注意备货节奏。",
    ],
)

SUPPLIERS: List[Supplier] = [
    Supplier("永康市晨光工贸有限公司", "折叠手冲咖啡套装（快拆滤杯）", 32.5, 50, 4.8,
             "2.3万", 28, "浙江 金华", ["一件代发", "7天包换"], 94,
             "快拆结构 + 食品级硅胶圈，直击差评痛点"),
    Supplier("宁波海曙拓远户外用品", "户外便携咖啡器具套装", 38.9, 30, 4.9,
             "9,800", 35, "浙江 宁波", ["小批量", "可定制"], 91,
             "评分与回头率最高，适合做品牌化包装"),
    Supplier("义乌市优品日用品厂", "手冲咖啡套装 基础款", 28.0, 100, 4.6,
             "1.8万", 21, "浙江 义乌", ["现货", "支持贴牌"], 83,
             "价格最低，但密封件评价一般"),
    Supplier("广州悦咖商贸有限公司", "便携咖啡器具礼盒装", 45.0, 20, 4.7,
             "6,500", 19, "广东 广州", ["礼盒", "低起订"], 82,
             "包装好，适合礼赠场景，成本偏高"),
    Supplier("中山小榄精工五金厂", "不锈钢手冲套装", 26.8, 200, 4.5,
             "3.1万", 16, "广东 中山", ["工厂直供"], 76,
             "走量型，回头率偏低，质量稳定性待验"),
]

LISTING = Listing(
    title="便携折叠手冲咖啡套装 户外露营咖啡器具 快拆易清洗不漏水 轻量一秒收纳",
    bullets=[
        "【快拆易清洗】滤杯可整体拆开，咖啡渣一冲即净，告别刷不到的卫生死角。",
        "【密封不漏水】食品级硅胶密封圈 + 螺纹锁扣，放进背包也不渗漏。",
        "【一秒折叠收纳】整套收纳后仅手掌大小，重量 280g，徒步露营无负担。",
        "【完整配件】含滤杯、分享壶、量勺、收纳袋与 50 张滤纸，到手即用。",
        "【食品级材质】耐高温 PP + 304 不锈钢，安全无异味。",
    ],
    desc="无论周末露营、办公室还是差旅途中，都能随时冲出一杯干净的手冲咖啡。针对传统便携器具「洗不干净、容易漏水、太笨重」三大痛点重新设计，快拆结构让清洗只需 10 秒，密封锁扣让你放心塞进背包。折叠后体积缩小 65%，轻量随行，咖啡仪式感不用妥协。",
    cost=32.5, price=99, feeRate=0.06, shipping=6.5,
)


def build_catalog() -> Dict[str, Any]:
    """返回与前端 DATA 结构完全一致的可序列化字典。"""
    return {
        "signals": [asdict(x) for x in SIGNALS],
        "trendSeries": [asdict(x) for x in TREND_SERIES],
        "hotWords": [asdict(x) for x in HOT_WORDS],
        "hotProducts": [asdict(x) for x in HOT_PRODUCTS],
        "competitors": [asdict(x) for x in COMPETITORS],
        "priceDist": asdict(PRICE_DIST),
        "pains": [asdict(x) for x in PAINS],
        "sentiment": asdict(SENTIMENT),
        "reviews": [asdict(x) for x in REVIEWS],
        "decision": asdict(DECISION),
        "suppliers": [asdict(x) for x in SUPPLIERS],
        "listing": asdict(LISTING),
        "dataSources": [asdict(x) for x in DATA_SOURCES],
        "trendLabels": list(TREND_LABELS),
    }
