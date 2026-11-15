(function(){
 'use strict';if(window.__ssokBilling)return true;if(!window.SsokBilling)return false;
 const page='__BILLING_PAGE__',pending=new Map();let serial=0;
 const api={request(op,key,done){const id=String(++serial),owner=S.acct?.id||'';const timer=setTimeout(()=>{const p=pending.get(id);if(!p)return;pending.delete(id);p.done(false,null,'결제 확인 시간이 길어지고 있어요. 다시 구매하지 말고 구매 복원을 이용해 주세요.');},70000);pending.set(id,{done,owner,timer});try{SsokBilling.request(page,id,op,key);}catch(_){window.__ssokBillingResult(page,id,false,null,'결제 연결을 준비하지 못했어요.');}}};
 Object.defineProperty(window,'__ssokBilling',{value:api});
 Object.defineProperty(window,'__ssokBillingResult',{value:function(token,id,ok,data,message){if(token!==page||!pending.has(id))return;const p=pending.get(id);pending.delete(id);clearTimeout(p.timer);if(p.owner!==(S.acct?.id||'')){p.done(false,null,'로그인 계정이 변경됐어요. 구매 복원으로 다시 확인해 주세요.');return;}p.done(ok===true,data,message||'');}});
 Object.defineProperty(window,'__ssokBillingPurchase',{value:function(token,id,key){if(token===page&&typeof billingPurchaseFound==='function')billingPurchaseFound(id,key);}});
 if(typeof tab!=='undefined'&&tab==='shop'&&typeof render==='function')render();
 return true;
})()
