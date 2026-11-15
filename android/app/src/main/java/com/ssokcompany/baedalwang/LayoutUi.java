package com.ssokcompany.baedalwang;

import android.webkit.WebView;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

/** Presentation layer only: keeps all 495 original files byte-identical. */
final class LayoutUi {
 static void attach(WebView web) {
  if (!"file:///android_asset/index.html".equals(web.getUrl())) return;
  try {
   String css=read(web,R.raw.layout), script=read(web,R.raw.layout_bridge);
   web.evaluateJavascript("(function(){document.documentElement.classList.add('native-safe-layout');if(!document.getElementById('ssok-layout-style')){var s=document.createElement('style');s.id='ssok-layout-style';s.textContent="+JSONObject.quote(css)+";document.head.appendChild(s);}return true;})()",null);
   web.evaluateJavascript(script,result->{if(!"true".equals(result))android.util.Log.e("Baedalwang","LAYOUT_BIND_FAILED");});
  } catch(Exception e) { android.util.Log.e("Baedalwang","LAYOUT_BIND_FAILED"); }
 }
 private static String read(WebView web,int id)throws Exception {
  try(InputStream in=web.getResources().openRawResource(id)) {
   ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[4096];int n;
   while((n=in.read(b))!=-1)out.write(b,0,n);
   return new String(out.toByteArray(),StandardCharsets.UTF_8);
  }
 }
}
