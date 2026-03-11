# Cómo instalar y correr la Tienda Online

## 1. Instalar dependencias

Abrí una terminal de **Windows (cmd o PowerShell)** en la carpeta `C:\stockflow\tienda\` y ejecutá:

```cmd
npm install
```

> **Nota:** Si usás Git Bash puede fallar por el PATH de `node`. Usá cmd.exe o PowerShell directamente.

## 2. Crear el archivo de variables de entorno

Copiá el ejemplo y completá tus keys:

```cmd
copy .env.example .env
```

Editá `.env` con tus credenciales reales:

```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_STRIPE_PUBLIC_KEY=pk_test_tu_key
```

## 3. Variables del backend

Agregá estas variables al archivo `C:\stockflow\backend\.env`:

```env
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret
TIENDA_FRONTEND_URL=http://localhost:5174
```

## 4. Correr en desarrollo

Con el backend corriendo en puerto 4000, iniciá la tienda:

```cmd
npm run dev
```

La tienda estará disponible en **http://localhost:5174**

## 5. Build para producción

```cmd
npm run build
```

El output queda en `dist/`. Subilo a tu servidor o CDN.

## 6. Funcionalidades disponibles

| Página | Descripción |
|--------|-------------|
| `/` | Página de inicio con productos destacados |
| `/catalogo` | Catálogo con filtros por categoría y búsqueda |
| `/productos/:id` | Detalle del producto |
| `/carrito` | Vista completa del carrito |
| `/checkout` | Proceso de compra (3 pasos) |
| `/pago-exitoso` | Confirmación de orden |
| `/login` | Login con email, Google o Facebook |
| `/registro` | Registro de nuevo cliente |
| `/mis-compras` | Historial de órdenes (requiere login) |
| `/mis-compras/:id` | Detalle de una orden |
| `/cuenta` | Perfil, contraseña y puntos de fidelización |

## 7. Configurar Google OAuth

1. Ir a https://console.cloud.google.com
2. Crear un proyecto nuevo
3. APIs y Servicios → Credenciales → Crear ID de cliente OAuth 2.0
4. Tipo: Aplicación web
5. Orígenes JavaScript: `http://localhost:5174`
6. Copiar el Client ID al `.env`

## 8. Configurar Mercado Pago

El backend ya tiene el webhook configurado en `/api/webhooks/mercado-pago`.
Solo necesitás tu `MERCADOPAGO_ACCESS_TOKEN` en el `.env` del backend.
