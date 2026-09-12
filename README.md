# Dr. Carlos Hernández · Ultrasonidos

Sitio del consultorio de ultrasonido diagnóstico del Dr. Carlos Hernández, médico radiólogo en Guadalajara, Jalisco.

Desarrollado por **Mattera Systems**.

## Correr en local

```bash
python3 -m http.server 8000
# http://localhost:8000
```

No hay build step. HTML estático + CSS + JS vanilla + Anime.js por CDN.

## Editar precios

El catálogo de 29 estudios vive en `index.html` dentro de `<ul id="catalog">`.
Cada estudio necesita que coincidan **el precio visible** y el atributo `data-price`.
El formulario de citas lee el DOM, así que no hay que tocar el JS.

Los textos de preparación están en el objeto `PREP` de `assets/js/app.js`,
indexados por el atributo `data-prep` de cada estudio.

## Dominio

Mientras no haya dominio propio, el sitio vive en
`https://samuelalexsanche.github.io/dr-carlos-hernandez-ultrasonidos/`
y esa URL es la que llevan `canonical`, `og:*`, el JSON-LD, `robots.txt` y `sitemap.xml`.

Cuando llegue el dominio del cliente, sustituir en esos cuatro archivos:

```bash
grep -rl "samuelalexsanche.github.io/dr-carlos-hernandez-ultrasonidos" . \
  | xargs sed -i '' 's|https://samuelalexsanche.github.io/dr-carlos-hernandez-ultrasonidos/|https://DOMINIO-NUEVO.com/|g'
```

y añadir el archivo `CNAME` con el dominio.

## Documentos

- `HANDOFF-CLAUDE-CODE.md` — arquitectura, decisiones y tareas pendientes
- `PROMPT-CLAUDE-CODE.md` — instrucciones para continuar el desarrollo
