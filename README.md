# Rumbo · OPEC 236767

Web de preparación para Gestor I, ficha AT-FL-3008, Fiscalización y Liquidación. HTML, CSS y JavaScript nativos, sin servidor de aplicación, cuentas, claves API ni base de datos. El sitio funciona con archivos estáticos en Netlify y Cloudflare Workers Static Assets.

## Ejecutar en local

Requiere Node.js 22 o superior. La aplicación y sus pruebas unitarias no necesitan instalar dependencias.

```sh
npm run dev
```

Abre `http://127.0.0.1:4173`. En PowerShell, si la política de ejecución bloquea `npm.ps1`, usa `npm.cmd run dev` (también para los demás comandos).

```sh
npm test
npm run build
```

El build produce `dist/`, incluyendo el banco y los dos informes originales. No abras `index.html` con `file://`: la carga del banco utiliza `fetch` y necesita HTTP.

## Netlify

**Despliegue manual:** ejecuta `npm run build` y arrastra la carpeta `dist` al área de despliegue de tu proyecto en Netlify. El ZIP `rumbo-netlify.zip`, si está presente, contiene los mismos archivos listos para cargar.

**Con repositorio:** sube este proyecto a tu repositorio y conéctalo a Netlify. `netlify.toml` configura `npm run build`, `dist` como directorio de publicación y Node 22. No requiere variables secretas. Las rutas de navegación usan fragmentos `#`, por lo que no necesitan una regla SPA.

Referencia: [configuración por archivo de Netlify](https://docs.netlify.com/build/configure-builds/file-based-configuration/).

## Cloudflare Workers

La configuración `wrangler.jsonc` utiliza Workers Static Assets, sin código de servidor. Necesitas iniciar sesión en tu cuenta Cloudflare para publicar:

```sh
npm run build
npx wrangler login
npx wrangler deploy
```

O, después de iniciar sesión, `npm run deploy:cloudflare`. Cambia `name` en `wrangler.jsonc` si quieres otro nombre de Worker. No se ha publicado el sitio ni se han configurado cuentas de hosting desde este proyecto.

En un flujo de Cloudflare Workers conectado a Git, usa `npm run build` como build y `npx wrangler deploy` como deploy.

Referencia: [Workers con archivos estáticos](https://developers.cloudflare.com/workers/static-assets/get-started/).

## Funciones

- Panel con métricas reales; el estado inicial no inventa resultados.
- Tres simulacros de 60 ítems, con 40 funcionales, 12 comportamentales y 8 de integridad por forma.
- Práctica aleatoria de 10, 20 o todas las preguntas disponibles por tema; sin reloj.
- Opciones funcionales mezcladas conservando su clave. Las opciones Likert mantienen su orden.
- Simulacro cronometrado de 240 minutos. Respuestas, marcas y fecha límite sobreviven a recargas; salir no pausa el reloj.
- Resultado funcional con omisiones, desglose por tema y revisión con explicaciones. Los autoinformes no reciben una nota.
- Bitácora de errores y omisiones, clasificación de causas, notas y reintento de errores pendientes.
- Diez áreas de lectura, progreso por lección y enlaces primarios.
- Plan intensivo de 14 bloques (89 horas), derivado de la segunda investigación; fecha personal configurable.
- Historial, exportación/importación JSON con validación y confirmación antes de reemplazar datos, y resumen imprimible.
- Diseño móvil, navegación inferior, estados de foco y soporte para movimiento reducido.

## Contenido y límites

Se utilizan `deep-research-report.md` y `deep-research-report(1).md`. Los originales se conservan intactos. `scripts/extract.mjs` convierte los 180 ítems en texto del primer informe y sus claves en un banco JSON; el build falla si faltan preguntas. Las explicaciones agrupadas de las formas B y C se adaptan por bloque. Las lecturas sintetizan ambos documentos; no sustituyen los textos normativos.

El segundo informe enlaza a formas de 100 preguntas y a otros PDF mediante URLs `sandbox:`. Esos archivos no estaban adjuntos: no se ofrecen descargas inexistentes ni se afirma haber importado sus 200 preguntas.

El porcentaje funcional se calcula como aciertos/preguntas funcionales × 100, truncado a dos decimales. Las omisiones funcionales cuentan como no acertadas. No reproduce la transformación psicométrica oficial. Los autoinformes únicamente registran respuestas y finalización; no son instrumentos psicométricos validados.

La fecha de examen y el corte normativo mencionados se atribuyen a las investigaciones. El usuario debe confirmarlos en GOA/SIMO. No se fija automáticamente una cuenta regresiva con una fecha no confirmada. Las ponderaciones se presentan para la categoría de ingreso sin experiencia descrita en los informes.

El progreso se guarda en `localStorage`, en el navegador y origen donde se usa. No se sincroniza automáticamente entre dominios o dispositivos; usa exportar/importar. Cambiar de dominio o borrar datos del navegador no traslada el progreso. Si el almacenamiento está bloqueado o lleno, se informa y se permite exportar.

## Estructura

```text
src/                 Interfaz, estilos, lecturas y lógica del simulador
scripts/extract.mjs  Extracción del banco desde el primer informe
scripts/build.mjs    Generación del sitio y copia de fuentes
scripts/serve.mjs    Servidor HTTP local
tests/               Pruebas de extracción y calificación
dist/                Sitio generado para ambos proveedores
netlify.toml         Configuración Netlify
wrangler.jsonc       Configuración Cloudflare Workers Static Assets
```

Los archivos fuentes y el sitio generado no incluyen servicios de analítica ni recursos de terceros para funcionar.

## Verificación en navegador

La dependencia de desarrollo Playwright es únicamente para pruebas. Con `npm install` (o `npm ci`) y Chromium descargado en `.cache/browsers`, ejecuta:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '.cache/browsers'
npx.cmd playwright install chromium --no-shell
npm.cmd run test:e2e
```

En Linux/macOS usa `PLAYWRIGHT_BROWSERS_PATH=.cache/browsers npx playwright install chromium --no-shell` y luego `npm run test:e2e`.

La prueba inicia y cierra su propio servidor local y genera capturas en `artifacts/`. Verifica respuestas, marcas, recarga de sesión, omisiones, notas, plan, lecturas, expiración del reloj, exportación/importación, teclado y desbordamiento horizontal en anchos de 320 a 1440 píxeles.
