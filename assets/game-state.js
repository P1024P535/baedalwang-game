/* One validation path for saved games and manually imported backup codes. */
(function(root){
'use strict';
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const num=(v,fallback=0,max=1e100)=>typeof v==='number'&&Number.isFinite(v)&&v>=0?Math.min(v,max):fallback;
const count=(v,max=Number.MAX_SAFE_INTEGER)=>Math.floor(num(v,0,max));
function normalize(raw,c){
 const base=c.fresh(),o=record(raw)?raw:{},s={...base,...o};
 for(const k of ['m','run','best','reserve','totalRuby','ruby'])s[k]=num(o[k],base[k]);
 for(const k of ['tn','bn','gn','rb','st','adc'])s[k]=count(o[k]);
 for(const k of ['snd','mg','auto','dispatch','pro'])s[k]=o[k]===undefined?base[k]:Number(Boolean(o[k]));
 s.j=c.jobs.map((_,i)=>count(Array.isArray(o.j)?o.j[i]:0));
 s.v=count(o.v,c.vehicles.length-1);s.r=Math.max(count(o.r,c.regions.length-1),count(o.evo,c.regions.length-1));s.evo=s.r;
 s.bestRegion=Math.max(s.r,count(o.bestRegion,c.regions.length-1));s.best=Math.max(s.best,s.run);s.g=count(o.g,c.goals.length);s.staff=count(o.staff,1000);
 s.items=[...new Set((Array.isArray(o.items)?o.items:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<c.items.length))];
 s.equip={};if(record(o.equip))for(const [slot,i] of Object.entries(o.equip)){if(s.items.includes(i)&&c.items[i]?.slot===slot)s.equip[slot]=i;}
 s.ac=[...new Set((Array.isArray(o.ac)?o.ac:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<c.achievements.length))];
 s.log=(Array.isArray(o.log)?o.log:base.log).filter(x=>typeof x==='string').slice(0,6);
 s.claims={};if(record(o.claims))for(const [k,v] of Object.entries(o.claims))s.claims[k]=count(v,1000);
 s.boosts={};if(record(o.boosts))for(const k of ['idle','tap','staff','gear','rebirth'])s.boosts[k]=num(o.boosts[k]);
 s.week={key:'',count:0};if(record(o.week))s.week={key:typeof o.week.key==='string'?o.week.key:'',count:count(o.week.count),claimed:!!o.week.claimed};
 s.d={...base.d};if(record(o.d)){for(const k of ['day','last'])s.d[k]=typeof o.d[k]==='string'?o.d[k]:'';for(const k of ['tap','buy','gift','str'])s.d[k]=count(o.d[k]);s.d.cl=Array.from({length:4},(_,i)=>Number(Boolean(o.d.cl?.[i])));}
 s.t=Math.min(c.now??Date.now(),num(o.t,base.t));s.ad=num(o.ad);
 s.offlineReport={time:num(o.offlineReport?.time,0,86400),earn:num(o.offlineReport?.earn)};
 return s;
}
root.BWState={normalize};
})(typeof window==='undefined'?globalThis:window);
