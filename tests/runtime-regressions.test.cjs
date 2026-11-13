const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const stateCode=fs.readFileSync('assets/game-state.js','utf8');
function boot(file,raw={}){
 let now=Date.parse('2026-11-13T10:00:00Z');const nodes=new Map(),listeners={};
 const node=id=>{if(!nodes.has(id))nodes.set(id,{id,dataset:{},hidden:true,style:{},scrollTop:0,innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){}},querySelectorAll:()=>[],querySelector:()=>null});return nodes.get(id)};
 const ctx={console,Date:class extends Date{constructor(...a){super(...(a.length?a:[now]))}static now(){return now}},setTimeout:()=>1,clearTimeout(){},setInterval(){},localStorage:{getItem:()=>JSON.stringify({m:10000,t:now,pro:1,snd:0,d:{day:'2026-11-13',last:'2026-11-13',str:1},...raw}),setItem:(k,v)=>{ctx.persisted=JSON.parse(v)}},navigator:{},document:{hidden:false,activeElement:{id:''},getElementById:id=>id==='quick-buy'?null:node(id),querySelectorAll:()=>[],addEventListener:(k,fn)=>listeners[k]=fn},BWWorld2D:{create:()=>({bump(){},coin(){}})},BWGameUI:{create:()=>({update(){},art(){return ''},vehicleArt(){return ''},progress(){return 0},feedback(){}})},addEventListener:(k,fn)=>listeners[k]=fn};ctx.window=ctx;
 vm.createContext(ctx);vm.runInContext(stateCode,ctx);const source=fs.readFileSync(file,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];vm.runInContext(source,ctx);return {ctx,listeners,node,run:s=>vm.runInContext(s,ctx),advance:ms=>{now+=ms}};
}
for(const file of ['quarterview-full.html','quarterview-remaster.html']){
 let startup=boot(file,{t:Date.parse('2026-11-12T10:00:00Z')});assert.equal(startup.ctx.persisted.t,Date.parse('2026-11-13T10:00:00Z'),'settlement is saved immediately to prevent reload duplication');
 let b=boot(file);b.run(`buy({id:'quick-buy',dataset:{job:'0',cost:'50'}})`);assert.equal(b.run('S.j[0]'),1);assert.equal(b.run('S.m'),9950);
 // An outdated rendered price must never undercharge the next purchase.
 b.run(`buy({id:'quick-buy',dataset:{job:'0',cost:'50'}})`);assert.equal(b.run('S.j[0]'),2);assert.equal(b.run('S.m'),9890);
 b.run(`S.m=0;buy({id:'quick-buy',dataset:{job:'0',cost:'1'}})`);assert.equal(b.run('S.j[0]'),2);
 b.run(`S.m=1e6;tab='veh';buy({id:'',dataset:{next:'1',cost:'30000'}});buy({id:'',dataset:{next:'1',cost:'30000'}})`);assert.equal(b.run('S.v'),1,'detached old vehicle button cannot buy the next step');
 b=boot(file);b.run('S.mg=1;S.auto=1;autoInvest()');assert.equal(b.run('S.d.buy'),1,'auto investment counts toward daily purchases');
 b=boot(file);const before=b.run('S.m');b.ctx.document.hidden=true;b.listeners.visibilitychange();b.advance(26*3600e3);b.ctx.__simTick();assert.equal(b.run('S.m'),before,'hidden tick grants no uncapped active earnings');b.ctx.document.hidden=false;b.listeners.visibilitychange();assert.equal(b.run('S.offlineReport.time'),86400);assert.equal(b.run('S.offlineReport.earn'),86400*.65);const after=b.run('S.m');b.listeners.visibilitychange();assert.equal(b.run('S.m'),after,'visibility events cannot settle twice');
 b=boot(file);b.advance(26*3600e3);b.ctx.__simTick();assert.equal(b.run('S.offlineReport.time'),86400,'sleep without visibility event also observes the cap');
 b=boot(file);b.run('S.d.buy=19');b.advance(24*3600e3);b.ctx.__simTick();assert.equal(b.run('S.d.buy'),0,'midnight resets daily progress without reload');assert.equal(b.run('S.d.str'),2);
 const bad=b.run(`normalizeState({m:20,j:[-1,null,2],st:-40,items:[0,0,999],equip:{head:2,bag:0},g:999,week:null,claims:[],boosts:null,d:{cl:null},ac:[0,0,-1,999]})`);assert.equal(bad.st,0);assert.deepEqual(Array.from(bad.items),[0]);assert.equal(Object.keys(bad.equip).length,0);assert.deepEqual(Array.from(bad.ac),[0]);assert.ok(bad.g<=25);assert.equal(bad.j[0],0);assert.equal(bad.j[2],2);assert.equal(bad.d.cl.length,4);assert.ok(bad.week);
 b.run("S.bestRegion=14;S.r=1;S.run=1e7;S.boosts={};");const handler=b.listeners.click;handler({target:{closest:()=>({id:'reb',dataset:{}})}});assert.equal(b.run('S.r'),0);assert.equal(b.run('S.bestRegion'),14,'highest unlocked region survives rebirth');
 console.log(file+': stale prices, duplicate step, auto mission, offline cap, double settlement, midnight, backup validation and best region passed');
}
