const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const file of ['quarterview-full.html','quarterview-remaster.html']){
 const html=fs.readFileSync(file,'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
 const buy=script.slice(script.indexOf('function buy(el){'),script.indexOf("document.addEventListener('click'"));
 const sandbox={S:{m:10000,j:[0],bn:0,d:{buy:0},v:0,r:0},J:[{e:'',n:'신문배달'}],V:[{}, {e:'',n:'자전거',c:3000}],R:[{}, {e:'',n:'동네',c:4000}],tab:'main',buyN:10,cost:(_i,n)=>n===1?50:600,jm:n=>1,ps:()=>sandbox.S.j[0],toast:()=>{},log:()=>{},rubyAdd:()=>{},snd:()=>{},G:{bump(){},coin(){}},save:()=>{},render:()=>{},gameUI:{feedback(){}}};
 vm.createContext(sandbox);vm.runInContext(buy,sandbox);
 sandbox.buy({id:'quick-buy',dataset:{cost:'50',job:'0'}});assert.equal(sandbox.S.j[0],1,'quick buy always buys one even after x10 selection');assert.equal(sandbox.S.m,9950);assert.equal(sandbox.S.bn,1);assert.equal(sandbox.S.d.buy,1);
 sandbox.tab='jobs';sandbox.buy({id:'',dataset:{cost:'600',job:'0'}});assert.equal(sandbox.S.j[0],11);assert.equal(sandbox.S.m,9350);assert.equal(sandbox.S.d.buy,11);
 sandbox.S.m=0;sandbox.buy({id:'',dataset:{cost:'99999',job:'0'}});assert.equal(sandbox.S.j[0],11,'insufficient funds do not buy');assert.equal(sandbox.S.m,0);sandbox.S.m=9350;
 sandbox.tab='veh';sandbox.buy({id:'',dataset:{cost:'3000'}});assert.equal(sandbox.S.v,1);assert.equal(sandbox.S.m,6350);
 sandbox.tab='reg';sandbox.buy({id:'',dataset:{cost:'4000'}});assert.equal(sandbox.S.r,1);assert.equal(sandbox.S.evo,1);assert.equal(sandbox.S.m,2350);
 assert.match(html,/id="quick-dock"/);assert.match(html,/game-experience\.js/);console.log(file+': quick purchase, batch purchase, affordability, vehicle and region upgrades passed');
}
new vm.Script(fs.readFileSync('assets/game-experience.js','utf8'));new vm.Script(fs.readFileSync('assets/world-2d.js','utf8'));
