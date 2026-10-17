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

El build produce `dist/`, incluyendo el banco y los tres informes originales. No abras `index.html` con `file://`: la carga del banco utiliza `fetch` y necesita HTTP.

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

## Actualización basada en la guía DIAN 2676

- Revisadas editorialmente 20 preguntas existentes: A3, A14, A38, B27, B31, B39, B40, C4, C13, C37, P1-8, P2-6, P3-3, P3-6, P4-3, P4-4, P4-5, P4-9, P5-3 y P5-4. Ahora incluyen caso, tarea, distractores plausibles, justificaciones individuales y referencia. Las demás preguntas anteriores aún conservan su contenido original.
- Los tres ítems de verdadero/falso se sustituyeron por casos de tres alternativas. Se precisaron modalidad, diferencia entre mínimo y ponderación, corte normativo y valoración de documentos con discrepancias. Los autoinformes siguen sin clave ni puntuación.
- Las revisiones tienen versión propia. `previous-questions.json` conserva las 20 versiones reemplazadas exclusivamente para validar progreso antiguo; no se usa como banco de nuevas prácticas. Una sesión antigua conserva su pregunta y clave, mientras un reintento nuevo utiliza la versión revisada. Los informes fuente permanecen intactos.
- 24 casos situacionales originales con caso, enunciado, tres alternativas, explicación de cada distractor, habilidad y referencia. Dos bloques de 12, con 30 minutos o sin reloj.
- La práctica inicial utiliza el nuevo banco. Las 230 preguntas anteriores se conservan como material complementario; banco total: 254 ítems.
- Biblioteca con orientación, método de resolución, ponderaciones por modalidad, logística y descarga de la guía aportada. La guía confirma cinco horas; los tiempos de los ejercicios son parámetros de entrenamiento.
- Contexto completo y explicaciones disponibles en resultados y bitácora. Claves y explicaciones mantienen su correspondencia al mezclar opciones y exportar/importar.
- El formato sigue el §4.4; los casos no son oficiales ni acreditan cobertura de los ejes individuales. Los ejemplos de gestión ilustran habilidades y deben contrastarse con los indicadores del empleo.

## Funciones

La interfaz móvil concentra la navegación en Inicio, Practicar, Estudiar y Más. El inicio muestra una acción principal y dos métricas; las prácticas se eligen en Completos, Por tema y A medida. El índice de preguntas, las explicaciones, las notas, las pautas de estudio y las verificaciones se despliegan a petición. Durante una práctica se oculta la navegación general para concentrarse en la pregunta. El contenido y el progreso existente se conservan.

- Panel con métricas reales; el estado inicial no inventa resultados.
- Tres simulacros de 60 ítems, con 40 funcionales, 12 comportamentales y 8 de integridad por forma.
- Cinco retos temáticos basados en proceso.md: 50 preguntas con tres alternativas en las nuevas sesiones, explicaciones y reloj de 20 minutos. Con los 24 casos nuevos, el banco total tiene 254 ítems: 194 funcionales y 60 autoinformes.
- Repaso activo con 16 tarjetas, explicación oculta hasta solicitarla y programación progresiva de repasos a 1, 3, 7 y 14 días de Colombia. La autoevaluación organiza el repaso; no genera una nota.
- Ruta adicional de 12 semanas con productos y metas de práctica; progreso independiente del intensivo y lista de 15 verificaciones.
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

Se utilizan `deep-research-report.md`, `deep-research-report(1).md` y `proceso.md`. Los originales se conservan intactos. `scripts/extract.mjs` convierte los 180 ítems en texto del primer informe y sus claves en un banco JSON; el build falla si faltan preguntas. Las explicaciones agrupadas de las formas B y C se adaptan por bloque. `scripts/extract-process.mjs` añade las 50 preguntas y claves de `proceso.md`; las explicaciones individuales se adaptaron para la web. Las lecturas sintetizan los tres documentos y añaden cuentas de compensación, logística, niveles comportamentales y el método C–H–N–A–C–E; no sustituyen los textos normativos. Los archivos originales se conservan sin editar.

El segundo informe enlaza a formas de 100 preguntas y a otros PDF mediante URLs `sandbox:`. Esos archivos no estaban adjuntos: no se ofrecen descargas inexistentes ni se afirma haber importado sus 200 preguntas.

El porcentaje funcional se calcula como aciertos/preguntas funcionales × 100, truncado a dos decimales. Las omisiones funcionales cuentan como no acertadas. No reproduce la transformación psicométrica oficial. Los autoinformes únicamente registran respuestas y finalización; no son instrumentos psicométricos validados.

La guía aportada resuelve la duración oficial: cinco horas (§5), con fecha programada del 8 de noviembre de 2026 y normas vigentes expedidas antes del 19 de junio de 2026 (§4.3). No establece un total universal de ítems. La biblioteca explica las ponderaciones de todas las modalidades y la diferencia entre porcentaje de práctica y puntaje psicométrico. SIMO y CNSC prevalecen ante actualizaciones. Los originales de investigación se conservan como antecedentes y pueden contener datos superados por la guía.

Las copias JSON v1 previas siguen siendo compatibles: el historial y los índices de lecturas anteriores se conservan. Los nuevos campos de tarjetas, ruta larga y verificaciones se añaden con valores vacíos si faltan.

El progreso se guarda en `localStorage`, en el navegador y origen donde se usa. No se sincroniza automáticamente entre dominios o dispositivos; usa exportar/importar. Cambiar de dominio o borrar datos del navegador no traslada el progreso. Si el almacenamiento está bloqueado o lleno, se informa y se permite exportar.

## Estructura

```text
src/                 Interfaz, estilos, lecturas y lógica del simulador
scripts/extract.mjs  Extracción del banco desde el primer informe
scripts/extract-process.mjs Extracción de los cinco retos de proceso.md
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

La prueba inicia y cierra su propio servidor local y genera capturas en `artifacts/`. Verifica respuestas, marcas, recarga de sesión, omisiones, notas, ambos planes, lecturas, expiración del reloj, los cinco retos, las tarjetas, exportación/importación de copias actuales y antiguas, teclado, controles desplegables, cuatro accesos de navegación móvil y desbordamiento horizontal en ocho pantallas con anchos de 320 a 1440 píxeles.
