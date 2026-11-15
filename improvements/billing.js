// Native Play receipts never call the original mock grant(). Delivery is a server save transaction.
let billingNeedsReload=false,billingPending=false,billingBusyCatalog=false;
const BILLING={ready:false,prices:{},message:'Google Play 결제 연결 대기',jobs:[]};
function billingStatus(message){BILLING.message=message;const e=$('billingStatus');if(e)e.textContent=message;}
function billingRpc(op,key,done){const api=window.__ssokBilling;if(!api){done(false,null,'결제 연결을 준비 중이에요.');return;}api.request(op,key||'',done);}
function billingAccount(){return !!(S.acct&&S.acct.type==='google');}
function billingRefresh(){
 if(billingBusyCatalog)return;if(!billingAccount()){billingStatus('설정에서 Google 로그인 후 상품을 확인할 수 있어요.');return;}
 billingBusyCatalog=true;billingStatus('Google Play 상품 정보를 확인 중이에요…');
 billingRpc('catalog','',(ok,data,message)=>{billingBusyCatalog=false;BILLING.ready=!!(ok&&data?.ready);BILLING.prices=data?.prices||{};Object.assign(NATIVE.price,BILLING.prices);billingStatus(message||(BILLING.ready?'Google Play 가격을 확인했어요.':'상품 등록과 결제 서버 연결이 필요해요.'));if(tab==='shop')render();});
}
function billingBlock(on){syncChallenges();billingPending=on;let e=$('billingProgress');if(on){if(!e){e=document.createElement('div');e.id='billingProgress';e.setAttribute('role','status');e.textContent='구매 기록 확인 중… 앱을 잠시 기다려 주세요.';$('app').appendChild(e);}}else e?.remove();}
const billingPause=challengePaused;
challengePaused=function(){return billingPending||billingPause();};
function billingFlush(done){if(billingNeedsReload){billingReload(done);return;}if(!billingAccount()||typeof PLATFORM.billingFlush!=='function'){done(false);return;}PLATFORM.billingFlush(S,done);}
function billingReload(done){
 if(typeof PLATFORM.billingReload!=='function'){done(false);return;}
 PLATFORM.billingReload((ok,data)=>{
  if(!ok||!data||data.acct?.id!==S.acct?.id){done(false);return;}
  S=Object.assign(fresh(),data);billingNeedsReload=false;applyScale();scene();
  // Direct local persistence keeps the newly loaded cloud revision from being overwritten.
  try{localStorage.setItem('baedal_king_v1',JSON.stringify(S));}catch(_){}
  render();hud();done(true);
 });
}
function billingDone(message){billingBlock(false);billingStatus(message);toast(message);if(tab==='shop')render();setTimeout(billingWork,0);}
function billingWork(){
 if(billingPending||!BILLING.jobs.length||!billingAccount())return;
 const job=BILLING.jobs.shift();billingBlock(true);
 billingFlush(ok=>{if(!ok){billingDone('기록 저장을 확인하지 못했어요. 다시 구매하지 말고 구매 복원을 눌러 주세요.');return;}
  billingRpc('verify',job.id,(ok,data,message)=>{
   if(!ok){billingDone(message||'구매 확인이 지연되고 있어요. 구매 복원으로 다시 확인해 주세요.');return;}
   billingNeedsReload=true;billingReload(ok=>billingDone(ok?'구매 상품이 확인되어 기록에 반영됐어요.':'구매는 확인됐어요. 기록을 다시 불러오려면 구매 복원을 눌러 주세요.'));
  });
 });
}
function billingPurchaseFound(id,key){if(!BILLING.jobs.some(x=>x.id===id))BILLING.jobs.push({id,key});billingWork();}
function billingRestore(){
 if(billingPending)return;if(!billingAccount()){toast('Google 로그인 후 구매 복원을 이용해 주세요.');return;}
 billingBlock(true);billingFlush(ok=>{
  if(!ok){billingDone('클라우드 기록을 먼저 확인해 주세요.');return;}
  billingRpc('restore','',(ok,data,message)=>{if(!ok){billingDone(message||'구매 복원을 완료하지 못했어요.');return;}billingNeedsReload=true;billingReload(ok=>billingDone(ok?'구매 기록을 복원했어요.':'구매 기록을 다시 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'));});
 });
}
const billingBuy=buyAct;
buyAct=function(a,b){
 if(a!=='buy')return billingBuy(a,b);
 const key=b.dataset.k,p=PRD.find(x=>x.id===key);if(!p||prdOwned(p)||billingPending)return true;
 if(!BILLING.ready||!BILLING.prices[key]){toast('상품 등록과 결제 서버 연결을 확인 중이에요.');return true;}
 if(!billingAccount()){toast('Google 로그인 후 구매할 수 있어요.');return true;}
 showModal(IC[p.ic]||IC.star,p.n,`<span class="hl">${esc(BILLING.prices[key])}</span>${p.d}<p>${key==='vip'?'자동 갱신이 없는 30일 이용권이에요.':'Google Play 결제 화면에서 가격과 계정을 확인해 주세요.'}</p>`,[['Google Play 구매','y',()=>{
  closeModal();billingBlock(true);billingFlush(ok=>{if(!ok){billingDone('구매 전 클라우드 저장을 확인해 주세요.');return;}
   billingRpc('buy',key,(ok,data,message)=>billingDone(ok?'Google Play 결제 결과를 기다리고 있어요.':message||'구매를 시작하지 못했어요.'));
  });
 }],['취소','own',closeModal]]);return true;
};
const billingShop=shopHTML;
shopHTML=function(){
 let h=billingShop().replace(/<div class="tip">지금은 <b>테스트 버전<\/b>.*?<\/div>/,'');
 h=h.replace(/<button class="gb y" data-act="buy" data-k="([^"]+)"([^>]*)>[\s\S]*?<\/button>/g,(whole,key,attrs)=>{
  const ready=BILLING.ready&&!!BILLING.prices[key]&&!billingPending;
  return `<button class="gb ${ready?'y':''}" data-act="buy" data-k="${key}"${attrs}${ready?'':' disabled'}>${ready?esc(BILLING.prices[key]):'연결 대기'}<small>${ready?'Google Play':'상품·서버 확인 필요'}</small></button>`;
 });
 return `<section class="billing-info"><p id="billingStatus" role="status">${esc(BILLING.message)}</p><div class="row2"><button class="gb" data-act="billing-refresh">상품 새로고침</button><button class="gb" data-act="billing-restore">구매 복원${S.billingTickets?' · 확정권 '+S.billingTickets:''}</button></div><small>보유 표시에는 이전 기기 혜택이 포함될 수 있어요. 실제 결제 이력은 구매 복원으로 확인해요.${S.billingTickets?'<br>보관된 SSR 확정권은 회사 설립 후 구매 복원으로 사용할 수 있어요.':''}</small></section>`+h;
};
const billingAct=onAct;
onAct=function(b){if(b.dataset.act==='billing-refresh'){billingRefresh();return;}if(b.dataset.act==='billing-restore'){billingRestore();return;}return billingAct(b);};
const billingOpen=openSheet;
openSheet=function(t){billingOpen(t);if(t==='shop'&&window.__ssokBilling&&!billingBusyCatalog)billingRefresh();};
