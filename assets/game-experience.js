/* Presentation layer: uses existing purchases and save state; grants no rewards. */
(function(root){
'use strict';
const shop=['01_headquarters','02_restaurant','03_cafe','04_convenience_store','05_mart','06_parcel_terminal','07_logistics_center','08_gas_station','09_repair_shop','10_research_lab','11_upgrade_center','12_vehicle_shop'];
function create(api){
 const {getState,jobs,vehicles,cost,format:f,income,level,roi}=api;
 let manifest=null,lastUpdate=0,quickIndex=-1,feedbackTimer;
 const $=id=>document.getElementById(id);
 fetch('assets/world-2d/manifest.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(m=>{manifest=m;paintArt()}).catch(()=>{});
 function art(i){return '<span class="game-art" aria-hidden="true" data-art="shop/'+shop[i%shop.length]+'"></span>'}
 function vehicleArt(i){return '<span class="game-art" aria-hidden="true" data-art="vehicle/'+i+'/right"></span>'}
 function paintArt(){if(!manifest)return;document.querySelectorAll('[data-art]:not([data-painted])').forEach(el=>{const a=manifest.assets[el.dataset.art];if(!a)return;const g=manifest.groups[a.sheet],[x,y,w,h]=a.rect;el.innerHTML='<svg viewBox="'+[x,y,w,h].join(' ')+'" aria-hidden="true"><image href="'+g.src+'" width="'+g.width+'" height="'+g.height+'"/></svg>';el.dataset.painted='1'})}
 function nextMilestone(n){return [25,50,100,200,400].find(v=>v>n)||400}
 function progress(n){return Math.min(100,n/nextMilestone(n)*100)}
 function update(tab){
  const now=Date.now();if(now-lastUpdate<150)return;lastUpdate=now;const s=getState(),dock=$('quick-dock');dock.hidden=tab!=='main';
  if(tab==='main'){
   // Follow the first story goal, then suggest the quickest return on investment.
   let i=s.g===0?0:jobs.reduce((best,x,k)=>roi(k)<roi(best)?k:best,0);
   if(quickIndex!==i||!$('quick-buy')){quickIndex=i;dock.innerHTML='<div class="dock-heading"><span>배달왕 <b>DALBONG EXPRESS</b></span><button data-tab="jobs" class="dock-more">전체 성장 ›</button></div><div class="quick-row">'+art(i)+'<div class="quick-copy"><small>추천 성장</small><strong>'+jobs[i].n+' <span id="quick-level"></span></strong><span id="quick-desc"></span></div><button id="quick-buy" data-job="'+i+'" data-cost="'+cost(i,1)+'"><b id="quick-price"></b><small>업그레이드</small></button></div><button class=next-vehicle data-section=veh><span class=vehicle-sprite data-art="vehicle/0/right"></span><span><small>다음 탈것</small><strong id=next-vehicle-name></strong></span><span id=next-vehicle-cost></span><b>›</b></button>'}
   $('quick-level').textContent='LV.'+s.j[i];$('quick-price').textContent=f(cost(i,1))+'원';$('quick-buy').dataset.cost=cost(i,1);$('quick-desc').textContent=s.j[i]>=400?'최대 수익 보너스 달성':'다음 보너스까지 '+(nextMilestone(s.j[i])-s.j[i])+'개';
   const next=vehicles[Math.min(vehicles.length-1,s.v+1)],vArt=dock.querySelector('.vehicle-sprite'),vKey='vehicle/'+Math.min(vehicles.length-1,s.v+1)+'/right';if(vArt.dataset.art!==vKey){vArt.dataset.art=vKey;delete vArt.dataset.painted}
   $('next-vehicle-name').textContent=s.v===vehicles.length-1?'최고 등급 달성':next.n+' 해금';$('next-vehicle-cost').textContent=s.v===vehicles.length-1?'완료':f(next.c)+'원';
  }
  paintArt();
 }
 function feedback(title,gain){const el=$('celebrate');el.innerHTML='<small>성장 완료</small><strong>'+title+'</strong><span>초당 수익 +'+f(gain)+'원</span>';el.hidden=false;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>{el.hidden=true},1800)}
 return {art,vehicleArt,progress,update,feedback};
}
root.BWGameUI={create};
})(window);
