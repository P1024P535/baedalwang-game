package com.ssokcompany.baedalwang;
import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.os.SystemClock;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import org.junit.Test;
import org.junit.After;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

@RunWith(AndroidJUnit4.class)
public class GameSmokeTest {
 private final Instrumentation ins=InstrumentationRegistry.getInstrumentation();
 private Activity activity;
 private WebView web;
 private WebView find(View v){if(v instanceof WebView)return (WebView)v;if(v instanceof ViewGroup){ViewGroup g=(ViewGroup)v;for(int i=0;i<g.getChildCount();i++){WebView w=find(g.getChildAt(i));if(w!=null)return w;}}return null;}
 private String js(String source)throws Exception{
  CountDownLatch latch=new CountDownLatch(1);String[] value=new String[1];
  ins.runOnMainSync(()->web.evaluateJavascript(source,v->{value[0]=v;latch.countDown();}));
  assertTrue("JS callback timed out",latch.await(20,TimeUnit.SECONDS));return value[0];
 }
 private void launch()throws Exception{
  Intent i=new Intent(Intent.ACTION_MAIN);i.setClassName("com.ssokcompany.baedalwang","com.ssokcompany.baedalwang.MainActivity");i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
  activity=ins.startActivitySync(i);ins.runOnMainSync(()->web=find(activity.getWindow().getDecorView()));assertNotNull(web);
  boolean ready=false;for(int n=0;n<60;n++){if("true".equals(js("typeof S==='object' && typeof doTap==='function' && document.getElementById('cv').width>0"))){ready=true;break;}SystemClock.sleep(500);}
  assertTrue("Game bootstrap failed",ready);SystemClock.sleep(10000);
 }
 private void closeModals()throws Exception{js("mq.length=0;mOpen=false;document.getElementById('modal').classList.remove('show');true");}
 @After public void done(){if(activity!=null)ins.runOnMainSync(()->activity.finish());}
 @Test public void testSeedCompatibleSave()throws Exception{
  launch();assertEquals("true",js("S.nick='QA_COMPAT_495';S.money=123456;S.region=2;S.veh=3;S.fame=77;S.fu.tap=2;S.jobs[0]=7;S.ver=2;save();JSON.parse(localStorage.getItem('baedal_king_v1')).nick==='QA_COMPAT_495'"));
 }
 @Test public void testCompatibleUpgrade()throws Exception{
  launch();assertEquals("true",js("S.nick==='QA_COMPAT_495' && S.money>=123456 && S.region===2 && S.veh===3 && S.fame>=77 && S.fu.tap===2 && S.jobs[0]===7 && S.ver===2"));
 }
 @Test public void testGameplayAndSave()throws Exception{
  launch();closeModals();
  assertEquals("Bundled fonts must load, not fallback", "true", js("Array.from(document.fonts).length===2 && Array.from(document.fonts).every(f=>f.status==='loaded')"));
  assertEquals("true",js("Array.isArray(V)&&V.length>1&&R.length>1&&J.length>1&&C.length>0&&Number.isFinite(ips())"));
  assertEquals("true",js("(()=>{const m=S.money,t=S.taps;doTap(100,300);return S.money>m&&S.taps===t+1})()"));
  assertEquals("true",js("(()=>{S.money=1e9;buyN=1;const n=S.jobs[0];onAct({dataset:{act:'job',i:'0'}});return S.jobs[0]===n+1&&Number.isFinite(ips())})()"));
  closeModals();assertEquals("true",js("(()=>{S.money=1e9;S.veh=0;onAct({dataset:{act:'veh',i:'0'}});return S.veh===1})()"));
  closeModals();assertEquals("true",js("(()=>{S.fame=100000;const n=S.fu.tap;onAct({dataset:{act:'fame',k:'tap'}});return S.fu.tap===n+1})()"));
  closeModals();assertEquals("true",js("(()=>{S.region=0;S.run=R[0][2];const f=S.fame;doPrestige();document.querySelector('#mbox [data-mb=\"1\"]').click();return S.region===1&&S.fame>f})()"));
  closeModals();assertEquals("true",js("(()=>{S.region=R.length-1;S.run=R[S.region][2];const c=S.clears;doPrestige();document.querySelector('#mbox [data-mb=\"1\"]').click();return S.region===0&&S.clears===c+1})()"));
  closeModals();assertEquals("true",js("ensureAC();!!AC && typeof AC.createOscillator==='function'"));
  assertEquals("true",js("S.nick='QA_RESTART_495';save();JSON.parse(localStorage.getItem('baedal_king_v1')).nick==='QA_RESTART_495'"));
  ins.runOnMainSync(()->activity.finish());activity=null;SystemClock.sleep(1000);launch();assertEquals("true",js("S.nick==='QA_RESTART_495'"));
  ins.runOnMainSync(()->activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE));SystemClock.sleep(2000);
  assertEquals("true",js("document.getElementById('cv').width>0 && document.getElementById('cv').height>0 && document.documentElement.scrollWidth<=window.innerWidth+2"));
  ins.runOnMainSync(()->activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT));SystemClock.sleep(2000);
  assertEquals("true",js("document.getElementById('cv').width>0 && document.documentElement.scrollWidth<=window.innerWidth+2"));
 }
}
