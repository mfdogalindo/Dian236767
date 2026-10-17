# Google y Realtime Database

La configuración usada es `firebase-cfg.js`, ahora un módulo que exporta `firebaseConfig`. El build la copia a `dist/firebase-cfg.js`; no se necesita `firebase-cfg.json`. La aplicación sigue siendo estática y puede alojarse en Netlify, Cloudflare o Firebase Hosting.

## Configurar el proyecto `dian-236767`

1. En [Firebase Console](https://console.firebase.google.com/), abre `dian-236767`.
2. En **Authentication → Sign-in method / Método de acceso**, habilita **Google**, selecciona el correo de soporte del proyecto y guarda.
3. En **Authentication → Settings / Configuración → Authorized domains / Dominios autorizados**, agrega el dominio donde publiques la web, sin protocolo ni ruta. Agrega también `localhost` y `127.0.0.1` si usas el servidor local. Comprueba la lista: en proyectos recientes localhost puede requerir alta manual. Un dominio personalizado y su subdominio `www` son entradas distintas.
4. En **Build → Realtime Database**, crea o abre la base que corresponde a `databaseURL` en la configuración. Este proyecto usa `dian-236767-default-rtdb.firebaseio.com`.
5. En la pestaña **Rules / Reglas**, copia **todo** el contenido de [`database.rules.json`](database.rules.json) y pulsa **Publish / Publicar**. Sustituye las reglas de modo de prueba. Si la base ya almacena otros productos, integra sus reglas deliberadamente: el archivo de este proyecto deniega todas las rutas adicionales.
6. Ejecuta `npm.cmd run build` y publica **todo `dist/`**. En local, usa `npm.cmd run dev` y abre `http://127.0.0.1:4173`; el acceso no funciona mediante `file://`.
7. En **Inicio** o **Biblioteca**, pulsa **Entrar con Google**. Permite la ventana emergente. La primera conexión descarga el SDK; si el navegador bloquea la ventana, permite popups para este sitio y vuelve a pulsar.

Las acciones administrativas anteriores no se realizan desde el código de la web. El archivo `firebase.json` permite, como alternativa a pegar reglas, publicarlas con la CLI autenticada:

```powershell
npx.cmd firebase-tools login
npx.cmd firebase-tools deploy --only database --project dian-236767
```

Referencia oficial: [acceso con Google](https://firebase.google.com/docs/auth/web/google-signin), [dominios y configuración de Authentication](https://firebase.google.com/docs/auth/web/start).

## Qué permiten las reglas

El avance se almacena en `/users/{uid}/progress`. Se requiere un usuario autenticado mediante Google cuyo `auth.uid` coincida exactamente con `{uid}`. No se permite leer el listado de usuarios, acceder al avance ajeno, escribir otras rutas ni borrar el nodo desde el cliente.

Cada escritura debe tener exactamente estos campos:

```json
{
  "version": 1,
  "payload": "JSON del estado completo del avance",
  "updatedAt": { ".sv": "timestamp" }
}
```

`payload` es un string para conservar arrays vacíos, índices y valores nulos del formato local sin la conversión de estructuras vacías de RTDB. Las reglas validan tipo y longitud máxima de 4.000.000 caracteres. El cliente limita además el JSON a 8 MB. `updatedAt` exige la hora del servidor y no acepta una fecha elegida arbitrariamente por el cliente. Se rechazan campos adicionales.

Las reglas protegen el acceso por propietario y el sobre de almacenamiento. No pueden analizar el JSON interno: la web valida el avance contra su banco de preguntas al descargarlo y recalcula las métricas. El propietario puede modificar sus propios datos; este diseño es para seguimiento personal, no certifica puntajes ni sirve como clasificación competitiva confiable.

La configuración web de Firebase, incluida `apiKey`, se publica con la aplicación por diseño. La protección del avance depende de Authentication y de estas reglas. No agregues claves de servicio, contraseñas de administrador ni archivos de cuenta de servicio al frontend.

Referencia oficial: [reglas de Realtime Database](https://firebase.google.com/docs/database/security), [autenticación REST con ID token](https://firebase.google.com/docs/database/rest/auth).

## Guardado y recuperación

- Como invitado se conserva la clave local existente `rumbo-236767-v1`.
- Cada cuenta usa una copia local independiente: `rumbo-236767-v1:user:{uid}`. Entrar no sube automáticamente datos del invitado a una cuenta.
- **Copiar avance de invitado a mi cuenta** permite trasladar el avance existente, con confirmación antes de reemplazar el de la cuenta. Exporta ambas versiones si quieres conservarlas: no se mezclan historiales automáticamente.
- Las respuestas, notas, lecturas, ambos planes, tarjetas y la práctica activa se guardan localmente al cambiar. Con sesión iniciada se suben tras un segundo de inactividad. La fecha límite de una práctica sigue siendo absoluta al cambiar de dispositivo.
- La web escucha `progress/updatedAt` con RTDB y consulta el avance cuando cambia, al volver a la ventana, al recuperar conexión y al pulsar **Sincronizar ahora**. No descarga periódicamente todo el historial si nada cambió.
- Las escrituras REST usan ETag / `if-match`: un dispositivo no puede reemplazar silenciosamente una versión distinta. Ante conflicto se ofrecen las dos versiones y se exige elegir cuál conservar. Si vuelve a cambiar mientras se elige, se vuelve a mostrar el conflicto. Exporta antes si necesitas guardar ambas.
- Si falla la red o Firebase deniega acceso, los cambios quedan pendientes en la copia local y se pueden reintentar. Una respuesta de una cuenta anterior no cambia la cuenta que esté visible después de salir o entrar con otro usuario.
- Cerrar sesión vuelve al avance de invitado. Las copias por cuenta permanecen en el navegador para recuperarlas; en un equipo compartido borra los datos del sitio al finalizar. No se guardan ID tokens en el formato de exportación ni en el caché de avance; Firebase Auth gestiona su propia sesión.
- El botón **Exportar progreso** sigue disponible tanto para invitado como para la cuenta. Importar una copia dentro de una cuenta también la marca para sincronización.

El SDK modular de Firebase 13.0.0 se carga desde el CDN oficial al conectar Google; no se carga Analytics. RTDB se usa para los avisos de cambios y la API REST para las escrituras condicionales. Referencias: [SDK desde CDN](https://firebase.google.com/docs/web/alt-setup), [eventos de RTDB](https://firebase.google.com/docs/database/web/read-and-write), [escrituras condicionales](https://firebase.google.com/docs/database/rest/save-data#section-conditional-requests).

## Verificación

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd run test:firebase
```

La última prueba usa Playwright con Authentication y RTDB simulados: comprueba el flujo de interfaz, la recuperación, los conflictos y la separación de cuentas sin iniciar sesión en una cuenta real. No sustituye una prueba de las reglas en Firebase.

Después de publicar las reglas, comprueba en el **Rules Playground / Simulador de reglas** de RTDB:

| Intento | Resultado esperado |
| --- | --- |
| Leer `/users/alice/progress` sin autenticación | Denegado |
| Leer o escribir esa ruta autenticado como Google con UID `alice` | Permitido para lectura y sobre válido en escritura |
| Leer o escribir `/users/bob/progress` con UID `alice` | Denegado |
| Leer `/users` o `/users/alice` | Denegado |
| Escribir `version: 2`, un campo adicional o `payload` como objeto | Denegado |
| Borrar `/users/alice/progress` | Denegado |

Para la escritura permitida usa el sobre mostrado, con marca de tiempo de servidor. La prueba final real consiste en entrar con Google, terminar una práctica, verificar el nodo del UID en RTDB y recuperar el avance en otro navegador con la misma cuenta. Una segunda cuenta debe ver su propio avance independiente.

En este entorno no se incluye Java ni el emulador de Firebase: las pruebas automatizadas no ejecutan las reglas en el motor de RTDB. Tampoco publican reglas ni datos en el proyecto real.
