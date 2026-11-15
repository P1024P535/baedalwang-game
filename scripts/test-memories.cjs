const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('improvements/memories.js','utf8');
const fixture=`let S={money:123,fame:7,region:0,clears:0,taps:0,st:{hire:0,races:0},dex:{r:[0],s:[]}},tab=null,colTab='dex',stored='',saves=0,notices=0,mOpen=false;const R=Array.from({length:9},(_,i)=>['지역'+i]);const DEXS=Array.from({length:8},(_,i)=>['st_'+i,'직원'+i,'N']);const IC={scroll:''};const document={hidden:false};function $(id){return null;}function save(){saves++;stored=JSON.stringify(S);}function L(a){return a;}function toast(){notices++;}function showModal(){}function closeModal(){}function hud(){}function render(){}function colHTML(){return'';}function onAct(){};`;
const ctx=vm.createContext({console,Date});vm.runInContext(fixture+'\n'+source,ctx);const run=s=>vm.runInContext(s,ctx),eq=(s,v)=>assert.equal(run(s),v,s);
run('S.last=123456;syncMemories(true)');eq('S.memories.unlocked.length',0);eq('saves',0);eq('S.last',123456);
run('S.taps=10;syncMemories(true)');eq('S.memories.unlocked.length',1);eq('S.memories.featured','grandma-0');eq('memoryUnread()',1);
run("memoryOpen('grandma-0');memoryOpen('grandma-0')");eq('memoryUnread()',0);eq('S.memories.read.length',1);eq('S.money',123);eq('S.fame',7);
run("onAct({dataset:{act:'memory-feature',id:'grandma-7'}})");eq('S.memories.featured','grandma-0');
run('S.taps=30;S.st.hire=10;S.st.races=5;S.clears=5;S.dex.s=DEXS.map(s=>s[0]);syncMemories(true)');eq('S.memories.unlocked.length',24);eq('S.memories.staff.length',8);eq('memoryUnread()',31);eq('syncMemories(true)',0);
eq("memoryEpisodes().every(e=>typeof memoryGoal(e)==='string'&&e.text.length>30)",true);
run("S.region=0;S.st.hire=0;S.st.races=0;S.dex.s=[];syncMemories(true);save();S=JSON.parse(stored)");eq('S.memories.unlocked.length',24);eq('S.memories.staff.length',8);eq('S.memories.read.length',1);
// Existing players backfill from retained stats without a burst of modal/toast notifications.
run("delete S.memories;S.clears=3;S.taps=100;S.st.hire=10;S.st.races=5;syncMemories(false)");eq('S.memories.unlocked.length',21);eq('notices',0);
eq("memoriesHTML().includes('회사 기념품')",true);
const html=fs.readFileSync('android/app/src/main/assets/index.html','utf8');assert.ok(html.includes('memories:S.memories'));assert.ok(html.includes("['memory','인연']"));assert.ok(html.includes('memoryUnread()'));
console.log('PASS: 24 optional stories, 8 staff records, silent migration, sequential unlocks, replay/unread parity, locked keepsakes, saves and no economy changes');
