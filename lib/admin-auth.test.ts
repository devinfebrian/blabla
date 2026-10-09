// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'

import { sessionToken, verifyPassword, verifySession } from './admin-auth'

describe('admin auth', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'rahasia'
  })

  it('derives a stable token per password', () => {
    expect(sessionToken('rahasia')).toBe(sessionToken('rahasia'))
    expect(sessionToken('rahasia')).not.toBe(sessionToken('lain'))
  })

  it('accepts only the configured password', () => {
    expect(verifyPassword('rahasia')).toBe(true)
    expect(verifyPassword('salah')).toBe(false)
    expect(verifyPassword('')).toBe(false)
  })

  it('accepts only the derived session cookie', () => {
    expect(verifySession(sessionToken('rahasia'))).toBe(true)
    expect(verifySession(sessionToken('lain'))).toBe(false)
    expect(verifySession(undefined)).toBe(false)
  })
})
