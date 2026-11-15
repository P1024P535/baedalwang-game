import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const bridge=readFileSync('android/app/src/main/res/raw/account_bridge.js','utf8').replace('__PAGE_TOKEN__','page-1');
const original=readFileSync('index.html','utf8');
const afterGoogle=original.match(/function afterGoogle\(r,done\)\{[\s\S]*?(?=\nfunction uid)/)[0];
function game(acct={type:'guest'}) {
 const calls=[],notices=[];
 const env={PLATFORM:{},S:{ver:2,total:50,acct,lang:'ko',uid:'device'},SsokAccounts:{request(...args){calls.push(args)}},toast(x){notices.push(x)},L:x=>x,save(){env.PLATFORM.cloudSave(env.S)},setTimeout(){},location:{reload(){}}};env.window=env;
 vm.createContext(env);vm.runInContext(afterGoogle,env);assert.equal(vm.runInContext(bridge,env),true);
 return {env,calls,notices,reply(i,ok,data,token='page-1'){env.__ssokAccountResult(token,String(i),ok,data,'')}};
}
let g=game(),count=0;
assert.equal(g.calls[0][2],'current');
g.env.PLATFORM.signIn('google',(u,e)=>{count++;assert.equal(u,null);assert.ok(e)});g.reply(2,false,null);g.reply(2,true,{id:'another'});assert.equal(count,1);
g=game();let user=null;g.env.PLATFORM.signIn('google',u=>user=u);g.reply(2,true,{id:'a'},'stale');assert.equal(user,null);g.reply(2,true,{id:'a'});assert.equal(user.id,'a');
g=game();g.env.PLATFORM.cloudSave(g.env.S,true);assert.equal(g.calls.length,1,'guest never uploads');
g=game({type:'google',id:'account-a'});g.reply(1,true,{id:'account-b'});assert.equal(g.calls.length,1,'another native account cannot restore/upload local save');
g=game({type:'google',id:'account-a'});g.reply(1,true,{id:'account-a'});assert.equal(g.calls[1][2],'load','restored account must load first');g.reply(2,true,{ver:2,total:300});assert.equal(g.env.S.total,300,'original restore logic uses remote progress');
g=game({type:'google',id:'account-a'});g.env.PLATFORM.cloudSave(g.env.S,true);const snapshot=JSON.parse(g.calls[1][3]);g.env.S.total=999;assert.equal(snapshot.save.total,50,'native gets immutable save snapshot');assert.equal(snapshot.force,true);
g=game();g.env.SsokAccounts.request=()=>{throw Error('unavailable')};let ok=true;g.env.PLATFORM.signOut(x=>ok=x);assert.equal(ok,false,'native failure cannot report sign-out success');
assert.equal(vm.runInContext(bridge,g.env),true,'reattach is idempotent');
console.log('PASS: cancellation, duplicate and stale results, guest isolation, account mismatch, original restore, immutable snapshots, native failure, repeated attach');
