const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('assets/world-2d.js','utf8'),ctx);const {trafficLayout,routePosition,routeLength}=ctx.window.BWWorld2D;
function rect(p,vehicle,main){const x=(p.x-p.y)*45,y=(p.x+p.y)*22.5;const w=main?(vehicle>=8?112:vehicle>=4?92:59):44,h=main?(vehicle>=9?105:vehicle>=4?84:77):58;const minLift=main&&vehicle>=9?46:0,maxLift=main&&vehicle>=9?54:0;return {left:x-w/2-6,right:x+w/2+6,top:y+12-h-maxLift-(main?8:0),bottom:y+12-minLift+(main?2:0)};}
function overlaps(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}
let frames=0;
for(let v=0;v<11;v++)for(let d=0;d<routeLength;d+=.01){const t=trafficLayout(d/.67,6),r=[rect(t.player,v,true),...t.couriers.map(p=>rect(p,v,false))];for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++)assert.ok(!overlaps(r[i],r[j]),`sprite overlap at vehicle ${v}, route ${d}, pair ${i}/${j}`);frames++;}
for(let d=0;d<routeLength;d+=.01){const a=routePosition(d),b=routePosition(d+.001);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<=.00101,'continuous movement through turns');const t=trafficLayout(d/.67,2),x=t.player.x,y=t.player.y;assert.ok((x>=5.7&&x<=7.3)||(y>=5.7&&y<=7.3),'rider stays on road lanes');}
assert.equal(trafficLayout(0,0).couriers.length,0);assert.equal(trafficLayout(0,1000).couriers.length,2);assert.equal(trafficLayout(1000000,2).couriers.length,2);
console.log(`${frames} complete-loop vehicle frames: no sprite overlaps; continuous lane movement and companion cap passed`);
