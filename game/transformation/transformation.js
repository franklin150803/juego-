export function runTransformation(scene, player, element, onComplete) {
  const start = performance.now(), duration = 1700, origin = player.group.position.clone();
  const color = element.glow || element.accent || 0xffffff, fx = [];
  const core = new THREE.Mesh(new THREE.SphereGeometry(.42,20,16),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.05,blending:THREE.AdditiveBlending,depthWrite:false}));
  core.position.copy(origin); core.position.y += 1.15; scene.add(core); fx.push(core);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.55,.045,8,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));
  ring.rotation.x=Math.PI/2; ring.position.copy(origin); ring.position.y+=.08; scene.add(ring); fx.push(ring);
  for(let i=0;i<55;i++){const a=Math.random()*Math.PI*2,r=.35+Math.random()*1.5,p=new THREE.Mesh(new THREE.SphereGeometry(.025+Math.random()*.045,6,5),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));p.position.set(origin.x+Math.cos(a)*r,origin.y+Math.random()*2.2,origin.z+Math.sin(a)*r);p.userData={a,r,s:.8+Math.random()*1.8,baseY:p.position.y};scene.add(p);fx.push(p)}
  player.group.userData.transforming=true;
  function tick(now){const q=Math.min(1,(now-start)/duration),eased=q*q*(3-2*q);player.group.scale.setScalar(.92+eased*.08);core.scale.setScalar(.7+eased*2.8);core.material.opacity=.04+Math.sin(q*Math.PI)*.42;ring.scale.setScalar(.8+eased*2.4);ring.rotation.z+=.08;fx.slice(2).forEach((p,i)=>{const u=p.userData;u.a+=.018*u.s;p.position.x=origin.x+Math.cos(u.a)*u.r*(1-eased*.35);p.position.z=origin.z+Math.sin(u.a)*u.r*(1-eased*.35);p.position.y=u.baseY+Math.sin(now*.006+i)*.18-eased*.65;p.material.opacity=.9-eased*.25});if(q<1){requestAnimationFrame(tick);return}fx.forEach(o=>{scene.remove(o);o.geometry?.dispose();o.material?.dispose()});player.group.userData.transforming=false;if(onComplete)onComplete()}
  requestAnimationFrame(tick);
}
