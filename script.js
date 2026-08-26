"use strict";
/* ══════════════════════════════════════════════
   FRACTURA ELEMENTAL — v0.8 REMAKE VISUAL
   ══════════════════════════════════════════════ */
const $=id=>document.getElementById(id);
function setStatus(mode,msg){const c=$('statusChip');if(!c)return;
 if(mode==='ok'){c.textContent='● Listo';c.style.color='#8effa8';}
 else if(mode==='wait'){c.textContent='● '+(msg||'Cargando…');c.style.color='#ffd76a';}
 else{c.textContent='● Error: '+(msg||'desconocido');c.style.color='#ff8a80';}}
addEventListener('error',e=>setStatus('error',e.message));
function loadThree(cb){if(window.THREE)return cb();
 const urls=['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','https://unpkg.com/three@0.128.0/build/three.min.js','https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js'];
 let i=0;(function next(){if(i>=urls.length){setStatus('error','No se pudo cargar Three.js');return;}
  setStatus('wait','Cargando Three.js ('+(i+1)+'/3)…');const s=document.createElement('script');s.src=urls[i++];
  s.onload=()=>window.THREE?cb():next();s.onerror=next;document.head.appendChild(s);})();}

const ELEMENTS={
 fuego:{name:'Fuego',emoji:'🔥',color:0xff4d1f,css:'#ff5a1f',desc:'Ignio: ráfagas rápidas y embestida ardiente',dmg:14,speed:29,cd:.4},
 agua:{name:'Agua',emoji:'💧',color:0x2f9dff,css:'#2f9dff',desc:'Curación y ralentización',dmg:11,speed:22,cd:.5},
 tierra:{name:'Tierra',emoji:'🪨',color:0xc98a3c,css:'#c98a3c',desc:'Escudos y derribo',dmg:14,speed:20,cd:.7},
 aire:{name:'Aire',emoji:'🌀',color:0xbfeaff,css:'#bfeaff',desc:'Movilidad y empuje',dmg:9,speed:26,cd:.42},
 rayo:{name:'Rayo',emoji:'⚡',color:0xffd23c,css:'#ffd23c',desc:'Daño en cadena y aturdimiento',dmg:12,speed:30,cd:.6},
 hielo:{name:'Hielo',emoji:'❄️',color:0x9fdcff,css:'#9fdcff',desc:'Congelación y control',dmg:10,speed:22,cd:.6},
 naturaleza:{name:'Naturaleza',emoji:'🌿',color:0x59d95c,css:'#59d95c',desc:'Veneno y regeneración',dmg:10,speed:20,cd:.55},
 metal:{name:'Metal',emoji:'⚙️',color:0xcfd6e0,css:'#cfd6e0',desc:'Armadura y golpes pesados',dmg:18,speed:26,cd:.8},
 chispa:{name:'Chispa',emoji:'✦',color:0xffffff,css:'#ffffff',desc:'Sin elemento',dmg:6,speed:20,cd:.6}};
const EL_KEYS=Object.keys(ELEMENTS).filter(k=>k!=='chispa');
const COMBOS={
 'agua+fuego':{name:'Vapor',emoji:'☁️',desc:'Nube que aturde y ciega'},
 'fuego+tierra':{name:'Magma',emoji:'🌋',desc:'Zona de daño continuo'},
 'aire+fuego':{name:'Tormenta Ígnea',emoji:'🌪️',desc:'Tornado de fuego viajero'},
 'fuego+rayo':{name:'Plasma',emoji:'☀️',desc:'Rayo continuo devastador'},
 'agua+aire':{name:'Niebla',emoji:'🌫️',desc:'Invisibilidad temporal'},
 'agua+hielo':{name:'Glaciar',emoji:'🧊',desc:'Congelación masiva'},
 'agua+naturaleza':{name:'Vida',emoji:'💚',desc:'Curación potente'},
 'aire+rayo':{name:'Tormenta Eléctrica',emoji:'⛈️',desc:'Rayos aleatorios en zona'}};
const comboKey=(a,b)=>[a,b].sort().join('+');
const ARENAS=[
 {name:'Arena 1 — El Despertar',tile:0x5b5468,emiss:0x000000,fog:0x070312,style:'fall',desc:'Las losas se rompen y caen'},
 {name:'Arena 2 — El Cruce · Bosque Cristalino',tile:0x274046,emiss:0x0a3a3a,fog:0x03120e,style:'dust',desc:'Los pisos se desintegran en polvo brillante'},
 {name:'Arena 3 — La Convergencia · Volcán Inestable',tile:0x3a2a2a,emiss:0x2a0d00,fog:0x120503,style:'lava',desc:'El colapso revela lava'},
 {name:'Arena 4 — El Nexo Primordial',tile:0x3a2a5a,emiss:0x150a30,fog:0x0a0318,style:'fade',desc:'Plataformas que cambian de color'}];
function rankName(n){return n>=4?'Maestro Elemental':n===3?'Adepto Elemental':n===2?'Iniciado Elemental':n===1?'Aprendiz Elemental':'Aspirante';}
const PORTAL_TIME=20,ARENA_X=200,N=17,TILE=2,HALF=(N-1)/2,ARENA_R=HALF*TILE;
const BOT_NAMES=["Kael","Vira","Orin","Sable","Nyx"];
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

let mastery=(()=>{try{const s=localStorage.getItem('fe_mastery_v2');if(s)return Object.assign(Object.fromEntries(EL_KEYS.map(k=>[k,0])),JSON.parse(s));}catch(e){}return Object.fromEntries(EL_KEYS.map(k=>[k,0]));})();
function saveMastery(){try{localStorage.setItem('fe_mastery_v2',JSON.stringify(mastery));}catch(e){}}
let session={pick:{},use:{},kill:{},once:{}};
const effMastery=el=>el&&mastery[el]!==undefined?clamp((mastery[el]||0)+5*(session.pick[el]||0)+2*(session.use[el]||0)+10*(session.kill[el]||0),0,100):0;
const masteredCount=()=>EL_KEYS.filter(k=>mastery[k]>=100).length;
const arenaIdx=()=>{const n=masteredCount();return n>=4?3:n===3?2:n===2?1:0;};

const AU={ctx:null,mg:null,nb:null,muted:false,
 unlock(){try{if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.mg=this.ctx.createGain();this.mg.gain.value=.5;this.mg.connect(this.ctx.destination);const L=this.ctx.sampleRate;this.nb=this.ctx.createBuffer(1,L,L);const d=this.nb.getChannelData(0);for(let i=0;i<L;i++)d[i]=Math.random()*2-1;}if(this.ctx.state==='suspended')this.ctx.resume();}catch(e){}},
 tone(t,f0,f1,dur,vol,dl){if(!this.ctx||this.muted)return;dl=dl||0;const t0=this.ctx.currentTime+dl,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=t;o.frequency.setValueAtTime(Math.max(1,f0),t0);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t0+dur);g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(vol,t0+.008);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(this.mg);o.start(t0);o.stop(t0+dur+.05);},
 noise(dur,vol,f0,f1,type,dl){if(!this.ctx||this.muted)return;dl=dl||0;type=type||'lowpass';const t0=this.ctx.currentTime+dl,s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();s.buffer=this.nb;s.loop=true;f.type=type;f.frequency.setValueAtTime(Math.max(20,f0),t0);f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(vol,t0+.015);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);s.connect(f);f.connect(g);g.connect(this.mg);s.start(t0);s.stop(t0+dur+.05);},
 boom(){this.noise(1.2,.85,900,45);this.tone('sine',95,26,1.1,.8);},
 pickup(){this.tone('sine',520,880,.12,.24);this.tone('sine',780,1320,.14,.2,.07);this.tone('sine',1040,1760,.2,.18,.14);},
 cast(el,v){v=v===undefined?1:v;if(v<=.05)return;switch(el){case 'fuego':this.tone('sawtooth',340,90,.22,.22*v);this.noise(.2,.14*v,2600,300,'bandpass');break;case 'agua':this.tone('sine',680,260,.16,.22*v);break;case 'tierra':this.tone('square',110,55,.15,.26*v);break;case 'aire':this.noise(.26,.24*v,2800,900,'highpass');break;case 'rayo':this.noise(.15,.3*v,5000,800,'highpass');break;case 'hielo':this.tone('triangle',1200,500,.18,.2*v);break;case 'naturaleza':this.tone('sine',300,500,.15,.2*v);break;case 'metal':this.tone('square',500,180,.1,.25*v);break;default:this.tone('triangle',520,300,.1,.14*v);}},
 hit(){this.tone('square',230,140,.07,.16);},hurt(){this.tone('sawtooth',180,60,.25,.28);this.noise(.16,.18,800,200);},
 heal(){this.tone('sine',420,840,.3,.2);},shield(){this.tone('triangle',280,620,.3,.2);},dash(){this.noise(.28,.26,3200,1100,'highpass');},
 portal(){this.tone('sine',392,392,.7,.14);this.tone('sine',523,523,.7,.12,.05);this.tone('sine',659,659,.8,.1,.1);},
 beep(){this.tone('sine',880,880,.07,.14);},thunder(){this.noise(1.8,.3,300,40);},
 warn(){this.tone('square',660,660,.1,.2);this.tone('square',520,520,.1,.2,.16);},
 rumble(){this.noise(1.5,.6,150,38);this.tone('sine',70,30,1.2,.4);},
 fanfare(){[523,659,784,1046].forEach((f,i)=>this.tone('sine',f,f,.35,.2,i*.11));},
 win(){[523,659,784,1046,1318].forEach((f,i)=>this.tone('triangle',f,f,.4,.22,i*.13));},
 lose(){[440,349,294,220].forEach((f,i)=>this.tone('sawtooth',f,f*.98,.5,.16,i*.2));}};

function renderTitleBars(){const w=$('titleBars');w.innerHTML='';
 $('rankLine').textContent='🏅 '+rankName(masteredCount())+' · '+masteredCount()+'/8 elementos dominados';
 EL_KEYS.forEach(k=>{const E=ELEMENTS[k],v=clamp(mastery[k],0,100);
 const r=document.createElement('div');r.className='tbar';
 r.innerHTML='<span class="nm">'+E.emoji+' '+E.name+'</span><div class="track"><div class="fill" style="width:'+v+'%;background:'+E.css+'"></div></div><span class="pct">'+(v>=100?'<span class="badge">DOMINADO ★</span>':Math.floor(v)+'%')+'</span>';
 w.appendChild(r);});}
renderTitleBars();
$('btnSettings').addEventListener('click',()=>{$('settingsModal').style.display='flex';});
$('setClose').addEventListener('click',()=>{$('settingsModal').style.display='none';});
$('setSound').addEventListener('change',e=>{AU.muted=!e.target.checked;});
$('setPerf').addEventListener('change',e=>{if(window.__setPerf)window.__setPerf(e.target.checked);});
$('setReset').addEventListener('click',()=>{if(confirm('¿Borrar todo el progreso de dominio?')){try{localStorage.removeItem('fe_mastery_v2');}catch(e){}location.reload();}});

let READY=false;
function tryLandscapeLock(){try{const el=document.documentElement;
 const req=el.requestFullscreen||el.webkitRequestFullscreen;
 if(req)req.call(el).catch(()=>{}).then(()=>{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});});
 else if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});
}catch(e){}}
$('btnPlay').addEventListener('click',()=>{if(!READY){setStatus('wait','El 3D aún no está listo…');return;}AU.unlock();tryLandscapeLock();window.__startGame();});
$('btnRetry').addEventListener('click',()=>{if(READY)window.__retry();});
$('btnMenu').addEventListener('click',()=>{if(READY)window.__toMenu();});
loadThree(()=>{try{init();READY=true;setStatus('ok');}catch(e){setStatus('error',e.message);console.error(e);}});

function init(){
let phase='menu',phaseT=0,shake=0,blurVal=0,lobbyTime=PORTAL_TIME,chosen=null,suckT=0,battleTime=0,curArena=0;
let portalOn=false,boomDone=false,ignited=false,line=0,arcT=0,skyT=rand(3,7),matchOver=false,stats={kills:0,dmg:0};
let collapseQueue=[8,7,6,5,4,3,2],collapseIdx=0,warnActive=false,warnT=0,nextCollapseAt=12,collapseDone=false;
let magmaZones=[],tornados=[];
const canvas=$('game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio($('setPerf').checked?1:Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
window.__setPerf=on=>renderer.setPixelRatio(on?1:Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x070312,0.009);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,900);
scene.add(new THREE.HemisphereLight(0x7788ff,0x140a24,.7));
const sun=new THREE.DirectionalLight(0xfff0da,1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:110});
scene.add(sun);scene.add(sun.target);
const sky=new THREE.Mesh(new THREE.SphereGeometry(340,20,14),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 vP;void main(){float h=normalize(vP).y;vec3 c=mix(vec3(.02,.01,.05),vec3(.10,.05,.22),smoothstep(-.4,.05,h));c=mix(c,vec3(.03,.02,.10),smoothstep(.05,.7,h));c+=vec3(.05,.12,.14)*pow(max(0.,1.-abs(h+.15)*3.),2.);gl_FragColor=vec4(c,1.);}' }));
sky.position.set(100,0,0);scene.add(sky);

function cnv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')];}
const glowTex=(()=>{const[c,x]=cnv(128,128);const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
function glowSprite(color,scale,op){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,transparent:true,opacity:op===undefined?.9:op,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.set(scale,scale,1);return s;}
function stoneTex(rep){const[c,x]=cnv(256,256);x.fillStyle='#5b5468';x.fillRect(0,0,256,256);
 for(let i=0;i<900;i++){x.fillStyle='rgba('+(70+Math.random()*60|0)+','+(65+Math.random()*55|0)+','+(85+Math.random()*60|0)+',.25)';x.fillRect(Math.random()*256,Math.random()*256,2,2);}
 x.strokeStyle='rgba(20,15,35,.8)';x.lineWidth=3;
 for(let y=0;y<=256;y+=64){x.beginPath();x.moveTo(0,y);x.lineTo(256,y);x.stroke();}
 for(let y=0;y<256;y+=64)for(let xx=(y/64%2)*32;xx<=256;xx+=64){x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+64);x.stroke();}
 for(let i=0;i<24;i++){x.fillStyle='rgba(70,120,80,.12)';x.beginPath();x.arc(Math.random()*256,Math.random()*256,rand(4,14),0,7);x.fill();}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep,rep);return t;}
const stone1=stoneTex(1),stone4=stoneTex(4);
function drawGlyph(x,px,py,s){x.beginPath();x.moveTo(px,py-s);x.lineTo(px,py+s);const b=1+(Math.random()*3|0);
 if(b&1){x.moveTo(px,py-s);x.lineTo(px+s*.7,py);}if(b&2){x.moveTo(px,py);x.lineTo(px+s*.7,py+s);}if(b&4){x.moveTo(px-s*.6,py-s*.5);x.lineTo(px+s*.6,py+s*.5);}x.stroke();}
function runeRingTex(){const[c,x]=cnv(1024,1024);x.strokeStyle='#ffcf6a';x.shadowColor='#ffb640';x.shadowBlur=14;x.lineWidth=5;
 x.beginPath();x.arc(512,512,470,0,7);x.stroke();x.beginPath();x.arc(512,512,430,0,7);x.stroke();
 for(let i=0;i<36;i++){const a=i/36*Math.PI*2;x.save();x.translate(512+Math.cos(a)*450,512+Math.sin(a)*450);x.rotate(a+Math.PI/2);drawGlyph(x,0,0,16);x.restore();}
 return new THREE.CanvasTexture(c);}
function portalTex(){const[c,x]=cnv(512,512);x.strokeStyle='#ffd76a';x.shadowColor='#ffae20';x.shadowBlur=30;x.lineWidth=22;
 x.beginPath();x.arc(256,256,210,0,7);x.stroke();x.lineWidth=4;x.beginPath();x.arc(256,256,180,0,7);x.stroke();
 x.lineWidth=6;for(let i=0;i<26;i++){const a=i/26*Math.PI*2;x.save();x.translate(256+Math.cos(a)*210,256+Math.sin(a)*210);x.rotate(a+Math.PI/2);drawGlyph(x,0,0,14);x.restore();}
 return new THREE.CanvasTexture(c);}
function vortexTex(){const[c,x]=cnv(512,512);x.translate(256,256);
 for(let i=0;i<60;i++){const a0=rand(0,7),r0=rand(20,250);x.strokeStyle='rgba('+(30+Math.random()*40|0)+','+(60+Math.random()*60|0)+','+(120+Math.random()*80|0)+',.5)';x.lineWidth=rand(2,6);x.beginPath();for(let k=0;k<20;k++){const a=a0+k*.12,r=r0+k*4;x.lineTo(Math.cos(a)*r,Math.sin(a)*r);}x.stroke();}
 return new THREE.CanvasTexture(c);}
function textSprite(main,sub,color){const[c,x]=cnv(360,150);x.textAlign='center';x.font='bold 54px Inter,Arial';x.lineWidth=10;x.strokeStyle='rgba(0,0,0,.85)';x.strokeText(main,180,62);x.fillStyle=color;x.fillText(main,180,62);
 if(sub){x.font='bold 30px Inter,Arial';x.strokeText(sub,180,116);x.fillStyle='#ffd76a';x.fillText(sub,180,116);}
 const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(2.9,1.2,1);return s;}

(function(){const n=500,p=new Float32Array(n*3);for(let i=0;i<n;i++){const v=new THREE.Vector3(rand(-1,1),rand(.05,1),rand(-1,1)).normalize().multiplyScalar(rand(200,310));p.set([v.x+100,v.y,v.z],i*3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xbbaaff,size:1.4,transparent:true,opacity:.85,depthWrite:false})));
 [[0x2a1b4e,-60,40,-160,180],[0x0e3a4a,180,60,-140,150],[0x3a1030,60,30,180,170]].forEach(nb=>{const s=glowSprite(nb[0],nb[4],.3);s.position.set(nb[1],nb[2],nb[3]);scene.add(s);});})();

class Pool{constructor(n,size){this.n=n;this.d=[];const p=new Float32Array(n*3),cl=new Float32Array(n*3);
 for(let i=0;i<n;i++){this.d.push({v:new THREE.Vector3(),life:0,max:1,g:0,c:new THREE.Color()});p[i*3+1]=-9999;}
 this.pA=new THREE.BufferAttribute(p,3);this.cA=new THREE.BufferAttribute(cl,3);
 const g=new THREE.BufferGeometry();g.setAttribute('position',this.pA);g.setAttribute('color',this.cA);
 this.pts=new THREE.Points(g,new THREE.PointsMaterial({size,map:glowTex,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));this.pts.frustumCulled=false;scene.add(this.pts);this.cur=0;}
 burst(p,color,n,sp,life,g,spread){g=g===undefined?4:g;spread=spread===undefined?1:spread;
 for(let k=0;k<n;k++){const i=this.cur;this.cur=(this.cur+1)%this.n;const d=this.d[i];d.life=d.max=rand(life*.5,life);d.g=g;d.c.set(color);
 d.v.set(rand(-1,1),rand(-.4,1)*spread,rand(-1,1)).normalize().multiplyScalar(rand(sp*.3,sp));this.pA.setXYZ(i,p.x,p.y,p.z);}this.pA.needsUpdate=true;}
 update(dt){let dirty=false;for(let i=0;i<this.n;i++){const d=this.d[i];if(d.life<=0)continue;dirty=true;d.life-=dt;
 if(d.life<=0){this.pA.setY(i,-9999);continue;}d.v.y-=d.g*dt;
 this.pA.setXYZ(i,this.pA.getX(i)+d.v.x*dt,this.pA.getY(i)+d.v.y*dt,this.pA.getZ(i)+d.v.z*dt);
 const f=d.life/d.max;this.cA.setXYZ(i,d.c.r*f,d.c.g*f,d.c.b*f);}if(dirty){this.pA.needsUpdate=true;this.cA.needsUpdate=true;}}}
const sparks=new Pool(900,.45),puffs=new Pool(280,1.7);
const bolts=[];
function makeBolt(a,b,color,life,jit){jit=jit||.35;const pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push(new THREE.Vector3().lerpVectors(a,b,t).add(new THREE.Vector3(rand(-jit,jit),rand(-jit,jit),rand(-jit,jit))));}
 const m=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
 scene.add(m);bolts.push({m,life:life||.2,t:0});}
function updateBolts(dt){for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.t+=dt;if(b.t>=b.life){scene.remove(b.m);b.m.geometry.dispose();b.m.material.dispose();bolts.splice(i,1);}else b.m.material.opacity=1-b.t/b.life;}}
const dmgPool=[];for(let i=0;i<14;i++){const[c,x]=cnv(120,60);const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(1.5,.75,1);s.visible=false;scene.add(s);dmgPool.push({s,c,x,t,life:0});}
function dmgNumber(p,txt,color){const d=dmgPool.find(q=>q.life<=0)||dmgPool[0];d.x.clearRect(0,0,120,60);d.x.textAlign='center';d.x.font='bold 40px Inter,Arial';d.x.lineWidth=8;d.x.strokeStyle='rgba(0,0,0,.9)';d.x.strokeText(txt,60,44);d.x.fillStyle=color;d.x.fillText(txt,60,44);d.t.needsUpdate=true;d.s.visible=true;d.s.position.set(p.x,p.y+2.1,p.z);d.life=.85;d.s.material.opacity=1;}
function updateDmg(dt){for(const d of dmgPool){if(d.life<=0)continue;d.life-=dt;d.s.position.y+=1.7*dt;d.s.material.opacity=clamp(d.life/.5,0,1);if(d.life<=0)d.s.visible=false;}}

/* LOBBY con piedras rúnicas */
const world=new THREE.Group();scene.add(world);
const plat=new THREE.Mesh(new THREE.CylinderGeometry(11,12.2,1.4,8),[
 new THREE.MeshStandardMaterial({map:stone1,roughness:.95}),new THREE.MeshStandardMaterial({map:stone4,roughness:.95}),new THREE.MeshStandardMaterial({color:0x241d38})]);
plat.position.y=-.7;plat.receiveShadow=true;world.add(plat);
const runes=new THREE.Mesh(new THREE.PlaneGeometry(23,23),new THREE.MeshBasicMaterial({map:runeRingTex(),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
runes.rotation.x=-Math.PI/2;runes.position.y=.03;world.add(runes);
for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.3;
 const st=new THREE.Mesh(new THREE.BoxGeometry(.5,2.4,.35),new THREE.MeshStandardMaterial({map:stone1,roughness:.9}));
 st.position.set(Math.cos(a)*10,1.1,Math.sin(a)*10);st.rotation.y=-a;st.rotation.z=rand(-.12,.12);st.castShadow=true;world.add(st);
 const gl=glowSprite(0x8a6bff,.9,.5);gl.position.set(Math.cos(a)*10,2.6,Math.sin(a)*10);world.add(gl);}
for(let i=0;i<3;i++){const a=rand(0,7),r=12.5;const slab=new THREE.Mesh(new THREE.BoxGeometry(rand(2,3.4),.5,rand(1.5,2.4)),new THREE.MeshStandardMaterial({map:stone1,roughness:.95}));
 slab.position.set(Math.cos(a)*r,-1-rand(0,1.5),Math.sin(a)*r);slab.rotation.set(rand(-.3,.3),a,rand(-.3,.3));world.add(slab);}
const debris=[];for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(rand(.25,.8)),new THREE.MeshStandardMaterial({color:0x453a63,roughness:.9}));
 const a=rand(0,7),r=rand(12,17);m.position.set(Math.cos(a)*r,rand(-2,-18),Math.sin(a)*r);world.add(m);debris.push({m,sp:rand(.4,1.2)});}
const vor=new THREE.Mesh(new THREE.PlaneGeometry(260,260),new THREE.MeshBasicMaterial({map:vortexTex(),transparent:true,opacity:.8,depthWrite:false}));
vor.rotation.x=-Math.PI/2;vor.position.set(100,-17,0);scene.add(vor);
const portal=new THREE.Group();
const pRing=new THREE.Mesh(new THREE.PlaneGeometry(5.6,5.6),new THREE.MeshBasicMaterial({map:portalTex(),transparent:true,side:THREE.DoubleSide,depthWrite:false}));
const pInner=new THREE.Mesh(new THREE.CircleGeometry(2.05,40),new THREE.MeshBasicMaterial({color:0x120826,transparent:true,opacity:.9,depthWrite:false}));
pInner.position.z=-.02;portal.add(pRing);portal.add(pInner);portal.position.y=2.6;portal.visible=false;
const pLight=new THREE.PointLight(0xffc050,0,18);portal.add(pLight);world.add(portal);
const orbs=[];
EL_KEYS.forEach((k,i)=>{const E=ELEMENTS[k],g=new THREE.Group();
 const ped=new THREE.Mesh(new THREE.CylinderGeometry(.5,.62,.8,10),new THREE.MeshStandardMaterial({color:0x3a3150,roughness:.9}));ped.position.y=.4;ped.castShadow=true;g.add(ped);
 const core=new THREE.Mesh(new THREE.SphereGeometry(.34,20,16),new THREE.MeshBasicMaterial({color:E.color}));core.position.y=1.35;g.add(core);
 const gl=glowSprite(E.color,2.6,.85);gl.position.y=1.35;g.add(gl);
 const lb=textSprite(E.emoji+' '+E.name,mastery[k]>=100?'DOMINADO ★':'¡NUEVO!',mastery[k]>=100?'#b8b8c8':E.css);lb.position.y=2.5;g.add(lb);
 const a=i/8*Math.PI*2;g.position.set(Math.cos(a)*6.4,0,Math.sin(a)*6.4);world.add(g);orbs.push({key:k,group:g,core,glow:gl,ph:Math.random()*6,taken:false});});

/* ARENA GRANDE con ruinas */
const arenaGroup=new THREE.Group();arenaGroup.position.x=ARENA_X;arenaGroup.visible=false;scene.add(arenaGroup);
const tiles=[],gridI={};
for(let i=0;i<N;i++)for(let j=0;j<N;j++){
 const ring=Math.max(Math.abs(i-HALF),Math.abs(j-HALF));
 const mat=new THREE.MeshStandardMaterial({map:stone1,roughness:.95,emissive:0x000000,emissiveIntensity:0,transparent:true,opacity:1});
 const m=new THREE.Mesh(new THREE.BoxGeometry(TILE,.6,TILE),mat);
 m.position.set((i-HALF)*TILE,-.3,(j-HALF)*TILE);m.receiveShadow=true;arenaGroup.add(m);
 tiles.push({mesh:m,mat,ring,state:'solid',fallT:0,rz:rand(-.4,.4),rx:rand(-.4,.4)});
 gridI[i+'_'+j]=tiles[tiles.length-1];}
const edgeRune=new THREE.Mesh(new THREE.RingGeometry(ARENA_R+.4,ARENA_R+1.1,56),new THREE.MeshBasicMaterial({map:runeRingTex(),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
edgeRune.rotation.x=-Math.PI/2;edgeRune.position.y=.02;arenaGroup.add(edgeRune);
const lavaPlane=new THREE.Mesh(new THREE.PlaneGeometry(ARENA_R*2+4,ARENA_R*2+4),new THREE.MeshBasicMaterial({color:0xff5500,transparent:true,opacity:.85}));
lavaPlane.rotation.x=-Math.PI/2;lavaPlane.position.y=-3;lavaPlane.visible=false;arenaGroup.add(lavaPlane);
const crystals=new THREE.Group();
for(let i=0;i<8;i++){const h=rand(2,4.5);const c=new THREE.Mesh(new THREE.ConeGeometry(rand(.3,.8),h,5),new THREE.MeshStandardMaterial({color:0x66e0c0,emissive:0x1a6a5a,emissiveIntensity:.6,roughness:.3}));
 const a=rand(0,7),r=rand(11,15);c.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r);crystals.add(c);}
crystals.visible=false;arenaGroup.add(crystals);
for(let i=0;i<6;i++){const h=rand(1.5,3);const col=new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,h,7),new THREE.MeshStandardMaterial({map:stone1,roughness:.9}));
 const a=rand(0,7),r=rand(9,14);col.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r);col.rotation.set(rand(-.2,.2),0,rand(-.25,.25));col.castShadow=true;arenaGroup.add(col);}
for(let i=0;i<10;i++){const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(rand(.4,1)),new THREE.MeshStandardMaterial({color:0x443a5e,roughness:.95}));
 const a=rand(0,7),r=rand(6,15);rk.position.set(Math.cos(a)*r,.2,Math.sin(a)*r);rk.rotation.set(rand(0,3),rand(0,3),0);arenaGroup.add(rk);}
for(let i=0;i<10;i++){const h=rand(18,40);const sp=new THREE.Mesh(new THREE.ConeGeometry(rand(3,7),h,6),new THREE.MeshStandardMaterial({color:0x1c1430,roughness:1}));
 const a=i/10*Math.PI*2,r=rand(45,70);sp.position.set(Math.cos(a)*r,-6,Math.sin(a)*r);arenaGroup.add(sp);}
const pillars=[];
[[-10,-8],[10,-6],[0,9],[-7,6],[7,7]].forEach(pp=>{const h=rand(2.4,3.2);const g=new THREE.Group();
 const c1=new THREE.Mesh(new THREE.CylinderGeometry(.55,.8,h,7),new THREE.MeshStandardMaterial({map:stone1,roughness:.9}));c1.position.y=h/2;c1.castShadow=true;g.add(c1);
 const cry=new THREE.Mesh(new THREE.OctahedronGeometry(.32),new THREE.MeshBasicMaterial({color:0x8a6bff}));cry.position.y=h+.3;g.add(cry);
 const gl=glowSprite(0x8a6bff,1.3,.55);gl.position.y=h+.3;g.add(gl);
 g.position.set(pp[0],0,pp[1]);arenaGroup.add(g);pillars.push({x:pp[0],z:pp[1],r:.85,group:g,doom:false,fallen:false});});
const arenaOrbs=[];
['fuego','agua','rayo'].forEach((k,i)=>{const E=ELEMENTS[k],g=new THREE.Group();
 const core=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),new THREE.MeshBasicMaterial({color:E.color}));core.position.y=.9;g.add(core);
 const gl=glowSprite(E.color,2.2,.8);gl.position.y=.9;g.add(gl);
 const a=i/3*Math.PI*2+.7;g.position.set(Math.cos(a)*7,0,Math.sin(a)*7);arenaGroup.add(g);arenaOrbs.push({key:k,group:g,core,glow:gl,ph:Math.random()*6,taken:false});});
function applyArena(idx){curArena=idx;const A=ARENAS[idx];
 scene.fog.color.setHex(A.fog);
 for(const t of tiles){t.mat.color.setHex(A.tile).multiplyScalar(rand(.85,1.1));t.mat.emissive.setHex(A.emiss);t.mat.emissiveIntensity=1;}
 lavaPlane.visible=(A.style==='lava');crystals.visible=(idx===1);}
function tileAtWorld(wx,wz){const i=Math.round((wx-ARENA_X)/TILE+HALF),j=Math.round(wz/TILE+HALF);
 if(i<0||j<0||i>=N||j>=N)return null;return gridI[i+'_'+j];}
function isSafe(x,z){if(x<ARENA_X-50)return true;const t=tileAtWorld(x,z);return t&&(t.state==='solid'||t.state==='warn');}
function frontier(){return collapseIdx<collapseQueue.length?collapseQueue[collapseIdx]:99;}
function pickSafeTile(fr){const c=[];for(const t of tiles)if(t.state==='solid'&&t.ring<fr)c.push(t);
 if(!c.length)for(const t of tiles)if(t.state==='solid')c.push(t);
 return c.length?c[(Math.random()*c.length)|0]:null;}
function resetArena(){for(const t of tiles){t.state='solid';t.fallT=0;t.mesh.visible=true;t.mesh.position.y=-.3;t.mesh.rotation.set(0,0,0);t.mesh.scale.setScalar(1);t.mat.opacity=1;t.mat.emissiveIntensity=1;}
 for(const p of pillars){p.doom=false;p.fallen=false;p.group.position.y=0;}
 for(const o of arenaOrbs){o.taken=false;o.group.visible=true;}
 for(const z of magmaZones)scene.remove(z.mesh);magmaZones=[];
 for(const t of tornados)scene.remove(t.g);tornados=[];
 collapseIdx=0;warnActive=false;nextCollapseAt=12;collapseDone=false;
 applyArena(arenaIdx());}

/* Personaje v2: adepto con túnica y capucha */
function buildHumanoid(elKey,isPlayer){const E=ELEMENTS[elKey]||ELEMENTS.chispa;const g=new THREE.Group();
 const cloth=isPlayer?0x3d2f52:0x33303f;
 const robe=new THREE.Mesh(new THREE.CylinderGeometry(.16,.5,1.15,10),new THREE.MeshStandardMaterial({color:cloth,roughness:.8}));
 robe.position.y=.75;robe.castShadow=true;g.add(robe);
 const belt=new THREE.Mesh(new THREE.TorusGeometry(.28,.05,8,16),new THREE.MeshStandardMaterial({color:0x8a6b3f,roughness:.6}));
 belt.rotation.x=Math.PI/2;belt.position.y=.98;g.add(belt);
 const hood=new THREE.Mesh(new THREE.ConeGeometry(.3,.55,10,1,true),new THREE.MeshStandardMaterial({color:cloth,side:THREE.DoubleSide,roughness:.8}));
 hood.position.y=1.66;hood.castShadow=true;g.add(hood);
 const face=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),new THREE.MeshStandardMaterial({color:0x14101e,roughness:.9}));
 face.position.y=1.56;g.add(face);
 const eyeMat=new THREE.MeshBasicMaterial({color:E.color});
 const e1=new THREE.Mesh(new THREE.SphereGeometry(.04,8,8),eyeMat);e1.position.set(-.07,1.58,.15);g.add(e1);
 const e2=e1.clone();e2.position.x=.07;g.add(e2);
 const armG=new THREE.CylinderGeometry(.06,.07,.5,7);armG.translate(0,-.22,0);
 const armL=new THREE.Mesh(armG,new THREE.MeshStandardMaterial({color:cloth,roughness:.8}));armL.position.set(-.28,1.3,0);armL.rotation.z=.45;armL.castShadow=true;g.add(armL);
 const armR=new THREE.Mesh(armG.clone(),new THREE.MeshStandardMaterial({color:cloth,roughness:.8}));armR.position.set(.28,1.3,0);armR.rotation.z=-.45;armR.castShadow=true;g.add(armR);
 const h1=new THREE.Mesh(new THREE.SphereGeometry(.09,8,8),new THREE.MeshStandardMaterial({color:0xd9b08c}));h1.position.set(-.42,1.0,.05);g.add(h1);
 const h2=h1.clone();h2.position.x=.42;g.add(h2);
 const sM=new THREE.MeshStandardMaterial({color:0x241a14});
 const s1=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),sM);s1.position.set(-.22,1.4,0);g.add(s1);const s2=s1.clone();s2.position.x=.22;g.add(s2);
 const cape=new THREE.Mesh(new THREE.PlaneGeometry(.55,.85),new THREE.MeshStandardMaterial({color:isPlayer?0x8a1e2c:0x2c2c3a,side:THREE.DoubleSide,roughness:.9}));
 cape.position.set(0,1.0,-.26);cape.rotation.x=.22;g.add(cape);
 const coreMat=new THREE.MeshBasicMaterial({color:E.color});
 const core=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),coreMat);core.position.set(0,1.12,.17);g.add(core);
 const aura=glowSprite(E.color,1.1,.7);aura.position.set(0,1.12,.1);g.add(aura);
 const foot=new THREE.Mesh(new THREE.RingGeometry(.5,.68,24),new THREE.MeshBasicMaterial({color:E.color,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));
 foot.rotation.x=-Math.PI/2;foot.position.y=.05;g.add(foot);
 const swirls=[];const n=isPlayer?3:1;
 for(let i=0;i<n;i++){const m=new THREE.MeshBasicMaterial({color:i===0?E.color:[0xff66cc,0x66ffe0][i-1],transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false});
  const t=new THREE.Mesh(new THREE.TorusGeometry(.85+i*.12,.03,8,40),m);t.position.y=1.05;g.add(t);swirls.push({m,t});}
 const light=isPlayer?new THREE.PointLight(E.color,.9,8):null;if(light){light.position.y=1.4;g.add(light);}

 /* ── Cabeza y hombreras de Ignio (Fuego) — solo visibles con ese elemento activo ── */
 const fireHead=new THREE.Group();
 const fCore=new THREE.Mesh(new THREE.SphereGeometry(.2,12,10),new THREE.MeshBasicMaterial({color:0xffcf6a}));fCore.position.y=1.57;fireHead.add(fCore);
 const fFlame1=new THREE.Mesh(new THREE.ConeGeometry(.2,.5,10),new THREE.MeshBasicMaterial({color:0xff5a1f,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));
 fFlame1.position.y=1.86;fireHead.add(fFlame1);
 const fFlame2=fFlame1.clone();fFlame2.scale.set(.6,1.15,.6);fFlame2.position.set(.08,1.98,.03);fFlame2.rotation.z=.35;fireHead.add(fFlame2);
 const fFlame3=fFlame1.clone();fFlame3.scale.set(.55,.95,.55);fFlame3.position.set(-.09,1.94,-.02);fFlame3.rotation.z=-.3;fireHead.add(fFlame3);
 const fGlow=glowSprite(0xff7a2a,1.5,.85);fGlow.position.y=1.75;fireHead.add(fGlow);
 fireHead.visible=false;g.add(fireHead);
 const blackMat=new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:.55,metalness:.25});
 const trimMat=new THREE.MeshBasicMaterial({color:0xff5a1f});
 const shGeo=new THREE.SphereGeometry(.13,10,8),trGeo=new THREE.TorusGeometry(.15,.025,6,14);
 const sh1=new THREE.Mesh(shGeo,blackMat);sh1.position.set(-.29,1.44,0);
 const sh1t=new THREE.Mesh(trGeo,trimMat);sh1t.position.copy(sh1.position);sh1t.rotation.x=Math.PI/2;
 const sh2=sh1.clone();sh2.position.x=.29;const sh2t=sh1t.clone();sh2t.position.x=.29;
 const fireShoulders=new THREE.Group();fireShoulders.add(sh1,sh1t,sh2,sh2t);fireShoulders.visible=false;g.add(fireShoulders);
 const beltFireTrim=new THREE.Mesh(new THREE.TorusGeometry(.29,.02,6,20),trimMat);beltFireTrim.rotation.x=Math.PI/2;beltFireTrim.position.y=.98;beltFireTrim.visible=false;g.add(beltFireTrim);

 return{group:g,robe,armL,armR,cape,foot,hood,face,eyeMat,coreMat,aura,swirls,light,fireHead,fireShoulders,beltFireTrim};}
function wrapActor(parts,el,isPlayer,name){return Object.assign(parts,{element:el,isPlayer,name,hp:100,alive:true,pos:new THREE.Vector3(),vel:new THREE.Vector3(),rot:0,walk:0,falling:false,combo:null,stealth:0,
 cd1:0,cd2:0,burn:0,burnSrc:null,poison:0,poisonSrc:null,slowT:0,slowF:1,stunT:0,guardT:0,guardP:0,regenT:0,
 invuln:0,dashT:0,dashDir:new THREE.Vector3(),kb:new THREE.Vector3(),fireCd:rand(1,2),target:new THREE.Vector3(),
 strafe:Math.random()<.5?1:-1,strafeT:rand(1,3),aimEnemy:null,moveVec:new THREE.Vector3()});}
function resetActor(a){a.alive=true;a.hp=100;a.falling=false;a.burn=0;a.poison=0;a.slowT=0;a.stunT=0;a.guardT=0;a.regenT=0;a.stealth=0;
 a.kb.set(0,0,0);a.vel.set(0,0,0);a.dashT=0;a.cd1=0;a.cd2=0;a.pos.y=0;a.combo=null;a.group.visible=true;a.group.scale.setScalar(1);}
const player=wrapActor(buildHumanoid('chispa',true),'chispa',true,'Tú');
scene.add(player.group);player.pos.set(0,0,8.5);player.rot=Math.PI;
let actors=[player],bots=[];
const ROBE_COLOR_DEFAULT={player:0x3d2f52,bot:0x33303f};
function setElement(a,el){const E=ELEMENTS[el]||ELEMENTS.chispa;const c=new THREE.Color(E.color);
 a.coreMat.color.copy(c);a.aura.material.color.copy(c);a.eyeMat.color.copy(c);a.foot.material.color.copy(c);
 if(a.swirls[0])a.swirls[0].m.color.copy(c);if(a.light)a.light.color.copy(c);
 const isFire=el==='fuego';
 if(a.hood)a.hood.visible=!isFire;if(a.face)a.face.visible=!isFire;
 if(a.fireHead)a.fireHead.visible=isFire;if(a.fireShoulders)a.fireShoulders.visible=isFire;if(a.beltFireTrim)a.beltFireTrim.visible=isFire;
 const baseCloth=a.isPlayer?ROBE_COLOR_DEFAULT.player:ROBE_COLOR_DEFAULT.bot;
 if(a.robe)a.robe.material.color.setHex(isFire?0x0a0a0a:baseCloth);
 if(a.armL)a.armL.material.color.setHex(isFire?0x0a0a0a:baseCloth);
 if(a.armR)a.armR.material.color.setHex(isFire?0x0a0a0a:baseCloth);
 if(a.cape)a.cape.material.color.setHex(isFire?0xff5a1f:(a.isPlayer?0x8a1e2c:0x2c2c3a));
 if(isFire&&a.isPlayer)a.name='Ignio';else if(a.isPlayer&&a.name==='Ignio')a.name='Tú';}

/* Proyectiles con forma y estela elemental */
const PROJ_LIB={
 fuego:{geo:new THREE.ConeGeometry(.16,.7,8),mat:new THREE.MeshBasicMaterial({color:0xff7a2a}),tr:0xff5a1f,tg:-3,n:2,orient:1},
 agua:{geo:new THREE.SphereGeometry(.2,10,8),mat:new THREE.MeshBasicMaterial({color:0x3fb0ff,transparent:true,opacity:.85}),tr:0x58c8ff,tg:7,n:1},
 tierra:{geo:new THREE.DodecahedronGeometry(.24),mat:new THREE.MeshBasicMaterial({color:0xb98a4b}),tr:0x9c7a4b,tg:5,n:1,tumble:1},
 aire:{geo:new THREE.TorusGeometry(.2,.06,8,18),mat:new THREE.MeshBasicMaterial({color:0xd8f4ff,transparent:true,opacity:.8}),tr:0xbfeaff,tg:1,n:1,spinZ:15,orient:1},
 rayo:{geo:new THREE.OctahedronGeometry(.24),mat:new THREE.MeshBasicMaterial({color:0xffe066}),tr:0xffd23c,tg:2,n:2,tumble:1},
 hielo:{geo:new THREE.ConeGeometry(.14,.8,6),mat:new THREE.MeshBasicMaterial({color:0xbfeaff}),tr:0x9fdcff,tg:1,n:1,orient:1},
 naturaleza:{geo:new THREE.IcosahedronGeometry(.22),mat:new THREE.MeshBasicMaterial({color:0x6fe07a}),tr:0x59d95c,tg:3,n:1,tumble:1},
 metal:{geo:new THREE.CylinderGeometry(.28,.28,.05,14),mat:new THREE.MeshBasicMaterial({color:0xe8eef6}),tr:0xcfd6e0,tg:2,n:1,spinY:25,orient:1},
 chispa:{geo:new THREE.SphereGeometry(.15,8,8),mat:new THREE.MeshBasicMaterial({color:0xffffff}),tr:0xffffff,tg:2,n:1}};
const UPV=new THREE.Vector3(0,1,0);
const projPool=[];for(let i=0;i<60;i++){const m=new THREE.Mesh(PROJ_LIB.chispa.geo,PROJ_LIB.chispa.mat);const gl=glowSprite(0xffffff,1.1,.9);m.add(gl);m.visible=false;scene.add(m);projPool.push({mesh:m,glow:gl,active:false,vel:new THREE.Vector3(),dmg:0,el:'chispa',owner:null,life:0});}
function fireProj(owner,el,dir){const E=ELEMENTS[el]||ELEMENTS.chispa;const p=projPool.find(q=>!q.active);if(!p)return;
 p.active=true;p.mesh.visible=true;p.owner=owner;p.el=el;p.dmg=E.dmg*(owner.isPlayer?1:.8);p.life=1.5;
 const L=PROJ_LIB[el]||PROJ_LIB.chispa;
 p.mesh.geometry=L.geo;p.mesh.material=L.mat;p.glow.material.color.set(E.color);
 p.mesh.position.set(owner.pos.x,1.15,owner.pos.z);p.mesh.position.addScaledVector(dir,.7);
 p.vel.copy(dir).multiplyScalar(E.speed);
 if(L.orient)p.mesh.quaternion.setFromUnitVectors(UPV,dir);
 if(el==='agua')p.mesh.scale.set(1,1.4,1);else p.mesh.scale.setScalar(1);}
function updateProjectiles(dt){for(const p of projPool){if(!p.active)continue;p.life-=dt;
 p.mesh.position.addScaledVector(p.vel,dt);
 const L=PROJ_LIB[p.el]||PROJ_LIB.chispa;
 if(L.spinY)p.mesh.rotateY(dt*L.spinY);if(L.spinZ)p.mesh.rotateZ(dt*L.spinZ);
 if(L.tumble){p.mesh.rotateX(dt*6);p.mesh.rotateY(dt*8);}
 for(let k=0;k<L.n;k++)sparks.burst(p.mesh.position,L.tr,1,1.2,.35,L.tg);
 let dead=p.life<=0;const mp=p.mesh.position;
 if(!dead&&mp.x>ARENA_X-30){for(const pi of pillars){if(!pi.fallen&&Math.hypot(mp.x-ARENA_X-pi.x,mp.z-pi.z)<pi.r+.15){sparks.burst(mp,ELEMENTS[p.el].color,6,4,.4,6);dead=true;break;}}
  if(!dead&&Math.hypot(mp.x-ARENA_X,mp.z)>ARENA_R+1)dead=true;}
 if(!dead)for(const a of actors){if(!a.alive||a===p.owner)continue;
  if(Math.hypot(a.pos.x-mp.x,a.pos.z-mp.z)<.8&&Math.abs(a.pos.y+1.1-mp.y)<1.4){
   const dir=new THREE.Vector3(p.vel.x,0,p.vel.z).normalize();
   damageActor(a,p.dmg,p.owner,p.el,dir);
   if(p.el==='rayo'){let best=null,bd=6;for(const o of actors){if(o===a||o===p.owner||!o.alive)continue;const d=o.pos.distanceTo(a.pos);if(d<bd){bd=d;best=o;}}
    if(best){makeBolt(new THREE.Vector3(a.pos.x,a.pos.y+1.2,a.pos.z),new THREE.Vector3(best.pos.x,best.pos.y+1.2,best.pos.z),0xffd23c,.25,.4);damageActor(best,p.dmg*.6,p.owner,'rayo',dir);}}
   dead=true;break;}}
 if(dead){const E=ELEMENTS[p.el];sparks.burst(mp,E.color,p.el==='fuego'?14:9,6,.5,6);
  if(p.el==='fuego'||p.el==='agua')puffs.burst(mp,E.color,8,5,.5,3);
  p.active=false;p.mesh.visible=false;}}}

function aimDir(a){
 if(a.isPlayer&&manualAiming&&Math.hypot(aimVec.x,aimVec.y)>.15)return new THREE.Vector3(aimVec.x,0,aimVec.y).normalize();
 if(a.isPlayer){let best=null,bd=24;for(const o of actors){if(o===a||!o.alive||o.stealth>0)continue;const d=o.pos.distanceTo(a.pos);if(d<bd){bd=d;best=o;}}
 if(best){a.aimEnemy=best;return new THREE.Vector3(best.pos.x-a.pos.x,0,best.pos.z-a.pos.z).normalize();}}
 if(a.aimEnemy&&a.aimEnemy.alive)return new THREE.Vector3(a.aimEnemy.pos.x-a.pos.x,0,a.aimEnemy.pos.z-a.pos.z).normalize();
 return new THREE.Vector3(Math.sin(a.rot),0,Math.cos(a.rot));}
function castMain(a){if(a.cd1>0||!a.alive||a.stunT>0||matchOver)return;const E=ELEMENTS[a.element]||ELEMENTS.chispa;a.cd1=E.cd;
 const dir=aimDir(a);fireProj(a,a.element,dir);
 sparks.burst(new THREE.Vector3(a.pos.x+dir.x*.7,1.2,a.pos.z+dir.z*.7),E.color,6,4,.3,4);
 AU.cast(a.element,a.isPlayer?1:clamp(1-a.pos.distanceTo(player.pos)/45,0,1)*.7);
 if(a.isPlayer&&a.element!=='chispa'){session.use[a.element]=(session.use[a.element]||0)+1;checkLiveUnlock(a.element);}}
function castSecondary(a){if(a.cd2>0||!a.alive||a.stunT>0||matchOver)return;
 if(a.isPlayer&&a.combo){castCombo(a);return;}
 a.cd2=5;const el=a.element,P=new THREE.Vector3(a.pos.x,a.pos.y+1,a.pos.z);
 if(el==='fuego'){
  /* Embestida de Ignio: arremetida corta con estela ardiente que quema a quien toca */
  const dir=aimDir(a)||new THREE.Vector3(Math.sin(a.rot),0,Math.cos(a.rot));
  a.dashT=.3;a.dashDir.copy(dir);a.invuln=Math.max(a.invuln,.28);
  AU.boom();AU.dash();shake=Math.max(shake,.4);puffs.burst(P,0xff5a1f,26,8,.6,2);
  for(const o of actors){if(o===a||!o.alive)continue;
   const rel=new THREE.Vector3(o.pos.x-a.pos.x,0,o.pos.z-a.pos.z);const d=rel.length();
   if(d<6.5&&rel.normalize().dot(dir)>.4)damageActor(o,22,a,'fuego',rel);}}
 else if(el==='agua'){a.hp=Math.min(100,a.hp+34);AU.heal();puffs.burst(P,0x58c8ff,22,4,.8,-1);dmgNumber(a.pos,'+34','#6cf08a');}
 else if(el==='tierra'){a.guardT=4;a.guardP=.65;AU.shield();puffs.burst(P,0xc98a3c,18,5,.6,2);}
 else if(el==='aire'||el==='chispa'){a.dashT=.22;a.dashDir.copy(moveDirWorld()||aimDir(a));a.invuln=Math.max(a.invuln,.3);AU.dash();}
 else if(el==='rayo'){AU.cast('rayo',1);puffs.burst(P,0xffd23c,26,8,.5,2);
  for(const o of actors){if(o===a||!o.alive)continue;if(o.pos.distanceTo(a.pos)<5){o.stunT=1.3;makeBolt(P.clone(),new THREE.Vector3(o.pos.x,o.pos.y+1.5,o.pos.z),0xffd23c,.3,.4);damageActor(o,8,a,'rayo',new THREE.Vector3(o.pos.x-a.pos.x,0,o.pos.z-a.pos.z).normalize());}}}
 else if(el==='hielo'){AU.shield();puffs.burst(P,0x9fdcff,26,7,.6,2);
  for(const o of actors){if(o===a||!o.alive)continue;if(o.pos.distanceTo(a.pos)<5){o.slowT=2.5;o.slowF=.15;damageActor(o,10,a,'hielo',new THREE.Vector3(o.pos.x-a.pos.x,0,o.pos.z-a.pos.z).normalize());}}}
 else if(el==='naturaleza'){a.regenT=5;AU.heal();puffs.burst(P,0x59d95c,20,4,.8,-1);}
 else if(el==='metal'){a.guardT=3;a.guardP=.7;AU.shield();puffs.burst(P,0xcfd6e0,18,5,.6,2);}
 if(a.isPlayer&&el!=='chispa'){session.use[el]=(session.use[el]||0)+1;checkLiveUnlock(el);}}
function castCombo(a){a.cd2=8;const C=a.combo,P=new THREE.Vector3(a.pos.x,a.pos.y+1,a.pos.z);
 AU.boom();AU.fanfare();shake=Math.max(shake,.4);
 const foes=actors.filter(o=>o!==a&&o.alive);
 if(C.name==='Vapor'){puffs.burst(P,0xcccccc,30,7,1,1);
  for(const o of foes)if(o.pos.distanceTo(a.pos)<6){o.slowT=3;o.slowF=.3;o.stunT=Math.max(o.stunT,1);}}
 else if(C.name==='Magma'){const dir=aimDir(a);const pos=new THREE.Vector3(a.pos.x+dir.x*6,0,a.pos.z+dir.z*6);
  const mesh=new THREE.Mesh(new THREE.CircleGeometry(3,24),new THREE.MeshBasicMaterial({color:0xff6a00,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));
  mesh.rotation.x=-Math.PI/2;mesh.position.set(pos.x,.06,pos.z);scene.add(mesh);magmaZones.push({mesh,pos,t:4});}
 else if(C.name==='Tormenta Ígnea'){const dir=aimDir(a);const g=new THREE.Group();
  const c1=new THREE.Mesh(new THREE.ConeGeometry(.8,2.4,8),new THREE.MeshBasicMaterial({color:0xff8844,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));
  c1.position.y=1.2;g.add(c1);g.position.set(a.pos.x+dir.x*3,0,a.pos.z+dir.z*3);scene.add(g);
  tornados.push({g,vel:dir.clone().multiplyScalar(7),t:3,spin:0});}
 else if(C.name==='Plasma'){const dir=aimDir(a);const end=new THREE.Vector3(a.pos.x+dir.x*18,1.2,a.pos.z+dir.z*18);
  makeBolt(new THREE.Vector3(a.pos.x,1.2,a.pos.z),end,0xffee66,.4,.25);
  for(const o of foes)if(o.pos.distanceTo(a.pos)<18){const rel=new THREE.Vector3(o.pos.x-a.pos.x,0,o.pos.z-a.pos.z);
   if(rel.normalize().dot(dir)>.85)damageActor(o,30,a,'fuego',dir);}}
 else if(C.name==='Niebla'){a.stealth=3;puffs.burst(P,0xaaccdd,26,5,.8,1);showBanner('🌫️ NIEBLA','Eres invisible para los bots',1.5);}
 else if(C.name==='Glaciar'){puffs.burst(P,0xaef4ff,30,8,.8,2);
  for(const o of foes)if(o.pos.distanceTo(a.pos)<7){o.stunT=Math.max(o.stunT,2);o.slowT=2.5;o.slowF=.2;}}
 else if(C.name==='Vida'){a.hp=Math.min(100,a.hp+60);a.regenT=5;AU.heal();puffs.burst(P,0x66ff99,26,5,1,-1);dmgNumber(a.pos,'+60','#6cf08a');}
 else if(C.name==='Tormenta Eléctrica'){let n=0;
  for(const o of foes)if(n<3&&o.pos.distanceTo(a.pos)<12){n++;
   makeBolt(new THREE.Vector3(o.pos.x,o.pos.y+9,o.pos.z),new THREE.Vector3(o.pos.x,o.pos.y+1,o.pos.z),0xffff88,.3,.3);
   damageActor(o,12,a,'rayo',new THREE.Vector3(0,0,0));o.stunT=Math.max(o.stunT,.6);}}
 for(const el of C.els){session.use[el]=(session.use[el]||0)+2;checkLiveUnlock(el);}}
function checkLiveUnlock(el){if(el&&mastery[el]!==undefined&&mastery[el]<100&&effMastery(el)>=100){AU.fanfare();showBanner('¡'+ELEMENTS[el].name.toUpperCase()+' DOMINADO!','Este elemento es tuyo para siempre',3);}}
function hurtFlash(){$('hurtFx').style.opacity=.9;setTimeout(()=>$('hurtFx').style.opacity=0,90);}
function damageActor(t,dmg,src,el,dir){if(!t.alive||t.invuln>0||matchOver)return false;
 if(t.guardT>0){dmg*=(1-t.guardP);sparks.burst(new THREE.Vector3(t.pos.x,t.pos.y+1.2,t.pos.z),0xc99a4b,6,4,.4,6);}
 t.hp-=dmg;if(src&&src.isPlayer)stats.dmg+=dmg;
 dmgNumber(t.pos,Math.round(dmg),ELEMENTS[el]?ELEMENTS[el].css:'#fff');
 sparks.burst(new THREE.Vector3(t.pos.x,t.pos.y+1.2,t.pos.z),ELEMENTS[el]?ELEMENTS[el].color:0xffffff,8,5,.4,8);
 if(el==='fuego'){t.burn=3;t.burnSrc=src;}
 if(el==='naturaleza'){t.poison=4;t.poisonSrc=src;}
 if(el==='agua'){t.slowT=2.2;t.slowF=.5;}
 if(el==='hielo'){t.slowT=1.5;t.slowF=.25;}
 if((el==='tierra'||el==='metal')&&dir)t.kb.addScaledVector(dir,5);
 if(el==='aire'&&dir)t.kb.addScaledVector(dir,9);
 if(t.isPlayer){AU.hurt();hurtFlash();shake=Math.max(shake,.25);}else AU.hit();
 if(t.hp<=0)killActor(t,src,false);return true;}
function killActor(t,src,byFall){if(!t.alive)return;
 const aliveBefore=actors.filter(a=>a.alive).length;
 t.alive=false;t.group.visible=false;t.falling=false;
 puffs.burst(new THREE.Vector3(t.pos.x,t.pos.y+1,t.pos.z),ELEMENTS[t.element]?ELEMENTS[t.element].color:0xffffff,30,8,.9,5);
 AU.boom();if(t.isPlayer)shake=Math.max(shake,.7);
 if(t.isPlayer){endMatch(false,aliveBefore);return;}
 if(byFall)addFeed('🕳 '+t.name+' cayó al vacío');
 else if(src&&src.isPlayer){stats.kills++;if(player.element!=='chispa'){session.kill[player.element]=(session.kill[player.element]||0)+1;
  addFeed('💥 Derrotaste a '+t.name+' <span class="plus">+10% '+ELEMENTS[player.element].name+'</span>');checkLiveUnlock(player.element);}
  else addFeed('💥 Derrotaste a '+t.name);}
 else if(src)addFeed('☠ '+src.name+' eliminó a '+t.name);
 if(player.alive&&actors.filter(a=>a.alive).length===1&&!matchOver)endMatch(true,1);}

function spawnBots(){for(const b of bots)scene.remove(b.group);bots=[];
 const aggro=1+curArena*.2;
 for(let i=0;i<4;i++){const el=EL_KEYS[(Math.random()*8)|0];
  const b=wrapActor(buildHumanoid(el,false),el,false,BOT_NAMES[i]);
  const a=i/4*Math.PI*2+rand(-.4,.4),r=rand(7,11);
  b.pos.set(ARENA_X+Math.cos(a)*r,0,Math.sin(a)*r);b.rot=a+Math.PI;b.invuln=1.5;b.aggro=aggro;
  b.target.set(ARENA_X+rand(-6,6),0,rand(-6,6));
  scene.add(b.group);bots.push(b);}
 actors=[player,...bots];}
function retargetBot(b){const t=pickSafeTile(frontier());
 if(t)b.target.set(ARENA_X+t.mesh.position.x+rand(-1,1),0,t.mesh.position.z+rand(-1,1));
 else b.target.set(ARENA_X,0,0);}
function updateBot(b,dt){if(!b.alive)return;b.strafeT-=dt;if(b.strafeT<=0){b.strafe*=-1;b.strafeT=rand(1.5,3.5);}
 const tl=tileAtWorld(b.pos.x,b.pos.z);
 if(tl&&tl.state!=='solid')retargetBot(b);
 let best=null,bd=15;for(const o of actors){if(o===b||!o.alive||o.stealth>0)continue;const d=o.pos.distanceTo(b.pos);if(d<bd){bd=d;best=o;}}
 b.aimEnemy=best;const mv=b.moveVec.set(0,0,0);
 if(best&&b.stunT<=0){const dir=new THREE.Vector3(best.pos.x-b.pos.x,0,best.pos.z-b.pos.z).normalize();
  if(bd>9)mv.copy(dir);else if(bd<4.5)mv.copy(dir).multiplyScalar(-.7);
  mv.x+=-dir.z*b.strafe*.6;mv.z+=dir.x*b.strafe*.6;
  b.rot=Math.atan2(dir.x,dir.z);b.fireCd-=dt;
  if(b.fireCd<=0&&bd<14){b.fireCd=rand(1.6,2.6)/(b.aggro||1);
   fireProj(b,b.element,dir.clone().applyAxisAngle(new THREE.Vector3(0,1,0),rand(-.25,.25)));
   AU.cast(b.element,clamp(1-b.pos.distanceTo(player.pos)/45,0,1)*.6);}}
 else if(b.stunT<=0){if(b.pos.distanceTo(b.target)<1.2||!isSafe(b.target.x,b.target.z))retargetBot(b);
  mv.set(b.target.x-b.pos.x,0,b.target.z-b.pos.z);const m=mv.length();if(m>.01)mv.divideScalar(m);
  if(mv.lengthSq()>.01)b.rot=Math.atan2(mv.x,mv.z);}}
function respawnSafe(a){const t=pickSafeTile(frontier());
 const x=t?ARENA_X+t.mesh.position.x:ARENA_X,z=t?t.mesh.position.z:0;
 a.pos.set(x,0,z);a.vel.set(0,0,0);a.falling=false;a.invuln=1.6;
 puffs.burst(new THREE.Vector3(x,1,z),0x8a6bff,16,5,.7,-1);}

function actorPhysics(a,dt){if(!a.alive)return;
 a.cd1=Math.max(0,a.cd1-dt);a.cd2=Math.max(0,a.cd2-dt);a.invuln=Math.max(0,a.invuln-dt);
 a.stunT=Math.max(0,a.stunT-dt);a.slowT=Math.max(0,a.slowT-dt);a.guardT=Math.max(0,a.guardT-dt);
 a.stealth=Math.max(0,a.stealth-dt);
 if(a.regenT>0){a.regenT-=dt;a.hp=Math.min(100,a.hp+5*dt);if(Math.random()<.1)sparks.burst(new THREE.Vector3(a.pos.x,a.pos.y+1.2,a.pos.z),0x59d95c,1,2,.5,-2);}
 if(a.burn>0){a.burn-=dt;a.hp-=5*dt;if(Math.random()<.2)sparks.burst(new THREE.Vector3(a.pos.x,a.pos.y+1.4,a.pos.z),0xff5a1f,2,2,.4,-3);
  if(a.hp<=0){killActor(a,a.burnSrc,false);return;}}
 if(a.poison>0){a.poison-=dt;a.hp-=4*dt;if(Math.random()<.2)sparks.burst(new THREE.Vector3(a.pos.x,a.pos.y+1.4,a.pos.z),0x59d95c,2,2,.4,-3);
  if(a.hp<=0){killActor(a,a.poisonSrc,false);return;}}
 if(a.kb.lengthSq()>.01){a.pos.addScaledVector(a.kb,dt);a.kb.multiplyScalar(Math.max(0,1-6*dt));}
 let mv=a.isPlayer?(moveDirWorld()||new THREE.Vector3()):a.moveVec;
 if(a.stunT>0||a.falling)mv=new THREE.Vector3();
 let sp=7.5*(a.slowT>0?a.slowF:1);
 if(a.dashT>0){a.dashT-=dt;a.vel.copy(a.dashDir).multiplyScalar(30);const dashCol=ELEMENTS[a.element]?ELEMENTS[a.element].color:0xbfeaff;sparks.burst(new THREE.Vector3(a.pos.x,a.pos.y+1,a.pos.z),dashCol,2,2,.35,2);}
 else{const desired=mv.clone().normalize().multiplyScalar(sp*Math.min(1,mv.length()));
  a.vel.lerp(desired,1-Math.exp(-12*dt));}
 a.pos.addScaledVector(a.vel,dt);
 const spd=a.vel.length(),mvAmt=clamp(spd/7.5,0,1.2);
 a.walk+=spd*dt*2.4;
 if(a.isPlayer&&manualAiming&&Math.hypot(aimVec.x,aimVec.y)>.15){
  const want=Math.atan2(aimVec.x,aimVec.y);let d=want-a.rot;d=Math.atan2(Math.sin(d),Math.cos(d));a.rot+=d*Math.min(1,14*dt);}
 else if(spd>.5){const want=Math.atan2(a.vel.x,a.vel.z);let d=want-a.rot;d=Math.atan2(Math.sin(d),Math.cos(d));a.rot+=d*Math.min(1,10*dt);}
 const sw=Math.sin(a.walk)*.5*mvAmt;
 a.armL.rotation.x=sw;a.armR.rotation.x=-sw;
 a.robe.rotation.z=Math.sin(a.walk*.5)*.06*mvAmt;
 a.cape.rotation.x=.22+Math.sin(a.walk)*.1*mvAmt;
 const bounce=Math.abs(Math.sin(a.walk))*.07*mvAmt;
 if(phase==='lobby'||phase==='cinema'||phase==='suck'){const r=Math.hypot(a.pos.x,a.pos.z);if(r>10.4){a.pos.x*=10.4/r;a.pos.z*=10.4/r;}}
 if(phase==='battle'&&!a.falling){
  for(const p of pillars){if(p.fallen)continue;const dx=a.pos.x-(ARENA_X+p.x),dz=a.pos.z-p.z,d=Math.hypot(dx,dz),min=p.r+.45;
   if(d<min&&d>.001){a.pos.x=ARENA_X+p.x+dx/d*min;a.pos.z=p.z+dz/d*min;}}
  a.pos.x=clamp(a.pos.x,ARENA_X-ARENA_R,ARENA_X+ARENA_R);a.pos.z=clamp(a.pos.z,-ARENA_R,ARENA_R);
  if(!isSafe(a.pos.x,a.pos.z)){a.falling=true;AU.hurt();}}
 if(a.falling){a.pos.y-=16*dt;
  if(a.pos.y<-11){a.hp-=25;
   if(a.hp<=0){killActor(a,null,true);}
   else{respawnSafe(a);dmgNumber(a.pos,'-25','#ff6a4d');if(a.isPlayer)hurtFlash();}}}
 else a.pos.y=0;
 a.group.position.set(a.pos.x,a.pos.y+bounce,a.pos.z);a.group.rotation.y=a.rot;
 a.foot.material.opacity=.35+Math.sin(phaseT*4)*.2;
 a.swirls.forEach((s,i)=>{s.t.rotation.x+=dt*(1.5+i*.7);s.t.rotation.y+=dt*(2+i*.5);});
 if(a.invuln>0)a.group.visible=Math.sin(phaseT*30)>-.4;else a.group.visible=true;}

/* Colapso */
function startWarn(){warnActive=true;warnT=4;const r=collapseQueue[collapseIdx];
 for(const t of tiles)if(t.ring===r){t.state='warn';t.mat.emissive.setHex(0xff2a11);}
 AU.warn();showBanner('¡COLAPSO INMINENTE!',ARENAS[curArena].desc,2);}
function startFall(){const r=collapseQueue[collapseIdx];
 for(const t of tiles)if(t.ring===r)t.state='falling';
 for(const p of pillars){const tl=tileAtWorld(ARENA_X+p.x,p.z);if(tl&&tl.ring===r)p.doom=true;}
 for(const o of arenaOrbs){if(!o.taken){const tl=tileAtWorld(ARENA_X+o.group.position.x,o.group.position.z);
  if(tl&&tl.ring===r){o.taken=true;o.group.visible=false;}}}
 AU.rumble();shake=Math.max(shake,.5);collapseIdx++;warnActive=false;
 if(collapseIdx>=collapseQueue.length){collapseDone=true;showBanner('¡ÚLTIMA PLATAFORMA!','El núcleo es todo lo que queda',2.5);}
 else nextCollapseAt=battleTime+10;}
function updateCollapse(dt){if(collapseDone)return;
 if(battleTime>180){nextCollapseAt=Math.min(nextCollapseAt,battleTime+.5);if(warnActive)warnT=Math.min(warnT,1);}
 if(!warnActive&&battleTime>=nextCollapseAt)startWarn();
 if(warnActive){warnT-=dt;if(warnT<=0)startFall();}
 const style=ARENAS[curArena].style;
 for(const t of tiles){
  if(t.state==='warn')t.mat.emissiveIntensity=(Math.sin(phaseT*10)+1)*.4;
  else if(t.state==='falling'){t.fallT+=dt;const k=Math.min(1,t.fallT/1.2);
   if(style==='fall'){t.mesh.position.y=-.3-k*k*16;t.mesh.rotation.z=t.rz*k;t.mesh.rotation.x=t.rx*k;}
   else if(style==='dust'){t.mesh.scale.setScalar(Math.max(.01,1-k));t.mat.opacity=1-k;
    if(Math.random()<.3)sparks.burst(new THREE.Vector3(t.mesh.position.x+ARENA_X,.3,t.mesh.position.z),0x66ffe0,2,3,.6,-2);}
   else if(style==='lava'){t.mesh.position.y=-.3-k*k*20;
    if(Math.random()<.3)sparks.burst(new THREE.Vector3(t.mesh.position.x+ARENA_X,.2,t.mesh.position.z),0xff5500,2,4,.6,-3);}
   else{t.mat.opacity=1-k;t.mesh.position.y=-.3+k*2;}
   if(k>=1){t.state='gone';t.mesh.visible=false;}}}
 if(curArena===3)for(const t of tiles)if(t.state==='solid')t.mat.emissive.setHSL((phaseT*.08+t.ring*.06)%1,.6,.12);}
function updatePillarsFall(dt){for(const p of pillars){if(p.doom&&!p.fallen){p.group.position.y-=14*dt;if(p.group.position.y<-12)p.fallen=true;}}}
function updateComboFx(dt){
 for(let i=magmaZones.length-1;i>=0;i--){const z=magmaZones[i];z.t-=dt;
  z.mesh.material.opacity=.4+.3*Math.sin(phaseT*8);
  for(const a of actors)if(a.alive&&Math.hypot(a.pos.x-z.pos.x,a.pos.z-z.pos.z)<3){a.hp-=8*dt;
   if(Math.random()<.2)sparks.burst(new THREE.Vector3(a.pos.x,a.pos.y+1,a.pos.z),0xff6a00,2,3,.4,-3);
   if(a.hp<=0){killActor(a,player,false);}}
  if(z.t<=0){scene.remove(z.mesh);magmaZones.splice(i,1);}}
 for(let i=tornados.length-1;i>=0;i--){const t=tornados[i];t.t-=dt;t.spin+=dt*10;
  t.g.position.addScaledVector(t.vel,dt);t.g.rotation.y=t.spin;
  if(Math.random()<.5)sparks.burst(new THREE.Vector3(t.g.position.x,1,t.g.position.z),0xff8844,2,4,.5,-2);
  for(const a of actors)if(a.alive&&a!==player&&Math.hypot(a.pos.x-t.g.position.x,a.pos.z-t.g.position.z)<2){a.hp-=15*dt;a.burn=1.5;a.burnSrc=player;
   if(a.hp<=0)killActor(a,player,false);}
  const lx=t.g.position.x-ARENA_X;if(Math.abs(lx)>ARENA_R||Math.abs(t.g.position.z)>ARENA_R)t.t=0;
  if(t.t<=0){scene.remove(t.g);tornados.splice(i,1);}}}

/* Input */
const keys={};let attackHeld=false,joyId=null,joyVec={x:0,y:0},joyOrigin={x:0,y:0};
let aimId=null,aimVec={x:0,y:0},aimOrigin={x:0,y:0},manualAiming=false;
addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
 if(e.code==='Space')attackHeld=true;
 if(e.code==='KeyE'&&phase==='battle')castSecondary(player);
 if(e.code==='Space'&&phase==='battle')castMain(player);});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='Space')attackHeld=false;});
function moveDirWorld(){let x=joyVec.x,y=joyVec.y;
 if(keys.KeyW||keys.ArrowUp)y-=1;if(keys.KeyS||keys.ArrowDown)y+=1;
 if(keys.KeyA||keys.ArrowLeft)x-=1;if(keys.KeyD||keys.ArrowRight)x+=1;
 const m=Math.hypot(x,y);if(m<.01)return null;return new THREE.Vector3(x/m,0,y/m);}
document.addEventListener('pointerdown',e=>{
 if(phase==='cinema'&&phaseT>1){fastForward();return;}
 if(e.target.closest('#btnAtk,#btnSec,.eqChip,.screen,.chip,.modal'))return;
 if((phase==='lobby'||phase==='battle')&&e.clientX<innerWidth*.5&&joyId===null&&e.pointerType!=='mouse'){
  joyId=e.pointerId;joyOrigin={x:e.clientX,y:e.clientY};$('joyBase').style.display='block';$('joyBase').style.left=(e.clientX-56)+'px';$('joyBase').style.top=(e.clientY-56)+'px';return;}
 if((phase==='lobby'||phase==='battle')&&e.clientX>=innerWidth*.5&&aimId===null&&e.pointerType!=='mouse'){
  aimId=e.pointerId;aimOrigin={x:e.clientX,y:e.clientY};manualAiming=true;$('joyBase2').style.display='block';$('joyBase2').style.left=(e.clientX-56)+'px';$('joyBase2').style.top=(e.clientY-56)+'px';}});
document.addEventListener('pointermove',e=>{
 if(e.pointerId===joyId){let dx=(e.clientX-joyOrigin.x)/50,dy=(e.clientY-joyOrigin.y)/50;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}
  joyVec={x:dx,y:dy};$('joyKnob').style.transform='translate('+(dx*34)+'px,'+(dy*34)+'px)';return;}
 if(e.pointerId===aimId){let dx=(e.clientX-aimOrigin.x)/50,dy=(e.clientY-aimOrigin.y)/50;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}
  aimVec={x:dx,y:dy};$('joyKnob2').style.transform='translate('+(dx*34)+'px,'+(dy*34)+'px)';}});
function endJoy(e){if(e.pointerId===joyId){joyId=null;joyVec={x:0,y:0};$('joyBase').style.display='none';$('joyKnob').style.transform='none';}
 if(e.pointerId===aimId){aimId=null;aimVec={x:0,y:0};manualAiming=false;$('joyBase2').style.display='none';$('joyKnob2').style.transform='none';}}
document.addEventListener('pointerup',endJoy);document.addEventListener('pointercancel',endJoy);
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
$('btnAtk').addEventListener('pointerdown',e=>{e.preventDefault();attackHeld=true;if(phase==='battle')castMain(player);});
$('btnAtk').addEventListener('pointerup',()=>attackHeld=false);
$('btnAtk').addEventListener('pointerleave',()=>attackHeld=false);
$('btnSec').addEventListener('pointerdown',e=>{e.preventDefault();if(phase==='battle')castSecondary(player);});

/* FX / flujo */
function flashFx(op,dur){$('flash').style.transition='none';$('flash').style.opacity=op;requestAnimationFrame(()=>{$('flash').style.transition='opacity '+dur+'s';$('flash').style.opacity=0;});}
let bannerTO=null;
function showBanner(m,s,d){$('bannerMain').textContent=m;$('bannerSub').textContent=s||'';$('banner').style.opacity=1;clearTimeout(bannerTO);bannerTO=setTimeout(()=>$('banner').style.opacity=0,(d||2.4)*1000);}
function addFeed(h){const d=document.createElement('div');d.className='feedItem';d.innerHTML=h;$('feed').prepend(d);while($('feed').children.length>4)$('feed').lastChild.remove();setTimeout(()=>{d.style.opacity=0;setTimeout(()=>d.remove(),900);},3800);}
function setCinema(t){$('cinemaText').style.opacity=t?1:0;if(t)$('cinemaText').textContent=t;}
window.__startGame=()=>{$('titleScreen').style.display='none';$('resultScreen').style.display='none';startCinema();};
window.__retry=()=>{$('resultScreen').style.display='none';startCinema();};
window.__toMenu=()=>{$('resultScreen').style.display='none';$('hud').style.display='none';renderTitleBars();$('titleScreen').style.display='flex';phase='menu';
 portal.visible=false;portalOn=false;arenaGroup.visible=false;resetArena();resetActor(player);
 orbs.forEach(o=>{o.taken=false;o.group.visible=true;});
 chosen=null;matchOver=false;player.pos.set(0,0,8.5);player.group.position.copy(player.pos);};
function startCinema(){phase='cinema';phaseT=0;boomDone=false;ignited=false;line=0;blurVal=14;matchOver=false;
 session={pick:{},use:{},kill:{},once:{}};stats={kills:0,dmg:0};battleTime=0;
 $('letterTop').style.height='7vh';$('letterBot').style.height='7vh';
 chosen=null;player.element='chispa';setElement(player,'chispa');resetActor(player);
 player.pos.set(0,0,8.5);player.rot=Math.PI;player.group.position.copy(player.pos);
 $('elCard').style.display='none';$('btnAtk').style.display='none';$('btnSec').style.display='none';
 setCinema('«Estás en un lugar extraño…»');}
function doBoom(){if(boomDone)return;boomDone=true;AU.boom();shake=1.7;flashFx(1,1.3);
 [0xff5a1f,0x2f9dff,0xc98a3c,0xbfeaff,0xffd23c,0x59d95c].forEach(col=>puffs.burst(new THREE.Vector3(player.pos.x,1.5,player.pos.z),col,12,7,1.1,2));}
function ignite(){if(ignited)return;ignited=true;portal.visible=true;portalOn=true;pLight.intensity=1.6;AU.portal();
 puffs.burst(new THREE.Vector3(0,2.4,0),0xffc050,26,5,1,-1);}
function fastForward(){doBoom();setCinema('');blurVal=0;phaseT=Math.max(phaseT,4.35);}
function updateCinema(dt){phaseT+=dt;
 if(phaseT>.9&&line===0){line=1;doBoom();setCinema('«Los colores te envuelven… algo despierta en ti.»');$('skipHint').style.opacity=1;}
 if(phaseT>2.4&&line===1){line=2;setCinema('«Ocho esferas brillan. Un portal dorado se abre…»');}
 if(phaseT>2.2)blurVal=Math.max(0,blurVal-7*dt);
 if(phaseT>4.3&&line===2){line=3;ignite();setCinema('');$('skipHint').style.opacity=0;
  showBanner('¡EL PORTAL SE CIERRA!','Agarra un elemento y corre',2.6);
  $('letterTop').style.height='0';$('letterBot').style.height='0';
  phase='lobby';lobbyTime=PORTAL_TIME;$('hud').style.display='block';
  $('hintLine').textContent='Muévete · Toca una esfera · Entra al portal';}}
function pickupOrb(o){o.taken=true;o.group.visible=false;chosen=o.key;
 if(!session.once[o.key]){session.pick[o.key]=(session.pick[o.key]||0)+1;session.once[o.key]=true;}
 if(phase==='battle'&&player.element!=='chispa'&&o.key!==player.element){
  const k=comboKey(player.element,o.key);
  if(COMBOS[k]&&!player.combo){player.combo=Object.assign({els:[player.element,o.key]},COMBOS[k]);
   AU.fanfare();showBanner('¡COMBO DESCUBIERTO: '+player.combo.name.toUpperCase()+'!','Tu ✦ ahora es '+player.combo.emoji+' '+player.combo.desc,3);
   $('secIco').textContent=player.combo.emoji;}}
 player.element=o.key;setElement(player,o.key);AU.pickup();
 puffs.burst(new THREE.Vector3(player.pos.x,1.2,player.pos.z),ELEMENTS[o.key].color,22,6,.8,-1);
 showBanner(ELEMENTS[o.key].emoji+' '+ELEMENTS[o.key].name.toUpperCase(),ELEMENTS[o.key].desc,1.8);
 $('elCard').style.display='flex';$('elCardIco').textContent=ELEMENTS[o.key].emoji;
 $('elCardName').textContent=o.key==='fuego'?'Ignio · Fuego':ELEMENTS[o.key].name;
 $('btnAtk').style.display='flex';$('atkIco').textContent=ELEMENTS[o.key].emoji;
 $('btnSec').style.display='flex';if(!player.combo)$('secIco').textContent=ELEMENTS[o.key].emoji;
 checkLiveUnlock(o.key);}
function updateLobby(dt){lobbyTime-=dt;
 if(Math.ceil(lobbyTime)!==Math.ceil(lobbyTime+dt)&&lobbyTime<=5&&lobbyTime>0)AU.beep();
 portal.scale.setScalar(.35+.65*clamp(lobbyTime/PORTAL_TIME,0,1));
 $('phaseTimer').textContent=Math.max(0,lobbyTime).toFixed(1);
 $('phaseTimer').classList.toggle('danger',lobbyTime<6);
 $('phaseLabel').textContent='EL PORTAL SE CIERRA';
 const mv=moveDirWorld();if(mv)player.pos.addScaledVector(mv,7.5*dt);
 for(const o of orbs){if(o.taken)continue;o.ph+=dt;
  o.core.position.y=1.35+Math.sin(o.ph*2)*.12;o.glow.position.y=o.core.position.y;o.core.rotation.y+=dt*1.5;
  if(player.pos.distanceTo(o.group.position)<1.4)pickupOrb(o);}
 if(portalOn&&player.pos.length()<2){enterBattle();return;}
 if(lobbyTime<=0){phase='suck';suckT=0;AU.boom();}}
function updateSuck(dt){suckT+=dt;const k=Math.min(1,suckT/1.1);
 player.pos.x*=(1-k*.06);player.pos.z*=(1-k*.06);player.pos.y=k*2.2;player.rot+=dt*10;
 player.group.scale.setScalar(Math.max(.05,1-k*.8));
 if(Math.random()<.5)sparks.burst(new THREE.Vector3(player.pos.x,player.pos.y+1,player.pos.z),chosen?ELEMENTS[chosen].color:0xffffff,3,4,.4,3);
 if(k>=1){player.group.visible=false;enterBattle();}}
function enterBattle(){if(phase==='battle')return;
 AU.portal();flashFx(.9,.7);resetArena();resetActor(player);
 player.pos.set(ARENA_X,0,9);player.rot=Math.PI;player.invuln=2;
 player.group.position.copy(player.pos);
 arenaGroup.visible=true;spawnBots();
 phase='battle';battleTime=0;matchOver=false;
 $('hintLine').textContent='⚔️ atacar · ✦ especial/combo · ¡Cuidado con el suelo!';
 showBanner(ARENAS[curArena].name.toUpperCase(),ARENAS[curArena].desc,2.8);}
function updateBattle(dt){battleTime+=dt;
 updateCollapse(dt);updatePillarsFall(dt);updateComboFx(dt);
 if(warnActive){$('phaseLabel').textContent='¡SUELO COLAPSANDO!';$('phaseTimer').textContent='¡CORRE!';$('phaseTimer').classList.add('danger');}
 else if(!collapseDone){$('phaseLabel').textContent='PRÓXIMO COLAPSO';$('phaseTimer').textContent=Math.max(0,Math.ceil(nextCollapseAt-battleTime))+'s';$('phaseTimer').classList.toggle('danger',nextCollapseAt-battleTime<3);}
 else{$('phaseLabel').textContent='ÚLTIMA PLATAFORMA';$('phaseTimer').textContent='⚔';$('phaseTimer').classList.remove('danger');}
 for(const b of bots)updateBot(b,dt);
 if(attackHeld&&player.alive)castMain(player);
 for(const o of arenaOrbs){if(o.taken)continue;o.ph+=dt;
  o.core.position.y=.9+Math.sin(o.ph*2)*.12;o.glow.position.y=o.core.position.y;
  if(player.alive&&player.pos.distanceTo(o.group.position)<1.3)pickupOrb(o);}
 $('aliveN').textContent=actors.filter(a=>a.alive).length;
 $('killN').textContent=stats.kills;
 $('hpFill').style.width=clamp(player.hp,0,100)+'%';
 const em=effMastery(player.element==='chispa'?null:player.element);
 $('masteryFill').style.width=em+'%';
 $('elCardDesc').textContent=(player.combo?('Combo '+player.combo.emoji+' '+player.combo.name):ELEMENTS[player.element].desc)+' · Dominio '+Math.floor(em)+'%';
 const c1=player.cd1/ELEMENTS[player.element].cd;$('cdAtk').style.background=c1>0?'conic-gradient(rgba(0,0,0,.75) '+(c1*360)+'deg,transparent 0deg)':'none';
 const c2=player.cd2/(player.combo?8:5);$('cdSec').style.background=c2>0?'conic-gradient(rgba(0,0,0,.75) '+(c2*360)+'deg,transparent 0deg)':'none';}
function endMatch(won,rank){if(matchOver)return;matchOver=true;
 if(won){AU.win();showBanner('¡VICTORIA!','Eres el último en pie',2.5);}
 else{AU.lose();showBanner('HAS CAÍDO','Puesto #'+rank+' de 5',2.5);}
 setTimeout(()=>showEnd(won,rank),1800);}
function showEnd(won,rank){phase='result';$('hud').style.display='none';
 const pre={...mastery},rows=[];
 for(const k of EL_KEYS){const p=session.pick[k]||0,u=session.use[k]||0,kl=session.kill[k]||0;
  if(p+u+kl>0)rows.push({k,p,u,kl,delta:p*5+u*2+kl*10});}
 const bonus=won?30:(rank<=3?20:(rank<=5?15:0));
 if(bonus>0&&player.element!=='chispa')rows.push({k:player.element,bonus:true,delta:bonus});
 for(const r of rows)mastery[r.k]=clamp((mastery[r.k]||0)+r.delta,0,100);
 saveMastery();
 const t=$('resTitle');t.textContent=won?'¡VICTORIA!':'DERROTA';t.className=won?'':'bad';
 $('resSub').textContent=ARENAS[curArena].name+' · '+(won?'¡Victoria!':'Puesto #'+rank)+' · 💀 '+stats.kills+' · ⚔️ '+Math.round(stats.dmg);
 const bd=$('breakdown');bd.innerHTML='';
 if(!rows.length)bd.innerHTML='<div class="bdRow"><div class="bdTop"><span>✦ Sin progreso</span></div><div class="bdDet">Usa tu elemento en combate para ganar dominio.</div></div>';
 rows.forEach(r=>{const E=ELEMENTS[r.k],from=clamp(pre[r.k],0,100),to=clamp(mastery[r.k],0,100),un=from<100&&to>=100;
  const d=document.createElement('div');d.className='bdRow';
  const det=r.bonus?('Bono de '+(won?'victoria':'posición')):[r.p?r.p+'× recoger':'',r.u?r.u+'× uso':'',r.kl?r.kl+'× derribo':''].filter(Boolean).join(' ');
  d.innerHTML='<div class="bdTop"><span>'+E.emoji+' '+E.name+'</span><span style="color:#8effa8">+'+r.delta+'%</span></div><div class="bdDet">'+det+' · total '+Math.floor(to)+'%</div><div class="bdTrack"><div class="bdFill" style="width:'+from+'%;background:'+E.css+'"></div></div>'+(un?'<div class="unlock">★ ¡ELEMENTO DOMINADO PARA SIEMPRE! Nueva Arena desbloqueada.</div>':'');
  bd.appendChild(d);setTimeout(()=>d.querySelector('.bdFill').style.width=to+'%',150);});
 $('resultScreen').style.display='flex';}

const tmpV=new THREE.Vector3();
function updateCamera(dt){
 if(phase==='menu'){const a=phaseT*.14;camera.position.set(Math.sin(a)*17,8.5,Math.cos(a)*17);camera.lookAt(0,1.6,0);}
 else if(phase==='cinema'){camera.position.lerp(tmpV.copy(player.pos).add(new THREE.Vector3(Math.sin(phaseT*.3)*.4,1.9,3.2)),.08);camera.lookAt(player.pos.x,player.pos.y+1.4,player.pos.z);}
 else{const look=tmpV.copy(player.pos).add(player.vel).multiplyScalar? tmpV.copy(player.pos).addScaledVector(player.vel,.3):tmpV;
  camera.position.lerp(new THREE.Vector3(player.pos.x,player.pos.y+12,player.pos.z+14.5),1-Math.exp(-6*dt));
  camera.lookAt(look.x,look.y+1,look.z);}
 if(shake>0){camera.position.x+=rand(-1,1)*shake*.3;camera.position.y+=rand(-1,1)*shake*.25;shake=Math.max(0,shake-3.2*dt);}
 sun.position.set(player.pos.x+18,32,player.pos.z+12);sun.target.position.set(player.pos.x,0,player.pos.z);
 canvas.style.filter=blurVal>.05?'blur('+blurVal.toFixed(1)+'px)':'';}
const clock=new THREE.Clock();
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);
 if(phase==='menu')phaseT+=dt;
 sparks.update(dt);puffs.update(dt);updateBolts(dt);updateDmg(dt);
 for(const d of debris){d.m.position.y-=d.sp*dt;if(d.m.position.y<-19)d.m.position.y=-1;d.m.rotation.x+=dt*.5;}
 vor.rotation.z+=dt*.06;runes.material.opacity=.7+Math.sin(phaseT*2)*.3;
 skyT-=dt;if(skyT<=0){skyT=rand(4,9);flashFx(.15,.6);AU.thunder();}
 if(portalOn&&portal.visible){portal.lookAt(camera.position);pInner.rotation.z+=dt*.8;
  arcT-=dt;if(arcT<=0){arcT=rand(.15,.5);const a1=rand(0,7),a2=a1+rand(1,3);
   makeBolt(new THREE.Vector3(Math.cos(a1)*2.5,2.6+Math.sin(a1)*2.5,0),new THREE.Vector3(Math.cos(a2)*2.5,2.6+Math.sin(a2)*2.5,0),0xffd76a,.25,.3);}
  if(Math.random()<.3){const a=rand(0,7);sparks.burst(new THREE.Vector3(Math.cos(a)*2.2,2.6+Math.sin(a)*2.2,0),0xffc050,1,1.5,.8,-2);}}
 for(const o of orbs.concat(arenaOrbs)){if(!o.taken&&Math.random()<.1)sparks.burst(new THREE.Vector3(o.group.position.x,o.core.position.y,o.group.position.z),ELEMENTS[o.key].color,1,1.2,.7,-1.5);}
 if(phase==='cinema')updateCinema(dt);
 else if(phase==='lobby'){actorPhysics(player,dt);updateLobby(dt);}
 else if(phase==='suck')updateSuck(dt);
 else if(phase==='battle'){updateBattle(dt);for(const a of actors)actorPhysics(a,dt);}
 updateProjectiles(dt);updateCamera(dt);
 renderer.render(scene,camera);}
loop();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
}
