# 🌻 Floricienta

Web sencilla para regalar una flor amarilla el 21 de septiembre. Ella riega una flor (arrastrando el dedo/ratón o manteniendo pulsado el botón) y la ve crecer por etapas, revelando una frase en cada una, hasta que florece del todo y aparece tu mensaje final.

Sin frameworks ni build: HTML + CSS + JS puro.

## Personalizar

Edita **solo** `js/data.js`:

```js
window.DATA = {
  her: "Nombre de ella",
  from: "Tu nombre",
  nickname: "Apodo",
  initials: "H ♡ N",       // se graba en la maceta
  since: "2024-01-01",     // o "" para ocultar el contador de días
  intro: "...",
  phrases: ["...", "...", "...", "...", "..."], // 5 frases, una por etapa
  finalMessage: "...",
  signature: "Te quiero, Harold",
  song: { title: "", url: "" } // opcional
};
```

Guarda y vuelve a publicar (ver abajo). No hace falta tocar nada más.

## Probar en local

```bash
npx serve .
# o
python -m http.server 4173
```

Abre `http://localhost:4173` (o el puerto que indique).

## Publicar (GitHub Pages)

```bash
git add -A
git commit -m "actualiza contenido"
git push
```

GitHub Pages reconstruye solo en ~1 minuto. La web queda en:

**https://haroldrodriguez0.github.io/floricienta/**

Si Pages no está activado todavía: repo → **Settings → Pages → Source: Deploy from a branch → main / (root)**.

## Estructura

```
index.html      → estructura de las 3 pantallas (intro, jardín, final)
css/style.css   → estilos, colores y animaciones
js/data.js      → tu contenido personal (edítalo)
js/flower.js    → dibuja los pétalos del SVG y cambia de etapa
js/petals.js    → gotas de agua y lluvia de pétalos (canvas)
js/app.js       → lógica del juego y de las pantallas
assets/         → favicon
```

## Pendiente opcional

- Imagen de vista previa (`og:image`) para que se vea una miniatura bonita al compartir el enlace por WhatsApp.
