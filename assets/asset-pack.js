/* Baedalwang 3D asset pack v1. Actual Three.js meshes, not concept-sheet images. */
(function(){
function install(THREE){
 const m=(c,metal=0,rough=.72)=>new THREE.MeshStandardMaterial({color:c,metalness:metal,roughness:rough});
 const p={orange:m(0xf58a27),dark:m(0x253244),rubber:m(0x1b232b),steel:m(0x929fa9,.65,.36),glass:m(0x8ac4d8,.12,.18),skin:m(0xe7af88),white:m(0xf3f1e8),brown:m(0x8d644b),blue:m(0x2b7397),red:m(0xb83f39),light:m(0xffe7ad),road:m(0x364450)};
 function mesh(g,geo,mat,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function box(g,w,h,d,mat,x=0,y=0,z=0){return mesh(g,new THREE.BoxGeometry(w,h,d),mat,x,y,z)}
 function ball(g,r,mat,x=0,y=0,z=0){return mesh(g,new THREE.SphereGeometry(r,14,10),mat,x,y,z)}
 function rod(g,a,b,r,mat){const d=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a));const o=mesh(g,new THREE.CylinderGeometry(r,r,d.length(),10),mat,...new THREE.Vector3(...a).addScaledVector(d,.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o}
 function tire(g,x,y,z,r){const t=mesh(g,new THREE.TorusGeometry(r,.095,10,20),p.rubber,x,y,z);const hub=mesh(g,new THREE.CylinderGeometry(.115,.115,.14,14),p.steel,x,y,z);hub.rotation.x=Math.PI/2;for(let i=0;i<6;i++){const a=i*Math.PI/3;rod(g,[x,y,z],[x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,z],.018,p.steel)}return t}
 function person(g,x=0,y=0,z=0,s=1,seated=false){const a=new THREE.Group();g.add(a);a.position.set(x,y,z);a.scale.setScalar(s);
 const torso=box(a,.43,.64,.3,p.orange,0,1.17,0);box(a,.46,.07,.32,p.dark,0,.91,0);ball(a,.23,p.skin,0,1.75,0);
 const helmet=mesh(a,new THREE.SphereGeometry(.265,16,10,0,Math.PI*2,0,Math.PI*.61),p.dark,0,1.86,0);
 box(a,.35,.105,.24,p.glass,.035,1.75,.17);box(a,.25,.12,.04,p.white,0,1.96,-.17);
 for(const z2 of [-.2,.2]){const arm=rod(a,[0,1.46,z2],[.28,1.03,z2],.095,p.orange);a.userData.arms??=[];a.userData.arms.push(arm)}
 for(const z2 of [-.13,.13]){const leg=rod(a,[0,.87,z2],[seated?.35:0,.32,z2],.115,p.dark);a.userData.legs??=[];a.userData.legs.push(leg);box(a,.35,.13,.18,p.rubber,seated?.43:.06,.14,z2)}
 box(a,.4,.46,.35,p.orange,-.25,1.23,-.18);box(a,.27,.065,.36,p.white,-.47,1.29,-.18);
 return a}
 function bicycle(electric=false){const g=new THREE.Group();const x1=-.75,x2=.85;for(const x of [x1,x2])tire(g,x,.43,0,.42);
 const c=electric?p.orange:p.blue;
 rod(g,[x1,.43,0],[-.2,1.08,0],.055,c);rod(g,[-.2,1.08,0],[.2,.43,0],.055,c);rod(g,[.2,.43,0],[x1,.43,0],.055,c);
 rod(g,[x2,.43,0],[.42,1.2,0],.06,p.steel);rod(g,[.42,1.2,0],[-.2,1.08,0],.055,c);
 box(g,.52,.09,.25,p.rubber,-.24,1.18,0);rod(g,[.42,1.2,0],[.55,1.44,0],.055,p.steel);
 rod(g,[.48,1.44,-.32],[.48,1.44,.32],.05,p.dark);
 if(electric)box(g,.55,.24,.22,p.dark,-.12,.75,0);
 box(g,.58,.57,.53,p.orange,-1.07,1.23,0);box(g,.59,.06,.54,p.white,-1.07,1.53,0);
 person(g,-.22,.47,0,.72,true);return g}
 function scooter(){const g=new THREE.Group();for(const x of [-.91,.92])tire(g,x,.43,0,.4);
 const body=mesh(g,new THREE.CapsuleGeometry(.43,1.15,5,12),p.orange,-.04,.89,0);body.rotation.z=Math.PI/2;
 box(g,.72,.19,.64,p.dark,-.32,1.16,0);box(g,.55,.6,.57,p.orange,.72,1.01,0);
 ball(g,.27,p.glass,.98,1.18,0);box(g,.18,.15,.57,p.steel,.99,1.3,0);
 rod(g,[.81,1.16,0],[.68,1.54,0],.06,p.steel);rod(g,[.68,1.54,-.34],[.68,1.54,.34],.055,p.dark);
 box(g,.72,.7,.72,p.orange,-1.07,1.46,0);box(g,.75,.09,.75,p.dark,-1.07,1.84,0);box(g,.57,.11,.025,p.white,-1.07,1.57,.38);
 person(g,-.25,.57,0,.76,true);return g}
 function storefront(type=0){const g=new THREE.Group(),colors=[p.red,p.blue,p.orange],c=colors[type%3];
 box(g,2.65,1.72,1.65,p.white,0,.86,0);box(g,2.85,.22,1.88,p.dark,0,1.82,0);
 box(g,2.7,.33,.32,c,0,1.48,.86);for(let i=0;i<6;i++)box(g,.43,.055,.4,i%2?p.white:c,-1.11+i*.445,1.23,1.0);
 box(g,.78,1.12,.07,p.glass,-.62,.66,.84);box(g,.67,1.18,.08,p.brown,.67,.59,.84);
 box(g,1.65,.32,.08,c,0,2.02,.85);for(let i=0;i<3;i++)box(g,.24,.07,.09,p.white,-.45+i*.45,2.02,.905);
 box(g,.92,.13,.45,p.dark,-.63,.21,1.11);return g}
 function home(type=0){const g=new THREE.Group(),height=type===0?1.8:type===1?3:4.4;box(g,2.2,height,1.8,type===0?p.white:p.glass,0,height/2,0);
 box(g,2.4,.18,2,p.dark,0,height+.09,0);
 for(let y=.8;y<height-.2;y+=.83)for(const x of [-.55,.55]){box(g,.45,.44,.04,p.glass,x,y,.93);box(g,.48,.05,.065,p.white,x,y-.24,.96)}
 box(g,.55,.85,.07,p.brown,0,.43,.94);return g}
 return {person,bicycle,scooter,storefront,home,p};
}
window.BaedalAssets3D={install};
})();
