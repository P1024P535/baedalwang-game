(function () {
 'use strict';
 if (window.__ssokLayoutReady) return true;
 window.__ssokLayoutReady = true;
 // Resize only compact, single-line HUD labels. Body copy wraps at its normal size.
 const labels = [['#money',14],['#ips',10],['#fame',13],['#lvNum',11],['#shTitle',17]];
 const cache = new WeakMap();
 let queued = false;
 function fit() {
  queued = false;
  for (const [selector, minimum] of labels) {
   const el = document.querySelector(selector);
   if (!el || !el.clientWidth) continue;
   const key = el.textContent + '|' + el.clientWidth;
   if (cache.get(el) === key) continue;
   el.style.fontSize = '';
   let size = parseFloat(getComputedStyle(el).fontSize);
   while (el.scrollWidth > el.clientWidth + 1 && size > minimum) {
    size = Math.max(minimum, size - .5);
    el.style.fontSize = size + 'px';
   }
   cache.set(el, el.textContent + '|' + el.clientWidth);
  }
 }
 function schedule() { if (!queued) { queued = true; requestAnimationFrame(fit); } }
 const app = document.getElementById('app');
 if (!app) { window.__ssokLayoutReady = false; return false; }
 const mutations = new MutationObserver(schedule);
 mutations.observe(app, {subtree:true,childList:true,characterData:true});
 if (window.ResizeObserver) new ResizeObserver(schedule).observe(app);
 window.addEventListener('resize', schedule);
 document.fonts?.ready.then(() => { for (const [sel] of labels) { const e=document.querySelector(sel);if(e)cache.delete(e); } schedule(); });
 schedule();
 return true;
})();
