# Fractura Elemental — arquitectura modular

Nueva capa modular del prototipo. La versión anterior se conserva en la raíz como referencia.

## Estructura

- `main.js`: arranque y composición del juego.
- `game.js`: estados, partida, selección, portal, caída, combate, dominio y colapso.
- `map/map.js`: mundo 3D, edificios, loot y fractura circular del terreno.
- `characters/character.js`: personaje base y movimiento.
- `characters/fire.js`, `water.js`, `earth.js`, `air.js`: identidad visual y datos de cada elemento.
- `attacks/attacks.js`: ataques y efectos elementales.
- `ui/ui.js`: pantallas, HUD, tarjetas y mensajes.
- `styles.css`: interfaz visual.

El prototipo usa Three.js desde CDN y genera el arte 3D con geometría/materiales, evitando depender de un paquete de imágenes externo para que sea fácil iterar sobre personajes, mapa y efectos.
