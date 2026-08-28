import { ElementCharacter } from './character.js';
export const EARTH = { key:'tierra', name:'Tierra', emoji:'🪨', color:0x17130e, accent:0x9a6732, glow:0xd3a35c, attacks:['Golpe Sísmico','Muro de Piedra','Prisión Rocosa','Coloso'], passive:'Núcleo de Tierra' };
export class EarthCharacter extends ElementCharacter { constructor(options={}) { super({...EARTH,...options}); const plates=new THREE.Mesh(new THREE.ConeGeometry(.48,.18,6),this._mat(EARTH.accent,EARTH.glow,.15)); plates.position.y=1.35;this.group.add(plates); } }
