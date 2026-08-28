// FASE 3 — CONTROLES E INTERACCIÓN TÁCTIL
(function(){
  const root=document.createElement('div');
  root.className='touchControls';
  root.innerHTML=`
    <div class="virtualStick" aria-label="Movimiento">
      <div class="stickBase"></div><div class="stickKnob"></div>
    </div>
    <div class="touchActions">
      <button class="touchBtn attackTouch" aria-label="Ataque">✦</button>
      <button class="touchBtn specialTouch" aria-label="Interacción">E</button>
      <button class="touchBtn interactTouch" aria-label="Tomar esencia">TOMAR</button>
    </div>`;
  document.body.appendChild(root);

  const held=new Set();
  const press=k=>{if(held.has(k))return;held.add(k);window.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true}))};
  const release=k=>{if(!held.has(k))return;held.delete(k);window.dispatchEvent(new KeyboardEvent('keyup',{key:k,bubbles:true}))};
  const releaseAll=()=>{for(const k of [...held])release(k)};

  const stick=root.querySelector('.virtualStick'),knob=root.querySelector('.stickKnob');
  let active=false,pointerId=null;
  const updateStick=(clientX,clientY)=>{
    const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    let dx=clientX-cx,dy=clientY-cy,max=r.width*.30,len=Math.hypot(dx,dy);
    if(len>max){dx=dx/len*max;dy=dy/len*max}
    knob.style.transform=`translate(${dx}px,${dy}px)`;
    release('w');release('a');release('s');release('d');
    const threshold=max*.20;
    if(Math.abs(dy)>threshold)press(dy<0?'w':'s');
    if(Math.abs(dx)>threshold)press(dx<0?'a':'d');
  };
  const endStick=e=>{
    if(pointerId!==null&&e?.pointerId!==pointerId)return;
    active=false;pointerId=null;knob.style.transform='translate(0,0)';
    release('w');release('a');release('s');release('d');
  };
  stick.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();active=true;pointerId=e.pointerId;stick.setPointerCapture?.(e.pointerId);updateStick(e.clientX,e.clientY)},{passive:false});
  stick.addEventListener('pointermove',e=>{if(active){e.preventDefault();updateStick(e.clientX,e.clientY)}},{passive:false});
  stick.addEventListener('pointerup',endStick,{passive:false});
  stick.addEventListener('pointercancel',endStick,{passive:false});
  stick.addEventListener('lostpointercapture',endStick,{passive:false});

  const bind=(selector,key,hold=false)=>{
    const b=root.querySelector(selector);if(!b)return;
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();press(key);if(!hold)setTimeout(()=>release(key),110);if(navigator.vibrate)navigator.vibrate(10)},{passive:false});
    b.addEventListener('pointerup',e=>{e.preventDefault();release(key)},{passive:false});
    b.addEventListener('pointercancel',()=>release(key),{passive:false});
    b.addEventListener('pointerleave',()=>{if(hold)release(key)},{passive:true});
  };
  bind('.attackTouch','q');bind('.specialTouch','e');bind('.interactTouch','e');

  // Tocar una zona libre del juego equivale a una interacción contextual.
  const canvas=document.querySelector('#game');
  canvas?.addEventListener('pointerup',e=>{
    if(e.pointerType==='touch'){
      window.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true}));
      setTimeout(()=>window.dispatchEvent(new KeyboardEvent('keyup',{key:'e',bubbles:true})),110);
    }
  },{passive:true});

  const interact=root.querySelector('.interactTouch'),feed=document.querySelector('#feedMod');
  const updatePrompt=()=>{
    if(!interact||!feed)return;
    const text=(feed.textContent||'').toUpperCase();
    const ready=text.includes('PRESIONA E')||text.includes('TOMAR');
    interact.classList.toggle('ready',ready);
    interact.textContent=ready?'TOMAR':'E';
  };
  setInterval(updatePrompt,120);
  addEventListener('blur',releaseAll);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll()});
})();
