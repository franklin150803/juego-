export const ATTACKS = {
 fuego:[{id:'fireball',name:'Llama Ígnea',key:'Q',type:'projectile'},{id:'pillar',name:'Pilar de Fuego',key:'E',type:'area'},{id:'meteor',name:'Meteorito',key:'R',type:'meteor'},{id:'shield',name:'Escudo de Fuego',key:'F',type:'shield'}],
 agua:[{id:'waterblade',name:'Lanza de Agua',key:'Q',type:'projectile'},{id:'heal',name:'Marea Curativa',key:'E',type:'heal'},{id:'prison',name:'Prisión de Agua',key:'R',type:'area'},{id:'wave',name:'Oleaje',key:'F',type:'push'}],
 tierra:[{id:'quake',name:'Golpe Sísmico',key:'Q',type:'area'},{id:'wall',name:'Muro de Piedra',key:'E',type:'shield'},{id:'rockprison',name:'Prisión Rocosa',key:'R',type:'area'},{id:'colossus',name:'Coloso',key:'F',type:'ultimate'}],
 aire:[{id:'blade',name:'Cuchilla de Viento',key:'Q',type:'projectile'},{id:'boost',name:'Impulso',key:'E',type:'dash'},{id:'airprison',name:'Prisión de Aire',key:'R',type:'area'},{id:'tornado',name:'Tornado',key:'F',type:'ultimate'}]
};
export const COMBINATIONS = {
 'agua+fuego':{name:'Vapor Explosivo',description:'Explosión de vapor que aturde'},
 'aire+fuego':{name:'Tormenta Ígnea',description:'Tornado de fuego que arrastra enemigos'},
 'fuego+tierra':{name:'Magma',description:'Zona volcánica de daño continuo'},
 'agua+tierra':{name:'Lodo Control',description:'Zona que ralentiza y atrapa'},
 'aire+rayo':{name:'Tormenta Eléctrica',description:'Rayos aleatorios en una gran zona'}
};
export function comboKey(a,b){return [a,b].sort().join('+');}
export function createAttackEffect(element, type, position) {
 const g=new THREE.Group(); const color={fuego:0xff5a00,agua:0x28aaff,tierra:0xb27a3e,aire:0xbceeff}[element]||0xffffff;
 if(type==='projectile'||type==='meteor'){const core=new THREE.Mesh(new THREE.SphereGeometry(type==='meteor'?.3:.16,12,10),new THREE.MeshBasicMaterial({color,blending:THREE.AdditiveBlending}));g.add(core);}
 else {const ring=new THREE.Mesh(new THREE.RingGeometry(.35, .5, 32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.6,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));ring.rotation.x=-Math.PI/2;g.add(ring);}
 g.position.copy(position); return g;
}
