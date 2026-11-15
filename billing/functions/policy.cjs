const crypto=require('node:crypto');const catalog=require('./catalog.cjs');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const accountHash=uid=>hash('baedalwang:'+uid);
function assertPurchase(p,uid,key){
 if(!catalog[key])throw Error('unknown-product');
 if(p.purchaseState!==0)throw Error(p.purchaseState===2?'pending':'not-purchased');
 if((p.quantity??1)!==1)throw Error('unsupported-quantity');
 if(p.obfuscatedExternalAccountId!==accountHash(uid))throw Error('account-mismatch');
}
function validateSave(s,uid){
 if(!s||s.ver!==2||s.acct?.type!=='google'||s.acct.id!==uid)throw Error('save-owner');
 for(const k of ['money','total','run','fame'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1e300)throw Error('invalid-save');
 if(!Array.isArray(s.jobs)||s.jobs.length!==8||!s.jobs.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1e7))throw Error('invalid-jobs');
 if(!Array.isArray(s.comps)||s.comps.length!==3||!s.comps.every(c=>Number.isSafeInteger(c.pow)&&c.pow>=0&&c.pow<=1e12))throw Error('invalid-company');
 if(!Number.isInteger(s.region)||s.region<0||s.region>8||!Number.isInteger(s.veh)||s.veh<0||s.veh>12)throw Error('invalid-progress');
}
function baseIncome(s,now,offset){
 const date=new Date(now+offset*60000),day=date.getUTCDay();
 const base=[1,6,50,400,3500,30000,250000,2000000],cars=[1,1.5,2,3,4,6,8,11,15,20,27,36,48];
 const milestones=[25,50,100,150,200,300,400,500];
 let income=s.jobs.reduce((sum,n,i)=>sum+base[i]*n*2**milestones.filter(m=>n>=m).length*(day===1&&i<2?3:day===2&&i===2?2:day===5&&(i===3||i===4)?2:1),0);
 for(let i=0;i<3;i++)if(s.comps[i].own)income+=s.comps[i].pow*[100,25000,1e7][i]*(day===3?2:1);
 const trait=Math.min(60,(s.traits||[]).filter(t=>t.k==='inc').reduce((n,t)=>n+(Number(t.v)||0),0));
 const result=income*cars[s.veh]*(1+trait/100)*(date.getUTCMonth()===11?1.2:1)*(now<(s.vipUntil||0)?1.5:1)*(1+.02*((s.lv||1)-1))*3**s.region*1.15**s.region*(1+.25*s.fu.inc)*1.5**s.comps.filter(c=>c.own).length*(s.noAds?2:1)*(1+(s.clears||0));
 if(!Number.isFinite(result)||result<0||result>1e290)throw Error('invalid-income');return result;
}
function redeemTickets(s){
 const i=s.comps.findIndex(c=>c.own),n=s.billingTickets||0;
 if(i<0||!n)return s;
 if(!Number.isSafeInteger(n)||n<0||n>100000)throw Error('invalid-tickets');
 const c=s.comps[i];c.n=(c.n||0)+n;c.pow+=15*n;s.st=s.st||{};s.st.hire=(s.st.hire||0)+n;s.st.ssr=(s.st.ssr||0)+n;
 s.dex=s.dex||{};s.dex.s=Array.from(new Set([...(s.dex.s||[]),'st_0']));
 c.best='<img src="assets/st_0.png" style="width:24px;height:24px;vertical-align:-7px;object-fit:contain" alt=""> <span class="grade gSSR">SSR</span> 배달 파트너';s.billingTickets=0;return s;
}
function applyGrant(raw,key,owner,now,offset=540){
 const s=structuredClone(raw);validateSave(s,owner);if(!catalog[key])throw Error('unknown-product');
 const own=s.billingVerified||{},once=own.once||{};if(catalog[key].once&&once[key])return s;
 const earn=n=>{for(const k of ['money','total','run']){s[k]+=n;if(!Number.isFinite(s[k])||s[k]>1e300)throw Error('overflow');}};
 const rate=()=>baseIncome(s,now,offset);s.buy=s.buy||{};
 if(key==='starter'){s.fame+=15;s.boostUntil=Math.max(now,s.boostUntil||0)+86400000;earn(Math.max(1e4*3**s.region,rate()*14400));}
 if(key==='vip')s.vipUntil=Math.max(now,s.vipUntil||0)+30*86400000;
 if(key==='premium')s.noAds=true;
 if(key==='ssr'){s.billingTickets=(s.billingTickets||0)+1;redeemTickets(s);}
 if(key==='warp8')earn(Math.max(5000*3**s.region,rate()*28800));
 if(key==='warp24')earn(Math.max(15000*3**s.region,rate()*86400*1.2));
 if(key==='fame50')s.fame+=50;if(key==='fame200')s.fame+=220;
 if(key==='helmpack'){s.hp=Array.from(new Set([...(s.hp||[]),'diamond','neon']));s.helm='diamond';}
 if(catalog[key].once){once[key]=true;s.buy[key]=true;}
 s.billingVerified={once,verifiedAt:now};return s;
}
module.exports={hash,accountHash,assertPurchase,validateSave,baseIncome,applyGrant,redeemTickets};
