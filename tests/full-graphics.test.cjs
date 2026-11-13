const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),cp=require('child_process'),crypto=require('crypto');
const html=fs.readFileSync('quarterview-full.html','utf8');
const baseline=cp.execFileSync('git',['show','908da109a646edc0cee282fbdb280cd1e928c4ce:quarterview-full.html'],{encoding:'utf8'});
const inline=h=>h.match(/<script>([\s\S]*?)<\/script>/)[1];
const a=inline(baseline),b=inline(html),marker='/* ---------- UI ---------- */';
assert.equal(a.slice(0,a.indexOf('let G=null;')),b.slice(0,b.indexOf('let G=null;')),'all economic and save definitions identical');
assert.equal(a.slice(a.indexOf(marker)),b.slice(b.indexOf(marker)),'UI, purchases, rewards and timers identical');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('index.html')).digest('hex'),'dce61c729516dfe1dec4d0f519333b6b9c49d401b8fda37f7c2c2f8c40303f04','3D unchanged');
function core(source,seed={}){
 const data=new Map(Object.entries(seed)),writes=[];
 const c=vm.createContext({Date,Math,JSON,console,setTimeout:()=>0,navigator:{},window:{},document:{getElementById:()=>({classList:{add(){},remove(){}},style:{}})},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>{data.set(k,v);writes.push(k)}}});
 vm.runInContext(source.slice(0,source.indexOf('let G=null;')),c);return {run:s=>vm.runInContext(s,c),data,writes};
}
const old=core(a);let seed=JSON.parse(old.run('JSON.stringify(fresh())'));Object.assign(seed,{m:8e14,v:10,r:39,ruby:300,staff:12,st:20,mg:1,auto:1,reserve:10000,items:[0,2],equip:{}});seed.j[0]=40;
const payload=JSON.stringify(seed),legacy='{"sentinel":"3D preserved"}',saved={'baedalwang-2d-full-isolated-v1':payload,'baedalwang-3d-simulation-only':legacy};
const oldSaved=core(a,saved),newSaved=core(b,saved);
assert.equal(newSaved.run('JSON.stringify(S)'),oldSaved.run('JSON.stringify(S)'));
for(let r=0;r<40;r++)for(let v=0;v<11;v++){
 oldSaved.run(`S.r=${r};S.v=${v}`);newSaved.run(`S.r=${r};S.v=${v}`);
 for(const expr of ['ps()','tapGain()','mult()','cost(0,10)','staffCost()'])assert.equal(newSaved.run(expr),oldSaved.run(expr),`${r}/${v}/${expr}`);
}
newSaved.run('S.m+=123;save()');assert.deepEqual(newSaved.writes,['baedalwang-2d-full-isolated-v1']);assert.equal(newSaved.data.get('baedalwang-3d-simulation-only'),legacy);
assert.equal(core(b,Object.fromEntries(newSaved.data)).run('S.m'),seed.m+123);
const m=JSON.parse(fs.readFileSync('assets/world-2d/manifest.json'));
assert.equal(Object.keys(m.assets).length,135);
for(let v=0;v<11;v++)for(const d of ['front','right','back','left'])assert(m.assets[`vehicle/${v}/${d}`]);
for(const [key,value]of Object.entries(m.assets)){
 const buf=fs.readFileSync(m.groups[value.sheet].src),w=buf.readUIntLE(24,3)+1,h=buf.readUIntLE(27,3)+1,[x,y,rw,rh]=value.rect;
 assert(x>=0&&y>=0&&rw>0&&rh>0&&x+rw<=w&&y+rh<=h,key);
}
const context=vm.createContext({window:{}});vm.runInContext(fs.readFileSync('assets/world-2d.js','utf8'),context);const engine=context.window.BWWorld2D;
const states=Array.from({length:40},(_,i)=>engine.regionVisual(i));assert.equal(new Set(states.map(x=>JSON.stringify(x))).size,40);
assert.equal(states[0].space,false);assert.equal(states[27].space,true);assert.equal(states[39].landmark,20);
assert.deepEqual(['right','left','front','back'],[[0,0],[0,0],[0,0],[0,0]].map((a,i)=>engine.facing(a,[[1,0],[-1,0],[0,1],[0,-1]][i])));
new vm.Script(b);new vm.Script(fs.readFileSync('assets/world-2d.js','utf8'));
console.log('PASS: 440 region/vehicle economic parity scenarios; exact gameplay/save/UI preservation; 3D hash; save/resume and 3D isolation; 135 atlas bounds; 44 directional mappings; 40 visual stages; JS syntax.');
