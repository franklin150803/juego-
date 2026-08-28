export class Portal {
  constructor(scene, position = new THREE.Vector3(0,0,-10)) {
    this.position = position.clone(); this.group = new THREE.Group(); this.group.position.copy(position);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(6.5,7.4,.6,64), new THREE.MeshStandardMaterial({color:0x111421,emissive:0x4c2272,emissiveIntensity:.65,roughness:.5,metalness:.3})); base.position.y=.3; this.group.add(base);
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(4.8,.5,28,100), new THREE.MeshStandardMaterial({color:0x8c46df,emissive:0xd06cff,emissiveIntensity:2.3,roughness:.2,metalness:.25})); this.ring.position.y=4.25; this.group.add(this.ring);
    this.core = new THREE.Mesh(new THREE.CircleGeometry(4.35,64), new THREE.MeshBasicMaterial({color:0x120821,transparent:true,opacity:.94,side:THREE.DoubleSide,blending:THREE.AdditiveBlending})); this.core.rotation.x=Math.PI/2; this.core.position.y=4.25; this.group.add(this.core);
    this.light=new THREE.PointLight(0xb65cff,4.5,24); this.light.position.y=4; this.group.add(this.light); this.arcs=[];
    for(let i=0;i<18;i++){const a=new THREE.Mesh(new THREE.TorusGeometry(2.5+Math.random()*2.1,.018,6,32),new THREE.MeshBasicMaterial({color:0xc56cff,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));a.rotation.x=Math.PI/2;a.position.y=4.25;a.userData.spin=(Math.random()-.5)*2.8;this.group.add(a);this.arcs.push(a)}
    scene.add(this.group);
  }
  update(t,pressure=0){this.ring.rotation.z+=.009+pressure*.03;this.ring.scale.setScalar(1+Math.sin(t*5)*.025+pressure*.08);this.light.intensity=4.5+Math.sin(t*7)*.8+pressure*4;this.arcs.forEach(a=>a.rotation.z+=a.userData.spin*.01*(1+pressure*3));}
  distanceTo(target){return this.position.distanceTo(target.position);}
  attract(target,dt,strength){const v=this.position.clone().sub(target.position),dist=v.length();if(dist>.1){v.normalize();const speed=(1+strength*5)*Math.max(.35,Math.min(3,dist/4));target.position.addScaledVector(v,dt*speed);target.rotation.y+=dt*strength*4;}return dist<1.25;}
}
