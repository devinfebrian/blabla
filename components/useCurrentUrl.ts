'use client'

import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

function notify() {
  for (const listener of listeners) listener()
}

export function useCurrentUrl(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.href,
    () => '',
  )
}

export function replaceColorInUrl(key: string) {
  window.history.replaceState(null, '', `${window.location.pathname}?color=${key}`)
  notify()
}
