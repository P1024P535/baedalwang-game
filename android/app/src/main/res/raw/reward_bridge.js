(function () {
 'use strict';
 if (window.__ssokRewardBridgeReady) return true;
 if (typeof PLATFORM !== 'object' || !window.SsokRewardAds) return false;
 let serial = 0, pending = null;
 const page = '__PAGE_TOKEN__';
 Object.defineProperty(window, '__ssokRewardResult', {value: function (token, id, earned, message) {
  if (token !== page || !pending || pending.id !== id) return;
  const done = pending.done;
  pending = null;
  done(earned === true, message || '');
  if (message && typeof setRewardStatus !== 'function' && typeof toast === 'function') setTimeout(function () { toast(message); }, 0);
 }, writable: false, configurable: false});
 PLATFORM.showRewardedAd = function (done) {
  if (pending) { done(false); return; }
  const id = String(++serial);
  pending = { id: id, done: done };
  try {
   if (typeof toast === 'function') toast('광고를 불러오는 중…');
   SsokRewardAds.show(page, id);
  } catch (_) {
   window.__ssokRewardResult(page, id, false, '광고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
  }
 };
 Object.defineProperty(window, '__ssokRewardBridgeReady', {value:true});
 return true;
})()
