(function () {
 'use strict';
 if (window.__ssokAccountBridgeReady) return true;
 if (typeof PLATFORM === 'undefined' || typeof SsokAccounts === 'undefined') return false;
 const page = '__PAGE_TOKEN__';
 let serial = 0;
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
  request('signIn', {}, (ok, user) => done(ok ? user : null, ok ? null : {code:'native-sign-in'}));
 };
 PLATFORM.signOut = function (done) { request('signOut', {}, ok => done(ok)); };
 PLATFORM.cloudLoad = function (done) { request('load', {}, (ok, data) => done(ok ? data : null)); };
 PLATFORM.cloudSave = function (data, force) {
  // An immutable snapshot is bound to the currently signed-in game account.
  if (!data || !data.acct || data.acct.type !== 'google') return;
  request('save', {save:data, force:force === true}, () => {});
 };
 PLATFORM.deleteAccount = function (done) { request('delete', {}, ok => done(ok)); };
 Object.defineProperty(window, '__ssokAccountBridgeReady', {value:true});
 request('current', {}, (ok, user) => {
  // Never silently upload a guest save or another account's local progress.
  if (ok && user && S.acct && S.acct.type === 'google' && S.acct.id === user.id) afterGoogle(user);
 });
 return true;
})()
