// Minimal HMAC-SHA256 signed token (JWT-shaped) so the Worker doesn't need an
// external JWT library. Not a general-purpose JWT implementation — just enough
// to authenticate this app's own frontend against this app's own API.

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let str = ''
  for (const b of arr) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')
  const str = atob(padded)
  const arr = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i)
  return arr
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

export interface AppTokenPayload {
  sub: string // app_users.id
  stravaAthleteId: number
  iat: number
  exp: number
}

export async function signToken(payload: AppTokenPayload, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerB64 = base64url(new TextEncoder().encode(JSON.stringify(header)))
  const payloadB64 = base64url(new TextEncoder().encode(JSON.stringify(payload)))
  const data = `${headerB64}.${payloadB64}`
  const key = await hmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return `${data}.${base64url(sig)}`
}

export async function verifyToken(token: string, secret: string): Promise<AppTokenPayload | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerB64, payloadB64, sigB64] = parts
  const key = await hmacKey(secret)
  const valid = await crypto.subtle.verify('HMAC', key, base64urlDecode(sigB64), new TextEncoder().encode(`${headerB64}.${payloadB64}`))
  if (!valid) return null
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64))) as AppTokenPayload
    if (payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function newToken(sub: string, stravaAthleteId: number): AppTokenPayload {
  const now = Math.floor(Date.now() / 1000)
  return { sub, stravaAthleteId, iat: now, exp: now + 60 * 60 * 24 * 90 } // 90 days
}
