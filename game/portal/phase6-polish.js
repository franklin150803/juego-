export function createPortalTransitFX(scene, position, color=0x7df9ff) {
  const group = new THREE.Group(); group.position.copy(position); scene.add(group);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0,.07,10,64),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false})); ring.rotation.x=Math.PI/2; group.add(ring);
  const particles=[]; for(let i=0;i<28;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.025+Math.random()*.035,6,5),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));p.userData={a:Math.random()*Math.PI*2,r:.5+Math.random()*1.2};group.add(p);particles.push(p)}
  group.userData.update=(strength=.5)=>{ring.rotation.z+=.08*strength;ring.scale.setScalar(1+strength*.8);particles.forEach((p,i)=>{p.userData.a+=.035*strength;p.position.set(Math.cos(p.userData.a+i)*p.userData.r*(1-strength*.45),Math.sin(p.userData.a*1.5)*.5,Math.sin(p.userData.a+i)*p.userData.r*(1-strength*.45));p.material.opacity=.25+.65*strength})};
  group.userData.dispose=()=>{scene.remove(group);group.traverse(o=>{o.geometry?.dispose();o.material?.dispose()})}; return group;
}
