// Controles táctiles: joystick virtual a la izquierda + acciones separadas a la derecha.
(function(){
  const root=document.createElement('div');
  root.className='touchControls';
  root.innerHTML=`
    <div class="virtualStick" aria-label="Movimiento">
      <div class="stickBase"></div><div class="stickKnob"></div>
    </div>
    <div class="touchActions">
      <button class="touchBtn attackTouch">✦</button>
      <button class="touchBtn specialTouch">E</button>
      <button class="touchBtn interactTouch">↟</button>
    </div>`;
  document.body.appendChild(root);

  const held=new Set();
  const press=k=>{if(held.has(k))return;held.add(k);window.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true}))};
  const release=k=>{if(!held.has(k))return;held.delete(k);window.dispatchEvent(new KeyboardEvent('keyup',{key:k,bubbles:true}))};
  const releaseAll=()=>{for(const k of [...held])release(k)};

  const stick=root.querySelector('.virtualStick'), knob=root.querySelector('.stickKnob');
  let active=false, pointerId=null;
  const updateStick=(clientX,clientY)=>{
    const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    let dx=clientX-cx,dy=clientY-cy,max=r.width*.30,len=Math.hypot(dx,dy);
    if(len>max){dx=dx/len*max;dy=dy/len*max}
    knob.style.transform=`translate(${dx}px,${dy}px)`;
    release('w');release('a');release('s');release('d');
    if(Math.abs(dy)>max*.28)press(dy<0?'w':'s');
    if(Math.abs(dx)>max*.28)press(dx<0?'a':'d');
  };
  const endStick=e=>{if(pointerId!==null&&e.pointerId!==pointerId)return;active=false;pointerId=null;knob.style.transform='translate(0,0)';release('w');release('a');release('s');release('d')};
  stick.addEventListener('pointerdown',e=>{e.preventDefault();active=true;pointerId=e.pointerId;stick.setPointerCapture?.(e.pointerId);updateStick(e.clientX,e.clientY)},{passive:false});
  stick.addEventListener('pointermove',e=>{if(active)updateStick(e.clientX,e.clientY)},{passive:false});
  stick.addEventListener('pointerup',endStick,{passive:false});stick.addEventListener('pointercancel',endStick,{passive:false});stick.addEventListener('lostpointercapture',endStick,{passive:false});

  const bind=(selector,key,repeat=false)=>{const b=root.querySelector(selector);if(!b)return;b.addEventListener('pointerdown',e=>{e.preventDefault();press(key);if(!repeat)setTimeout(()=>release(key),90)},{passive:false});b.addEventListener('pointerup',e=>{e.preventDefault();release(key)},{passive:false});b.addEventListener('pointercancel',()=>release(key),{passive:false})};
  bind('.attackTouch','q');bind('.specialTouch','e');bind('.interactTouch','e');
  addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll()});
})();
