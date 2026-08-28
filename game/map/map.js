export class ElementalMap {
  constructor(scene){this.scene=scene;this.size=120;this.tiles=[];this.fragments=[];this.loot=[];this._build();}
  _mat(c,e=0){return new THREE.MeshStandardMaterial({color:c,roughness:.82,emissive:e,emissiveIntensity:.25});}
  _build(){
    const groundMat=this._mat(0x26362f); const count=17, step=7;
    for(let x=-count;x<=count;x++) for(let z=-count;z<=count;z++) { const r=Math.hypot(x,z); if(r>count+.4)continue; const tile=new THREE.Mesh(new THREE.BoxGeometry(step-.18,.65,step-.18),groundMat); tile.position.set(x*step,(Math.random()-.5)*.15,z*step);tile.receiveShadow=true;tile.userData={radius:r,broken:false};this.scene.add(tile);this.tiles.push(tile); }
    this._landmarks(); this._trees(); this._lootHouses();
  }
  _landmarks(){ const places=[[-35,-30,'Pueblo de Ceniza'],[32,-28,'Lago Espejo'],[-28,28,'Bosque Antiguo'],[30,29,'Ruinas del Nexo'],[0,0,'Santuario Elemental']]; places.forEach(([x,z,name],i)=>{const base=new THREE.Mesh(new THREE.CylinderGeometry(i===4?7:4.5,i===4?7:5,.7,10),this._mat(i===4?0x4a285d:0x4b443b));base.position.set(x,.35,z);base.castShadow=true;this.scene.add(base);this._building(x,z,name,i===4);}); }
  _building(x,z,name,central=false){const w=central?7:5,h=central?7:3.4;const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,w*.8),this._mat(central?0x24182d:0x42362d));body.position.set(x,h/2+.5,z);body.castShadow=true;this.scene.add(body);const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.75,2.4,5),this._mat(central?0x7d3c2e:0x251b1b));roof.position.set(x,h+1.6,z);roof.castShadow=true;this.scene.add(roof); const label={name};body.userData.landmark=label;}
  _trees(){for(let i=0;i<75;i++){const a=Math.random()*Math.PI*2,r=15+Math.random()*88,x=Math.cos(a)*r,z=Math.sin(a)*r;if(r>100)continue;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.23,1.5,6),this._mat(0x3d291d));trunk.position.set(x,.9,z);const crown=new THREE.Mesh(new THREE.DodecahedronGeometry(1.1+Math.random()*.7,0),this._mat(0x274d3b));crown.position.set(x,2.1,z);crown.castShadow=true;this.scene.add(trunk,crown);}}
  _lootHouses(){ const spots=[[-12,-18],[18,-8],[-20,10],[12,18],[0,-27],[27,5],[-32,-3]];spots.forEach(([x,z],i)=>{this._building(x,z,['Casa de Cura','Arsenal','Santuario','Tienda Arcana'][i%4]);}); }
  collapse(radius){this.tiles.forEach(tile=>{const r=tile.userData.radius;if(!tile.userData.broken&&r>radius){tile.userData.broken=true;tile.userData.breakT=0;}});}
  update(dt){this.tiles.forEach(t=>{if(t.userData.broken){t.userData.breakT+=dt;t.rotation.x+=dt*(.5+Math.random());t.rotation.z+=dt*.3;t.position.y-=dt*2.5; if(t.userData.breakT>1.8)this.scene.remove(t);}});}
}
