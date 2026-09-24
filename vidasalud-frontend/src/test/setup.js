import '@testing-library/jest-dom/vitest'
import { afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Algunos entornos de Node/CI entregan un localStorage experimental sin API Storage
// completa. Reemplazamos el global por una implementación simple y estable.
function createLocalStorage() {
  let store = new Map()
  return {
    getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
    setItem: (k, v) => { store.set(String(k), String(v)) },
    removeItem: (k) => { store.delete(String(k)) },
    clear: () => { store = new Map() },
    key: (i) => [...store.keys()][i] ?? null,
    get length() { return store.size },
  }
}

beforeAll(() => {
  const ls = createLocalStorage()
  Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true })
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { value: createLocalStorage(), configurable: true })
  }
})

afterEach(() => {
  cleanup()
  const ls = typeof window !== 'undefined' && window.localStorage ? window.localStorage : globalThis.localStorage
  if (ls && typeof ls.clear === 'function') ls.clear()
})