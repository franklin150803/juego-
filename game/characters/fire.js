import { ElementCharacter } from './character.js';

export const FIRE = {
  key:'fuego', name:'Fuego', emoji:'🔥', color:0x111116, accent:0xff2b08, glow:0xffb000,
  attacks:['Llama Ígnea','Pilar de Fuego','Meteorito','Escudo de Fuego'], passive:'Corazón Ardiente'
};

const MAT=(c,op=1)=>new THREE.MeshStandardMaterial({color:c,roughness:.55,metalness:.18,emissive:c,emissiveIntensity:op>.5?.28:.5});
const FX=(c,op=1)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false});

export class FireCharacter extends ElementCharacter {
  constructor(options={}) {
    super({...FIRE,...options}); this._flames=[]; this._embers=[]; this._time=0; this._cooldowns={};
    this._rebuildBody(); this._buildAura(); this._buildHead(); this._buildEmbers();
  }
  _rebuildBody(){
    this.group.clear();
    const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.72,8,12),MAT(0x121217)); torso.position.y=1.0; this.group.add(torso);
    const belt=new THREE.Mesh(new THREE.TorusGeometry(.39,.055,7,24),MAT(0x5b1110)); belt.rotation.x=Math.PI/2; belt.position.y=.72; this.group.add(belt);
    for(const s of [-1,1]){
      const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.115,.55,6,10),MAT(0x18181d)); arm.position.set(s*.48,1.05,0); arm.rotation.z=s*.18; this.group.add(arm);
      const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.72,6,10),MAT(0x0c0c10)); leg.position.set(s*.19,.38,0); this.group.add(leg);
      const emberBand=new THREE.Mesh(new THREE.TorusGeometry(.16,.025,6,18),FX(0xff4b00,.8)); emberBand.rotation.x=Math.PI/2; emberBand.position.set(s*.19,.57,.0); this.group.add(emberBand);
    }
    const shoulder=new THREE.Mesh(new THREE.TorusGeometry(.48,.035,7,28),FX(0xff4500,.55)); shoulder.rotation.x=Math.PI/2; shoulder.position.y=1.35; this.group.add(shoulder);
  }
  _buildHead(){
    const head=new THREE.Mesh(new THREE.SphereGeometry(.32,16,12),MAT(0x180b08)); head.position.y=1.72; this.group.add(head);
    const eyeMat=FX(0xffffb0,1);
    for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),eyeMat);e.position.set(s*.105,1.77,.285);this.group.add(e)}
    for(let i=0;i<12;i++){
      const m=FX(i%3===0?0xffff3d:i%2?0xff5a00:0xffb000,.9), f=new THREE.Mesh(new THREE.ConeGeometry(.08+Math.random()*.09,.25+Math.random()*.42,7),m), a=i/12*Math.PI*2;
      f.position.set(Math.cos(a)*(.13+Math.random()*.1),1.86+Math.random()*.12,Math.sin(a)*(.13+Math.random()*.1)); f.rotation.z=(Math.random()-.5)*.7; this.group.add(f); this._flames.push(f);
    }
    const light=new THREE.PointLight(0xff4b00,2.1,5); light.position.y=1.65; this.group.add(light);
  }
  _buildAura(){
    const aura=new THREE.Mesh(new THREE.SphereGeometry(.7,16,12),FX(0xff4500,.08)); aura.position.y=1.05; aura.scale.y=1.35; this.group.add(aura); this._aura=aura;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.025,7,36),FX(0xff8a00,.5)); ring.rotation.x=Math.PI/2; ring.position.y=.08; this.group.add(ring); this._ring=ring;
  }
  _buildEmbers(){for(let i=0;i<32;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.018+Math.random()*.025,5,5),FX(i%2?0xff6a00:0xffd000,.8));p.userData={a:Math.random()*6.28,r:.35+Math.random()*.55,y:Math.random()*1.9};this.group.add(p);this._embers.push(p)}}
  _burst(color=0xff5a00,count=24,scale=1){
    const g=new THREE.Group(); for(let i=0;i<count;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.025+Math.random()*.04,6,5),FX(color,.9));const a=Math.random()*6.28,r=Math.random()*.35;p.position.set(Math.cos(a)*r,Math.random()*1.5,Math.sin(a)*r);p.userData={v:new THREE.Vector3(Math.cos(a)*(.5+Math.random()*1.5),.4+Math.random()*1.4,Math.sin(a)*(.5+Math.random()*1.5))};g.add(p)} g.position.copy(this.group.position);this.group.parent?.add(g);return g;
  }
  ability(name,scene,target){
    if(!scene||this._cooldowns[name]>0)return null; this._cooldowns[name]=name==='Meteorito'?5:name==='Pilar de Fuego'?3:2;
    const g=new THREE.Group(); g.position.copy(this.group.position); scene.add(g);
    if(name==='Llama Ígnea'){const flame=new THREE.Mesh(new THREE.ConeGeometry(.16,.8,10),FX(0xff5a00,1));flame.rotation.x=Math.PI/2;flame.position.z=-.7;g.add(flame);g.userData.velocity=new THREE.Vector3(0,0,-10);g.userData.life=1.2;}
    if(name==='Pilar de Fuego'){const ring=new THREE.Mesh(new THREE.CylinderGeometry(.65,.45,2.8,12),FX(0xff3500,.72));ring.position.y=1.4;g.add(ring);g.userData.life=1.1;}
    if(name==='Meteorito'){const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(.38,1),MAT(0x30120b));const flame=new THREE.Mesh(new THREE.SphereGeometry(.48,10,8),FX(0xff6500,.55));rock.position.y=4;flame.position.y=4;g.add(rock,flame);g.userData.life=2.5;g.userData.fall=true;}
    if(name==='Escudo de Fuego'){const shield=new THREE.Mesh(new THREE.SphereGeometry(1.05,20,14),FX(0xff6500,.16));g.add(shield);g.userData.life=4;this._shield=shield;}
    return g;
  }
  update(dt,t){
    super.update(dt,t); this._time=t;
    this._flames.forEach((f,i)=>{f.scale.y=1+Math.sin(t*10+i)*.28;f.rotation.y+=dt*(1.5+i*.18)});
    this._embers.forEach((p,i)=>{const u=p.userData;u.a+=dt*(1.2+i%3*.35);p.position.set(Math.cos(u.a)*u.r, u.y+Math.sin(t*2+i)*.08,Math.sin(u.a)*u.r)});
    if(this._aura)this._aura.scale.set(1+.06*Math.sin(t*4),1.35+.1*Math.sin(t*5),1+.06*Math.sin(t*4));
    if(this._ring)this._ring.rotation.z+=dt*.9;
    for(const k in this._cooldowns)this._cooldowns[k]=Math.max(0,this._cooldowns[k]-dt);
    if(this._shield){this._shield.rotation.y+=dt;this._shield.material.opacity=.12+.06*Math.sin(t*8)}
  }
}
