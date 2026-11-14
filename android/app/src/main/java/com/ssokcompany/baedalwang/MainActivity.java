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
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  FrameLayout root = new FrameLayout(this);
  root.setBackgroundColor(Color.rgb(21,37,29));
  web = new WebView(this);
  root.addView(web, new FrameLayout.LayoutParams(-1,-1));
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
  // No cache/data clearing, data-directory suffix, game injection, or game rewrites.
  web.loadUrl("file:///android_asset/index.html");
 }
 @Override protected void onPause() {
  if(web!=null) web.evaluateJavascript("try { if(typeof save==='function') save(); } catch(e) {}",null);
  super.onPause();
 }
 @Override public void onBackPressed() {
  if(web!=null && web.canGoBack()) web.goBack(); else super.onBackPressed();
 }
 @Override protected void onDestroy() {
  if(web!=null) { web.removeAllViews(); web.destroy(); web=null; }
  super.onDestroy();
 }
}
