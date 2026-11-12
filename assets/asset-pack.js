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
 function scooter(){const g=new THREE.Group(),orange=m(0xf46f0e,.15,.29),black=m(0x16191f,0,.83),silver=m(0x9da7ae,.68,.36),white=m(0xedf4f6,0,.24),glass=m(0xb8e0f0,.15,.18),red=m(0xd5262b,0,.35);
 const shape=(r,x,y,z,ma,n)=>{const o=mesh(g,new THREE.SphereGeometry(1,18,12),ma,x,y,z);o.scale.set(...r);o.name=n;return o};
 for(const x of [-.91,.94]){const t=tire(g,x,.43,0,.4);t.name=x<0?'rear_wheel':'front_wheel';
  const disc=mesh(g,new THREE.CylinderGeometry(.28,.28,.03,24),silver,x,.43,.11);disc.rotation.x=Math.PI/2;
  for(let j=0;j<8;j++){const a=j*Math.PI/4;rod(g,[x,.43,0],[x+Math.cos(a)*.24,.43+Math.sin(a)*.24,0],.014,silver)}
 }
 shape([1.08,.28,.37],-.05,.73,0,black,'undercarriage');
 shape([.83,.39,.34],.12,.91,0,orange,'sculpted_body');
 shape([.54,.26,.32],-.48,1.12,0,black,'padded_seat');
 shape([.42,.42,.3],.72,1.1,0,orange,'front_fairing');
 shape([.38,.19,.31],.95,1.22,0,black,'headlight_cowl');
 shape([.32,.13,.26],1.14,1.15,0,white,'LED_headlight');
 shape([.33,.09,.32],.9,1.51,0,glass,'windscreen');
 rod(g,[.77,1.25,0],[.67,1.64,0],.045,silver);
 rod(g,[.67,1.64,-.42],[.67,1.64,.42],.045,black);
 for(const z of [-.43,.43]){rod(g,[.67,1.64,z],[.8,1.88,z*1.35],.025,black);shape([.17,.095,.09],.8,1.88,z*1.35,black,'mirror')}
 for(const z of [-.24,.24])rod(g,[.85,1.05,z],[.98,.47,z],.05,silver);
 shape([.55,.18,.21],-.67,.62,-.29,silver,'exhaust');
 shape([.23,.26,.31],-.42,.6,-.15,black,'engine');
 box(g,.79,.72,.78,orange,-1.03,1.61,0).name='insulated_delivery_box';
 box(g,.84,.11,.84,black,-1.03,2.02,0);
 box(g,.73,.07,.045,white,-1.03,1.75,.41);
 box(g,.19,.12,.045,orange,-1.03,1.79,.45);
 box(g,.43,.11,.11,red,-1.22,1.01,0);
 for(const z of [-.31,.31])rod(g,[-.65,1.16,z],[-.65,1.3,z],.035,silver);
 rod(g,[-.28,.54,.18],[-.48,.13,.46],.027,black);
 shape([.22,.08,.17],.63,1.68,0,black,'dashboard');
 const pilot=person(g,-.25,.57,0,.76,true);pilot.name='delivery_rider';
 return g}
 function kickboard(){const g=new THREE.Group(),deck=m(0x252d37,.12,.5),accent=m(0x22b9cf,.25,.32),steel=m(0x9ca9b3,.65,.33),rubber=m(0x161c23,0,.92),lamp=m(0xfaf4ca,0,.22);
 // Electric standing kick scooter: short deck, tiny wheels, upright steering stem.
 for(const x of [-.78,.78]){
  const wheel=mesh(g,new THREE.TorusGeometry(.235,.085,10,24),rubber,x,.265,0);wheel.name='kickboard_wheel';
  const hub=mesh(g,new THREE.CylinderGeometry(.095,.095,.13,16),steel,x,.265,0);hub.rotation.x=Math.PI/2;
  for(let i=0;i<6;i++){const a=i*Math.PI/3;rod(g,[x,.265,0],[x+Math.cos(a)*.17,.265+Math.sin(a)*.17,0],.013,steel)}
 }
 const platform=box(g,1.52,.14,.39,deck,0,.35,0);platform.name='non_slip_deck';
 box(g,1.22,.018,.32,accent,-.02,.43,0);
 for(let i=-4;i<=4;i++)box(g,.025,.024,.30,rubber,i*.12,.448,0);
 rod(g,[.69,.36,0],[.81,1.92,0],.066,steel,'steering_stem');
 rod(g,[.81,1.92,-.41],[.81,1.92,.41],.045,deck,'handlebar');
 for(const z of [-.39,.39])box(g,.21,.09,.12,rubber,.81,1.92,z);
 const light=ball(g,.11,lamp,.87,1.69,0);light.name='front_LED';
 box(g,.12,.08,.23,m(0xe43f3f),-.83,.46,0).name='rear_brake_light';
 box(g,.38,.29,.28,deck,-.26,.64,0).name='battery_pack';
 // Standing rider, one foot forward, hands reaching handlebar.
 const pilot=new THREE.Group();g.add(pilot);pilot.name='standing_delivery_rider';
 ball(pilot,.21,p.skin,-.2,2.17,0);
 const helmet=mesh(pilot,new THREE.SphereGeometry(.25,16,12,0,Math.PI*2,0,Math.PI*.63),p.dark,-.2,2.28,0);helmet.name='helmet';
 box(pilot,.38,.58,.31,p.orange,-.25,1.65,0);
 box(pilot,.35,.49,.33,p.orange,-.49,1.7,-.12).name='delivery_backpack';
 for(const z of [-.16,.16]){
  rod(pilot,[-.08,1.86,z],[.77,1.91,z*2.1],.075,p.orange,'arm');
  rod(pilot,[-.27,1.37,z],[-.35+(z>0?.30:0),.55,z],.09,p.dark,'leg');
  box(pilot,.34,.12,.19,rubber,-.23+(z>0?.30:0),.47,z);
 }
 return g}
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
 return {person,bicycle,kickboard,scooter,storefront,home,p};
}
window.BaedalAssets3D={install};
})();
