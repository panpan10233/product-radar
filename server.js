/* =========================================================
   选品雷达 · 后端代理服务（零依赖，Node 18+）
   - 密钥只存服务端 .env.local.json，绝不下发前端
   - 同源托管静态页面，避免 CORS
   - 真实数据源：Bing News RSS / YouTube Data API / Twitter API v2 / OpenAI 兼容大模型
   ========================================================= */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const CONFIG_FILE = path.join(ROOT, '.env.local.json');

const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon'
};

/* ---------- config ---------- */
function loadConfig(){
  try{ return JSON.parse(fs.readFileSync(CONFIG_FILE,'utf8')); }
  catch{ return { youtube:'', twitter:'', llm:{ baseUrl:'https://api.openai.com/v1', key:'', model:'gpt-4o-mini' } }; }
}
function saveConfig(cfg){
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg,null,2), { mode:0o600 });
}
function health(cfg){
  return {
    ok:true,
    sources:{
      news:      { configured:true,  kind:'public',      label:'Bing News RSS',      note:'公开源，无需密钥' },
      youtube:   { configured:!!cfg.youtube, kind:cfg.youtube?'key':'free', label:'YouTube Data API v3', note:cfg.youtube?'已配置密钥':'用公开媒体报道作代理信号' },
      twitter:   { configured:!!cfg.twitter, kind:cfg.twitter?'token':'free', label:'Twitter API v2', note:cfg.twitter?'已配置 Bearer Token':'用公开媒体报道作代理信号' },
      llm:       { configured:true, kind:'free', label:cfg.llm?.key?(cfg.llm?.model||'大模型'):'免密钥模型', note:cfg.llm?.key?'使用你配置的模型':'Pollinations 公共模型，无需密钥' },
      ecommerce: { configured:true, kind:'free', label:'电商平台后台', note:'淘宝搜索建议 + 百度热搜实时数据' },
      reviews:   { configured:true, kind:'free', label:'商品评论接口', note:'基于公开数据的痛点分析（演示样本）' },
      supplier1688:{ configured:true, kind:'link', label:'1688 供应商', note:'会场跳转 + 比价清单导入' }
    }
  };
}

/* ---------- helpers ---------- */
function json(res, code, data){
  res.writeHead(code, { 'Content-Type':'application/json; charset=utf-8', 'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Headers':'Content-Type', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' });
  res.end(JSON.stringify(data));
}
function body(req){
  return new Promise(resolve=>{ let b=''; req.on('data',c=>b+=c); req.on('end',()=>{ try{resolve(JSON.parse(b||'{}'))}catch{resolve({})} }); });
}
async function get(url, headers={}){
  const r = await fetch(url, { headers, signal:AbortSignal.timeout(12000) });
  if(!r.ok) throw new Error('HTTP '+r.status+' '+ (await r.text()).slice(0,200));
  return r.text();
}
function decode(s){
  return String(s||'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/<[^>]+>/g,'').trim();
}
function parseRSS(xml){
  const out=[]; const re=/<item>[\s\S]*?<\/item>/g; let m;
  while((m=re.exec(xml)) && out.length<12){
    const b=m[0];
    const pick=t=>{ const x=b.match(new RegExp('<'+t+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+t+'>')); return x?decode(x[1].replace(/^<!\[CDATA\[|\]\]>$/g,'')):''; };
    out.push({ title:pick('title'), link:pick('link'), pubDate:pick('pubDate'), source:pick('source'), desc:pick('description').slice(0,180) });
  }
  return out;
}

/* ---------- API handlers ---------- */
async function apiNews(u,cfg){
  const q = u.searchParams.get('q') || 'camping coffee';
  // 经 rss2json 代理读取 Bing News RSS（直连会被重定向到首页）
  const rss = `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss`;
  const url = 'https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(rss)+'&count=12';
  try{
    const d = JSON.parse(await get(url, { 'User-Agent':'Mozilla/5.0' }));
    if(d.status!=='ok') throw new Error('RSS 代理返回 '+d.status);
    const items=(d.items||[]).map(x=>({
      title:x.title||'', link:x.link||'', pubDate:x.pubDate||'',
      source:x.author||'Bing News', desc:(x.description||'').replace(/<[^>]+>/g,'').slice(0,180)
    }));
    return { ok:true, source:'Bing News RSS (via rss2json)', query:q, count:items.length, items };
  }catch(e){
    // 回退：直连 RSS（部分网络环境可用）
    try{
      const items=parseRSS(await get(rss,{'User-Agent':'Mozilla/5.0'}));
      if(items.length) return { ok:true, source:'Bing News RSS', query:q, count:items.length, items };
      throw new Error('无结果');
    }catch(e2){ return { ok:false, error:'新闻抓取失败：'+e.message+'；直连回退：'+e2.message }; }
  }
}
async function apiYouTube(u,cfg){
  if(!cfg.youtube) return { ok:false, code:501, error:'未配置 YouTube API Key。请在「数据源配置」中填入 Google Cloud 的 YouTube Data API v3 密钥。' };
  const q=u.searchParams.get('q')||'camping coffee';
  try{
    const url=`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&maxResults=10&q=${encodeURIComponent(q)}&key=${encodeURIComponent(cfg.youtube)}`;
    const d=JSON.parse(await get(url));
    const ids=(d.items||[]).map(x=>x.id.videoId).filter(Boolean).join(',');
    let views={};
    if(ids){
      const vu=`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${encodeURIComponent(cfg.youtube)}`;
      const vd=JSON.parse(await get(vu));
      (vd.items||[]).forEach(x=>views[x.id]=x.statistics?.viewCount||'0');
    }
    return { ok:true, source:'YouTube Data API v3', query:q, items:(d.items||[]).map(x=>({
      title:x.snippet.title, channel:x.snippet.channelTitle, published:x.snippet.publishedAt,
      videoId:x.id.videoId, url:'https://www.youtube.com/watch?v='+x.id.videoId, views:views[x.id.videoId]||'0'
    })) };
  }catch(e){ return { ok:false, error:'YouTube 调用失败：'+e.message }; }
}
async function apiTwitter(u,cfg){
  if(!cfg.twitter) return { ok:false, code:501, error:'未配置 Twitter Bearer Token。Twitter API v2 的 recent search 需要申请（免费层额度有限）。' };
  const q=u.searchParams.get('q')||'camping coffee';
  try{
    const url=`https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(q)}&max_results=20&tweet.fields=created_at,public_metrics,author_id`;
    const d=JSON.parse(await get(url,{ Authorization:'Bearer '+cfg.twitter }));
    return { ok:true, source:'Twitter API v2', query:q, count:d.meta?.result_count||0, items:(d.data||[]).map(x=>({
      text:x.text, created:x.created_at, url:'https://twitter.com/i/web/status/'+x.id,
      likes:x.public_metrics?.like_count||0, retweets:x.public_metrics?.retweet_count||0
    })) };
  }catch(e){ return { ok:false, error:'Twitter 调用失败：'+e.message }; }
}
async function apiDouyin(u){
  try{
    const d=JSON.parse(await get('https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/',{'User-Agent':'Mozilla/5.0'}));
    const items=(d.word_list||[]).slice(0,12).map(x=>({ word:x.word, hot:x.hot_value||0,
      url:'https://www.douyin.com/search/'+encodeURIComponent(x.word) }));
    return { ok:true, source:'抖音热榜', count:items.length, items };
  }catch(e){ return { ok:false, error:'抖音热榜获取失败：'+e.message }; }
}
async function apiTaobao(u){
  const q=u.searchParams.get('q')||'咖啡';
  try{
    const d=JSON.parse(await get('https://suggest.taobao.com/sug?code=utf-8&q='+encodeURIComponent(q),{'User-Agent':'Mozilla/5.0','Referer':'https://s.taobao.com/'}));
    const items=(d.result||[]).map(x=>({ word:x[0], weight:Number(x[1])||0,
      url:'https://s.taobao.com/search?q='+encodeURIComponent(x[0]) }));
    return { ok:true, source:'淘宝搜索建议', query:q, count:items.length, items };
  }catch(e){ return { ok:false, error:'淘宝建议获取失败：'+e.message }; }
}
async function apiBaidu(u){
  try{
    const d=JSON.parse(await get('https://top.baidu.com/api/board?platform=pc&tab=realtime',{'User-Agent':'Mozilla/5.0'}));
    const cards=d.data?.cards||[];
    const items=[];
    cards.forEach(c=>(c.content||[]).forEach(x=>items.push({ word:x.word, url:x.url||x.appUrl||'', hot:x.hotScore||'' })));
    return { ok:true, source:'百度热搜', count:Math.min(items.length,15), items:items.slice(0,15) };
  }catch(e){ return { ok:false, error:'百度热搜获取失败：'+e.message }; }
}
// 用 Bing News 搜索替代社媒信号（YouTube/Twitter 无免密钥 API，用公开报道作代理信号）
async function apiSocial(u){
  const platform=u.searchParams.get('platform')||'youtube';
  const qMap={ youtube:'youtube camping coffee viral video', twitter:'twitter camping coffee trending' };
  const r=await apiNews(new URL('http://x/?q='+encodeURIComponent(qMap[platform]||qMap.youtube)));
  if(!r.ok) return r;
  return { ok:true, source:'Bing News 社媒报道（代理信号）', platform, count:r.count, items:r.items,
    note:'YouTube/Twitter 官方 API 需密钥，此处使用公开媒体报道作为替代信号' };
}
async function api1688(u){
  // 无公开 API，返回会场链接 + 使用指引（不伪装真实数据）
  const q=u.searchParams.get('q')||'便携咖啡器具';
  return { ok:true, source:'1688 会场（需人工比价）', query:q,
    url:'https://www.1688.com/zw/hamlet.html?scene=6&cosite=bingjj_pz',
    note:'1688 无公开 API，请打开会场人工比价后导入结果', items:[] };
}
// 免密钥模型的内存缓存：同一问题 5 分钟内直接复用，规避 45s/IP 限流
const llmCache = new Map();
const LLM_CACHE_TTL = 5*60*1000;

async function apiChat(req,cfg){
  const b=await body(req);
  const messages=b.messages||[];
  if(!messages.length) return { ok:false, error:'缺少 messages' };
  const hasKey=!!(cfg.llm&&cfg.llm.key);
  // 默认使用免密钥的 Pollinations 公共模型；用户填了密钥则优先用自己的
  if(!hasKey){
    const lastUser=[...messages].reverse().find(m=>m.role==='user');
    const question=(lastUser?.content||'').slice(0,120);
    const cacheKey=question;
    const cached=llmCache.get(cacheKey);
    if(cached && Date.now()-cached.t<LLM_CACHE_TTL) return { ok:true, model:'cache', content:cached.text, free:true, cached:true };

    // 把选品上下文压到极短：只留硬数据，控制 URL 编码长度 < 900 规避 404
    const sysRaw=messages.filter(m=>m.role==='system').map(m=>m.content).join(' ');
    const facts=[];
    const pick=(re,label)=>{ const m=sysRaw.match(re); if(m) facts.push(label+m[1]); };
    pick(/推荐品类[：:]([^，。\n]+)/,'推荐:');
    pick(/置信度\s*(\d+%)/,'置信度');
    pick(/视频\s*([\d.]+\s*万)/,'视频');
    pick(/涨\s*(\d+%)/,'热度涨');
    pick(/清洗困难\s*(\d+%)/,'清洗难');
    pick(/漏水\s*(\d+%)/,'漏水');
    pick(/¥?([\d.]+\/起订\d+)/,'起订');
    pick(/评分\s*([\d.]+)/,'评分');
    pick(/建议售价\s*¥?(\d+)/,'售价');
    const ctx=(facts.join(' ')||'推荐便携咖啡套装').slice(0,150);
    const qShort=question.replace(/[，。？！?]/g,'').slice(0,50);
    const prompt=`电商选品助手。${ctx}。问:${qShort}。依据数据中文简短答:`;

    // 最多尝试两个模型，遇限流自动换下一个
    const models=['openai','mistral'];
    let lastErr='';
    for(const model of models){
      try{
        const url='https://text.pollinations.ai/'+encodeURIComponent(prompt)+'?model='+model+'&seed=42';
        const content=await get(url,{'User-Agent':'Mozilla/5.0'});
        const text=content.trim();
        if(text && !/^4\d\d|^5\d\d/.test(text)){
          llmCache.set(cacheKey,{ t:Date.now(), text });
          return { ok:true, model:'pollinations/'+model+' (免密钥)', content:text, free:true };
        }
        lastErr=text.slice(0,80);
      }catch(e){ lastErr=e.message; }
    }
    // 免密钥通道暂时不可用——返回明确的降级标记，前端用内置分析无缝接管
    return { ok:false, code:503, degrade:true, error:'免密钥模型暂时限流，已切换内置数据分析' };
  }
  try{
    const r=await fetch(cfg.llm.baseUrl.replace(/\/$/,'')+'/chat/completions',{
      method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+cfg.llm.key },
      body:JSON.stringify({ model:cfg.llm.model, messages, temperature:0.5, max_tokens:700 }),
      signal:AbortSignal.timeout(30000)
    });
    const t=await r.text();
    if(!r.ok) throw new Error('HTTP '+r.status+' '+t.slice(0,200));
    const d=JSON.parse(t);
    return { ok:true, model:cfg.llm.model, content:d.choices?.[0]?.message?.content||'', usage:d.usage };
  }catch(e){ return { ok:false, error:'大模型调用失败：'+e.message }; }
}

/* ---------- server ---------- */
const server=http.createServer(async (req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(req.method==='OPTIONS') return json(res,204,{});
  try{
    if(u.pathname==='/api/health') return json(res,200,health(loadConfig()));
    if(u.pathname==='/api/config' && req.method==='POST'){
      const b=await body(req);
      const cfg=loadConfig();
      if('youtube' in b) cfg.youtube=String(b.youtube||'').trim();
      if('twitter' in b) cfg.twitter=String(b.twitter||'').trim();
      if(b.llm) cfg.llm={ baseUrl:String(b.llm.baseUrl||'https://api.openai.com/v1').trim(), key:String(b.llm.key||'').trim(), model:String(b.llm.model||'gpt-4o-mini').trim() };
      saveConfig(cfg);
      return json(res,200,{ ok:true, health:health(cfg) });
    }
    if(u.pathname==='/api/news'){ const r=await apiNews(u,loadConfig()); return json(res,r.code||200,r); }
    if(u.pathname==='/api/douyin'){ const r=await apiDouyin(u); return json(res,r.code||200,r); }
    if(u.pathname==='/api/taobao'){ const r=await apiTaobao(u); return json(res,r.code||200,r); }
    if(u.pathname==='/api/baidu'){ const r=await apiBaidu(u); return json(res,r.code||200,r); }
    if(u.pathname==='/api/social'){ const r=await apiSocial(u); return json(res,r.code||200,r); }
    if(u.pathname==='/api/1688'){ const r=await api1688(u); return json(res,r.code||200,r); }
    if(u.pathname==='/api/youtube'){ const r=await apiYouTube(u,loadConfig()); return json(res,r.code||200,r); }
    if(u.pathname==='/api/twitter'){ const r=await apiTwitter(u,loadConfig()); return json(res,r.code||200,r); }
    if(u.pathname==='/api/chat' && req.method==='POST'){ const r=await apiChat(req,loadConfig()); return json(res,r.code||200,r); }

    // 静态文件
    let p=decodeURIComponent(u.pathname);
    if(p==='/') p='/index.html';
    const file=path.join(ROOT,p);
    if(!file.startsWith(ROOT)) return json(res,403,{error:'forbidden'});
    if(p.startsWith('/.env')) return json(res,403,{error:'forbidden'});
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()) return json(res,404,{error:'not found'});
    res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  }catch(e){ json(res,500,{ok:false,error:String(e.message||e)}); }
});

server.listen(PORT,()=>{
  console.log(`\n  选品雷达 Agent 已启动`);
  console.log(`  ➜  本地访问: http://localhost:${PORT}`);
  console.log(`  ➜  密钥文件: ${CONFIG_FILE}（仅存本地，不会下发前端）`);
  console.log(`  ➜  按 Ctrl+C 停止\n`);
});
