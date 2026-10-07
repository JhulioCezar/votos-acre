(() => {
 'use strict';
 const DATA=JSON.parse(document.getElementById('dashboard-data').textContent);
 const $=id=>document.getElementById(id);
 const themeMedia=matchMedia('(prefers-color-scheme: dark)');
 let themePreference='system';try{themePreference=localStorage.getItem('votos-acre-theme')||'system';}catch{}
 if(!['system','light','dark'].includes(themePreference))themePreference='system';
 function applyTheme(){document.documentElement.dataset.theme=themePreference==='system'?(themeMedia.matches?'dark':'light'):themePreference;$('theme').value=themePreference;}
 $('theme').addEventListener('change',()=>{themePreference=$('theme').value;try{localStorage.setItem('votos-acre-theme',themePreference);}catch{}applyTheme();});
 themeMedia.addEventListener('change',applyTheme);applyTheme();
 const candidates=new Map(DATA.candidates.map(c=>[c.id,c]));
 let current=null,rows=[],activeView='home';
 function setCandidate(number){
  activeView=state.cargo;
  current=candidates.get(state.cargo+':'+number)||DATA.candidates.filter(c=>c.cargo===state.cargo).slice().sort((a,b)=>b.total-a.total)[0];
  state.candidato=current.numero;
  const photo=$('candidate-photo');photo.hidden=!current.foto;photo.alt='Foto oficial de '+current.nome;if(current.foto)photo.src=current.foto;else photo.removeAttribute('src');

  document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id==='general-overview');
  document.querySelectorAll('.main-grid,.secondary-grid').forEach(s=>s.hidden=false);
  $('generate-report').disabled=false;
  renderElectorate();
  $('share').hidden=false;
  rows=DATA.rows.map(r=>({...r,votos:r.votacao[current.id]||0}));
  DATA.meta.totalOficial=current.total;
  const office=DATA.offices.find(o=>o.codigo===state.cargo);
  $('office-name').textContent=office.nome+' · 1º turno';
  $('cargo').value=state.cargo;
  const v=office.estatisticas;
  $('office-stats').innerHTML=[['Votos registrados',v.tv],['Nominais válidos',v.vnom],['Legenda válida',v.vl||0],['Brancos',v.vb],['Nulos (total)',v.tvn],['Anulados sub judice',v.vansj]].map(([label,value])=>`<div><span>${label}</span><strong>${fmt.format(Number(value))}</strong></div>`).join('');
  $('office-note').textContent=state.cargo==='5'?'No Senado, cada eleitor podia votar em dois candidatos. O total registrado conta votos, não eleitores.':'Totais estaduais do TSE. Nominais válidos e legenda válida são categorias separadas; anulados sub judice não estão incluídos nesses votos válidos.';
  $('official-office-source').href=office.fonte;
  $('generate-report').textContent='Gerar Relatório';
  document.querySelector('#generate-report').setAttribute('aria-label','Gerar relatório dos filtros selecionados');
  $("page-title").innerHTML=esc(current.nome)+" <span>"+esc(current.numero)+"</span>";
  $("candidate-details").textContent=current.partido+" · "+fmt.format(current.total)+" votos no Acre · "+current.situacao+" · "+current.destinacao;
  document.title=current.nome+" · "+office.nome+" · Votos no Acre";
  $("presence").options[1].text="Com votos em "+current.numero;
  $("presence").options[2].text="Sem votos em "+current.numero;
  if(!Array.from($("candidate").options).some(o=>o.value===current.id)){
   $('candidate-search').value='';populateCandidates();
  }
  $("candidate").value=current.id;
  updateOptions();syncInputs();
 }
 const fmt=new Intl.NumberFormat('pt-BR'), pct=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1});
 const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const names=new Map(DATA.rows.map(r=>[r.codigo,r.municipio]));
 const fields=['municipio','regional','bairro','zona','local','presence','search','min','max'];
 const state={cargo:'',candidato:'',municipio:'',regional:'',bairro:'',zona:'',local:'',presence:'all',search:'',min:'',max:'',grouping:'municipio',limit:'10',sort:'votes-desc',page:1,pageSize:25};
 let filtered=[],searchTimer,toastTimer;
 const localKey=r=>[r.codigo,r.zona,r.local].join('|');
 const localLabel=r=>`${r.localNome||"Local "+r.local} · ${r.municipio} · Zona ${Number(r.zona)} · ${r.local}`;
 const municipalities=[...names].sort((a,b)=>a[1].localeCompare(b[1],'pt-BR'));
 const filterBase=()=>rows.filter(r=>(!state.municipio||r.codigo===state.municipio)&&(!state.zona||r.zona===state.zona)&&(!state.regional||(r.regional||'Não identificado')===state.regional)&&(!state.bairro||(r.bairro||'Não identificado')===state.bairro));
 function optionList(id,items,placeholder,value){const select=$(id);select.replaceChildren(new Option(placeholder,''),...items.map(([key,label])=>new Option(label,key)));select.value=value;}
 function updateOptions(){
  optionList('municipio',municipalities,'Todos os municípios',state.municipio);
  const scoped=rows.filter(r=>!state.municipio||r.codigo===state.municipio);
  const zones=[...new Set(scoped.map(r=>r.zona))].sort().map(z=>[z,`Zona ${Number(z)}`]);
  if(state.zona&&!zones.some(([z])=>z===state.zona))state.zona='';
  optionList('zona',zones,'Todas as zonas',state.zona);
  for(const field of ['regional','bairro']){const scope=rows.filter(r=>(!state.municipio||r.codigo===state.municipio)&&(!state.zona||r.zona===state.zona)&&(field==='regional'||!state.regional||(r.regional||'Não identificado')===state.regional));const values=[...new Set(scope.map(r=>r[field]||'Não identificado'))].sort((a,b)=>a.localeCompare(b,'pt-BR'));if(state[field]&&!values.includes(state[field]))state[field]='';optionList(field,values.map(v=>[v,v]),field==='bairro'?'Todos os bairros':'Todas as regionais',state[field]);}
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
  return filterBase().filter(r=>(!state.local||localKey(r)===state.local)&&(state.presence==='all'||(state.presence==='positive'?r.votos>0:r.votos===0))&&r.votos>=min&&r.votos<=max&&terms.every(q=>normalize(`${r.localNome||""} ${r.endereco||""} ${r.bairro||""} ${r.regional||""} ${r.municipio} ${r.codigo} zona ${r.zona} secao ${r.secao} agregadas ${r.agregadas} local ${r.local}`).includes(q)));
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
  if(state.regional)labels.push(state.regional);if(state.bairro)labels.push(state.bairro);
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
   const key=grouping==='municipio'?r.codigo:grouping==='zona'?r.zona:grouping==='bairro'||grouping==='regional'?r.codigo+'|'+(r[grouping]||'Não identificado'):localKey(r);
   if(!groups.has(key))groups.set(key,{key,label:grouping==='municipio'?r.municipio:grouping==='zona'?`Zona ${Number(r.zona)}`:grouping==='bairro'||grouping==='regional'?(r[grouping]||'Não identificado')+' · '+r.municipio:localLabel(r),votes:0,sections:0,row:r});
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
    if(state.grouping==='municipio'){state.municipio=g.key;state.zona='';state.local='';state.regional='';state.bairro='';}
    else if(state.grouping==='zona'){state.zona=g.key;state.local='';}
    else if(['bairro','regional'].includes(state.grouping)){state.municipio=g.row.codigo;state[state.grouping]=g.row[state.grouping]||'Não identificado';state.local='';updateOptions();syncInputs();}
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
  function select(){if(didDrag)return;state.municipio=state.municipio===code?'':code;state.zona='';state.local='';state.regional='';state.bairro='';updateOptions();$('map-tooltip').hidden=true;render();}
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
  const list=filtered.slice(),base=(a,b)=>a.municipio.localeCompare(b.municipio,'pt-BR')||Number(a.zona)-Number(b.zona)||Number(a.secao)-Number(b.secao);
  list.sort(state.sort==='votes-desc'?(a,b)=>b.votos-a.votos||base(a,b):state.sort==='votes-asc'?(a,b)=>a.votos-b.votos||base(a,b):state.sort==='section'?(a,b)=>Number(a.zona)-Number(b.zona)||Number(a.secao)-Number(b.secao)||base(a,b):base);
  return list;
 }
 function officialLocalURL(r){return 'https://planeleito.tre-ac.jus.br/rotas-publicas/locais-votacao?'+new URLSearchParams({zona:String(Number(r.zona)),municipio:r.municipio,secao:String(Number(r.secao))}).toString();}
 function renderTable(){
  const sorted=sortedRows(),pages=Math.max(1,Math.ceil(sorted.length/state.pageSize));state.page=Math.min(Math.max(1,state.page),pages);
  $('table-note').textContent='Todas as seções dos filtros, incluindo zero votos. Bairro e regional indicam a localização do prédio, não a residência dos eleitores.';
  const start=(state.page-1)*state.pageSize,visible=sorted.slice(start,start+state.pageSize);
  $('table-body').innerHTML=visible.length?visible.map(r=>`<tr><td>${esc(r.municipio)}</td><td class="code">${esc(r.codigo)}</td><td class="code">${esc(r.zona)}</td><td class="code">${esc(r.secao)}</td><td class="code">${esc(r.agregadas)||'—'}</td><td class="code">${esc(r.localNome||r.local)}<small class="place-detail">${esc(r.endereco||"Endereço não identificado")} · ${esc(r.bairro||"Bairro não identificado")} · ${esc(r.regional||"Regional não identificada")}</small></td><td class="number vote-cell ${r.votos===0?'no-votes':''}">${fmt.format(r.votos)}</td><td><span class="status">${esc(r.situacao)}</span></td><td><a class="bu-link" href="${esc(officialLocalURL(r))}" target="_blank" rel="noopener noreferrer" aria-label="Consultar ${esc(r.localNome||r.local)} no cadastro oficial do TRE-AC">Consultar local · TRE-AC</a></td></tr>`).join(''):'<tr><td colspan="9"><div class="empty">Nenhuma seção encontrada. Ajuste os filtros ou use “Limpar filtros”.</div></td></tr>';
  $('page-description').textContent=sorted.length?`${fmt.format(start+1)}–${fmt.format(start+visible.length)} de ${fmt.format(sorted.length)} seções · Página ${state.page} de ${pages}`:'0 seções encontradas';
  $('prev').disabled=state.page<=1;$('next').disabled=state.page>=pages;
 }
 function writeURL(){
  const params=new URLSearchParams();if(compareIds().length)params.set('compare',compareIds().join(','));params.set('compareGroup',$('compare-group').value);params.set('compareOrder',$('compare-order').value);params.set('cargo',state.cargo);params.set('candidato',state.candidato);for(const f of fields){if(state[f]!==''&&!(f==='presence'&&state[f]==='all'))params.set(f,state[f]);}
  if(state.grouping!=='municipio')params.set('grouping',state.grouping);
  if(state.limit!=='10')params.set('limit',state.limit);
  if(state.sort!=='votes-desc')params.set('sort',state.sort);
  const hash=params.toString()?`#filtros=${params.toString()}`:'';
  try{history.replaceState(null,'',location.pathname+location.search+hash);}catch{/* file:// hosts may restrict history. Data stays functional. */}
 }
 function syncInputs(){for(const f of fields){if(!['municipio','regional','bairro','zona','local'].includes(f))$(f).value=state[f];}$('grouping').value=state.grouping;$('rank-limit').value=state.limit;$('sort').value=state.sort;$('page-size').value=String(state.pageSize);}
 function render(resetPage=true){if(!current){showOverview();return;}if(resetPage)state.page=1;filtered=applyFilter();renderMetrics();renderRanking();renderDistribution();renderMap();renderRBMap();renderTable();renderComparison();writeURL();applyPageView();}
 function renderElectorate(){
  $('registered-electors').textContent=fmt.format(DATA.eleitorado.cadastrados);
  $('attending-electors').textContent=fmt.format(DATA.eleitorado.compareceram);
  const registered=DATA.eleitorado.cadastrados,attended=DATA.eleitorado.compareceram,absent=registered-attended,share=registered?attended/registered*100:0;
  $('absent-electors').textContent=fmt.format(absent);
  $('attending-share').textContent=pct.format(share)+'% dos cadastrados';
  $('absent-share').textContent=pct.format(100-share)+'% dos cadastrados';
  $('attendance-percent').textContent=pct.format(share)+'%';
  $('attendance-donut').style.background=`conic-gradient(var(--chart-green) 0% ${share}%,var(--chart-amber) ${share}% 100%)`;
  $('attendance-donut').setAttribute('aria-label',`${fmt.format(attended)} compareceram (${pct.format(share)}%); ${fmt.format(absent)} não compareceram (${pct.format(100-share)}%). Total: ${fmt.format(registered)} cadastrados.`);
  $('attendance-legend').innerHTML=`<p><i style="background:var(--chart-green)"></i><span><strong>Compareceram · ${pct.format(share)}%</strong><small>${fmt.format(attended)} eleitores</small></span></p><p><i style="background:var(--chart-amber)"></i><span><strong>Não compareceram · ${pct.format(100-share)}%</strong><small>${fmt.format(absent)} eleitores</small></span></p>`;
  const senate=state.cargo==='5',total=Number(DATA.offices.find(o=>o.codigo==='5').estatisticas.tv);
  $('senate-vote-card').hidden=!senate;$('senate-explanation').hidden=!senate;
  $('senate-recorded-votes').textContent=fmt.format(total);
  $('senate-explanation').innerHTML=senate?`<strong>Por que o total de votos é maior que o de pessoas?</strong><p>Em 2026, cada eleitor tinha duas escolhas para senador. Por isso, ${fmt.format(DATA.eleitorado.compareceram)} eleitores que compareceram × 2 escolhas = <strong>${fmt.format(total)} votos registrados</strong>, incluindo brancos e nulos. Esse total conta votos, e não eleitores.</p><a href="https://www12.senado.leg.br/noticias/materias/2026/09/28/eleicoes-2026-veja-o-que-e-fato-sobre-o-voto-para-o-senado" target="_blank" rel="noopener noreferrer">Entenda a votação para senador · Senado Federal</a>`:'';
 }
 function showOverview(){
  activeView=state.cargo||'home';
  current=null;state.candidato='';rows=[];$('candidate-photo').hidden=true;$('candidate-photo').removeAttribute('src');
  for(const f of fields)state[f]=f==='presence'?'all':'';
  document.querySelectorAll('main>section').forEach(s=>s.hidden=!(s.classList.contains('intro')||s.classList.contains('candidate-panel')||s.id==='general-overview'||s.id==='electorate-panel'||s.id==='situacao-judicial'||s.id==='distribuicao-vagas'));
  renderElectorate();
  document.querySelectorAll('.main-grid,.secondary-grid').forEach(s=>s.hidden=true);
  $('share').hidden=true;
  $('page-title').textContent='Votos no Acre';$('office-name').textContent='Eleições 2026 · 1º turno';
  $('candidate-details').textContent=state.cargo?'Escolha um candidato para explorar sua votação.':'Resultados de governador, senador e deputados federais e estaduais.';
  document.title='Votos no Acre · Visão geral';$('cargo').value=state.cargo;
  $('generate-report').disabled=false;
  $('general-cards').replaceChildren(...DATA.offices.map(o=>{
   const button=document.createElement('button');button.type='button';button.className='general-card';
   button.innerHTML=`<span>${esc(o.nome)}</span><strong>${fmt.format(Number(o.estatisticas.tv))}</strong><small>votos registrados · ${DATA.candidates.filter(c=>c.cargo===o.codigo).length} candidatos</small><small>Ver candidatos</small>`;
   button.addEventListener('click',()=>{state.cargo=o.codigo;$('candidate-search').value='';showOverview();populateCandidates();});return button;
  }));
  populateCandidates($('candidate-search').value);
  try{history.replaceState(null,'',location.pathname+location.search+(state.cargo?'#filtros=cargo='+state.cargo:''));}catch{}
  applyPageView();
 }
 function restoreURL(){
  const page=location.hash.match(/^#pagina=(quociente|subjudice)$/)?.[1];
  if(page){activeView=page;applyPageView();return;}

  const params=new URLSearchParams(location.hash.startsWith('#filtros=')?location.hash.slice(9):'');
  state.cargo=DATA.offices.some(o=>o.codigo===params.get('cargo'))?params.get('cargo'):'';
  if(!location.hash||location.hash==='#')$('candidate-search').value='';
  if(!candidates.has(state.cargo+':'+params.get('candidato'))){showOverview();return;}
  setCandidate(params.get('candidato'));
  populateCandidates($('candidate-search').value);
  for(const f of fields)state[f]=params.get(f)||(f==='presence'?'all':'');
  if(!names.has(state.municipio))state.municipio='';
  if(!['all','positive','zero'].includes(state.presence))state.presence='all';
  state.grouping=['municipio','zona','local','bairro','regional'].includes(params.get('grouping'))?params.get('grouping'):'municipio';
  state.limit=params.get('limit')==='all'?'all':'10';state.sort=['votes-desc','votes-asc','municipality','section'].includes(params.get('sort'))?params.get('sort'):'votes-desc';
  setCompareIds((params.get('compare')||'').split(',').filter(id=>candidates.get(id)?.cargo===state.cargo));$('compare-group').value=['municipio','zona','local','bairro','regional'].includes(params.get('compareGroup'))?params.get('compareGroup'):'municipio';$('compare-order').value=['desc','asc','name'].includes(params.get('compareOrder'))?params.get('compareOrder'):'desc';
  updateOptions();syncInputs();render();
 }
 for(const f of ['municipio','regional','bairro','zona','local','presence'])$(f).addEventListener('change',()=>{
  state[f]=$(f).value;
  if(f==='municipio'){state.zona='';state.local='';state.regional='';state.bairro='';}if(f==='regional'){state.bairro='';state.local='';}if(f==='bairro')state.local='';if(f==='zona')state.local='';
  updateOptions();render();
 });
 for(const f of ['min','max'])$(f).addEventListener('input',()=>{state[f]=$(f).value;render();});
 $('search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{state.search=$('search').value;render();},150);});
 $('grouping').addEventListener('change',()=>{state.grouping=$('grouping').value;renderRanking();writeURL();});
 $('rank-limit').addEventListener('change',()=>{state.limit=$('rank-limit').value;renderRanking();writeURL();});
 $('sort').addEventListener('change',()=>{state.sort=$('sort').value;state.page=1;renderTable();renderComparison();writeURL();});
 $('page-size').addEventListener('change',()=>{state.pageSize=Number($('page-size').value);state.page=1;renderTable();});
 $('prev').addEventListener('click',()=>{state.page--;renderTable();});$('next').addEventListener('click',()=>{state.page++;renderTable();});
 $('reset').addEventListener('click',()=>{clearTimeout(searchTimer);for(const f of fields)state[f]=f==='presence'?'all':'';updateOptions();syncInputs();render();});
 function initComparison(){
  $('compare-add').addEventListener('click',()=>{const id=$('compare-candidate').value;const ids=compareIds();if(!ids.includes(id))ids.push(id);setCompareIds(ids);renderComparison();writeURL();});
  $('compare-group').addEventListener('change',()=>{renderComparison();writeURL();});
  $('compare-order').addEventListener('change',()=>{renderComparison();writeURL();});
  renderComparison();
 }
 function compareIds(){return ($('compare-selected').dataset.ids||'').split(',').filter(id=>candidates.get(id)?.cargo===state.cargo);}
 function setCompareIds(ids){$('compare-selected').dataset.ids=ids.join(',');}
 function comparisonRows(){return filterBase().filter(r=>(!state.local||localKey(r)===state.local)&&normalize(state.search.trim()).split(/\s+/).filter(Boolean).every(q=>normalize(`${r.localNome||''} ${r.endereco||''} ${r.bairro||''} ${r.regional||''} ${r.municipio} ${r.codigo} zona ${r.zona} secao ${r.secao} agregadas ${r.agregadas} local ${r.local}`).includes(q)));}
 function comparisonGroups(){const grouping=$('compare-group').value,cs=DATA.candidates.filter(c=>c.cargo===state.cargo),ids=compareIds();const map=new Map();for(const r of comparisonRows()){const key=grouping==='municipio'?r.codigo:grouping==='zona'?r.codigo+'|'+r.zona:grouping==='local'?localKey(r):r.codigo+'|'+(r[grouping]||'Não identificado');if(!map.has(key))map.set(key,{label:grouping==='municipio'?r.municipio:grouping==='zona'?r.municipio+' · Zona '+Number(r.zona):grouping==='local'?localLabel(r):(r[grouping]||'Não identificado')+' · '+r.municipio,rows:[],denom:0,votes:Object.fromEntries(ids.map(id=>[id,0]))});const g=map.get(key);g.rows.push(r);g.denom+=cs.reduce((sum,c)=>sum+(r.votacao[c.id]||0),0);for(const id of ids)g.votes[id]+=r.votacao[id]||0;}const list=[...map.values()],first=ids[0],order=$('compare-order').value;return list.sort((a,b)=>order==='name'?a.label.localeCompare(b.label,'pt-BR'):order==='asc'?(a.votes[first]||0)-(b.votes[first]||0):(b.votes[first]||0)-(a.votes[first]||0));}
 function renderComparison(){
  const select=$('compare-candidate'),value=select.value,cs=DATA.candidates.filter(c=>c.cargo===state.cargo);select.replaceChildren(...cs.map(c=>new Option(`${c.nome} · ${c.numero} · ${c.partido}`,c.id)));if(cs.some(c=>c.id===value))select.value=value;
  const ids=compareIds();setCompareIds(ids);$('compare-selected').replaceChildren();for(const id of ids){const c=candidates.get(id),b=document.createElement('button');b.type='button';b.className='button light';b.textContent=c.nome+' · '+c.numero+' ×';b.setAttribute('aria-label','Remover '+c.nome+' da comparação');b.addEventListener('click',()=>{setCompareIds(compareIds().filter(x=>x!==id));renderComparison();writeURL();});$('compare-selected').append(b);}
  const groups=comparisonGroups(),selected=ids.map(id=>candidates.get(id));
  $('compare-results').innerHTML=ids.length<2?'<p class="empty">Adicione dois ou mais candidatos do mesmo cargo para comparar.</p>':`<table><thead><tr><th>Grupo</th><th>Seções</th>${selected.map(c=>`<th>${esc(c.nome)} · ${esc(c.numero)}</th>`).join('')}<th>Maior votação entre os selecionados</th><th>Diferença entre as duas maiores</th></tr></thead><tbody>${groups.map(g=>{const values=ids.map(id=>g.votes[id]).sort((a,b)=>b-a),max=values[0],winners=selected.filter(c=>g.votes[c.id]===max);return `<tr><td>${esc(g.label)}</td><td>${g.rows.length}</td>${selected.map(c=>`<td><strong>${fmt.format(g.votes[c.id])}</strong><small class="place-detail">${g.denom?pct.format(g.votes[c.id]/g.denom*100)+'%':'—'} dos nominais do cargo</small></td>`).join('')}<td>${max===0?'Sem votos':winners.map(c=>esc(c.nome)).join(' / ')+(winners.length>1?' (empate)':'')}</td><td>${fmt.format(max-values[1])}</td></tr>`;}).join('')||'<tr><td>Nenhum grupo para os filtros.</td></tr>'}</tbody></table>`;
  const totals=selected.map(c=>({c,votes:groups.reduce((sum,g)=>sum+g.votes[c.id],0)})).sort((a,b)=>b.votes-a.votes),largest=totals[0]?.votes||1,denominator=groups.reduce((sum,g)=>sum+g.denom,0);
  $('compare-chart').hidden=ids.length<2;
  $('compare-chart').innerHTML=ids.length<2?'':`<h3>Votos dos candidatos na área selecionada</h3><p class="section-note">Barras na mesma escala. Percentuais sobre os votos nominais de todos os candidatos do cargo na área.</p>${totals.map(({c,votes})=>`<div class="comparison-bar-row"><div class="comparison-bar-label">${esc(c.nome)} · ${esc(c.numero)}<strong>${fmt.format(votes)} votos · ${denominator?pct.format(votes/denominator*100)+'%':'—'}</strong></div><div class="comparison-bar-track"><span style="width:${votes/largest*100}%"></span></div></div>`).join('')}`;
  $('compare-note').textContent=`${fmt.format(comparisonRows().length)} seções. A comparação usa os mesmos filtros territoriais e de busca para todos. Presença e limites de votos do candidato principal não se aplicam aqui. Percentual sobre todos os votos nominais dos candidatos do cargo na área, incluindo anulados sub judice; não é percentual de eleitores. Ordenação por votos do primeiro candidato adicionado.`;
 }

 function notify(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true;},4500);}
 $('share').addEventListener('click',async()=>{
  if(location.protocol==='file:'){notify('Publique no GitHub Pages para compartilhar um endereço público.');return;}
  writeURL();try{await navigator.clipboard.writeText(location.href);notify('Link com os filtros copiado.');}catch{window.prompt('Copie o link com os filtros:',location.href);}
 });
 window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#filtros=')||location.hash.startsWith('#pagina=')||!location.hash)restoreURL();});
 function populateCandidates(query=''){
  const terms=normalize(query).split(/\s+/).filter(Boolean);
  const scoped=DATA.candidates.filter(c=>!state.cargo||c.cargo===state.cargo);
  const items=scoped.filter(c=>terms.every(t=>normalize(c.nome+' '+c.nomeCompleto+' '+c.numero+' '+c.partido).includes(t)));
  const matched=items.some(c=>c.numero===state.candidato);
  $('candidate').replaceChildren(...(!matched?[new Option(items.length?'Selecione um candidato':'Nenhum candidato encontrado','')]:[]),...items.map(c=>new Option(`${c.nome} · ${c.numero} · ${c.partido}${!state.cargo?' · '+DATA.offices.find(o=>o.codigo===c.cargo).nome:''}`,c.id)));
  $('candidate').value=matched?state.cargo+':'+state.candidato:'';
  $('candidate-count').textContent=`${items.length} de ${scoped.length} candidatos${state.cargo?' do cargo':''}`;
  const results=$('candidate-results'),status=$('candidate-search-status');
  results.hidden=!terms.length;status.hidden=!terms.length;
  status.textContent=items.length?`${items.length} resultado(s) neste cargo. Clique em um candidato para mostrar sua votação.`:'Nenhum candidato encontrado neste cargo. Confira o nome, número ou selecione outro cargo.';
  results.replaceChildren(...(terms.length?items:[]).map(c=>{
   const button=document.createElement('button');button.type='button';button.className='button light';button.textContent=`${c.nome} · ${c.numero} · ${c.partido}`;
   button.addEventListener('click',()=>{state.cargo=c.cargo;setCandidate(c.numero);$('generate-report').disabled=false;render();});return button;
  }));
 }
 $('cargo').replaceChildren(new Option('Todos os cargos',''),...DATA.offices.map(o=>new Option(o.nome,o.codigo)));
 $('cargo').value=state.cargo;
 $('cargo').addEventListener('change',()=>{state.cargo=$('cargo').value;state.candidato='';$('candidate-search').value='';showOverview();});
 $('candidate-search').addEventListener('input',()=>populateCandidates($('candidate-search').value));
 $('candidate').addEventListener('change',()=>{const c=candidates.get($('candidate').value);if(!c)return;state.cargo=c.cargo;setCandidate(c.numero);$('generate-report').disabled=false;render();});
 $('generate-report').addEventListener('click',generateReport);
 function generateReport(judicialOnly=false){
  if(judicialOnly!==true&&judicialOnly!=='distribution'&&current&&$('filter-error').textContent){notify('Corrija os limites de votos antes de gerar o relatório.');return;}
  const win=window.open('','_blank');if(!win){notify('Permita abrir uma nova aba para gerar o relatório.');return;}
  const css=`@page{size:A4;margin:15mm}*{box-sizing:border-box}body{font:12px/1.5 Arial,sans-serif;color:#17343b;margin:0;background:white}h1{font-size:25px;margin:0 0 8px}h2{font-size:17px;margin:0 0 12px}h3{font-size:14px}p{margin:6px 0}section{margin:22px 0;break-inside:avoid}table{width:100%;border-collapse:collapse;font-size:10px}th,td{padding:7px;text-align:left;vertical-align:top;border-bottom:1px solid #dce5e7}th{background:#edf4f1}thead{display:table-header-group}tr{break-inside:avoid}.detail-table{break-inside:auto}.detail-table h2,.detail-table h3,.detail-table>p,summary{break-after:avoid}.note,.section-note,small{color:#52676c;font-size:11px}small{display:block}.metrics,.office-stats,.judicial-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.metric,.office-stats>div,.judicial-facts>div{border:1px solid #dce5e7;border-radius:8px;padding:12px}.metric span,.office-stats span,.judicial-facts span{display:block;font-size:11px}.metric strong,.office-stats strong,.judicial-facts strong{display:block;font-size:22px}.metric small{font-size:10px}.rank-row{display:grid;grid-template-columns:1fr 60px;gap:12px;margin:10px 0}.rank-name{display:flex;justify-content:space-between}.rank-bar,.comparison-bar-track,.hist-track{height:12px;background:#e4ece8;border-radius:4px;margin-top:5px}.rank-fill,.comparison-bar-track span,.hist-bar{display:block;height:100%;background:#197f66;border-radius:4px}.comparison-bar-row{margin:12px 0}.comparison-bar-label{display:flex;justify-content:space-between;gap:10px}.hist-column{display:grid;grid-template-columns:125px 1fr 80px;gap:10px;margin:12px 0;align-items:center}.hist-count{text-align:right}.map-frame svg{width:100%;max-height:300px;background:#f5f8f8}.map-label,.rb-region-label{font:700 12px Arial;fill:#17343b;paint-order:stroke;stroke:white;stroke-width:3px;pointer-events:none}.municipality-path{stroke:white;stroke-width:1.5}.rb-region{stroke:white;stroke-width:1.5}.rb-bairro{fill:none;stroke:#52676c;stroke-width:.6}.rb-neighborhood-layer{display:none}.rb-neighborhood-layer.visible{display:block}.legend{display:flex;flex-wrap:wrap;gap:10px}.legend-item{display:flex;gap:6px;align-items:center}.legend i{width:15px;height:10px;display:inline-block}.attendance-visual{display:flex;align-items:center;justify-content:center;gap:30px}.attendance-donut{width:150px;height:150px;border-radius:50%;display:grid;place-items:center}.attendance-donut>div{background:white;width:105px;height:105px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column}.attendance-donut strong{font-size:25px}.chart-legend p{display:flex;align-items:center;gap:8px}.chart-legend i{width:12px;height:12px;display:inline-block}.toolbar{padding:12px;background:#e9f3ef;margin-bottom:20px}.toolbar button{padding:10px;font:inherit;cursor:pointer}.footer{border-top:1px solid #dce5e7;margin-top:20px;padding-top:10px;font-size:10px}.place-detail{display:block;font-size:9px;color:#52676c}.number{text-align:right}@media print{.toolbar{display:none}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}a{color:inherit;text-decoration:none}}`;
  function copy(id){const node=$(id).cloneNode(true);node.hidden=false;node.querySelectorAll('button').forEach(x=>{const div=document.createElement('div');div.className=x.className;div.innerHTML=x.innerHTML;x.replaceWith(div);});node.querySelectorAll('input,select,.map-tools,.north,.map-tooltip').forEach(x=>x.remove());node.querySelectorAll('[hidden]').forEach(x=>x.remove());node.removeAttribute('id');return node.outerHTML;}
  const office=DATA.offices.find(o=>o.codigo===state.cargo),scope=current?$('selection-description').textContent:'Totais estaduais';
  let content=`<header>${current?.foto?'<img src="'+current.foto+'" alt="Foto oficial de '+esc(current.nome)+'" style="width:80px;height:106px;object-fit:cover;float:right;margin:0 0 12px 16px">':''}<p>DADOS OFICIAIS DO TSE · VOTOS NO ACRE</p><h1>${current?esc(current.nome)+' · '+esc(current.numero):'Visão geral do Acre'}</h1><p>${office?esc(office.nome)+' · ':''}Primeiro turno</p><p><strong>Seleção:</strong> ${esc(scope)}</p>${current?'<p>'+esc(current.partido)+' · '+esc(current.situacao)+' · '+esc(current.destinacao)+'</p>':''}</header>`;
  if(judicialOnly==='distribution'){
   content='<header><p>DADOS OFICIAIS DO TSE · DISTRIBUIÇÃO PROPORCIONAL</p><h1>Entenda a distribuição das vagas</h1><p>'+esc(DATA.offices.find(o=>o.codigo===$('distribution-office').value).nome)+' · Acre · Primeiro turno</p></header><section class="detail-table">'+distributionHTML()+'</section>';
  }else if(judicialOnly===true){
   const j=judicialCases.find(x=>x.id===$('judicial-case').value),c=candidates.get(j.candidateId);content='<header><p>DADOS OFICIAIS DO TSE · ANÁLISE INDEPENDENTE</p><h1>Situação judicial e simulação de vagas</h1><p>'+esc(c.nome)+' · '+esc(c.partido)+'</p><p>Conferência: '+esc(j.checked)+' · Dados estaduais, independentes dos filtros territoriais.</p></header><section class="detail-table">'+$('judicial-content').innerHTML+'</section>';
  }else if(!current){
   content+='<section><h2>Eleitorado e comparecimento no Acre</h2>'+document.querySelector('.electorate-stats').outerHTML+document.querySelector('.attendance-chart').outerHTML+'</section><section><h2>Votos registrados por cargo no Acre</h2><table><thead><tr><th>Cargo</th><th>Votos registrados</th><th>Candidatos</th></tr></thead><tbody>'+DATA.offices.filter(o=>!state.cargo||o.codigo===state.cargo).map(o=>`<tr><td>${esc(o.nome)}</td><td>${fmt.format(Number(o.estatisticas.tv))}</td><td>${DATA.candidates.filter(c=>c.cargo===o.codigo).length}</td></tr>`).join('')+'</tbody></table></section>';
  }else{
   content+='<section><h2>Resumo dos filtros selecionados</h2>'+document.querySelector('.metrics').outerHTML+'</section>';
   const groups=groupData(filtered,state.grouping),max=groups[0]?.votes||1;
   content+='<section><h2>Votos por '+({municipio:'município',zona:'zona eleitoral',local:'prédio de votação',bairro:'bairro do prédio',regional:'regional do prédio'}[state.grouping])+'</h2>'+groups.map(g=>`<div class="rank-row"><div><span>${esc(g.label)}</span><div class="rank-bar"><span class="rank-fill" style="width:${g.votes/max*100}%"></span></div></div><strong>${fmt.format(g.votes)}</strong></div>`).join('')+'</section>';
   content+='<section><h2>Distribuição de votos por seção</h2>'+copy('distribution')+'<p class="note">'+esc($('distribution-caption').textContent)+'</p></section>';
   if(!state.municipio||state.municipio==='01392'){
    const svg=$('rb-map').cloneNode(true);svg.querySelectorAll('.rb-neighborhood-layer').forEach(x=>x.classList.remove('visible'));
    if(state.regional&&rbPaths.has(state.regional)){
     svg.querySelectorAll('.rb-region').forEach(x=>{if(x.dataset.regional!==state.regional)x.remove();});
     const label=rbFeatures.find(f=>f.properties.Regional===state.regional)?.properties.label.replace('Regional ','');svg.querySelectorAll('.rb-region-label').forEach(x=>{if(x.textContent!==label)x.remove();});
     const box=rbPaths.get(state.regional).getBBox(),pad=20;svg.setAttribute('viewBox',`${box.x-pad} ${box.y-pad} ${box.width+pad*2} ${box.height+pad*2}`);
    }else svg.setAttribute('viewBox','0 0 900 550');
    svg.querySelectorAll('.muted').forEach(x=>x.classList.remove('muted'));const territoryRows=filtered.filter(r=>r.codigo==='01392'),regionFeatures=rbFeatures.filter(f=>!state.regional||f.properties.Regional===state.regional);
    content+='<section class="map-frame"><h2>Explore as regionais e os bairros · Rio Branco</h2>'+svg.outerHTML+'<p class="note">As cores identificam regionais, não a quantidade de votos. Os totais abaixo respeitam todos os filtros do relatório. Bairro do prédio não identifica residência dos eleitores.</p></section>';
    content+='<section><h2>Regionais nos filtros selecionados</h2><table><thead><tr><th>Regional</th><th>Seções</th><th>Votos</th></tr></thead><tbody>'+regionFeatures.map(f=>{const rs=territoryRows.filter(r=>r.regional===f.properties.Regional),color=rbColors[rbFeatures.indexOf(f)];return '<tr><td><span style="display:inline-block;width:12px;height:12px;background:'+color+';margin-right:7px"></span>'+esc(f.properties.label)+'</td><td>'+rs.length+'</td><td>'+fmt.format(rs.reduce((sum,r)=>sum+r.votos,0))+'</td></tr>';}).join('')+'</tbody></table></section>';
    const neighborhoodGroups=new Map();for(const r of territoryRows){const key=(r.bairro||'Não identificado')+'|'+(r.regional||'Não identificado');if(!neighborhoodGroups.has(key))neighborhoodGroups.set(key,{bairro:r.bairro||'Não identificado',regional:r.regional||'Não identificado',votes:0,sections:0});const g=neighborhoodGroups.get(key);g.votes+=r.votos;g.sections++;}
    content+='<section class="detail-table"><h2>Bairros com locais de votação identificados</h2><p class="note">Bairros dos prédios e votos do candidato principal no recorte selecionado. Seções sem bairro ou regional confirmados permanecem identificadas como “Não identificado”.</p><table><thead><tr><th>Bairro</th><th>Regional</th><th>Seções</th><th>Votos</th></tr></thead><tbody>'+[...neighborhoodGroups.values()].sort((a,b)=>b.votes-a.votes||a.bairro.localeCompare(b.bairro,'pt-BR')).map(g=>'<tr><td>'+esc(g.bairro)+'</td><td>'+esc(g.regional)+'</td><td>'+g.sections+'</td><td>'+fmt.format(g.votes)+'</td></tr>').join('')+'</tbody></table></section>';
   }else{const svg=$('acre-map').cloneNode(true);svg.setAttribute('viewBox','0 0 900 470');if(state.municipio)svg.querySelectorAll('.municipality-path').forEach(x=>{if(x.dataset.municipio!==state.municipio)x.setAttribute('fill','#e3e9e9');});content+='<section class="map-frame"><h2>Localização no Acre</h2>'+svg.outerHTML+'</section>';}
   if(state.municipio&&state.municipio!=='01392'){
    const name=filtered[0]?.municipio||rows.find(r=>r.codigo===state.municipio)?.municipio||'';
    if(DATA.municipalNeighborhoodMaps?.[state.municipio]||DATA.pointNeighborhoodMunicipalities?.includes(state.municipio))content+='<section class="map-frame"><h2>Explore os bairros · '+esc(name)+'</h2>'+copy('town-map')+'<p class="note">'+esc(DATA.pointNeighborhoodMunicipalities?.includes(state.municipio)?'Pontos dos prédios; bairros declarados no TSE, cadastro 2026. Sem limites de bairros. Categorias rurais não são bairros urbanos.':'Cores identificam bairros. Limites: IBGE, Censo 2022.')+' Bairro do prédio não indica residência dos eleitores.</p></section>';
    const groups=groupData(filtered,'bairro');content+='<section class="detail-table"><h2>Bairros nos filtros selecionados</h2><table><thead><tr><th>Bairro / município</th><th>Seções</th><th>Votos</th></tr></thead><tbody>'+groups.map(g=>'<tr><td>'+esc(g.label)+'</td><td>'+g.sections+'</td><td>'+fmt.format(g.votes)+'</td></tr>').join('')+'</tbody></table></section>';
   }
   if(compareIds().length>=2){
    // Use exactly the report's filtered sections, including individual vote limits, for every compared candidate.
    const cs=compareIds().map(id=>candidates.get(id)),totals=cs.map(c=>({c,votes:filtered.reduce((sum,r)=>sum+(r.votacao[c.id]||0),0)})),largest=Math.max(1,...totals.map(t=>t.votes));
    const reportGrouping=$('compare-group').value,reportGroups=groupData(filtered,reportGrouping),byCandidate=cs.map(c=>new Map(groupData(filtered.map(r=>({...r,votos:r.votacao[c.id]||0})),reportGrouping).map(g=>[g.key,g.votes]))),nominalGroups=new Map(groupData(filtered.map(r=>({...r,votos:DATA.candidates.filter(c=>c.cargo===state.cargo).reduce((sum,c)=>sum+(r.votacao[c.id]||0),0)})),reportGrouping).map(g=>[g.key,g.votes]));
    content+='<section><h2>Comparação nos mesmos filtros do relatório</h2><p class="note">Todos os candidatos abaixo usam exatamente as '+filtered.length+' seções selecionadas. Presença e limites de votos aplicam-se ao candidato principal e definem esse recorte.</p>'+totals.map(({c,votes})=>`<div class="comparison-bar-row"><div class="comparison-bar-label">${esc(c.nome)} · ${esc(c.numero)}<strong>${fmt.format(votes)} votos</strong></div><div class="comparison-bar-track"><span style="width:${votes/largest*100}%"></span></div></div>`).join('')+'</section>';
    content+='<section class="detail-table"><h2>Comparação por '+esc({municipio:'município',zona:'zona eleitoral',local:'prédio',bairro:'bairro',regional:'regional'}[reportGrouping])+'</h2><p class="note">Percentuais sobre todos os votos nominais do cargo no grupo, incluindo anulados sub judice; não representam percentuais de eleitores.</p><table><thead><tr><th>Grupo</th>'+cs.map(c=>'<th>'+esc(c.nome)+'</th>').join('')+'<th>Diferença entre as duas maiores votações</th></tr></thead><tbody>'+reportGroups.map(g=>{const vals=byCandidate.map(m=>m.get(g.key)||0),ordered=vals.slice().sort((a,b)=>b-a),denom=nominalGroups.get(g.key)||0;return '<tr><td>'+esc(g.label)+'</td>'+vals.map(v=>'<td>'+fmt.format(v)+' votos<small>'+(denom?pct.format(v/denom*100)+'%':'—')+'</small></td>').join('')+'<td>'+fmt.format(ordered[0]-ordered[1])+'</td></tr>';}).join('')+'</tbody></table></section>';
   }
   content+='<section class="detail-table"><h2>Seções incluídas no relatório</h2><p class="note">'+fmt.format(filtered.length)+' seções, sem limitar à página exibida no painel. Votos do candidato principal.</p><table><thead><tr><th>Município / zona / seção</th><th>Prédio, bairro e regional</th><th class="number">Votos</th></tr></thead><tbody>'+sortedRows().map(r=>`<tr><td>${esc(r.municipio)}<small>Zona ${Number(r.zona)} · Seção ${esc(r.secao)}${r.agregadas?' · Agregadas '+esc(r.agregadas):''}</small></td><td>${esc(r.localNome||r.local)}<small>${esc(r.endereco||'')}<br>${esc(r.bairro||'Bairro não identificado')} · ${esc(r.regional||'Regional não identificada')}</small></td><td class="number">${fmt.format(r.votos)}</td></tr>`).join('')+'</tbody></table></section>';
  }
  content+='<footer class="footer">Painel independente · Dados públicos do TSE. Limites territoriais: Prefeitura de Rio Branco e IBGE. Os votos são a fotografia da coleta original, sem atualização automática. As classificações territoriais se referem aos prédios de votação. Não há identificação de eleitores.<br>Fonte: resultados.tse.jus.br · Cadastro de locais: planeleito.tre-ac.jus.br · Mapas: rbgeo.riobranco.ac.gov.br</footer>';
  win.document.open();win.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório · Votos no Acre</title><style>'+css+'</style></head><body><div class="toolbar"><strong>Relatório pronto.</strong> Na impressão, escolha “Salvar como PDF”. <button onclick="window.print()">Imprimir / Salvar em PDF</button></div>'+content+'</body></html>');win.document.close();win.document.querySelectorAll('details').forEach(x=>x.open=true);
  // Resolve theme variables into fixed light print colors; the report remains readable in any app theme.
  win.document.documentElement.style.setProperty('--chart-green','#197f66');win.document.documentElement.style.setProperty('--chart-amber','#d58a33');
  win.setTimeout(()=>win.print(),350);
 }

 const rbData=DATA.rioBrancoMap,rbSvg=$('rb-map'),rbPaths=new Map(),rbColors=['#6fbf92','#75a9df','#d798c4','#edba67','#7ac8c8','#b5a1e5','#df8d78','#9aba5d','#d3c27b','#83adba'];
 const rbFeatures=rbData.regionais,rbNeighborhoods=rbData.bairros;
 const rbRings=f=>f.geometry.type==='Polygon'?f.geometry.coordinates:f.geometry.coordinates.flat();
 const rbPoints=rbFeatures.flatMap(f=>rbRings(f).flat()),rbXs=rbPoints.map(p=>p[0]),rbYs=rbPoints.map(p=>p[1]);
 const rbBounds={xmin:Math.min(...rbXs),xmax:Math.max(...rbXs),ymin:Math.min(...rbYs),ymax:Math.max(...rbYs)};
 const rbScale=Math.min(840/((rbBounds.xmax-rbBounds.xmin)*.985),500/(rbBounds.ymax-rbBounds.ymin));
 const rbProject=p=>[(900-(rbBounds.xmax-rbBounds.xmin)*.985*rbScale)/2+(p[0]-rbBounds.xmin)*.985*rbScale,(550-(rbBounds.ymax-rbBounds.ymin)*rbScale)/2+(rbBounds.ymax-p[1])*rbScale];
 const rbD=f=>rbRings(f).map(r=>r.map((p,i)=>(i?'L':'M')+rbProject(p).map(v=>v.toFixed(2)).join(',')).join(' ')+' Z').join(' ');
 const rbDefs=document.createElementNS(NS,'defs');rbSvg.append(rbDefs);
 const rbLayer=document.createElementNS(NS,'g');rbSvg.append(rbLayer);
 function rbSelect(regional,bairro=''){
  state.municipio='01392';state.regional=regional;state.bairro=bairro;state.zona='';state.local='';
  updateOptions();syncInputs();render();
 }
 const rbNeighborhoodLayer=document.createElementNS(NS,'g');rbNeighborhoodLayer.classList.add('rb-neighborhood-layer');
 rbFeatures.forEach((f,i)=>{
  const key=f.properties.Regional,label=f.properties.label,path=document.createElementNS(NS,'path');path.setAttribute('d',rbD(f));path.setAttribute('fill',rbColors[i]);path.setAttribute('fill-rule','evenodd');path.classList.add('rb-region');path.setAttribute('role','button');path.setAttribute('tabindex','0');path.setAttribute('aria-label',label+'; selecionar regional');path.dataset.regional=key;
  const title=document.createElementNS(NS,'title');title.textContent=label;path.append(title);rbLayer.append(path);rbPaths.set(key,path);
  path.addEventListener('click',()=>{if(!rbDragged)rbSelect(state.regional===key?'':key);});path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();rbSelect(key);}});
  const clip=document.createElementNS(NS,'clipPath');clip.id='rb-clip-'+i;const clipPath=document.createElementNS(NS,'path');clipPath.setAttribute('d',rbD(f));clipPath.setAttribute('clip-rule','evenodd');clip.append(clipPath);rbDefs.append(clip);
  const group=document.createElementNS(NS,'g');group.setAttribute('clip-path','url(#rb-clip-'+i+')');
  for(const bairro of rbNeighborhoods){const bp=document.createElementNS(NS,'path');bp.setAttribute('d',rbD(bairro));bp.setAttribute('fill-rule','evenodd');bp.classList.add('rb-bairro');bp.dataset.bairro=bairro.properties.bairro;const t=document.createElementNS(NS,'title');t.textContent=bairro.properties.bairro+' · '+label;bp.append(t);bp.addEventListener('click',()=>{if(!rbDragged)rbSelect(key,bairro.properties.bairro);});group.append(bp);}rbNeighborhoodLayer.append(group);
 });
 rbSvg.append(rbNeighborhoodLayer);
 // Labels use an interior point found on a grid, rather than assuming the geometric center lies inside.
 function rbInside(p,ring){let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
 for(const f of rbFeatures){const ring=rbRings(f).slice().sort((a,b)=>b.length-a.length)[0],xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);let best=null,score=-1;for(let ix=1;ix<20;ix++)for(let iy=1;iy<20;iy++){const p=[xmin+(xmax-xmin)*ix/20,ymin+(ymax-ymin)*iy/20];if(!rbInside(p,ring))continue;const dist=Math.min(...ring.map(q=>(q[0]-p[0])**2+(q[1]-p[1])**2));if(dist>score){score=dist;best=p;}}if(best){const t=document.createElementNS(NS,'text'),pt=rbProject(best);t.setAttribute('x',pt[0]);t.setAttribute('y',pt[1]);t.setAttribute('text-anchor','middle');t.classList.add('rb-region-label');t.textContent=f.properties.label.replace('Regional ','');rbSvg.append(t);}}
 let rbView={x:0,y:0,w:900,h:550},rbDrag=null,rbDragged=false;
 function rbSetView(){rbSvg.setAttribute('viewBox',`${rbView.x} ${rbView.y} ${rbView.w} ${rbView.h}`);}
 function rbZoom(factor){const w=Math.max(150,Math.min(900,rbView.w*factor)),h=w*550/900;rbView={x:rbView.x+(rbView.w-w)/2,y:rbView.y+(rbView.h-h)/2,w,h};rbSetView();}
 $('rb-zoom-in').addEventListener('click',()=>rbZoom(.75));$('rb-zoom-out').addEventListener('click',()=>rbZoom(1/.75));$('rb-zoom-reset').addEventListener('click',()=>{rbView={x:0,y:0,w:900,h:550};rbSetView();});
 rbSvg.addEventListener('pointerdown',e=>{if(!e.isPrimary)return;rbDragged=false;rbDrag={id:e.pointerId,x:e.clientX,y:e.clientY,view:{...rbView}};});
 rbSvg.addEventListener('pointermove',e=>{if(!rbDrag||rbDrag.id!==e.pointerId||rbView.w>=900)return;const dx=e.clientX-rbDrag.x,dy=e.clientY-rbDrag.y;if(Math.abs(dx)+Math.abs(dy)<8&&!rbDragged)return;rbDragged=true;rbSvg.setPointerCapture(e.pointerId);const box=rbSvg.getBoundingClientRect();rbView.x=rbDrag.view.x-dx*rbDrag.view.w/box.width;rbView.y=rbDrag.view.y-dy*rbDrag.view.h/box.height;rbSetView();});
 const rbEnd=e=>{if(rbDrag?.id===e.pointerId){if(rbSvg.hasPointerCapture(e.pointerId))rbSvg.releasePointerCapture(e.pointerId);rbDrag=null;setTimeout(()=>{rbDragged=false;},50);}};rbSvg.addEventListener('pointerup',rbEnd);rbSvg.addEventListener('pointercancel',rbEnd);
 $('rb-show-bairros').addEventListener('change',()=>{rbNeighborhoodLayer.classList.toggle('visible',$('rb-show-bairros').checked);});
 $('rb-clear').addEventListener('click',()=>{if(state.municipio&&state.municipio!=='01392'){state.bairro='';state.local='';updateOptions();render();}else rbSelect('');});
 const townSvg=document.createElementNS(NS,'svg');townSvg.id='town-map';townSvg.setAttribute('viewBox','0 0 900 550');townSvg.setAttribute('role','group');rbSvg.after(townSvg);
 function selectTownNeighborhood(name){state.bairro=state.bairro===name?'':name;state.regional='';state.local='';updateOptions();syncInputs();render();}
 function renderTownMap(code){
  const scope=rows.filter(r=>r.codigo===code),selection=filtered.filter(r=>r.codigo===code),name=scope[0]?.municipio||'',features=DATA.municipalNeighborhoodMaps?.[code]||[],pointMap=DATA.pointNeighborhoodMunicipalities?.includes(code);
  $('rb-title').textContent='Explore os bairros · '+name;
  $('rio-branco-regions').querySelector('.eyebrow').textContent=name+' · BAIRROS';
  $('rio-branco-regions').querySelector('.section-heading + .section-note').textContent='Clique no bairro no mapa ou na lista para filtrar a votação e a comparação. Cada cor identifica um bairro, sem representar quantidade de votos.';
  $('rb-clear').textContent='Todos os bairros';townSvg.replaceChildren();townSvg.hidden=!features.length&&!pointMap;townSvg.style.display=features.length||pointMap?'':'none';
  const names=[...new Set(scope.filter(r=>r.bairro).map(r=>r.bairro))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const buttons=names.map(bairro=>{const b=document.createElement('button');b.type='button';b.className='button light';b.setAttribute('aria-pressed',String(state.bairro===bairro));b.textContent=bairro+' · '+fmt.format(selection.filter(r=>r.bairro===bairro).reduce((n,r)=>n+r.votos,0))+' votos';b.addEventListener('click',()=>selectTownNeighborhood(bairro));return b;});
  $('rb-bairros-list').replaceChildren(...buttons);$('rb-selected-title').textContent='Bairros com locais de votação identificados';$('rb-regional-legend').replaceChildren();
  if(features.length){
   const points=features.flatMap(f=>rbRings(f).flat()),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),scale=Math.min(840/(xmax-xmin),500/(ymax-ymin));
   const project=p=>[(900-(xmax-xmin)*scale)/2+(p[0]-xmin)*scale,(550-(ymax-ymin)*scale)/2+(ymax-p[1])*scale];
   features.forEach((f,i)=>{const bairro=f.properties.bairro,path=document.createElementNS(NS,'path');path.setAttribute('d',rbRings(f).map(r=>r.map((p,j)=>(j?'L':'M')+project(p).map(n=>n.toFixed(2)).join(',')).join(' ')+' Z').join(' '));path.setAttribute('fill-rule','evenodd');path.setAttribute('fill',rbColors[i%rbColors.length]);path.classList.add('rb-region');path.classList.toggle('selected',state.bairro===bairro);path.setAttribute('tabindex','0');path.setAttribute('role','button');path.setAttribute('aria-label',bairro+'; selecionar bairro');const title=document.createElementNS(NS,'title');title.textContent=bairro+' · '+fmt.format(selection.filter(r=>r.bairro===bairro).reduce((n,r)=>n+r.votos,0))+' votos';path.append(title);path.addEventListener('click',()=>selectTownNeighborhood(bairro));path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectTownNeighborhood(bairro);}});townSvg.append(path);});
  }
  if(pointMap){
   const places=[...new Map(scope.filter(r=>Number.isFinite(r.latitude)&&Number.isFinite(r.longitude)&&Math.abs(r.latitude)<90&&Math.abs(r.longitude)<180).map(r=>[localKey(r),r])).values()];
   if(places.length){const xs=places.map(r=>r.longitude),ys=places.map(r=>r.latitude),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),scale=Math.min(800/Math.max(.001,xmax-xmin),460/Math.max(.001,ymax-ymin));
    places.forEach(r=>{const point=document.createElementNS(NS,'circle'),key=localKey(r);point.setAttribute('cx',(900-(xmax-xmin)*scale)/2+(r.longitude-xmin)*scale);point.setAttribute('cy',(550-(ymax-ymin)*scale)/2+(ymax-r.latitude)*scale);point.setAttribute('r',state.bairro===r.bairro?9:6);point.setAttribute('fill',rbColors[Math.max(0,names.indexOf(r.bairro))%rbColors.length]);point.setAttribute('stroke','#17343b');point.setAttribute('stroke-width',state.bairro===r.bairro?3:1);point.setAttribute('tabindex','0');point.setAttribute('role','button');point.setAttribute('aria-label',r.localNome+' · '+r.bairro+'; selecionar bairro');const title=document.createElementNS(NS,'title');title.textContent=r.localNome+' · '+r.bairro+' · '+fmt.format(selection.filter(x=>localKey(x)===key).reduce((n,x)=>n+x.votos,0))+' votos';point.append(title);point.addEventListener('click',()=>selectTownNeighborhood(r.bairro));point.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectTownNeighborhood(r.bairro);}});townSvg.append(point);});
   }
   buttons.forEach((b,i)=>{const dot=document.createElement('i');dot.style.cssText='display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;background:'+rbColors[i%rbColors.length];b.prepend(dot);});
   $('rio-branco-regions').querySelector('.section-heading + .section-note').textContent='Cada ponto representa um prédio de votação. Toque no ponto ou no botão do bairro para filtrar. As cores identificam o bairro declarado pelo TSE, sem representar quantidade de votos. Esta visualização não delimita os bairros.';
  }
  $('rb-map-status').textContent=features.length?`${fmt.format(selection.reduce((n,r)=>n+r.votos,0))} votos em ${selection.length} seções nos filtros atuais. ${scope.filter(r=>!r.bairro).length} das ${scope.length} seções não têm bairro identificado. O mapa inclui bairros da malha, mesmo sem locais de votação na base.`:'Não há malha oficial de bairros deste município na base consultada. Use os filtros de zona, prédio de votação e endereço. Os locais permanecem com bairro não identificado.';
  if(pointMap){$('rb-map-status').textContent=`${fmt.format(selection.reduce((n,r)=>n+r.votos,0))} votos em ${selection.length} seções nos filtros atuais. ${scope.filter(r=>!r.bairro).length} seções sem bairro identificado. O cadastro inclui denominações de zonas rurais; elas não são bairros urbanos. Posições: coordenadas dos prédios do TRE-AC.`;}
  $('rio-branco-regions').querySelector('.rb-source').innerHTML='Fontes: coordenadas dos prédios no TRE-AC e <a href="https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html?edicao=41851&t=resultados" target="_blank" rel="noopener noreferrer">malha de bairros do IBGE · Censo 2022</a>. Limites podem ter mudado desde o censo. Bairro do prédio não significa residência do eleitor. Regionais urbanas disponíveis somente para Rio Branco.';
  if(pointMap)$('rio-branco-regions').querySelector('.rb-source').innerHTML='Fonte dos bairros: <a href="https://dadosabertos.tse.jus.br/dataset/eleitorado-2026/resource/300626b4-2b24-4d2e-b4fc-46b569cfffe5" target="_blank" rel="noopener noreferrer">TSE · locais de votação 2026</a>, gerado em 07/10/2026. Correspondência conferida por município, zona, código do prédio, nome e endereço. Mapa de pontos, sem polígonos de bairros. Bairro do prédio não informa residência do eleitor.';
 }
 const rbOriginalIntro=$('rio-branco-regions').querySelector('.section-heading + .section-note').textContent,rbOriginalSource=$('rio-branco-regions').querySelector('.rb-source').innerHTML;
 function renderRBMap(){
  $('rio-branco-regions').hidden=false;
  const isRB=!state.municipio||state.municipio==='01392';rbSvg.style.display=isRB?'':'none';townSvg.style.display=isRB?'none':'';
  $('rb-show-bairros').closest('label').hidden=!isRB;rbSvg.parentElement.querySelector('.map-tools').hidden=!isRB;
  if(!isRB){renderTownMap(state.municipio);return;}
  $('rb-title').textContent='Explore as regionais e os bairros';$('rio-branco-regions').querySelector('.eyebrow').textContent='RIO BRANCO · REGIONAIS URBANAS';$('rb-clear').textContent='Todas as regionais';$('rio-branco-regions').querySelector('.section-heading + .section-note').textContent=rbOriginalIntro;$('rio-branco-regions').querySelector('.rb-source').innerHTML=rbOriginalSource;
  const scope=rows.filter(r=>r.codigo==='01392'),selection=filtered.filter(r=>r.codigo==='01392');
  $('rb-regional-legend').replaceChildren(...rbFeatures.map((f,i)=>{const key=f.properties.Regional,rs=selection.filter(r=>r.regional===key),button=document.createElement('button');button.type='button';button.className='rb-legend-button';button.setAttribute('aria-pressed',String(state.regional===key));button.innerHTML=`<i style="background:${rbColors[i]}"></i><span>${esc(f.properties.label)}<small>${fmt.format(rs.reduce((sum,r)=>sum+r.votos,0))} votos · ${rs.length} seções nos filtros</small></span>`;button.addEventListener('click',()=>rbSelect(state.regional===key?'':key));const path=rbPaths.get(key);path.classList.toggle('selected',state.regional===key);path.classList.toggle('muted',Boolean(state.regional&&state.regional!==key));path.setAttribute('aria-pressed',String(state.regional===key));path.querySelector('title').textContent=f.properties.label+': '+fmt.format(rs.reduce((sum,r)=>sum+r.votos,0))+' votos nos filtros';return button;}));
  const selectedFeature=rbFeatures.find(f=>f.properties.Regional===state.regional);
  $('rb-selected-title').textContent=selectedFeature?selectedFeature.properties.label:'Bairros com locais de votação identificados';
  const neighborhoodNames=[...new Set(scope.filter(r=>r.bairro&&(!state.regional||r.regional===state.regional)).map(r=>r.bairro))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  $('rb-bairros-list').replaceChildren(...neighborhoodNames.map(name=>{const b=document.createElement('button');b.className='button light';b.type='button';const neighborhoodRows=selection.filter(r=>r.bairro===name);b.textContent=name+' · '+fmt.format(neighborhoodRows.reduce((sum,r)=>sum+r.votos,0))+' votos';b.setAttribute('aria-pressed',String(state.bairro===name));b.addEventListener('click',()=>rbSelect(state.regional,state.bairro===name?'':name));return b;}));
  $('rb-map-status').textContent=`${fmt.format(selection.reduce((sum,r)=>sum+r.votos,0))} votos em ${selection.length} seções de Rio Branco nos filtros atuais. ${scope.filter(r=>!r.regional).length} das ${scope.length} seções não têm regional identificada e não são atribuídas a um polígono.`;
  rbNeighborhoodLayer.querySelectorAll('.rb-bairro').forEach(p=>p.classList.toggle('selected',Boolean(state.bairro&&p.dataset.bairro===state.bairro)));
 }

 const judicialCases=DATA.judicialCases||[];
 $('judicial-case').replaceChildren(...judicialCases.map(j=>{const c=candidates.get(j.candidateId);return new Option(`${c.nome} · ${DATA.offices.find(o=>o.codigo===c.cargo).nome}`,j.id);}));
 $('judicial-case').value=judicialCases.some(j=>j.id==='6:1515')?'6:1515':judicialCases[0]?.id||'';
 $('judicial-case').addEventListener('change',renderJudicial);
 function judicialNumber(value){return new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value);}
 function renderJudicial(){
  const j=judicialCases.find(j=>j.id===$('judicial-case').value),target=$('judicial-content');if(!j){target.textContent='Nenhum caso cadastrado.';return;}
  const c=candidates.get(j.candidateId),office=DATA.offices.find(o=>o.codigo===c.cargo);
  let html=`<div class="judicial-facts"><div><span>Candidato e partido</span><strong>${esc(c.nome)} · ${esc(c.partido)}</strong></div><div><span>Votos registrados nos boletins</span><strong>${fmt.format(c.total)}</strong></div><div><span>Destinação na base eleitoral</span><strong>${esc(c.destinacao)}</strong></div></div><p class="section-note">Fonte da base: coleta de 05/10/2026. Conferência do cadastro: ${esc(j.checked)}. Dados estaduais de ${esc(office.nome)}; independentes dos filtros territoriais.</p><p class="judicial-notice">${esc(j.judicialNote)}</p><p><strong>Processo:</strong> ${j.process?esc(j.process):'Não cadastrado'}${j.decisionURL?` · <a href="${esc(j.decisionURL)}" target="_blank" rel="noopener noreferrer">Decisão oficial cadastrada</a>`:''}</p>`;
  const s=j.scenario;
  if(!s){html+='<p class="judicial-notice">Não há simulação validada para este caso. A destinação dos votos, sozinha, não informa quem entraria ou sairia. É necessário conferir a decisão, o cargo e os dados completos da totalização. Para cargos majoritários, não se aplica o cálculo de quocientes proporcionais.</p>';}
  else{
   const a=s.base,b=s.hypothetical;
   html+=`<h3>Hipótese de validação dos votos · simulação</h3><p>${esc(s.hypothesis)}</p><p class="judicial-result"><strong>${esc(s.conclusion)}</strong></p><p>${esc(s.explanation)}</p><h3>Quociente eleitoral e requisitos de distribuição</h3><div class="table-scroll"><table><thead><tr><th>Cálculo</th><th>Base oficial</th><th>Hipótese simulada</th></tr></thead><tbody>${[['Votos válidos (nominais + legenda)',a.valid,b.valid],['Vagas em disputa',a.winners.length,b.winners.length],['Quociente eleitoral (QE)',a.qe,b.qe],['Mínimo do partido/federação: 80% do QE',a.qe*.8,b.qe*.8],['Mínimo individual nas vagas por QP: 10% do QE',a.qe*.1,b.qe*.1],['Mínimo individual na etapa de sobras 80/20: 20% do QE',a.qe*.2,b.qe*.2]].map(([label,x,y])=>`<tr><td>${label}</td><td>${judicialNumber(x)}</td><td>${judicialNumber(y)}</td></tr>`).join('')}</tbody></table></div><p class="section-note">QE = votos válidos ÷ vagas, desprezando a fração até 0,5 e arredondando para cima se maior que 0,5. QP = votos válidos do partido ou federação ÷ QE, desprezada a fração. As federações são calculadas em conjunto.</p>`;
   html+='<h3>Votos, quociente partidário e vagas por partido ou federação</h3><div class="table-scroll"><table><thead><tr><th>Partido / federação</th><th>Votos na base</th><th>Votos na hipótese</th><th>QP na base</th><th>QP na hipótese</th><th>Vagas na base</th><th>Vagas na hipótese</th></tr></thead><tbody>'+a.groups.map(g=>{const h=b.groups.find(x=>x.name===g.name);return `<tr><td>${esc(g.name)}</td><td>${fmt.format(g.votes)}</td><td>${fmt.format(h.votes)}</td><td>${g.qp}</td><td>${h.qp}</td><td>${g.seats}</td><td>${h.seats}</td></tr>`;}).join('')+'</tbody></table></div>';
   html+='<h3>Quem ocupa as vagas</h3><div class="table-scroll"><table><thead><tr><th>Candidato</th><th>Partido</th><th>Base oficial</th><th>Hipótese simulada</th></tr></thead><tbody>'+[...new Set([...a.winners,...b.winners])].map(n=>{const candidate=candidates.get(c.cargo+':'+n);return `<tr><td>${esc(candidate.nome)}</td><td>${esc(candidate.partido)}</td><td>${a.winners.includes(n)?'Ocupa vaga':'Não ocupa vaga'}</td><td>${b.winners.includes(n)?'Ocupa vaga':'Não ocupa vaga'}</td></tr>`;}).join('')+'</tbody></table></div>';
   html+='<h3>Distribuição das sobras por média</h3><p class="section-note">Média = votos do partido/federação ÷ (QP + vagas de sobras já atribuídas + 1). A distribuição é refeita a cada vaga. Se a etapa 80/20 se esgotar, a regra prevê a etapa remanescente entre todos; isso não foi necessário neste cenário.</p><div class="judicial-rounds">'+[[a,'Base oficial'],[b,'Hipótese simulada']].map(([r,label])=>'<div><h4>'+label+'</h4><table><thead><tr><th>Rodada</th><th>Vaga atribuída</th><th>Média vencedora</th></tr></thead><tbody>'+r.rounds.map((round,i)=>`<tr><td>${i+1} · ${esc(round.phase)}</td><td>${esc(round.name)}<small>${esc(round.group)}</small></td><td>${judicialNumber(round.average)}</td></tr>`).join('')+'</tbody></table></div>').join('')+'</div><p class="section-note">Validação matemática: a reprodução da base conferiu os mesmos oito eleitos da totalização oficial. A hipótese é uma análise independente e não altera o resultado exibido nas demais áreas do painel.</p>';
  }
  html+=`<div class="judicial-links"><strong>Referências</strong><a href="https://resultados.tse.jus.br/oficial/app/index.html#/eleicao/${office.eleicao}/uf/ac/mu/todos/cargo/${c.cargo}/vis/nominal/resultados" target="_blank" rel="noopener noreferrer">Resultados oficiais do TSE</a><a href="${esc(s?.rules||'https://www.tse.jus.br/legislacao/compilada/res/2021/resolucao-no-23-677-de-16-de-dezembro-de-2021')}" target="_blank" rel="noopener noreferrer">Regras de distribuição · Resolução TSE nº 23.677</a></div>`;
  target.innerHTML=html;
 }
 renderJudicial();

 $('judicial-report').addEventListener('click',()=>generateReport(true));
 const distributionData=DATA.seatDistributions||[];
 $('distribution-office').replaceChildren(...distributionData.map(x=>new Option(DATA.offices.find(o=>o.codigo===x.cargo).nome,x.cargo)));
 $('distribution-office').value='7';
 $('distribution-office').addEventListener('change',()=>{updateDistributionGroups();renderDistributionSeats();});
 $('distribution-party').addEventListener('change',renderDistributionSeats);
 function updateDistributionGroups(){const item=distributionData.find(x=>x.cargo===$('distribution-office').value);$('distribution-party').replaceChildren(new Option('Todos os partidos e federações',''),...item.base.groups.map(g=>new Option(g.name,g.id)));}
 function distributionHTML(){
  const item=distributionData.find(x=>x.cargo===$('distribution-office').value),r=item.base,key=$('distribution-party').value,groups=r.groups.filter(g=>!key||g.id===key),selectedNames=new Set(groups.map(g=>g.name));
  let html=`<p class="section-note">Totais estaduais da base oficial de ${esc(DATA.offices.find(o=>o.codigo===item.cargo).nome)}. Independentes dos filtros territoriais e das simulações judiciais. Arquivo oficial gerado em ${esc(item.officialGenerated)}; conferência em ${esc(item.checked)}.</p><div class="judicial-facts"><div><span>Votos válidos (nominais + legenda)</span><strong>${fmt.format(r.valid)}</strong></div><div><span>Vagas em disputa</span><strong>${r.vacancies}</strong></div><div><span>Quociente eleitoral</span><strong>${fmt.format(r.qe)}</strong></div></div><p><strong>QE:</strong> ${fmt.format(r.valid)} ÷ ${r.vacancies} = ${judicialNumber(r.valid/r.vacancies)} → ${fmt.format(r.qe)}. A fração até 0,5 é desprezada; acima de 0,5 arredonda-se para cima.</p><p><strong>QP:</strong> votos válidos do partido ou federação ÷ QE, descartando a fração. Essas vagas exigem candidato com pelo menos ${judicialNumber(r.qe*.1)} votos (10% do QE).</p>`;
  html+='<h3>Como as vagas foram distribuídas</h3><div class="table-scroll"><table><thead><tr><th>Partido / federação</th><th>Nominais válidos</th><th>Legenda válida</th><th>Total válido</th><th>Cálculo QP</th><th>Vagas preenchidas por QP</th><th>Vagas nas sobras</th><th>Total de vagas</th></tr></thead><tbody>'+groups.map(g=>`<tr><td>${esc(g.name)}</td><td>${fmt.format(g.nominal)}</td><td>${fmt.format(g.legend)}</td><td>${fmt.format(g.votes)}</td><td>${fmt.format(g.votes)} ÷ ${fmt.format(r.qe)} = ${judicialNumber(g.votes/r.qe)} → ${g.qp}</td><td>${g.initialSeats}</td><td>${g.seats-g.initialSeats}</td><td><strong>${g.seats}</strong></td></tr>`).join('')+'</tbody></table></div>';
  html+='<h3>Quantos votos são necessários para uma, duas ou mais vagas por QP?</h3><p class="section-note">Cada vaga pelo quociente partidário exige um múltiplo do QE e candidatos suficientes com o mínimo individual de 10%. Não é um limite fixo para vagas obtidas nas sobras.</p>';
  for(const g of groups.filter(g=>key||g.seats>0)){
   html+='<details class="seat-threshold"><summary>'+esc(g.name)+' · '+fmt.format(g.votes)+' votos válidos · '+g.seats+' vagas</summary><table><thead><tr><th>Vagas por QP</th><th>Mínimo de votos do partido/federação</th><th>Na base oficial</th></tr></thead><tbody>'+Array.from({length:Math.min(r.vacancies,Math.max(2,g.seats+1))},(_,i)=>{const n=i+1;return '<tr><td>'+n+'</td><td>'+n+' × '+fmt.format(r.qe)+' = '+fmt.format(n*r.qe)+'</td><td>'+(g.votes>=n*r.qe?'Múltiplo alcançado':'Múltiplo não alcançado')+'</td></tr>';}).join('')+'</tbody></table></details>';
  }
  const awards=r.awards.filter(x=>selectedNames.has(x.group));
  html+='<h3>Todos os eleitos e a origem de cada vaga</h3><div class="table-scroll"><table><thead><tr><th>Eleito</th><th>Partido</th><th>Federação / legenda</th><th>Votos individuais</th><th>Etapa</th><th>Mínimo individual</th><th>Rodada / média vencedora</th></tr></thead><tbody>'+awards.map(x=>`<tr><td>${esc(x.name)} · ${esc(x.number)}</td><td>${esc(x.party)}</td><td>${esc(x.group)}</td><td>${fmt.format(x.votes)}</td><td>${esc(x.phase)}</td><td>${judicialNumber(x.minimum)}</td><td>${x.round?'Rodada '+x.round+' · '+judicialNumber(x.average):'—'}</td></tr>`).join('')+'</tbody></table></div>';
  html+='<h3>Vagas pelas sobras: cálculo das médias a cada rodada</h3><p>Primeira etapa de sobras: partido ou federação com pelo menos '+judicialNumber(r.qe*.8)+' votos (80% do QE) e candidato com pelo menos '+judicialNumber(r.qe*.2)+' votos (20% do QE). A média divide os votos válidos por QP + vagas de sobras já atribuídas + 1. A maior média elegível recebe a vaga. Quando essa etapa se esgota, todas as legendas e candidaturas participam das vagas remanescentes, sem os mínimos 80/20.</p><p class="section-note">As rodadas abaixo consideram todos os concorrentes elegíveis mesmo quando um partido está selecionado. Desempates: votos do partido/federação, votos do candidato e idade, conforme a norma. Não houve empate decisivo nestes cálculos.</p>';
  html+=r.rounds.map((round,i)=>'<details class="seat-round"><summary>Rodada '+(i+1)+' · '+esc(round.name)+' · '+esc(round.phase)+' · média '+judicialNumber(round.average)+'</summary><table><thead><tr><th>Concorrente elegível</th><th>Votos</th><th>Divisor</th><th>Média</th></tr></thead><tbody>'+round.competitors.map((c,j)=>'<tr><td>'+esc(c.group)+(j===0?' · maior média':'')+'</td><td>'+fmt.format(c.votes)+'</td><td>'+c.denominator+'</td><td>'+judicialNumber(c.average)+'</td></tr>').join('')+'</tbody></table></details>').join('');
  html+='<p class="judicial-notice">O total de votos de cada candidato, sozinho, não determina a eleição. As vagas pertencem ao partido ou à federação e dependem das etapas acima. A reprodução conferiu os '+r.vacancies+' eleitos e o QE da totalização oficial.</p><div class="judicial-links"><a href="https://resultados.tse.jus.br/oficial/app/index.html#/eleicao/6259/uf/ac/mu/todos/cargo/'+item.cargo+'/vis/nominal/resultados" target="_blank" rel="noopener noreferrer">Resultados oficiais do TSE</a><a href="https://www.tse.jus.br/legislacao/compilada/res/2021/resolucao-no-23-677-de-16-de-dezembro-de-2021" target="_blank" rel="noopener noreferrer">Resolução TSE nº 23.677 · arts. 8 a 12-A</a></div>';
  return html;
 }
 function renderDistributionSeats(){$('distribution-seats-content').innerHTML=distributionHTML();}
 updateDistributionGroups();renderDistributionSeats();
 $('distribution-report').addEventListener('click',()=>generateReport('distribution'));

 function applyPageView(){
  const home=activeView==='home',legal=activeView==='quociente'||activeView==='subjudice',candidate=Boolean(current)&&!home&&!legal;
  for(const section of document.querySelectorAll('main>section')){
   if(legal)section.hidden=section.id!==(activeView==='quociente'?'distribuicao-vagas':'situacao-judicial');
   else if(home)section.hidden=!(section.classList.contains('intro')||section.classList.contains('candidate-panel')||section.id==='general-overview'||section.id==='electorate-panel');
   else section.hidden=section.id==='situacao-judicial'||section.id==='distribuicao-vagas'||section.id==='general-overview'||section.id==='electorate-panel'||(!candidate&&!section.classList.contains('intro')&&!section.classList.contains('candidate-panel'));
  }
  document.querySelectorAll('.main-grid,.secondary-grid').forEach(section=>section.hidden=!candidate);
  $('share').hidden=!candidate;
  document.querySelectorAll('.sidebar [data-view]').forEach(link=>{if(link.dataset.view===activeView)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  if(!candidate&&!home&&!legal){const office=DATA.offices.find(o=>o.codigo===state.cargo);$('page-title').textContent=office?.nome||'Votos no Acre';$('office-name').textContent='Eleições 2026 · 1º turno';document.title=(office?.nome||'Votos no Acre')+' · Votos no Acre';}
  if(legal){document.title=(activeView==='quociente'?'Quociente eleitoral':'Candidatos sub judice')+' · Votos no Acre';}
 }
 function closeMenu(){$('sidebar-links').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');$('menu-toggle').textContent='Abrir menu';}
 function openPage(view){
  closeMenu();
  if(['quociente','subjudice'].includes(view)){activeView=view;applyPageView();try{history.replaceState(null,'',location.pathname+location.search+'#pagina='+view);}catch{} }
  else{state.cargo=view==='home'?'':view;$('candidate-search').value='';showOverview();}
  window.scrollTo({top:0,behavior:'instant'});
 }
 document.querySelectorAll('.sidebar [data-view]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();openPage(link.dataset.view);}));
 document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();openPage('home');});
 $('menu-toggle').addEventListener('click',()=>{const open=$('sidebar-links').classList.toggle('open');$('menu-toggle').setAttribute('aria-expanded',String(open));$('menu-toggle').textContent=open?'Fechar menu':'Abrir menu';});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 $('candidate-photo').addEventListener('error',()=>{$('candidate-photo').hidden=true;});
 populateCandidates();restoreURL();
 initComparison();
})();


