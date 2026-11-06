(() => {
'use strict';
const params=new URLSearchParams(location.search);
const archive=params.get('suite')==='v4';
const payload=archive?window.AI_BENCHMARK_ARCHIVE:window.AI_BENCHMARK_DATA;
if(!payload || !Array.isArray(payload.models)){document.body.insertAdjacentHTML('beforeend','<p>Benchmark data could not load.</p>');return;}
const version=archive?'4.3.2':payload.index_version;
const overlay=window.AI_DAILY_UPDATES;
const live=!archive&&overlay?.index_version===version&&overlay?.snapshot_as_of===payload.as_of?overlay:{};
const liveModels=live.models&&typeof live.models==='object'?live.models:{};
const leaderboard='https://artificialanalysis.ai/leaderboards/models';
const indexName='Artificial Analysis Intelligence Index v'+version;
const el=id=>document.getElementById(id);
let appliedUpdates=0;
const rows=payload.models.map((r,i)=>{
const model={id:i,name:r[0],family:r[1],cost:r[2],scores:r.slice(3)};
const item=Object.hasOwn(liveModels,model.name)?liveModels[model.name]:null;
if(item&&typeof item==='object'){
let changed=false;
if(Number.isFinite(item.index)&&item.index>=0&&item.index<=100){model.scores[0]=item.index;changed=true;}
if(Number.isFinite(item.cost)&&item.cost>=0&&item.cost<=1000){model.cost=item.cost;changed=true;}
if(changed)appliedUpdates++;
}
return model;
});
const liveUpdated=appliedUpdates>0&&typeof live.updated_at==='string';
el('data-status').textContent=(archive?'Historical':'Published')+' snapshot · '+payload.as_of+' · Intelligence Index v'+version
 +(liveUpdated?' · Index scores and costs refreshed '+live.updated_at.slice(0,10)+' UTC for '+appliedUpdates+' models.':'.');
el('snapshot-heading').textContent=rows.length+' configurations · Index v'+version+' · '+payload.as_of;
el('suite-status').textContent=archive?'October archive':'Benchmark snapshot';
el('methodology-current').hidden=archive;
el('methodology-archive').hidden=!archive;
if(!archive)el('benchmark-coverage').textContent=rows.filter(r=>r.scores.slice(1).every(Number.isFinite)).length
 +' of '+rows.length+' configurations have all nine component scores in this snapshot.';
const suiteLink=el('switch-suite');
suiteLink.href=archive?'./':'?suite=v4';
suiteLink.textContent=archive?'Return to current benchmarks ↗':'View October archive ↗';
if(archive)el('download-csv').textContent='↓ Export CSV';
const indexMetric={key:'index',short:'Intelligence',name:indexName,unit:'Index points',desc:'Weighted composite of benchmark results',pos:0};
const metrics=archive?[
indexMetric,
{key:'briefcase',short:'AA-Briefcase',name:'AA-Briefcase v1.1',unit:'Elo-style score',desc:'Agentic knowledge work benchmark.',pos:1},
{key:'gdpval',short:'GDPval-AA',name:'GDPval-AA v2.1',unit:'Elo-style score',desc:'Professional, real-world work tasks.',pos:2},
{key:'automation',short:'AutomationBench',name:'AutomationBench-AA',unit:'%',desc:'Automating SaaS workflows.',pos:3},
{key:'terminal',short:'Terminal-Bench',name:'Terminal-Bench 4.0',unit:'%',desc:'Agent coding and terminal tasks.',pos:4},
{key:'scicode',short:'SciCode',name:'SciCode',unit:'%',desc:'Scientific programming accuracy.',pos:5},
{key:'hle',short:'HLE',name:"Humanity's Last Exam",unit:'%',desc:'Advanced academic reasoning.',pos:6},
{key:'gdppdf',short:'GDP.pdf',name:'GDP.pdf',unit:'%',desc:'Professional document reasoning.',pos:7},
{key:'critpt',short:'CritPt',name:'CritPt',unit:'%',desc:'Physics reasoning benchmark.',pos:8},
{key:'omni',short:'Omniscience',name:'AA-Omniscience Index',unit:'Index points',desc:'Knowledge reliability and factuality.',pos:9},
{key:'lcr',short:'Long context',name:'AA-LCR v1.1',unit:'%',desc:'Long-context reasoning.',pos:10}
]:[
indexMetric,
{key:'briefcase',short:'AA-Briefcase',name:'AA-Briefcase v1.1',unit:'Elo-style score',desc:'Professional tasks with file deliverables · 15% weight',pos:1},
{key:'automation',short:'AutomationBench-AA',name:'AutomationBench-AA',unit:'%',desc:'SaaS workflow completion with guardrails · 5% weight',pos:2},
{key:'gdppdf',short:'GDP.pdf',name:'GDP.pdf',unit:'%',desc:'Professional document reasoning · 5% weight',pos:3},
{key:'frontiercode',short:'FrontierCode 2.0',name:'FrontierCode 2.0',unit:'%',desc:'Open-source coding tasks graded on merge readiness · 15% weight',pos:4},
{key:'terminal',short:'Terminal-Bench 4.0',name:'Terminal-Bench 4.0',unit:'%',desc:'Agentic coding and terminal tasks · 10% weight',pos:5},
{key:'science',short:'Terminal-Bench-Science',name:'Terminal-Bench-Science 0.1',unit:'%',desc:'Terminal-based scientific research tasks · 15% weight',pos:6},
{key:'critpt',short:'CritPt v2',name:'CritPt v2 (Hard Subset)',unit:'%',desc:'Physics research problems · 10% weight',pos:7},
{key:'omni',short:'AA-Omniscience',name:'AA-Omniscience v1.1',unit:'Net score',desc:'Knowledge accuracy and non-hallucination · 15% combined weight',pos:8},
{key:'diamond',short:'HLE-Diamond',name:'HLE-Diamond',unit:'%',desc:'Expert knowledge and reasoning · 10% weight',pos:9}
];
const families=[...new Set(rows.map(r=>r.family))];
const archiveFamilies=[...new Set((window.AI_BENCHMARK_ARCHIVE?.models||[]).map(r=>r[1]))];
const colors={
'GPT-6 Luna':'#96a8bb','GPT-6.1 Sol':'#60a5fa','GPT-6 Sol':'#fb923c','GPT-5.6 Sol':'#c084fc',
'GPT-6 Astra':'#2dd4bf','Claude Opus 5.5':'#e8a078','Gemini 3.8 Flash':'#b1d65b',
'Gemini 4 Argon':'#4ade80','GLM-5.3':'#38bdf8','Muse Spark':'#f472b6','Kimi K3':'#a78bfa','Grok 4.6':'#c4b5fd','Qwen':'#facc15','GPT-6.1 Terra':'#93c5fd',
'Gemini 4 Carbon':'#23c483','Claude Sonnet 5.5':'#fda4af','Claude Haiku 5.5':'#fdba74','Claude Fable 5.1':'#f87171',
'Grok 4.7':'#ddd6fe','Muse Wonder':'#e879f9','DeepSeek':'#648dff','Kimi K3.1':'#d8b4fe'};
const familyColor=f=>colors[f]||'hsl('+Math.round(families.indexOf(f)*137.508%360)+' 68% 67%)';
const costs=rows.map(r=>r.cost).filter(n=>Number.isFinite(n)&&n>=0);
const maxLinear=Math.max(0.01,Math.ceil(Math.max(0,...costs)*10)/10);
const minCost=Math.min(...costs.filter(n=>n>0));
const logMin=Math.log10(minCost<Infinity?minCost:maxLinear/10);
const logMax=Math.max(logMin+.05,Math.log10(maxLinear));
const plot=el('plot'),metricHolder=el('metric-buttons'),familyHolder=el('family-buttons'),details=el('model-details'),body=el('data-table');
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const dollars=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:6});
const formatCost=n=>Number.isFinite(n)?dollars.format(n):'Not reported';
const formatTaskCost=n=>Number.isFinite(n)?formatCost(n)+'/task':formatCost(n);
const formatTickCost=n=>formatCost(Number(n.toPrecision(3)));
const metricFor=()=>metrics.find(m=>m.key===state.metric)||metrics[0];
const score=(r,m=metricFor())=>r.scores[m.pos];
const canPlot=r=>Number.isFinite(score(r))&&Number.isFinite(r.cost)&&(state.scale==='log'?r.cost>0:r.cost>=0);
const settingsKey=archive?'modelscope-settings':'modelscope-settings-v5';
let state={metric:'index',scale:'linear',yScale:'zero',zoom:1,start:0,hidden:[],frontier:true,selected:0};
function bounds(st=state){return st.scale==='log'?[logMin,logMax]:[0,maxLinear];}
function span(st=state){let [lo,hi]=bounds(st);return(hi-lo)/Math.max(1,st.zoom);}
function normalize(st){
const result={...st},[lo,hi]=bounds(st);
result.zoom=clamp(Math.round(Number(st.zoom)||1),1,60);
result.start=clamp(Number.isFinite(Number(st.start))?Number(st.start):lo,lo,hi-(hi-lo)/result.zoom);
result.hidden=[...new Set((st.hidden||[]).filter(x=>families.includes(x)))];
result.yScale=st.yScale==='fit'?'fit':'zero';
if(!metrics.some(m=>m.key===result.metric))result.metric='index';
if(!['linear','log'].includes(result.scale))result.scale='linear';
result.frontier=!!result.frontier;
return result;
}
function loadSettings(){
try{
 const url=new URL(location.href);
 const saved=JSON.parse(localStorage.getItem(settingsKey)||'null')||{};
 if(!archive&&saved.selectedName)saved.selected=rows.find(r=>r.name===saved.selectedName)?.id??state.selected;
 const keys=['m','x','z','a','h','f','p','y'];
 if(keys.some(k=>url.searchParams.has(k))){
   const x=url.searchParams.get('x')||saved.scale||'linear';
   const h=url.searchParams.get('h');
   const f=url.searchParams.get('f');
   return normalize({...state,...saved,
      metric:url.searchParams.get('m')||saved.metric||'index',
      scale:x,
      yScale:url.searchParams.get('y')||saved.yScale||'zero',
      zoom:url.searchParams.has('z')?Number(url.searchParams.get('z')):1,
      start:url.searchParams.has('a')?Number(url.searchParams.get('a')):(x==='log'?logMin:0),
      hidden:f!==null?(f?f.split(','):[]):h===null?(saved.hidden||[]):h?h.split(',').map(i=>archiveFamilies[Number(i)]).filter(Boolean):[],
      frontier:url.searchParams.has('p')?url.searchParams.get('p')!=='0':saved.frontier!==false
   });
 }
 return normalize({...state,...saved});
}catch(e){return normalize(state);}
}
state=loadSettings();
if(archive&&params.get('focus')==='sol')state=normalize({...state,metric:'index',hidden:families.filter(f=>f!=='GPT-6 Sol'),selected:rows.find(r=>r.name==='GPT-6 Sol medium')?.id??state.selected});
function persist(){
try{
 localStorage.setItem(settingsKey,JSON.stringify({metric:state.metric,scale:state.scale,yScale:state.yScale,zoom:state.zoom,start:state.start,hidden:state.hidden,frontier:state.frontier,selected:state.selected,selectedName:rows[state.selected]?.name}));
 const url=new URL(location.href);url.searchParams.set('m',state.metric);url.searchParams.set('x',state.scale);url.searchParams.set('y',state.yScale);url.searchParams.set('z',String(state.zoom));url.searchParams.set('a',Number(state.start.toFixed(5)).toString());url.searchParams.delete('h');url.searchParams.delete('focus');url.searchParams.set('f',state.hidden.join(','));url.searchParams.set('p',state.frontier?'1':'0');history.replaceState(null,'',url);
}catch(e){}
}
function update(patch){state=normalize({...state,...patch});render();persist();}
function visible(){return allUnhidden().filter(canPlot);}
function allUnhidden(){return rows.filter(r=>!state.hidden.includes(r.family));}
function frontier(list){
let best=-Infinity,bestCost=null;
return [...list].sort((a,b)=>a.cost-b.cost||score(b)-score(a)).filter(r=>{
const value=score(r);
if(value>best){best=value;bestCost=r.cost;return true;}
return value===best&&r.cost===bestCost;
});
}
const ns='http://www.w3.org/2000/svg';
function svgEl(tag,attrs={},parent=plot,text){
const elem=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))elem.setAttribute(k,String(v));if(text!==undefined)elem.textContent=String(text);parent.appendChild(elem);return elem;
}
function geometry(){const rect=plot.getBoundingClientRect(),w=Math.max(310,rect.width||800),h=Math.max(340,rect.height||465);return {w,h,l:w<500?53:66,r:w-18,t:29,b:h-76};}
function niceYStep(raw){
 const magnitude=10**Math.floor(Math.log10(Math.max(raw,0.000001)));
 const scale=raw/magnitude;
 return ([1,2,2.5,5,10].find(n=>scale<=n)||10)*magnitude;
}
function chartYDomain(list){
 const metric=metricFor();
 const scores=list.map(r=>score(r)).filter(n=>typeof n==='number'&&Number.isFinite(n));
 if(!scores.length){
  if(metric.key==='index')return [0,70,10];
  if(metric.key==='omni')return [-20,60,10];
  if(metric.unit==='%')return [0,100,20];
  return [0,2000,500];
 }
 const lowScore=Math.min(...scores),highScore=Math.max(...scores);
 const gap=Math.max(highScore-lowScore,metric.unit==='Elo-style score'?50:5);
 const padding=Math.max(gap*.07,metric.unit==='Elo-style score'?5:.5);
 if(state.yScale==='fit'){
  const bottomTarget=lowScore>=0?Math.max(0,lowScore-padding):lowScore-padding;
  const topTarget=highScore+padding;
  const step=niceYStep((topTarget-bottomTarget)/7);
  const lower=Math.floor((bottomTarget+step*1e-9)/step)*step;
  const upper=Math.max(lower+step,Math.ceil((topTarget-step*1e-9)/step)*step);
  return [lower,upper,step];
 }
 // The zero-baseline option still includes negative values where present:
 // negative scores would be hidden if the bottom were strictly zero.
 const bottomTarget=Math.min(0,lowScore-padding*(lowScore<0?1:0));
 const topTarget=Math.max(highScore+padding,metric.key==='index'?65:metric.key==='omni'?60:metric.unit==='%'?100:0);
 const step=niceYStep((topTarget-bottomTarget)/7);
 const lower=bottomTarget<0?Math.floor(bottomTarget/step)*step:0;
 const upper=Math.max(lower+step,Math.ceil(topTarget/step)*step);
 return [lower,upper,step];
}
function formatValue(n,metric=metricFor()){
if(!Number.isFinite(n))return archive?'Not reported':'Unavailable in snapshot';
if(metric.unit==='%')return n+'%';
return metric.unit==='Elo-style score'?n.toLocaleString()+' Elo':String(n);
}
function xTickValues(){
const start=state.start,end=start+span(),s=span();
if(state.scale==='linear'){
const tick=[.001,.002,.005,.01,.02,.05,.1,.2,.25,.5,1,2,5].find(v=>s/v<=7)||10;
const ticks=[];
for(let k=Math.ceil((start-1e-9)/tick);k*tick<=end+1e-9&&ticks.length<100;k++)ticks.push(Number((k*tick).toFixed(7)));
return ticks;
}
let vals=[];
for(let e=-5;e<=2;e++)for(let mul of [1,2,5]){
const val=mul*10**e,log=Math.log10(val);
if(val>=minCost-1e-9 && val<=maxLinear+1e-9 &&log>=start-1e-9&&log<=end+1e-9)vals.push(val);
}
if(vals.length>9)return vals.filter((_,i)=>i%Math.ceil(vals.length/9)===0);
if(vals.length>=2)return vals;
const inc=[.005,.01,.02,.05,.1,.2,.25,.5,1].find(t=>s/t<=7)||1;
vals=[];
for(let k=Math.ceil((start-1e-9)/inc);k*inc<=end+1e-9&&vals.length<20;k++){
const v=10**(k*inc);if(v>=minCost&&v<=maxLinear)vals.push(v);}
return vals;
}
let currentPointPositions=[];
function drawChart(){
const m=metricFor(),list=visible(),g=geometry(),[yMin,yMax,yStep]=chartYDomain(list);
const axisNote=document.getElementById('y-axis-note');
if(axisNote)axisNote.textContent=state.yScale==='fit'?'Y-axis fits the lowest and highest enabled model scores.':yMin<0?'Negative scores included below zero so no models are clipped.':'Y-axis starts at zero.';
const xUnit=x=>state.scale==='log'?Math.log10(x):x,xCoord=x=>g.l+(xUnit(x)-state.start)/span()*(g.r-g.l),yCoord=v=>g.b-(v-yMin)/(yMax-yMin)*(g.b-g.t);
plot.setAttribute('viewBox','0 0 '+g.w+' '+g.h);plot.replaceChildren();
svgEl('text',{x:g.w/2,y:15,'text-anchor':'middle',fill:'#b9cbe2','font-size':11,'font-family':'system-ui'},plot,m.name);
const defs=svgEl('defs'),clip=svgEl('clipPath',{id:'points-clip'},defs);svgEl('rect',{x:g.l,y:g.t,width:g.r-g.l,height:g.b-g.t},clip);
for(let y=yMin;y<=yMax+1e-8;y+=yStep){
const Y=yCoord(y);svgEl('line',{x1:g.l,y1:Y,x2:g.r,y2:Y,stroke:'#94a3b8','stroke-opacity':.19});
svgEl('text',{x:g.l-10,y:Y+4,'text-anchor':'end',fill:'#95a9c2','font-size':11,'font-family':'system-ui'},plot,String(Number(y.toFixed(6))));
}
for(const value of xTickValues()){
const X=xCoord(value);if(X<g.l-2||X>g.r+2)continue;
svgEl('line',{x1:X,y1:g.t,x2:X,y2:g.b,stroke:'#94a3b8','stroke-opacity':.13});
svgEl('text',{x:X,y:g.b+23,'text-anchor':'middle',fill:'#90a4bd','font-size':11,'font-family':'system-ui'},plot,formatTickCost(value));
}
svgEl('text',{x:(g.l+g.r)/2,y:g.h-29,'text-anchor':'middle',fill:'#8ba5c1','font-size':12,'font-family':'system-ui'},plot,'Cost per Intelligence Index task (USD)');
svgEl('text',{x:(g.l+g.r)/2,y:g.h-10,'text-anchor':'middle',fill:'#95a9c2','font-size':11,'font-family':'system-ui'},plot,'Source: Artificial Analysis · Index v'+version+' · '+payload.as_of);
svgEl('text',{x:17,y:(g.t+g.b)/2,transform:'rotate(-90 17 '+((g.t+g.b)/2)+')','text-anchor':'middle',fill:'#8ba5c1','font-size':12,'font-family':'system-ui'},plot,m.unit);
const points=svgEl('g',{'clip-path':'url(#points-clip)'});
const efficient=frontier(list);
if(state.frontier&&efficient.length>1){
svgEl('polyline',{points:efficient.map(r=>xCoord(r.cost)+','+yCoord(score(r))).join(' '),fill:'none',stroke:'#34d399','stroke-width':2.5,'stroke-dasharray':'5 6','stroke-linecap':'round','pointer-events':'none'},points);
}
currentPointPositions=[];
for(const r of list){
const X=xCoord(r.cost),Y=yCoord(score(r));
if(X<g.l-7||X>g.r+7)continue;
currentPointPositions.push({id:r.id,x:X,y:Y});
if(r.id===state.selected)svgEl('circle',{cx:X,cy:Y,r:12,fill:'none',stroke:'#fbbf24','stroke-width':2.5,'pointer-events':'none'},points);
// The visible dot stays small, but a transparent hit area makes taps easier.
svgEl('circle',{cx:X,cy:Y,r:16,fill:'transparent','data-id':r.id,role:'button','aria-label':r.name+', '+formatValue(score(r))+', '+formatCost(r.cost)+' per task',style:'cursor:pointer'},points);
svgEl('circle',{cx:X,cy:Y,r:r.id===state.selected?7.4:6.3,fill:familyColor(r.family),stroke:'#102034','stroke-width':1.3,'pointer-events':'none'},points);
// No SVG <title>: mobile browsers can show native tooltips beside points.
}
// Selected point stays highlighted in the plot. Its label is anchored to the
// chart footer instead of floating beside the point.
const unhidden=allUnhidden();
const selected=unhidden.find(r=>r.id===state.selected);
const selectedLabel=el('selected-chart-label');
const selectedName=el('selected-chart-name');
const selectedStats=el('selected-chart-stats');
if(selectedLabel&&selectedName&&selectedStats){
  selectedLabel.classList.toggle('has-selection',!!selected);
  selectedName.textContent=selected?selected.name:'Tap a model point to inspect it';
  selectedStats.textContent=selected?m.short+': '+formatValue(score(selected),m)+'  ·  '+formatTaskCost(selected.cost):'';
}
if(!list.length){
svgEl('text',{x:(g.l+g.r)/2,y:(g.t+g.b)/2-8,'text-anchor':'middle',fill:'#d6e9ff','font-size':19,'font-family':'system-ui','font-weight':700},plot,unhidden.length?'No plottable models':'No models visible');
svgEl('text',{x:(g.l+g.r)/2,y:(g.t+g.b)/2+18,'text-anchor':'middle',fill:'#8ca8c4','font-size':12,'font-family':'system-ui'},plot,unhidden.length?'Try another benchmark, scale or family.':'Use Flip all or Show all to restore families.');
}
el('visible-count').innerHTML=unhidden.length+' <em>/ '+rows.length+'</em>';
el('visible-label').textContent=list.length+' plottable in selected benchmark';
el('metric-context').textContent=m.name+' · '+m.desc;
el('axis-units').textContent=m.unit+' · higher is better';
el('score-column').textContent=m.key==='index'?'Intelligence v'+version:m.short;
el('download-csv').disabled=archive?!unhidden.length:!selected;
el('cost-note').textContent=state.scale==='log'?'Log scale plots positive published costs only.':costs.includes(0)?'Linear scale includes costs published as $0.00.':'';
el('range-display').textContent=formatCost(state.scale==='log'?10**state.start:state.start)+' – '+formatCost(state.scale==='log'?10**(state.start+span()):state.start+span())+' / task';
el('zoom-display').textContent=state.zoom+'×';
}
function drawMetricButtons(){
metricHolder.replaceChildren();
metrics.forEach(m=>{
const btn=document.createElement('button');
btn.className='metric-button'+(m.key===state.metric?' active':'');
btn.type='button';btn.textContent=m.short;btn.title=m.name+' · '+m.desc;
btn.setAttribute('aria-pressed',String(m.key===state.metric));
btn.addEventListener('click',()=>update({metric:m.key}));
metricHolder.append(btn);
});
}
function drawFamilies(){
familyHolder.replaceChildren();
const hidden=new Set(state.hidden);
families.forEach(f=>{
const btn=document.createElement('button'),dot=document.createElement('span'),text=document.createElement('span'),x=document.createElement('span');
btn.type='button';btn.className='family-button'+(hidden.has(f)?' hidden':'');btn.setAttribute('aria-pressed',String(!hidden.has(f)));
dot.className='family-dot';dot.style.background=familyColor(f);text.textContent=f+' ('+rows.filter(r=>r.family===f).length+')';x.className='family-x';x.textContent=hidden.has(f)?'↺':'×';
btn.append(dot,text,x);
btn.addEventListener('click',()=>update({hidden:hidden.has(f)?state.hidden.filter(n=>n!==f):[...state.hidden,f]}));
familyHolder.append(btn);
});
el('filter-summary').textContent=(families.length-state.hidden.length)+' / '+families.length+' families shown';
}
function drawLegend(){
const l=el('legend');l.replaceChildren();
families.forEach(f=>{
const sp=document.createElement('span'),dot=document.createElement('i');dot.style.background=familyColor(f);
sp.append(dot,document.createTextNode(f));l.append(sp);
});
}
function drawDetail(){
const r=rows[state.selected],m=metricFor();
if(!r||state.hidden.includes(r.family)){details.innerHTML='<p class="panel-intro">Select a visible model to see its benchmarks.</p>';return;}
details.replaceChildren();
const name=document.createElement('div');name.className='model-name';name.textContent=r.name;
const sub=document.createElement('div');sub.className='model-sub';
const creator=payload.creators?.[r.family];
sub.textContent=r.family+(creator&&creator!==r.family?' · '+creator:'')+' · Index v'+version+' · '+payload.as_of
 +(payload.model_status?.[r.name]?' · '+payload.model_status[r.name]:'');
const stats=document.createElement('div');stats.className='stat-row';
const measurements=[['Intelligence v'+version,formatValue(r.scores[0],metrics[0])],['Cost / task',formatCost(r.cost)]];
if(m.key!=='index')measurements.push([m.short,formatValue(score(r),m)]);
for(const [label,value] of measurements){
const wrap=document.createElement('div');wrap.className='stat-box';
const a=document.createElement('small'),b=document.createElement('strong');a.textContent=label;b.textContent=value;wrap.append(a,b);stats.append(wrap);
}
const heading=document.createElement('h3');heading.textContent='All benchmark results';heading.style.cssText='font-size:12px;margin:12px 0;color:#c5daee';
const values=document.createElement('div');values.className='detail-values';
metrics.forEach(mm=>{const label=document.createElement('span'),value=document.createElement('strong');label.textContent=mm.name;value.textContent=formatValue(score(r,mm),mm);values.append(label,value);});
details.append(name,sub,stats,heading,values);
const links=document.createElement('div');links.className='source-links';
const sources=[['Artificial Analysis model ↗',payload.model_sources?.[r.name]||payload.sources?.[r.family]||leaderboard]];
if(payload.component_sources?.[r.name])sources.push(['Component score source ↗',payload.component_sources[r.name]]);
for(const [label,url] of sources){
const link=document.createElement('a');link.className='detail-link';link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=label;links.append(link);
}
details.append(links);
}
function drawTable(){
const value=el('search').value.trim().toLowerCase(),m=metricFor(),efficient=new Set(frontier(visible()).map(r=>r.id));
body.replaceChildren();
allUnhidden().filter(r=>!value||(r.name+' '+r.family).toLowerCase().includes(value)).sort((a,b)=>(a.cost??Infinity)-(b.cost??Infinity)||a.name.localeCompare(b.name)).forEach(r=>{
const tr=document.createElement('tr');if(r.id===state.selected)tr.classList.add('selected');
const status=!Number.isFinite(score(r))?'Score unavailable':!Number.isFinite(r.cost)?'Cost unavailable':!canPlot(r)?'Linear scale only':efficient.has(r.id)?'Frontier':'Other';
for(const text of [r.name,r.family,formatCost(r.cost),formatValue(score(r),m),status]){
const td=document.createElement('td');td.textContent=text;
if(text==='Frontier')td.className='status-yes';if(!canPlot(r)&&text===status)td.className='status-no';
tr.appendChild(td);
}
const select=()=>{state.selected=r.id;render();el('benchmark-chart').scrollIntoView({behavior:'smooth',block:'start'});persist();};
tr.addEventListener('click',select);
const modelButton=document.createElement('button');modelButton.type='button';modelButton.className='table-model';modelButton.textContent=r.name;
tr.firstChild.replaceChildren(modelButton);
body.appendChild(tr);
});
}
function refreshCycleButtons(){
 const x=el('cycle-x-scale'),y=el('cycle-y-start'),front=el('cycle-frontier');
 const log=state.scale==='log',fit=state.yScale==='fit';
 // Buttons display the CURRENT setting, and pressing them changes it.
 x.replaceChildren(document.createTextNode(log?'Logarithmic ':'Linear '));
 const xicon=document.createElement('span');xicon.setAttribute('aria-hidden','true');xicon.textContent='↔';x.append(xicon);
 x.setAttribute('aria-label','X-axis scale: '+(log?'logarithmic':'linear')+'. Tap to switch to '+(log?'linear':'logarithmic')+'.');
 y.replaceChildren(document.createTextNode(fit?'Lowest model ':'Zero '));
 const yicon=document.createElement('span');yicon.setAttribute('aria-hidden','true');yicon.textContent='↔';y.append(yicon);
 y.setAttribute('aria-label','Y-axis starts at '+(fit?'lowest visible model':'zero')+'. Tap to switch to '+(fit?'zero':'lowest visible model')+'.');
 front.replaceChildren(document.createTextNode(state.frontier?'On ':'Off '));
 const ficon=document.createElement('span');ficon.setAttribute('aria-hidden','true');ficon.textContent='↔';front.append(ficon);
 front.setAttribute('aria-label','Pareto frontier '+(state.frontier?'on. Tap to turn off.':'off. Tap to turn on.'));
 front.setAttribute('aria-pressed',String(state.frontier));
 front.classList.toggle('disabled-state',!state.frontier);
}
function render(){
el('zoom-range').value=state.zoom;
refreshCycleButtons();
drawMetricButtons();drawChart();drawFamilies();drawDetail();drawTable();
}
el('cycle-y-start').addEventListener('click',()=>update({yScale:state.yScale==='zero'?'fit':'zero'}));
el('cycle-x-scale').addEventListener('click',()=>{const next=state.scale==='linear'?'log':'linear';update({scale:next,start:next==='log'?logMin:0,zoom:1});});
el('cycle-frontier').addEventListener('click',()=>update({frontier:!state.frontier}));
el('zoom-range').addEventListener('input',e=>{const z=Number(e.target.value),[a,b]=bounds();update({zoom:z,start:clamp(state.start,a,b-(b-a)/z)});});
document.querySelectorAll('[data-zoom]').forEach(b=>b.addEventListener('click',()=>update({zoom:Number(b.dataset.zoom),start:bounds()[0]})));
el('flip-all').addEventListener('click',()=>update({hidden:families.filter(f=>!state.hidden.includes(f))}));
el('show-all').addEventListener('click',()=>update({hidden:[]}));
el('search').addEventListener('input',drawTable);
el('download-csv').addEventListener('click',()=>{
const m=metricFor();
const head=['Snapshot date','Index version','Model','Family','Cost per Intelligence Index task (USD)',...metrics.map(x=>x.name),'Visible frontier','Artificial Analysis model source','Component score source'];
const ef=new Set(frontier(visible()).map(r=>r.id));
const exported=allUnhidden().filter(r=>archive||r.id===state.selected);
const items=exported.map(r=>[payload.as_of,version,r.name,r.family,r.cost,...r.scores,canPlot(r)?ef.has(r.id)?'Yes':'No':'',payload.model_sources?.[r.name]||leaderboard,payload.component_sources?.[r.name]]);
const encode=row=>row.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',');
const csv=[head,...items].map(encode).join('\r\n');
const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
const a=document.createElement('a');a.href=url;a.download='modelscope-v'+version+'-'+m.key+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
const ptrs=new Map();let pan=null,pinch=null;
function fraction(clientX){
const g=geometry(),rect=plot.getBoundingClientRect();
return clamp(((clientX-rect.left)*g.w/rect.width-g.l)/(g.r-g.l),0,1);
}
// Find the nearest actual plotted point using the SVG screen transform.
// This handles small dots, dense clusters, and mobile taps reliably.
function pointNearEvent(e){
  const matrix=plot.getScreenCTM();
  if(!matrix)return null;
  const pt=plot.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
  const local=pt.matrixTransform(matrix.inverse());
  let best=null,bestDistance=Infinity;
  for(const p of currentPointPositions){
    const d=Math.hypot(local.x-p.x,local.y-p.y);
    if(d<bestDistance){bestDistance=d;best=p;}
  }
  return bestDistance<=19?best:null;
}
plot.addEventListener('pointerdown',e=>{
const near=pointNearEvent(e);
if(near){
  state.selected=near.id;
  render();persist();return;
}
plot.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
if(ptrs.size===1){pan={x:e.clientX,start:state.start,span:span()};pinch=null;}
if(ptrs.size===2){
const ps=[...ptrs.values()],ratio=fraction((ps[0].x+ps[1].x)/2);
pinch={dist:Math.max(1,Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y)),zoom:state.zoom,anchor:state.start+ratio*span(),ratio};pan=null;
}
});
plot.addEventListener('pointermove',e=>{
if(!ptrs.has(e.pointerId))return;
ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
if(ptrs.size===2&&pinch){
const ps=[...ptrs.values()],dist=Math.max(1,Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y));
const zoom=clamp(Math.round(pinch.zoom*dist/pinch.dist),1,60),[a,b]=bounds(),w=(b-a)/zoom;
update({zoom,start:clamp(pinch.anchor-pinch.ratio*w,a,b-w)});
}else if(ptrs.size===1&&pan){
const g=geometry(),rect=plot.getBoundingClientRect(),delta=(e.clientX-pan.x)*g.w/rect.width/(g.r-g.l)*pan.span,[a,b]=bounds();
update({start:clamp(pan.start-delta,a,b-span())});
}
});
function stopPointer(e){ptrs.delete(e.pointerId);pan=null;pinch=null;if(ptrs.size===1){const p=[...ptrs.values()][0];pan={x:p.x,start:state.start,span:span()};}}
plot.addEventListener('pointerup',stopPointer);plot.addEventListener('pointercancel',stopPointer);
plot.addEventListener('wheel',e=>{
e.preventDefault();
const ratio=fraction(e.clientX),anchor=state.start+ratio*span();
let z=e.deltaY<0?Math.max(state.zoom+1,Math.round(state.zoom*1.25)):Math.min(state.zoom-1,Math.round(state.zoom*.8));
z=clamp(z,1,60);
const [a,b]=bounds(),w=(b-a)/z;update({zoom:z,start:clamp(anchor-ratio*w,a,b-w)});
},{passive:false});
// Pointer selection is handled by the chart; keyboard users can select
// models from the accessible data table below it.
let resizeTimer=null;
if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(drawChart,50);}).observe(plot);
drawLegend();render();persist();

function setupRemovalChecklist(){
  const menu=el('model-removal'),list=el('removal-list'),search=el('removal-search'),filter=el('removal-filter');
  const copy=el('removal-copy'),clear=el('removal-clear'),status=el('removal-status');
  const copyArea=el('removal-copy-area'),copyField=el('removal-text');
  const storageKey='modelscope-removal-selection';
  const baseName=name=>name.toLowerCase().replace(/\bdefault fallback\b/g,'').replace(/[^a-z0-9]/g,'');
  const octoberNames=new Set((window.AI_BENCHMARK_ARCHIVE?.models||[]).map(r=>baseName(r[0])));
  const models=rows.map(r=>{
    const source=payload.model_sources?.[r.name];
    return {
      name:r.name,family:r.family,developer:payload.creators?.[r.family]||r.family,
      source,key:source||r.name,added:!octoberNames.has(baseName(r.name))
    };
  }).sort((a,b)=>a.developer.localeCompare(b.developer)||a.family.localeCompare(b.family)||a.name.localeCompare(b.name,undefined,{numeric:true}));
  const keys=new Set(models.map(r=>r.key));
  const marked=new Set();
  try{
    const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');
    if(Array.isArray(saved))saved.filter(key=>keys.has(key)).forEach(key=>marked.add(key));
  }catch{}

  const added=models.filter(r=>r.added).length;
  el('removal-origin').textContent=added+' configurations were added to ModelScope since October. '+(models.length-added)+' also appeared in the October list.';
  function showActions(){
    el('removal-count').textContent=marked.size+' marked';
    copy.disabled=clear.disabled=marked.size===0;
    copyArea.hidden=true;
    status.textContent='';
  }
  function saveMarks(){
    try{localStorage.setItem(storageKey,JSON.stringify([...marked]));}catch{}
    showActions();
  }
  function showModels(){
    const query=search.value.trim().toLowerCase();
    const mode=filter.value;
    const shown=models.filter(r=>{
      if(![r.name,r.developer,r.family].some(text=>text.toLowerCase().includes(query)))return false;
      if(mode==='added')return r.added;
      if(mode==='previous')return !r.added;
      if(mode==='marked')return marked.has(r.key);
      return true;
    });
    el('removal-results').textContent=shown.length+' of '+models.length+' configurations shown';
    list.replaceChildren();
    if(!shown.length){
      const message=document.createElement('p');
      message.className='removal-empty';
      message.textContent=mode==='marked'&&!marked.size?'Check models to build your removal list.':'No configurations match these filters.';
      list.append(message);
      return;
    }
    const groups=new Map();
    for(const r of shown){
      if(!groups.has(r.developer)){
        const group=document.createElement('fieldset');
        group.className='removal-group';
        const heading=document.createElement('legend');
        heading.textContent=r.developer;
        group.append(heading);
        list.append(group);
        groups.set(r.developer,group);
      }
      const row=document.createElement('div');
      row.className='removal-row';
      const label=document.createElement('label');
      const box=document.createElement('input');
      box.type='checkbox';box.value=r.key;box.checked=marked.has(r.key);
      const description=document.createElement('span');
      const name=document.createElement('strong');
      name.textContent=r.name;
      const origin=document.createElement('small');
      origin.className=r.added?'removal-added':'';
      origin.textContent=r.added?'Added to ModelScope':'In October list';
      description.append(name,origin);
      label.append(box,description);
      row.append(label);
      if(r.source){
        const link=document.createElement('a');
        link.href=r.source;link.target='_blank';link.rel='noopener noreferrer';
        link.textContent='Source ↗';
        link.setAttribute('aria-label','Artificial Analysis source for '+r.name);
        row.append(link);
      }
      groups.get(r.developer).append(row);
    }
  }
  list.addEventListener('change',({target})=>{
    if(!keys.has(target.value))return;
    if(target.checked)marked.add(target.value);
    else marked.delete(target.value);
    saveMarks();
    if(filter.value==='marked')showModels();
  });
  function applyFilter(){
    showModels();
    list.scrollTop=0;
  }
  search.addEventListener('input',applyFilter);
  filter.addEventListener('change',applyFilter);
  clear.addEventListener('click',()=>{
    marked.clear();
    saveMarks();
    showModels();
  });
  const selectedText=()=>models.filter(r=>marked.has(r.key)).map(r=>r.name).join('\n');
  copy.addEventListener('click',async()=>{
    const text=selectedText();
    if(!text)return;
    let copied=false;
    try{
      await navigator.clipboard.writeText(text);
      copied=true;
    }catch{}
    if(text!==selectedText())return;
    copyField.value=text;
    copyArea.hidden=false;
    status.textContent=copied?'Copied. Paste the list into the chat.':'Copy the text below and paste it into the chat.';
    if(!copied){copyField.focus();copyField.select();}
  });
  showActions();
  showModels();
  menu.hidden=false;
  if(location.hash==='#model-removal')menu.open=true;
}
if(!archive)setupRemovalChecklist();
})();
