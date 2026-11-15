const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {initializeApp}=require('firebase-admin/app');const {getFirestore}=require('firebase-admin/firestore');
const {GoogleAuth}=require('google-auth-library');const {createService}=require('./service.cjs');
initializeApp();const auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/androidpublisher']});
async function request(pkg,sku,token,action){
 const client=await auth.getClient();const url='https://androidpublisher.googleapis.com/androidpublisher/v3/applications/'+encodeURIComponent(pkg)+'/purchases/products/'+encodeURIComponent(sku)+'/tokens/'+encodeURIComponent(token)+(action?':'+action:'');
 return(await client.request({url,method:action?'POST':'GET',data:action?{}:undefined,timeout:15000})).data;
}
const handle=createService({db:getFirestore(),enabled:()=>process.env.BILLING_ENABLED==='true',play:{get:(...a)=>request(...a),acknowledge:(...a)=>request(...a,'acknowledge'),consume:(...a)=>request(...a,'consume')}});
exports.gameBilling=onCall({region:'asia-northeast3',timeoutSeconds:60,maxInstances:2},async req=>{
 if(!req.auth||req.auth.token.firebase?.sign_in_provider!=='google.com')throw new HttpsError('unauthenticated','Google 로그인이 필요해요.');
 const deleted=await getFirestore().doc('deletedAccounts/'+req.auth.uid).get();if(deleted.exists)throw new HttpsError('permission-denied','삭제된 계정이에요.');
 try{return await handle(req.auth.uid,req.data||{});}catch(e){
  const safe=['pending','not-purchased','account-mismatch','unsupported-quantity','cloud-save-required','already-owned','token-owner','already-consumed','invalid-request'];
  throw new HttpsError('failed-precondition',safe.includes(e.message)?e.message:'purchase-verification-failed');
 }
});
