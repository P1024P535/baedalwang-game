/* Visual layer only. No storage, prices, rewards or progression mutations. */
(function(root){
'use strict';
const themes=[
 ['시골', '#b4d8a0','#d6e9bd',5,1],['동네','#b3d9a8','#cce6c1',5,1],['읍내','#a5d3a7','#d7e5c0',5,1],['면소재지','#a8caaa','#e4dfba',6,1],['소도시','#a5d0ac','#d3e7d1',5,1],
 ['중소도시','#b5d8bf','#d8e8df',1,1],['상권','#a8cfc9','#d9e6e1',2,2],['주거지','#b7d7d4','#e2e8ed',1,2],['수도권','#b9d5d3','#dae5e7',1,1],['경기도','#abcfc4','#d7e7d9',5,1],
 ['서울 상권','#b9cad4','#dbe2ed',2,2],['서울','#b7cbd7','#d6e0ef',1,2],['수도권 통합','#a9c9d2','#cddfe8',1,1],['광역시','#abc6d1','#d5ddeb',4,3],['전국','#a9d3c7','#d6e9df',5,1],
 ['일본','#e6c7d4','#f0dce8',4,2],['한일','#c9d7d9','#e4e5ee',1,2],['동남아','#a4d8bc','#daf1d1',5,5],['인도','#d9c5a3','#efdbbb',6,5],['아시아','#a6d7c8','#d0e9e5',1,5],
 ['미국','#b4c9d6','#d9e4ee',1,1],['북미','#bdcbd9','#e3e9ef',1,4],['유럽','#c4c8c6','#e7e3d8',4,3],['남미','#a3d2ad','#daedc8',5,5],['아프리카','#d7bd90','#ead5aa',6,5],
 ['세계 도시','#b9c9dd','#dbe2f1',1,1],['세계망','#b3cbd5','#d8e9ef',1,1],['우주정거장','#526c92','#172541',1,4],['달 기지','#939aa7','#242e4f',4,4],['달 도시','#a3aab9','#252b52',1,4],
 ['화성 기지','#ae7f70','#4b2a3f',6,3],['화성 도시','#c48d76','#54304b',6,3],['행성망','#71809e','#25284b',1,4],['정거장 연합','#687c9c','#242244',1,4],['성간망','#706d9b','#252345',1,4],
 ['은하 회사','#7c74aa','#282044',1,2],['은하계','#8377b2','#30214e',1,2],['통합 우주','#8d7db9','#36234e',1,2],['초은하','#9385b9','#34224d',3,2],['우주 배달의 신','#bfa8c7','#4a315b',3,2]
];
const shopKeys=['01_headquarters','02_restaurant','03_cafe','04_convenience_store','05_mart','06_parcel_terminal','07_logistics_center','08_gas_station','09_repair_shop','10_research_lab','11_upgrade_center','12_vehicle_shop'];
const pad=n=>String(n).padStart(2,'0');
function regionVisual(index){
 const r=Math.max(0,Math.min(39,Math.floor(index)||0)),t=themes[r];
 return {index:r,era:t[0],ground:t[1],sky:t[2],tile:t[3],tree:t[4],buildings:4+Math.floor(r*.52),development:Math.min(19,Math.floor(r/2)),space:r>=27,landmark:r>=38?20:r>=32?16:r>=27?15:r>=20?12:r>=10?9:1,accent:r%5};
}
function facing(a,b){const dx=b[0]-a[0],dy=b[1]-a[1];return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'front':'back');}
function create(options){
 const {canvas:cv,stage,getState,getRegions,getVehicles}=options,c=cv.getContext('2d');
 if(!c)return null;
 let width=1,height=1,dpr=1,time=0,bump=0,lastRegion=-1,terrain=null,particles=[],manifest=null,ready=false,images={},scene=[],raf=0;
 let lastAnchor={x:0,y:0};
 const failures=[],route=[[6,6],[6,-1],[6,6],[13,6],[6,6],[6,13],[6,6],[-1,6],[6,6]],iso=(x,y)=>[(x-y)*45,(x+y)*22.5];
 function resize(){width=Math.max(1,stage.clientWidth);height=Math.max(1,stage.clientHeight);dpr=Math.min(root.devicePixelRatio||1,2);cv.width=Math.round(width*dpr);cv.height=Math.round(height*dpr);cv.style.width=width+'px';cv.style.height=height+'px';}
 root.addEventListener('resize',resize);const ro=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;if(ro)ro.observe(stage);resize();
 function sprite(key,x,y,maxWidth,maxHeight,ctx=c){
  const a=manifest&&manifest.assets[key],im=a&&images[a.sheet];if(!a||!im||!im.complete||!im.naturalWidth)return false;
  const [sx,sy,sw,sh]=a.rect,scale=Math.min(maxWidth/sw,maxHeight/sh),dw=sw*scale,dh=sh*scale;
  ctx.drawImage(im,sx,sy,sw,sh,x-dw/2,y-dh,dw,dh);return true;
 }
 function groundTile(ctx,key,x,y,size=1){
  const a=manifest.assets[key],im=images[a.sheet];if(!a||!im)return;
  const [sx,sy,sw,sh]=a.rect,[px,py]=iso(x,y);ctx.save();ctx.transform(45*size/sw,22.5*size/sw,-45*size/sh,22.5*size/sh,px,py);ctx.drawImage(im,sx,sy,sw,sh,0,0,sw,sh);ctx.restore();
 }
 function rebuild(r){
  lastRegion=r.index;terrain=document.createElement('canvas');terrain.width=2800;terrain.height=2400;const tc=terrain.getContext('2d');tc.translate(1400,900);tc.fillStyle=r.ground;tc.fillRect(-1400,-900,2800,2400);
  for(let x=-20;x<=34;x++)for(let y=-20;y<=34;y++)groundTile(tc,'env/ground_'+pad(r.tile),x,y);
  tc.globalAlpha=r.space?.35:.12;tc.fillStyle=r.ground;tc.fillRect(-1400,-900,2800,2400);tc.globalAlpha=1;
  for(let k=-19;k<35;k+=3){if(k===5)continue;groundTile(tc,'env/road_01',5,k,3);groundTile(tc,'env/road_02',k,5,3);}
  groundTile(tc,'env/intersection_'+pad(1+r.accent%4),5,5,3);
  scene=[];
  const sites=[[2,2],[10,2],[2,10],[10,10],[-2,2],[14,2],[2,-2],[10,-2],[-2,10],[14,10],[2,14],[10,14],[-5,2],[17,2],[-5,10],[17,10],[2,17],[10,17],[2,-5],[10,-5],[-2,-2],[14,14],[-2,14],[14,-2]];
  sites.slice(0,r.buildings).forEach(([x,y],i)=>{
   const main=i<Math.min(12,4+Math.floor(r.index/3));const dev=1+(r.development+i)%20;
   const key=main?'shop/'+shopKeys[(i+r.index%3)%12]:'development/building_'+pad(dev);
   scene.push({x,y,depth:x+y+1,key,w:128+(i%3)*10,h:150});
  });
  const landmarkSites=[[0,0],[12,12]];
  if(r.index>=7)landmarkSites.slice(0,r.index>=25?2:1).forEach(([x,y],i)=>scene.push({x,y,depth:x+y+1,key:'development/building_'+pad(Math.min(20,r.landmark+i)),w:145,h:172}));
  for(let i=0;i<22;i++){
   const x=[-4,0,4,9,13,17][i%6],y=-4+Math.floor(i/6)*6+(i%2)*.5;
   scene.push({x,y,depth:x+y+.3,key:r.space?'env/nature_0'+(5+i%3):'env/tree_'+pad(r.tree),w:58,h:80});
  }
  // All supplied street and furnishing families are used along the two sidewalks.
  const decor=[];
  for(let i=0;i<6;i++)decor.push(['street_'+pad(i+1),4.6,i*3-1,40,64]);
  for(let i=0;i<5;i++)decor.push(['furniture_'+pad(i+1),8.3,i*3,49,49]);
  for(let i=0;i<6;i++)decor.push(['decoration_'+pad(i+1),i*3-1,4.5,43,45]);
  for(let i=0;i<5;i++)decor.push(['facility_'+pad(i+1),i*3,8.6,58,75]);
  for(let i=0;i<7;i++)decor.push(['nature_'+pad(i+1),-1+i*2,11.9,39,42]);
  for(let i=0;i<7;i++)decor.push(['terrain_'+pad(i+1),-2+i*2,16.5,82,57]);
  decor.forEach(([name,x,y,w,h])=>{if(x>=4.8&&x<=8.1||y>=4.8&&y<=8.1)return;scene.push({x,y,depth:x+y+.2,key:'env/'+name,w,h});});
 }
 function draw(now){
  raf=requestAnimationFrame(draw);if(document.hidden)return;
  time=now/1000;bump=Math.max(0,bump-.04);const state=getState(),r=regionVisual(state.r);c.setTransform(dpr,0,0,dpr,0,0);c.globalAlpha=1;c.fillStyle=r.sky;c.fillRect(0,0,width,height);
  if(!ready){c.fillStyle='#263c51';c.font='14px system-ui';c.textAlign='center';c.fillText(failures.length?'이미지를 불러오지 못했어요. 새로고침해 주세요.':'배달 도시를 준비하고 있어요…',width/2,height/2);return;}
  if(lastRegion!==r.index)rebuild(r);
  const progress=time*.095,ri=Math.floor(progress)%(route.length-1),mix=progress%1,a=route[ri],b=route[ri+1],x=a[0]+(b[0]-a[0])*mix,y=a[1]+(b[1]-a[1])*mix,[cx,cy]=iso(x,y),dir=facing(a,b),v=Math.max(0,Math.min(10,state.v||0));
  const airborne=v>=9,lift=airborne?50+Math.sin(time*2.8)*4:0,bob=Math.sin(time*(v===0?8:6))*(v<4?1.7:.65);
  const panel=stage.dataset.panel==='open',landscape=height<440&&width>height;
  const playHeight=landscape?height:height*(panel?.53:.82),anchorX=landscape?(panel?(width-Math.min(350,root.innerWidth*.45))/2:width*.32):width/2;
  const zoom=Math.max(.66,Math.min(1.08,width/530,playHeight/460)),anchorY=landscape?height*.67:Math.max(210,playHeight*.61);
  lastAnchor={x:anchorX,y:anchorY};c.save();c.translate(anchorX,anchorY);c.scale(zoom,zoom);c.translate(-cx,-cy);c.drawImage(terrain,-1400,-900);
  const objects=scene.map(o=>({...o,draw(){const [px,py]=iso(o.x+.5,o.y+.5);if(Math.abs(px-cx)>width/(2*zoom)+170||Math.abs(py-cy)>height/(2*zoom)+200)return;sprite(o.key,px,py+20,o.w,o.h);}}));
  // Extra couriers reflect owned routes and hired staff; they do not change earnings.
  const owned=(state.j||[]).reduce((a,n)=>a+n,0),couriers=Math.min(6,Math.floor(owned/5)+(state.staff||0));stage.dataset.couriers=String(couriers);
  for(let k=0;k<couriers;k++){
   const phase=progress*(.8+k*.06)+(k+1)*1.31,idx=Math.floor(phase)%(route.length-1),t=phase%1,aa=route[idx],bb=route[idx+1],xx=aa[0]+(bb[0]-aa[0])*t+.45,yy=aa[1]+(bb[1]-aa[1])*t-.45;
   objects.push({depth:xx+yy+.3,draw(){const [px,py]=iso(xx,yy);sprite('vehicle/'+Math.min(v,7)+'/'+facing(aa,bb),px,py+12,44,58);}});
  }
  c.save();c.setLineDash([3,12]);c.strokeStyle='#fff2ad9a';c.lineWidth=3;c.beginPath();const dest=iso(b[0],b[1]);c.moveTo(cx,cy+12);c.lineTo(dest[0],dest[1]+12);c.stroke();c.restore();
  const player={depth:airborne?Infinity:x+y+.4,draw(){const [px,py]=iso(x,y);c.fillStyle=airborne?'#14253b40':'#24374524';c.beginPath();c.ellipse(px,py+12,airborne?31:19,airborne?12:7,0,0,Math.PI*2);c.fill();sprite('vehicle/'+v+'/'+dir,px,py+12-lift-bob-bump*6,v>=8?112:v>=4?92:59,v>=9?105:v>=4?84:77);}};
  objects.push(player);objects.sort((a,b)=>a.depth-b.depth);for(const o of objects)o.draw();
  c.restore();
  // A compact label anchors the player among the moving delivery team.
  c.fillStyle='#163c43e8';c.beginPath();c.roundRect(anchorX-29,anchorY+17,58,20,7);c.fill();c.fillStyle='#fff1b6';c.font='600 10px system-ui';c.textAlign='center';c.fillText('배달 중',anchorX,anchorY+31);
  if(r.space){c.save();c.globalAlpha=.22;c.fillStyle='#fff5d1';for(let i=0;i<22;i++){const xx=(i*173.17)%width,yy=(i*91.31)%(height*.42);c.fillRect(xx,yy,1.4,1.4);}c.restore();}
  for(const p of particles){c.globalAlpha=Math.max(0,p.life);c.fillStyle='#ffd05a';c.beginPath();c.arc(p.x,p.y-(1-p.life)*50,5,0,Math.PI*2);c.fill();p.life-=.025;}particles=particles.filter(p=>p.life>0);c.globalAlpha=1;
  const regions=getRegions(),vehicles=getVehicles();stage.dataset.region=String(r.index+1);stage.dataset.vehicle=String(v);stage.dataset.facing=dir;stage.dataset.era=r.era;
  const badge=document.getElementById('region-visual');if(badge)badge.textContent=(r.index+1)+'/40 · '+regions[r.index].n+' · '+vehicles[v].n;
 }
 const readyPromise=fetch('assets/world-2d/manifest.json').then(r=>{if(!r.ok)throw Error('manifest '+r.status);return r.json();}).then(data=>{
  manifest=data;return Promise.all(Object.entries(data.groups).map(([key,g])=>new Promise((resolve,reject)=>{const im=new Image();images[key]=im;im.onload=()=>resolve();im.onerror=()=>reject(Error(g.src));im.src=g.src;})));
 }).then(()=>{ready=true;stage.dataset.graphicsReady='true';}).catch(e=>{failures.push(String(e));stage.dataset.graphicsReady='error';console.error('2D art loading failed',e);});
 raf=requestAnimationFrame(draw);
 return {coin(){particles.push({x:lastAnchor.x+(Math.random()-.5)*55,y:lastAnchor.y,life:1});},bump(){bump=1;this.coin();},ready:readyPromise,inspect(){return {ready,failures:failures.slice(),region:regionVisual(getState().r),vehicle:getState().v,assets:manifest?Object.keys(manifest.assets).length:0};},destroy(){cancelAnimationFrame(raf);root.removeEventListener('resize',resize);if(ro)ro.disconnect();}};
}
root.BWWorld2D={create,regionVisual,facing};
})(window);
