(function(){
 'use strict';
 if(window.__ssokNativeAds)return true;
 if(!window.SsokDisplayAds)return false;
 const page='__DISPLAY_TOKEN__',testMode=__ADS_TEST_MODE__;
 let serial=0,pending=null,lastConfig='';
 const api={testMode,status:'테스트 광고 준비 중',
  configure(enabled,playing,premium,force){const args=[!!enabled,!!playing,!!premium,testMode&&!!force],key=JSON.stringify(args);if(key===lastConfig)return;lastConfig=key;SsokDisplayAds.configure(page,...args);},
  retry(){SsokDisplayAds.retry(page);},
  show(kind,manual,done){
   if(pending){done(false,'다른 광고를 진행 중이에요');return;}
   const id=String(++serial);pending={id,done,started:false};
   try{SsokDisplayAds.show(page,id,kind,!!manual);}catch(_){window.__ssokDisplayResult(page,id,false,'광고 연결 실패 · 그대로 진행해요');}
  }
 };
 Object.defineProperty(window,'__ssokNativeAds',{value:api});
 Object.defineProperty(window,'__ssokDisplayStatus',{value:function(token,message){if(token!==page)return;api.status=String(message);const box=document.getElementById('nativeAdStatus');if(box)box.textContent=api.status;}});
 Object.defineProperty(window,'__ssokDisplayResult',{value:function(token,id,shown,message){if(token!==page||!pending||pending.id!==id)return;const p=pending;pending=null;if(message)window.__ssokDisplayStatus(page,message);p.done(shown===true,message||'');}});
 if(typeof syncNativeAds==='function')syncNativeAds();
 if(typeof tab!=='undefined'&&tab==='set'&&typeof render==='function')render();
 return true;
})()
