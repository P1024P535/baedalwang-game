// Behavioral regression tests in isolated state; no browser, accounts or network.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'android/app/src/main/assets/index.html'),'utf8');
for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
const fixture=`
let clock=10000000;Date.now=()=>clock;
let S={last:clock-7200000,boostUntil:clock-3600000,veh:12,mis:{date:'today',p:{},done:[],all:false},st:{ads:0},noAds:false,chapter:null,clears:0,region:0,run:0};
let mOpen=false,tab=null,boss=null,trouble=null,race=null,nextEv=0,nextBoss=0,nextTrb=0,nextRace=0,jackUntil=0;
const nodes={};const $=id=>nodes[id]||null;const document={hidden:false,addEventListener(){}};
const MI=[['tap','tap',300],['job','job',20],['veh','ride',1],['staff','staff',3],['ad','ad',2]],V=Array(13),R=Array.from({length:9},()=>['region',0,1000000]);
let stored=null,callbacks=[],award=0;const PLATFORM={showRewardedAd(cb){callbacks.push(cb)}};
function today(){return 'today';}function checkDay(){if(S.mis.date!==today())S.mis={date:today(),p:{},done:[],all:false};}
function mis(k,n=1){checkDay();if(!S.mis.done.includes(k))S.mis.p[k]=(S.mis.p[k]||0)+n;}
function adDay(){if(!S.adc||S.adc.d!==today())S.adc={d:today()};return S.adc;}
function adLeft(k,cap){return Math.max(0,cap-(adDay()[k]||0));}function adUse(k){adDay()[k]=(adDay()[k]||0)+1;}
function baseIps(){return 100;}function offMaxH(){return 4;}function offRate(){return .5;}
function hud(){}function render(){}function scene(){}function onAct(){}function toast(){}function logEv(){}function save(){stored=JSON.stringify(S);}function sfx(){}function earn(n){award+=n;S.run+=n;}function won(n){return String(n);}function L(a){return a;}
`;
const capFunctions=['adDay','adLeft','adUse'].map(n=>html.split('\n').find(l=>l.startsWith('function '+n+'('))).join('\n');
const ctx=vm.createContext({console});vm.runInContext(fixture+capFunctions+'\n'+fs.readFileSync(path.join(root,'improvements/gameplay.js'),'utf8')+'\nhud=function(){};render=function(){};',ctx);
const run=s=>vm.runInContext(s,ctx),eq=(s,want)=>assert.equal(run(s),want,s);
// Partially expired boost: one hour doubled + one normal at 50% efficiency.
eq('offlineEarnings()',540000);
eq('S.boostUntil=S.last-1;offlineEarnings()',360000);
eq('S.boostUntil=clock+1;offlineEarnings()',720000);
eq('S.last=clock+1000;offlineEarnings()',0);
eq('S.last=clock-36000000;S.boostUntil=S.last+3600000;offlineEarnings()',900000);
// Failed/cancelled ads do not charge. Duplicate/reentrant callbacks never pay twice.
run("limitedAd('w',3,()=>award++);limitedAd('w',3,()=>award++);");eq('callbacks.length',1);run('callbacks[0](false)');eq("adLeft('w',3)",3);eq('award',0);
run("limitedAd('w',3,()=>award++);callbacks[1](true);callbacks[1](true)");eq('award',1);eq("adLeft('w',3)",2);
run("S.noAds=true;for(let i=0;i<100;i++)limitedAd('w',3,()=>award++);");eq('award',3);eq("adLeft('w',3)",0);eq('S.st.ads',3);
run('S.adc.d="yesterday"');eq("adLeft('w',3)",3);
// Last ride turns the impossible purchase mission into upgrades, persisting mode.
eq("dailyMissions().find(m=>m[0]==='veh')[2]",20);run("mis('job',7)");eq('S.mis.p.veh',7);run('S.veh=0');eq("dailyMissions().find(m=>m[0]==='veh')[2]",20);
run("S.mis={date:'today',p:{veh:1},done:[],all:false};S.veh=12");eq("dailyMissions().find(m=>m[0]==='veh')[2]",1);
// Menu, hidden page and ad wait freeze deadlines; normal active time does not.
run('S.noAds=false;boss={until:clock+15000};syncChallenges();clock+=1000;syncChallenges()');eq('boss.until-clock',14000);
run("tab='jobs';syncChallenges();clock+=60000;syncChallenges()");eq('boss.until-clock',14000);
run('tab=null;syncChallenges();clock+=1000;syncChallenges()');eq('boss.until-clock',13000);
run('document.hidden=true;syncChallenges();clock+=300000;document.hidden=false;syncChallenges()');eq('boss.until-clock',13000);
// Milestones survive serialization, reject early/duplicate/invalid claims, reset per region.
run("S.run=249999;S.region=0;S.chapter=null;award=0;onAct({dataset:{act:'chapter',p:'25'}})");eq('award',0);
run("S.run=250000;onAct({dataset:{act:'chapter',p:'25'}});onAct({dataset:{act:'chapter',p:'25'}});onAct({dataset:{act:'chapter',p:'99'}})");eq('award',2000);
eq('JSON.parse(stored).chapter.claimed.length',1);run('S=JSON.parse(stored)');eq('chapterState().claimed.length',1);run('S.region=1');eq('chapterState().claimed.length',0);
console.log('PASS: full generated JS syntax; 30 reward/expiry/mission/clock/milestone regressions');
