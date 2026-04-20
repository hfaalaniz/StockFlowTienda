import fs from 'node:fs'
import path from 'node:path'

const isNetlify = Boolean(process.env.NETLIFY)
const isCloudflare = Boolean(process.env.CF_PAGES)
const defaultApiUrl = 'https://stockflowbackend-production-cb53.up.railway.app'

if (!isNetlify && !isCloudflare) {
  console.log('[env] Ni Netlify ni Cloudflare Pages detectados, se omite preparacion de .env.production.local')
  process.exit(0)
}

const platform = isCloudflare ? 'Cloudflare Pages' : 'Netlify'
console.log(`[env] Plataforma detectada: ${platform}`)

const required = ['VITE_API_URL']
const optional = [
  'VITE_GOOGLE_CLIENT_ID',
  'VITE_FACEBOOK_APP_ID',
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_TRANSFER_CBU',
  'VITE_TRANSFER_ALIAS',
]

if (!process.env.VITE_API_URL || String(process.env.VITE_API_URL).trim() === '') {
  process.env.VITE_API_URL = defaultApiUrl
  console.warn(`[env] VITE_API_URL no estaba definida. Se usa fallback: ${defaultApiUrl}`)
}

const missing = required.filter((key) => !process.env[key] || String(process.env[key]).trim() === '')

if (missing.length > 0) {
  console.error(`[env] Faltan variables requeridas en ${platform}: ${missing.join(', ')}`)
  process.exit(1)
}

const lines = [...required, ...optional]
  .filter((key) => process.env[key] !== undefined)
  .map((key) => `${key}=${String(process.env[key]).replace(/\r?\n/g, ' ')}`)

const target = path.resolve('.env.production.local')
fs.writeFileSync(target, `${lines.join('\n')}\n`, 'utf8')

console.log(`[env] Archivo generado: ${target}`)
console.log(`[env] Variables incluidas: ${lines.length}`)
