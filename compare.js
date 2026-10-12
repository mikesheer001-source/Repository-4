(() => {
'use strict';
const source=window.AI_BENCHMARK_DATA;
const $=id=>document.getElementById(id);
if(!source||!Array.isArray(source.models)){
  $('pick-message').textContent='Benchmark data failed to load. Try refreshing.';
  return;
}
const metrics=[
{key:'index',label:'Intelligence',title:'Artificial Analysis Intelligence Index',unit:'index points',pos:0,description:'Composite intelligence'},
{key:'briefcase',label:'AA-Briefcase',title:'AA-Briefcase v1.1',unit:'Elo',pos:1,description:'Agentic knowledge work'},
{key:'gdpval',label:'GDPval-AA',title:'GDPval-AA v2.1',unit:'Elo',pos:2,description:'Professional work'},
{key:'automation',label:'AutomationBench',title:'AutomationBench-AA',unit:'%',pos:3,description:'Workflow automation'},
{key:'terminal',label:'Terminal-Bench',title:'Terminal-Bench 4.0',unit:'%',pos:4,description:'Coding and terminal tasks'},
{key:'scicode',label:'SciCode',title:'SciCode',unit:'%',pos:5,description:'Scientific coding'},
{key:'hle',label:'HLE',title:"Humanity's Last Exam",unit:'%',pos:6,description:'Advanced reasoning'},
{key:'gdppdf',label:'GDP.pdf',title:'GDP.pdf',unit:'%',pos:7,description:'Document reasoning'},
{key:'critpt',label:'CritPt',title:'CritPt',unit:'%',pos:8,description:'Physics reasoning'},
{key:'omni',label:'Omniscience',title:'AA-Omniscience Index',unit:'index points',pos:9,description:'Factual reliability'},
{key:'lcr',label:'Long context',title:'AA-LCR v1.1',unit:'%',pos:10,description:'Long-context reasoning'}
];
const colors={
'GPT-6 Luna':'#96a8bb','GPT-6.1 Sol':'#60a5fa','GPT-6 Sol':'#fb923c','GPT-5.6 Sol':'#c084fc',
'GPT-6 Astra':'#2dd4bf','Claude Opus 5.5':'#e8a078','Gemini 3.8 Flash':'#b1d65b',
'Gemini 4 Argon':'#4ade80','GLM-5.3':'#38bdf8','Muse Spark':'#f472b6','Kimi K3':'#a78bfa','Grok 4.6':'#c4b5fd'};
const live=window.AI_DAILY_UPDATES||{},liveModels=live.models||{};
let refreshCount=0;
const models=source.models.map((entry,id)=>{
  const r={id,name:entry[0],family:entry[1],cost:entry[2],scores:entry.slice(3)};
  const upd=liveModels[r.name];
  if(upd && typeof upd==='object'){
    let changed=false;
    if(typeof upd.index==='number' && Number.isFinite(upd.index) && upd.index>=-100 && upd.index<=200){
      r.scores[0]=upd.index;changed=true;
    }
    if(typeof upd.cost==='number' && Number.isFinite(upd.cost) && upd.cost>0 && upd.cost<=1000){
      r.cost=upd.cost;changed=true;
    }
    if(changed)refreshCount++;
  }
  return r;
});
const families=[...new Set(models.map(m=>m.family))];
const metric=()=>metrics.find(m=>m.key===state.metric)||metrics[0];
const byId=id=>models.find(m=>m.id===id);
const score=(r,m=metric())=>r.scores[m.pos];
const money=n=>n<.01?'$'+n.toFixed(4):n<.1?'$'+Number(n.toFixed(3)):'$'+Number(n.toFixed(2));
const fmt=(n,m=metric())=>n==null?'—':m.unit==='%'?n+'%':m.unit==='Elo'?Number(n).toLocaleString()+' Elo':String(n);
const metricExists=value=>metrics.some(m=>m.key===value);
function sanitized(list){
  if(!Array.isArray(list))return [];
  return [...new Set(list.map(Number).filter(id=>Number.isInteger(id)&&id>=0&&id<models.length))].slice(0,8);
}
let priorSelection=null, priorMetric=null;
try {
  const saved=JSON.parse(localStorage.getItem('modelscope-compare')||'null');
  priorSelection=saved?.ids;
  priorMetric=saved?.metric;
}catch(e){}
const url=new URL(location.href);
if(url.searchParams.has('models')){const ids=url.searchParams.get('models').trim();priorSelection=ids?ids.split(',').filter(x=>x.trim()!=='').map(Number):[];}
if(url.searchParams.has('m'))priorMetric=url.searchParams.get('m');
if(!Array.isArray(priorSelection)){
  let fromExplorer;
  try {fromExplorer=JSON.parse(localStorage.getItem('modelscope-settings')||'{}').selected;}catch(e){}
  const defaults=[fromExplorer,models.find(r=>r.name==='Claude Opus 5.5 high')?.id,models.find(r=>r.name==='GLM-5.3 Flash')?.id];
  priorSelection=sanitized(defaults);
}
let state={selected:sanitized(priorSelection),metric:metricExists(priorMetric)?priorMetric:'index',query:'',family:''};
const maxSelected=8;
const svgns='http://www.w3.org/2000/svg';
function svg(tag,attrs={},parent,text){
  const elem=document.createElementNS(svgns,tag);
  Object.entries(attrs).forEach(([key,value])=>elem.setAttribute(key,String(value)));
  if(text!==undefined)elem.textContent=String(text);
  parent.append(elem);
  return elem;
}
function selectedRows(){return state.selected.map(byId).filter(Boolean);}
function persist(){
  try {
    localStorage.setItem('modelscope-compare',JSON.stringify({ids:state.selected,metric:state.metric}));
    const link=new URL(location.href);
    link.searchParams.set('models',state.selected.join(','));
    link.searchParams.set('m',state.metric);
    history.replaceState(null,'',link);
  }catch(e){}
}
function change(next,msg){
  state={...state,...next};
  if(msg!==undefined)$('pick-message').textContent=msg;
  render();
  persist();
}
function toggle(id){
  if(state.selected.includes(id)){
    change({selected:state.selected.filter(x=>x!==id)},'Removed from comparison.');
  }else if(state.selected.length>=maxSelected){
    $('pick-message').textContent='You can compare up to eight models. Remove one before adding another.';
  }else{
    change({selected:[...state.selected,id]},'Model added to comparison.');
  }
}
function addText(tag,txt,parent,cls){
  const item=document.createElement(tag);
  item.textContent=txt;
  if(cls)item.className=cls;
  parent.append(item);
  return item;
}
function paintOptions(){
  const q=state.query.trim().toLocaleLowerCase(),container=$('model-options');
  container.replaceChildren();
  const candidates=models.filter(r=>(!state.family||r.family===state.family)&&(!q||(r.name+' '+r.family).toLowerCase().includes(q)));
  for(const m of candidates){
    const label=document.createElement('label');
    label.className='option-item'+(state.selected.includes(m.id)?' picked':'')+(state.selected.length>=maxSelected&&!state.selected.includes(m.id)?' disabled':'');
    label.title=m.name;
    const cb=document.createElement('input');cb.type='checkbox';cb.checked=state.selected.includes(m.id);
    cb.disabled=state.selected.length>=maxSelected&&!cb.checked;
    cb.setAttribute('aria-label',m.name);
    cb.addEventListener('change',()=>toggle(m.id));
    addText('span',m.name,label,'option-text');
    const text=label.querySelector('.option-text');
    label.prepend(cb);
    addText('span',money(m.cost),label,'option-cost');
    container.append(label);
  }
  if(!candidates.length)addText('div','No matching models. Change your search or family filter.',container,'selection-placeholder');
  $('selected-counter').textContent=state.selected.length+' / '+maxSelected+' selected';
}
function paintChips(){
  const target=$('selected-chips');
  target.replaceChildren();
  for(const m of selectedRows()){
    const chip=document.createElement('div');chip.className='selection-chip';
    const dot=document.createElement('i');dot.style.background=colors[m.family]||'#bbb';
    const label=addText('span',m.name,chip);
    const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.title='Remove '+m.name;remove.setAttribute('aria-label','Remove '+m.name);
    remove.addEventListener('click',()=>toggle(m.id));
    chip.prepend(dot);chip.append(remove);target.append(chip);
  }
  if(!state.selected.length)addText('span','No models selected. Choose two or more below.',target,'selection-placeholder');
}
function paintMetricButtons(){
  const buttons=$('compare-metric-buttons');buttons.replaceChildren();
  for(const m of metrics){
    const b=document.createElement('button');
    b.type='button';b.className='metric-button'+(m.key===state.metric?' active':'');
    b.textContent=m.label;b.title=m.title+' · '+m.description;
    b.setAttribute('aria-pressed',m.key===state.metric?'true':'false');
    b.addEventListener('click',()=>change({metric:m.key}));
    buttons.append(b);
  }
  $('metric-description').textContent=metric().description+' · '+metric().unit;
}
function clearChart(target,note){
  target.replaceChildren();
  addText('div',note,target,'chart-note');
}
function makeChart(target,items,{title,valueOf,format,isCost=false}){
  target.replaceChildren();
  if(!items.length){clearChart(target,'Select at least one model to display the chart.');return;}
  const valid=items.filter(m=>typeof valueOf(m)==='number'&&Number.isFinite(valueOf(m)));
  if(!valid.length){clearChart(target,'None of the selected models have a reported score for this benchmark.');return;}
  const sorted=[...valid].sort((a,b)=>isCost?valueOf(a)-valueOf(b):valueOf(b)-valueOf(a));
  const narrow=target.getBoundingClientRect().width<610;
  const W=Math.max(345,Math.round(target.clientWidth-12)),left=narrow?128:240,right=narrow?64:100;
  const top=32,rowHeight=narrow?48:46,plotHeight=Math.max(1,sorted.length)*rowHeight,bottom=47,H=top+plotHeight+bottom;
  const chart=document.createElementNS(svgns,'svg');chart.setAttribute('viewBox','0 0 '+W+' '+H);
  chart.setAttribute('role','img');
  chart.setAttribute('aria-label',title+' for '+sorted.map(m=>m.name).join(', '));
  target.append(chart);
  const minData=Math.min(...valid.map(valueOf)),maxData=Math.max(...valid.map(valueOf));
  // Charts share a true zero baseline. Omniscience may have negative values.
  const min=Math.min(0,minData),max=Math.max(0,maxData),span=Math.max(0.001,max-min);
  const pad=span*0.12;
  const lo=min<0?min-pad:0,hi=max+pad;
  const plotWidth=Math.max(55,W-left-right);
  const axis=x=>left+((x-lo)/(hi-lo))*plotWidth;
  const zero=axis(0);
  const ticks=[];
  if(lo<0)ticks.push(lo);
  ticks.push(0);
  if(hi>0){ticks.push(hi/2,hi);}
  const unique=[...new Set(ticks.map(x=>Number(x.toFixed(4))))];
  for(const t of unique){
    const x=axis(t);
    svg('line',{x1:x,y1:top-11,x2:x,y2:H-bottom+5,class:'axis-line'},chart);
    svg('text',{x,y:H-13,'text-anchor':'middle',class:'axis-value'},chart,
      isCost?money(t):metric().unit==='Elo'?Math.round(t).toLocaleString():Number(t.toFixed(1)).toString());
  }
  svg('line',{x1:zero,y1:top-12,x2:zero,y2:H-bottom+4,class:'zero-line'},chart);
  sorted.forEach((m,i)=>{
    const y=top+i*rowHeight;
    const name=m.name.length>(narrow?20:31)?m.name.slice(0,narrow?19:30)+'…':m.name;
    const label=svg('text',{x:10,y:y+18,class:'chart-label'},chart,name);
    svg('title',{},label,m.name);
    const value=valueOf(m),x=axis(value),barX=Math.min(x,zero);
    const barWidth=Math.max(2,Math.abs(x-zero));
    const bg=svg('rect',{x:barX,y:y+1,width:barWidth,height:27,rx:6,fill:colors[m.family]||'#aac5e0',opacity:.92},chart);
    svg('title',{},bg,m.name+': '+format(value));
    const val=svg('text',{x:W-6,y:y+19,'text-anchor':'end',class:'chart-value'},chart,format(value));
    svg('title',{},val,m.name+' — '+format(value));
    if(i<sorted.length-1)svg('line',{x1:8,y1:y+rowHeight-8,x2:W-8,y2:y+rowHeight-8,class:'axis-line'},chart);
  });
  const mlabel=isCost?'USD per task':metric().title+' · '+metric().unit;
  svg('text',{x:(left+W-right)/2,y:H-1,'text-anchor':'middle',class:'axis-value'},chart,mlabel);
  const missing=items.filter(m=>!valid.includes(m));
  if(missing.length){
    const note=document.createElement('div');note.className='chart-note';
    note.textContent=missing.map(m=>m.name).join(', ')+' — score not reported.';
    target.append(note);
  }
}
function renderCharts(){
  makeChart($('performance-chart'),selectedRows(),{
    title:metric().title,
    valueOf:m=>score(m),
    format:v=>fmt(v),
  });
  makeChart($('cost-chart'),selectedRows(),{
    title:'Cost per task',
    valueOf:m=>m.cost,
    format:money,
    isCost:true,
  });
}
function renderTable(){
  const head=$('comparison-head'),tbody=$('comparison-body');
  head.replaceChildren();tbody.replaceChildren();
  const items=selectedRows();
  const tr=document.createElement('tr');
  addText('th','Measurement',tr);
  for(const r of items){
    const th=addText('th',r.name,tr);
    th.title=r.name;
  }
  head.append(tr);
  if(!items.length){
    const row=document.createElement('tr'),td=document.createElement('td');
    td.colSpan=1;td.textContent='Select models above to display the benchmark breakdown.';
    row.append(td);tbody.append(row);return;
  }
  function dataRow(title,valueFn,formatFn,higher=true){
    const row=document.createElement('tr');
    if(title==='Cost per task'||title==='Intelligence Index')row.className='total-row';
    addText('td',title,row);
    const values=items.map(valueFn).filter(v=>v!==null&&v!==undefined&&Number.isFinite(v));
    const best=values.length?(higher?Math.max(...values):Math.min(...values)):null;
    for(const model of items){
      const n=valueFn(model),td=addText('td',n==null?'—':formatFn(n),row);
      if(n==null)td.classList.add('empty-score');
      else if(n===best)td.classList.add('best-score');
    }
    tbody.append(row);
  }
  dataRow('Cost per task',r=>r.cost,money,false);
  for(const m of metrics)dataRow(m.title,r=>score(r,m),v=>fmt(v,m),true);
}
function render(){
  paintOptions();paintChips();paintMetricButtons();renderCharts();renderTable();
}
const select=$('family-filter');
for(const family of families){
  const opt=document.createElement('option');opt.value=family;opt.textContent=family;select.append(opt);
}
$('model-search').addEventListener('input',e=>{state.query=e.target.value;paintOptions();});
select.addEventListener('change',e=>{state.family=e.target.value;paintOptions();});
$('clear-selection').addEventListener('click',()=>change({selected:[]},'Cleared comparison.'));
$('copy-link').addEventListener('click',async()=>{
  persist();
  try{
    await navigator.clipboard.writeText(location.href);
    $('pick-message').textContent='Comparison link copied.';
  }catch(e){
    $('pick-message').textContent='Copy the URL from your address bar to share this comparison.';
  }
});
if(refreshCount && typeof live.updated_at==='string'){
  $('compare-data-status').textContent='Basic scores and costs refreshed '+live.updated_at.slice(0,10)+' UTC for '+refreshCount+' models; detailed benchmarks remain a snapshot.';
}else{
  $('compare-data-status').textContent='Static benchmark snapshot; automatic basic-score updates await API access and permission.';
}
let resizeHandle;
if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{
  clearTimeout(resizeHandle);
  resizeHandle=setTimeout(renderCharts,75);
}).observe($('performance-chart'));
render();
persist();
})();