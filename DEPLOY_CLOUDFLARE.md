# Deploy en Cloudflare Pages

## Requisitos previos
- Cuenta en [Cloudflare](https://dash.cloudflare.com)
- Backend corriendo en Railway (o similar)

## Pasos

### 1. Conectar el repositorio

1. Ir a **Cloudflare Dashboard → Workers & Pages → Create application → Pages**
2. Conectar con GitHub/GitLab y seleccionar el repositorio
3. En **Set up builds and deployments**:

| Campo | Valor |
|---|---|
| Framework preset | None (o Vite) |
| Build command | `node scripts/prepare-netlify-env.mjs && npm run build` |
| Build output directory | `dist` |
| Root directory | `tienda` *(si el repo es el monorepo stockflow)* |
| Node.js version | `20` |

### 2. Variables de entorno

En **Settings → Environment variables → Production**, agregar:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL del backend, ej: `https://stockflowbackend-production-cb53.up.railway.app` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `VITE_FACEBOOK_APP_ID` | Facebook App ID |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key (`pk_live_...`) |
| `VITE_TRANSFER_CBU` | CBU para transferencias bancarias |
| `VITE_TRANSFER_ALIAS` | Alias para transferencias bancarias |

> Las variables VITE_* son inyectadas en tiempo de build por Vite. No quedan expuestas en el servidor, solo en el bundle del navegador.

### 3. CORS en el backend (Railway)

El backend debe permitir el dominio de Cloudflare Pages. En `backend/src/index.js` o equivalente, agregar el origen de CF al CORS:

```js
origin: [
  'http://localhost:5174',
  'https://stockflow-tienda.pages.dev',      // dominio CF Pages
  'https://tu-dominio-custom.com',            // si usás dominio propio
]
```

### 4. Dominio personalizado (opcional)

En **Pages → tu-proyecto → Custom domains → Set up a custom domain**.
Cloudflare maneja automáticamente el certificado SSL.

### 5. Verificar el deploy

- La URL de preview será `https://stockflow-tienda.pages.dev`
- Probar navegación directa a `/catalogo`, `/login` (debe cargar, no 404)
- Probar el checkout y los pagos en modo sandbox

## Diferencias con Netlify

| | Netlify | Cloudflare Pages |
|---|---|---|
| SPA redirect | `_redirects` | `_redirects` (misma sintaxis) |
| Headers | `netlify.toml` | `public/_headers` (ya configurado) |
| Env vars | `netlify.toml` + UI | Solo desde el dashboard (UI) |
| CDN | Fastly | Cloudflare (red más extensa) |
| Variable `CF_PAGES` | `NETLIFY=true` | `CF_PAGES=1` |

## Build local para verificar

```bash
cd tienda
cp .env.example .env
# editar .env con los valores reales
npm install
npm run build
# el contenido de dist/ es lo que Cloudflare sirve
```
