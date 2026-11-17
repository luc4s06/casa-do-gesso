import { Material, MaterialPrice } from '../types'
import { supabase } from '../lib/supabase'
import { fail } from './db'

const MATERIALS: Material[] = [
  { id: 'placa', name: 'Placa de Gesso', unit: 'metro' },
  { id: 'sinzal', name: 'Sinzal', unit: 'kg' },
  { id: 'saco', name: 'Saco de Gesso', unit: 'kg' },
  { id: 'bloco', name: 'Bloco', unit: 'metro' },
]

const DEFAULT_PRICES: Record<string, number> = {
  placa: 35,
  sinzal: 8,
  saco: 6,
  bloco: 12,
}

export function getMaterials(): Material[] {
  return MATERIALS
}

export function getMaterialById(id: string): Material | undefined {
  return MATERIALS.find((m) => m.id === id)
}

// Lê os preços; na primeira vez grava os preços padrão dos materiais que ainda não existem.
async function loadPrices(): Promise<Record<string, MaterialPrice>> {
  const { data, error } = await supabase.from('material_prices').select('*')
  fail(error)
  const map: Record<string, MaterialPrice> = {}
  ;(data ?? []).forEach((r: any) => {
    map[r.material_id] = { materialId: r.material_id, price: Number(r.price), updatedAt: r.updated_at }
  })

  const missing = MATERIALS.filter((m) => !map[m.id])
  if (missing.length > 0) {
    const now = new Date().toISOString()
    const rows = missing.map((m) => ({ material_id: m.id, price: DEFAULT_PRICES[m.id] ?? 0, updated_at: now }))
    const { error: insertError } = await supabase
      .from('material_prices')
      .upsert(rows, { onConflict: 'material_id', ignoreDuplicates: true })
    fail(insertError)
    missing.forEach((m) => {
      map[m.id] = { materialId: m.id, price: DEFAULT_PRICES[m.id] ?? 0, updatedAt: now }
    })
  }
  return map
}

export async function getPricesMap(): Promise<Record<string, number>> {
  const prices = await loadPrices()
  const out: Record<string, number> = {}
  MATERIALS.forEach((m) => {
    out[m.id] = prices[m.id]?.price ?? 0
  })
  return out
}

export async function getAllCurrentPrices(): Promise<MaterialPrice[]> {
  const prices = await loadPrices()
  return MATERIALS.map((m) => prices[m.id] ?? { materialId: m.id, price: 0, updatedAt: '' })
}

export async function updatePrices(updates: { materialId: string; price: number }[]): Promise<void> {
  for (const u of updates) {
    if (!(u.price >= 0)) throw new Error('Preço não pode ser negativo.')
  }
  const now = new Date().toISOString()
  const rows = updates.map((u) => ({ material_id: u.materialId, price: u.price, updated_at: now }))
  const { error } = await supabase.from('material_prices').upsert(rows, { onConflict: 'material_id' })
  fail(error)
}
