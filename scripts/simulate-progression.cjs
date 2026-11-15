// Read-only economy study. Loads current game formulas into isolated disposable state.
// No Firebase, user saves, DOM, network, or changes to game files.
process.env.TZ='Asia/Seoul';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const slice=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b,src.indexOf(a)));
function fn(name){
 const start=src.indexOf('function '+name+'(');if(start<0)throw Error(name);
 const rest=src.slice(start),end=/\n(?=function |const |let |\/\/|\/\*)/.exec(rest);
 const code=end?rest.slice(0,end.index):rest;new vm.Script(code);return code;
}
const names=['fresh','fmt','won','founded','permMult','tempMult','vm','jobInc','baseIps','ips','bestJob','tapVal','jobCost','jobMax','hireCost','fameCost','fameGain','offMaxH','offRate','startMoney','earn','msMult','nextMs','xpNeed','qGen','qProg','qReward','trV','rollTrait','vipOn','dow','dJob','dStaff','skOn','xmOn','dexTot','dexCount','achRew'];
const constants=slice('const V=[','// ====== STATE ======')+slice('const QF=[','function staffTot')+slice('const TRAITS=[','function trV')+slice('const SKL=[','function skOn')+slice('const DEXC=[','function dexTot')+slice('const ACH=[','function achTier')+src.split('\n').find(x=>x.startsWith('const STP='));
const epoch=Date.parse('2026-11-15T09:00:00+09:00');
function simulate(config){
 let clock=epoch,seed=config.seed||1;const realDate=Date;
 const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 class ClockDate extends realDate{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}}
 const context=vm.createContext({Math:math,Date:ClockDate,clockSet:t=>{clock=t;},console});
 vm.runInContext(constants+'\n'+names.map(fn).join('\n')+`\nlet S=fresh(),LANG='ko'; const UN=['','만','억','조','경','해','자','양','구','간','정','재','극'], UN_EN=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc']; let ev={mult:1,until:0},trouble=null,combo=0,fever=0,feverUntil=0;
 function skDummy(){} function feverOn(){return Date.now()<feverUntil;}function tapMult(){return(feverOn()?5:1)*(1+Math.min(combo,50)*.02);}
 function staffTot(){return S.comps.reduce((a,c)=>a+c.n,0);}function bestUnlocked(){let b=0;J.forEach((j,i)=>{if(S.veh>=j[4])b=i});return b;}
 `,context);
 vm.runInContext(`
 function run(cfg){
 const START=${epoch},DAY=86400,rows=[],unlocks=[],claims={};let time=0,active=0,tapsAcc=0,autoAcc=0,lastTap=-100,usedWarp=0,usedFame=0,day=-1,session=-1,streak=0,spins=0,ads=0,firstVehicle=null;
 S.noAds=!!cfg.premium;S.qd=qGen(0);
 const stats={passive:0,taps:0,quest:0,missions:0,attendance:0,roulette:0,warp:0,gold:0,offline:0,levels:0,mystery:0,gifts:0,events:0};
 let worldDistance=0,nextGift=35,nextBoss=90,nextTrouble=55,nextRace=150,nextEvent=40;
 let week=-1,weeklyBase={},weeklyDone=new Set(),nextDecision=0;
 const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 function collect(k,id){if(!S.dex[k].includes(id))S.dex[k].push(id);}
 function gain(n,k){if(!Number.isFinite(n)||n<0)throw Error('invalid earnings '+k);earn(n);stats[k]+=n;}
 function xp(n){S.xp+=n;while(S.xp>=xpNeed(S.lv)){S.xp-=xpNeed(S.lv);S.lv++;gain(Math.max(200*S.lv,baseIps()*120),'levels');if(S.lv%5===1)S.fame+=2;}}
 function tap(auto){const now=(Date.now()-START)/1000;combo=(now-lastTap<.8)?combo+1:1;lastTap=now;S.st.maxCombo=Math.max(S.st.maxCombo||0,combo);if(!feverOn()){fever+=.04*(1+trV('fever')/100);if(fever>=1){fever=0;feverUntil=Date.now()+8000;S.fevers++;}}
  gain(tapVal(),'taps');S.taps++;if(!auto)claims.tap=(claims.tap||0)+1;xp(1);
 }
 function achievements(){
  // Original tutorial and procedural quests, claimed promptly once eligible.
  for(let i=0;i<1;i++){const [n,total]=qProg(S.qd);if(n<total)break;gain(qReward(),'quest');if(S.q%3===2)S.fame++;S.q++;S.qd=qGen(S.q);}
  for(const [k,,target] of MI){if(!claims['got_'+k]&&(claims[k]||0)>=target){claims['got_'+k]=true;gain(Math.max(1000,baseIps()*1800),'missions');}}
  if(MI.every(m=>claims['got_'+m[0]])&&!claims.all){claims.all=true;S.fame+=3;}
  if(cfg.achievements!==false){
   for(const a of ACH){let t=S.ach[a[0]]||0;while(t<a[4].length&&a[3]()>=a[4][t]){S.fame+=achRew(t);S.ach[a[0]]=++t;}}
   for(const k of ['v','c','s','r'])if(!S.dexr[k]&&S.dex[k].length>=dexTot(k)){S.dexr[k]=true;S.fame+=DEXREW[k];}
   const w=Math.floor((Math.floor(time/DAY)+6)/7);const counters={del:S.st.del,boss:S.st.boss,fix:S.st.fix||0,race:S.st.races||0,spin:spins,move:S.st.moves};
   if(w!==week){week=w;weeklyBase={...counters};weeklyDone=new Set();}
   for(const [k,target] of [['del',2000],['boss',10],['fix',10],['race',5],['spin',7],['move',2]])if(!weeklyDone.has(k)&&counters[k]-weeklyBase[k]>=target){weeklyDone.add(k);S.fame+=10;}
   if(weeklyDone.size===6){weeklyDone.add('all');S.fame+=30;S.boostUntil=Math.max(Date.now(),S.boostUntil)+43200000;}
  }
 }
 function spin(){
  let r=Math.random()*100,i=0;const weights=[30,14,20,10,10,5,7,4];for(;i<7;i++){if(r<weights[i])break;r-=weights[i];}
  const b=Math.max(300,baseIps());if([0,2,4,7].includes(i))gain(b*({0:600,2:1800,4:3600,7:10800}[i]),'roulette');
  if(i===1)S.fame+=2;if(i===5)S.fame+=5;if(i===3){fever=0;feverUntil=Date.now()+8000;S.fevers++;}if(i===6)S.boostUntil=Math.max(Date.now(),S.boostUntil)+3600000;spins++;S.st.spins=spins;
 }
 function fameUp(){
  // Explicit policy: prepare two offline levels for scheduled players, then alternate income/tap.
  // A seed-capital level is reserved before leaving each region if affordable.
  for(let i=0;i<80;i++){
   let k=cfg.sessions&&S.fu.off<2?'off':(S.fu.start<Math.min(4,S.region+1)?'start':(S.fu.inc<=S.fu.tap?'inc':'tap'));
   if(cfg.famePolicy==='income')k=S.fu.inc<=S.fu.tap?'inc':'tap';
   const c=fameCost(k);if(S.fame<c)break;S.fame-=c;S.fu[k]++;
  }
 }
 function move(){
  if(S.run<R[S.region][2])return false;const from=S.region,g=fameGain()*(cfg.ads?2:1);if(cfg.ads){S.st.ads++;if(!cfg.premium)ads++;}
  rows.push({region:from,name:R[from][0],elapsedSeconds:time,activeSeconds:active,lv:S.lv,vehicle:S.veh,jobs:[...S.jobs],ips:baseIps(),goal:R[from][2],fame:g});
  if(S.region===8)return 'clear';
  S.fame+=g;S.region++;S.st.moves++;collect('r',S.region);S.money=0;S.run=0;S.veh=0;S.jobs=[1,0,0,0,0,0,0,0];S.comps=C.map(()=>({own:false,n:0,pow:0,best:''}));S.traits=[];applyScale();fameUp();S.money=startMoney();return true;
 }
 function incomeRate(){return ips()+cfg.tps*tapVal();}
 function shop(){
  // Greedy payback policy considers affordable and near-future actions, including milestone bundles.
  // No in-app purchases and no injected money; each expense uses the game's exact cost formulas.
  const before=incomeRate(),options=[];
  const add=(cost,gain,kind,i,n)=>{if(gain>0&&Number.isFinite(cost))options.push({cost,score:cost/gain+Math.max(0,cost-S.money)/Math.max(before,1),kind,i,n});};
  J.forEach((j,i)=>{if(S.veh<j[4])return;const old=S.jobs[i],ms=MS.find(m=>m>old);for(const n of [...new Set([1,10,...(ms?[ms-old]:[])])]){const cost=jobCost(i,n);S.jobs[i]+=n;const inc=incomeRate()-before;S.jobs[i]=old;add(cost,inc,'job',i,n);}});
  if(S.veh<V.length-1){const old=S.veh,c=V[old+1][2];S.veh++;const diff=incomeRate()-before;S.veh=old;add(c,diff,'vehicle');}
  C.forEach((c,i)=>{const s=S.comps[i];if(!s.own){if(!S.jobs[c[3]])return;s.own=true;const diff=incomeRate()-before;s.own=false;add(c[2],diff,'company',i);}
   else{const cost=hireCost(i);s.pow+=1.96;const diff=incomeRate()-before;s.pow-=1.96;add(cost,diff,'hire',i);}});
  options.sort((a,b)=>a.score-b.score);const a=options[0];if(!a||a.cost>S.money)return false;S.money-=a.cost;
  if(a.kind==='job'){S.jobs[a.i]+=a.n;claims.job=(claims.job||0)+a.n;}
  if(a.kind==='vehicle'){S.veh++;collect('v',S.veh);claims.veh=(claims.veh||0)+1;if(firstVehicle===null)firstVehicle=time;unlocks.push({vehicle:S.veh,time,region:S.region});}
  if(a.kind==='company')S.comps[a.i].own=true;
  if(a.kind==='hire'){const s=S.comps[a.i];let r=Math.random()*100,g=GR[0];for(const x of GR){if(r<x[2]){g=x;break;}r-=x[2];}s.n++;s.pow+=g[1];S.st.hire++;if(g[0]==='SSR')S.st.ssr++;const t=rollTrait(g[0]);if(t)(S.traits??=[]).push(t);const pool=STP[g[0]];collect('s',pool[Math.floor(Math.random()*pool.length)]);claims.staff=(claims.staff||0)+1;}
  return true;
 }
 function startSession(which){session=which;const d=Math.floor(time/DAY);if(d!==day){day=d;Object.keys(claims).forEach(k=>delete claims[k]);usedWarp=0;usedFame=0;streak=streak%7+1;
   const n=streak,amt=Math.max(500*n,baseIps()*900*n);if(n===7){S.fame+=5;S.boostUntil=Math.max(Date.now(),S.boostUntil)+14400000;}else gain(amt,'attendance');
   if(cfg.roulette!==false)spin();
  }
  if(cfg.ads&&S.boostUntil<Date.now()+600000){S.boostUntil=Math.max(Date.now(),S.boostUntil)+14400000;S.st.ads++;if(!cfg.premium){ads++;claims.ad=(claims.ad||0)+1;}}
 }
 const STEP=cfg.step||1,maxTime=(cfg.days||90)*DAY;
 let lastEnd=0,sessionStarted=false,sessionStartTime=0;
 while(time<maxTime){
  clockSet(START+time*1000);
  let inSession=true,which=0,end=Infinity;
  if(cfg.sessions){const nowDay=Math.floor(time/DAY),tod=time%DAY;inSession=false;for(let i=0;i<cfg.sessions.length;i++){const [start,duration]=cfg.sessions[i];if(tod>=start&&tod<start+duration){inSession=true;which=nowDay*cfg.sessions.length+i;end=nowDay*DAY+start+duration;break;}}
   if(!inSession){let next=Infinity;for(const [start] of cfg.sessions){const t=nowDay*DAY+start;if(t>time)next=Math.min(next,t);}if(!isFinite(next))next=(nowDay+1)*DAY+cfg.sessions[0][0];
    time=next;clockSet(START+time*1000);const gap=time-lastEnd;
    if(gap>=60){const off=baseIps()*Math.min(gap,offMaxH()*3600)*offRate()*(Date.now()<S.boostUntil?2:1);gain(off*(cfg.ads?2:1),'offline');if(cfg.ads){S.st.ads++;if(!cfg.premium)ads++;}}
    continue;
   }
  }
  if(which!==session||!sessionStarted){sessionStartTime=time;startSession(which);sessionStarted=true;lastTap=-100;combo=0;}
  achievements();let m=move();if(m==='clear')return finish(true);if(m)continue;
  fameUp();
  if(time>=nextDecision){shop();achievements();nextDecision=time+(cfg.actionInterval||2);}
  // Activate unlocked skills when ready; keep original durations and cooldowns.
  if(cfg.skills!==false)for(const sk of SKL){const old=S.sk[sk.k]||{r:0};if(S.lv>=sk.lv&&Date.now()>=old.r){S.sk[sk.k]={u:Date.now()+sk.dur*1000,r:Date.now()+sk.cd*1000};if(sk.k==='gold'){gain(Math.max(500,ips()*180)*(cfg.ads?2:1),'gold');if(cfg.ads){S.st.ads++;if(!cfg.premium)ads++;}}}}
  // Reward ads are modeled as optional, daily-capped actions; legacy premium uncapped mode is separate.
  const since=time-sessionStartTime;
  if(cfg.ads&&usedFame<2&&since>=30+usedFame*60){S.fame+=2+Math.floor((S.region+1)*(S.clears+1)*.8);usedFame++;claims.ad=(claims.ad||0)+1;S.st.ads++;if(!cfg.premium)ads++;}
  if(cfg.ads&&((cfg.uncappedWarp&&time%10<STEP)||(usedWarp<3&&since>=60+usedWarp*120))){gain(Math.max(500,baseIps()*7200),'warp');usedWarp++;claims.ad=(claims.ad||0)+1;S.st.ads++;if(!cfg.premium)ads++;}
  const dt=Math.min(STEP,end-time);gain(ips()*dt,'passive');
  if(cfg.world){
   // K cancels between world speed and the 400*K customer interval. Average tapBoost
   // duty is rate*.3 (capped at 1); geometry-only rendering and its RNG are not run.
   const duty=skOn('auto')?1:Math.min(1,cfg.tps*.3);
   const speed=(70+Math.sqrt(vm())*24)*(1+1.4*duty)*(tempMult()>1?1.3:1)*(feverOn()?1.7:1)*(skOn('turbo')?1.5:1);
   const old=Math.floor(worldDistance/400);worldDistance+=speed*dt;const now=Math.floor(worldDistance/400);
   for(let k=old+1;k<=now;k++){
    xp(3);S.st.del++;const sp=S.region===8;const type=sp?((k%3)+3)%3:((k*5+Math.floor(k/6))%6+6)%6;collect('c',(sp?'al':'cu')+type);
    if(k%9===4&&hash(k*31+7)<.45){const r=hash(k*13+5);if(r<.4)gain(Math.max(500,ips()*240),'mystery');else if(r<.62)S.fame++;else if(r<.82)fever=Math.min(1,fever+.5);else{const a=SKL.filter(s=>S.lv>=s.lv);if(a.length){for(const sk of a){const st=S.sk[sk.k];if(st&&Date.now()>=st.u)st.r=0;}}else gain(Math.max(500,ips()*240),'mystery');}}
   }
   if(active>=nextGift){nextGift=active+45+Math.random()*45;if(Math.random()<(cfg.giftCatch??.7)){gain(Math.max(300,ips()*180),'gifts');xp(10);S.st.gift++;if(Math.random()<.25)S.fame++;}}
   if(active>=nextBoss){nextBoss=active+120+Math.random()*90;const need=50+Math.min(S.region,8)*5,duration=15+trV('boss');if((cfg.burstTps||6)*duration>=need&&Math.random()<.85){gain(Math.max(2000,ips()*300),'events');S.fame++;S.st.boss++;}else S.money-=Math.floor(Math.min(S.money*.1,Math.max(300,ips()*120)));}
   if(active>=nextTrouble){nextTrouble=active+70+Math.random()*50;const flat=Math.random()<.55,need=Math.ceil((28+Math.min(S.region,8)*3)*(1-trV('fix')/100));if(!flat||((cfg.burstTps||6)*8>=need&&Math.random()<.9)){gain(Math.max(800,ips()*120),'events');xp(8);S.st.fix=(S.st.fix||0)+1;}else S.money-=Math.floor(Math.min(S.money*.05,Math.max(200,ips()*60)));}
   if(active>=nextRace){nextRace=active+180+Math.random()*120;if(Math.random()<.65){gain(Math.max(1500,ips()*480),'events');S.fame+=2;S.st.races=(S.st.races||0)+1;}}
   if(active>=nextEvent){nextEvent=active+40+Math.random()*35;const r=Math.random()*100;if(r>=51&&r<69){gain(Math.max(200,ips()*120+tapVal()*20)*(1+trV('lucky')/100),'events');}else{const d=r<27||r>=88?[2,30]:r<46?[3,20]:r<51?[5,15]:r<81?[2.5,25]:[4,25];ev={mult:d[0],until:Date.now()+d[1]*1000};}}
  }
  const manual=cfg.tps*dt;tapsAcc+=manual;const count=Math.floor(tapsAcc);tapsAcc-=count;
  // Spread taps within the step so combo timers use physical tap spacing.
  for(let i=0;i<count;i++){clockSet(START+(time+(i+1)*dt/Math.max(count,1))*1000);const held=time;time+=(i+1)*dt/Math.max(count,1);tap(false);time=held;}
  if(skOn('auto')){autoAcc+=dt;while(autoAcc>=.13){autoAcc-=.13;tap(true);}}else autoAcc=0;
  if(time-lastTap>1.5&&!feverOn())fever=Math.max(0,fever-dt*.03);
  time+=dt;active+=dt;lastEnd=time;PaceCheck();
 }
 return finish(false);
 function PaceCheck(){if(!Number.isFinite(S.money)||!Number.isFinite(S.run))throw Error('overflow');}
 function finish(clear){return {config:cfg,clear,elapsedDays:time/DAY,activeHours:active/3600,timeSeconds:time,firstVehicleSeconds:firstVehicle,rows,lv:S.lv,region:S.region,ips:baseIps(),money:S.money,run:S.run,goal:R[S.region][2],quests:S.q,ads,stats,unlocks,fu:S.fu};}
 }
 globalThis.execute=run;
 // Sanity-check source formula loading against a clean game and the supplied screenshot.
 if(baseIps()!==1||Math.abs(tapVal()-7.03)>1e-9)throw Error('fresh-state formula mismatch');
 S.lv=7;S.veh=6;S.noAds=true;S.jobs=[63,56,46,41,36,0,0,0];S.boostUntil=Date.now()+10000;
 const screenshotCheck={newspaper:jobInc(0)*vm()*permMult(),milk:jobInc(1)*vm()*permMult(),ips:ips()};
 if(Math.floor(screenshotCheck.ips/1e4)!==1042)throw Error('screenshot coefficient mismatch '+JSON.stringify(screenshotCheck));
 globalThis.screenshotCheck=screenshotCheck;S=fresh();
 `,context);
 const result=context.execute(config);result.screenshotCheck=context.screenshotCheck;return JSON.parse(JSON.stringify(result));
}
if(require.main===module){
 const profiles=[
  {name:'continuous-free',tps:2,ads:false,days:30},
  {name:'once-free-30min',tps:1,ads:false,sessions:[[0,1800]],days:90},
  {name:'casual-free-30min',tps:1,ads:false,sessions:[[0,900],[43200,900]],days:90},
  {name:'active-free-60min',tps:2,ads:false,sessions:[[0,900],[14400,900],[28800,900],[43200,900]],days:90},
  {name:'active-ads-60min',tps:2,ads:true,sessions:[[0,900],[14400,900],[28800,900],[43200,900]],days:90},
  {name:'legacy-premium-warp',tps:2,ads:true,premium:true,uncappedWarp:true,days:3}
 ];
 const results=[];for(const p of profiles){for(const seed of [1,300,1200,1700,314159]){const r=simulate({...p,seed,step:1,world:true});results.push(r);console.log(JSON.stringify({name:p.name,seed,clear:r.clear,days:r.elapsedDays,activeHours:r.activeHours,region:r.region,rows:r.rows.map(x=>({name:x.name,seconds:x.elapsedSeconds,activeHours:x.activeSeconds/3600})),ads:r.ads}));const dir=path.join(__dirname,'../out/progression');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'results-human-policy.json'),JSON.stringify(results,null,2));}}
}
module.exports={simulate};
