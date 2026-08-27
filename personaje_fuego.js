"use strict";
/* HÉROE DE FUEGO — archivo independiente (edítalo libremente) */
window.FE_FUEGO=(()=>{
 const C={negro:0x0b0b10,rojo:0xff2200,naranja:0xff7700,amarillo:0xffcc00,oscuro:0x1a1420};
 function glowLocal(color,scale,op){const tex=window.FE_FX?FE_FX.glowTex:null;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}));
  s.scale.set(scale,scale,1);return s;}
 function build(isPlayer){const g=new THREE.Group();
  const negro=new THREE.MeshStandardMaterial({color:C.negro,roughness:.85});
  const robe=new THREE.Mesh(new THREE.CylinderGeometry(.16,.5,1.15,10),negro);robe.position.y=.75;robe.castShadow=true;g.add(robe);
  const bands=[];
  [[.45,C.rojo,.42],[.7,C.naranja,.34],[.95,C.amarillo,.26]].forEach(b=>{
   const m=new THREE.MeshBasicMaterial({color:b[1],transparent:true,opacity:.9});
   const t=new THREE.Mesh(new THREE.TorusGeometry(b[2]+.02,.035,8,20),m);
   t.rotation.x=Math.PI/2;t.position.y=b[0];g.add(t);bands.push(m);});
  const belt=new THREE.Mesh(new THREE.TorusGeometry(.28,.05,8,16),new THREE.MeshStandardMaterial({color:C.naranja,roughness:.5}));
  belt.rotation.x=Math.PI/2;belt.position.y=1.0;g.add(belt);
  const armG=new THREE.CylinderGeometry(.06,.07,.5,7);armG.translate(0,-.22,0);
  const armL=new THREE.Mesh(armG,negro);armL.position.set(-.28,1.3,0);armL.rotation.z=.45;armL.castShadow=true;g.add(armL);
  const armR=new THREE.Mesh(armG.clone(),negro);armR.position.set(.28,1.3,0);armR.rotation.z=-.45;armR.castShadow=true;g.add(armR);
  const fistMat=new THREE.MeshBasicMaterial({color:C.naranja});
  const f1=new THREE.Mesh(new THREE.SphereGeometry(.1,8,8),fistMat);f1.position.set(-.42,1.0,.05);g.add(f1);
  const f2=f1.clone();f2.position.x=.42;g.add(f2);
  const shM=new THREE.MeshStandardMaterial({color:C.rojo,roughness:.6});
  const s1=new THREE.Mesh(new THREE.SphereGeometry(.11,8,6),shM);s1.position.set(-.22,1.42,0);g.add(s1);
  const s2=s1.clone();s2.position.x=.22;g.add(s2);
  const cape=new THREE.Mesh(new THREE.PlaneGeometry(.55,.85),new THREE.MeshStandardMaterial({color:0x14060a,emissive:0x330000,emissiveIntensity:.6,side:THREE.DoubleSide,roughness:.9}));
  cape.position.set(0,1.0,-.26);cape.rotation.x=.22;g.add(cape);
  const face=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),new THREE.MeshStandardMaterial({color:C.oscuro,roughness:.9}));
  face.position.y=1.56;g.add(face);
  const eyeMat=new THREE.MeshBasicMaterial({color:C.amarillo});
  const e1=new THREE.Mesh(new THREE.SphereGeometry(.045,8,8),eyeMat);e1.position.set(-.07,1.58,.15);g.add(e1);
  const e2=e1.clone();e2.position.x=.07;g.add(e2);
  const flames=[];
  [[.16,.5,C.naranja,1.9],[.11,.38,C.amarillo,2.05],[.07,.28,C.rojo,1.8]].forEach(f=>{
   const m=new THREE.MeshBasicMaterial({color:f[2],transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
   const c=new THREE.Mesh(new THREE.ConeGeometry(f[0],f[1],8),m);c.position.y=f[3];g.add(c);flames.push(c);});
  const coreMat=new THREE.MeshBasicMaterial({color:C.naranja});
  const core=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),coreMat);core.position.set(0,1.12,.17);g.add(core);
  const aura=glowLocal(C.naranja,1.3,.75);aura.position.set(0,1.12,.1);g.add(aura);
  const foot=new THREE.Mesh(new THREE.RingGeometry(.5,.68,24),new THREE.MeshBasicMaterial({color:C.naranja,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));
  foot.rotation.x=-Math.PI/2;foot.position.y=.05;g.add(foot);
  const swirls=[];const n=isPlayer?3:1;const cols=[C.naranja,C.rojo,C.amarillo];
  for(let i=0;i<n;i++){const m=new THREE.MeshBasicMaterial({color:cols[i],transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false});
   const t=new THREE.Mesh(new THREE.TorusGeometry(.85+i*.12,.03,8,40),m);t.position.y=1.05;g.add(t);swirls.push({m,t});}
  const light=isPlayer?new THREE.PointLight(C.naranja,1,9):null;if(light){light.position.y=1.5;g.add(light);}
  return{group:g,robe,armL,armR,cape,foot,eyeMat,coreMat,aura,swirls,light,flames,bands,fists:[f1,f2]};}
 function update(a,dt){const t=window.FE_FX?FE_FX.time:0;
  if(a.flames)a.flames.forEach((f,i)=>{const k=1+Math.sin(t*13+i*2.1)*.18+Math.sin(t*29+i)*.08;
   f.scale.set(k,1+Math.sin(t*17+i)*.25,k);f.rotation.y+=dt*(3+i*2);});
  if(a.bands)a.bands.forEach((m,i)=>{m.opacity=.65+Math.sin(t*9+i*1.7)*.3;});
  if(a.fists)a.fists.forEach((f,i)=>{f.scale.setScalar(1+Math.sin(t*11+i*3)*.2);});
  if(window.FE_FX&&Math.random()<.25)FE_FX.sparks.burst({x:a.pos.x,y:a.pos.y+1.95,z:a.pos.z},0xff7700,1,1.5,.5,-4);}
 function projTrail(p){if(!window.FE_FX)return;
  FE_FX.sparks.burst(p.mesh.position,0xff5a1f,2,1.5,.4,-3);
  if(Math.random()<.5)FE_FX.sparks.burst(p.mesh.position,0xffcc00,1,1,.35,-4);}
 function secondary(P){if(!window.FE_FX)return;
  FE_FX.puffs.burst(P,0xff7733,30,9,.7,3);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;
   FE_FX.sparks.burst({x:P.x+Math.cos(a)*2.2,y:.5,z:P.z+Math.sin(a)*2.2},0xff7700,4,3,.7,-5);}
  FE_FX.sparks.burst({x:P.x,y:1.5,z:P.z},0xffcc00,14,6,.6,-5);}
 return{build,update,projTrail,secondary};
})();
