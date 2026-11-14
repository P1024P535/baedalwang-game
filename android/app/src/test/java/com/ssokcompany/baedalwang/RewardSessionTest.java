package com.ssokcompany.baedalwang;
import org.junit.Test;
import static org.junit.Assert.*;

public class RewardSessionTest {
 @Test public void sdkEarnedThenDismissedResolvesOnlyOnce() {
  RewardSession attempt=new RewardSession("1",7);
  int grants=0;
  if(attempt.resolve())grants++;
  if(attempt.resolve())grants++;
  assertEquals(1,grants);
 }
 @Test public void closedOrFailedAttemptCannotLaterGrant() {
  RewardSession attempt=new RewardSession("2",7);
  assertTrue(attempt.resolve()); // dismissal/load failure resolves false in the controller
  assertFalse(attempt.resolve()); // late or duplicated earned event is ignored
 }
 @Test public void nextAdHasIndependentResolution() {
  RewardSession first=new RewardSession("1",7),second=new RewardSession("2",7);
  assertTrue(first.resolve());assertTrue(second.resolve());
  assertFalse(first.resolve());assertFalse(second.resolve());
 }
}
