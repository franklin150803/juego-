export class GameUI {
  constructor(root=document.body){this.root=root;this.hud=document.createElement('div');this.hud.id='modularHud';this.hud.innerHTML=`<div class="top"><div class="brand">FRACTURA <b>ELEMENTAL</b></div><div class="phase">EL PORTAL SE CIERRA <strong id="modTimer">20</strong></div><div class="team">👥 <b>4</b></div></div><div class="objective" id="modObjective">ELIGE UN ELEMENTO</div><div class="elementCard"><span id="modEmoji">🔥</span><div><b id="modElement">SIN ELEMENTO</b><small id="modAttack">Busca una esencia</small><div class="hp"><i id="modHp"></i></div></div></div><div class="abilities"><button>Q</button><button>E</button><button>R</button><button>F</button></div>`;root.appendChild(this.hud);}
  timer(v){const e=this.hud.querySelector('#modTimer');if(e)e.textContent=Math.ceil(v);}
  objective(text){const e=this.hud.querySelector('#modObjective');if(e)e.textContent=text;}
  element(data){this.hud.querySelector('#modEmoji').textContent=data.emoji;this.hud.querySelector('#modElement').textContent=data.name.toUpperCase();this.hud.querySelector('#modAttack').textContent=data.attacks?.[0]?.name||'Elemento dominado';}
  hp(v){this.hud.querySelector('#modHp').style.width=Math.max(0,v)+'%';}
}
