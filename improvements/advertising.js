// Native test placements. Preference is device-local and never changes purchased benefits.
let gameAdsStarted=false,displayAdPending=false,lastNativeAdSync=0;
function adsTestOptions(){try{const p=JSON.parse(localStorage.getItem('baedal_ads_test_v1')||'{}');return{enabled:p.enabled!==false,force:p.force!==false};}catch(_){return{enabled:true,force:true};}}
function nativeAds(){return window.__ssokNativeAds||null;}
function testAdsForced(){const a=nativeAds(),p=adsTestOptions();return !!(a&&a.testMode&&p.enabled&&p.force);}
function syncNativeAds(){const a=nativeAds();if(!a)return;const p=adsTestOptions();a.configure(p.enabled,gameAdsStarted,!!S.noAds,p.force);}
function showNativePlacement(kind,manual,done){
 const a=nativeAds();if(!a||displayAdPending||rewardPending||document.hidden){done(false);return;}
 syncChallenges();displayAdPending=true;
 a.show(kind,manual,(shown,message)=>{syncChallenges();displayAdPending=false;if(message&&manual)toast(message);done(shown);});
}
const adsPaused=challengePaused;
challengePaused=function(){return displayAdPending||adsPaused();};
const adsHud=hud;
hud=function(){adsHud();if(Date.now()-lastNativeAdSync>1000){lastNativeAdSync=Date.now();syncNativeAds();}};
const adsSplash=showSplash;
showSplash=function(cb){
 const go=()=>adsSplash(()=>{gameAdsStarted=true;syncNativeAds();cb();});
 // A cold-start ad is attempted only on the loading screen for returning players.
 if(nativeAds()&&(S.taps>=10||S.att.last)){
  const loading=document.createElement('div');loading.id='adsLoading';loading.setAttribute('role','status');loading.textContent=L('배달 준비 중…','Preparing deliveries…');$('app').appendChild(loading);
  showNativePlacement('open',false,()=>{loading.remove();go();});
 }else go();
};
// Between regions only; the SDK controller skips unavailable/capped ads without delay.
function presentRegionResult(ic,title,copy,buttons){showNativePlacement('interstitial',false,()=>showModal(ic,title,copy,buttons));}
function adsTestHTML(){
 const a=nativeAds();if(!a||!a.testMode)return'';
 const p=adsTestOptions();return `<details class="native-ads-panel" open><summary>${L('테스트 광고 점검','Test ads')}</summary><p>${L('구글 공식 테스트 광고 · 실제 결제나 광고 수익은 발생하지 않아요.','Official Google test ads. No purchases or ad revenue.')}</p><p id="nativeAdStatus" role="status">${esc(a.status)}</p>
 <button class="gb wide" data-act="ad-test-enabled">${L('배너·자동 광고','Banner & automatic ads')}: ${p.enabled?'켜짐':'꺼짐'}</button>
 <button class="gb wide" data-act="ad-test-force">${L('프리미엄에서도 테스트 광고 표시','Show test ads with premium')}: ${p.force?'켜짐':'꺼짐'}</button>
 <p>${L('프리미엄 혜택과 저장 기록은 그대로 유지돼요. 광고가 준비되지 않으면 잠시 후 다시 눌러 주세요.','Premium and progress are preserved. Retry shortly if the ad is not ready.')}</p>
 <div class="native-ads-buttons"><button class="gb" data-act="ad-test-banner">배너 다시 준비</button><button class="gb" data-act="ad-test-open">앱 시작 광고</button><button class="gb" data-act="ad-test-interstitial">전면 광고</button><button class="gb" data-act="ad-test-reward">보상형 광고</button></div></details>`;
}
const adsRender=render;
render=function(){adsRender();if(tab==='set')$('shBody').insertAdjacentHTML('beforeend',adsTestHTML());};
const adsAct=onAct;
onAct=function(b){
 const action=b.dataset.act;if(!action.startsWith('ad-test-'))return adsAct(b);
 const a=nativeAds();if(!a||!a.testMode)return;
 const p=adsTestOptions();
 if(action==='ad-test-enabled'||action==='ad-test-force'){
  p[action==='ad-test-enabled'?'enabled':'force']=!p[action==='ad-test-enabled'?'enabled':'force'];
  localStorage.setItem('baedal_ads_test_v1',JSON.stringify(p));syncNativeAds();render();return;
 }
 if(!p.enabled){toast('광고 테스트를 먼저 켜 주세요');return;}
 if(action==='ad-test-banner'){a.retry();return;}
 if(action==='ad-test-reward'){
  if(rewardPending||displayAdPending){toast('광고 처리 중이에요');return;}
  syncChallenges();rewardPending=true;
  PLATFORM.showRewardedAd((earned,message)=>{syncChallenges();rewardPending=false;toast(earned?'보상형 광고 완료 · 점검용이라 게임 보상은 지급하지 않아요':message||'광고를 닫았어요');});return;
 }
 showNativePlacement(action==='ad-test-open'?'open':'interstitial',true,()=>{});
};
