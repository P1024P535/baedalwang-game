import {readFileSync} from 'node:fs';
import vm from 'node:vm';import assert from 'node:assert/strict';
const original=readFileSync('index.html','utf8');
const bridge=readFileSync('android/app/src/main/res/raw/account_bridge.js','utf8').replace('__PAGE_TOKEN__','rank-page');
const load=original.match(/async function rkLoad\(\)\{[\s\S]*?(?=\n\/\*)/)[0];
function game(){
 const calls=[];const score={wk:'2026-11-09',wp:25,w2026_11_09:25,nick:'rider',total:100,prog:0,lv:1,region:0,clears:0,maxIps:5,dex:1,boss:0};
 const e={PLATFORM:{},S:{acct:{type:'google',id:'user-a'}},RK:{ready:false,list:null,sort:'week'},rkSubmit:async()=>{},rkInit:async()=>false,rkData:()=>score,twField:k=>'w'+k.replaceAll('-','_'),twState:()=>({k:'2026-11-09'}),tab:'',colTab:'',toast(){},setTimeout:()=>1,clearTimeout(){},afterGoogle(){e.PLATFORM.cloudLoad(()=>{})},SsokAccounts:{request(...a){calls.push(a)}}};e.window=e;vm.createContext(e);vm.runInContext(load,e);vm.runInContext(bridge,e);
 function reply(op,ok,data){const c=calls.filter(x=>x[2]===op).at(-1);assert.ok(c,op);e.__ssokAccountResult('rank-page',c[1],ok,data,'');}
 async function tick(){await new Promise(r=>setImmediate(r))}
 return {e,calls,reply,tick,async login(){reply('current',true,{id:'user-a'});reply('load',true,null);await tick();}};
}
let g=game();assert.equal(g.e.RK.ready,false);assert.equal(g.calls.filter(c=>c[2].startsWith('rank')).length,0);
await g.login();assert.equal(g.e.RK.uid,'user-a');assert.equal(g.e.RK.ready,true);
let loading=g.e.rkLoad();await g.tick();let q=JSON.parse(g.calls.at(-1)[3]);assert.equal(q.field,'w2026_11_09');assert.equal(q.mode,'top');g.reply('rankQuery',true,{size:1,docs:[{id:'user-a',data:{nick:'rider',w2026_11_09:25}}]});await loading;assert.equal(g.e.RK.list[0].wp,25);
g=game();await g.login();loading=g.e.rkLoad();await g.tick();g.reply('rankQuery',true,{size:0,docs:[]});await g.tick();q=JSON.parse(g.calls.at(-1)[3]);assert.equal(q.mode,'count');assert.equal(q.value,25);g.reply('rankQuery',true,{size:1000,docs:[]});await loading;assert.equal(g.e.RK.my.rank,1001);
g=game();await g.login();loading=g.e.rkLoad();await g.tick();g.e.PLATFORM.signOut(()=>{});g.reply('signOut',true,null);g.reply('rankQuery',true,{size:1,docs:[{id:'other',data:{nick:'late'}}]});await loading;assert.equal(g.e.RK.ready,false);assert.equal(g.e.RK.list,null,'late score response cannot refill a logged-out view');
g=game();await g.login();loading=g.e.rkLoad();await g.tick();g.reply('rankQuery',false,null);await loading;assert.equal(g.e.RK.err,'err');
let granted=0;g.e.PLATFORM.purchase('premium',ok=>{if(ok)granted++});assert.equal(granted,0,'unconfigured purchase must never grant a paid item');
console.log('PASS: original leaderboard load, weekly score mapping, capped own rank, logout isolation, server failure and unavailable purchases');
