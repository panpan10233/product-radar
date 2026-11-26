# 选品雷达 · Python 后端工程

零第三方依赖的 Python 标准库实现，同源托管前端页面并提供全部 API。端口固定 `8787`，监听 `0.0.0.0`。

## 运行

```bash
cd product-radar
python main.py
```

浏览器打开 <http://localhost:8787/>。按 `Ctrl+C` 停止。

## 工程结构

```
main.py                 唯一入口，调用 app.api.server.run()
app/
  config.py             读写 .env.local.json，生成健康状态（密钥绝不下发）
  models.py             Signal/HotWord/HotProduct/Competitor/Pain/Review/Supplier/Decision/Listing 等 dataclass
  catalog.py            完整搬运原 app.js 的全部演示数据（5信号/4趋势/7热词/4热卖品/4竞品/价格分布/5痛点/情感/6差评/决策/5供应商/listing）
  engine.py             五维加权决策引擎 + 定价利润测算（实时计算，非写死 87）
  services/
    http_client.py      urllib 封装（超时 + UA + 统一错误）
    news.py             Bing News RSS（rss2json 代理 + 直连回退 + XML 解析）
    social.py           抖音热榜、百度热搜、社媒代理信号
    ecommerce.py        淘宝搜索建议
    supplier.py         1688 会场链接（无公开 API，不伪造数据）
    ai.py               /api/chat：密钥模型优先，免密钥降级 + 5 分钟内存缓存
  api/
    router.py           路由分发
    server.py           ThreadingHTTPServer + 静态托管 + CORS + 安全拦截 + 错误处理
  static/               index.html / styles.css / app.js（app.js 从 /api/bootstrap 拉取数据）
```

## 密钥安全

- 密钥只保存在项目根目录 `.env.local.json`，服务端通过 `/api/config` 更新。
- 静态服务只放行白名单文件 `index.html`/`styles.css`/`app.js`；`/.env*`、`*.py`、隐藏文件、目录穿越请求一律返回 403，其余未知路径返回 404。
- `/api/health` 只返回「是否已配置」「模型名」等非敏感信息，绝不返回密钥明文。

## API 清单

| 方法 | 路径 | 说明 / 返回结构 |
| --- | --- | --- |
| GET | `/api/health` | `{ok, sources:{...}, llm:{...}}` |
| POST | `/api/config` | 入参 `{youtube, twitter, llm:{baseUrl,key,model}}` → `{ok, health}` |
| GET | `/api/bootstrap` | 完整数据对象 `{signals,trendSeries,hotWords,hotProducts,competitors,priceDist,pains,sentiment,reviews,decision,suppliers,listing,dataSources,trendLabels}` |
| GET | `/api/news?q=` | `{ok,source,query,count,items:[{title,link,pubDate,source,desc}]}` |
| GET | `/api/douyin` | `{ok,source,count,items:[{word,hot,url}]}` |
| GET | `/api/taobao?q=` | `{ok,source,query,count,items:[{word,weight,url}]}` |
| GET | `/api/baidu` | `{ok,source,count,items:[{word,url,hot}]}` |
| GET | `/api/social?platform=` | 新闻代理信号（YouTube/Twitter 无免密钥 API） |
| GET | `/api/1688?q=` | 会场链接 + 说明，`items` 恒为空 |
| GET | `/api/youtube?q=` | 有密钥走真实 API，无密钥返回 `code:501` |
| GET | `/api/twitter?q=` | 有密钥走真实 API，无密钥返回 `code:501` |
| POST | `/api/chat` | 入参 `{messages:[...]}` → `{ok,content,model}`；降级时 `{ok:false,degrade:true}` |
| POST | `/api/decision/evaluate` | 实时重算决策，返回决策对象 |

### 决策引擎

五维权重：舆论热度 0.25、市场需求 0.25、竞争空间 0.2、利润空间 0.15、供应链成熟 0.15。
各维度由信号的 heat、热搜词涨幅、竞品数量、listing 定价利润测算、供应商推荐指数实时推导。
默认输入下 `scores=[92,85,78,82,88]`、加权 85.35、`confidence=87`，与前端展示一致。

验证「实时计算而非写死」：

```bash
curl -s http://localhost:8787/api/decision/evaluate
curl -s -X POST http://localhost:8787/api/decision/evaluate \
  -H 'Content-Type: application/json' -d '{"public_delta":10,"competitor_delta":2}'
```

第二次调用的舆论热度、竞争空间、置信度会立即变化。其他可覆盖项：`demand_delta`、`margin_delta`、`supply_delta`。

## 前端改造点

`app/static/app.js` 仅改动两处，渲染函数、交互、图表、事件、AI 对话、checklist、供应商勾选、排序筛选逻辑全部保持原样：

1. 数据定义处：删除硬编码 `const DATA = {...}` / `DATA_SOURCES` / `trendLabels`，改为空骨架 + `async function bootstrap()` 从 `/api/bootstrap` 拉取并赋值。
2. 启动处：末尾改为 `bootstrap().then(async()=>{ await probeHealth(); render(); })`，保证数据先到再渲染。

`buildContext()` 天然引用 `DATA`，无需改动即可随后端数据更新。
