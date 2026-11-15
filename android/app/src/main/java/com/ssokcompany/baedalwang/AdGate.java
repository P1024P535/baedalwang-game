package com.ssokcompany.baedalwang;

/** A full-screen ad owns its slot until dismissal, including reward-earned time. */
final class AdGate {
 private Object owner;
 private long lastClosed=-1;
 boolean acquire(Object request){if(owner!=null)return false;owner=request;return true;}
 boolean busy(){return owner!=null;}
 void release(Object request,long now){if(owner==request){owner=null;lastClosed=now;}}
 boolean cooled(long now,long delay){return lastClosed<0||now-lastClosed>=delay;}
}
