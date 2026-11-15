package com.ssokcompany.baedalwang;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.android.billingclient.api.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.functions.FirebaseFunctions;
import org.json.JSONObject;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/** Play UI on device, verified delivery on server. No local grant or local consume. */
final class GameBilling implements PurchasesUpdatedListener {
 private final Activity activity;private final WebView web;private final AdGate gate;
 private final Handler main=new Handler(Looper.getMainLooper());
 private final BillingClient client;private final FirebaseAuth auth=FirebaseAuth.getInstance();
 private final FirebaseFunctions functions=FirebaseFunctions.getInstance("asia-northeast3");
 private final Map<String,String> skus=new LinkedHashMap<>();private final Map<String,ProductDetails> products=new HashMap<>();
 private final Map<String,Purchase> queue=new HashMap<>();
 private final Set<String> processedTokens=new HashSet<>();
 private String page="",flowUid="";private Object flowOwner;private boolean destroyed,connecting,serverReady;
 GameBilling(Activity a,WebView w,AdGate g){activity=a;web=w;gate=g;
  String[] keys={"starter","vip","premium","ssr","warp8","warp24","fame50","fame200","helmpack"};
  String[] ids={"baedal_starter","baedal_vip30","baedal_premium","baedal_ssr","baedal_warp8","baedal_warp24","baedal_fame50","baedal_fame220","baedal_helm_pack"};
  for(int i=0;i<keys.length;i++)skus.put(keys[i],ids[i]);
  client=BillingClient.newBuilder(a).setListener(this).enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()).enableAutoServiceReconnection().build();
  web.addJavascriptInterface(this,"SsokBilling");
 }
 void pageStarted(){page=UUID.randomUUID().toString();queue.clear();serverReady=false;}
 private boolean trusted(String p){return !destroyed&&page.equals(p)&&"file:///android_asset/index.html".equals(web.getUrl())&&!activity.isFinishing();}
 private FirebaseUser user(){FirebaseUser u=auth.getCurrentUser();return u==null||u.isAnonymous()?null:u;}
 void attach(){
  if(!trusted(page))return;
  try(InputStream in=activity.getResources().openRawResource(R.raw.billing_bridge)){
   java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream();byte[] b=new byte[4096];int n;while((n=in.read(b))!=-1)out.write(b,0,n);
   web.evaluateJavascript(new String(out.toByteArray(),StandardCharsets.UTF_8).replace("__BILLING_PAGE__",page),null);
  }catch(Exception e){android.util.Log.e("Baedalwang","BILLING_BRIDGE_FAILED");}
 }
 @JavascriptInterface public void request(String p,String id,String op,String key){main.post(()->{
  if(!trusted(p)||id==null||!id.matches("[0-9]{1,10}"))return;
  if(!BuildConfig.PLAY_BILLING_ENABLED){result(p,id,false,null,"Play 상품·영수증 서버 설정 후 결제가 열려요.");return;}
  if(user()==null){result(p,id,false,null,"Google 로그인 후 구매·복원할 수 있어요.");return;}
  if(op.equals("catalog")){connect(p,id);return;}
  if(op.equals("buy")){buy(p,id,key);return;}
  if(op.equals("restore")){restore(p,id);return;}
  if(op.equals("verify")){verify(p,id,key);return;}
  result(p,id,false,null,"지원하지 않는 결제 요청이에요.");
 });}
 private void connect(String p,String id){
  if(client.isReady()){catalog(p,id);return;}if(connecting){result(p,id,false,null,"Play 연결 중이에요. 잠시 후 다시 시도해 주세요.");return;}
  connecting=true;client.startConnection(new BillingClientStateListener(){
   @Override public void onBillingSetupFinished(BillingResult r){connecting=false;if(!trusted(p))return;if(r.getResponseCode()!=BillingClient.BillingResponseCode.OK){result(p,id,false,null,"Google Play에서 설치한 앱과 결제 가능한 계정을 확인해 주세요.");return;}catalog(p,id);}
   @Override public void onBillingServiceDisconnected(){serverReady=false;}
  });
 }
 private void catalog(String p,String id){
  final String uid=user().getUid();List<QueryProductDetailsParams.Product> list=new ArrayList<>();
  for(String sku:skus.values())list.add(QueryProductDetailsParams.Product.newBuilder().setProductId(sku).setProductType(BillingClient.ProductType.INAPP).build());
  client.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(list).build(),(r,details)->main.post(()->{
   if(!same(p,uid))return;products.clear();JSONObject prices=new JSONObject();
   if(r.getResponseCode()==BillingClient.BillingResponseCode.OK)for(ProductDetails d:details.getProductDetailsList()){
    for(Map.Entry<String,String> e:skus.entrySet())if(e.getValue().equals(d.getProductId())&&offer(d)!=null){products.put(e.getKey(),d);try{prices.put(e.getKey(),offer(d).getFormattedPrice());}catch(Exception ignored){}}
   }
   functions.getHttpsCallable("gameBilling").call(Collections.singletonMap("op","status")).addOnCompleteListener(t->{
    if(!same(p,uid))return;boolean ready=t.isSuccessful()&&t.getResult().getData() instanceof Map&&Boolean.TRUE.equals(((Map<?,?>)t.getResult().getData()).get("ready"));serverReady=ready;
    try{JSONObject data=new JSONObject().put("ready",ready).put("prices",prices);result(p,id,true,data,ready?"":"영수증 검증 서버 연결이 필요해요.");}catch(Exception ignored){}
    if(ready)queryOwned(p);
   });
  }));
 }
 private ProductDetails.OneTimePurchaseOfferDetails offer(ProductDetails d){List<ProductDetails.OneTimePurchaseOfferDetails> offers=d.getOneTimePurchaseOfferDetailsList();return offers==null||offers.isEmpty()?null:offers.get(0);}
 private boolean same(String p,String uid){return trusted(p)&&user()!=null&&user().getUid().equals(uid);}
 private String accountHash(String uid){try{byte[] d=MessageDigest.getInstance("SHA-256").digest(("baedalwang:"+uid).getBytes(StandardCharsets.UTF_8));StringBuilder s=new StringBuilder();for(byte b:d)s.append(String.format(java.util.Locale.ROOT,"%02x",b&255));return s.toString();}catch(Exception e){throw new IllegalStateException(e);}}
 private void buy(String p,String id,String key){
  if(!serverReady||!client.isReady()||!products.containsKey(key)){result(p,id,false,null,"상품 또는 결제 서버가 아직 준비되지 않았어요.");return;}
  Object owner=new Object();if(!gate.acquire(owner)){result(p,id,false,null,"다른 광고나 결제를 진행 중이에요.");return;}
  ProductDetails d=products.get(key);ProductDetails.OneTimePurchaseOfferDetails offer=offer(d);if(offer==null){gate.release(owner,android.os.SystemClock.elapsedRealtime());result(p,id,false,null,"상품 가격을 다시 확인해 주세요.");return;}
  flowUid=user().getUid();flowOwner=owner;
  BillingFlowParams.ProductDetailsParams item=BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(d).setOfferToken(offer.getOfferToken()).build();
  BillingResult r=client.launchBillingFlow(activity,BillingFlowParams.newBuilder().setProductDetailsParamsList(Collections.singletonList(item)).setObfuscatedAccountId(accountHash(flowUid)).build());
  if(r.getResponseCode()!=BillingClient.BillingResponseCode.OK){releaseFlow();result(p,id,false,null,"결제 화면을 열지 못했어요. 상품 정보를 새로고침해 주세요.");return;}
  try{result(p,id,true,new JSONObject().put("status","launched"),"");}catch(Exception ignored){}
 }
 private void releaseFlow(){if(flowOwner!=null)gate.release(flowOwner,android.os.SystemClock.elapsedRealtime());flowOwner=null;}
 @Override public void onPurchasesUpdated(BillingResult r,List<Purchase> purchases){main.post(()->{
  releaseFlow();if(destroyed)return;
  if(r.getResponseCode()==BillingClient.BillingResponseCode.USER_CANCELED){notice("결제를 취소했어요. 지급된 상품은 없어요.");return;}
  if(r.getResponseCode()==BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED){queryOwned(page);return;}
  if(r.getResponseCode()!=BillingClient.BillingResponseCode.OK){notice("결제를 완료하지 못했어요. 구매 복원에서 다시 확인할 수 있어요.");return;}
  if(purchases!=null)for(Purchase purchase:purchases)enqueue(page,purchase);
 });}
 private void enqueue(String p,Purchase purchase){
  if(!trusted(p)||user()==null)return;
  if(purchase.getPurchaseState()==Purchase.PurchaseState.PENDING){notice("결제 대기 중이에요. 완료 전에는 상품을 지급하지 않아요.");return;}
  if(purchase.getPurchaseState()!=Purchase.PurchaseState.PURCHASED||purchase.getProducts().size()!=1)return;
  if(purchase.getAccountIdentifiers()==null||!accountHash(user().getUid()).equals(purchase.getAccountIdentifiers().getObfuscatedAccountId())){notice("이 구매와 게임 로그인 계정이 달라요.");return;}
  String sku=purchase.getProducts().get(0),key=null;for(Map.Entry<String,String> e:skus.entrySet())if(e.getValue().equals(sku))key=e.getKey();if(key==null)return;
  if(processedTokens.contains(purchase.getPurchaseToken()))return;for(Purchase queued:queue.values())if(queued.getPurchaseToken().equals(purchase.getPurchaseToken()))return;
  String q=UUID.randomUUID().toString();queue.put(q,purchase);web.evaluateJavascript("window.__ssokBillingPurchase&&window.__ssokBillingPurchase("+JSONObject.quote(p)+","+JSONObject.quote(q)+","+JSONObject.quote(key)+")",null);
 }
 private void queryOwned(String p){if(!trusted(p)||!client.isReady())return;client.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),(r,list)->main.post(()->{if(r.getResponseCode()==BillingClient.BillingResponseCode.OK)for(Purchase purchase:list)enqueue(p,purchase);}));}
 private void verify(String p,String id,String q){
  Purchase purchase=queue.get(q);if(purchase==null){result(p,id,false,null,"복원할 구매를 다시 조회해 주세요.");return;}
  String uid=user().getUid(),sku=purchase.getProducts().get(0),key=null;for(Map.Entry<String,String> e:skus.entrySet())if(e.getValue().equals(sku))key=e.getKey();
  Map<String,Object> data=new HashMap<>();data.put("op","verify");data.put("key",key);data.put("token",purchase.getPurchaseToken());data.put("offset",java.util.TimeZone.getDefault().getOffset(System.currentTimeMillis())/60000);
  functions.getHttpsCallable("gameBilling").call(data).addOnCompleteListener(t->{if(!same(p,uid))return;
   if(!t.isSuccessful()){queue.remove(q);result(p,id,false,null,"구매 확인을 마치지 못했어요. 상품을 다시 사지 말고 구매 복원을 눌러 주세요.");return;}
   Object raw=t.getResult().getData();if(!(raw instanceof Map)||!"delivered".equals(((Map<?,?>)raw).get("status"))){queue.remove(q);result(p,id,false,null,"구매 확인 서버가 준비되지 않았어요.");return;}
   if(!Boolean.TRUE.equals(((Map<?,?>)raw).get("settlementPending")))processedTokens.add(purchase.getPurchaseToken());queue.remove(q);try{result(p,id,true,new JSONObject().put("status","delivered"),"");}catch(Exception ignored){}
  });
 }
 private void restore(String p,String id){
  if(!serverReady){result(p,id,false,null,"상품 정보를 먼저 새로고침해 주세요.");return;}
  String uid=user().getUid();functions.getHttpsCallable("gameBilling").call(Collections.singletonMap("op","restore")).addOnCompleteListener(t->{if(!same(p,uid))return;
   if(!t.isSuccessful()){result(p,id,false,null,"복원 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");return;}
   Object raw=t.getResult().getData();if(!(raw instanceof Map)||!"restored".equals(((Map<?,?>)raw).get("status"))){result(p,id,false,null,"복원 서버가 아직 준비되지 않았어요.");return;}
   queryOwned(p);try{result(p,id,true,new JSONObject().put("status","restored"),"");}catch(Exception ignored){}
  });
 }
 private void result(String p,String id,boolean ok,JSONObject data,String message){if(trusted(p))web.evaluateJavascript("window.__ssokBillingResult&&window.__ssokBillingResult("+JSONObject.quote(p)+","+JSONObject.quote(id)+","+ok+","+(data==null?"null":data.toString())+","+JSONObject.quote(message)+")",null);}
 private void notice(String message){if(trusted(page))web.evaluateJavascript("typeof toast==='function'&&toast("+JSONObject.quote(message)+")",null);}
 void resume(){if(BuildConfig.PLAY_BILLING_ENABLED&&serverReady&&user()!=null)queryOwned(page);}
 void destroy(){destroyed=true;releaseFlow();client.endConnection();main.removeCallbacksAndMessages(null);web.removeJavascriptInterface("SsokBilling");queue.clear();}
}
