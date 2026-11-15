package com.ssokcompany.baedalwang;
import org.junit.Test;
import static org.junit.Assert.*;
public class AdGateTest {
 @Test public void fullScreenFormatsCannotOverlap(){AdGate g=new AdGate();Object reward=new Object(),display=new Object();assertTrue(g.acquire(reward));assertFalse(g.acquire(display));g.release(display,100);assertTrue(g.busy());g.release(reward,200);assertFalse(g.busy());assertTrue(g.acquire(display));}
 @Test public void cooldownIncludesRewardDismissal(){AdGate g=new AdGate();Object reward=new Object();assertTrue(g.cooled(0,300000));g.acquire(reward);g.release(reward,1000);assertFalse(g.cooled(300999,300000));assertTrue(g.cooled(301000,300000));}
 @Test public void duplicateCallbackCannotUnlockAnotherAd(){AdGate g=new AdGate();Object a=new Object(),b=new Object();g.acquire(a);g.release(a,100);g.acquire(b);g.release(a,200);assertTrue(g.busy());g.release(b,300);assertFalse(g.busy());}
}
