package com.ssokcompany.baedalwang;
import org.junit.Test;
import static org.junit.Assert.*;
public class CloudSaveGuardTest {
 @Test public void failedReadAndGuestCannotOverwriteRemote(){CloudSaveGuard g=new CloudSaveGuard();assertFalse(g.permits("a","a",2,100,50));g.loaded("a",3);assertTrue(g.permits("a","a",2,100,50));g.reset();assertFalse(g.permits("a","a",2,100,50));}
 @Test public void otherAccountAndInvalidPayloadCannotUpload(){CloudSaveGuard g=new CloudSaveGuard();g.loaded("a",0);assertFalse(g.permits("b","a",2,100,50));assertFalse(g.permits("a","b",2,100,50));assertFalse(g.permits("a","a",1,100,50));assertFalse(g.permits("a","a",2,500001,50));assertFalse(g.permits("a","a",2,100,Double.NaN));assertFalse(g.permits("a","a",2,100,-1));}
 @Test public void revisionsAdvanceExactlyOnce(){CloudSaveGuard g=new CloudSaveGuard();g.loaded("a",4);g.saved(4,5);assertEquals(5,g.revision());try{g.saved(4,5);fail();}catch(IllegalStateException expected){} }
}
