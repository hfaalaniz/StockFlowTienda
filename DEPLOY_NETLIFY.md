# Desplegar StockFlow Tienda en Netlify

La tienda es una SPA (Single Page Application) construida con Vite + React. Se despliega en Netlify como sitio estático; el backend sigue corriendo en tu servidor o VPS.

---

## Requisitos previos

- Cuenta en [netlify.com](https://netlify.com) (gratis)
- Repositorio en GitHub (o GitLab/Bitbucket)
- Backend StockFlow accesible desde internet (VPS, Railway, Render, etc.) con HTTPS

---

## Paso 1 — Configurar variables de entorno de producción

En `c:\stockflow\tienda\` copiá `.env.example` y completá los valores reales.
**No subas `.env` a git** — las variables se configuran directamente en Netlify (Paso 4).

Variables requeridas para producción:

| Variable | Valor ejemplo | Descripción |
|---|---|---|
| `VITE_API_URL` | `https://api.tudominio.com` | URL pública del backend StockFlow |
| `VITE_STORE_NAME` | `Mi Tienda` | Nombre que aparece en el nav |
| `VITE_GOOGLE_CLIENT_ID` | `123...apps.googleusercontent.com` | OAuth Google (opcional) |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` | Clave pública Stripe (opcional) |
| `VITE_TRANSFER_CBU` | `0070263420000028734456` | CBU para pagos por transferencia |
| `VITE_TRANSFER_ALIAS` | `MI.TIENDA.MP` | Alias bancario |

---

## Paso 2 — Asegurar que el backend acepta CORS desde Netlify

En el backend (`backend/src/server.js`), verificá que el dominio de Netlify esté permitido en CORS:

```js
// En server.js, buscar la configuración de cors:
const corsOptions = {
  origin: [
    'http://localhost:5174',          // desarrollo local
    'https://mi-tienda.netlify.app',  // ← agregar tu dominio Netlify
    'https://tienda.tudominio.com',   // ← o tu dominio personalizado
  ],
  credentials: true,
}
```

Reiniciá el backend después de este cambio.

---

## Paso 3 — Subir el código a GitHub

Si el proyecto no está en un repo todavía:

```bash
cd /c/stockflow
git add tienda/
git commit -m "feat: agregar tienda online"
git push
```

> **Nota:** El archivo `tienda/.env` ya está en `.gitignore` (no se sube).

---

## Paso 4 — Crear el sitio en Netlify

### Opción A: desde la interfaz web (recomendado para primera vez)

1. Ir a **netlify.com → Add new site → Import an existing project**
2. Conectar con GitHub y seleccionar el repositorio `stockflow`
3. Configurar el build:

   | Campo | Valor |
   |---|---|
   | **Base directory** | `tienda` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `tienda/dist` |

4. Ir a **Site configuration → Environment variables** y agregar todas las variables del Paso 1.

5. Hacer clic en **Deploy site**.

### Opción B: con Netlify CLI

```bash
# Instalar CLI de Netlify (una sola vez)
npm install -g netlify-cli

# Hacer login
netlify login

# Desde la carpeta tienda:
cd /c/stockflow/tienda

# Construir
npm run build

# Desplegar (primera vez — crea el sitio)
netlify deploy --dir=dist --prod
```

---

## Paso 5 — Verificar el archivo de redirects

El archivo `tienda/public/_redirects` ya existe con el contenido correcto:

```
/* /index.html 200
```

Esto es necesario para que React Router funcione correctamente (todas las rutas como `/catalogo`, `/login`, etc. sirven el `index.html`).

El `netlify.toml` en la raíz de `tienda/` también ya está configurado.

---

## Paso 6 — Dominio personalizado (opcional)

1. En Netlify → **Domain management → Add custom domain**
2. Ingresar `tienda.tudominio.com`
3. Agregar el registro CNAME en tu DNS:
   ```
   tienda  CNAME  nombre-sitio.netlify.app
   ```
4. Netlify provee SSL automático (Let's Encrypt).

---

## Paso 7 — Redeploy automático

Cada vez que hagas `git push` al repositorio, Netlify detecta los cambios en la carpeta `tienda/` y hace un nuevo build automáticamente.

Para forzar un redeploy manual: **Netlify → Deploys → Trigger deploy → Deploy site**.

---

## Troubleshooting

### La tienda carga pero las llamadas a la API fallan (CORS)
- Verificar que `VITE_API_URL` apunta a la URL correcta del backend (con `https://`)
- Verificar que el backend tiene el dominio de Netlify en la lista de `cors origin`
- Revisar en DevTools → Network si hay errores `CORS policy`

### La página muestra 404 al navegar directo a `/catalogo`
- Verificar que el archivo `tienda/public/_redirects` existe y tiene `/* /index.html 200`
- O verificar que `netlify.toml` tiene la regla de redirect

### El login con Google no funciona
- En Google Cloud Console → OAuth → Authorized JavaScript Origins → agregar `https://tu-tienda.netlify.app`
- En Authorized Redirect URIs → agregar la misma URL

### Las imágenes de productos no se ven
- Verificar que `imagen_url` en la base de datos tiene URLs absolutas (`https://...`) o rutas accesibles desde el dominio de la tienda

---

## Resumen rápido (flujo completo)

```
1. Completar variables en Netlify (VITE_API_URL, etc.)
2. Verificar CORS en el backend
3. git push → Netlify buildea automáticamente
4. Abrir https://tu-tienda.netlify.app
```
