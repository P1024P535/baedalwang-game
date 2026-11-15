// RETENTION_108: comfortable idle play, bounded prestige growth, persistent goals.
function cycleScale(c){c=Math.max(0,Math.floor(c||0));return Math.pow(2,Math.min(c,5))*(1+.2*Math.max(0,c-5));}
function missionProgress(key){
 checkDay();const p=S.mis.p;
 return key==='ad'?(p.ad||0)+Math.floor((p.adPlay||0)/50):(p[key]||0);
}
const retentionDaily=dailyMissions;
dailyMissions=function(){return retentionDaily().map(m=>m[0]==='ad'?['ad',L('선택 미션: 광고 또는 배달 100회','Choice: ad rewards or 100 deliveries'),2]:m);};
const retentionMis=mis;
mis=function(k,n=1){
 if(k==='job')S.st.upgrades=(S.st.upgrades||0)+n;
 retentionMis(k,n);
 if(k==='tap'&&!S.mis.done.includes('ad'))originalMis('adPlay',n);
};
function journeyUnits(){return(S.st.moves||0)*100+Math.min(100,Math.max(0,S.run/R[S.region][2]*100));}
const retentionWeek=wkState;
wkState=function(){const w=retentionWeek();if(!Number.isFinite(w.b.journey))w.b.journey=journeyUnits();return w;};
const retentionWeekProgress=wkProg;
wkProg=function(m){const regular=retentionWeekProgress(m);return m[0]==='move'?Math.max(regular,Math.floor((journeyUnits()-wkState().b.journey+1e-7)/10)):regular;};
WK.find(m=>m[0]==='move')[1]=L('이사 2회 또는 지역 목표 20% 진행','Move twice or advance region goals by 20%');

const CAREER_BADGES=[
 {id:'first-star',n:1,name:'첫별의 배달부',fame:3},
 {id:'trusted',n:2,name:'단골의 믿음',fame:5},
 {id:'borderless',n:3,name:'국경 없는 라이더',fame:8},
 {id:'pioneer',n:5,name:'별빛 개척자',fame:12},
 {id:'galactic',n:10,name:'은하계 단골왕',fame:20},
 {id:'master',n:20,name:'전설의 길잡이',fame:30},
 {id:'constellation',n:30,name:'별자리를 잇는 라이더',fame:40},
 {id:'everlasting',n:50,name:'끝없는 배달의 전설',fame:60}
];
const CAREER_THEMES=[
 {name:'단골의 부탁',story:'단골 할머니: “이번에는 동네의 작은 약속을 하나씩 지켜 보렴.”',tasks:[['taps','직접·자동 배달',150],['del','손님에게 배달',100],['upgrades','배달 강화',30]]},
 {name:'함께 만드는 회사',story:'첫 직원: “같은 길도 함께 달리면 달라져요. 이번에는 팀을 키워 봐요.”',tasks:[['hire','직원 고용',10],['upgrades','배달 강화',40],['del','손님에게 배달',150]]},
 {name:'번개맨의 도전장',story:'번개맨: “이번에는 실력을 겨뤄 보자. 준비됐을 때 도전해!”',tasks:[['fix','돌발 상황 해결',3],['races','라이벌 레이스 승리',1],['del','손님에게 배달',200]]}
];
function careerCounter(k){return k==='taps'?(S.taps||0):(S.st[k]||0);}
function careerState(){
 if(!S.career||S.career.v!==1)S.career={v:1,claimed:[],badge:'',run:null};
 const c=S.career;if(!Array.isArray(c.claimed))c.claimed=[];
 if(!c.run||c.run.cycle!==(S.clears||0)){
  const base={};for(const k of ['taps','del','upgrades','hire','fix','races'])base[k]=careerCounter(k);
  c.run={cycle:S.clears||0,base,done:[]};
 }
 return c;
}
function careerTasks(){
 if(!(S.clears>0))return[];
 const theme=CAREER_THEMES[(S.clears-1)%CAREER_THEMES.length],extra=1+.1*Math.min(9,S.clears-1);
 return theme.tasks.map(([key,title,n])=>({key,title,target:Math.ceil(n*extra)}));
}
function careerProgress(t){return Math.max(0,careerCounter(t.key)-(careerState().run.base[t.key]||0));}
function careerAction(a,b){
 if(a==='career-open'){const board=document.querySelector('.career-board');if(board){board.open=true;board.scrollIntoView({block:'start',behavior:'smooth'});}return true;}
 if(!['career-award','career-equip','career-contract'].includes(a))return false;
 const c=careerState(),id=b.dataset.id;
 if(a==='career-contract'){
  const t=careerTasks().find(t=>t.key===id);
  if(!t||c.run.done.includes(id)||careerProgress(t)<t.target)return true;
  c.run.done.push(id);S.fame+=2;save();sfx('coin');toast(L('여정 계약 완료 · 명성 +2','Journey contract complete · Fame +2'));render();return true;
 }
 const badge=CAREER_BADGES.find(x=>x.id===id);if(!badge)return true;
 if(a==='career-award'){
  if(S.clears<badge.n||c.claimed.includes(id))return true;
  c.claimed.push(id);c.badge=id;S.fame+=badge.fame;
  toast(`${badge.name} · 명성 +${badge.fame}`);sfx('lvl');
 }else{if(!c.claimed.includes(id))return true;c.badge=id;toast(badge.name);}
 save();render();hud();return true;
}
function careerHTML(){
 const c=careerState(),tasks=careerTasks(),theme=S.clears?CAREER_THEMES[(S.clears-1)%3]:null;
 const badge=CAREER_BADGES.find(x=>x.id===c.badge&&c.claimed.includes(x.id));
 return `<details class="career-board" ${S.clears?'open':''}><summary>${L('나의 배달 여정','My delivery journey')} · ${S.clears||0}회 완주 · ${c.claimed.length}/${CAREER_BADGES.length} 칭호</summary>
 <p>${badge?'★ '+badge.name:S.clears?L('아래에서 완주 칭호를 받고 이번 여정 계약에 도전해 보세요.','Claim your completion titles and try this journey’s contracts below.'):L('첫 화성 배달 후 전용 칭호와 여정 계약이 열려요.','Complete your first Mars delivery to unlock journey contracts and titles.')}</p>
 ${theme?`<div class="sec">${S.clears+1}회차 · ${theme.name}</div><p>${theme.story}</p><p class="tip">참여는 자유예요. 지역을 옮겨도 계약 진행은 이어지고, 회차를 마치면 새로운 계약이 열려요.</p>${tasks.map(t=>{const done=c.run.done.includes(t.key),p=Math.min(t.target,careerProgress(t));return`<div class="career-task"><div><b>${t.title}</b><small>${p} / ${t.target} · 명성 +2</small></div><button class="gb ${done?'own':'y'}" data-act="career-contract" data-id="${t.key}" ${done||p<t.target?'disabled':''}>${done?'완료':'받기'}</button></div>`;}).join('')}`:''}
 <div class="career-collection">${CAREER_BADGES.map(x=>{const owned=c.claimed.includes(x.id),ready=S.clears>=x.n;return`<button class="gb ${owned?'own':ready?'y':''}" data-act="${owned?'career-equip':'career-award'}" data-id="${x.id}" ${ready?'':'disabled'}>${x.name}<small>${owned?(x.id===c.badge?'장착 중':'칭호 장착'):`${x.n}회 완주 · 명성 +${x.fame}`}</small></button>`;}).join('')}</div></details>`;
}
const retentionAct=onAct;
onAct=function(b){if(careerAction(b.dataset.act,b))return;return retentionAct(b);};
const retentionRender=render;
render=function(){const view=tab,scroll=$('shBody').scrollTop;retentionRender();if(tab==='region'){
 $('shBody').insertAdjacentHTML('beforeend',careerHTML());
 const ready=CAREER_BADGES.filter(x=>S.clears>=x.n&&!careerState().claimed.includes(x.id)).length;
 $('shSub').insertAdjacentHTML('beforeend',`<button class="gb career-shortcut" data-act="career-open">${L('여정·칭호 보기','Journey & titles')}${ready?' +'+ready:''}</button>`);
 if(view==='region')$('shBody').scrollTop=scroll;
}};
const retentionCol=colHTML;
colHTML=function(){return retentionCol()+(colTab==='st'?careerHTML():'');};
const retentionScene=scene;
scene=function(){retentionScene();careerState();};
const retentionHud=hud;
hud=function(){
 retentionHud();const c=careerState(),badge=CAREER_BADGES.find(x=>x.id===c.badge&&c.claimed.includes(x.id));
 if(badge){const e=document.createElement('span');e.className='ef career-tag';e.textContent='★ '+badge.name;$('effects').appendChild(e);}
};
