package com.ssokcompany.baedalwang;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.*;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import org.json.*;
import java.util.*;

/** Internal-test leaderboard. Scores are client submitted, not anti-cheat verified. */
final class RankStore {
 interface Reply {void done(boolean ok,Object data,String message);}
 private final FirebaseAuth auth; private final FirebaseFirestore db;
 private String lastUid=""; private long lastWrite;
 RankStore(FirebaseAuth auth,FirebaseFirestore db){this.auth=auth;this.db=db;}
 private boolean same(FirebaseUser u){return auth.getCurrentUser()!=null && auth.getCurrentUser().getUid().equals(u.getUid());}
 private boolean week(String s){return s!=null && s.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}");}
 private String weekField(String s){return "w"+s.replace('-','_');}
 private boolean sort(String s){return Arrays.asList("total","prog","lv","maxIps").contains(s) || s.matches("w[0-9]{4}_[0-9]{2}_[0-9]{2}");}
 private CollectionReference entries(String w){return db.collection("weeks").document(w).collection("entries");}
 private void fail(Reply cb){cb.done(false,null,"");}
 private double number(JSONObject d,String k,double max)throws Exception {double n=d.getDouble(k);if(!Double.isFinite(n)||n<0||n>max)throw new IllegalArgumentException();return n;}
 private long integer(JSONObject d,String k,long max)throws Exception{double n=number(d,k,max);if(n!=Math.floor(n))throw new IllegalArgumentException();return (long)n;}
 private Map<String,Object> score(JSONObject d)throws Exception {
  String nick=d.getString("nick");if(nick.isEmpty()||nick.length()>32||nick.matches("(?s).*[\\r\\n].*"))throw new IllegalArgumentException();
  Map<String,Object> m=new HashMap<>();m.put("nick",nick);
  m.put("total",number(d,"total",1e300));m.put("maxIps",number(d,"maxIps",1e300));
  long region=integer(d,"region",8), clears=integer(d,"clears",1000000),prog=integer(d,"prog",9000008);
  if(prog!=clears*9+region)throw new IllegalArgumentException();
  long lv=integer(d,"lv",10000000);if(lv<1)throw new IllegalArgumentException();
  m.put("prog",prog);m.put("lv",lv);m.put("region",region);m.put("clears",clears);m.put("dex",integer(d,"dex",1000000));m.put("boss",integer(d,"boss",1000000000000L));
  m.put("updated",FieldValue.serverTimestamp());return m;
 }
 void handle(String op,JSONObject p,Reply reply) {
  FirebaseUser u=auth.getCurrentUser();if(u==null||u.isAnonymous()){fail(reply);return;}
  Reply cb=(ok,data,msg)->{if(same(u))reply.done(ok,data,msg);else fail(reply);};
  try {
   if(op.equals("rankSet")) {
    if(!p.getString("path").equals("ranks/"+u.getUid()))throw new IllegalArgumentException();
    JSONObject d=p.getJSONObject("data");Map<String,Object> m=score(d);
    String current=d.getString("wk");if(!week(current))throw new IllegalArgumentException();
    double points=number(d,weekField(current),1e9);if(points!=number(d,"wp",1e9))throw new IllegalArgumentException();
    // Only the current and one preceding week from the original score payload are stored.
    ArrayList<String> weeks=new ArrayList<>();
    for(Iterator<String> it=d.keys();it.hasNext();) {String k=it.next();if(k.matches("w[0-9]{4}_[0-9]{2}_[0-9]{2}"))weeks.add(k.substring(1).replace('_','-'));}
    if(weeks.size()>2 || !weeks.contains(current))throw new IllegalArgumentException();
    if(u.getUid().equals(lastUid)&&System.currentTimeMillis()-lastWrite<3000){cb.done(true,null,"");return;}
    WriteBatch b=db.batch();b.set(db.collection("ranks").document(u.getUid()),m);
    for(String w:weeks){Map<String,Object> e=new HashMap<>(m);e.put("points",number(d,weekField(w),1e9));b.set(db.collection("weeks").document(w),Collections.singletonMap("week",w));b.set(entries(w).document(u.getUid()),e);}
    b.commit().addOnSuccessListener(v->{lastUid=u.getUid();lastWrite=System.currentTimeMillis();cb.done(true,null,"");}).addOnFailureListener(e->fail(cb));return;
   }
   if(op.equals("rankDelete")) {
    if(!p.getString("path").equals("ranks/"+u.getUid()))throw new IllegalArgumentException();
    db.collection("ranks").document(u.getUid()).delete().addOnSuccessListener(v->cb.done(true,null,"")).addOnFailureListener(e->fail(cb));return;
   }
   if(!op.equals("rankQuery"))throw new IllegalArgumentException();
   String field=p.getString("field"), mode=p.optString("mode","top");if(!sort(field))throw new IllegalArgumentException();
   boolean weekly=field.startsWith("w");String w=weekly?field.substring(1).replace('_','-'):"";
   String actual=weekly?"points":field;
   Query q=weekly?entries(w):db.collection("ranks");
   if(mode.equals("count")) {
    double value=p.getDouble("value");if(!Double.isFinite(value)||value<0)throw new IllegalArgumentException();
    q.whereGreaterThan(actual,value).limit(1000).count().get(AggregateSource.SERVER).addOnSuccessListener(s->{try{cb.done(true,new JSONObject().put("size",s.getCount()).put("docs",new JSONArray()),"");}catch(Exception e){fail(cb);}}).addOnFailureListener(e->fail(cb));
   } else if(mode.equals("top")) {
    q.orderBy(actual,Query.Direction.DESCENDING).limit(50).get(Source.SERVER).addOnSuccessListener(s->{try{
     JSONArray rows=new JSONArray();
     for(DocumentSnapshot doc:s.getDocuments()) {JSONObject data=new JSONObject();for(String k:Arrays.asList("nick","total","prog","lv","region","clears","maxIps","dex","boss"))data.put(k,doc.get(k));if(weekly)data.put(field,doc.get("points"));rows.put(new JSONObject().put("id",doc.getId()).put("data",data));}
     cb.done(true,new JSONObject().put("docs",rows).put("size",s.size()),"");
    }catch(Exception e){fail(cb);}}).addOnFailureListener(e->fail(cb));
   } else throw new IllegalArgumentException();
  } catch(Exception e){fail(cb);}
 }
 Task<Void> deleteAll(FirebaseUser user){return deleteWeeks(user,null);}
 private Task<Void> deleteWeeks(FirebaseUser u,DocumentSnapshot after) {
  Query q=db.collection("weeks").orderBy(FieldPath.documentId()).limit(100);if(after!=null)q=q.startAfter(after);
  return q.get(Source.SERVER).continueWithTask(task->{
   if(!task.isSuccessful())throw task.getException();if(!same(u))throw new IllegalStateException();
   List<DocumentSnapshot> docs=task.getResult().getDocuments();WriteBatch b=db.batch();b.delete(db.collection("ranks").document(u.getUid()));
   for(DocumentSnapshot w:docs)b.delete(entries(w.getId()).document(u.getUid()));
   return b.commit().continueWithTask(deleted->{if(!deleted.isSuccessful())throw deleted.getException();return docs.size()==100?deleteWeeks(u,docs.get(docs.size()-1)):Tasks.forResult(null);});
  });
 }
}
