export class Portal {
  constructor(scene, position = new THREE.Vector3(0,0,-10)) {
    this.position = position.clone(); this.group = new THREE.Group(); this.group.position.copy(position);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(6.5,7.4,.6,64), new THREE.MeshStandardMaterial({color:0x111421,emissive:0x4c2272,emissiveIntensity:.65,roughness:.5,metalness:.3})); base.position.y=.3; this.group.add(base);
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(4.8,.5,28,100), new THREE.MeshStandardMaterial({color:0x8c46df,emissive:0xd06cff,emissiveIntensity:2.3,roughness:.2,metalness:.25})); this.ring.position.y=4.25; this.group.add(this.ring);
    this.core = new THREE.Mesh(new THREE.CircleGeometry(4.35,64), new THREE.MeshBasicMaterial({color:0x120821,transparent:true,opacity:.94,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})); this.core.rotation.x=Math.PI/2; this.core.position.y=4.25; this.group.add(this.core);
    this.light=new THREE.PointLight(0xb65cff,4.5,24); this.light.position.y=4; this.group.add(this.light); this.arcs=[];
    for(let i=0;i<18;i++){const a=new THREE.Mesh(new THREE.TorusGeometry(2.5+Math.random()*2.1,.018,6,32),new THREE.MeshBasicMaterial({color:0xc56cff,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));a.rotation.x=Math.PI/2;a.position.y=4.25;a.userData.spin=(Math.random()-.5)*2.8;this.group.add(a);this.arcs.push(a)}
    this.distortion=[];
    for(let i=0;i<28;i++){
      const a=Math.random()*Math.PI*2, r=5.4+Math.random()*5.5;
      const p=new THREE.Mesh(new THREE.SphereGeometry(.035+Math.random()*.045,6,5),new THREE.MeshBasicMaterial({color:0xd18aff,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false}));
      p.position.set(Math.cos(a)*r,2.0+Math.random()*5.2,Math.sin(a)*r);p.userData={a,r,y:p.position.y,speed:.4+Math.random()*1.3,phase:Math.random()*6.28};this.group.add(p);this.distortion.push(p);
    }
    this.shock=[];
    for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.TorusGeometry(5.2,.035,8,64),new THREE.MeshBasicMaterial({color:0xc875ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));s.rotation.x=Math.PI/2;s.position.y=.45;this.group.add(s);this.shock.push(s)}
    this.scene=scene; scene.add(this.group);
  }
  update(t,pressure=0){
    pressure=THREE.MathUtils.clamp(pressure,0,1);
    const pulse=Math.sin(t*5), violent=Math.pow(pressure,1.35);
    this.ring.rotation.z+=.009+pressure*.03;
    this.ring.scale.setScalar(1+pulse*.025+violent*.12);
    this.core.material.opacity=.82+Math.abs(pulse)*.1+violent*.12;
    this.light.intensity=4.5+pulse*.8+pressure*6.5;
    this.light.distance=24+pressure*10;
    this.arcs.forEach((a,i)=>{a.rotation.z+=a.userData.spin*.01*(1+pressure*5);a.scale.setScalar(1+Math.sin(t*6+i)*.08+violent*.18);a.material.opacity=.22+violent*.35});
    this.distortion.forEach((p,i)=>{
      const d=p.userData; d.a+=d.speed*.012*(1+pressure*7); const pull=pressure*(1.2+Math.sin(t*2+d.phase)*.3); const rr=d.r*(1-0.52*pull); p.position.x=Math.cos(d.a)*rr; p.position.z=Math.sin(d.a)*rr; p.position.y=d.y+Math.sin(t*2+d.phase)*.35*(1+pressure*2); p.material.opacity=.12+pressure*.65; p.scale.setScalar(1+pressure*2.2);
    });
    this.shock.forEach((s,i)=>{const cycle=(t*(.65+pressure*2)+i*.8)%2.4;const active=cycle<1.25;const q=active?cycle/1.25:0;s.scale.setScalar(1+q*(1.6+pressure*2.2));s.material.opacity=active?(1-q)*(.12+pressure*.32):0});
  }
  distanceTo(target){return this.position.distanceTo(target.position);}
  attract(target,dt,strength){const v=this.position.clone().sub(target.position),dist=v.length();if(dist>.1){v.normalize();const speed=(1+strength*5)*Math.max(.35,Math.min(3,dist/4));target.position.addScaledVector(v,dt*speed);target.rotation.y+=dt*strength*4;}return dist<1.25;}
}
