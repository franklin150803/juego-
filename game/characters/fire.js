import { ElementCharacter } from './character.js';
export const FIRE = { key:'fuego', name:'Fuego', emoji:'🔥', color:0x101116, accent:0xff2600, glow:0xffa000, attacks:['Llama Ígnea','Pilar de Fuego','Meteorito','Escudo de Fuego'], passive:'Corazón Ardiente' };
export class FireCharacter extends ElementCharacter {
  constructor(options={}) { super({ ...FIRE, ...options }); this._flames=[]; this._fireCrown(); }
  _fireCrown() {
    for (let i=0;i<7;i++) { const m=new THREE.MeshBasicMaterial({color:i%2?0xff5a00:0xffc400,transparent:true,opacity:.88,blending:THREE.AdditiveBlending,depthWrite:false}); const f=new THREE.Mesh(new THREE.ConeGeometry(.10+Math.random()*.08,.25+Math.random()*.28,7),m); const a=(i/7)*Math.PI*2; f.position.set(Math.cos(a)*.18,1.83+Math.random()*.06,Math.sin(a)*.18); f.rotation.z=(Math.random()-.5)*.5; this.group.add(f); this._flames.push(f); }
    const core=new THREE.PointLight(0xff5a00,1.4,5); core.position.y=1.6; this.group.add(core);
  }
  update(dt,t) { super.update(dt,t); this._flames.forEach((f,i)=>{f.scale.y=1+Math.sin(t*12+i)*.25; f.rotation.y+=dt*(2+i*.3);}); }
}
