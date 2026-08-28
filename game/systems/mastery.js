const KEY='fe_mastery_v3';
export const MASTERY_MAX=100;
export const UNLOCKS={
 fuego:['Bola de Fuego','Muro Ígneo','Lluvia de Meteoros'],agua:['Lanza de Agua','Marea Curativa','Prisión Acuática'],tierra:['Golpe Sísmico','Muro de Piedra','Coloso'],aire:['Cuchilla de Viento','Impulso','Tornado'],rayo:['Descarga','Cadena','Juicio Celestial'],hielo:['Filo Glacial','Prisión de Hielo','Era Glacial'],naturaleza:['Espina Viva','Raíces','Avatar del Bosque'],metal:['Fragmento','Armadura','Titán de Acero']
};
export const FUSIONS={
 'agua+fuego':{name:'VAPOR EXPLOSIVO',power:1.45,description:'Agua sobre fuego crea una nube hirviente que ciega y aturde.'},
 'aire+fuego':{name:'TORMENTA ÍGNEA',power:1.6,description:'El viento alimenta el fuego y convierte el ataque en un tornado ardiente.'},
 'fuego+tierra':{name:'MAGMA',power:1.7,description:'La tierra fundida deja una zona de daño persistente.'},
 'agua+hielo':{name:'GLACIAR',power:1.65,description:'El agua acelera una congelación masiva.'},
 'aire+rayo':{name:'TORMENTA',power:1.8,description:'El aire extiende el alcance de los rayos.'},
 'agua+naturaleza':{name:'VIDA',power:1.5,description:'La combinación genera una regeneración extraordinaria.'}
};
export function fusionKey(a,b){return [a,b].sort().join('+')}
export function fusion(a,b){return FUSIONS[fusionKey(a,b)]||null}
export function loadMastery(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
export function saveMastery(data){localStorage.setItem(KEY,JSON.stringify(data))}
export function progress(data,element,amount){const next=Math.min(MASTERY_MAX,(data[element]||0)+amount);data[element]=next;saveMastery(data);return {value:next,unlocked:next>=25?1:0,mastered:next>=MASTERY_MAX}}
