// Authorized gameplay revision 1.0.6. Save key/schema and cloud protocol remain v2.
let rewardPending=false, challengeClock=Date.now(), challengeWasPaused=false;
function challengePaused(){return !!(document.hidden||mOpen||tab||rewardPending||$('splash')||$('gate')?.classList.contains('on')||$('ad')?.classList.contains('show'));}
function syncChallenges(){
 const now=Date.now(),elapsed=Math.max(0,now-challengeClock),paused=challengePaused();
 if(paused||challengeWasPaused){
  for(const x of [boss,trouble,race])if(x){x.until+=elapsed;if(x.t0)x.t0+=elapsed;}
  nextEv+=elapsed;nextBoss+=elapsed;nextTrb+=elapsed;nextRace+=elapsed;if(jackUntil)jackUntil+=elapsed;
 }
 challengeClock=now;challengeWasPaused=paused;
}
document.addEventListener('visibilitychange',syncChallenges);
function limitedAd(key,cap,cb){
 if(rewardPending){toast(L('보상 처리 중이에요','Reward in progress'));return;}
 if(!adLeft(key,cap)){toast(L('오늘 보상을 모두 받았어요','Daily limit reached'));return;}
 syncChallenges();rewardPending=true;let settled=false;
 const finish=ok=>{
  if(settled)return;settled=true;syncChallenges();rewardPending=false;
  if(!ok){toast(L('광고를 끝까지 봐야 보상을 받아요','Watch the whole ad to get the reward'));return;}
  if(!adLeft(key,cap))return;
  adUse(key);mis('ad');S.st.ads++;cb();save();render();hud();
 };
 if(S.noAds)finish(true);else try{PLATFORM.showRewardedAd(finish);}catch(_){finish(false);}
}
function offlineEarnings(now=Date.now()){
 const last=Number(S.last)||now,seconds=Math.min(Math.max(0,(now-last)/1000),offMaxH()*3600);
 // The warehouse fills from departure; boost applies only before its expiry.
 const boosted=Math.min(seconds,Math.max(0,((Number(S.boostUntil)||0)-last)/1000));
 return baseIps()*offRate()*(seconds+boosted);
}
function dailyMissions(){
 checkDay();
 if(S.veh===V.length-1&&!S.mis.done.includes('veh')&&!(S.mis.p.veh>=1)&&!S.mis.vehFallback)S.mis.vehFallback=true;
 return MI.map(m=>m[0]==='veh'&&S.mis.vehFallback?['veh',L('배달 추가 강화 20번','Upgrade deliveries 20 more times'),20]:m);
}
const originalMis=mis;
mis=function(k,n=1){dailyMissions();originalMis(k,n);if(k==='job'&&S.mis.vehFallback)originalMis('veh',n);};

const CHAPTERS=[
 ['첫 새벽의 약속','단골 할머니: “오늘도 신문 기다릴게. 천천히, 안전하게 와.”','번개맨: “면소재지까지 갈 수 있겠어?”','신문 한 부에서 시작한 약속을 다음 동네로 이어가자.'],
 ['동네의 단골들','우유 가게 사장: “신문 받던 할머니가 자네를 추천했어.”','번개맨: “단골이 벌써 생겼네. 도시에서도 만나자!”','신문과 우유를 넘어 도시의 주문을 준비하자.'],
 ['화성시에서 꾼 꿈','단골 할머니: “화성까지 갔다며? 도시 말고 진짜 별도 가 보렴.”','번개맨: “좋아, 누가 먼저 더 멀리 가나 보자!”','작은 회사와 함께 경기도 전역으로 길을 넓히자.'],
 ['혼자보다 함께','첫 직원: “사장님, 다음 동네는 저희가 함께할게요.”','번개맨: “팀까지 생겼네. 나도 질 수 없지!”','회사와 배달 강화를 함께 키워 광역시로 출발하자.'],
 ['도시를 잇는 라이더','단골 할머니: “멀리 가도 밥은 제때 먹고 다녀.”','번개맨: “특별시 진출은 장기전이야. 중간 목표부터 가자.”','누적 수익 25·50·75%의 중간 배달을 완수하자.'],
 ['불 꺼지지 않는 거리','첫 직원: “이제 바다 건너서도 우리를 기다린대요.”','번개맨: “이번엔 국경을 넘어 붙어 보자!”','로켓은 끝이 아니라 준비다. 아시아의 첫 주문을 향해!'],
 ['국경 너머의 주문','단골 할머니: “먼 나라에서도 자네 소식을 듣는구나.”','번개맨: “한 나라씩, 결국 지구 한 바퀴다!”','세계 곳곳의 주문을 연결하고 지구 배달망을 완성하자.'],
 ['지구에서 온 마지막 주문','첫 직원: “발신지가 화성입니다. 정말 갈 수 있을까요?”','번개맨: “이번만큼은 경쟁 말고 같이 가자.”','우주 진출 자금을 모아 마지막 배송을 준비하자.'],
 ['처음 약속, 마지막 목적지','단골 할머니의 편지: “먼 곳에서도 따뜻한 소식을 기다릴게.”','번개맨: “길은 내가 확인할게. 마지막 상자는 네가 전해.”','화성(Mars)에 첫 배달을 완료하고 배달왕의 이름을 남기자.']
];
function chapterState(){const key=(S.clears||0)+':'+S.region;if(!S.chapter||S.chapter.key!==key)S.chapter={key,claimed:[]};return S.chapter;}
function chapterReward(){return Math.floor(Math.max(1,Math.min(R[S.region][2]*.002,baseIps()*45)));}
function chapterHTML(){
 const ch=CHAPTERS[S.region],state=chapterState(),goal=R[S.region][2];
 return `<section class="chapter"><div class="sec">${L('배달 이야기','Delivery story')} ${S.region+1}/9 · ${ch[0]}</div><p>${ch[1]}</p><p>${ch[2]}</p><p class="tip">${ch[3]}</p><div class="chapter-steps">${[25,50,75].map(p=>{
  const claimed=state.claimed.includes(p),ready=S.run>=goal*p/100;
  return `<button class="gb ${claimed?'own':ready?'y':''}" data-act="chapter" data-p="${p}" ${claimed||!ready?'disabled':''}>${p}% ${claimed?'완료':ready?'보상 받기':'배달 목표'}<small>${claimed?'수령 완료':won(chapterReward())}</small></button>`;
 }).join('')}</div><p class="tip">${L('이야기와 지역 수익 목표는 이사 화면에서 확인해요.','Check your story and goals on the Move screen.')}</p></section>`;
}
const previousOnAct=onAct;
onAct=function(b){
 if(b.dataset.act==='chapter'){
  const p=Number(b.dataset.p),state=chapterState();
  if(![25,50,75].includes(p)||state.claimed.includes(p)||S.run<R[S.region][2]*p/100)return;
  state.claimed.push(p);const amount=chapterReward();earn(amount);save();sfx('coin');toast(L('중간 배달 완료! ','Milestone delivered! ')+won(amount));render();return;
 }
 return previousOnAct(b);
};
const previousRender=render;
render=function(){previousRender();if(tab==='region')$('shBody').insertAdjacentHTML('afterbegin',chapterHTML());};
const previousHud=hud;
hud=function(){
 previousHud();let journey=$('journey');
 if(!journey){journey=document.createElement('button');journey.id='journey';journey.type='button';journey.onclick=e=>{e.stopPropagation();if(tab==='region')closeSheet();openSheet('region');};$('quest').querySelector('.qb').appendChild(journey);}
 const r=R[S.region],ready=S.run>=r[2],next=S.region===8?'화성 배달':R[S.region+1][0];
 journey.textContent=ready?L('이사 가능 · 바로 확인 →','Ready to move · View →'):`${S.region+1}/9 · ${next} ${Math.min(100,S.run/r[2]*100).toFixed(0)}% →`;
 journey.classList.toggle('ready',ready);journey.setAttribute('aria-label',`${r[0]} 누적 수익 ${won(S.run)} / ${won(r[2])}. 이사 화면 열기`);
 if(S.qd?.ty==='region'&&S.region<S.qd.n&&!ready)$('qNum').textContent=won(S.run)+' / '+won(r[2]);
 const chip=$('dReg')?.parentElement;if(chip)chip.classList.toggle('move-ready',ready);
};
// Queue a short arrival scene using the existing modal queue and reset explanation.
const previousScene=scene;
scene=function(){previousScene();chapterState();};
