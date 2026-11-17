// Camada de persistência isolada. Trocar por Supabase/PostgreSQL no futuro
// exige apenas reescrever estas funções — os services acima não mudam.

const PREFIX = 'cdg_'

export function readAll<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

export function writeAll<T>(key: string, data: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(data))
}

export function readOne<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeOne<T>(key: string, data: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(data))
}

export function nextSequence(key: string): number {
  const seqKey = PREFIX + 'seq_' + key
  const current = Number(localStorage.getItem(seqKey) || '0')
  const next = current + 1
  localStorage.setItem(seqKey, String(next))
  return next
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
