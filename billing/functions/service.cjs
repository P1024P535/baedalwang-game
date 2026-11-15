const catalog=require('./catalog.cjs');const {hash,assertPurchase,applyGrant,redeemTickets}=require('./policy.cjs');
const PACKAGE='com.ssokcompany.baedalwang';
function createService({db,play,clock=Date.now,enabled=()=>false}){
 return async function handle(uid,input){
  if(!uid)throw Error('unauthenticated');if(!enabled())return{ready:false,reason:'billing-not-enabled'};
  if(input.op==='status')return{ready:true,products:catalog};
  if(input.op==='restore'){
   // Consumables already delivered are in the account cloud save. Never grant them again.
   const account=db.doc('billingAccounts/'+uid),data=(await account.get()).data()||{};
   const checked={};for(const [key,record] of Object.entries(data.once||{})){
    if(!catalog[key]?.once)continue;const p=await play.get(PACKAGE,catalog[key].sku,record.token);
    try{assertPurchase(p,uid,key);checked[key]=record;}catch(e){if(!['not-purchased'].includes(e.message))throw e;}
   }
   await db.runTransaction(async tx=>{
    const user=db.doc('users/'+uid);const [snap,current]=await Promise.all([tx.get(user),tx.get(account)]);if(JSON.stringify(current.data()||{})!==JSON.stringify(data))throw Error('restore-retry');if(!snap.exists)throw Error('cloud-save-required');
    const d=snap.data(),s=JSON.parse(d.save),prior=Object.fromEntries(Object.keys(data.once||{}).map(k=>[k,true]));s.buy=s.buy||{};
    for(const key of ['premium','helmpack','starter']){
     const active=!!checked[key];if(key==='premium'&&(active||prior[key]))s.noAds=active;
     if(key==='helmpack'&&active)s.hp=Array.from(new Set([...(s.hp||[]),'diamond','neon']));
     if(key==='helmpack'&&prior[key]&&!active){s.hp=(s.hp||[]).filter(x=>!['diamond','neon'].includes(x));if(['diamond','neon'].includes(s.helm))s.helm='white';}
     if(active||prior[key])s.buy[key]=active;
    }
    s.billingVerified={once:Object.fromEntries(Object.keys(checked).map(k=>[k,true])),verifiedAt:clock()};
    if(data.vipUntil)s.vipUntil=Math.max(s.vipUntil||0,data.vipUntil);redeemTickets(s);
    tx.set(user,{...d,save:JSON.stringify(s),rev:d.rev+1,updated:new Date(clock())});tx.set(account,{...data,once:checked});
   });return{ready:true,status:'restored'};
  }
  if(input.op!=='verify')throw Error('unknown-operation');
  const {key,token}=input;if(!catalog[key]||typeof token!=='string'||token.length<10||token.length>8192)throw Error('invalid-request');
  const purchase=await play.get(PACKAGE,catalog[key].sku,token);assertPurchase(purchase,uid,key);
  const receipt=db.doc('billingReceipts/'+hash(token)),user=db.doc('users/'+uid),account=db.doc('billingAccounts/'+uid);
  const now=clock(),offset=Number.isInteger(input.offset)&&Math.abs(input.offset)<=840?input.offset:540;
  await db.runTransaction(async tx=>{
   const [old,snap,acc]=await Promise.all([tx.get(receipt),tx.get(user),tx.get(account)]);
   if(old.exists){const r=old.data();if(r.uid!==uid||r.key!==key)throw Error('token-owner');return;}
   if(purchase.consumptionState===1)throw Error('already-consumed');
   if(!snap.exists)throw Error('cloud-save-required');const d=snap.data(),a=acc.data()||{},s=JSON.parse(d.save);
   if(catalog[key].once&&a.once?.[key])throw Error('already-owned');
   s.billingVerified={once:Object.fromEntries(Object.keys(a.once||{}).map(k=>[k,true]))};const next=applyGrant(s,key,uid,now,offset);a.once=a.once||{};
   if(catalog[key].once)a.once[key]={token,at:now};if(key==='vip')a.vipUntil=next.vipUntil;
   tx.set(user,{...d,save:JSON.stringify(next),total:next.total,rev:d.rev+1,updated:new Date(now)});
   tx.set(receipt,{uid,key,token,at:now,delivered:true,settled:false});tx.set(account,a);
  });
  // Delivery is committed before acknowledgment/consumption. Retrying cannot pay twice.
  const r=(await receipt.get()).data();if(!r.settled){
   try{if(catalog[key].once){if(purchase.acknowledgementState!==1)await play.acknowledge(PACKAGE,catalog[key].sku,token);}else if(purchase.consumptionState!==1)await play.consume(PACKAGE,catalog[key].sku,token);
    await receipt.update({settled:true});
   }catch(_){return{ready:true,status:'delivered',settlementPending:true};}
  }
  return{ready:true,status:'delivered'};
 };
}
module.exports={createService};
