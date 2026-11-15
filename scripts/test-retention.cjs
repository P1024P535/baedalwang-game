const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('android/app/src/main/assets/index.html','utf8');
function fn(n){const start=html.indexOf('function '+n+'('),rest=html.slice(start);assert.ok(start>=0,n);const next=/\n(?=function |const |let |\/\/)/.exec(rest);return next?rest.slice(0,next.index):rest;}
const data=html.slice(html.indexOf('const V=['),html.indexOf('// ====== STATE ======'));
const fixture=`
let date='today',week='week1',saved='';
let S={money:1000,run:0,total:0,fame:0,region:0,clears:0,taps:0,mis:{date:'today',p:{},done:[],all:false},st:{moves:0,del:0,boss:0,fix:0,races:0,spins:0,hire:0,upgrades:0}};
let tab=null,colTab='st',boss=null,trouble=null;
function today(){return date;}function weekKey(){return week;}
function dailyMissions(){checkDay();return MI;}
function onAct(){}function render(){}function hud(){}function colHTML(){return'';}function scene(){}
function save(){saved=JSON.stringify(S);}function toast(){}function sfx(){}function logEv(){}function bannerShow(){}
function L(a){return a;}function $(id){return{classList:{remove(){}}};}
`;
const weekData=html.split('\n').find(x=>x.startsWith('const WK='));
const ctx=vm.createContext({console});vm.runInContext(data+'\n'+fixture+'\n'+['checkDay','mis','wkState','wkProg','bossEnd','troubleEnd'].map(fn).join('\n')+'\n'+weekData+'\nconst originalMis=mis;\n'+fs.readFileSync('improvements/retention.js','utf8')+'\nrender=function(){};hud=function(){};',ctx);
const run=s=>vm.runInContext(s,ctx),eq=(s,v)=>assert.equal(run(s),v,s);
eq('cycleScale(0)',1);eq('cycleScale(1)',2);eq('cycleScale(5)',32);eq('cycleScale(10)',64);
assert.ok(Math.abs(run('cycleScale(6)')-38.4)<1e-8);
eq('Array.from({length:100},(_,i)=>cycleScale(i+1)>=cycleScale(i)&&cycleScale(i+1)/cycleScale(i)<=2).every(Boolean)',true);
run('S.clears=0;applyScale();globalThis.firstGoal=R[8][2];S.clears=10;applyScale()');eq('R[8][2]/firstGoal',64);
run('boss={};bossEnd(false);trouble={t:"flat"};troubleEnd(false)');eq('S.money',1000);
run("mis('tap',50)");eq("missionProgress('ad')",1);run("mis('ad')");eq("missionProgress('ad')",2);
run("S.mis.done.push('ad');date='tomorrow';checkDay();mis('tap',100)");eq("missionProgress('ad')",2);eq('S.mis.done.length',0);
run('S.clears=0;S.region=0;S.run=0;S.st.moves=0;applyScale();wkState();S.run=R[0][2]*.2');eq("wkProg(WK.find(x=>x[0]==='move'))",2);
run('S.run=R[0][2];globalThis.before=journeyUnits();S.st.moves++;S.region=1;S.run=0;applyScale()');eq('journeyUnits()',run('before'));
run("S.wk.done.push('move');delete S.wk.b.journey;wkState()");eq("S.wk.done.includes('move')",true);
eq('careerTasks().length',0);run('S.clears=2;careerState()');eq('careerTasks().length',3);
run("careerAction('career-award',{dataset:{id:'trusted'}})");eq('S.fame',5);run("careerAction('career-award',{dataset:{id:'trusted'}})");eq('S.fame',5);eq('S.career.badge','trusted');
run("careerAction('career-award',{dataset:{id:'pioneer'}})");eq('S.fame',5);
run("careerAction('career-contract',{dataset:{id:'hire'}})");eq('S.fame',5);
run("S.st.hire+=careerTasks().find(t=>t.key==='hire').target;careerAction('career-contract',{dataset:{id:'hire'}});careerAction('career-contract',{dataset:{id:'hire'}})");eq('S.fame',7);
run("S=JSON.parse(saved);careerAction('career-contract',{dataset:{id:'hire'}});S.region=3;careerState()");eq('S.fame',7);eq("S.career.run.done.includes('hire')",true);
run('S.clears=3;careerState()');eq('S.career.run.done.length',0);eq("S.career.claimed.includes('trusted')",true);eq('S.career.badge','trusted');
run("week='week2';wkState()");eq('S.wk.done.length',0);
console.log('PASS: bounded goals, no idle fines, ad-free daily alternative, weekly progress, migration, contracts, badge ownership and exact-once rewards');
