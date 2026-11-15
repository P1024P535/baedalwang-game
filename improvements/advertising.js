// Native test placements. Preference is device-local and never changes purchased benefits.
let gameAdsStarted=false,displayAdPending=false,lastNativeAdSync=0;
function adsTestOptions(){try{const p=JSON.parse(localStorage.getItem('baedal_ads_layout_v1')||'{}');return{enabled:p.enabled!==false,force:p.force!==false};}catch(_){return{enabled:true,force:true};}}
function nativeAds(){return window.__ssokNativeAds||null;}
function testAdsForced(){const a=nativeAds(),p=adsTestOptions();return !!(a&&a.testMode&&p.enabled&&p.force);}
function syncNativeAds(){const a=nativeAds();if(!a)return;const p=adsTestOptions();a.configure(p.enabled,gameAdsStarted,!!S.noAds,p.force);}
function showNativePlacement(kind,manual,done){
 const a=nativeAds(),p=adsTestOptions();if(!a||!p.enabled||(!manual&&kind==='interstitial'&&!gameAdsStarted)||(S.noAds&&!testAdsForced())||displayAdPending||rewardPending||document.hidden){done(false);return;}
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

// Keep the rider scale stable when the native banner reserves vertical space.
function gameBannerHeight(){const a=nativeAds();return Math.max(0,Number(a?.state?.bannerHeight)||0);}
