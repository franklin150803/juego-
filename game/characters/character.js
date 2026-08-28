export class ElementCharacter {
  constructor({ element, name, color, accent, glow, emoji='✦', isPlayer=false }) { Object.assign(this,{element,name,color,accent,glow,emoji,isPlayer}); this.group=new THREE.Group(); this.velocity=new THREE.Vector3(); this.health=100; this.maxHealth=100; this.grounded=true; this._build(); }
  _mat(color,emissive=0x000000,intensity=0){return new THREE.MeshStandardMaterial({color,roughness:.68,metalness:.12,emissive,emissiveIntensity:intensity});}
  _build(){
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.34,.42,.72,12),this._mat(0x101116,this.accent,.35)); body.position.y=.82; body.castShadow=true; this.group.add(body); this.body=body;
    const shoulder=new THREE.Mesh(new THREE.SphereGeometry(.46,10,8),this._mat(this.accent,this.glow,.25)); shoulder.scale.y=.42; shoulder.position.y=1.27; shoulder.castShadow=true; this.group.add(shoulder);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.27,14,12),this._mat(0x17181d,this.accent,.2)); head.position.y=1.62; head.castShadow=true; this.group.add(head);
    const eye=new THREE.MeshBasicMaterial({color:this.glow}); [-.09,.09].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.035,8,8),eye);e.position.set(x,1.65,.245);this.group.add(e)});
    const belt=new THREE.Mesh(new THREE.TorusGeometry(.29,.035,7,20),this._mat(this.accent,this.glow,.4));belt.rotation.x=Math.PI/2;belt.position.y=.98;this.group.add(belt);
    this.aura=new THREE.Mesh(new THREE.RingGeometry(.42,.62,28),new THREE.MeshBasicMaterial({color:this.glow,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));this.aura.rotation.x=-Math.PI/2;this.aura.position.y=.04;this.group.add(this.aura);
  }
  update(dt,t){this.group.position.addScaledVector(this.velocity,dt);this.velocity.multiplyScalar(Math.pow(.0008,dt));this.aura.rotation.z+=dt*1.8;this.aura.scale.setScalar(1+Math.sin(t*5)*.06);}
  damage(amount){this.health=Math.max(0,this.health-amount);return this.health<=0;}
}
