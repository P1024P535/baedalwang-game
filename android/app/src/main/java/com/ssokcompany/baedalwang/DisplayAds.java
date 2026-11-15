package com.ssokcompany.baedalwang;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;
import com.google.android.gms.ads.*;
import com.google.android.gms.ads.interstitial.*;
import com.google.android.gms.ads.appopen.AppOpenAd;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.io.InputStream;
import java.util.UUID;

/** New placements are test-only until their production units/consent rollout are configured. */
final class DisplayAds {
 private final Activity activity;
 private final WebView web;
 private final FrameLayout slot;
 private final AdGate gate;
 private final Handler main=new Handler(Looper.getMainLooper());
 private final long born=SystemClock.elapsedRealtime();
 private String token="";
 private boolean destroyed,foreground=true,enabled,premium,force,playing,sdkReady,initializing;
 private boolean loadingInterstitial,loadingOpen;
 private AdView banner;
 private InterstitialAd interstitial;
 private AppOpenAd openAd;
 private long interstitialAt,openAt;
 private Object showing;
 
 private int automaticCount;
 private boolean opened;
 DisplayAds(Activity activity,WebView web,FrameLayout slot,AdGate gate){
  this.activity=activity;this.web=web;this.slot=slot;this.gate=gate;
  slot.setVisibility(View.GONE);web.addJavascriptInterface(this,"SsokDisplayAds");
 }
 private boolean trusted(){return !destroyed&&"file:///android_asset/index.html".equals(web.getUrl());}
 void pageStarted(){token=UUID.randomUUID().toString();playing=false;clearBanner();}
 void attach(){
  if(!trusted())return;
  try(InputStream in=activity.getResources().openRawResource(R.raw.display_bridge)){
   java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream();byte[] b=new byte[4096];int n;
   while((n=in.read(b))!=-1)out.write(b,0,n);
   String script=new String(out.toByteArray(),StandardCharsets.UTF_8).replace("__DISPLAY_TOKEN__",token).replace("__ADS_TEST_MODE__",String.valueOf(BuildConfig.ADS_TEST_MODE));
   web.evaluateJavascript(script,null);
  }catch(Exception e){android.util.Log.e("Baedalwang","DISPLAY_BRIDGE_FAILED",e);}
 }
 private boolean allowed(){return BuildConfig.ADS_TEST_MODE&&enabled&&(!premium||force);}
 @JavascriptInterface public void configure(String key,boolean enabled,boolean playing,boolean premium,boolean force){main.post(()->{
  if(!trusted()||!token.equals(key))return;
  this.enabled=enabled;this.playing=playing;this.premium=premium;this.force=BuildConfig.ADS_TEST_MODE&&force;
  if(!allowed()){clearBanner();return;}
  if(!playing)clearBanner();
  ensureSdk();if(sdkReady){loadFullScreens();if(playing)loadBanner();}
 });}
 private void ensureSdk(){
  if(sdkReady||initializing||!allowed())return;initializing=true;
  MobileAds.initialize(activity,state->main.post(()->{initializing=false;if(destroyed)return;sdkReady=true;if(allowed()){loadFullScreens();if(playing)loadBanner();}}));
 }
 private void status(String message){if(trusted())web.evaluateJavascript("window.__ssokDisplayStatus&&window.__ssokDisplayStatus("+JSONObject.quote(token)+","+JSONObject.quote(message)+")",null);}
 private void loadBanner(){
  if(banner!=null||!playing||!allowed()||!sdkReady)return;
  int width=(int)(web.getWidth()/activity.getResources().getDisplayMetrics().density);
  if(width<320)return;
  final AdView view=new AdView(activity);banner=view;
  view.setAdUnitId(BuildConfig.BANNER_AD_UNIT);
  view.setAdSize(AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(activity,width));
  slot.addView(view,new FrameLayout.LayoutParams(-2,-2,Gravity.CENTER));
  view.setAdListener(new AdListener(){
   @Override public void onAdLoaded(){if(banner==view&&allowed()&&playing){slot.setVisibility(View.VISIBLE);status("배너 테스트 광고 표시 중");}}
   @Override public void onAdFailedToLoad(LoadAdError error){if(banner==view){clearBanner();status("배너 준비 실패 ("+error.getCode()+") · 설정에서 다시 시도할 수 있어요");}}
  });
  status("배너 테스트 광고 준비 중");view.loadAd(new AdRequest.Builder().build());
 }
 private void clearBanner(){if(banner!=null){banner.destroy();banner=null;}slot.removeAllViews();slot.setVisibility(View.GONE);}
 private void loadFullScreens(){
  if(!allowed()||!sdkReady)return;
  if(interstitial==null&&!loadingInterstitial){loadingInterstitial=true;
   InterstitialAd.load(activity,BuildConfig.INTERSTITIAL_AD_UNIT,new AdRequest.Builder().build(),new InterstitialAdLoadCallback(){
    @Override public void onAdLoaded(InterstitialAd ad){loadingInterstitial=false;if(destroyed)return;interstitial=ad;interstitialAt=SystemClock.elapsedRealtime();status("전면 테스트 광고 준비됨");}
    @Override public void onAdFailedToLoad(LoadAdError error){loadingInterstitial=false;status("전면 준비 실패 ("+error.getCode()+")");}
   });
  }
  if(openAd==null&&!loadingOpen){loadingOpen=true;
   AppOpenAd.load(activity,BuildConfig.OPEN_AD_UNIT,new AdRequest.Builder().build(),new AppOpenAd.AppOpenAdLoadCallback(){
    @Override public void onAdLoaded(AppOpenAd ad){loadingOpen=false;if(destroyed)return;openAd=ad;openAt=SystemClock.elapsedRealtime();status("앱 시작 테스트 광고 준비됨");}
    @Override public void onAdFailedToLoad(LoadAdError error){loadingOpen=false;status("앱 시작 광고 준비 실패 ("+error.getCode()+")");}
   });
  }
 }
 @JavascriptInterface public void retry(String key){main.post(()->{if(!trusted()||!token.equals(key)||!allowed())return;clearBanner();if(playing)loadBanner();loadFullScreens();});}
 @JavascriptInterface public void show(String key,String id,String kind,boolean manual){main.post(()->{
  if(!trusted()||!token.equals(key)||id==null||!id.matches("[0-9]{1,10}"))return;
  if(!allowed()||!foreground||activity.isFinishing()||gate.busy()){result(key,id,false,"광고가 비활성화됐거나 다른 광고를 진행 중이에요");return;}
  long now=SystemClock.elapsedRealtime();
  if(!"open".equals(kind)&&!"interstitial".equals(kind)){result(key,id,false,"지원하지 않는 광고");return;}
  // Automatic open: one cold-start loading screen only. Interstitial: at most 2/session,
  // after 90s of play and 5 minutes since any other full-screen ad closed.
  if(!manual&&(("open".equals(kind)&&(opened||playing))||("interstitial".equals(kind)&&(!playing||automaticCount>=2||now-born<90000||!gate.cooled(now,300000))))){result(key,id,false,"");return;}
  if(manual&&!BuildConfig.ADS_TEST_MODE){result(key,id,false,"");return;}
  if("open".equals(kind)&&!manual)opened=true;
  final boolean isOpen="open".equals(kind);
  if(isOpen&&(openAd==null||now-openAt>4*3600000L)){openAd=null;loadFullScreens();result(key,id,false,"광고 준비 중 · 이번에는 바로 진행해요");return;}
  if(!isOpen&&(interstitial==null||now-interstitialAt>3600000L)){interstitial=null;loadFullScreens();result(key,id,false,"광고 준비 중 · 이번에는 바로 진행해요");return;}
  final Object owner=new Object();if(!gate.acquire(owner)){result(key,id,false,"");return;}
  showing=owner;
  FullScreenContentCallback callback=new FullScreenContentCallback(){
   @Override public void onAdShowedFullScreenContent(){if(!manual&&!isOpen)automaticCount++;status(isOpen?"앱 시작 테스트 광고 표시 중":"전면 테스트 광고 표시 중");}
   @Override public void onAdDismissedFullScreenContent(){complete(owner,key,id,true,"");}
   @Override public void onAdFailedToShowFullScreenContent(AdError e){complete(owner,key,id,false,"광고 표시 실패 · 그대로 진행해요");}
  };
  try{if(isOpen){AppOpenAd ad=openAd;openAd=null;ad.setFullScreenContentCallback(callback);ad.show(activity);}else{InterstitialAd ad=interstitial;interstitial=null;ad.setFullScreenContentCallback(callback);ad.show(activity);}}
  catch(Exception e){complete(owner,key,id,false,"광고 표시 실패 · 그대로 진행해요");}
 });}
 private void complete(Object owner,String key,String id,boolean shown,String message){
  gate.release(owner,SystemClock.elapsedRealtime());if(showing!=owner)return;showing=null;status(shown?"광고 닫힘 · 게임으로 복귀했어요":message);
  result(key,id,shown,message);if(allowed())loadFullScreens();
 }
 private void result(String key,String id,boolean shown,String message){if(trusted()&&token.equals(key))web.evaluateJavascript("window.__ssokDisplayResult&&window.__ssokDisplayResult("+JSONObject.quote(key)+","+JSONObject.quote(id)+","+shown+","+JSONObject.quote(message)+")",null);}
 void resize(){clearBanner();main.postDelayed(()->{if(!destroyed&&allowed()&&playing)loadBanner();},300);}
 void pause(){foreground=false;if(banner!=null)banner.pause();}
 void resume(){foreground=true;if(banner!=null)banner.resume();}
 void destroy(){destroyed=true;clearBanner();if(showing!=null)gate.release(showing,SystemClock.elapsedRealtime());main.removeCallbacksAndMessages(null);web.removeJavascriptInterface("SsokDisplayAds");interstitial=null;openAd=null;}
}
