(function () {
 'use strict';
 if (window.__ssokAccountBridgeReady) return true;
 if (typeof PLATFORM === 'undefined' || typeof SsokAccounts === 'undefined') return false;
 const page = '__PAGE_TOKEN__';
 let serial = 0, activeUser = null, rankGeneration = 0;
 function clearRanking() {
  rankGeneration++; activeUser = null;
  if (typeof RK !== 'undefined') Object.assign(RK,{ready:false,tried:false,db:null,uid:null,list:null,my:null,lastSent:null,loading:false,err:''});
 }
 function rpcRank(op, payload) {
  const generation = rankGeneration;
  return new Promise((resolve,reject) => request(op,payload,(ok,data) => {
   if (!ok || generation !== rankGeneration) return reject(new Error('ranking unavailable'));
   resolve(data);
  }));
 }
 function snapshot(raw) { return {size:raw.size, docs:(raw.docs||[]).map(x=>({id:x.id,data:()=>x.data}))}; }
 function bindRanking(user) {
  if (typeof RK === 'undefined' || !S.acct || S.acct.id !== user.id) return;
  rankGeneration++;
  const db = {
   doc(path) {return {set:data=>rpcRank('rankSet',{path,data}),delete:()=>rpcRank('rankDelete',{path})};},
   collection(name) {
    if (name !== 'ranks') throw new Error('unsupported collection');
    const build = (field,mode,value) => ({limit(){return this;},get:()=>rpcRank('rankQuery',{field,mode,value}).then(snapshot)});
    return {orderBy:(field,direction)=>{if(direction!=='desc')throw new Error('unsupported direction');return build(field,'top');},where:(field,operator,value)=>{if(operator!=='>')throw new Error('unsupported filter');return build(field,'count',value);}};
   }
  };
  Object.assign(RK,{db,uid:user.id,ready:true,tried:true,canWrite:true,fb:false,lastSent:null});
  if (typeof rkSubmit === 'function') rkSubmit();
  if(typeof twCheckReward==='function')setTimeout(()=>{if(RK.ready&&RK.uid===user.id)twCheckReward();},1500);
 }
 const pending = new Map();
 function request(op, data, done) {
  const id = String(++serial);
  pending.set(id, done);
  try { SsokAccounts.request(page, id, op, JSON.stringify(data || {})); }
  catch (_) { finish(page, id, false, null, '연결을 준비하지 못했어요. 다시 시도해 주세요.'); }
 }
 function finish(token, id, ok, data, message) {
  if (token !== page || !pending.has(id)) return;
  const done = pending.get(id); pending.delete(id);
  done(ok, data);
  if (message && typeof toast === 'function') toast(message);
 }
 Object.defineProperty(window, '__ssokAccountResult', {value:finish});
 PLATFORM.signIn = function (provider, done) {
  if (provider !== 'google') return done(null, {code:'unsupported'});
  request('signIn', {}, (ok, user) => {if(ok){clearRanking();activeUser=user;}done(ok ? user : null, ok ? null : {code:'native-sign-in'});});
 };
 PLATFORM.signOut = function (done) { request('signOut', {}, ok => {if(ok)clearRanking();done(ok);}); };
 PLATFORM.cloudLoad = function (done) { request('load', {}, (ok, data) => {done(ok ? data : null);if(ok&&activeUser)bindRanking(activeUser);}); };
 PLATFORM.cloudSave = function (data, force) {
  // An immutable snapshot is bound to the currently signed-in game account.
  if (!data || !data.acct || data.acct.type !== 'google') return;
  request('save', {save:data, force:force === true}, () => {});
 };
 PLATFORM.deleteAccount = function (done) { request('delete', {}, ok => done(ok)); };
 // Purchases stay unavailable until merchant setup and verified billing are ready.
 PLATFORM.purchase = function(id,done) {done(false);if(typeof toast==='function')toast('결제 상품을 준비 중이에요.');};
 if (typeof buyAct === 'function') {const originalBuy=buyAct;buyAct=function(a,b){if(a==='buy'){toast('결제 상품을 준비 중이에요.');return true;}return originalBuy(a,b);};}
 if (typeof shopHTML === 'function') {const originalShop=shopHTML;shopHTML=function(){return '<div class="tip">결제 상품 준비 중 · 현재 구매할 수 없어요.</div>'+originalShop().replace(/data-act="buy"/g,'data-act="buy" disabled').replace(/<small>테스트<\/small>/g,'<small>준비 중</small>').replace(/<div class="tip">지금은 <b>테스트 버전<\/b>.*?<\/div>/,'');};}
 Object.defineProperty(window, '__ssokAccountBridgeReady' , {value:true});
 request('current', {}, (ok, user) => {
  // Never silently upload a guest save or another account's local progress.
  if (ok && user && S.acct && S.acct.type === 'google' && S.acct.id === user.id) {activeUser=user;afterGoogle(user);}
 });
 return true;
})()
