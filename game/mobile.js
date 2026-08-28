// Controles táctiles: emiten las mismas teclas que usa el motor para compartir la lógica con PC.
(function(){
 const root=document.createElement('div'); root.className='touchControls'; root.innerHTML='<div class="stick"><button data-k="w" class="up">▲</button><button data-k="a" class="left">◀</button><button data-k="d" class="right">▶</button><button data-k="s" class="down">▼</button></div><div class="touchActions"><button class="attackTouch">✦</button><button class="specialTouch">E</button></div>'; document.body.appendChild(root);
 const fire=k=>window.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true})); const release=k=>window.dispatchEvent(new KeyboardEvent('keyup',{key:k,bubbles:true}));
 root.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k;['pointerdown','touchstart'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();fire(k)},{passive:false}));['pointerup','pointercancel','pointerleave','touchend'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();release(k)},{passive:false}))});
 root.querySelector('.attackTouch').addEventListener('pointerdown',e=>{e.preventDefault();fire('q')}); root.querySelector('.specialTouch').addEventListener('pointerdown',e=>{e.preventDefault();fire('e')});
})();
