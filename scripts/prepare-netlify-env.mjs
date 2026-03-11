import fs from 'node:fs'
import path from 'node:path'

const isNetlify = Boolean(process.env.NETLIFY)

if (!isNetlify) {
  console.log('[env] NETLIFY no detectado, se omite preparacion de .env.production.local')
  process.exit(0)
}

const required = ['VITE_API_URL']
const optional = [
  'VITE_GOOGLE_CLIENT_ID',
  'VITE_FACEBOOK_APP_ID',
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_TRANSFER_CBU',
  'VITE_TRANSFER_ALIAS',
]

const missing = required.filter((key) => !process.env[key] || String(process.env[key]).trim() === '')

if (missing.length > 0) {
  console.error(`[env] Faltan variables requeridas en Netlify: ${missing.join(', ')}`)
  process.exit(1)
}

const lines = [...required, ...optional]
  .filter((key) => process.env[key] !== undefined)
  .map((key) => `${key}=${String(process.env[key]).replace(/\r?\n/g, ' ')}`)

const target = path.resolve('.env.production.local')
fs.writeFileSync(target, `${lines.join('\n')}\n`, 'utf8')

console.log(`[env] Archivo generado: ${target}`)
console.log(`[env] Variables incluidas: ${lines.length}`)
