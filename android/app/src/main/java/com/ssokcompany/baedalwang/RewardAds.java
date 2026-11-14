package com.ssokcompany.baedalwang;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Button;
import android.util.Log;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;
import org.json.JSONObject;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

final class RewardAds {
 private final Activity activity;
 private final WebView web;
 private final Button privacy;
 private final Handler main=new Handler(Looper.getMainLooper());
 private final ConsentInformation consent;
 private long page;
 private String token="";
 private RewardSession active;
 private boolean destroyed, sdkReady, initializing, showing, consentBusy;
 RewardAds(Activity activity, WebView web, Button privacy) {
  this.activity=activity; this.web=web; this.privacy=privacy;
  consent=UserMessagingPlatform.getConsentInformation(activity);
  web.addJavascriptInterface(this,"SsokRewardAds");
  privacy.setVisibility(View.GONE);
  privacy.setOnClickListener(v -> {
   if(destroyed || showing)return;
   UserMessagingPlatform.showPrivacyOptionsForm(activity,error -> updatePrivacy());
  });
 }
 void pageStarted() {
  page++; token=UUID.randomUUID().toString(); active=null;
  web.setVisibility(View.INVISIBLE);
 }
 void attach() {
  if(destroyed || !trustedPage())return;
  try(InputStream in=activity.getResources().openRawResource(R.raw.reward_bridge)) {
   java.io.ByteArrayOutputStream bytes=new java.io.ByteArrayOutputStream();
   byte[] buffer=new byte[4096]; int size;
   while((size=in.read(buffer))!=-1)bytes.write(buffer,0,size);
   String script=new String(bytes.toByteArray(),StandardCharsets.UTF_8).replace("__PAGE_TOKEN__",token);
   web.evaluateJavascript(script,result -> {
    if(destroyed)return;
    if(!"true".equals(result)) {
     Log.e("Baedalwang","AD_BRIDGE_BIND_FAILED");
     // Fail closed: never expose the original mock-ad timer in this Android build.
     new android.app.AlertDialog.Builder(activity).setMessage("광고 연결을 준비하지 못했어요. 앱을 다시 실행해 주세요.").setPositiveButton("닫기",(d,w)->activity.finish()).show();
     return;
    }
    web.setVisibility(View.VISIBLE);
   });
  } catch(Exception e) { Log.e("Baedalwang","AD_BRIDGE_BIND_FAILED",e); activity.finish(); }
 }
 private boolean trustedPage() { return "file:///android_asset/index.html".equals(web.getUrl()); }
 @JavascriptInterface public void show(String pageToken,String id) {
  if(id==null || !id.matches("[0-9]{1,10}"))return;
  main.post(() -> {
   if(destroyed || !trustedPage() || !token.equals(pageToken))return;
   RewardSession request=new RewardSession(id,page);
   if(active!=null || showing) { finish(request,false,"광고를 이미 진행 중이에요."); return; }
   active=request;
   if(BuildConfig.ADS_TEST_MODE) initialize(request);
   else requestConsent(request);
  });
 }
 private boolean valid(RewardSession request) {
  return !destroyed && !activity.isFinishing() && request==active && request.page==page && !request.isResolved();
 }
 private void requestConsent(RewardSession request) {
  if(consentBusy){finish(request,false,"개인정보 설정을 확인 중이에요.");active=null;return;}
  consentBusy=true;
  consent.requestConsentInfoUpdate(activity,new ConsentRequestParameters.Builder().build(),() -> {
   if(destroyed)return;
   UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity,error -> {
    consentBusy=false; updatePrivacy();
    if(!valid(request))return;
    if(consent.canRequestAds())initialize(request);
    else {finish(request,false,"광고 개인정보 설정을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.");active=null;}
   });
  },error -> {
   consentBusy=false; updatePrivacy();
   if(!valid(request))return;
   if(consent.canRequestAds())initialize(request);
   else {finish(request,false,"광고 개인정보 설정을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.");active=null;}
  });
 }
 private void updatePrivacy() {
  if(destroyed)return;
  privacy.setVisibility(consent.getPrivacyOptionsRequirementStatus()==ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED ? View.VISIBLE:View.GONE);
 }
 private void initialize(RewardSession request) {
  if(!valid(request))return;
  if(sdkReady){load(request);return;}
  if(initializing)return;
  initializing=true;
  MobileAds.initialize(activity,status -> main.post(() -> {
   initializing=false; sdkReady=true;
   if(valid(request))load(request);
  }));
 }
 private void load(RewardSession request) {
  if(!valid(request))return;
  Runnable timeout=() -> {
   if(valid(request) && !showing){finish(request,false,"광고 연결 시간이 초과됐어요. 다시 시도해 주세요.");active=null;}
  };
  main.postDelayed(timeout,30000);
  RewardedAd.load(activity,BuildConfig.REWARDED_AD_UNIT,new AdRequest.Builder().build(),new RewardedAdLoadCallback() {
   @Override public void onAdFailedToLoad(LoadAdError error) {
    main.removeCallbacks(timeout);
    if(!valid(request))return;
    Log.i("Baedalwang","AD_LOAD_FAILED code="+error.getCode());
    finish(request,false,"광고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."); active=null;
   }
   @Override public void onAdLoaded(RewardedAd ad) {
    main.removeCallbacks(timeout);
    if(!valid(request))return;
    showing=true;
    ad.setFullScreenContentCallback(new FullScreenContentCallback() {
     @Override public void onAdDismissedFullScreenContent() {
      showing=false;
      if(active!=request)return;
      finish(request,false,""); active=null;
     }
     @Override public void onAdFailedToShowFullScreenContent(AdError error) {
      showing=false;
      if(active!=request)return;
      finish(request,false,"광고를 표시하지 못했어요. 다시 시도해 주세요."); active=null;
     }
    });
    // Reward amount/type from AdMob are metadata. Original adThen() grants the game's reward.
    ad.show(activity,reward -> finish(request,true,""));
   }
  });
 }
 private void finish(RewardSession request,boolean earned,String message) {
  if(destroyed || request.page!=page || !trustedPage() || !request.resolve())return;
  web.evaluateJavascript("window.__ssokRewardResult && window.__ssokRewardResult("+JSONObject.quote(token)+","+JSONObject.quote(request.id)+","+earned+","+JSONObject.quote(message)+")",null);
 }
 void destroy() {
  destroyed=true; active=null; main.removeCallbacksAndMessages(null); web.removeJavascriptInterface("SsokRewardAds");
 }
}
