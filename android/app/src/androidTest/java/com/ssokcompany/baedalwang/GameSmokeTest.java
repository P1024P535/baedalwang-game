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
  // Geometry tests deliberately save enormous balances. Start gameplay checks
  // from their own fixture so floating-point precision cannot hide a small tap.
  assertEquals("Fresh isolated gameplay fixture", "true",js("document.getElementById('splash')?.remove();document.getElementById('gate')?.remove();S=fresh();S.ver=2;S.lang='ko';LANG='ko';S.snd=false;S.bgm=false;S.qd=qGen(0);applyScale();closeSheet();true"));
  assertEquals("Native account bridge attaches without modifying game", "true",js("window.__ssokAccountBridgeReady===true"));
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
 @Test public void testNativeAdsOfflineNoReward()throws Exception {
  launch(); closeModals();
  assertEquals("true",js("window.__ssokRewardBridgeReady===true"));
  assertEquals("true",js("window.__qaPaid=0;window.__qaAds=S.st.ads;window.__qaSettled=false;window.__qaLog=logEv;logEv=function(name,p){if(name==='ad_skip')window.__qaSettled=true;window.__qaLog(name,p)};adThen(()=>{window.__qaPaid++});true"));
  // The native failure callback should settle without granting anything. An offline game must never use the original mock timer.
  boolean settled=false;
  for(int n=0;n<180;n++) {
   if("true".equals(js("window.__qaPaid>0 || !window.__ssokRewardBridgeReady")))break;
   if("true".equals(js("window.__qaSettled===true"))){settled=true;break;}
   SystemClock.sleep(500);
  }
  assertEquals("No offline mock reward", "true",js("window.__qaPaid===0 && S.st.ads===window.__qaAds"));
  assertTrue("Native failure did not settle",settled);
 }

 @Test public void testImprovementRulesAndStory()throws Exception {
  launch();closeModals();
  assertEquals("true",js("document.getElementById('splash')?.remove();document.getElementById('gate')?.remove();S=fresh();S.lang='ko';LANG='ko';S.snd=false;S.bgm=false;S.qd=qGen(0);applyScale();true"));
  assertEquals("Premium must respect daily cap", "true",js("(()=>{S.noAds=true;S.adc={d:today(),w:0};let got=0;for(let n=0;n<10;n++)limitedAd('w',3,()=>got++);return got===3&&adLeft('w',3)===0})()"));
  assertEquals("Completed last ride counts before fallback", "true",js("S.mis={date:today(),p:{},done:[],all:false};S.veh=V.length-1;mis('veh');dailyMissions().find(m=>m[0]==='veh')[2]===1"));
  assertEquals("Impossible ride task has upgrade replacement", "true",js("S.mis={date:today(),p:{},done:[],all:false};dailyMissions();mis('job',20);S.mis.p.veh===20"));
  assertEquals("Mission claim only once", "true",js("(()=>{onAct({dataset:{act:'mis',k:'veh'}});const before=S.money;onAct({dataset:{act:'mis',k:'veh'}});return S.money===before&&S.mis.done.filter(k=>k==='veh').length===1})()"));
  assertEquals("Regional goals and story available", "true",js("S.region=5;applyScale();openSheet('region');R[5][2]===1.8225e19&&!!document.querySelector('.chapter')&&document.querySelectorAll('[data-act=chapter]').length===3"));
  assertEquals("Milestone cannot be claimed twice", "true",js("(()=>{S.run=R[S.region][2]*.25;onAct({dataset:{act:'chapter',p:'25'}});const before=S.money;onAct({dataset:{act:'chapter',p:'25'}});return S.money===before&&chapterState().claimed.length===1})()"));
  assertEquals("Expired boost pays only active interval", "true",js("(()=>{const now=Date.now();S.last=now-7200000;S.boostUntil=now-3600000;return Math.abs(offlineEarnings(now)-baseIps()*offRate()*10800)<1})()"));
  assertEquals("Menu preserves challenge deadline", "true",js("(()=>{boss={until:Date.now()+15000};tab='region';syncChallenges();const before=boss.until;challengeClock-=60000;syncChallenges();const ok=boss.until>=before+60000;boss=null;return ok})()"));
  assertEquals("Chapter survives save/reload format", "true",js("save();JSON.parse(localStorage.getItem('baedal_king_v1')).chapter.claimed[0]===25"));
  assertEquals("Cancelled roulette ad does not use an attempt", "true",js("(()=>{S.noAds=false;S.rl={d:today(),f:1,a:0};delete S.rlPending;rlBusy=false;window.__originalReward=PLATFORM.showRewardedAd;PLATFORM.showRewardedAd=cb=>window.__rouletteResult=cb;onAct({dataset:{act:'rl',v:'a'}});const before=rlDay().a;window.__rouletteResult(false,'광고 연결 실패');return before===0&&rlDay().a===0&&!S.rlPending&&document.getElementById('rewardStatus').dataset.phase==='error'})()"));
  assertEquals("Completed roulette ad charges and persists the selected prize once", "true",js("(()=>{onAct({dataset:{act:'rl',v:'a'}});window.__rouletteResult(true);window.__rouletteResult(true);return rlDay().a===1&&Number.isInteger(S.rlPending.idx)&&!!JSON.parse(localStorage.getItem('baedal_king_v1')).rlPending})()"));
  assertEquals("Recovered roulette prize cannot pay twice", "true",js("(()=>{const pending=S.rlPending,spins=S.st.spins||0;rlBusy=false;resumeRoulette();rlGive(pending.idx);rlGive(pending.idx);PLATFORM.showRewardedAd=window.__originalReward;rlBusy=false;return !S.rlPending&&S.st.spins===spins+1})()"));
  closeModals();
  assertEquals("Missed encounters never take saved money", "true",js("(()=>{S.money=1000;boss={};bossEnd(false);trouble={t:'flat'};troubleEnd(false);return S.money===1000})()"));
  assertEquals("Ads have a play-only daily alternative", "true",js("S.mis={date:today(),p:{},done:[],all:false};mis('tap',100);missionProgress('ad')>=2"));
  assertEquals("Later cycle target growth is bounded", "true",js("cycleScale(0)===1&&cycleScale(1)===2&&cycleScale(10)===64"));
  assertEquals("Collected career titles cannot pay twice", "true",js("(()=>{S.clears=2;applyScale();careerState();const before=S.fame;careerAction('career-award',{dataset:{id:'trusted'}});careerAction('career-award',{dataset:{id:'trusted'}});return S.fame===before+5&&S.career.badge==='trusted'})()"));
  assertEquals("Career contracts preserve progress across regional moves", "true",js("(()=>{const t=careerTasks().find(t=>t.key==='hire');S.st.hire+=t.target;careerAction('career-contract',{dataset:{id:'hire'}});const before=S.fame;S.region=3;applyScale();careerState();careerAction('career-contract',{dataset:{id:'hire'}});save();return S.fame===before&&JSON.parse(localStorage.getItem('baedal_king_v1')).career.run.done.includes('hire')})()"));
  assertEquals("Career board renders in the move screen", "true",js("closeSheet();openSheet('region');!!document.querySelector('.career-board')"));
 }
 @Test public void testResponsiveLayout()throws Exception {
  launch();closeModals();
  assertEquals("Presentation adapter is attached", "true",js("window.__ssokLayoutReady===true && !!document.getElementById('ssok-layout-style')"));
  assertEquals("Undecoded company image has a non-recursive fallback", "true",js("(()=>{const im=AS.co_1;try{AS.co_1=new Image();return coImg(0).includes('<svg')}finally{AS.co_1=im}})()"));
  // Real WebView geometry, not just a desktop CSS parser.
  assertEquals("Long amounts must fit the HUD", "true",js("S.money=1.23e60;S.fame=1234567890;S.lv=12345;hud();true"));
  SystemClock.sleep(600);
  assertEquals("true",js("['money','ips','fame','lvNum'].every(id=>{const e=document.getElementById(id);return e.scrollWidth<=e.clientWidth+2})"));
  assertEquals("true",js("S.acct={type:'google',id:'layout-test-id',email:'long-layout-test-address@example.invalid'};openSheet('set');true"));
  SystemClock.sleep(600);
  assertEquals("Account details wrap inside the card", "true",js("Array.from(document.querySelectorAll('#shBody .ci,#shBody .cd')).every(e=>e.scrollWidth<=e.clientWidth+2)"));
  assertEquals("true",js("closeSheet();showModal('<img src=\"assets/logo2.png\">','자는 동안 배달했어요','긴 안내'.repeat(300),[['확인','y',closeModal]]);true"));
  SystemClock.sleep(600);
  assertEquals("Long popup stays in the viewport and scrolls", "true",js("(()=>{const e=document.getElementById('mbox'),r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&e.scrollHeight>e.clientHeight&&getComputedStyle(e).overflowY==='auto'})()"));
  closeModals();
 }

}
