// Optional narrative collection. No new costs, income multipliers or progression gates.
const MEMORY_ARCS=[
 {id:'grandma',name:'단골 할머니',icon:'ic_milk',episodes:[
 ['taps',10,'첫 신문, 첫 인사','할머니는 문 앞에 놓인 신문보다 먼저 네 얼굴을 살폈다. “오늘 처음이지? 급하게 달리지 말고, 내일도 무사히 와.” 돌아가는 길, 처음 번 돈보다 그 인사가 더 오래 마음에 남았다.','첫 구독 신문'],
 ['region',1,'비 오는 날의 우편함','면소재지로 떠난다는 말에 할머니가 작은 비닐봉투를 건넸다. “신문도, 네 물건도 젖으면 속상하잖니.” 새 동네의 첫 주문에는 할머니가 소개해 준 가게 이름이 적혀 있었다.','빗방울 우편함'],
 ['region',3,'멀리 사는 가족에게','경기도까지 길이 이어지자 할머니가 편지를 부탁했다. 특별한 급행료도, 어려운 조건도 없었다. “지나는 길이면 전해 줄래?” 평소처럼 달리던 길에 누군가의 안부가 함께 실렸다.','안부 편지'],
 ['region',6,'낯선 글씨의 답장','국경을 넘은 배송 목록에 익숙한 주소가 보였다. 할머니의 가족이 답장을 보낸 것이다. 봉투 끝에는 작은 글씨가 덧붙어 있었다. “편지를 이어 주신 배달원님도 잘 지내시죠?”','먼 나라의 우표'],
 ['clears',1,'화성에서 돌아온 편지','첫 화성 배달을 마치고 돌아오니 할머니의 우편함에도 편지가 도착해 있었다. “세상 끝까지 갔다며? 그래도 밥은 제때 먹어야지.” 가장 먼 배송의 끝에서 처음 동네의 인사를 다시 만났다.','할머니의 손편지'],
 ['clears',2,'두 번째 정기 구독','두 번째 여정을 마친 날, 할머니가 새 구독표를 꺼냈다. “신문은 늘 같은 자리에 놓이는데, 네 이야기는 자꾸 넓어지는구나.” 이번에는 네가 먼 길의 소식을 들려주었다.','두 번째 구독표'],
 ['clears',3,'작은 길들의 지도','세 번째 여정 뒤에 할머니가 손으로 그린 지도를 건넸다. 큰 도시는 작게, 첫 신문을 놓았던 집은 크게 그려져 있었다. “얼마나 멀리 갔는지도 좋지만, 누구를 만났는지도 기억하렴.”','손으로 그린 지도'],
 ['clears',5,'내일도 같은 인사','다섯 번의 긴 배송을 마친 뒤에도 할머니의 인사는 같았다. “오늘도 무사히 왔구나.” 너는 다음 출발 시간을 적고 신문 한 부를 문 앞에 놓았다. 끝난 이야기는 다시 만날 약속이 되었다.','별빛 배달 일기']
 ]},
 {id:'crew',name:'첫 직원',icon:'co_1',episodes:[
 ['hire',1,'빈 의자 하나','첫 직원이 작은 사무실에 들어왔다. “사장님, 상자는 어디에 놓을까요?” 혼자라면 잠깐 고민할 일도 둘이 이야기하니 금방 정리됐다. 빈 의자 하나가 회사의 첫 자리가 되었다.','첫 출근 명찰'],
 ['hire',10,'잘못 붙인 배송표','직원이 배송표 두 장을 바꿔 붙였다며 고개를 숙였다. 너는 이미 끝낸 배달 기록을 함께 확인했다. “다음에는 같이 한 번 더 보자.” 열 번의 고용 기록 사이에 처음 만든 업무 요령이 남았다.','함께 만든 확인표'],
 ['region',4,'새 지점의 첫 불빛','광역시로 옮긴 날, 직원이 사무실 불을 켰다. “건물은 달라졌어도 우리가 배운 건 남아 있네요.” 새 회사의 일은 다시 시작하지만 함께했던 기억은 이사 상자에서 사라지지 않았다.','새 지점 열쇠고리'],
 ['region',7,'지구 한 바퀴의 연락망','멀리 떨어진 배송지에서 직원들의 안부가 도착했다. 길을 외운 사람, 표를 정리한 사람, 마지막 상자를 확인한 사람. 네 회사 이름 아래에 여러 사람의 일이 연결되어 있었다.','동료 연락 수첩'],
 ['clears',1,'사진 한 장의 자리','첫 화성 배송이 끝난 뒤 직원이 기념사진을 내밀었다. “다들 바빠서 모이기 어려웠는데, 이번에는 꼭 남기고 싶었어요.” 사진 속 회사는 작았지만 누구도 혼자 서 있지 않았다.','첫 회사 기념사진'],
 ['clears',2,'다시 시작하는 책상','두 번째 완주 뒤 새로운 책상에 예전 확인표를 붙였다. 직원이 웃었다. “이번에는 첫날부터 조금 덜 헤매겠죠?” 회사를 다시 세우는 일과 함께 배운 일을 잊는 일은 달랐다.','낡은 책상 명패'],
 ['clears',3,'새 책임자의 메모','세 번째 여정 뒤 첫 직원에게서 메모가 왔다. “새로 온 분에게 제가 배웠던 걸 알려 드렸어요.” 네가 건넸던 한마디가 다른 동료의 첫 출근을 편하게 만들어 주었다.','동료의 감사 메모'],
 ['clears',5,'우리가 만든 회사','다섯 번째 기념사진에는 처음보다 많은 이름이 적혀 있었다. 직원은 빈칸 하나를 남겼다. “다음에 함께할 분 자리예요.” 회사의 크기는 바뀌어도 서로를 기다리는 자리는 남았다.','함께한 사람들의 사진']
 ]},
 {id:'rival',name:'번개맨',icon:'r_scooter',episodes:[
 ['taps',30,'옆 차선의 인사','배달을 이어 가던 길에 번개맨이 손을 들었다. “새 얼굴이네. 언젠가 같은 코스에서 만나자!” 그는 먼저 출발했지만 교차로에서는 속도를 줄였다. 경쟁자도 무사히 도착해야 다음 경주가 있었다.','라이벌의 첫 명함'],
 ['races',1,'첫 결승선','첫 레이스에서 이긴 뒤 번개맨이 장갑을 내밀었다. “좋아, 인정! 다음에도 붙어 보자.” 기록판보다 기억에 남은 건 끝까지 함께 달린 상대의 웃음이었다.','첫 대결 기록표'],
 ['races',3,'세 번째 약속','세 번의 승부 뒤에는 출발 전 인사가 길어졌다. 어느 길에 공사가 있는지, 어디에서 쉬면 좋은지. 이기고 싶은 마음 곁에 상대가 다치지 않았으면 하는 마음도 자랐다.','공유한 지름길 메모'],
 ['races',5,'라이벌의 쉬는 날','다섯 번째 승리 뒤 번개맨은 잠깐 쉬겠다고 했다. 너는 다음 대결을 재촉하지 않았다. “준비되면 다시 만나.” 경쟁은 상대를 기다려 줄 때도 이어질 수 있었다.','재대결 약속표'],
 ['clears',1,'마지막 상자의 동행','첫 화성 배송 길에서 번개맨은 먼저 결승선을 찾지 않았다. “이번 상자는 같이 보내자.” 네가 마지막 배송을 마치자 그는 익숙한 인사를 건넸다. “다음 길에서도 보자, 배달왕.”','화성 동행 배지'],
 ['clears',2,'두 번째 출발선','두 번째 완주 뒤 번개맨이 새 기록표를 펼쳤다. 이번 표에는 승패 옆에 함께 지나온 지역도 적혀 있었다. “다시 시작해도, 우리가 달린 길까지 지워지는 건 아니잖아.”','두 번째 출발 깃발'],
 ['clears',3,'서로의 길잡이','세 번째 여정에서 번개맨은 네가 먼저 알려 준 길을 따라왔다. 다음 갈림길에서는 그가 안내했다. 같은 목적지로 가더라도 번갈아 앞장서면 처음 보는 풍경이 있었다.','두 갈래 길의 표지'],
 ['clears',5,'끝나지 않는 재대결','다섯 번째 완주를 기념하는 작은 트로피에 두 사람의 이름이 함께 새겨졌다. 번개맨이 말했다. “다음에는 내가 앞설 거야.” 너는 웃으며 다음 배달 목록을 펼쳤다.','라이벌 우정 트로피']
 ]}
];
const MEMORY_STAFF_BIOS={st_6:'처음 받는 문의에도 차분히 답하려고 작은 수첩을 들고 다닌다. 고객에게 들은 고마운 말도 그 수첩 한쪽에 적는다.',st_7:'상자 크기와 배송 순서를 살피는 일을 좋아한다. 마지막 상자가 빠지지 않았는지 한 번 더 확인하는 것이 습관이다.',st_3:'배달 기록을 보기 쉽게 정리하고 싶어 합류했다. 길에서 떠오른 작은 개선안을 쉬는 시간마다 메모한다.',st_4:'가게 이름이 멀리서도 읽히는 간판을 만들고 싶어 한다. 처음 완성한 배송표를 아직 파일 안에 간직하고 있다.',st_5:'회사가 처음 받은 칭찬을 누구보다 잘 기억한다. 새로운 손님에게 회사를 소개할 때 그 배달 이야기를 먼저 꺼낸다.',st_1:'매니저 지수는 급한 주문이 들어오면 먼저 팀의 상황을 살핀다. 혼자 빨리 끝내는 일보다 모두 무사히 마치는 일을 중요하게 여긴다.',st_2:'매니저 민호는 낯선 배송지를 지도로 정리한다. 새로 온 동료에게 길을 설명할 때는 자신이 처음 헤맸던 곳부터 알려 준다.',st_0:'사장님도 처음에는 상자 하나를 들고 출발했다. 큰 계약을 따낸 날보다 첫 동료가 출근한 날을 더 또렷하게 기억한다.'};
let memoryLastSync=0,memoryLastToast=0;
function memoryState(){
 if(!S.memories||S.memories.v!==1)S.memories={v:1,unlocked:[],read:[],staff:[],staffRead:[],featured:''};
 const m=S.memories;for(const k of ['unlocked','read','staff','staffRead'])if(!Array.isArray(m[k]))m[k]=[];
 if(typeof m.featured!=='string')m.featured='';return m;
}
function memoryMetric(k){
 if(k==='region')return S.clears>0?8:Math.max(S.region||0,...(S.dex?.r||[]).filter(Number.isFinite));
 return k==='taps'||k==='clears'?(S[k]||0):(S.st[k]||0);
}
function memoryEpisodes(){return MEMORY_ARCS.flatMap(a=>a.episodes.map((e,i)=>({id:a.id+'-'+i,arc:a,index:i,metric:e[0],target:e[1],title:e[2],text:e[3],item:e[4]})));}
function syncMemories(silent=false){
 const migration=!S.memories,m=memoryState();let added=0;
 for(const a of MEMORY_ARCS)for(let i=0;i<a.episodes.length;i++){
  const e=a.episodes[i],id=a.id+'-'+i;
  if(i&&!m.unlocked.includes(a.id+'-'+(i-1)))break;
  if(memoryMetric(e[0])<e[1])break;
  if(!m.unlocked.includes(id)){m.unlocked.push(id);added++;}
 }
 for(const id of S.dex?.s||[])if(MEMORY_STAFF_BIOS[id]&&!m.staff.includes(id)){m.staff.push(id);added++;}
 if(!m.featured&&m.unlocked.length)m.featured=m.unlocked[0];
 if(added||migration)save();
 if(added&&!migration&&!silent&&!tab&&!mOpen&&Date.now()-memoryLastToast>15000&&!document.hidden&&!$('splash')&&!$('gate')?.classList.contains('on')){
  toast(L('새 인연 기록이 도감에 도착했어요','New memories arrived in your collection'));memoryLastToast=Date.now();
 }
 return added;
}
function memoryUnread(){const m=memoryState();return m.unlocked.filter(id=>!m.read.includes(id)).length+m.staff.filter(id=>!m.staffRead.includes(id)).length;}
function memoryGoal(e){
 if(e.metric==='region')return R[e.target][0]+' 도착';
 if(e.metric==='clears')return `화성 배달 ${e.target}회 완주`;
 if(e.metric==='hire')return `직원 누적 ${e.target}명 고용`;
 if(e.metric==='races')return `레이스 ${e.target}번 승리`;
 return `배달 ${e.target}번`;
}
function memoryOpen(id){
 syncMemories(true);const m=memoryState(),e=memoryEpisodes().find(e=>e.id===id);if(!e||!m.unlocked.includes(id))return;
 if(!m.read.includes(id))m.read.push(id);save();
 showModal(IC.scroll,e.arc.name+' · '+e.title,`<p class="memory-copy">${e.text}</p><div class="tip">기념품: <b>${e.item}</b><br>이사해도 이야기와 기념품은 남아요.</div>`,[['기록장으로','y',closeModal]]);hud();
}
function memoriesHTML(){
 syncMemories(true);const m=memoryState(),all=memoryEpisodes(),featured=all.find(e=>e.id===m.featured&&m.unlocked.includes(e.id));
 let h=`<section class="memories"><div class="hero"><div class="hn">함께 달린 이야기</div><div class="hd">이야기 ${m.unlocked.length}/${all.length} · 직원 인연 ${m.staff.length}/8 · 새 기록 ${memoryUnread()}</div></div><p class="tip">평소처럼 배달하고 성장하면 이야기가 열려요. 읽기는 자유이며 이사·회차가 바뀌어도 남아요. 별도 비용이나 광고 조건은 없어요.</p>`;
 for(const a of MEMORY_ARCS){const episodes=all.filter(e=>e.arc===a),count=episodes.filter(e=>m.unlocked.includes(e.id)).length;
  h+=`<details class="memory-arc" open><summary>${a.name} · ${count}/${episodes.length}편</summary>${episodes.map(e=>{const unlocked=m.unlocked.includes(e.id),unread=unlocked&&!m.read.includes(e.id);return`<div class="memory-row"><div><b>${e.index+1}. ${unlocked?e.title:'다음 이야기'}</b><small>${unlocked?'기념품 · '+e.item:memoryGoal(e)+(e.index?' · 앞 이야기 해금 후':'')}</small></div><button class="gb ${unread?'y':unlocked?'own':''}" data-act="memory-read" data-id="${e.id}" ${unlocked?'':'disabled'}>${unlocked?(unread?'읽기':'다시 읽기'):'잠김'}</button></div>`;}).join('')}</details>`;
 }
 h+=`<details class="memory-arc"><summary>직원 인연 기록 · ${m.staff.length}/8</summary><p>직원 도감에 처음 등록되면 사연도 함께 남아요. 현재 고용 파워와 별개인 영구 기록이에요.</p>${DEXS.map(st=>{const own=m.staff.includes(st[0]),unread=own&&!m.staffRead.includes(st[0]);return`<div class="memory-row"><div><b>${own?st[1]:'아직 만나지 않은 직원'}</b><small>${own?st[2]+' · '+(unread?'새 인연':'기록 보관 중'):'직원 최초 획득 시 해금'}</small></div><button class="gb ${unread?'y':''}" data-act="memory-staff" data-id="${st[0]}" ${own?'':'disabled'}>${own?'소개 보기':'잠김'}</button></div>`;}).join('')}</details>`;
 h+=`<details class="memory-arc"><summary>회사 기념품 · ${m.unlocked.length}/${all.length}</summary><p>대표 기념품: <b>${featured?featured.item:'아직 없어요'}</b><br>이야기가 열리면 자동으로 모여요. 수익과 능력치에는 영향을 주지 않아요.</p><div class="memory-items">${all.filter(e=>m.unlocked.includes(e.id)).map(e=>`<button class="gb ${m.featured===e.id?'own':''}" data-act="memory-feature" data-id="${e.id}">${e.item}<small>${m.featured===e.id?'대표 전시 중':'대표로 전시'}</small></button>`).join('')||'<p>첫 이야기와 함께 기념품이 도착해요.</p>'}</div></details></section>`;return h;
}
const memoriesCol=colHTML;
colHTML=function(){return colTab==='memory'?memoriesHTML():(colTab==='dex'?`<button class="gb y wide" data-act="memory-open">인연·기념품 보기${memoryUnread()?' · 새 기록 '+memoryUnread():''}</button>`:'')+memoriesCol();};
const memoriesAct=onAct;
onAct=function(b){const a=b.dataset.act;
 if(a==='memory-open'){syncMemories(true);colTab='memory';if(tab==='col')render();else openSheet('col');return;}
 if(a==='memory-read'){memoryOpen(b.dataset.id);return;}
 if(a==='memory-staff'){
  const id=b.dataset.id,m=memoryState(),st=DEXS.find(x=>x[0]===id);if(!st||!m.staff.includes(id))return;
  if(!m.staffRead.includes(id))m.staffRead.push(id);save();showModal(`<img src="assets/${id}.png" alt="">`,st[1],`<p class="memory-copy">${MEMORY_STAFF_BIOS[id]}</p><div class="tip">직원 인연은 이사해도 보관돼요. 고용·파워 규칙은 기존과 같아요.</div>`,[['기록장으로','y',closeModal]]);hud();return;
 }
 if(a==='memory-feature'){const m=memoryState();if(!m.unlocked.includes(b.dataset.id))return;m.featured=b.dataset.id;save();const scroll=$('shBody').scrollTop;render();$('shBody').scrollTop=scroll;return;}
 const result=memoriesAct(b);syncMemories(true);return result;
};
const memoriesHud=hud;
hud=function(){if(Date.now()-memoryLastSync>1000){memoryLastSync=Date.now();const added=syncMemories();if(added&&tab==='col'&&colTab==='memory'){const top=$('shBody').scrollTop;render();$('shBody').scrollTop=top;}}memoriesHud();};
const memoriesRender=render;
render=function(){memoriesRender();if(tab==='comp'){
 const e=memoryEpisodes().find(e=>e.id===memoryState().featured&&memoryState().unlocked.includes(e.id));
 if(e)$('shBody').insertAdjacentHTML('beforeend',`<div class="tip memory-company">회사 기념품: <b>${e.item}</b><button class="gb" data-act="memory-open">인연 기록장</button></div>`);
}};
