const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const original=fs.readFileSync('quarterview-full.html','utf8'),remaster=fs.readFileSync('quarterview-remaster.html','utf8');
const script=html=>html.match(/<script>([\s\S]*?)<\/script>/)[1];
const a=script(original),b=script(remaster);
// Preserve all UI handlers, reward rules, timers and import/export behavior exactly.
assert.equal(b.slice(b.indexOf('/* ---------- UI ---------- */')),a.slice(a.indexOf('/* ---------- UI ---------- */')));
function core(source,seed){
 const writes=[],store=new Map(Object.entries(seed));
 const context=vm.createContext({console,Date,Math,JSON,setTimeout:()=>0,navigator:{},window:{},document:{getElementById:()=>({classList:{add(){},remove(){}},style:{}})},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>{writes.push(k);store.set(k,v)}}});
 vm.runInContext(source.slice(0,source.indexOf('let G=null;')),context);
 return {context,store,writes,run:code=>vm.runInContext(code,context)};
}
const initial=core(a,{}).run('JSON.stringify(fresh())');
const seed=JSON.parse(initial);Object.assign(seed,{m:1e12,v:3,r:7,staff:4,dispatch:1,pro:1,ruby:150,items:[0],equip:{},st:5,ac:[0,2],mg:1,auto:1,reserve:100});seed.j[0]=30;seed.j[5]=4;
const saved=JSON.stringify(seed),legacy3d='{"m":123456,"sentinel":"keep"}';
const old=core(a,{'baedalwang-2d-full-isolated-v1':saved});
const next=core(b,{'baedalwang-2d-full-isolated-v1':saved,'baedalwang-3d-simulation-only':legacy3d});
assert.equal(next.run('JSON.stringify(S)'),old.run('JSON.stringify(S)'));
for(const expression of ['ps()','mult()','tapGain()','staffCost()','cost(0,10)','roi(5)','J.length','V.length','R.length','AC.length'])assert.equal(next.run(expression),old.run(expression),expression);
next.run('S.m+=99;save()');
assert.deepEqual(next.writes,['baedalwang-2d-rider-remaster-v1']);
assert.equal(next.store.get('baedalwang-2d-full-isolated-v1'),saved);
assert.equal(next.store.get('baedalwang-3d-simulation-only'),legacy3d);
const resumed=core(b,Object.fromEntries(next.store));assert.equal(resumed.run('S.m'),seed.m+99);
assert.equal(core(b,{'baedalwang-3d-simulation-only':legacy3d}).run('S.m'),10000);
new vm.Script(b);
console.log('PASS: unchanged gameplay/UI; income/tap/cost/regions/achievements parity; read-only original 2D import; isolated autosave/resume; no 3D save import; JS syntax.');
