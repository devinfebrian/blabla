import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE = 'admin_session'
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30

const LABEL = 'blabla-admin'

export function sessionToken(password: string): string {
  return createHmac('sha256', password).update(LABEL).digest('hex')
}

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function adminPassword(): string {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error('Admin is not configured: set ADMIN_PASSWORD')
  return password
}

export function verifyPassword(candidate: string): boolean {
  return equal(sessionToken(candidate), sessionToken(adminPassword()))
}

export function verifySession(value: string | undefined): boolean {
  return value ? equal(value, sessionToken(adminPassword())) : false
}
