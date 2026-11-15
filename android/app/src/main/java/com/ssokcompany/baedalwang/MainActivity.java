package com.ssokcompany.baedalwang;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.graphics.Color;
import android.view.View;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import android.webkit.*;
import android.util.Log;

public class MainActivity extends Activity {
 public WebView web;
 private RewardAds rewardAds;
 private DisplayAds displayAds;
 FrameLayout bannerSlot;
 private GameAccounts accounts;
 private GameBilling billing;
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  FrameLayout root = new FrameLayout(this);
  root.setBackgroundColor(Color.rgb(21,37,29));
  web = new WebView(this);
  android.widget.LinearLayout column=new android.widget.LinearLayout(this);
  column.setOrientation(android.widget.LinearLayout.VERTICAL);
  root.addView(column,new FrameLayout.LayoutParams(-1,-1));
  column.addView(web,new android.widget.LinearLayout.LayoutParams(-1,0,1));
  bannerSlot=new FrameLayout(this);bannerSlot.setPadding(0,(int)(4*getResources().getDisplayMetrics().density),0,0);bannerSlot.setId(View.generateViewId());bannerSlot.setContentDescription("광고 영역");
  column.addView(bannerSlot,new android.widget.LinearLayout.LayoutParams(-1,-2));
  android.widget.Button privacy = new android.widget.Button(this);
  privacy.setText("광고 개인정보"); privacy.setTextSize(11);
  FrameLayout.LayoutParams privacyParams=new FrameLayout.LayoutParams(-2,-2,android.view.Gravity.BOTTOM|android.view.Gravity.END);
  root.addView(privacy,privacyParams);
  AdGate adGate=new AdGate();
  rewardAds=new RewardAds(this,web,privacy,adGate);
  displayAds=new DisplayAds(this,web,bannerSlot,adGate);
  accounts=new GameAccounts(this,web);
  billing=new GameBilling(this,web,adGate);
  setContentView(root);
  if (android.os.Build.VERSION.SDK_INT >= 30) {
   getWindow().setDecorFitsSystemWindows(false);
   root.setOnApplyWindowInsetsListener((view, insets) -> {
    android.graphics.Insets p = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
    view.setPadding(p.left,p.top,p.right,p.bottom);
    return insets;
   });
   root.requestApplyInsets();
  } else root.setFitsSystemWindows(true);
  WebSettings s = web.getSettings();
  s.setJavaScriptEnabled(true);
  s.setDomStorageEnabled(true);
  s.setAllowFileAccess(true);
  // Only packaged, trusted local content is loaded. Keep remote universal access disabled.
  s.setAllowFileAccessFromFileURLs(true);
  s.setAllowUniversalAccessFromFileURLs(false);
  s.setAllowContentAccess(false);
  s.setTextZoom(100);
  s.setMediaPlaybackRequiresUserGesture(false);
  s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.setBackgroundColor(Color.rgb(21,37,29));
  web.setOverScrollMode(View.OVER_SCROLL_NEVER);
  web.setWebViewClient(new WebViewClient() {
   @Override public void onPageStarted(WebView view,String url,android.graphics.Bitmap icon) { rewardAds.pageStarted(); displayAds.pageStarted(); accounts.pageStarted(); billing.pageStarted(); }
   @Override public void onPageFinished(WebView view,String url) { LayoutUi.attach(view); accounts.attach(); rewardAds.attach(); displayAds.attach(); billing.attach(); }
   @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
    Uri uri=request.getUrl();
    if ("file".equals(uri.getScheme()) && uri.toString().startsWith("file:///android_asset/")) return false;
    if (request.isForMainFrame() && ("https".equals(uri.getScheme()) || "mailto".equals(uri.getScheme()))) {
     try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch(Exception ex) { Log.w("Baedalwang", "No handler for link"); }
    }
    return true;
   }
   @Override public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
    Log.e("Baedalwang", "WEB_RESOURCE_ERROR " + r.getUrl() + " " + e.getDescription());
   }
  });
  web.setWebChromeClient(new WebChromeClient() {
   @Override public boolean onConsoleMessage(ConsoleMessage m) {
    if(m.messageLevel()==ConsoleMessage.MessageLevel.ERROR) Log.e("Baedalwang", "JS_ERROR " + m.message()+" @"+m.lineNumber());
    return true;
   }
  });
  // Same file URL and WebView data directory as the prior Claude APK.
  // No cache/data clearing, data-directory suffix, game file rewrites. Ads are connected through a separate native adapter.
  web.loadUrl("file:///android_asset/index.html");
 }
 @Override protected void onPause() {
  if(web!=null) web.evaluateJavascript("try { if(typeof save==='function') save(); } catch(e) {}",null);
  if(displayAds!=null)displayAds.pause();
  super.onPause();
 }
 @Override public void onConfigurationChanged(android.content.res.Configuration c){super.onConfigurationChanged(c);if(displayAds!=null)displayAds.resize();}
 @Override protected void onResume(){super.onResume();if(displayAds!=null)displayAds.resume();if(billing!=null)billing.resume();}
 @Override public void onBackPressed() {
  if(web!=null && web.canGoBack()) web.goBack(); else super.onBackPressed();
 }
 @Override protected void onDestroy() {
  if(billing!=null)billing.destroy();
  if(displayAds!=null)displayAds.destroy();
  if(accounts!=null)accounts.destroy();
  if(rewardAds!=null)rewardAds.destroy();
  if(web!=null) { web.removeAllViews(); web.destroy(); web=null; }
  super.onDestroy();
 }
}
