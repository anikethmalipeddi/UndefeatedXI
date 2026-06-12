export interface Rng {
  next: () => number
  pick: <T>(items: T[]) => T
  between: (min: number, max: number) => number
}

export function secureRandom(): number {
  const cryptoApi = globalThis.crypto
  if (cryptoApi?.getRandomValues) {
    const values = new Uint32Array(1)
    cryptoApi.getRandomValues(values)
    return values[0] / 4294967296
  }

  return Math.random()
}

export function randomPick<T>(items: T[]): T {
  return items[Math.floor(secureRandom() * items.length)] ?? items[0]
}

function hashSeed(seed: string): number {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function createRng(seed: string): Rng {
  let state = hashSeed(seed) || 1

  const next = () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    pick: (items) => items[Math.floor(next() * items.length)] ?? items[0],
    between: (min, max) => min + next() * (max - min),
  }
}

export function makeRunId(prefix = 'IXI'): string {
  const values = new Uint8Array(5)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values)
  } else {
    for (let index = 0; index < values.length; index += 1) {
      values[index] = Math.floor(Math.random() * 256)
    }
  }
  const body = Array.from(values, (value) => value.toString(36).padStart(2, '0')).join('').slice(0, 8).toUpperCase()
  return `${prefix}-${body}`
}

export function weightedShuffle<T>(items: T[], rng: Rng, weight: (item: T) => number): T[] {
  return [...items]
    .map((item) => ({ item, score: rng.next() ** (1 / Math.max(1, weight(item))) }))
    .sort((left, right) => right.score - left.score)
    .map(({ item }) => item)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
