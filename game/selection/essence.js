export const ELEMENTS={
  fuego:{name:'Fuego',emoji:'🔥',color:0xff3b08,glow:0xffb000},
  agua:{name:'Agua',emoji:'💧',color:0x168cff,glow:0x7de9ff},
  tierra:{name:'Tierra',emoji:'🪨',color:0x9a6531,glow:0xe3ad63},
  aire:{name:'Aire',emoji:'🌀',color:0x9beaff,glow:0xffffff}
};

const additive=(color,opacity=0.8)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});
const standard=(color,emissive=0,intensity=0.0,roughness=.55,metalness=.15)=>new THREE.MeshStandardMaterial({color,emissive,emissiveIntensity:intensity,roughness,metalness});

export class Essence{
  constructor(scene,key,position){
    this.scene=scene;
    this.key=key;
    this.data=ELEMENTS[key];
    this.taken=false;
    this.group=new THREE.Group();
    this.group.position.copy(position);
    this.group.position.y=Math.min(this.group.position.y,1.5);
    this.baseY=this.group.position.y;
    this.phase=Math.random()*Math.PI*2;
    this.parts=[];
    this.orbiters=[];
    const d=this.data;

    // Pedestal: darker stone platform with an elemental glow.
    const pedestal=new THREE.Mesh(
      new THREE.CylinderGeometry(.82,1.18,.42,12),
      standard(0x151923,d.color,.3,.7,.28)
    );
    pedestal.position.y=-.92;
    pedestal.castShadow=true;
    pedestal.receiveShadow=true;
    this.group.add(pedestal);

    const pedestalTop=new THREE.Mesh(
      new THREE.CylinderGeometry(.7,.76,.12,12),
      standard(0x292d38,d.glow,.55,.48,.35)
    );
    pedestalTop.position.y=-.68;
    this.group.add(pedestalTop);

    // Three nested energy rings make the essence read clearly at a distance.
    this.rings=[];
    for(let i=0;i<3;i++){
      const ring=new THREE.Mesh(
        new THREE.TorusGeometry(1.0+i*.2,.025+i*.012,8,56),
        additive(d.glow,.55-.1*i)
      );
      ring.rotation.x=Math.PI/2;
      ring.position.y=-.45+i*.04;
      ring.userData.speed=(i%2?-.012:.018)*(1+i*.25);
      this.group.add(ring);
      this.rings.push(ring);
    }

    // Soft energy halo.
    const halo=new THREE.Mesh(
      new THREE.SphereGeometry(1.25,16,12),
      new THREE.MeshBasicMaterial({color:d.glow,transparent:true,opacity:.075,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    halo.scale.y=1.15;
    this.group.add(halo);
    this.halo=halo;

    // Element-specific core.
    this.orb=this.createCore(d);
    this.orb.castShadow=true;
    this.group.add(this.orb);

    // Bright core inside the main object.
    const core=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),additive(d.glow,.95));
    this.group.add(core);
    this.core=core;

    this.light=new THREE.PointLight(d.color,2.8,8);
    this.light.position.y=.1;
    this.group.add(this.light);

    // Small orbiting shards / droplets / sparks.
    for(let i=0;i<18;i++){
      const p=this.createParticle(d,i);
      this.group.add(p);
      this.parts.push(p);
    }

    // Three larger energy fragments orbit the core.
    for(let i=0;i<3;i++){
      const shard=this.createOrbiter(d,i);
      this.group.add(shard);
      this.orbiters.push(shard);
    }

    // A subtle vertical energy beam makes each essence feel anchored to the arena.
    const beam=new THREE.Mesh(
      new THREE.CylinderGeometry(.015,.16,2.4,10,1,true),
      additive(d.glow,.09)
    );
    beam.position.y=.15;
    this.group.add(beam);
    this.beam=beam;

    scene.add(this.group);
  }

  createCore(d){
    if(this.key==='fuego'){
      const g=new THREE.Group();
      const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.62,2),standard(0xff4b0a,d.glow,1.9,.18,.12));
      g.add(orb);
      for(let i=0;i<7;i++){
        const flame=new THREE.Mesh(new THREE.ConeGeometry(.11+Math.random()*.09,.45+Math.random()*.35,6),additive(i%2?0xff5a08:0xffd13b,.8));
        const a=i*Math.PI*2/7;
        flame.position.set(Math.cos(a)*.42,.05+Math.random()*.18,Math.sin(a)*.42);
        flame.scale.y=1.2+Math.random()*1.2;
        flame.rotation.z=(Math.random()-.5)*.7;
        g.add(flame);
      }
      return g;
    }
    if(this.key==='agua'){
      const g=new THREE.Group();
      const orb=new THREE.Mesh(new THREE.SphereGeometry(.61,24,18),new THREE.MeshPhysicalMaterial({color:0x1598ff,emissive:d.glow,emissiveIntensity:1.2,roughness:.08,metalness:.05,transparent:true,opacity:.88,transmission:.15,clearcoat:1}));
      g.add(orb);
      for(let i=0;i<3;i++){
        const drop=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),additive(d.glow,.8));
        const a=i*Math.PI*2/3;
        drop.position.set(Math.cos(a)*.72,.15+Math.sin(a)*.2,Math.sin(a)*.72);
        g.add(drop);
      }
      return g;
    }
    if(this.key==='tierra'){
      const g=new THREE.Group();
      const orb=new THREE.Mesh(new THREE.DodecahedronGeometry(.64,1),standard(0x79502b,d.glow,1.0,.88,.1));
      g.add(orb);
      for(let i=0;i<5;i++){
        const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.12+Math.random()*.1,0),standard(0x9b6a3a,d.glow,.35,.95,.05));
        const a=i*Math.PI*2/5;
        rock.position.set(Math.cos(a)*.72,(Math.random()-.5)*.35,Math.sin(a)*.72);
        g.add(rock);
      }
      return g;
    }
    // Aire: transparent core surrounded by a bright inner ring.
    const g=new THREE.Group();
    const orb=new THREE.Mesh(new THREE.SphereGeometry(.59,20,16),new THREE.MeshPhysicalMaterial({color:0xcff7ff,emissive:d.glow,emissiveIntensity:1.25,roughness:.05,metalness:0,transparent:true,opacity:.28,transmission:.55,clearcoat:1}));
    g.add(orb);
    const inner=new THREE.Mesh(new THREE.TorusGeometry(.43,.035,8,40),additive(d.glow,.9));
    inner.rotation.x=Math.PI/2;
    g.add(inner);
    return g;
  }

  createParticle(d,i){
    let geometry;
    if(this.key==='tierra') geometry=new THREE.DodecahedronGeometry(.035+Math.random()*.055,0);
    else if(this.key==='aire') geometry=new THREE.TorusGeometry(.025,.012,5,10);
    else geometry=new THREE.SphereGeometry(.025+Math.random()*.045,6,6);
    const p=new THREE.Mesh(geometry,additive(d.glow,.65+Math.random()*.25));
    p.userData.phase=Math.random()*Math.PI*2;
    p.userData.radius=.85+Math.random()*.75;
    p.userData.height=.2+Math.random()*.9;
    p.userData.speed=.65+Math.random()*.75;
    return p;
  }

  createOrbiter(d,i){
    let geometry;
    if(this.key==='tierra') geometry=new THREE.DodecahedronGeometry(.13,0);
    else if(this.key==='aire') geometry=new THREE.TorusGeometry(.12,.025,6,18);
    else geometry=new THREE.OctahedronGeometry(.12,1);
    const s=new THREE.Mesh(geometry,additive(d.glow,.8));
    s.userData.angle=i*Math.PI*2/3;
    s.userData.radius=.78;
    s.userData.height=.15+.12*i;
    return s;
  }

  distance2D(target){
    return Math.hypot(this.group.position.x-target.position.x,this.group.position.z-target.position.z);
  }

  update(t,near=false){
    if(this.taken)return;
    const time=t+this.phase;
    const proximity=near?1:0;
    this.group.position.y=this.baseY+Math.sin(time*2.0)*(.14+.06*proximity);
    this.group.rotation.y=Math.sin(time*.35)*.08;

    this.orb.rotation.y+=this.key==='fuego'?.018:this.key==='tierra'?.009:.013;
    if(this.key==='fuego')this.orb.rotation.z=Math.sin(time*2.8)*.08;
    if(this.key==='aire')this.orb.rotation.x+=.01;

    this.rings.forEach((ring,i)=>{
      ring.rotation.z+=ring.userData.speed;
      ring.scale.setScalar(1+(near?.12:.025)*Math.sin(time*(5+i)));
      ring.material.opacity=(near?.82:.55)-i*.1;
    });

    this.halo.scale.setScalar(1.0+(near?.18:.06)*(.5+.5*Math.sin(time*5)));
    this.halo.material.opacity=near?.13:.075;
    this.core.scale.setScalar(1+(near?.14:.035)*Math.sin(time*7));
    this.light.intensity=near?4.6+Math.sin(time*8)*.7:2.8+Math.sin(time*4)*.35;
    this.beam.scale.y=near?1.15+.12*Math.sin(time*6):1;

    this.parts.forEach((p,i)=>{
      const a=time*p.userData.speed+i*.41+p.userData.phase;
      const r=p.userData.radius;
      p.position.set(Math.cos(a)*r,Math.sin(a*1.35)*p.userData.height,r*Math.sin(a));
      if(this.key==='aire')p.rotation.z=a;
    });

    this.orbiters.forEach((s,i)=>{
      const a=time*(.75+i*.08)+s.userData.angle;
      const r=s.userData.radius+(near?.08:0);
      s.position.set(Math.cos(a)*r,Math.sin(a*1.8)*.28+s.userData.height,Math.sin(a)*r);
      s.rotation.x+=.018;
      s.rotation.y+=.025;
    });

    if(near)this.group.scale.setScalar(1.1+Math.sin(time*8)*.025);
    else this.group.scale.setScalar(1);
  }

  collect(){
    if(this.taken)return;
    this.taken=true;
    this.group.visible=false;
  }
}
