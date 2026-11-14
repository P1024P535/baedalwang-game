package com.ssokcompany.baedalwang;

/** Single ad attempt. Only the SDK earned event can authorize a reward. */
final class RewardSession {
 final String id;
 final long page;
 private boolean resolved;
 RewardSession(String id, long page) { this.id=id; this.page=page; }
 boolean resolve() { if(resolved)return false; resolved=true; return true; }
 boolean isResolved() { return resolved; }
}
