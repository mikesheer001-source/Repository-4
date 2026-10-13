(() => {
'use strict';
const payload=window.AI_BENCHMARK_DATA;
if(!payload || !Array.isArray(payload.models)){document.body.insertAdjacentHTML('beforeend','<p>Benchmark data could not load.</p>');return;}
const live=window.AI_DAILY_UPDATES||{};
const liveModels=live.models&&typeof live.models==='object'?live.models:{};
let appliedUpdates=0;
const rows=payload.models.map((r,i)=>{
const model={id:i,name:r[0],family:r[1],cost:r[2],scores:r.slice(3)};
const item=liveModels[model.name];
if(item&&typeof item==='object'){
let changed=false;
if(typeof item.index==='number'&&Number.isFinite(item.index)&&item.index>=-100&&item.index<=200){model.scores[0]=item.index;changed=true;}
if(typeof item.cost==='number'&&Number.isFinite(item.cost)&&item.cost>0&&item.cost<=1000){model.cost=item.cost;changed=true;}
if(changed)appliedUpdates++;
}
return model;
});
const liveUpdated=appliedUpdates>0&&typeof live.updated_at==='string';
const dataStatus=document.getElementById('data-status');
if(dataStatus)dataStatus.textContent=liveUpdated?'Basic scores/costs refreshed '+live.updated_at.slice(0,10)+' UTC for '+appliedUpdates+' models. Detailed benchmarks are static.':'Static snapshot. Automatic updates await API key and redistribution rights.';
const metrics=[
{key:'index',short:'Intelligence',name:'Artificial Analysis Intelligence Index',unit:'Index points',desc:'Composite intelligence across component evaluations.',pos:0},
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
];
const families=[...new Set(rows.map(r=>r.family))];
const colors={
'GPT-6 Luna':'#96a8bb','GPT-6.1 Sol':'#60a5fa','GPT-6 Sol':'#fb923c','GPT-5.6 Sol':'#c084fc',
'GPT-6 Astra':'#2dd4bf','Claude Opus 5.5':'#e8a078','Gemini 3.8 Flash':'#b1d65b',
'Gemini 4 Argon':'#4ade80','GLM-5.3':'#38bdf8','Muse Spark':'#f472b6','Kimi K3':'#a78bfa','Grok 4.6':'#c4b5fd'};
const maxCost=Math.max(...rows.map(r=>r.cost)),minCost=Math.min(...rows.map(r=>r.cost));
const maxLinear=Math.max(6.3,Math.ceil(maxCost*10)/10), logMin=Math.log10(minCost), logMax=Math.log10(maxLinear);
const el=id=>document.getElementById(id);
const plot=el('plot'),metricHolder=el('metric-buttons'),familyHolder=el('family-buttons'),details=el('model-details'),body=el('data-table');
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const formatCost=n=>n<.01?'$'+n.toFixed(4):n<.1?'$'+Number(n.toFixed(3)):'$'+Number(n.toFixed(2));
const metricFor=()=>metrics.find(m=>m.key===state.metric)||metrics[0];
const score=(r,m=metricFor())=>r.scores[m.pos];
let state={metric:'index',scale:'linear',yScale:'zero',zoom:1,start:0,hidden:[],frontier:true,selected:rows.find(r=>r.name==='GPT-6.1 Sol high')?.id||0};
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
 const saved=JSON.parse(localStorage.getItem('modelscope-settings')||'null')||{};
 const keys=['m','x','z','a','h','p','y'];
 if(keys.some(k=>url.searchParams.has(k))){
   const x=url.searchParams.get('x')||saved.scale||'linear';
   const h=url.searchParams.get('h');
   return normalize({...state,...saved,
      metric:url.searchParams.get('m')||saved.metric||'index',
      scale:x,
      yScale:url.searchParams.get('y')||saved.yScale||'zero',
      zoom:url.searchParams.has('z')?Number(url.searchParams.get('z')):1,
      start:url.searchParams.has('a')?Number(url.searchParams.get('a')):(x==='log'?logMin:0),
      hidden:h===null?(saved.hidden||[]):h?h.split(',').map(i=>families[Number(i)]).filter(Boolean):[],
      frontier:url.searchParams.has('p')?url.searchParams.get('p')!=='0':saved.frontier!==false
   });
 }
 return normalize({...state,...saved});
}catch(e){return normalize(state);}
}
state=loadSettings();
function persist(){
try{
 localStorage.setItem('modelscope-settings',JSON.stringify({metric:state.metric,scale:state.scale,yScale:state.yScale,zoom:state.zoom,start:state.start,hidden:state.hidden,frontier:state.frontier,selected:state.selected}));
 const url=new URL(location.href);url.searchParams.set('m',state.metric);url.searchParams.set('x',state.scale);url.searchParams.set('y',state.yScale);url.searchParams.set('z',String(state.zoom));url.searchParams.set('a',Number(state.start.toFixed(5)).toString());url.searchParams.set('h',state.hidden.map(f=>families.indexOf(f)).join(','));url.searchParams.set('p',state.frontier?'1':'0');history.replaceState(null,'',url);
}catch(e){}
}
function update(patch){state=normalize({...state,...patch});render();persist();}
function visible(){return rows.filter(r=>!state.hidden.includes(r.family) && typeof score(r)==='number');}
function allUnhidden(){return rows.filter(r=>!state.hidden.includes(r.family));}
function frontier(list){
let best=-Infinity;
return [...list].sort((a,b)=>a.cost-b.cost || score(b)-score(a)).filter(r=>{if(score(r)>best){best=score(r);return true;}return false;});
}
const ns='http://www.w3.org/2000/svg';
function svgEl(tag,attrs={},parent=plot,text){
const elem=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))elem.setAttribute(k,String(v));if(text!==undefined)elem.textContent=String(text);parent.appendChild(elem);return elem;
}
function geometry(){const rect=plot.getBoundingClientRect(),w=Math.max(310,rect.width||800),h=Math.max(340,rect.height||465);return {w,h,l:w<500?53:66,r:w-18,t:21,b:h-59};}
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
if(n==null)return 'Not reported';
return ['index','omni'].includes(metric.key)?String(n):metric.unit==='%'?n+'%':n.toLocaleString()+' Elo';
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
const [a,b]=bounds(),xUnit=x=>state.scale==='log'?Math.log10(x):x,xCoord=x=>g.l+(xUnit(x)-state.start)/span()*(g.r-g.l),yCoord=v=>g.b-(v-yMin)/(yMax-yMin)*(g.b-g.t);
plot.setAttribute('viewBox','0 0 '+g.w+' '+g.h);plot.replaceChildren();
const defs=svgEl('defs'),clip=svgEl('clipPath',{id:'points-clip'},defs);svgEl('rect',{x:g.l,y:g.t,width:g.r-g.l,height:g.b-g.t},clip);
for(let y=yMin;y<=yMax+1e-8;y+=yStep){
const Y=yCoord(y);svgEl('line',{x1:g.l,y1:Y,x2:g.r,y2:Y,stroke:'#94a3b8','stroke-opacity':.19});
svgEl('text',{x:g.l-10,y:Y+4,'text-anchor':'end',fill:'#95a9c2','font-size':11,'font-family':'system-ui'},plot,String(Number(y.toFixed(6))));
}
for(const value of xTickValues()){
const X=xCoord(value);if(X<g.l-2||X>g.r+2)continue;
svgEl('line',{x1:X,y1:g.t,x2:X,y2:g.b,stroke:'#94a3b8','stroke-opacity':.13});
svgEl('text',{x:X,y:g.b+23,'text-anchor':'middle',fill:'#90a4bd','font-size':11,'font-family':'system-ui'},plot,formatCost(value));
}
svgEl('text',{x:(g.l+g.r)/2,y:g.h-12,'text-anchor':'middle',fill:'#8ba5c1','font-size':12,'font-family':'system-ui'},plot,'Cost per benchmark task (USD · '+state.scale+' axis)');
svgEl('text',{x:17,y:(g.t+g.b)/2,transform:'rotate(-90 17 '+((g.t+g.b)/2)+')','text-anchor':'middle',fill:'#8ba5c1','font-size':12,'font-family':'system-ui'},plot,m.unit);
const points=svgEl('g',{'clip-path':'url(#points-clip)'});
const efficient=frontier(list);const efficientIds=new Set(efficient.map(r=>r.id));
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
const hit=svgEl('circle',{cx:X,cy:Y,r:16,fill:'transparent','data-id':r.id,role:'button','aria-label':r.name+', '+formatValue(score(r))+', '+formatCost(r.cost)+' per task',style:'cursor:pointer'},points);
const dot=svgEl('circle',{cx:X,cy:Y,r:r.id===state.selected?7.4:6.3,fill:colors[r.family]||'#ccc',stroke:'#102034','stroke-width':1.3,'pointer-events':'none'},points);
// No SVG <title>: mobile browsers can show native tooltips beside points.
}
// Selected point stays highlighted in the plot. Its label is anchored to the
// chart footer instead of floating beside the point.
const selected=list.find(r=>r.id===state.selected);
const selectedLabel=el('selected-chart-label');
const selectedName=el('selected-chart-name');
const selectedStats=el('selected-chart-stats');
if(selectedLabel&&selectedName&&selectedStats){
  selectedLabel.classList.toggle('has-selection',!!selected);
  selectedName.textContent=selected?selected.name:'Tap a model point to inspect it';
  selectedStats.textContent=selected?m.short+': '+formatValue(score(selected),m)+'  ·  '+formatCost(selected.cost)+'/task':'';
}
if(!list.length){
svgEl('text',{x:(g.l+g.r)/2,y:(g.t+g.b)/2-8,'text-anchor':'middle',fill:'#d6e9ff','font-size':19,'font-family':'system-ui','font-weight':700},plot,'No models visible');
svgEl('text',{x:(g.l+g.r)/2,y:(g.t+g.b)/2+18,'text-anchor':'middle',fill:'#8ca8c4','font-size':12,'font-family':'system-ui'},plot,'Use Flip all or Show all to restore families.');
}
el('visible-count').innerHTML=allUnhidden().length+' <em>/ '+rows.length+'</em>';
el('visible-label').textContent=list.length+' plottable in selected benchmark';
el('metric-context').textContent=m.desc;
el('axis-units').textContent=m.unit+' · higher is better';
el('score-column').textContent=m.short;
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
dot.className='family-dot';dot.style.background=colors[f];text.textContent=f+' ('+rows.filter(r=>r.family===f).length+')';x.className='family-x';x.textContent=hidden.has(f)?'↺':'×';
btn.append(dot,text,x);
btn.addEventListener('click',()=>update({hidden:hidden.has(f)?state.hidden.filter(n=>n!==f):[...state.hidden,f]}));
familyHolder.append(btn);
});
el('filter-summary').textContent=(families.length-state.hidden.length)+' / '+families.length+' families shown';
}
function drawLegend(){
const l=el('legend');l.replaceChildren();
families.forEach(f=>{
const sp=document.createElement('span'),dot=document.createElement('i');dot.style.background=colors[f];
sp.append(dot,document.createTextNode(f));l.append(sp);
});
}
function drawDetail(){
const r=rows[state.selected],m=metricFor();
if(!r||state.hidden.includes(r.family)){details.innerHTML='<p class="panel-intro">Select a visible model to see its benchmarks.</p>';return;}
details.replaceChildren();
const name=document.createElement('div');name.className='model-name';name.textContent=r.name;
const sub=document.createElement('div');sub.className='model-sub';sub.textContent=r.family+' · Published rounded benchmark values';
const stats=document.createElement('div');stats.className='stat-row';
for(const [label,value] of [[m.short,formatValue(score(r),m)],['Cost / task',formatCost(r.cost)],['Intelligence',String(r.scores[0])]]){
const wrap=document.createElement('div');wrap.className='stat-box';
const a=document.createElement('small'),b=document.createElement('strong');a.textContent=label;b.textContent=value;wrap.append(a,b);stats.append(wrap);
}
const heading=document.createElement('h3');heading.textContent='All benchmark results';heading.style.cssText='font-size:12px;margin:12px 0;color:#c5daee';
const values=document.createElement('div');values.className='detail-values';
metrics.forEach(mm=>{const label=document.createElement('span'),value=document.createElement('strong');label.textContent=mm.name;value.textContent=formatValue(score(r,mm),mm);values.append(label,value);});
const link=document.createElement('a');link.className='detail-link';link.href='https://artificialanalysis.ai/';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Explore Artificial Analysis ↗';
details.append(name,sub,stats,heading,values,link);
}
function drawTable(){
const value=el('search').value.trim().toLowerCase(),m=metricFor(),efficient=new Set(frontier(visible()).map(r=>r.id));
body.replaceChildren();
rows.filter(r=>!state.hidden.includes(r.family)&&(!value||(r.name+' '+r.family).toLowerCase().includes(value))).sort((a,b)=>a.cost-b.cost).forEach(r=>{
const tr=document.createElement('tr');if(r.id===state.selected)tr.classList.add('selected');
for(const text of [r.name,r.family,formatCost(r.cost),formatValue(score(r),m),typeof score(r)!=='number'?'Not reported':efficient.has(r.id)?'Frontier':'Other']){
const td=document.createElement('td');td.textContent=text;
if(text==='Frontier')td.className='status-yes';if(text==='Not reported')td.className='status-no';
tr.appendChild(td);
}
tr.addEventListener('click',()=>{state.selected=r.id;render();const section=document.querySelector('.dashboard');section.scrollIntoView({behavior:'smooth',block:'start'});persist();});
body.appendChild(tr);
});
}
function render(){
el('zoom-range').value=state.zoom;el('frontier-toggle').checked=state.frontier;
el('y-zero-button').classList.toggle('active',state.yScale==='zero');
el('y-fit-button').classList.toggle('active',state.yScale==='fit');
el('y-zero-button').setAttribute('aria-pressed',String(state.yScale==='zero'));
el('y-fit-button').setAttribute('aria-pressed',String(state.yScale==='fit'));
el('linear-button').classList.toggle('active',state.scale==='linear');
el('log-button').classList.toggle('active',state.scale==='log');
drawMetricButtons();drawChart();drawFamilies();drawDetail();drawTable();
}
el('y-zero-button').addEventListener('click',()=>update({yScale:'zero'}));
el('y-fit-button').addEventListener('click',()=>update({yScale:'fit'}));
el('linear-button').addEventListener('click',()=>update({scale:'linear',start:0,zoom:1}));
el('log-button').addEventListener('click',()=>update({scale:'log',start:logMin,zoom:1}));
el('frontier-toggle').addEventListener('change',e=>update({frontier:e.target.checked}));
el('zoom-range').addEventListener('input',e=>{const z=Number(e.target.value),[a,b]=bounds();update({zoom:z,start:clamp(state.start,a,b-(b-a)/z)});});
document.querySelectorAll('[data-zoom]').forEach(b=>b.addEventListener('click',()=>update({zoom:Number(b.dataset.zoom),start:bounds()[0]})));
el('flip-all').addEventListener('click',()=>update({hidden:families.filter(f=>!state.hidden.includes(f))}));
el('show-all').addEventListener('click',()=>update({hidden:[]}));
el('search').addEventListener('input',drawTable);
el('download-csv').addEventListener('click',()=>{
const m=metricFor();
const head=['Model','Family','Cost per task USD',...metrics.map(x=>x.name),'Visible frontier'];
const ef=new Set(frontier(visible()).map(r=>r.id));
const items=allUnhidden().map(r=>[r.name,r.family,r.cost,...r.scores,typeof score(r)==='number' && ef.has(r.id)?'Yes':'No']);
const encode=row=>row.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',');
const csv=[head,...items].map(encode).join('\r\n');
const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
const a=document.createElement('a');a.href=url;a.download='modelscope-'+m.key+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
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
})();