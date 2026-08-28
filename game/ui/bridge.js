(() => {
  const map={fuego:['🔥','FUEGO'],agua:['💧','AGUA'],tierra:['🪨','TIERRA'],aire:['🌀','AIRE']};
  const bind=()=>{document.querySelectorAll('.elementChoice').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>{const t=b.querySelector('b')?.textContent?.toLowerCase();const key=Object.keys(map).find(k=>map[k][1].toLowerCase()===t);if(key){document.querySelector('#elementEmojiMod').textContent=map[key][0];document.querySelector('#elementNameMod').textContent=map[key][1];document.querySelector('#feedMod').textContent='Elemento elegido · dominio permanente en progreso';}})});document.querySelectorAll('.abilities button').forEach((b,i)=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:i===0?' ':i===1?'e':'r',code:i===0?'Space':''})))})};
  new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});setInterval(bind,500);
})();
