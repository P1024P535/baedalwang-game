const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('android/app/src/main/res/raw/display_bridge.js','utf8').replace('__DISPLAY_TOKEN__','page-1').replace('__ADS_TEST_MODE__','true');
const calls=[],env={document:{getElementById(){return null;}},SsokDisplayAds:{configure(...x){calls.push(['configure',...x]);},show(...x){calls.push(['show',...x]);},retry(...x){calls.push(['retry',...x]);}}};env.window=env;vm.createContext(env);
assert.equal(vm.runInContext(src,env),true);const a=env.__ssokNativeAds;
a.configure(true,true,true,true);a.configure(true,true,true,true);assert.equal(calls.length,1);
let completed=0;a.show('open',false,()=>completed++);env.__ssokDisplayResult('old-page','1',true,'');assert.equal(completed,0);env.__ssokDisplayResult('page-1','1',false,'not ready');assert.equal(completed,1);env.__ssokDisplayResult('page-1','1',true,'');assert.equal(completed,1);
a.show('interstitial',false,()=>completed++);a.show('open',true,()=>completed++);assert.equal(calls.filter(c=>c[0]==='show').length,2);env.__ssokDisplayResult('page-1','2',true,'');assert.equal(completed,3);
assert.equal(vm.runInContext(src,env),true);
const live={document:env.document,SsokDisplayAds:env.SsokDisplayAds};live.window=live;vm.createContext(live);vm.runInContext(src.replace('testMode=true','testMode=false'),live);live.__ssokNativeAds.configure(true,true,true,true);assert.equal(calls.at(-1).at(-1),false);
// Exercise generated premium reward path: force test ads without changing entitlements.
const html=fs.readFileSync('android/app/src/main/assets/index.html','utf8');const f=html.slice(html.indexOf('function requestReward('),html.indexOf('function limitedAd('));
let shown=0,paid=0,finished;const reward={S:{noAds:true,st:{ads:0},region:0,lv:1},rewardPending:false,testAdsForced:()=>true,syncChallenges(){},setRewardStatus(){},toast(){},L:s=>s,logEv(){},mis(){},save(){},render(){},hud(){},PLATFORM:{showRewardedAd(fn){shown++;finished=fn;}}};vm.createContext(reward);vm.runInContext(f,reward);reward.requestReward(null,0,()=>paid++);assert.equal(shown,1);assert.equal(paid,0);finished(true);finished(true);assert.equal(paid,1);assert.equal(reward.S.noAds,true);
console.log('PASS: display bridge token/duplicate/concurrency/config guards; premium force test path without entitlement mutation');
