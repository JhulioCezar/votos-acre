(() => {
 'use strict';
 const DATA=JSON.parse(document.getElementById('dashboard-data').textContent);
 const $=id=>document.getElementById(id);
 const candidates=new Map(DATA.candidates.map(c=>[c.id,c]));
 let current=candidates.get("7:55456"),rows=[];
 function setCandidate(number){
  current=candidates.get(state.cargo+':'+number)||DATA.candidates.filter(c=>c.cargo===state.cargo).slice().sort((a,b)=>b.total-a.total)[0];
  state.candidato=current.numero;
  rows=DATA.rows.map(r=>({...r,votos:r.votacao[current.id]||0}));
  DATA.meta.totalOficial=current.total;
  const office=DATA.offices.find(o=>o.codigo===state.cargo);
  $('office-name').textContent=office.nome+' · 1º turno';
  $('cargo').value=state.cargo;
  const v=office.estatisticas;
  $('office-stats').innerHTML=[['Votos registrados',v.tv],['Nominais válidos',v.vnom],['Legenda válida',v.vl||0],['Brancos',v.vb],['Nulos (total)',v.tvn],['Anulados sub judice',v.vansj]].map(([label,value])=>`<div><span>${label}</span><strong>${fmt.format(Number(value))}</strong></div>`).join('');
  $('office-note').textContent=state.cargo==='5'?'No Senado, cada eleitor podia votar em dois candidatos. O total registrado conta votos, não eleitores.':'Totais estaduais do TSE. Nominais válidos e legenda válida são categorias separadas; anulados sub judice não estão incluídos nesses votos válidos.';
  $('official-office-source').href=office.fonte;
  $('summary-csv').textContent='CSV dos candidatos do cargo';
  document.querySelector('#summary-csv').setAttribute('aria-label','Exportar resumo dos candidatos a '+office.nome);
  $("page-title").innerHTML=esc(current.nome)+" <span>"+esc(current.numero)+"</span>";
  $("candidate-details").textContent=current.partido+" · "+fmt.format(current.total)+" votos no Acre · "+current.situacao+" · "+current.destinacao;
  document.title=current.nome+" · "+office.nome+" · Votos no Acre";
  $("presence").options[1].text="Com votos em "+current.numero;
  $("presence").options[2].text="Sem votos em "+current.numero;
  if(!Array.from($("candidate").options).some(o=>o.value===current.numero)){
   $('candidate-search').value='';populateCandidates();
  }
  $("candidate").value=current.numero;
 }
 const fmt=new Intl.NumberFormat('pt-BR'), pct=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1});
 const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const names=new Map(DATA.rows.map(r=>[r.codigo,r.municipio]));
 const fields=['municipio','zona','local','presence','search','min','max'];
 const state={cargo:'7',candidato:'55456',municipio:'',zona:'',local:'',presence:'all',search:'',min:'',max:'',grouping:'municipio',limit:'10',sort:'votes-desc',page:1,pageSize:25};
 let filtered=[],searchTimer,toastTimer;
 const localKey=r=>[r.codigo,r.zona,r.local].join('|');
 const localLabel=r=>`Local ${r.local} · ${r.municipio} · Zona ${Number(r.zona)}`;
 const municipalities=[...names].sort((a,b)=>a[1].localeCompare(b[1],'pt-BR'));
 const filterBase=()=>rows.filter(r=>(!state.municipio||r.codigo===state.municipio)&&(!state.zona||r.zona===state.zona));
 function optionList(id,items,placeholder,value){const select=$(id);select.replaceChildren(new Option(placeholder,''),...items.map(([key,label])=>new Option(label,key)));select.value=value;}
 function updateOptions(){
  optionList('municipio',municipalities,'Todos os municípios',state.municipio);
  const scoped=rows.filter(r=>!state.municipio||r.codigo===state.municipio);
  const zones=[...new Set(scoped.map(r=>r.zona))].sort().map(z=>[z,`Zona ${Number(z)}`]);
  if(state.zona&&!zones.some(([z])=>z===state.zona))state.zona='';
  optionList('zona',zones,'Todas as zonas',state.zona);
  const localRows=new Map(filterBase().map(r=>[localKey(r),r]));
  const locals=[...localRows].sort((a,b)=>a[1].municipio.localeCompare(b[1].municipio,'pt-BR')||Number(a[1].zona)-Number(b[1].zona)||Number(a[1].local)-Number(b[1].local)).map(([key,r])=>[key,localLabel(r)]);
  if(state.local&&!localRows.has(state.local))state.local='';
  optionList('local',locals,'Todos os locais',state.local);
 }
 function applyFilter(){
  const min=state.min===''?0:Number(state.min),max=state.max===''?Infinity:Number(state.max);
  const invalid=!Number.isInteger(min)||min<0||(!Number.isInteger(max)&&max!==Infinity)||max<0||min>max;
  $('filter-error').textContent=invalid?'Informe limites inteiros e não negativos; o mínimo deve ser menor ou igual ao máximo.':'';
  if(invalid)return [];
  const terms=normalize(state.search.trim()).split(/\s+/).filter(Boolean);
  return filterBase().filter(r=>(!state.local||localKey(r)===state.local)&&(state.presence==='all'||(state.presence==='positive'?r.votos>0:r.votos===0))&&r.votos>=min&&r.votos<=max&&terms.every(q=>normalize(`${r.municipio} ${r.codigo} zona ${r.zona} secao ${r.secao} agregadas ${r.agregadas} local ${r.local}`).includes(q)));
 }
 function summarize(list){const votes=list.reduce((s,r)=>s+r.votos,0),positive=list.filter(r=>r.votos>0);return {votes,positive:positive.length,municipalities:new Set(positive.map(r=>r.codigo)).size,zones:new Set(positive.map(r=>r.zona)).size};}
 function renderMetrics(){
  const stats=summarize(filtered),fraction=filtered.length?100*stats.positive/filtered.length:0;
  $('total-votes').textContent=fmt.format(stats.votes);
  $('vote-share').textContent=`${pct.format((DATA.meta.totalOficial?stats.votes/DATA.meta.totalOficial*100:0))}% dos votos do candidato no Acre`;
  $('positive-sections').textContent=fmt.format(stats.positive);
  $('positive-share').textContent=`${pct.format(fraction)}% das ${fmt.format(filtered.length)} seções selecionadas`;
  $('active-municipalities').textContent=fmt.format(stats.municipalities);
  $('municipality-share').textContent=`de ${new Set(filtered.map(r=>r.codigo)).size} municípios na seleção`;
  $('active-zones').textContent=fmt.format(stats.zones);
  $('zone-share').textContent=`de ${new Set(filtered.map(r=>r.zona)).size} zonas na seleção`;
  $('result-count').textContent=`${fmt.format(filtered.length)} de ${fmt.format(rows.length)} seções`;
  const labels=[];
  if(state.municipio)labels.push(names.get(state.municipio));
  if(state.zona)labels.push(`Zona ${Number(state.zona)}`);
  if(state.local)labels.push(`Local ${state.local.split('|')[2]}`);
  if(state.presence!=='all')labels.push(state.presence==='positive'?'Com votos':'Sem votos');
  if(state.search)labels.push(`Busca: ${state.search}`);
  if(state.min!==''||state.max!=='')labels.push(`${state.min||'0'} a ${state.max||'∞'} votos por seção`);
  $('selection-description').textContent=labels.join(' · ')||'Todo o Acre';
  $('coverage-percent').textContent=filtered.length?`${pct.format(fraction)}%`:'—';
  $('coverage-positive').textContent=fmt.format(stats.positive);
  $('coverage-zero').textContent=fmt.format(filtered.length-stats.positive);
  $('coverage-note').textContent=`${fmt.format(filtered.length)} seções na seleção`;
  $('coverage-donut').style.background=`conic-gradient(var(--green) 0% ${fraction}%,#e4ebed ${fraction}% 100%)`;
  $('coverage-donut').setAttribute('aria-label',filtered.length?`${pct.format(fraction)}% das seções selecionadas têm votos em ${current.nome}`:'Nenhuma seção na seleção');
 }
 function groupData(list,grouping){
  const groups=new Map();
  for(const r of list){
   const key=grouping==='municipio'?r.codigo:grouping==='zona'?r.zona:localKey(r);
   if(!groups.has(key))groups.set(key,{key,label:grouping==='municipio'?r.municipio:grouping==='zona'?`Zona ${Number(r.zona)}`:localLabel(r),votes:0,sections:0,row:r});
   const g=groups.get(key);g.votes+=r.votos;g.sections++;
  }
  return [...groups.values()].sort((a,b)=>b.votes-a.votes||a.label.localeCompare(b.label,'pt-BR'));
 }
 function renderRanking(){
  const groups=groupData(filtered,state.grouping),shown=state.limit==='all'?groups:groups.slice(0,Number(state.limit)),max=groups[0]?.votes||1,total=summarize(filtered).votes;
  $('ranking').replaceChildren();
  if(!groups.length){$('ranking').innerHTML='<div class="empty">Nenhum resultado para os filtros selecionados.</div>';$('ranking-note').textContent='Nenhum grupo na seleção.';return;}
  for(const g of shown){
   const button=document.createElement('button');button.className='rank-row';button.type='button';
   button.setAttribute('aria-label',`${g.label}: ${fmt.format(g.votes)} votos em ${fmt.format(g.sections)} seções. Filtrar.`);
   button.innerHTML=`<div><div class="rank-name"><span title="${esc(g.label)}">${esc(g.label)}</span><small>${pct.format(total?g.votes/total*100:0)}%</small></div><div class="rank-bar"><span class="rank-fill" style="width:${g.votes/max*100}%;${g.votes===0?'visibility:hidden':''}"></span></div></div><strong>${fmt.format(g.votes)}</strong>`;
   button.addEventListener('click',()=>{
    if(state.grouping==='municipio'){state.municipio=g.key;state.zona='';state.local='';}
    else if(state.grouping==='zona'){state.zona=g.key;state.local='';}
    else {state.municipio=g.row.codigo;state.zona=g.row.zona;state.local=g.key;}
    updateOptions();render();
   });
   $('ranking').append(button);
  }
  $('ranking-note').textContent=`${shown.length} de ${groups.length} grupos. Percentuais sobre os votos da seleção. Clique para filtrar.`;
 }
 const bins=[{label:'Nenhum voto',min:0,max:0},{label:'1 voto',min:1,max:1},{label:'2 a 5 votos',min:2,max:5},{label:'6 a 10 votos',min:6,max:10},{label:'11 a 20 votos',min:11,max:20},{label:'21 votos ou mais',min:21,max:Infinity}];
 function renderDistribution(){
  const counts=bins.map(b=>filtered.filter(r=>r.votos>=b.min&&r.votos<=b.max).length),max=Math.max(1,...counts);
  $('distribution').replaceChildren();
  bins.forEach((b,i)=>{
   const button=document.createElement('button');button.className='hist-column';button.type='button';
   button.setAttribute('aria-label',`${b.label} por seção: ${fmt.format(counts[i])} seções. Filtrar essa faixa.`);
   button.innerHTML=`<span class="hist-label">${b.label}</span><span class="hist-track"><span class="hist-bar" style="width:${counts[i]/max*100}%;${counts[i]===0?'visibility:hidden':''}"></span></span><span class="hist-count">${fmt.format(counts[i])} ${counts[i]===1?'seção':'seções'}</span>`;
   button.addEventListener('click',()=>{state.presence='all';state.min=String(b.min);state.max=b.max===Infinity?'':String(b.max);syncInputs();render();});
   $('distribution').append(button);
  });
  const votes=filtered.map(r=>r.votos).sort((a,b)=>a-b),n=votes.length;
  $('median-value').textContent=`${fmt.format(n)} ${n===1?'seção analisada':'seções analisadas'}`;
  $('distribution-caption').textContent=n?`Exemplo: “2 a 5 votos” reúne as seções em que ${current.nome} recebeu de 2 a 5 votos. Maior votação em uma seção da seleção: ${fmt.format(votes[n-1])} votos.`:'Nenhuma seção atende aos filtros selecionados.';
 }
 const paths=new Map(),geo=DATA.geography.features,svg=$('acre-map');
 const NS='http://www.w3.org/2000/svg';
 const coords=[];
 function rings(feature){return feature.geometry.type==='Polygon'?feature.geometry.coordinates:feature.geometry.coordinates.flat();}
 geo.forEach(f=>rings(f).forEach(r=>r.forEach(p=>coords.push(p))));
 const minX=Math.min(...coords.map(c=>c[0])),maxX=Math.max(...coords.map(c=>c[0])),minY=Math.min(...coords.map(c=>c[1])),maxY=Math.max(...coords.map(c=>c[1]));
 const xFactor=Math.cos((minY+maxY)/2*Math.PI/180),scale=Math.min(820/((maxX-minX)*xFactor),390/(maxY-minY));
 const width=(maxX-minX)*xFactor*scale,height=(maxY-minY)*scale;
 const project=([lon,lat])=>[(900-width)/2+(lon-minX)*xFactor*scale,(470-height)/2+(maxY-lat)*scale];
 const mapGroup=document.createElementNS(NS,'g');svg.append(mapGroup);
 let mapStats=new Map(),view={x:0,y:0,w:900,h:470},drag=null,didDrag=false;
 for(const f of geo){
  const code=f.properties.codigo,path=document.createElementNS(NS,'path');path.classList.add('municipality-path');path.dataset.municipio=code;
  path.setAttribute('d',rings(f).map(r=>r.map((c,i)=>`${i?'L':'M'}${project(c).map(n=>n.toFixed(2)).join(',')}`).join(' ')+' Z').join(' '));
  path.setAttribute('role','button');path.setAttribute('tabindex','0');
  const title=document.createElementNS(NS,'title');path.append(title);mapGroup.append(path);paths.set(code,path);
  function select(){if(didDrag)return;state.municipio=state.municipio===code?'':code;state.zona='';state.local='';updateOptions();$('map-tooltip').hidden=true;render();}
  path.addEventListener('click',select);path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();didDrag=false;select();}});
  path.addEventListener('pointermove',e=>{
   if(drag?.moved)return;
   const info=mapStats.get(code)||{votes:0,sections:0},box=svg.parentElement.getBoundingClientRect();
   const tooltip=$('map-tooltip');tooltip.innerHTML=`<b>${esc(f.properties.nome)}</b><span>${fmt.format(info.votes)} votos · ${fmt.format(info.sections)} seções na seleção</span>`;tooltip.hidden=false;
   tooltip.style.left=`${Math.max(8,Math.min(e.clientX-box.left+12,box.width-245))}px`;tooltip.style.top=`${Math.max(8,Math.min(e.clientY-box.top+12,box.height-65))}px`;
  });
  path.addEventListener('pointerleave',()=>{$('map-tooltip').hidden=true;});
 }
 // A few geographic labels orient the map without inventing polling-place coordinates.
 for(const code of ['01074','01457','01392','01490']){
  const f=geo.find(f=>f.properties.codigo===code),ring=rings(f).sort((a,b)=>b.length-a.length)[0];
  const sum=ring.reduce((s,c)=>[s[0]+c[0],s[1]+c[1]],[0,0]);const p=project(sum.map(n=>n/ring.length));
  const text=document.createElementNS(NS,'text');text.setAttribute('x',p[0]);text.setAttribute('y',p[1]);text.setAttribute('text-anchor','middle');text.classList.add('map-label');text.textContent=f.properties.nome;mapGroup.append(text);
 }
 function renderMap(){
  mapStats=new Map(groupData(filtered,'municipio').map(g=>[g.key,g]));
  const max=Math.max(0,...[...mapStats.values()].map(g=>g.votes));
  const colors=['#cbe9d8','#91ccb0','#479d7f','#14694f'];
  for(const [code,path] of paths){
   const g=mapStats.get(code)||{votes:0,sections:0};
   const shade=g.votes===0?'#e0e8e9':colors[Math.min(3,Math.floor(Math.sqrt(g.votes/(max||1))*4))];
   path.setAttribute('fill',shade);path.classList.toggle('selected',state.municipio===code);path.setAttribute('aria-pressed',String(state.municipio===code));
   path.setAttribute('aria-label',`${names.get(code)}: ${fmt.format(g.votes)} votos em ${fmt.format(g.sections)} seções na seleção. Filtrar município.`);
   path.querySelector('title').textContent=`${names.get(code)}: ${fmt.format(g.votes)} votos, ${fmt.format(g.sections)} seções`;
  }
  $('legend-max').textContent=`${fmt.format(summarize(filtered).votes)} votos na seleção`;
  const swatches=[{color:'#e0e8e9',label:'Sem votos na seleção'}];
  for(let i=0;i<4;i++){
   const low=Math.max(1,Math.ceil(max*i*i/16)),high=i===3?max:Math.ceil(max*(i+1)*(i+1)/16)-1;
   if(high>=low)swatches.push({color:colors[i],label:low===high?`${fmt.format(low)} voto${low===1?'':'s'}`:`${fmt.format(low)} a ${fmt.format(high)} votos`});
  }
  $('map-legend').innerHTML=swatches.map(s=>`<span class="legend-item"><i style="background:${s.color}"></i><span>${s.label}</span></span>`).join('');
  $('map-current').textContent=state.municipio?names.get(state.municipio):'Todo o Acre';
  const g=mapStats.get(state.municipio);
  $('map-summary').textContent=state.municipio?`${names.get(state.municipio)}: ${fmt.format(g?.votes||0)} votos em ${fmt.format(g?.sections||0)} seções na seleção. Toque novamente no município para remover esse filtro.`:'Selecione um município no mapa para explorar suas seções.';
 }
 function setView(){svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);}
 function zoom(factor){const w=Math.max(180,Math.min(900,view.w*factor)),h=w*470/900;view={x:view.x+(view.w-w)/2,y:view.y+(view.h-h)/2,w,h};setView();}
 $('zoom-in').addEventListener('click',()=>zoom(.78));$('zoom-out').addEventListener('click',()=>zoom(1/.78));
 $('zoom-reset').addEventListener('click',()=>{view={x:0,y:0,w:900,h:470};setView();});
 svg.addEventListener('pointerdown',e=>{if(!e.isPrimary)return;didDrag=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY,view:{...view},moved:false};});
 svg.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(Math.abs(dx)+Math.abs(dy)<8&&!drag.moved)return;
  if(view.w>=900)return;
  drag.moved=true;didDrag=true;$('map-tooltip').hidden=true;svg.setPointerCapture(e.pointerId);
  const box=svg.getBoundingClientRect();const unit=Math.max(drag.view.w/box.width,drag.view.h/box.height);
  view.x=Math.max(-60,Math.min(960-view.w,drag.view.x-dx*unit));view.y=Math.max(-40,Math.min(510-view.h,drag.view.y-dy*unit));setView();
 });
 function endDrag(e){if(drag?.id===e.pointerId){if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);drag=null;setTimeout(()=>{didDrag=false;},50);}}
 svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
 function sortedRows(){
  const list=filtered.filter(r=>!state.municipio||r.votos>0),base=(a,b)=>a.municipio.localeCompare(b.municipio,'pt-BR')||Number(a.zona)-Number(b.zona)||Number(a.secao)-Number(b.secao);
  list.sort(state.sort==='votes-desc'?(a,b)=>b.votos-a.votos||base(a,b):state.sort==='votes-asc'?(a,b)=>a.votos-b.votos||base(a,b):state.sort==='section'?(a,b)=>Number(a.zona)-Number(b.zona)||Number(a.secao)-Number(b.secao)||base(a,b):base);
  return list;
 }
 function renderTable(){
  const sorted=sortedRows(),pages=Math.max(1,Math.ceil(sorted.length/state.pageSize));state.page=Math.min(Math.max(1,state.page),pages);
  $('table-note').textContent=state.municipio?`Neste município, a tabela e o CSV exibem somente seções com votos em ${current.nome}. Os gráficos também consideram as seções sem votos, conforme os filtros.`:`A tabela exibe todas as seções da seleção. Selecione um município para ver somente as seções com votos em ${current.nome}.`;
  const start=(state.page-1)*state.pageSize,visible=sorted.slice(start,start+state.pageSize);
  $('table-body').innerHTML=visible.length?visible.map(r=>`<tr><td>${esc(r.municipio)}</td><td class="code">${esc(r.codigo)}</td><td class="code">${esc(r.zona)}</td><td class="code">${esc(r.secao)}</td><td class="code">${esc(r.agregadas)||'—'}</td><td class="code">${esc(r.local)}</td><td class="number vote-cell ${r.votos===0?'no-votes':''}">${fmt.format(r.votos)}</td><td><span class="status">${esc(r.situacao)}</span></td><td><a class="bu-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" title="${esc(r.arquivo)}" aria-label="Abrir boletim ${esc(r.arquivo)}">Abrir BU</a></td></tr>`).join(''):'<tr><td colspan="9"><div class="empty">Nenhuma seção encontrada. Ajuste os filtros ou use “Limpar filtros”.</div></td></tr>';
  $('page-description').textContent=sorted.length?`${fmt.format(start+1)}–${fmt.format(start+visible.length)} de ${fmt.format(sorted.length)} seções · Página ${state.page} de ${pages}`:'0 seções encontradas';
  $('prev').disabled=state.page<=1;$('next').disabled=state.page>=pages;
 }
 function writeURL(){
  const params=new URLSearchParams();params.set('cargo',state.cargo);params.set('candidato',state.candidato);for(const f of fields){if(state[f]!==''&&!(f==='presence'&&state[f]==='all'))params.set(f,state[f]);}
  if(state.grouping!=='municipio')params.set('grouping',state.grouping);
  if(state.limit!=='10')params.set('limit',state.limit);
  if(state.sort!=='votes-desc')params.set('sort',state.sort);
  const hash=params.toString()?`#filtros=${params.toString()}`:'';
  try{history.replaceState(null,'',location.pathname+location.search+hash);}catch{/* file:// hosts may restrict history. Data stays functional. */}
 }
 function syncInputs(){for(const f of fields){if(!['municipio','zona','local'].includes(f))$(f).value=state[f];}$('grouping').value=state.grouping;$('rank-limit').value=state.limit;$('sort').value=state.sort;$('page-size').value=String(state.pageSize);}
 function render(resetPage=true){if(resetPage)state.page=1;filtered=applyFilter();renderMetrics();renderRanking();renderDistribution();renderMap();renderTable();writeURL();}
 function restoreURL(){
  const params=new URLSearchParams(location.hash.startsWith('#filtros=')?location.hash.slice(9):'');
  state.cargo=DATA.offices.some(o=>o.codigo===params.get('cargo'))?params.get('cargo'):'7';
  setCandidate(params.get('candidato')||'55456');
  populateCandidates($('candidate-search').value);
  for(const f of fields)state[f]=params.get(f)||(f==='presence'?'all':'');
  if(!names.has(state.municipio))state.municipio='';
  if(!['all','positive','zero'].includes(state.presence))state.presence='all';
  state.grouping=['municipio','zona','local'].includes(params.get('grouping'))?params.get('grouping'):'municipio';
  state.limit=params.get('limit')==='all'?'all':'10';state.sort=['votes-desc','votes-asc','municipality','section'].includes(params.get('sort'))?params.get('sort'):'votes-desc';
  updateOptions();syncInputs();render();
 }
 for(const f of ['municipio','zona','local','presence'])$(f).addEventListener('change',()=>{
  state[f]=$(f).value;
  if(f==='municipio'){state.zona='';state.local='';}if(f==='zona')state.local='';
  updateOptions();render();
 });
 for(const f of ['min','max'])$(f).addEventListener('input',()=>{state[f]=$(f).value;render();});
 $('search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{state.search=$('search').value;render();},150);});
 $('grouping').addEventListener('change',()=>{state.grouping=$('grouping').value;renderRanking();writeURL();});
 $('rank-limit').addEventListener('change',()=>{state.limit=$('rank-limit').value;renderRanking();writeURL();});
 $('sort').addEventListener('change',()=>{state.sort=$('sort').value;state.page=1;renderTable();writeURL();});
 $('page-size').addEventListener('change',()=>{state.pageSize=Number($('page-size').value);state.page=1;renderTable();});
 $('prev').addEventListener('click',()=>{state.page--;renderTable();});$('next').addEventListener('click',()=>{state.page++;renderTable();});
 $('reset').addEventListener('click',()=>{clearTimeout(searchTimer);for(const f of fields)state[f]=f==='presence'?'all':'';updateOptions();syncInputs();render();});
 $('table-csv').addEventListener('click',()=>$('csv').click());
 $('csv').addEventListener('click',()=>{
  const columns=['Cargo','Turno','Candidato','Número','Partido','Município','Código TSE','Zona','Seção','Agregadas','Local','Votos do candidato','Situação','Arquivo original','URL oficial do BU'];
  // Excel-compatible CSV: retain leading zeros and prevent formula injection.
  const cell=(v,identifier=false)=>{let s=String(v??'');if(identifier)s=`="${s.replace(/"/g,'""')}"`;else if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
  const lines=[columns.map(c=>cell(c)).join(';'),...sortedRows().map(r=>[cell(DATA.offices.find(o=>o.codigo===state.cargo).nome),cell(1),cell(current.nome),cell(current.numero,true),cell(current.partido),cell(r.municipio),cell(r.codigo,true),cell(r.zona,true),cell(r.secao,true),cell(r.agregadas),cell(r.local,true),cell(r.votos),cell(r.situacao),cell(r.arquivo),cell(r.url)].join(';'))];
  const blob=new Blob(['\uFEFF'+lines.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`acre-cargo-${state.cargo}-candidato-${current.numero}-selecao.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);notify(`${fmt.format(sortedRows().length)} seções exportadas em CSV.`);
 });
 function notify(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true;},4500);}
 $('share').addEventListener('click',async()=>{
  if(location.protocol==='file:'){notify('Publique no GitHub Pages para compartilhar um endereço público.');return;}
  writeURL();try{await navigator.clipboard.writeText(location.href);notify('Link com os filtros copiado.');}catch{window.prompt('Copie o link com os filtros:',location.href);}
 });
 window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#filtros=')||!location.hash)restoreURL();});
 function populateCandidates(query=''){
  const terms=normalize(query).split(/\s+/).filter(Boolean);
  const scoped=DATA.candidates.filter(c=>c.cargo===state.cargo);
  const items=scoped.filter(c=>c.numero===state.candidato||terms.every(t=>normalize(c.nome+' '+c.nomeCompleto+' '+c.numero+' '+c.partido).includes(t)));
  $('candidate').replaceChildren(...items.map(c=>new Option(`${c.nome} · ${c.numero} · ${c.partido}`,c.numero)));
  $('candidate').value=state.candidato;
  $('candidate-count').textContent=`${items.length} de ${scoped.length} candidatos do cargo`;
 }
 $('cargo').replaceChildren(...DATA.offices.map(o=>new Option(o.nome,o.codigo)));
 $('cargo').value=state.cargo;
 $('cargo').addEventListener('change',()=>{state.cargo=$('cargo').value;state.candidato='';$('candidate-search').value='';populateCandidates();setCandidate('');populateCandidates();render();});
 $('candidate-search').addEventListener('input',()=>populateCandidates($('candidate-search').value));
 $('candidate').addEventListener('change',()=>{setCandidate($('candidate').value);render();});
 $('office-csv').addEventListener('click',()=>{
  const office=DATA.offices.find(o=>o.codigo===state.cargo),scoped=DATA.candidates.filter(c=>c.cargo===state.cargo);
  const cell=v=>'"'+String(v).replace(/"/g,'""')+'"';
  const lines=[['Cargo','Turno','Município','Código TSE','Zona','Seção','Agregadas','Local','Nominais do cadastro nos boletins','Nominais anulados sub judice (incluídos na coluna anterior)','Números fora do resumo (nulos técnicos)','Detalhe dos números fora do resumo','Legenda nos boletins','Brancos','Nulos de urna','Total registrado','URL do BU']];
  for(const r of DATA.rows){
   const other=r.outrosVotos[state.cargo]||{},outside=Object.entries(r.numerosForaResumo).filter(([id])=>id.startsWith(state.cargo+':'));
   const nominal=scoped.reduce((sum,c)=>sum+(r.votacao[c.id]||0),0),judicial=scoped.filter(c=>normalize(c.destinacao).includes('sub judice')).reduce((sum,c)=>sum+(r.votacao[c.id]||0),0),technical=outside.reduce((sum,[id,v])=>sum+v,0);
   const total=nominal+technical+Object.values(other).reduce((sum,v)=>sum+v,0);
   lines.push([office.nome,1,r.municipio,r.codigo,r.zona,r.secao,r.agregadas,r.local,nominal,judicial,technical,outside.map(([id,v])=>id.split(':')[1]+': '+v).join(' | '),other['4']||0,other['2']||0,other['3']||0,total,r.url]);
  }
  const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.map(r=>r.map(cell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`acre-cargo-${state.cargo}-todas-secoes.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);notify('2.270 seções do cargo exportadas, incluindo legenda, brancos e nulos.');
 });
 $('summary-csv').addEventListener('click',()=>{
  const cell=v=>'"'+String(v).replace(/"/g,'""')+'"';
  const lines=[['Candidato','Número','Partido','Votos nominais no Acre','Situação','Destinação dos votos'],...DATA.candidates.filter(c=>c.cargo===state.cargo).slice().sort((a,b)=>b.total-a.total).map(c=>[c.nome,c.numero,c.partido,c.total,c.situacao,c.destinacao])];
  const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.map(r=>r.map(cell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`acre-cargo-${state.cargo}-resumo.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);notify('Resumo dos candidatos do cargo exportado.');
 });
 populateCandidates();restoreURL();
})();
