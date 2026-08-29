// CONTROLES TÁCTILES — acciones aisladas y multitouch seguro
(function(){
  const root=document.createElement('div');root.className='touchControls';
  root.innerHTML=`<div class="virtualStick" aria-label="Movimiento"><div class="stickBase"></div><div class="stickKnob"></div></div><div class="touchActions"><button class="touchBtn attackTouch" aria-label="Ataque">✦</button><button class="touchBtn specialTouch" aria-label="Habilidad">E</button><button class="touchBtn interactTouch" aria-label="Tomar esencia">TOMAR</button></div>`;
  document.body.appendChild(root);
  const held=new Set();
  const keyData=k=>k===' '?{key:' ',code:'Space'}:{key:k,code:`Key${k.toUpperCase()}`};
  const press=k=>{if(held.has(k))return;held.add(k);const d=keyData(k);window.dispatchEvent(new KeyboardEvent('keydown',{key:d.key,code:d.code,bubbles:true}))};
  const release=k=>{if(!held.has(k))return;held.delete(k);const d=keyData(k);window.dispatchEvent(new KeyboardEvent('keyup',{key:d.key,code:d.code,bubbles:true}))};
  const releaseAll=()=>[...held].forEach(release);
  const stick=root.querySelector('.virtualStick'),knob=root.querySelector('.stickKnob');let active=null;
  const move=(x,y)=>{const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,max=r.width*.30;let dx=x-cx,dy=y-cy,len=Math.hypot(dx,dy);if(len>max){dx=dx/len*max;dy=dy/len*max}knob.style.transform=`translate(${dx}px,${dy}px)`;['w','a','s','d'].forEach(release);const th=max*.2;if(Math.abs(dy)>th)press(dy<0?'w':'s');if(Math.abs(dx)>th)press(dx<0?'a':'d')};
  stick.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();active=e.pointerId;stick.setPointerCapture?.(active);move(e.clientX,e.clientY)},{passive:false});
  stick.addEventListener('pointermove',e=>{if(e.pointerId===active){e.preventDefault();move(e.clientX,e.clientY)}},{passive:false});
  const end=e=>{if(active!==null&&e.pointerId!==active)return;active=null;knob.style.transform='translate(0,0)';['w','a','s','d'].forEach(release)};
  stick.addEventListener('pointerup',end);stick.addEventListener('pointercancel',end);stick.addEventListener('lostpointercapture',end);
  const bind=(selector,key)=>{const b=root.querySelector(selector);if(!b)return;b.style.touchAction='none';b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();b.setPointerCapture?.(e.pointerId);press(key);navigator.vibrate?.(8)},{passive:false});b.addEventListener('pointerup',e=>{e.preventDefault();e.stopPropagation();release(key)},{passive:false});b.addEventListener('pointercancel',e=>release(key),{passive:false});b.addEventListener('lostpointercapture',()=>release(key))};
  bind('.attackTouch',' ');bind('.specialTouch','e');bind('.interactTouch','f');
  addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll});
})();
