# Perros de la familia: Klaus y Limón

Dashboard web para administrar los perfiles de Klaus y Limón: ficha, vacunas,
desparasitaciones, peso y visitas al veterinario. Cada perro se guarda en su
propio documento de Firestore, así que editar uno nunca afecta al otro.

```
perros/klaus                  ficha de Klaus
perros/klaus/registros/{id}   vacunas, desparasitaciones, pesos y visitas
perros/limon                  ficha de Limón
perros/limon/registros/{id}   registros de Limón
```

Si la configuración de Firebase está incompleta, la app no se conecta y muestra
qué valores faltan. El modo demo (solo navegador, sin Firebase) existe únicamente
si se activa a propósito con `modoDemo = true` en `js/firebase-config.js`.

## 1. Crear la base en Firebase (consola independiente)

1. Entra a https://console.firebase.google.com y crea un proyecto nuevo
   (por ejemplo `perros-familia`). Google Analytics no es necesario.
2. **Firestore Database** → Crear base de datos → modo producción →
   ubicación `southamerica-east1` (São Paulo) o la que prefieras.
3. **Authentication** → Comenzar → Método de acceso → habilita **Google**.
4. **Configuración del proyecto** (ícono de engranaje) → Tus apps → icono `</>`
   (app web) → regístrala y copia el objeto `firebaseConfig`.
5. Pega los valores de ese objeto en `js/firebase-config.js`. Los correos
   autorizados ya están configurados en `correosPermitidos`.
6. **Firestore → Reglas**: pega el contenido de `firestore.rules` y pulsa **Publicar**.

> La `apiKey` de Firebase no es secreta: lo que protege los datos son las reglas
> de Firestore, que solo dejan entrar a los correos de la lista.

Todo funciona en el plan gratuito (Spark). Las fotos se guardan reducidas
(480 px) dentro del documento de cada perro, sin necesidad de Firebase Storage.

## 2. Publicar en GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `perros-familia`.
2. Sube todos los archivos de esta carpeta (respetando `css/` y `js/`).
3. En el repositorio: **Settings → Pages → Build and deployment →
   Deploy from a branch → `main` / `(root)`** → Save.
4. En un par de minutos queda en `https://TU-USUARIO.github.io/perros-familia/`.
5. Vuelve a Firebase → **Authentication → Configuración → Dominios autorizados**
   y agrega `TU-USUARIO.github.io`. Sin esto, el inicio de sesión con Google falla.

## 3. Instalarla en los teléfonos

Comparte el link `https://TU-USUARIO.github.io/perros-familia/` por WhatsApp y
ábrelo en cada teléfono:

- **iPhone:** ábrelo en **Safari** → botón Compartir (cuadro con flecha) →
  **Agregar a pantalla de inicio** → Agregar.
- **Android:** ábrelo en **Chrome** → toca **Instalar app** en la parte de arriba
  (o menú ⋮ → Instalar aplicación / Agregar a la pantalla principal).

Queda un ícono "Klaus y Limón" que abre a pantalla completa, como una app.
Cada persona entra una sola vez con su cuenta de Google; ambos correos deben
estar en `correosPermitidos` y en `firestore.rules`.

La app guarda una copia en el teléfono: abre y muestra los datos sin señal, y
lo que se registre sin conexión se sube solo cuando vuelve. Los cambios que
haga uno aparecen en el teléfono del otro en segundos.

**Al subir cambios a GitHub**, sube también `sw.js` con un número nuevo en
`VERSION` (v2, v3…). Así los teléfonos toman la versión nueva al reabrir la app.

## Estructura

```
index.html             página
css/styles.css         estilos (modo claro y oscuro)
js/firebase-config.js  tu configuración y correos autorizados
js/store.js            conexión a Firestore o modo demo
js/app.js              lógica del dashboard
firestore.rules        reglas de seguridad para pegar en la consola
manifest.webmanifest   nombre, ícono y colores de la app instalada
sw.js                  funcionamiento sin señal y actualizaciones
icons/                 íconos para pantalla de inicio
```

## Probar en tu computador

Los módulos de JavaScript no cargan abriendo el archivo con doble clic. Desde
esta carpeta ejecuta `python3 -m http.server 8000` y abre http://localhost:8000.
