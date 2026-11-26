/* =========================================================
   选品雷达 · 智能选品 Agent 原型
   数据为演示用模拟数据，接入真实数据源的位置见 DATA_SOURCES
   ========================================================= */

const DATA_SOURCES = [
  { key: 'YT', name: 'YouTube Data API v3', note: '视频搜索 / 播放量增速 / 关键词趋势', status: 'demo' },
  { key: 'TW', name: 'Twitter API v2', note: 'Hashtag 热度 / 推文量 / 情感倾向', status: 'demo' },
  { key: 'TT', name: 'TikTok / 抖音热点', note: '短视频话题播放量与增长率', status: 'demo' },
  { key: 'NE', name: '新闻与资讯聚合', note: '媒体报道 / 行业快讯 / 事件捕获', status: 'demo' },
  { key: 'EC', name: '电商平台后台', note: '热搜词 / 热卖榜 / 竞品上架', status: 'demo' },
  { key: 'CM', name: '商品评论接口', note: '差评抓取 / 痛点聚类 / 情感分析', status: 'demo' },
  { key: '1688', name: '1688 供应商', note: '价格 / 起订量 / 评分 / 回头率', status: 'demo' }
];

const trendLabels = ['D-6','D-5','D-4','D-3','D-2','D-1','今天'];

const DATA = {
  signals: [
    { platform:'YouTube', color:'#ff4b4b', tag:'YT', title:'"The Ultimate Camping Coffee Setup" 爆火', desc:'@OutdoorBrew 发布的露营咖啡装备视频 72 小时内冲到 240 万播放，评论区高频询问器具链接。', views:'242万', growth:+342, mention:'1.8万', heat:96, keyword:'便携咖啡器具', date:'3 天前' },
    { platform:'Twitter', color:'#1d9bf0', tag:'TW', title:'#CampingCoffee 话题周环比 +520%', desc:'欧美露营咖啡话题进入趋势榜，配合 "portable espresso" 相关讨论同步走高，情绪以正面为主。', views:'1.86万帖', growth:+520, mention:'4.2万', heat:92, keyword:'portable coffee', date:'持续 5 天' },
    { platform:'新闻资讯', color:'#7a5cf0', tag:'NE', title:'户外咖啡消费升温，便携器具成新宠', desc:'多家媒体报道露营+咖啡场景融合趋势，行业分析指出便携器具搜索量同比翻倍。', views:'18家媒体', growth:+180, mention:'—', heat:84, keyword:'户外咖啡', date:'2 天前' },
    { platform:'TikTok', color:'#111827', tag:'TT', title:'"camping coffee hack" 播放量 890 万', desc:'短视频展示折叠手冲器具的一秒收纳与免清洗卖点，带货转化信号明显。', views:'890万', growth:+265, mention:'2.6万', heat:89, keyword:'折叠手冲', date:'4 天前' },
    { platform:'Reddit', color:'#ff4500', tag:'RD', title:'r/camping 讨论量环比 +210%', desc:'"best portable coffee maker for camping" 成为本周热帖，用户集中吐槽现有产品笨重、难洗。', views:'3,420帖', growth:+210, mention:'8,900', heat:78, keyword:'portable coffee maker', date:'6 天前' }
  ],
  trendSeries: [
    { label:'便携咖啡器具', data:[18,24,31,42,58,76,96], color:'#4f46e5' },
    { label:'portable coffee', data:[12,16,22,35,49,68,92], color:'#e5484d' },
    { label:'户外咖啡', data:[9,13,17,25,38,52,71], color:'#e89320' },
    { label:'折叠手冲', data:[5,8,12,19,33,51,74], color:'#16a06a' }
  ],
  hotWords: [
    { word:'便携咖啡机', heat:9820, growth:+280, orders:'2.4万', diff:'高' },
    { word:'手冲咖啡套装', heat:8460, growth:+190, orders:'1.8万', diff:'中' },
    { word:'户外咖啡器具', heat:7310, growth:+165, orders:'1.2万', diff:'中' },
    { word:'折叠咖啡杯', heat:5240, growth:+118, orders:'9,600', diff:'低' },
    { word:'摩卡壶', heat:3980, growth:+38, orders:'7,100', diff:'高' },
    { word:'胶囊咖啡机', heat:3120, growth:+12, orders:'5,800', diff:'高' },
    { word:'咖啡研磨器', heat:2870, growth:+64, orders:'4,300', diff:'中' }
  ],
  hotProducts: [
    { name:'折叠手冲咖啡套装', price:'¥ 89', sales:'3.2万/月', growth:+186, rating:4.6, img:'☕' },
    { name:'便携式意式咖啡机', price:'¥ 259', sales:'1.8万/月', growth:+142, rating:4.4, img:'⚙️' },
    { name:'露营咖啡收纳包', price:'¥ 69', sales:'1.1万/月', growth:+98, rating:4.8, img:'🎒' },
    { name:'不锈钢摩卡壶 2杯装', price:'¥ 119', sales:'8,900/月', growth:+31, rating:4.5, img:'🫖' }
  ],
  competitors: [
    { brand:'山野集 OUTLAND', product:'折叠手冲套装 Pro', price:'¥ 129', sales:'3.2万', rating:4.6, selling:'一秒折叠 · 全铝轻量', reviews:'8,421' },
    { brand:'咖途 COFFEEGO', product:'便携咖啡机 M2', price:'¥ 259', sales:'1.8万', rating:4.4, selling:'15Bar 高压萃取', reviews:'5,103' },
    { brand:'野杯 WILDCUP', product:'露营咖啡基础套装', price:'¥ 79', sales:'1.1万', rating:4.8, selling:'高颜值 · 收纳包', reviews:'3,276' },
    { brand:'北山 BEISHAN', product:'手冲入门套装', price:'¥ 99', sales:'9,800', rating:4.3, selling:'低价引流', reviews:'2,914' }
  ],
  priceDist: { labels:['0-50','50-80','80-120','120-180','180-260','260+'], data:[8,19,34,22,11,6] },
  pains: [
    { label:'清洗困难', value:32, color:'#e5484d' },
    { label:'容易漏水', value:24, color:'#e89320' },
    { label:'体积笨重', value:18, color:'#4f46e5' },
    { label:'研磨不均', value:14, color:'#2b8fd6' },
    { label:'配件易丢', value:12, color:'#16a06a' }
  ],
  sentiment: { labels:['D-6','D-5','D-4','D-3','D-2','D-1','今天'], neg:[38,40,44,51,58,64,71], pos:[41,39,36,31,26,23,19] },
  reviews: [
    { stars:1, src:'淘宝', date:'2 天前', text:'冲完咖啡滤杯特别难洗，咖啡渣卡在角落，刷子伸不进去，用几次就不想带了。', tags:['清洗困难','结构设计'] },
    { stars:2, src:'京东', date:'4 天前', text:'壶盖密封做得差，放进背包里一路渗水，衣服全湿了，露营直接废了。', tags:['容易漏水','密封性'] },
    { stars:1, src:'小红书', date:'5 天前', text:'看着小巧实际上和保温杯一样重，徒步背一整天肩膀很酸。', tags:['体积笨重','材质'] },
    { stars:2, src:'京东', date:'6 天前', text:'磨出来的粉粗细差太多，萃取不稳定，有的酸有的苦。', tags:['研磨不均','配件'] },
    { stars:1, src:'淘宝', date:'1 周前', text:'滤纸和量勺没有收纳位，第二次出门就找不到了，得单独买配件。', tags:['配件易丢','收纳'] },
    { stars:2, src:'Amazon', date:'1 周前', text:'Hard to clean after use, and it leaks in my bag. Not worth the price.', tags:['清洗困难','容易漏水'] }
  ],
  decision: {
    category:'便携折叠手冲咖啡套装',
    confidence:87,
    scores:[
      { name:'舆论热度', value:92 },
      { name:'市场需求', value:85 },
      { name:'竞争空间', value:78 },
      { name:'利润空间', value:82 },
      { name:'供应链成熟', value:88 }
    ],
    reasons:[
      '三路信号在近 7 天同步走强：社媒出现 240 万播放的爆款视频，电商热搜词「便携咖啡机」周涨 280%，评论区差评集中在可改进的结构痛点。',
      '主流竞品定价带集中在 ¥79–259，¥89–129 区间存在明显空档，既有利润又能避开低价内卷。',
      '差评中 56% 指向「清洗困难」与「容易漏水」，这两点恰好可通过快拆结构与硅胶密封圈解决，容易形成差异化卖点。',
      '1688 上有 5 家以上成熟供应商支持小批量起订与一件代发，供应链验证成本低，试错周期短。'
    ],
    risks:[
      '舆情热度由短视频驱动，存在 2–4 周衰减风险，建议小批量快速验证。',
      '头部品牌已占据「折叠手冲」关键词，需以「易清洗 + 不漏水」作为主差异化表达。',
      '咖啡器具季节性明显，秋冬季为旺季，需注意备货节奏。'
    ]
  },
  suppliers: [
    { name:'永康市晨光工贸有限公司', product:'折叠手冲咖啡套装（快拆滤杯）', price:32.5, moq:50, rating:4.8, sales:'2.3万', repeat:28, location:'浙江 金华', tags:['一件代发','7天包换'], score:94, note:'快拆结构 + 食品级硅胶圈，直击差评痛点' },
    { name:'宁波海曙拓远户外用品', product:'户外便携咖啡器具套装', price:38.9, moq:30, rating:4.9, sales:'9,800', repeat:35, location:'浙江 宁波', tags:['小批量','可定制'], score:91, note:'评分与回头率最高，适合做品牌化包装' },
    { name:'义乌市优品日用品厂', product:'手冲咖啡套装 基础款', price:28.0, moq:100, rating:4.6, sales:'1.8万', repeat:21, location:'浙江 义乌', tags:['现货','支持贴牌'], score:83, note:'价格最低，但密封件评价一般' },
    { name:'广州悦咖商贸有限公司', product:'便携咖啡器具礼盒装', price:45.0, moq:20, rating:4.7, sales:'6,500', repeat:19, location:'广东 广州', tags:['礼盒','低起订'], score:82, note:'包装好，适合礼赠场景，成本偏高' },
    { name:'中山小榄精工五金厂', product:'不锈钢手冲套装', price:26.8, moq:200, rating:4.5, sales:'3.1万', repeat:16, location:'广东 中山', tags:['工厂直供'], score:76, note:'走量型，回头率偏低，质量稳定性待验' }
  ],
  listing: {
    title:'便携折叠手冲咖啡套装 户外露营咖啡器具 快拆易清洗不漏水 轻量一秒收纳',
    bullets:[
      '【快拆易清洗】滤杯可整体拆开，咖啡渣一冲即净，告别刷不到的卫生死角。',
      '【密封不漏水】食品级硅胶密封圈 + 螺纹锁扣，放进背包也不渗漏。',
      '【一秒折叠收纳】整套收纳后仅手掌大小，重量 280g，徒步露营无负担。',
      '【完整配件】含滤杯、分享壶、量勺、收纳袋与 50 张滤纸，到手即用。',
      '【食品级材质】耐高温 PP + 304 不锈钢，安全无异味。'
    ],
    desc:'无论周末露营、办公室还是差旅途中，都能随时冲出一杯干净的手冲咖啡。针对传统便携器具「洗不干净、容易漏水、太笨重」三大痛点重新设计，快拆结构让清洗只需 10 秒，密封锁扣让你放心塞进背包。折叠后体积缩小 65%，轻量随行，咖啡仪式感不用妥协。',
    cost:32.5, price:99, feeRate:0.06, shipping:6.5
  }
};

/* ---------------- state ---------------- */
const state = { section:'overview', platform:'全部', painFilter:'全部', sortKey:'score', sortDir:-1, selected:['永康市晨光工贸有限公司'], charts:[], checklist:{ media:{done:false,value:''}, stock:{done:false,value:''} } };

const SECTION_TITLE = {
  overview:'总览驾驶舱', social:'舆论监控', ecommerce:'电商数据', reviews:'评论挖掘',
  decision:'选品决策', suppliers:'1688 供应商比价', listing:'上架草稿'
};

function $(s, root=document){ return root.querySelector(s); }
function $$(s, root=document){ return Array.from(root.querySelectorAll(s)); }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function sign(n){ return (n>0?'+':'')+n+'%'; }
function deltaHtml(n){ return `<span class="delta" style="color:${n>=0?'var(--up)':'var(--down)'}">${n>=0?'↑':'↓'} ${sign(n)}</span>`; }
function icon(name){ return `<i data-lucide="${name}"></i>`; }

function refreshIcons(){
  if(window.lucide) window.lucide.createIcons();
}
function toast(msg){
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove('show'), 2400);
}
function mkChart(id, config){
  const c = document.getElementById(id);
  if(!c || !window.Chart) return;
  state.charts.push(new Chart(c, config));
}
function clearCharts(){ state.charts.forEach(c=>c.destroy()); state.charts = []; }
const chartFont = { family:'Inter, "PingFang SC", sans-serif', size:10.5 };
if(typeof Chart !== 'undefined' && Chart.defaults) Chart.defaults.font = Object.assign({}, Chart.defaults.font, chartFont);

/* ---------------- sections ---------------- */
function renderOverview(){
  const d = DATA.decision;
  return `
  <div class="hero">
    <div class="hero-content">
      <div>
        <h2>早上好，三路信号已汇集 ✦</h2>
        <p>舆论端出现爆款内容、电商端热搜词快速拉升、评论区暴露出明确的产品痛点。Agent 已完成交叉验证，建议优先验证「便携折叠手冲咖啡套装」品类。</p>
        <div class="hero-meta">
          <div><b>17</b><span>今日捕获信号</span></div>
          <div><b>7</b><span>高热度关键词</span></div>
          <div><b>1,286</b><span>差评样本</span></div>
          <div><b>${d.confidence}%</b><span>选品置信度</span></div>
        </div>
      </div>
      <div class="hero-side">
        <button class="btn primary" id="runPipeline">${icon('play')} 运行完整流水线</button>
        <button class="btn" id="pullAllData" style="margin-top:8px">${icon('download')} 拉取全部实时数据</button>
        <small>新闻 · 抖音热榜 · 淘宝词 · 百度热搜</small>
      </div>
    </div>
  </div>

  <section class="card" style="margin-bottom:16px">
    <div class="card-head">
      <div class="card-title">${icon('workflow')} Agent 流水线 <span class="card-sub">从信号到上架的 6 个阶段</span></div>
      <span class="tag down">5 / 6 已完成</span>
    </div>
    <div class="pipeline">
      ${[['01','舆论监控','社媒 + 新闻信号捕获','done','social'],['02','电商数据','热搜词 / 竞品 / 热卖榜','done','ecommerce'],['03','评论挖掘','差评聚类与痛点提取','done','reviews'],['04','交叉决策','品类评分与推荐','done','decision'],['05','供应商比价','1688 价格与口碑对比','done','suppliers'],['06','上架执行','生成文案并发布','pending','listing']].map(x=>`
        <div class="pipe-step ${x[3]}" data-go="${x[4]}" role="button" tabindex="0"><div class="num">${x[0]}</div><b>${x[1]}</b><small>${x[2]}</small><span class="st">${x[3]==='done'?'✓ 已完成':'· 待执行'}</span></div>`).join('')}
    </div>
  </section>

  <div class="grid g4" style="margin-bottom:16px">
    ${[
      ['监控信号','17','较昨日 +6 条','activity','up','social'],
      ['最高热搜涨幅','+280%','便携咖啡机','trending-up','up','ecommerce'],
      ['核心差评痛点','56%','清洗难 + 漏水','message-square','warn','reviews'],
      ['推荐品类置信度','87%','高于阈值 75%','target','down','decision']
    ].map(k=>`
      <div class="card kpi" data-go="${k[5]}" role="button" tabindex="0" title="点击查看${k[0]}详情">
        <div class="kpi-top"><span>${k[0]}</span><div class="kpi-icon" style="background:var(--${k[4]==='warn'?'warn':'primary'}-soft);color:var(--${k[4]==='warn'?'warn':'primary'})">${icon(k[3])}</div></div>
        <div class="kpi-val">${k[1]}</div><div class="kpi-foot">${k[2]}</div>
      </div>`).join('')}
  </div>

  <div class="grid g-32">
    <section class="card">
      <div class="card-head"><div class="card-title">${icon('activity')} 实时动态 <span class="card-sub">Agent 最近动作</span></div><button class="btn" data-go="social">查看全部</button></div>
      <div class="card-body">
        <ul class="feed">
          <li><div class="feed-ic up">${icon('flame')}</div><div class="feed-txt"><b>YouTube 爆款视频触发高热信号</b><span>播放量 242 万，7 日增速 +342%，已标记「强信号」</span></div><div class="feed-time">2 分钟前</div></li>
          <li><div class="feed-ic info">${icon('search')}</div><div class="feed-txt"><b>电商热搜词「便携咖啡机」上涨 280%</b><span>关联商品数 1,284，价格带 ¥50–150 集中度最高</span></div><div class="feed-time">8 分钟前</div></li>
          <li><div class="feed-ic down">${icon('scan-search')}</div><div class="feed-txt"><b>评论聚类完成：识别 5 类核心痛点</b><span>清洗困难 32%、容易漏水 24%，合计占比 56%</span></div><div class="feed-time">14 分钟前</div></li>
          <li><div class="feed-ic">${icon('sparkles')}</div><div class="feed-txt"><b>决策引擎输出推荐品类</b><span>便携折叠手冲咖啡套装，置信度 87%</span></div><div class="feed-time">21 分钟前</div></li>
          <li><div class="feed-ic down">${icon('check')}</div><div class="feed-txt"><b>已完成 5 家 1688 供应商比价</b><span>最优候选：永康市晨光工贸，综合推荐指数 94</span></div><div class="feed-time">26 分钟前</div></li>
        </ul>
      </div>
    </section>

    <section class="card">
      <div class="card-head"><div class="card-title">${icon('database')} 数据源状态</div><span class="tag ${apiState.online?'down':'warn'}" id="sourceModeTag">${apiState.online?'代理已连接':'演示模式'}</span></div>
      <div class="card-body" style="padding-top:8px;padding-bottom:8px" id="sourceStatusList">
        ${renderSourceStatus()}
      </div>
    </section>
  </div>`;
}

function renderSocial(){
  const shown = state.platform==='全部' ? DATA.signals : DATA.signals.filter(s=>s.platform===state.platform);
  return `
  <div class="page-head">
    <div><h1>舆论监控</h1><p>从 YouTube、Twitter、TikTok 与新闻中捕捉「突发热卖」前置信号，识别内容驱动的品类机会。</p></div>
    <div class="head-actions">
      <div class="chip-row">${['全部','YouTube','Twitter','TikTok','新闻资讯'].map(p=>`<button class="chip ${state.platform===p?'active':''}" data-platform="${p}">${p}</button>`).join('')}</div>
      <button class="btn" id="fetchNews">${icon('globe')} 抓取实时新闻</button>
      <button class="btn" id="rescan">${icon('refresh-cw')} 重新扫描</button>
    </div>
  </div>

  <div id="liveNewsBox"></div>
  <div id="liveSocialBox"></div>

  <section class="card" style="margin-bottom:16px">
    <div class="card-head"><div class="card-title">${icon('trending-up')} 关键词热度趋势 <span class="card-sub">归一化热度指数 · 近 7 天</span></div><span class="tag up">4 个关键词同步走强</span></div>
    <div class="card-body"><div class="chart-box"><canvas id="trendChart"></canvas></div></div>
  </section>

  <div class="grid g3" style="margin-bottom:16px">
    ${shown.map(s=>`
      <div class="card signal-card" data-signal="${esc(s.title)}">
        <div class="signal-top"><div class="platform"><i style="background:${s.color}">${s.tag}</i>${s.platform}</div><span class="tag up">${sign(s.growth)}</span></div>
        <h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p>
        <div class="signal-stats"><div><b>${s.views}</b><span>触达规模</span></div><div><b>${s.mention}</b><span>互动量</span></div><div><b>${s.heat}</b><span>热度分</span></div></div>
      </div>`).join('')}
  </div>

  <section class="card">
    <div class="card-head"><div class="card-title">${icon('list-filter')} 信号明细</div><span class="tag">${shown.length} 条信号</span></div>
    <div class="table-wrap"><table>
      <thead><tr><th>来源</th><th>信号内容</th><th>关联关键词</th><th>增速</th><th>热度分</th><th>发现时间</th></tr></thead>
      <tbody>${shown.map(s=>`<tr>
        <td><span class="platform"><i style="background:${s.color}">${s.tag}</i></span></td>
        <td><span class="cell-main">${esc(s.title)}</span></td>
        <td>${esc(s.keyword)}</td>
        <td><span class="tag up">${sign(s.growth)}</span></td>
        <td><div class="bar-cell"><div class="bar-track"><div class="bar-fill up" style="width:${s.heat}%"></div></div><b style="font-size:11.5px">${s.heat}</b></div></td>
        <td class="muted">${s.date}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>`;
}

function renderEcommerce(){
  const maxHeat = Math.max(...DATA.hotWords.map(w=>w.heat));
  return `
  <div class="page-head">
    <div><h1>电商数据</h1><p>监控平台后台热搜词、热卖榜与竞品上架动态，判断需求强度与价格带机会。</p></div>
    <div class="head-actions"><span class="tag info">数据日期：2026-11-25</span><button class="btn" id="rescan">${icon('refresh-cw')} 同步数据</button></div>
  </div>

  <div class="grid g4" style="margin-bottom:16px">
    ${[['热搜词总数','142','本周新增 23','search'],['平均搜索涨幅','+118%','环比上周','trending-up'],['竞品监控数','36','新增上架 4','eye'],['机会价格带','¥80–129','竞争度较低','target']].map(k=>`
      <div class="card kpi"><div class="kpi-top"><span>${k[0]}</span><div class="kpi-icon">${icon(k[3])}</div></div><div class="kpi-val">${k[1]}</div><div class="kpi-foot">${k[2]}</div></div>`).join('')}
  </div>

  <section class="card" style="margin-bottom:16px">
    <div class="card-head"><div class="card-title">${icon('flame')} 热搜词榜单</div><span class="tag up">咖啡器具类目 · 周环比</span></div>
    <div class="table-wrap"><table>
      <thead><tr><th style="width:50px">#</th><th>关键词</th><th>搜索热度</th><th>周涨幅</th><th>关联订单</th><th>竞争度</th></tr></thead>
      <tbody>${DATA.hotWords.map((w,i)=>`<tr>
        <td><span class="rank ${i<3?'top':''}">${i+1}</span></td>
        <td><span class="cell-main">${w.word}</span></td>
        <td><div class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:${w.heat/maxHeat*100}%"></div></div><b style="font-size:11.5px">${w.heat.toLocaleString()}</b></div></td>
        <td>${deltaHtml(w.growth)}</td><td>${w.orders}</td>
        <td><span class="tag ${w.diff==='低'?'down':w.diff==='高'?'up':'warn'}">${w.diff}</span></td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <div class="grid g2" style="margin-bottom:16px">
    <section class="card">
      <div class="card-head"><div class="card-title">${icon('package')} 热卖商品</div><span class="card-sub">按月销量排序</span></div>
      <div class="card-body">
        ${DATA.hotProducts.map(p=>`<div class="source-row"><div class="source-logo" style="background:#eef2ff;color:#4f46e5;font-size:17px">${p.img}</div><div><b>${p.name}</b><small>${p.price} · 评分 ${p.rating} · ${p.sales}</small></div><span class="tag up">${sign(p.growth)}</span></div>`).join('')}
      </div>
    </section>
    <section class="card">
      <div class="card-head"><div class="card-title">${icon('pie-chart')} 竞品价格带分布</div><span class="card-sub">在售商品数量占比 %</span></div>
      <div class="card-body"><div class="chart-box sm"><canvas id="priceChart"></canvas></div></div>
    </section>
  </div>

  <section class="card">
    <div class="card-head"><div class="card-title">${icon('store')} 竞品在卖什么</div><span class="tag">监控 36 个竞品</span></div>
    <div class="table-wrap"><table>
      <thead><tr><th>品牌 / 店铺</th><th>主推商品</th><th>售价</th><th>月销</th><th>评分</th><th>核心卖点</th><th>评价数</th></tr></thead>
      <tbody>${DATA.competitors.map(c=>`<tr>
        <td><span class="cell-main">${c.brand}</span></td><td>${c.product}</td><td><b>${c.price}</b></td><td>${c.sales}</td>
        <td><span class="stars-mini">★</span> ${c.rating}</td><td class="muted">${c.selling}</td><td class="muted">${c.reviews}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>`;
}

function renderReviews(){
  const filtered = state.painFilter==='全部' ? DATA.reviews : DATA.reviews.filter(r=>r.tags.includes(state.painFilter));
  return `
  <div class="page-head">
    <div><h1>评论挖掘</h1><p>从商品评论区提取差评与高频抱怨，把「用户不满」转化为产品的差异化机会。</p></div>
    <div class="head-actions"><span class="tag warn">已分析 1,286 条评论</span><button class="btn" id="rescan">${icon('refresh-cw')} 重新抓取</button></div>
  </div>

  <div class="grid g-23" style="margin-bottom:16px">
    <section class="card">
      <div class="card-head"><div class="card-title">${icon('chart-pie')} 差评痛点分布</div></div>
      <div class="card-body"><div class="chart-box"><canvas id="painChart"></canvas></div></div>
    </section>
    <section class="card">
      <div class="card-head"><div class="card-title">${icon('bar-chart-3')} 痛点强度</div><span class="card-sub">占全部差评比例</span></div>
      <div class="card-body">
        ${DATA.pains.map(p=>`<div class="pain-item"><div class="pain-label">${p.label}</div><div class="pain-track"><div class="pain-fill" style="width:${p.value*2.6}%;background:${p.color}"></div></div><div class="pain-val" style="color:${p.color}">${p.value}%</div></div>`).join('')}
        <div class="insight" style="margin-top:20px"><b>✦ Agent 洞察</b><p>「清洗困难」+「容易漏水」合计占差评 56%，是竞品普遍未解决的结构性问题。建议新品把<strong>快拆滤杯</strong>与<strong>硅胶密封</strong>作为核心差异点，而非继续堆砌价格或容量参数。</p></div>
      </div>
    </section>
  </div>

  <div class="grid g-32" style="margin-bottom:16px">
    <section class="card">
      <div class="card-head"><div class="card-title">${icon('message-square-text')} 差评原文</div><div class="chip-row">${['全部','清洗困难','容易漏水','体积笨重','研磨不均'].map(p=>`<button class="chip ${state.painFilter===p?'active':''}" data-pain="${p}">${p}</button>`).join('')}</div></div>
      <div class="card-body">
        ${filtered.map(r=>`<div class="review-item"><div class="review-head"><span class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span><span class="src">${r.src}</span><span class="date">${r.date}</span></div><p>${esc(r.text)}</p><div class="review-tags">${r.tags.map(t=>`<span class="tag warn">${t}</span>`).join('')}</div></div>`).join('')}
      </div>
    </section>
    <section class="card">
      <div class="card-head"><div class="card-title">${icon('activity')} 情感走势</div><span class="card-sub">近 7 天正负评价占比 %</span></div>
      <div class="card-body"><div class="chart-box sm"><canvas id="sentimentChart"></canvas></div>
        <div class="note" style="margin-top:14px">负面评价占比从 38% 升至 71%，说明该类目需求在放大，但现有产品体验普遍跟不上 —— 这正是新品的切入窗口。</div>
      </div>
    </section>
  </div>`;
}

function renderDecision(){
  const d = DATA.decision;
  const C = 2*Math.PI*52;
  const offset = C*(1-d.confidence/100);
  return `
  <div class="page-head">
    <div><h1>选品决策</h1><p>综合三路信号，输出品类推荐、评分依据与风险提示。</p></div>
    <div class="head-actions"><span class="tag primary">模型：选品评分 v2.1</span><button class="btn primary" id="rerun">${icon('sparkles')} 重新生成建议</button></div>
  </div>

  <section class="card decision-hero" style="margin-bottom:16px">
    <div class="inner">
      <div class="gauge">
        <svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" stroke-dasharray="${C}" stroke-dashoffset="${offset}"/></svg>
        <div class="gauge-val">${d.confidence}<small>%</small></div>
      </div>
      <div class="decision-info">
        <div class="tag primary" style="margin-bottom:10px">✦ 推荐品类</div>
        <h2>${d.category}</h2>
        <div class="sub">建议定价区间 ¥89–129 · 建议首单 100–200 件小批量验证</div>
        <div class="tags"><span class="tag up">舆论强信号</span><span class="tag info">需求上升期</span><span class="tag down">供应链成熟</span><span class="tag warn">竞争窗口期</span></div>
      </div>
    </div>
  </section>

  <div class="grid g-32" style="margin-bottom:16px">
    <section class="card">
      <div class="card-head"><div class="card-title">${icon('bar-chart-3')} 决策评分拆解</div><span class="card-sub">满分 100</span></div>
      <div class="card-body">
        ${d.scores.map(s=>`<div class="score-row"><div class="score-name">${s.name}</div><div class="score-track"><div class="score-fill" style="width:${s.value}%"></div></div><div class="score-num">${s.value}</div></div>`).join('')}
        <div class="note" style="margin-top:18px">综合得分 = 舆论热度×0.25 + 市场需求×0.25 + 竞争空间×0.2 + 利润空间×0.15 + 供应链成熟×0.15 = <strong>86.0</strong>，高于推荐阈值 75。</div>
      </div>
    </section>
    <section class="card">
      <div class="card-head"><div class="card-title">${icon('triangle-alert')} 风险提示</div><span class="tag warn">3 项</span></div>
      <div class="card-body">${d.risks.map(r=>`<div class="risk-item">${icon('alert-circle')}<span>${r}</span></div>`).join('')}</div>
    </section>
  </div>

  <section class="card">
    <div class="card-head"><div class="card-title">${icon('lightbulb')} 决策依据</div><span class="card-sub">三路数据交叉验证</span></div>
    <div class="card-body"><ul class="reason-list">${d.reasons.map((r,i)=>`<li><span class="idx">${i+1}</span><span>${r}</span></li>`).join('')}</ul></div>
  </section>`;
}

function renderSuppliers(){
  const sorted = [...DATA.suppliers].sort((a,b)=>{
    const av=a[state.sortKey], bv=b[state.sortKey];
    return (typeof av==='number' ? av-bv : String(av).localeCompare(String(bv))) * state.sortDir;
  });
  const cols = [['name','供应商'],['product','商品'],['price','单价 (¥)'],['moq','起订量'],['rating','评分'],['sales','月销量'],['repeat','回头率'],['score','推荐指数']];
  const chosen = DATA.suppliers.filter(s=>state.selected.includes(s.name));
  const bestPrice = chosen.length ? Math.min(...chosen.map(s=>s.price)).toFixed(1) : '—';
  return `
  <div class="page-head">
    <div><h1>1688 供应商比价</h1><p>围绕推荐品类对比价格、商品、评价与履约能力，勾选候选供应商后生成上架草稿。</p></div>
    <div class="head-actions"><a class="btn" href="https://www.1688.com/zw/hamlet.html?scene=6&cosite=bingjj_pz" target="_blank" rel="noopener">${icon('external-link')} 打开 1688 会场</a><button class="btn primary" id="toListing">${icon('package-check')} 生成上架草稿</button></div>
  </div>

  <div class="sel-bar"><b>${icon('check-circle-2')} 已选择 ${chosen.length} 家供应商</b><span>${chosen.length? chosen.map(s=>s.name).join(' · ') : '尚未选择'}　|　最优报价 ${chosen.length?'¥'+bestPrice:'—'}</span></div>

  <section class="card">
    <div class="card-head"><div class="card-title">${icon('factory')} 供应商对比 <span class="card-sub">点击表头可排序</span></div><span class="tag">共 ${DATA.suppliers.length} 家候选</span></div>
    <div class="table-wrap"><table>
      <thead><tr><th style="width:36px"></th>${cols.map(c=>`<th class="sortable" data-sort="${c[0]}">${c[1]} ${state.sortKey===c[0]?(state.sortDir===1?'↑':'↓'):''}</th>`).join('')}<th>标签</th></tr></thead>
      <tbody>${sorted.map(s=>`<tr>
        <td><input type="checkbox" class="supplier-check" data-name="${esc(s.name)}" ${state.selected.includes(s.name)?'checked':''}></td>
        <td><span class="cell-main">${s.name}</span><span class="cell-sub">${s.location}</span></td>
        <td>${s.product}<span class="cell-sub">${s.note}</span></td>
        <td><b style="color:var(--up);font-size:14px">¥${s.price.toFixed(1)}</b></td>
        <td>${s.moq} 件</td>
        <td><span class="stars-mini">★</span> ${s.rating}</td>
        <td>${s.sales}</td>
        <td>${s.repeat}%</td>
        <td><span class="recommend-badge">${state.sortKey==='score'&&s.score===Math.max(...DATA.suppliers.map(x=>x.score))?'✦ 最优 ':''}${s.score}</span></td>
        <td>${s.tags.map(t=>`<span class="tag" style="margin:1px">${t}</span>`).join('')}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <div class="grid g3" style="margin-top:16px">
    ${[['最低拿货价','¥26.8','中山小榄精工五金厂'],['最高评分','4.9','宁波海曙拓远户外用品'],['最高回头率','35%','宁波海曙拓远户外用品']].map(k=>`
      <div class="card kpi"><div class="kpi-top"><span>${k[0]}</span><div class="kpi-icon">${icon('badge-check')}</div></div><div class="kpi-val">${k[1]}</div><div class="kpi-foot">${k[2]}</div></div>`).join('')}
  </div>`;
}

function doneCount(){ return 4 + (state.checklist.media.done?1:0) + (state.checklist.stock.done?1:0); }
function allDone(){ return doneCount()===6; }

function renderListing(){
  const l = DATA.listing;
  const revenue = l.price - l.cost - l.shipping - l.price*l.feeRate;
  const margin = (revenue/l.price*100).toFixed(1);
  return `
  <div class="page-head">
    <div><h1>上架草稿</h1><p>基于痛点与比价结果自动生成的商品文案，可直接复制到自己的平台。</p></div>
    <div class="head-actions"><button class="btn" id="copyListing">${icon('copy')} 复制文案</button><button class="btn primary" id="publish">${icon('send')} 提交上架</button></div>
  </div>

  <div class="grid g-32">
    <section class="card">
      <div class="card-head"><div class="card-title">${icon('file-text')} 商品详情草稿</div><span class="tag down">AI 生成 · 可编辑</span></div>
      <div class="card-body">
        <div class="listing-preview">
          <h2 class="listing-title" contenteditable="true">${esc(l.title)}</h2>
          <ul class="bullet-list">${l.bullets.map(b=>`<li>${icon('check-circle-2')}<span contenteditable="true">${esc(b)}</span></li>`).join('')}</ul>
          <div class="listing-desc" contenteditable="true">${esc(l.desc)}</div>
        </div>
      </div>
    </section>

    <div>
      <section class="card" style="margin-bottom:16px">
        <div class="card-head"><div class="card-title">${icon('calculator')} 定价与利润测算</div></div>
        <div class="card-body">
          <div class="price-block">
            <div><span>拿货成本</span><b><small>¥</small>${l.cost}</b></div>
            <div><span>建议售价</span><b><small>¥</small>${l.price}</b></div>
            <div><span>单件净利</span><b style="color:var(--down)"><small>¥</small>${revenue.toFixed(1)}</b></div>
            <div><span>毛利率</span><b style="color:var(--down)">${margin}%</b></div>
          </div>
          <div class="note" style="margin-top:14px">已计入平台佣金 ${l.feeRate*100}% 与估算运费 ¥${l.shipping}。实际利润随销量与快递议价浮动。</div>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><div class="card-title">${icon('check-check')} 上架检查清单</div><span class="tag ${allDone()?'down':'warn'}" id="checkProgress">${doneCount()}/6 已完成</span></div>
        <div class="card-body">
          ${[
            ['品类与舆情信号匹配','通过',null],['定价落在机会价格带','通过',null],['供应商资质与评价达标','通过',null],['核心卖点覆盖 Top2 差评痛点','通过',null],
            ['商品主图 / 视频素材', state.checklist.media.done?'已补充':'待补充','media'],['库存与发货时效确认', state.checklist.stock.done?'已补充':'待补充','stock']
          ].map(x=>`
            <div class="source-row ${x[2]?'check-row':''}" ${x[2]?`data-check="${x[2]}" role="button" tabindex="0" title="点击补充${x[0]}"`:''}>
              <div class="feed-ic ${x[1]==='待补充'?'warn':'down'}" style="width:24px;height:24px">${icon(x[1]==='待补充'?'clock':'check')}</div>
              <div><b style="font-size:12px">${x[0]}</b>${x[2]&&state.checklist[x[2]].value?`<small>${esc(state.checklist[x[2]].value)}</small>`:''}</div>
              <span class="tag ${x[1]==='待补充'?'warn':'down'}">${x[1]}</span>
            </div>`).join('')}
        </div>
      </section>
    </div>
  </div>`;
}

/* ---------------- render / routing ---------------- */
const RENDERERS = { overview:renderOverview, social:renderSocial, ecommerce:renderEcommerce, reviews:renderReviews, decision:renderDecision, suppliers:renderSuppliers, listing:renderListing };

function render(){
  clearCharts();
  $('#app').innerHTML = RENDERERS[state.section]();
  $('#crumb').textContent = SECTION_TITLE[state.section];
  $$('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.section===state.section));
  refreshIcons();
  bindSectionEvents();
  initCharts();
  if(apiState.live && (state.section==='overview'||state.section==='social')) renderLivePanel();
  window.scrollTo({top:0,behavior:'smooth'});
}

function initCharts(){
  if(!window.Chart) return;
  const gridColor = '#eef1f6', tickColor = '#98a3b3';
  if(state.section==='social'){
    mkChart('trendChart',{type:'line',data:{labels:trendLabels,datasets:DATA.trendSeries.map(s=>({label:s.label,data:s.data,borderColor:s.color,backgroundColor:s.color+'18',borderWidth:2.2,tension:.38,pointRadius:3,pointHoverRadius:5,fill:false}))},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom',labels:{boxWidth:8,boxHeight:8,usePointStyle:true,pointStyle:'circle',padding:16}}},scales:{y:{beginAtZero:true,grid:{color:gridColor},ticks:{color:tickColor}},x:{grid:{display:false},ticks:{color:tickColor}}}}});
  }
  if(state.section==='ecommerce'){
    mkChart('priceChart',{type:'bar',data:{labels:DATA.priceDist.labels,datasets:[{data:DATA.priceDist.data,backgroundColor:['#c7cbf0','#a5a9ea','#4f46e5','#8b83ee','#c7cbf0','#dfe1f5'],borderRadius:6,barPercentage:.68}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:gridColor},ticks:{color:tickColor,callback:v=>v+'%'}},x:{grid:{display:false},ticks:{color:tickColor}}}}});
  }
  if(state.section==='reviews'){
    mkChart('painChart',{type:'doughnut',data:{labels:DATA.pains.map(p=>p.label),datasets:[{data:DATA.pains.map(p=>p.value),backgroundColor:DATA.pains.map(p=>p.color),borderWidth:2,borderColor:'#fff',hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:false,cutout:'64%',plugins:{legend:{position:'bottom',labels:{boxWidth:8,boxHeight:8,usePointStyle:true,pointStyle:'circle',padding:12}}}}});
    mkChart('sentimentChart',{type:'line',data:{labels:DATA.sentiment.labels,datasets:[{label:'负面',data:DATA.sentiment.neg,borderColor:'#e5484d',backgroundColor:'#e5484d18',borderWidth:2.2,tension:.38,fill:true},{label:'正面',data:DATA.sentiment.pos,borderColor:'#16a06a',backgroundColor:'#16a06a18',borderWidth:2.2,tension:.38,fill:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:8,boxHeight:8,usePointStyle:true,pointStyle:'circle'}}},scales:{y:{beginAtZero:true,max:100,grid:{color:gridColor},ticks:{color:tickColor,callback:v=>v+'%'}},x:{grid:{display:false},ticks:{color:tickColor}}}}});
  }
}

/* ---------------- events ---------------- */
function bindSectionEvents(){
  $$('.chip[data-platform]').forEach(b=>b.onclick=()=>{ state.platform=b.dataset.platform; render(); });
  $$('.chip[data-pain]').forEach(b=>b.onclick=()=>{ state.painFilter=b.dataset.pain; render(); });
  $$('th.sortable').forEach(th=>th.onclick=()=>{ const k=th.dataset.sort; state.sortDir = state.sortKey===k ? -state.sortDir : 1; state.sortKey=k; render(); });
  $$('.supplier-check').forEach(cb=>cb.onchange=()=>{
    const n=cb.dataset.name;
    state.selected = cb.checked ? [...state.selected,n] : state.selected.filter(x=>x!==n);
    render();
  });
  $$('.signal-card').forEach(c=>c.onclick=()=>{ state.section='social'; render(); });
  const go=(el)=>{ if(el.dataset.go){ state.section=el.dataset.go; render(); } };
  $$('[data-go]').forEach(b=>{ b.onclick=()=>go(b); b.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(b); } }; });
  $$('.check-row').forEach(r=>{
    const open=()=>showChecklistModal(r.dataset.check);
    r.onclick=open; r.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } };
  });
  const on = (id,fn)=>{ const el=document.getElementById(id); if(el) el.onclick=fn; };
  on('runPipeline',()=>{
    const btn=$('#runPipeline'); btn.classList.add('loading'); btn.textContent='正在运行流水线…';
    setTimeout(()=>{ btn.classList.remove('loading'); btn.innerHTML=icon('check')+' 流水线已完成'; toast('流水线执行完成：5 个阶段已更新'); setTimeout(()=>{btn.innerHTML=icon('play')+' 运行完整流水线';},1800); },1400);
  });
  on('rescan',()=>{ const btn=$('#rescan'); btn.classList.add('loading'); setTimeout(()=>{ btn.classList.remove('loading'); toast('扫描完成，未发现新的强信号'); },1200); });
  on('rerun',()=>toast('决策引擎已重新计算，结果保持稳定（置信度 87%）'));
  on('toListing',()=>{
    if(!state.selected.length){ toast('请先在表格中勾选至少一家供应商'); return; }
    state.section='listing'; render();
  });
  on('copyListing',()=>{
    const l=DATA.listing; const txt=[l.title,'',...l.bullets.map((b,i)=>(i+1)+'. '+b),'',l.desc].join('\n');
    if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>toast('上架文案已复制到剪贴板')).catch(()=>toast('复制失败，请手动选择文本'));
    else toast('当前环境不支持自动复制');
  });
  on('publish',()=>{
    if(!allDone()){
      const miss=[]; if(!state.checklist.media.done) miss.push('主图/视频素材'); if(!state.checklist.stock.done) miss.push('库存与发货时效');
      toast('还需补充：'+miss.join('、')+'（点击检查清单中的「待补充」项）');
      return;
    }
    toast('检查项全部通过，草稿已提交上架！');
  });
}

$$('.nav-item').forEach(n=>n.onclick=()=>{
  if(n.dataset.chat){ openChat(); return; }
  state.section=n.dataset.section; render();
});
$('#refreshBtn').onclick=()=>{ toast('数据已刷新'); render(); };
$('#settingsBtn').onclick=()=>showSettings();
$('#notifyBtn').onclick=(e)=>{
  e.stopPropagation();
  const old=$('#notifyPop'); if(old){ old.remove(); return; }
  const items=[
    ['flame','YouTube 爆款视频触发强信号','播放量 242 万，7 日增速 +342%'],
    ['search','热搜词「便携咖啡机」上涨 280%','已进入机会价格带 ¥89–129'],
    ['message-square','差评聚类完成：识别 5 类痛点','清洗难 32% + 漏水 24%']
  ];
  const pop=document.createElement('div');
  pop.id='notifyPop';
  pop.innerHTML=`<div class="notify-head">通知 <span>3 条未读</span></div>${items.map(x=>`<div class="notify-item"><div class="feed-ic info" style="width:26px;height:26px">${icon(x[0])}</div><div><b>${x[1]}</b><small>${x[2]}</small></div></div>`).join('')}`;
  document.body.appendChild(pop); refreshIcons();
  const r=$('#notifyBtn').getBoundingClientRect();
  pop.style.top=(r.bottom+8)+'px'; pop.style.right=Math.max(8,window.innerWidth-r.right)+'px';
};
document.addEventListener('click',e=>{ if(!e.target.closest('#notifyPop')&&!e.target.closest('#notifyBtn')){ const p=$('#notifyPop'); if(p) p.remove(); } });

function showChecklistModal(kind){
  const cfg = {
    media:{ title:'补充商品主图 / 视频素材', label:'素材链接或说明', ph:'例如：主图 5 张，白底 + 场景图；视频 30s 展示折叠与防漏测试', val:state.checklist.media.value },
    stock:{ title:'确认库存与发货时效', label:'库存与发货信息', ph:'例如：现货 500 件，48 小时内发货，支持一件代发', val:state.checklist.stock.value }
  }[kind];
  const bd=$('#modalBackdrop');
  bd.innerHTML=`<div class="modal">
    <div class="modal-head"><h3>${icon(kind==='media'?'image':'package')} ${cfg.title}</h3><button class="icon-btn" id="closeCheck">${icon('x')}</button></div>
    <div class="modal-body">
      <div class="note" style="margin:0 0 14px">填写后该项将标记为「已补充」，上架检查清单进度自动更新。</div>
      <div class="field"><label>${cfg.label}</label><textarea id="checkInput" rows="4" style="width:100%;resize:vertical;padding:10px 12px;border:1px solid var(--border);border-radius:9px;font-family:inherit;font-size:12.5px;line-height:1.6">${esc(cfg.val)}</textarea></div>
    </div>
    <div class="modal-foot">
      ${state.checklist[kind].done?`<button class="btn" id="clearCheck">清除</button>`:''}
      <button class="btn" id="cancelCheck">取消</button>
      <button class="btn primary" id="saveCheck">保存并标记完成</button>
    </div>
  </div>`;
  bd.classList.add('show'); refreshIcons();
  const close=()=>bd.classList.remove('show');
  $('#closeCheck').onclick=$('#cancelCheck').onclick=close;
  bd.onclick=e=>{ if(e.target===bd) close(); };
  $('#saveCheck').onclick=()=>{
    const v=$('#checkInput').value.trim();
    if(!v){ toast('请先填写内容'); return; }
    state.checklist[kind]={ done:true, value:v };
    close(); render(); toast('已补充，检查清单进度更新');
  };
  const clr=$('#clearCheck'); if(clr) clr.onclick=()=>{ state.checklist[kind]={done:false,value:''}; close(); render(); toast('已清除该项'); };
}

function showSettings(){
  const bd=$('#modalBackdrop');
  const h=apiState.health?.sources||{};
  bd.innerHTML=`<div class="modal">
    <div class="modal-head"><h3>${icon('settings-2')} 数据源接入配置</h3><button class="icon-btn" id="closeModal">${icon('x')}</button></div>
    <div class="modal-body">
      <div class="note" style="margin:0 0 16px">${apiState.online
        ? `已连接本地代理服务 <strong>${API_BASE}</strong>。密钥只保存在服务端 <code>.env.local.json</code>，不会下发到浏览器。`
        : '<strong>当前未启动代理服务</strong>，只能使用演示数据。在项目目录运行 <code>node server.js</code> 后刷新页面，即可填入密钥接入真实数据。'}</div>

      <div class="cfg-section"><b>① 舆论监控</b></div>
      <div class="field"><label>Bing News RSS · 公开源，无需密钥</label><div class="cfg-line"><span class="tag down">自动可用</span><span class="muted" style="font-size:11px">实时新闻抓取已启用</span></div></div>
      <div class="field"><label>YouTube Data API v3 Key ${h.youtube?.configured?'<span class="tag down">已配置</span>':''}</label><input id="cfgYoutube" type="password" placeholder="AIzaSy...（留空则保持原值）"></div>
      <div class="field"><label>Twitter API v2 Bearer Token ${h.twitter?.configured?'<span class="tag down">已配置</span>':''}</label><input id="cfgTwitter" type="password" placeholder="AAAAAAAA...（留空则保持原值）"></div>

      <div class="cfg-section"><b>② AI 对话 / 决策引擎 <span class="tag down">已免密钥</span></b></div>
      <div class="note" style="margin-bottom:12px">AI 助手现在使用<strong>免密钥的公共模型</strong>，无需任何配置即可对话。只有当你想换成自己的模型时，才需要填下面的密钥（可选）。</div>
      <div class="field"><label>接口地址（可选，OpenAI 兼容）</label><input id="cfgLlmBase" value="${esc(apiState.llmBase||'https://api.openai.com/v1')}" placeholder="https://api.deepseek.com/v1"></div>
      <div class="field"><label>模型名称</label><input id="cfgLlmModel" value="${esc(apiState.llmModel||'gpt-4o-mini')}" placeholder="deepseek-chat / gpt-4o-mini"></div>
      <div class="field"><label>API Key ${h.llm?.configured?'<span class="tag down">已配置</span>':''}</label><input id="cfgLlmKey" type="password" placeholder="sk-...（留空则保持原值）"></div>
      <div class="note">支持任何 OpenAI 兼容接口：DeepSeek、通义千问、Kimi、智谱、OpenAI 等。填入后对话助手将改用真实大模型，并自动带上三路选品数据作为上下文。</div>

      <div class="cfg-section"><b>③ 暂无个人开放 API 的数据源</b></div>
      <div class="note" style="line-height:1.9">电商后台热搜词 / 商品评论 / 1688 比价这三路，平台没有面向个人的公开 API。可行路径：<br>
      • <strong>电商数据</strong>：申请淘宝/京东开放平台（需企业资质），或用第三方数据服务导出后导入；<br>
      • <strong>评论挖掘</strong>：用开放平台商品评价接口，或合规采集工具导出 CSV；<br>
      • <strong>1688</strong>：无公开 API，页面已提供会场跳转，可结合人工/第三方工具比价。</div>
    </div>
    <div class="modal-foot"><button class="btn" id="closeModal2">取消</button><button class="btn primary" id="saveCfg" ${apiState.online?'':'disabled style="opacity:.5"'}>保存配置</button></div>
  </div>`;
  bd.classList.add('show'); refreshIcons();
  const close=()=>bd.classList.remove('show');
  $('#closeModal').onclick=$('#closeModal2').onclick=close;
  bd.onclick=e=>{ if(e.target===bd) close(); };
  if(apiState.online) $('#saveCfg').onclick=async()=>{
    const payload={ youtube:$('#cfgYoutube').value, twitter:$('#cfgTwitter').value,
      llm:{ baseUrl:$('#cfgLlmBase').value, model:$('#cfgLlmModel').value, key:$('#cfgLlmKey').value } };
    try{
      const r=await fetch(API_BASE+'/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const d=await r.json();
      if(d.ok){ apiState.health=d.health; syncLlmMeta(); close(); toast('配置已保存到服务端'); render(); }
      else toast('保存失败：'+(d.error||'未知错误'));
    }catch(e){ toast('保存失败：'+e.message); }
  };
}

/* ---------------- AI chat assistant ---------------- */
const CHAT_RULES = [
  {
    test:/卖什么|选品|品类|推荐|做什么|选哪个|卖啥/,
    reply:()=>`根据三路数据交叉验证，我推荐 <b>${DATA.decision.category}</b>，置信度 <b>${DATA.decision.confidence}%</b>。<ul class="mini-list"><li>舆论：爆款视频 242 万播放，话题周涨 520%</li><li>电商：热搜词「便携咖啡机」周涨 280%</li><li>评论：56% 差评集中在清洗难与漏水</li></ul>建议定价 ¥89–129，首单 100–200 件试销。`,
    jump:{label:'查看选品决策',to:'decision'}
  },
  {
    test:/痛点|差评|抱怨|不满|用户要|问题/,
    reply:()=>`差评里最突出的两个痛点是 <b>清洗困难（32%）</b> 和 <b>容易漏水（24%）</b>，合计 56%。其次是体积笨重（18%）、研磨不均（14%）、配件易丢（12%）。<br>这说明竞品普遍没解决结构性问题 —— 新品用「快拆 + 硅胶密封」就能形成差异。`,
    jump:{label:'查看评论挖掘',to:'reviews'}
  },
  {
    test:/供应商|性价比|价格|拿货|成本|1688|哪家|进货|报价/,
    reply:()=>`综合推荐 <b>永康市晨光工贸</b>（推荐指数 94）：单价 ¥32.5、起订 50 件、评分 4.8、回头率 28%，而且它的快拆结构正好对应差评痛点。<br>如果更看重口碑，可选 <b>宁波海曙拓远</b>（评分 4.9、回头率 35%，¥38.9）。`,
    jump:{label:'查看供应商比价',to:'suppliers'}
  },
  {
    test:/风险|注意|坑|隐患|缺点|谨慎/,
    reply:()=>`主要有 3 个风险：<ul class="mini-list">${DATA.decision.risks.map(r=>`<li>${r}</li>`).join('')}</ul>结论：热度由短视频驱动，建议小批量快跑、观察 2–4 周再决定是否加量。`,
    jump:{label:'查看风险提示',to:'decision'}
  },
  {
    test:/舆论|社媒| youtube|twitter|tiktok|视频|话题|爆款|热度|趋势|信号/i,
    reply:()=>`舆论端目前有 <b>5 条强信号</b>：YouTube 露营咖啡视频 242 万播放（+342%）、Twitter #CampingCoffee 周涨 520%、TikTok 相关视频 890 万播放。四个关键词近 7 天同步走强，属于内容驱动的突发机会。`,
    jump:{label:'查看舆论监控',to:'social'}
  },
  {
    test:/电商|热搜|竞品|销量|榜单|关键词|搜索/,
    reply:()=>`电商端热搜词「便携咖啡机」热度 9820、周涨 <b>280%</b>，关联订单 2.4 万。竞品价格集中在 ¥79–259，其中 ¥80–120 占 34% 但竞争度中等，<b>¥89–129 是机会价格带</b>。`,
    jump:{label:'查看电商数据',to:'ecommerce'}
  },
  {
    test:/上架|文案|标题|定价|利润|毛利|赚/,
    reply:()=>`上架草稿已生成：建议售价 <b>¥99</b>，扣除拿货 ¥32.5、运费 ¥6.5、佣金 6% 后，单件净利约 <b>¥53.6</b>，毛利率 <b>54%</b>。标题与 5 条卖点都围绕「易清洗 + 不漏水」展开。`,
    jump:{label:'查看上架草稿',to:'listing'}
  },
  {
    test:/依据|为什么|理由|怎么判断|如何决策|逻辑/,
    reply:()=>`决策逻辑是把三路信号交叉验证：<ul class="mini-list">${DATA.decision.scores.map(s=>`<li>${s.name}：${s.value} 分</li>`).join('')}</ul>加权综合 86 分，高于推荐阈值 75，所以给出「建议试销」结论，而不是「观望」。`,
    jump:{label:'查看评分拆解',to:'decision'}
  },
  {
    test:/你好|hi|hello|嗨|在吗|你是谁|能做什么/i,
    reply:()=>`你好！我是基于当前三路监控数据和 1688 比价结果的选品助手。你可以直接问我：<ul class="mini-list"><li>现在该卖什么品类？</li><li>差评里最大的痛点是什么？</li><li>哪家供应商性价比最高？</li><li>这个品类有哪些风险？</li></ul>也可以问我定价、利润、竞品等任何问题。`,
    jump:null
  }
];

function getChatReply(q){
  const rule = CHAT_RULES.find(r=>r.test.test(q));
  if(rule) return {html:rule.reply(), jump:rule.jump};
  return {
    html:`这个问题我目前的三路数据里没有直接答案。不过我可以帮你分析<b>品类推荐、差评痛点、供应商比价、风险判断、定价利润</b>这几类问题 —— 换个说法试试？`,
    jump:{label:'回到总览',to:'overview'}
  };
}

function pushChat(role, html){
  const box=$('#chatMessages');
  const el=document.createElement('div');
  el.className='chat-msg from-'+(role==='user'?'user':'ai');
  if(role==='user'){
    el.innerHTML=`<div class="m-avatar">${icon('user')}</div><div class="chat-bubble">${esc(html)}</div>`;
  }else{
    el.innerHTML=`<div class="m-avatar">${icon('sparkles')}</div><div class="chat-bubble">${html}</div>`;
  }
  box.appendChild(el);
  refreshIcons();
  box.scrollTop=box.scrollHeight;
  return el;
}

function sendChat(q){
  q=(q||'').trim(); if(!q) return;
  pushChat('user',q);
  $('#chatInput').value='';
  const typing=pushChat('ai','<div class="typing"><i></i><i></i><i></i></div>');
  const finish=(html,jump)=>{
    let content=html;
    if(jump) content+=`<br><button class="jump-btn" data-jump="${jump.to}">${icon('arrow-up-right')} ${jump.label}</button>`;
    typing.querySelector('.chat-bubble').innerHTML=content;
    refreshIcons();
    $('#chatMessages').scrollTop=$('#chatMessages').scrollHeight;
  };
  // 有真实大模型就走 API，否则降级到规则
  if(apiState.online){
    (async()=>{
      try{
        const r=await fetch(API_BASE+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ messages:[
            { role:'system', content:buildContext() },
            ...chatHistory.slice(-8),
            { role:'user', content:q }
          ]})});
        const d=await r.json();
        if(d.ok){
          chatHistory.push({role:'user',content:q},{role:'assistant',content:d.content});
          finish(esc(d.content).replace(/\n/g,'<br>'), {label:'查看选品决策',to:'decision'});
        }else{
          // 免密钥模型限流时，内置分析无缝接管，不暴露技术报错
          const {html,jump}=getChatReply(q); finish(html,jump);
        }
      }catch(e){ const {html,jump}=getChatReply(q); finish(html,jump); }
    })();
  }else{
    setTimeout(()=>{ const {html,jump}=getChatReply(q); finish(html,jump); },520);
  }
}

function openChat(){
  $('#chatPanel').classList.add('show');
  $('#chatFab').classList.add('hidden');
  if(!$('#chatMessages').dataset.init){
    $('#chatMessages').dataset.init='1';
    pushChat('ai','你好！我是你的<b>智能选品助手</b> ✦ 我已经读完了三路监控数据和 5 家供应商的比价结果，随时可以问我选品相关的任何问题。');
  }
  setTimeout(()=>$('#chatInput').focus(),220);
}
function closeChat(){
  $('#chatPanel').classList.remove('show');
  $('#chatFab').classList.remove('hidden');
}

$('#chatFab').onclick=openChat;
$('#chatClose').onclick=closeChat;
$('#chatSend').onclick=()=>sendChat($('#chatInput').value);
$('#chatInput').onkeydown=e=>{ if(e.key==='Enter') sendChat(e.target.value); };
$$('.chat-quick .chip').forEach(b=>b.onclick=()=>sendChat(b.dataset.q));
$('#chatMessages').onclick=e=>{
  const btn=e.target.closest('[data-jump]');
  if(btn){ const to=btn.dataset.jump; closeChat(); state.section=to; render(); }
};

/* ---------------- real API integration ---------------- */
const API_BASE = (location.protocol==='http:'||location.protocol==='https:') ? '' : 'http://localhost:8787';
const apiState = { online:false, health:null, news:[], llmBase:'', llmModel:'' };
const chatHistory = [];

function buildContext(){
  const d=DATA.decision;
  return `你是电商智能选品助手。当前系统分析结果（数据截至 2026-11-25）：
推荐品类：${d.category}，置信度 ${d.confidence}%。
决策评分：${d.scores.map(s=>s.name+' '+s.value).join('，')}。
三路信号：①舆论——YouTube 露营咖啡视频 242 万播放、Twitter #CampingCoffee 周涨 520%、TikTok 890 万播放；②电商——热搜词「便携咖啡机」周涨 280%，竞品价格 ¥79–259，机会带 ¥89–129；③评论——清洗困难 32%、漏水 24% 为核心痛点。
供应商：永康晨光 ¥32.5/起订50/评分4.8（推荐指数94）；宁波拓远 ¥38.9/评分4.9。
建议售价 ¥99，毛利率约 54%。
请基于以上数据简洁专业地回答用户问题，用中文，不要编造数据。`;
}
function syncLlmMeta(){ /* 模型配置由配置弹窗管理 */ }
const SOURCE_KEY_MAP = { YT:'youtube', TW:'twitter', TT:'youtube', NE:'news', EC:'ecommerce', CM:'reviews', '1688':'supplier1688' };
function renderSourceStatus(){
  const h=apiState.health?.sources||{};
  return DATA_SOURCES.map(s=>{
    const info = h[SOURCE_KEY_MAP[s.key]] || {};
    let tag, cls;
    if(!apiState.online){ tag='演示模式'; cls='status'; }
    else if(info.kind==='free'||info.kind==='public'){ tag='已接通'; cls='status ok'; }
    else if(info.kind==='link'){ tag='会场跳转'; cls='status ok'; }
    else if(info.configured){ tag='已连接'; cls='status ok'; }
    else if(info.kind==='manual'){ tag='需人工'; cls='status'; }
    else { tag='需密钥'; cls='status'; }
    const note = info.note || s.note;
    return `<div class="source-row"><div class="source-logo" style="background:${s.key==='TW'?'#1d9bf0':s.key==='YT'?'#e33':s.key==='1688'?'#ff6a00':'#5b54f0'}">${s.key.slice(0,2)}</div><div><b>${s.name}</b><small>${esc(note)}</small></div><span class="${cls}">${tag}</span></div>`;
  }).join('');
}
async function probeHealth(){
  try{
    const r=await fetch(API_BASE+'/api/health',{signal:AbortSignal.timeout(3500)});
    const d=await r.json();
    if(d.ok){ apiState.online=true; apiState.health=d; }
  }catch{ apiState.online=false; }
}

async function fetchNews(query='camping coffee'){
  const box=$('#liveNewsBox'); if(!box) return;
  if(!apiState.online){
    box.innerHTML=`<div class="card" style="margin-bottom:16px;border-color:#f8dfb5;background:var(--warn-soft)"><div class="card-body" style="padding:14px 18px;font-size:12.5px;color:#8a641f">未连接代理服务，无法抓取实时新闻。在项目目录运行 <code>node server.js</code> 后刷新页面即可使用。</div></div>`;
    return;
  }
  box.innerHTML=`<div class="card" style="margin-bottom:16px"><div class="card-body" style="padding:16px"><div class="typing"><i></i><i></i><i></i></div></div></div>`;
  try{
    const r=await fetch(API_BASE+'/api/news?q='+encodeURIComponent(query));
    const d=await r.json();
    if(!d.ok) throw new Error(d.error);
    apiState.news=d.items;
    box.innerHTML=`<section class="card" style="margin-bottom:16px;border-color:#cdeede">
      <div class="card-head"><div class="card-title">${icon('globe')} 实时新闻 <span class="card-sub">${esc(d.source)} · 关键词「${esc(query)}」</span></div><span class="tag down">${d.count} 条真实数据</span></div>
      <div class="card-body">${d.items.length? d.items.map(n=>`<div class="source-row"><div class="feed-ic info" style="width:26px;height:26px">${icon('newspaper')}</div><div style="min-width:0"><b style="font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:520px">${esc(n.title)}</b><small>${esc(n.source||'Bing News')} · ${esc((n.pubDate||'').slice(0,22))}</small></div>${n.link?`<a class="btn" style="margin-left:auto;padding:5px 9px;font-size:10.5px" href="${esc(n.link)}" target="_blank" rel="noopener">${icon('external-link')} 原文</a>`:''}</div>`).join('') : '<div class="muted" style="font-size:12px">未抓到相关新闻，换个关键词试试。</div>'}</div>
    </section>`;
    refreshIcons();
    toast('已抓取 '+d.count+' 条实时新闻');
  }catch(e){
    box.innerHTML=`<div class="card" style="margin-bottom:16px;border-color:#f8dfb5;background:var(--warn-soft)"><div class="card-body" style="padding:14px 18px;font-size:12.5px;color:#8a641f">抓取失败：${esc(e.message)}</div></div>`;
  }
}

document.addEventListener('click',e=>{ if(e.target.closest('#fetchNews')) fetchNews('camping coffee'); });

// 统一拉取全部免密钥实时数据
async function pullAllData(){
  if(!apiState.online){ toast('请先启动代理服务：node server.js'); return; }
  const btn=$('#pullAllData'); if(btn){ btn.classList.add('loading'); btn.textContent='正在拉取…'; }
  toast('正在拉取三路实时数据…');
  const endpoints=[
    ['新闻','/api/news?q=camping%20coffee'],
    ['抖音热榜','/api/douyin'],
    ['淘宝热搜词','/api/taobao?q=咖啡'],
    ['百度热搜','/api/baidu']
  ];
  const results={};
  await Promise.all(endpoints.map(async([name,path])=>{
    try{ const r=await fetch(API_BASE+path); results[name]=await r.json(); }
    catch(e){ results[name]={ok:false,error:e.message}; }
  }));
  apiState.live=results;
  renderLivePanel();
  if(btn){ btn.classList.remove('loading'); btn.innerHTML=icon('download')+' 已拉取实时数据'; }
  const ok=Object.values(results).filter(x=>x.ok).length;
  toast(`拉取完成：${ok}/4 个数据源成功`);
}

function renderLivePanel(){
  const box=$('#liveSocialBox')||$('#app');
  const r=apiState.live; if(!r) return;
  const html=`
  <section class="card" style="margin-bottom:16px;border-color:#cdeede">
    <div class="card-head"><div class="card-title">${icon('radio')} 三路实时数据 <span class="card-sub">免密钥公开数据源</span></div><span class="tag down">刚刚更新</span></div>
    <div class="card-body">
      <div class="grid g2">
        ${[['抖音热榜',r['抖音热榜']],['百度热搜',r['百度热搜']]].map(([name,d])=>`
          <div><div style="font-size:12px;font-weight:700;margin-bottom:10px">${icon('flame')} ${name}</div>
          ${d?.ok? `<div style="max-height:190px;overflow:auto">${d.items.slice(0,8).map((x,i)=>`<div class="source-row" style="padding:7px 0"><span class="rank ${i<3?'top':''}">${i+1}</span><b style="font-size:11.5px;flex:1">${esc(x.word)}</b></div>`).join('')}</div>` : `<div class="muted" style="font-size:11px">${esc(d?.error||'失败')}</div>`}</div>
        `).join('')}
      </div>
      <div style="margin-top:18px">
        <div style="font-size:12px;font-weight:700;margin-bottom:10px">${icon('search')} 淘宝实时热搜词 · 咖啡</div>
        ${r['淘宝热搜词']?.ok? `<div class="chip-row">${r['淘宝热搜词'].items.slice(0,12).map(x=>`<span class="tag primary">${esc(x.word)}</span>`).join('')}</div>` : `<div class="muted" style="font-size:11px">${esc(r['淘宝热搜词']?.error||'失败')}</div>`}
      </div>
    </div>
  </section>`;
  if(state.section==='overview'){
    const target=$('#app'); target.insertAdjacentHTML('beforeend',html); refreshIcons();
  }else{
    const b=$('#liveSocialBox'); if(b){ b.innerHTML=html; refreshIcons(); }
  }
}
document.addEventListener('click',e=>{
  if(e.target.closest('#pullAllData')) pullAllData();
  if(e.target.closest('[data-source]')){
    const kind=e.target.closest('[data-source]').dataset.source;
    if(apiState.live?.[kind]) renderLivePanel();
  }
});

probeHealth().then(()=>{ if(state.section==='overview') render(); });

render();
