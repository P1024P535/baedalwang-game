package com.ssokcompany.baedalwang;

import android.app.Activity;
import android.os.CancellationSignal;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.CustomCredential;
import androidx.credentials.ClearCredentialStateRequest;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.credentials.exceptions.ClearCredentialException;
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GoogleAuthProvider;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.Source;
import org.json.JSONObject;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executor;

/** Native account adapter; game assets, file origin and local saves remain unchanged. */
final class GameAccounts {
 private final Activity activity;
 private final WebView web;
 private final Handler main = new Handler(Looper.getMainLooper());
 private final Executor executor = command -> main.post(command);
 private final FirebaseAuth auth;
 private final FirebaseFirestore db;
 private final CredentialManager credentials;
 private String token = "";
 private final CloudSaveGuard guard = new CloudSaveGuard();
 private long lastSaved;
 private boolean destroyed, signingIn, saving, loading;
 private CancellationSignal signal;
 GameAccounts(Activity activity, WebView web) {
  this.activity=activity; this.web=web;
  FirebaseApp app;
  if (FirebaseApp.getApps(activity).isEmpty()) {
   app=FirebaseApp.initializeApp(activity, new FirebaseOptions.Builder()
    .setApplicationId("1:679371652571:android:f70e949bf09c405ec13bfe")
    .setApiKey("AIzaSyAleHa1RRd2VBD-wbsEnDgNMWsAMaPLgsM")
    .setProjectId("baedalwang-game").setGcmSenderId("679371652571").build());
  } else app=FirebaseApp.getInstance();
  auth=FirebaseAuth.getInstance(app); db=FirebaseFirestore.getInstance(app);
  credentials=CredentialManager.create(activity);
  web.addJavascriptInterface(this,"SsokAccounts");
 }
 void pageStarted() {
  token=UUID.randomUUID().toString(); guard.reset(); lastSaved=0;
  if(signal!=null)signal.cancel();
 }
 void attach() {
  if(destroyed || !trusted())return;
  try(InputStream in=activity.getResources().openRawResource(R.raw.account_bridge)) {
   java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream(); byte[] b=new byte[4096]; int n;
   while((n=in.read(b))!=-1)out.write(b,0,n);
   web.evaluateJavascript(new String(out.toByteArray(),StandardCharsets.UTF_8).replace("__PAGE_TOKEN__",token), result -> {
    if(!"true".equals(result))android.util.Log.e("Baedalwang","ACCOUNT_BRIDGE_BIND_FAILED");
   });
  } catch(Exception e) { android.util.Log.e("Baedalwang","ACCOUNT_BRIDGE_BIND_FAILED"); }
 }
 private boolean trusted(){return "file:///android_asset/index.html".equals(web.getUrl());}
 private boolean valid(String t){return !destroyed && trusted() && token.equals(t) && !activity.isFinishing();}
 private JSONObject user() throws Exception {
  FirebaseUser u=auth.getCurrentUser(); if(u==null || u.isAnonymous())return null;
  return new JSONObject().put("provider","google").put("id",u.getUid()).put("email",u.getEmail()==null?"":u.getEmail());
 }
 private void result(String t,String id,boolean ok,Object data,String message){
  if(!valid(t))return;
  web.evaluateJavascript("window.__ssokAccountResult&&window.__ssokAccountResult("+JSONObject.quote(t)+","+JSONObject.quote(id)+","+ok+","+(data==null?"null":data.toString())+","+JSONObject.quote(message)+")",null);
 }
 private void error(String t,String id,String message){result(t,id,false,null,message);}
 @JavascriptInterface public void request(String t,String id,String op,String json) {
  if(id==null || !id.matches("[0-9]{1,10}") || json==null || json.length()>600000)return;
  main.post(() -> {
   if(!valid(t))return;
   try {
    JSONObject data=new JSONObject(json);
    switch(op) {
     case "current": result(t,id,true,user(),""); break;
     case "signIn": signIn(t,id); break;
     case "signOut": signOut(t,id); break;
     case "load": load(t,id); break;
     case "save": save(t,id,data); break;
     case "delete": delete(t,id); break;
     default: error(t,id,"지원하지 않는 요청이에요.");
    }
   } catch(Exception e) { error(t,id,"계정 연결을 확인해 주세요."); }
  });
 }
 private void signIn(String t,String id) {
  if(signingIn || saving || loading){error(t,id,"계정 작업이 이미 진행 중이에요. 잠시 후 다시 시도해 주세요.");return;}
  signingIn=true; guard.reset(); signal=new CancellationSignal();
  GetSignInWithGoogleOption option=new GetSignInWithGoogleOption.Builder("679371652571-cjugeif926p2gi265jedc32kjb8ovrkv.apps.googleusercontent.com").build();
  GetCredentialRequest req=new GetCredentialRequest.Builder().addCredentialOption(option).build();
  credentials.getCredentialAsync(activity,req,signal,executor,new CredentialManagerCallback<GetCredentialResponse,GetCredentialException>() {
   @Override public void onResult(GetCredentialResponse response) {
    if(!valid(t)){signingIn=false;return;}
    try {
     if(!(response.getCredential() instanceof CustomCredential))throw new IllegalArgumentException();
     CustomCredential c=(CustomCredential)response.getCredential();
     if(!GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(c.getType()))throw new IllegalArgumentException();
     String idToken=GoogleIdTokenCredential.createFrom(c.getData()).getIdToken();
     auth.signInWithCredential(GoogleAuthProvider.getCredential(idToken,null)).addOnCompleteListener(task -> {
      signingIn=false; if(!valid(t))return;
      try {if(task.isSuccessful())result(t,id,true,user(),"");else error(t,id,"Google 로그인에 실패했어요. 다시 시도해 주세요.");}
      catch(Exception e){error(t,id,"Google 로그인에 실패했어요.");}
     });
    } catch(Exception e){signingIn=false;error(t,id,"Google 계정을 확인하지 못했어요.");}
   }
   @Override public void onError(GetCredentialException e){signingIn=false;error(t,id,"로그인을 완료하지 못했어요. 계정을 선택해 다시 시도해 주세요.");}
  });
 }
 private void signOut(String t,String id) {
  if(signingIn || saving || loading){error(t,id,"계정 작업이 끝난 뒤 다시 시도해 주세요.");return;}
  guard.reset(); auth.signOut();
  credentials.clearCredentialStateAsync(new ClearCredentialStateRequest(),null,executor,new CredentialManagerCallback<Void,ClearCredentialException>() {
   @Override public void onResult(Void v){result(t,id,true,null,"");}
   @Override public void onError(ClearCredentialException e){result(t,id,true,null,"");}
  });
 }
 private DocumentReference doc(FirebaseUser u){return db.collection("users").document(u.getUid());}
 private boolean sameUser(FirebaseUser u){return auth.getCurrentUser()!=null && auth.getCurrentUser().getUid().equals(u.getUid());}
 private void load(String t,String id) {
  if(loading || saving || signingIn){error(t,id,"계정 작업이 끝난 뒤 다시 시도해 주세요.");return;}
  FirebaseUser u=auth.getCurrentUser(); guard.reset();
  if(u==null || u.isAnonymous()){error(t,id,"");return;}
  loading=true;
  doc(u).get(Source.SERVER).addOnSuccessListener(snap -> {
   loading=false;
   if(!valid(t) || !sameUser(u))return;
   try {
    JSONObject remote=null;
    if(snap.exists()) {String raw=snap.getString("save"); remote=new JSONObject(raw); if(remote.optInt("ver")!=2)throw new IllegalArgumentException();}
    guard.loaded(u.getUid(),snap.contains("rev")?snap.getLong("rev"):0);
    result(t,id,true,remote,"");
   } catch(Exception e){error(t,id,"저장된 기록을 확인하지 못해 클라우드 덮어쓰기를 중지했어요.");}
  }).addOnFailureListener(e -> {loading=false;error(t,id,"클라우드 기록을 읽지 못했어요. 기기 기록은 유지돼요. 인터넷 연결 후 다시 로그인해 주세요.");});
 }
 private void save(String t,String id,JSONObject data) throws Exception {
  FirebaseUser u=auth.getCurrentUser(); JSONObject s=data.getJSONObject("save"), acct=s.optJSONObject("acct");
  if(u==null || !guard.loadedFor(u.getUid()) || acct==null || !u.getUid().equals(acct.optString("id")) || !"google".equals(acct.optString("type"))) {error(t,id,"");return;}
  String raw=s.toString();
  if(!guard.permits(u.getUid(),acct.optString("id"),s.optInt("ver"),raw.getBytes(StandardCharsets.UTF_8).length,s.optDouble("total"))) {error(t,id,"저장할 기록을 확인하지 못했어요.");return;}
  if(saving || (!data.optBoolean("force") && System.currentTimeMillis()-lastSaved<60000)){result(t,id,true,null,"");return;}
  saving=true; final long expected=guard.revision(); final DocumentReference ref=doc(u);
  db.runTransaction(tx -> {
   DocumentSnapshot remote=tx.get(ref); long actual=remote.exists()&&remote.contains("rev")?remote.getLong("rev"):0;
   if(actual!=expected)throw new IllegalStateException("save-conflict");
   Map<String,Object> value=new HashMap<>();value.put("save",raw);value.put("total",s.optDouble("total"));value.put("ver","1.0.3");value.put("rev",expected+1);value.put("updated",FieldValue.serverTimestamp());
   tx.set(ref,value);return expected+1;
  }).addOnSuccessListener(next -> {saving=false;if(valid(t)&&sameUser(u)){guard.saved(expected,next);lastSaved=System.currentTimeMillis();result(t,id,true,null,"");}})
   .addOnFailureListener(e -> {saving=false;if(valid(t)){guard.reset();error(t,id,"클라우드 저장을 중지했어요. 기기 기록은 유지돼요. 다시 로그인해 기록을 확인해 주세요.");}});
 }
 private void delete(String t,String id) {
  FirebaseUser u=auth.getCurrentUser();
  if(u==null || signingIn || saving || loading){error(t,id,"계정을 확인한 뒤 다시 시도해 주세요.");return;}
  // The existing game requires two explicit confirmations before this method is invoked.
  // Require a recent sign-in before touching cloud data.
  long signedAt=u.getMetadata()==null?0:u.getMetadata().getLastSignInTimestamp();
  if(System.currentTimeMillis()-signedAt>120000){error(t,id,"안전한 탈퇴를 위해 로그아웃 후 다시 로그인해 주세요.");return;}
  guard.reset();
  doc(u).delete().continueWithTask(task -> {if(!task.isSuccessful())throw task.getException();return u.delete();})
   .addOnSuccessListener(v -> result(t,id,true,null,""))
   .addOnFailureListener(e -> error(t,id,"탈퇴를 완료하지 못했어요. 다시 로그인 후 시도해 주세요."));
 }
 void destroy(){destroyed=true;if(signal!=null)signal.cancel();web.removeJavascriptInterface("SsokAccounts");}
}
