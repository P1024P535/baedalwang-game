package com.ssokcompany.baedalwang;

/** Upload gate: a successful server read for this exact user must precede writes. */
final class CloudSaveGuard {
 private String uid="";
 private long revision;
 void reset(){uid="";revision=0;}
 void loaded(String user,long rev){if(user==null||user.isEmpty()||rev<0)throw new IllegalArgumentException();uid=user;revision=rev;}
 boolean permits(String signedIn,String saveOwner,int version,int bytes,double total){
  return !uid.isEmpty() && uid.equals(signedIn) && uid.equals(saveOwner) && version==2 && bytes>0 && bytes<=500000 && Double.isFinite(total) && total>=0;
 }
 boolean loadedFor(String user){return !uid.isEmpty() && uid.equals(user);}
 long revision(){return revision;}
 void saved(long expected,long next){if(expected!=revision || next!=expected+1)throw new IllegalStateException();revision=next;}
}
