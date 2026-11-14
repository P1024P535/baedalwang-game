import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const bridge=readFileSync('android/app/src/main/res/raw/reward_bridge.js','utf8').replace('__PAGE_TOKEN__','page-1');
const source=readFileSync('index.html','utf8');
const original=source.match(/function adThen\(cb\)\{[\s\S]*?(?=\nfunction burst)/);
assert.ok(original,'original adThen located');
function game(){
 const requests=[];
 const env={PLATFORM:{showRewardedAd(){throw Error('mock must not run')}},S:{noAds:false,st:{ads:0},region:0,lv:1},toast(){},logEv(){},mis(){},save(){},render(){},setTimeout(fn){fn()},SsokRewardAds:{show(page,id){requests.push({page,id})}}};
 env.window=env; vm.createContext(env);vm.runInContext(original[0],env);assert.equal(vm.runInContext(bridge,env),true);
 let paid=0;env.pay=()=>paid++;return {env,requests,start(){env.adThen(env.pay)},result(i,ok,token='page-1'){env.__ssokRewardResult(token,String(i),ok,'')},paid:()=>paid};
}
let g=game();g.start();assert.equal(g.paid(),0);g.result(1,true);g.result(1,true);g.result(1,false);assert.equal(g.paid(),1);assert.equal(g.env.S.st.ads,1);
g=game();g.start();g.result(1,false);g.result(1,true);assert.equal(g.paid(),0);assert.equal(g.env.S.st.ads,0);
g=game();g.start();g.result(1,true,'old-page');assert.equal(g.paid(),0);g.result(1,true);assert.equal(g.paid(),1);
g=game();g.start();g.start();assert.equal(g.requests.length,1);g.result(1,true);assert.equal(g.paid(),1);g.start();g.result(1,true);assert.equal(g.paid(),1);g.result(2,true);assert.equal(g.paid(),2);
g=game();g.env.SsokRewardAds.show=()=>{throw Error('unavailable')};g.start();assert.equal(g.paid(),0);assert.equal(g.env.S.st.ads,0);
g=game();assert.equal(vm.runInContext(bridge,g.env),true);g.start();assert.equal(g.requests.length,1);
console.log('PASS: original adThen + native bridge: earned once, duplicate, cancel, stale page, concurrent request, second ad, native failure, repeated bind');
